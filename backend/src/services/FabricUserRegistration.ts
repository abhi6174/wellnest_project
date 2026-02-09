import FabricCAServices = require('fabric-ca-client');
import { Wallets, X509Identity } from 'fabric-network';
// @ts-ignore
import User = require('fabric-common/lib/User');
import * as fs from 'fs';
import * as path from 'path';
import { config } from '../config';

export class FabricUserRegistration {
    private static instance: FabricUserRegistration;

    private constructor() { }

    public static getInstance(): FabricUserRegistration {
        if (!FabricUserRegistration.instance) {
            FabricUserRegistration.instance = new FabricUserRegistration();
        }
        return FabricUserRegistration.instance;
    }

    /**
     * Add user to Fabric network by registering and enrolling with the CA
     */
    public async addUser(username: string, password: string, mspId: string): Promise<boolean> {
        try {
            // Remove 'MSP' from end of mspId to get org name (e.g. Org1MSP -> org1)
            const orgName = mspId.replace('MSP', '').toLowerCase();

            // Define paths
            // NOTE: config.fabric.walletPath points to 'connection-profiles' in current env
            // So we construct path as: connection-profiles/org1/wallet
            const connectionProfileDir = path.resolve(process.cwd(), config.fabric.connectionProfilePath);
            const walletPath = path.join(connectionProfileDir, orgName, 'wallet');
            const connectionProfilePath = path.join(connectionProfileDir, orgName, `connection-${orgName}.json`);

            console.log(`Using wallet path: ${walletPath}`);
            console.log(`Using CP path: ${connectionProfilePath}`);

            // Load connection profile
            if (!fs.existsSync(connectionProfilePath)) {
                console.error(`Connection profile not found at ${connectionProfilePath}`);
                return false;
            }
            const ccp = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));

            // Create a new CA client for interacting with the CA
            // The CA name (e.g. ca.org1.example.com) must match the one in connection profile
            const caInfo = ccp.certificateAuthorities[`ca.${orgName}.example.com`];
            const caTLSCACerts = caInfo.tlsCACerts.pem;
            const caService = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

            // Create a new file system based wallet for managing identities
            const wallet = await Wallets.newFileSystemWallet(walletPath);

            // Check if user is already enrolled
            const userIdentity = await wallet.get(username);
            if (userIdentity) {
                console.log(`An identity for the user "${username}" already exists in the wallet`);
                return true;
            }

            // Enroll the admin user if not already enrolled
            // We need the admin to register other users
            const adminIdentity = await wallet.get('admin');
            if (!adminIdentity) {
                console.log('An identity for the admin user "admin" does not exist in the wallet');
                console.log('Enrolling admin user "admin"...');

                try {
                    // Enroll admin with default bootstrap credentials
                    const enrollment = await caService.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });

                    const x509Identity: X509Identity = {
                        credentials: {
                            certificate: enrollment.certificate,
                            privateKey: enrollment.key.toBytes(),
                        },
                        mspId: mspId,
                        type: 'X.509',
                        // @ts-ignore
                        version: 1,
                    };
                    await wallet.put('admin', x509Identity);
                    console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
                } catch (error) {
                    console.error('Failed to enroll admin user "admin":', error);
                    // If we can't enroll admin, we can't register new users
                    throw error;
                }
            }

            // Build a User object for the admin to perform registration
            const adminIdentityEntry = await wallet.get('admin');
            if (!adminIdentityEntry) {
                throw new Error('Admin identity missing from wallet');
            }
            const adminX509 = adminIdentityEntry as X509Identity;

            const adminUser = new User('admin');
            // @ts-ignore
            const cryptoSuite = FabricCAServices.newCryptoSuite();
            // @ts-ignore
            const cryptoKeyStore = FabricCAServices.newCryptoKeyStore();
            cryptoSuite.setCryptoKeyStore(cryptoKeyStore);
            adminUser.setCryptoSuite(cryptoSuite);
            const adminKey = await cryptoSuite.importKey(adminX509.credentials.privateKey, { ephemeral: true } as any);
            await adminUser.setEnrollment(adminKey, adminX509.credentials.certificate, mspId);

            // Register the user
            try {
                // Determine user type/role
                const role = 'client';
                // Note: You can customize role based on logic if needed (e.g. 'peer', 'admin')

                console.log(`Registering user: ${username}`);
                await caService.register({
                    affiliation: '',
                    enrollmentID: username,
                    role: role,
                    enrollmentSecret: password // Use provided password
                }, adminUser);
                console.log(`Successfully registered user "${username}"`);
            } catch (error: any) {
                // Ignore if already registered
                if (error.toString().includes('Identity already exists') || error.errors?.[0]?.code === 0) {
                    console.log(`User "${username}" is already registered, proceeding to enrollment.`);
                } else {
                    throw error;
                }
            }

            // Enroll the user
            console.log(`Enrolling user: ${username}`);
            const enrollment = await caService.enroll({
                enrollmentID: username,
                enrollmentSecret: password
            });

            const x509Identity: X509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: mspId,
                type: 'X.509',
                // @ts-ignore
                version: 1,
            };

            await wallet.put(username, x509Identity);
            console.log(`Successfully enrolled user "${username}" and imported it into the wallet`);

            return true;
        } catch (error) {
            console.error(`Error adding user ${username} to Fabric:`, error);
            // Log full error for debugging
            if (error instanceof Error) {
                console.error(error.stack);
            }
            return false;
        }
    }
}

export const fabricUserRegistration = FabricUserRegistration.getInstance();

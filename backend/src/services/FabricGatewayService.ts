import * as fs from 'fs';
import * as path from 'path';
import { Gateway, Wallets, X509Identity } from 'fabric-network';
import { config } from '../config';

export class FabricGatewayService {
    private static instance: FabricGatewayService;

    private constructor() { }

    public static getInstance(): FabricGatewayService {
        if (!FabricGatewayService.instance) {
            FabricGatewayService.instance = new FabricGatewayService();
        }
        return FabricGatewayService.instance;
    }

    /**
     * Create Fabric Gateway connection for a user
     */
    public async getFabricGateway(username: string, mspId: string): Promise<Gateway> {
        try {
            // Extract organization name from mspId (e.g., Org1MSP -> org1)
            const orgName = mspId.substring(0, mspId.length - 3).toLowerCase();

            // Load connection profile
            const connectionProfilePath = path.resolve(
                config.fabric.connectionProfilePath,
                orgName,
                `connection-${orgName}.json`
            );

            const connectionProfile = JSON.parse(
                fs.readFileSync(connectionProfilePath, 'utf8')
            );

            // Load user credentials from wallet file
            const walletFilePath = path.resolve(
                config.fabric.walletPath,
                orgName,
                'wallet',
                `${username}.id`
            );

            const userCredentials = JSON.parse(
                fs.readFileSync(walletFilePath, 'utf8')
            );

            const certificatePem = userCredentials.credentials.certificate;
            const privateKeyPem = userCredentials.credentials.privateKey;

            console.log(`Loading connection profile: ${connectionProfilePath}`);
            console.log(`Loading wallet file: ${walletFilePath}`);

            // Create in-memory wallet
            const wallet = await Wallets.newInMemoryWallet();

            // Create identity
            const identity: X509Identity = {
                credentials: {
                    certificate: certificatePem,
                    privateKey: privateKeyPem,
                },
                mspId,
                type: 'X.509',
            };

            // Put identity in wallet
            await wallet.put(username, identity);

            // Create gateway
            const gateway = new Gateway();

            await gateway.connect(connectionProfile, {
                wallet,
                identity: username,
                discovery: { enabled: true, asLocalhost: true },
            });

            return gateway;
        } catch (error) {
            console.error('Error creating Fabric gateway:', error);
            throw new Error(`Failed to create Fabric gateway: ${error}`);
        }
    }
}

export const fabricGatewayService = FabricGatewayService.getInstance();

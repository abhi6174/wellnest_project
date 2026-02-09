import { Pending } from '../models/Pending';
import { fabricService } from './FabricService';


export class DoctorService {
    private static instance: DoctorService;

    private constructor() { }

    public static getInstance(): DoctorService {
        if (!DoctorService.instance) {
            DoctorService.instance = new DoctorService();
        }
        return DoctorService.instance;
    }

    /**
     * Add access request from doctor to patient
     */
    public async addRequest(did: string, pid: string): Promise<void> {
        try {
            const existingRequest = await Pending.findOne({ did, pid });

            if (existingRequest) {
                if (existingRequest.status === 'Pending' || existingRequest.status === 'Accepted') {
                    console.log('Request already exists and is active');
                    return;
                }

                // If Rejected or Revoked, allow re-request
                existingRequest.status = 'Pending';
                await existingRequest.save();
                console.log(`Access request re-opened: Doctor ${did} -> Patient ${pid}`);
                return;
            }

            const newRequest = new Pending({
                did,
                pid,
                status: 'Pending',
            });

            await newRequest.save();
            console.log(`Access request created: Doctor ${did} -> Patient ${pid}`);
        } catch (error) {
            console.error('Error adding request:', error);
            throw error;
        }
    }

    /**
     * Get patient status for doctor
     */
    public async getPatientStatus(did: string, mspId: string): Promise<any[]> {
        try {
            // Chaincode: getAllEHRRecordByDoctor(ctx, doctorId)
            const result = await fabricService.evaluateTransaction(
                'mychannel',
                'ehr',
                'getAllEHRRecordByDoctor',
                [did],
                did,
                mspId
            );

            const records = JSON.parse(result);

            // Map to expected format
            // Assuming PatientStatus expects { patientId, status, ... }
            return records.map((r: any) => ({
                patientId: r.patientId,
                status: r.status,
                timestamp: r.timestamp,
                lastHash: r.hash
            }));
        } catch (error) {
            console.error('Error getting patient status:', error);
            // Return empty if failure or no records
            return [];
        }
    }

    /**
     * Add access record to blockchain
     */
    public async addAccess(
        did: string,
        patientId: string,
        hash: string,
        mspId: string
    ): Promise<boolean> {
        try {
            const timestamp = new Date().toISOString();

            // Chaincode: recordAccess(ctx, doctorId, patientId, hash, timestamp)
            const result = await fabricService.submitTransaction(
                'mychannel',
                'ehr',
                'recordAccess',
                [did, patientId, hash, timestamp],
                did,
                mspId
            );

            console.log('Access added to blockchain:', result);
            return true;
        } catch (error) {
            console.error('Error adding access:', error);
            return false;
        }
    }

    /**
     * Add update record to blockchain
     */
    public async addUpdate(
        did: string,
        patientId: string,
        hash: string,
        mspId: string
    ): Promise<boolean> {
        try {
            const timestamp = new Date().toISOString();

            // Chaincode: updateEHRRecord(ctx, doctorId, patientId, newHash, timestamp)
            const result = await fabricService.submitTransaction(
                'mychannel',
                'ehr',
                'updateEHRRecord',
                [did, patientId, hash, timestamp],
                did,
                mspId
            );

            console.log('Update added to blockchain:', result);
            return true;
        } catch (error) {
            console.error('Error adding update:', error);
            return false;
        }
    }
}

export const doctorService = DoctorService.getInstance();

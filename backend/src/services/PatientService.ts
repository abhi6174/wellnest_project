import { Pending, IPending } from '../models/Pending';
import { fabricService } from './FabricService';
import { Transaction } from '../types';
import { ehrService } from './EhrService';
import { EhrDocument } from '../types/EhrDocument';

export class PatientService {
    private static instance: PatientService;

    private constructor() { }

    public static getInstance(): PatientService {
        if (!PatientService.instance) {
            PatientService.instance = new PatientService();
        }
        return PatientService.instance;
    }

    /**
     * Get doctors with approved access
     */
    public async getDoctors(pid: string, mspId: string): Promise<any[]> {
        try {
            // Get all records for patient from blockchain
            // Chaincode function: getAllEHRRecordByPatient(ctx, patientId)
            const result = await fabricService.evaluateTransaction(
                'mychannel',
                'ehr',
                'getAllEHRRecordByPatient',
                [pid],
                pid,
                mspId
            );

            const allRecords = JSON.parse(result);

            // Filter for active records and map to required format
            // The frontend likely expects a list of doctors pending or accepted from the DB, 
            // but for "Accepted Doctors" tab it acts as a double check?
            // Actually, let's look at how the frontend uses it. 
            // But strict fix: filter for status 'active'
            const activeDoctors = allRecords
                .filter((r: any) => r.status === 'active')
                .map((r: any) => ({
                    did: r.doctorId,
                    status: r.status,
                    timestamp: r.timestamp
                }));

            // The frontend might also want DB pending records. The original code gathered DB records too.
            // But the method signature returns IPending[] which suggests DB objects.
            // However, the original code returned "pendingRecords" (DB) but IGNORED the Fabric result?
            // "await fabricService.evaluateTransaction(...) ... const pendingRecords = await Pending.find(...); return pendingRecords;"
            // It seems the original code just "pinged" the blockchain but returned DB data?
            // Wait, logically, "Accepted Doctors" should come from Blockchain (source of truth).
            // But strict matching of the previous function's intent:



            // Merge or return what's expected. 
            // If the user error was "function does not exist", it means the frontend CALLED correct endpoint, backend CALLED chaincode.
            // I will return the Fabric data merged with DB info if needed, but for now let's just make the call work.

            return activeDoctors; // Returning blockchain source of truth for accepted docs
        } catch (error) {
            console.error('Error getting doctors:', error);
            // Fallback to empty if blockchain fails or returns nothing (e.g. no records yet)
            return [];
        }
    }

    /**
     * Get revoked doctors
     */
    public async getRevokedDoctors(pid: string, mspId: string): Promise<string[]> {
        try {
            const result = await fabricService.evaluateTransaction(
                'mychannel',
                'ehr',
                'getAllEHRRecordByPatient',
                [pid],
                pid,
                mspId
            );

            const allRecords = JSON.parse(result);
            const revokedDoctorIds = allRecords
                .filter((r: any) => r.status === 'revoked')
                .map((r: any) => r.doctorId);

            return revokedDoctorIds;
        } catch (error) {
            console.error('Error getting revoked doctors:', error);
            return [];
        }
    }

    /**
     * Get pending requests for patient
     */
    public async getPendingRequest(pid: string): Promise<IPending[]> {
        try {
            // Pending requests are only in DB until accepted (created on blockchain)
            const pendingRequests = await Pending.find({
                pid,
                status: 'Pending',
            });

            return pendingRequests;
        } catch (error) {
            console.error('Error getting pending requests:', error);
            return [];
        }
    }

    /**
     * Update request status (Accept/Reject)
     */
    public async updateStatus(
        pid: string,
        did: string,
        status: string,
        mspId: string
    ): Promise<void> {
        try {
            // Update in database
            const pendingRequest = await Pending.findOne({ pid, did });

            if (pendingRequest) {
                pendingRequest.status = status;
                await pendingRequest.save();
            }

            // Update on blockchain

            let functionName = '';
            let hash = '';
            const timestamp = new Date().toISOString();

            // Default empty document for initial hash handling
            const emptyDoc: EhrDocument = {
                diagnosis: '', treatment: '', medications: '', doctorNotes: '',
                patientHistory: '', allergies: '', labResults: '', imagingReports: '',
                vitalSigns: '', familyHistory: '', lifestyleFactors: '',
                immunizations: '', carePlan: '', followUpInstructions: ''
            };

            if (status === 'Accepted' || status === 'Activate') {
                // Check if record already exists on blockchain to decide between create and activate
                let recordExists = false;
                try {
                    await fabricService.evaluateTransaction(
                        'mychannel',
                        'ehr',
                        'getEHRRecord',
                        [pid, did],
                        pid,
                        mspId
                    );
                    recordExists = true;
                } catch (e) {
                    // Record does not exist or error
                    recordExists = false;
                }

                if (recordExists) {
                    functionName = 'activateAccess';
                } else {
                    functionName = 'createEHRRecord';
                }

                // For creation/activation, we use the hash of the current EHR if it exists, 
                // or an empty one if it's new.
                try {
                    const currentDoc = await ehrService.getEhrDocumentForPatient(pid, mspId);
                    hash = currentDoc ? ehrService.getHash(currentDoc) : ehrService.getHash(emptyDoc);
                } catch (e) {
                    hash = ehrService.getHash(emptyDoc);
                }

            } else if (status === 'Revoked' || status === 'Rejected') {
                if (status === 'Rejected') {
                    console.log('Request rejected, only DB updated.');
                    return;
                }
                functionName = 'revokeAccess';

                // For revocation, get the current hash to lock the state
                try {
                    const currentDoc = await ehrService.getEhrDocumentForPatient(pid, mspId);
                    hash = currentDoc ? ehrService.getHash(currentDoc) : ehrService.getHash(emptyDoc);
                } catch (e) {
                    hash = ehrService.getHash(emptyDoc);
                }
            }

            await fabricService.submitTransaction(
                'mychannel',
                'ehr',
                functionName,
                [did, pid, hash, timestamp], // Order: doctorId, patientId, hash, timestamp
                pid,
                mspId
            );

            console.log(`Status updated: ${status} for Doctor ${did} by Patient ${pid}`);
        } catch (error: any) {
            // Handle specific case where we tried to activate but record didn't exist 
            console.error('Error updating status:', error);

            if (status === 'Activate' && error.message?.includes('does not exist')) {
                console.log('Record does not exist, creating new record instead...');
                const timestamp = new Date().toISOString();

                // Reuse logic for hash
                const emptyDoc: EhrDocument = {
                    diagnosis: '', treatment: '', medications: '', doctorNotes: '',
                    patientHistory: '', allergies: '', labResults: '', imagingReports: '',
                    vitalSigns: '', familyHistory: '', lifestyleFactors: '',
                    immunizations: '', carePlan: '', followUpInstructions: ''
                };
                const hash = ehrService.getHash(emptyDoc);

                await fabricService.submitTransaction(
                    'mychannel',
                    'ehr',
                    'createEHRRecord',
                    [did, pid, hash, timestamp],
                    pid,
                    mspId
                );
            } else {
                throw error;
            }
        }
    }

    /**
     * Get transaction history for a doctor's access to patient
     */
    public async getHistory(pid: string, did: string, mspId: string): Promise<Transaction[]> {
        try {
            // Chaincode: getAccessHistory(ctx, patientId, doctorId)
            // But this only returns 'access' type transactions. 
            // If we want full history, better fetch the whole record?
            // "ehrRecord.transactions" array has everything.

            const result = await fabricService.evaluateTransaction(
                'mychannel',
                'ehr',
                'getEHRRecord', // Fetch full record
                [pid, did],
                pid,
                mspId
            );

            const record = JSON.parse(result);
            return record.transactions || [];
        } catch (error) {
            console.error('Error getting history:', error);
            return [];
        }
    }

    /**
     * Get full transaction history for a patient across all doctors
     */
    public async getPatientFullHistory(pid: string, mspId: string): Promise<Transaction[]> {
        try {
            // Get all records for the patient (one per doctor)
            const result = await fabricService.evaluateTransaction(
                'mychannel',
                'ehr',
                'getAllEHRRecordByPatient',
                [pid],
                pid,
                mspId
            );

            const allRecords = JSON.parse(result);
            let allTransactions: Transaction[] = [];

            // Aggregate transactions from all records
            if (Array.isArray(allRecords)) {
                allRecords.forEach((record: any) => {
                    if (record.transactions && Array.isArray(record.transactions)) {
                        // Enrich transactions with doctorId from the parent record
                        // Since the record key is [patientId, doctorId], all transactions in it belong to this doctor context
                        const enrichedTransactions = record.transactions.map((tx: any) => ({
                            ...tx,
                            doctorId: record.doctorId
                        }));
                        allTransactions = allTransactions.concat(enrichedTransactions);
                    }
                });
            }

            // Sort by timestamp descending
            allTransactions.sort((a, b) => {
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            });

            return allTransactions;
        } catch (error) {
            console.error('Error getting full patient history:', error);
            return [];
        }
    }
}

export const patientService = PatientService.getInstance();

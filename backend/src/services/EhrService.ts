import { Patient, IEhrRecord } from '../models/Patient';
import { Pending } from '../models/Pending';

import { doctorService } from './DoctorService';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

export class EhrService {
    private static instance: EhrService;

    private constructor() { }

    public static getInstance(): EhrService {
        if (!EhrService.instance) {
            EhrService.instance = new EhrService();
        }
        return EhrService.instance;
    }

    /**
     * Check if doctor has access to patient EHR
     */
    public async isAccessApproved(patientId: string, doctorId: string): Promise<boolean> {
        const pendingRequest = await Pending.findOne({ pid: patientId, did: doctorId });
        return pendingRequest !== null && pendingRequest.status.toLowerCase() === 'accepted';
    }

    /**
     * Add a new EHR record to the patient's history
     */
    public async addRecord(
        patientId: string,
        doctorId: string,
        recordData: Partial<IEhrRecord>,
        mspId: string
    ): Promise<boolean> {
        try {
            let patient = await Patient.findOne({ patientId });

            if (!patient) {
                // Create new patient entry if not exists (first record)
                patient = new Patient({
                    patientId,
                    ehrId: patientId,
                    records: []
                });
            }

            const timestamp = new Date().toISOString();
            const recordId = uuidv4();

            // Create record object
            const newRecord: IEhrRecord = {
                recordId,
                timestamp,
                doctorId,
                diagnosis: recordData.diagnosis || '',
                treatment: recordData.treatment || '',
                medications: recordData.medications || '',
                doctorNotes: recordData.doctorNotes || '',
                patientHistory: recordData.patientHistory || '',
                allergies: recordData.allergies || '',
                labResults: recordData.labResults || '',
                imagingReports: recordData.imagingReports || '',
                vitalSigns: recordData.vitalSigns || '',
                familyHistory: recordData.familyHistory || '',
                lifestyleFactors: recordData.lifestyleFactors || '',
                immunizations: recordData.immunizations || '',
                carePlan: recordData.carePlan || '',
                followUpInstructions: recordData.followUpInstructions || '',
                hash: '' // Calculated below
            };

            // Calculate hash
            const hash = this.getHash(newRecord);
            newRecord.hash = hash;

            // Save to MongoDB
            patient.records.push(newRecord);
            await patient.save();
            console.log(`EHR record added for patient: ${patientId} by doctor: ${doctorId}`);

            // Log to Blockchain (Audit Trail)
            try {
                await doctorService.addUpdate(doctorId, patientId, hash, mspId);
            } catch (bcError) {
                console.error('Failed to log update to blockchain:', bcError);
            }

            return true;
        } catch (error) {
            console.error('Error adding EHR record:', error);
            throw error;
        }
    }

    /**
     * Get all records for a patient (Patient View)
     */
    public async getRecordsForPatient(patientId: string): Promise<IEhrRecord[]> {
        try {
            const patient = await Patient.findOne({ patientId });
            if (!patient) return [];
            return patient.records;
        } catch (error) {
            console.error('Error getting records for patient:', error);
            return [];
        }
    }

    /**
     * Get all records for a patient (Doctor View) with access control
     */
    public async getRecords(
        patientId: string,
        doctorId: string,
        mspId: string
    ): Promise<IEhrRecord[]> {
        try {
            const isApproved = await this.isAccessApproved(patientId, doctorId);
            if (!isApproved) {
                console.log(`Access denied for Doctor ${doctorId} to Patient ${patientId}`);
                return [];
            }

            const patient = await Patient.findOne({ patientId });
            if (!patient) return [];

            // return all records
            // Log access to the *latest* state
            const latestRecord = patient.records[patient.records.length - 1];
            const hash = latestRecord ? latestRecord.hash : this.getHash({});

            try {
                await doctorService.addAccess(doctorId, patientId, hash, mspId);
            } catch (e) {
                console.warn('Audit log failed', e);
            }

            return patient.records;
        } catch (error) {
            console.error('Error getting records:', error);
            return [];
        }
    }

    /**
     * Generate SHA-256 hash of record data
     */
    public getHash(record: any): string {
        // Create a copy to exclude hash field itself if present
        const { hash, ...dataToHash } = record;
        const dataString = JSON.stringify(dataToHash);
        return crypto.createHash('sha256').update(dataString).digest('hex');
    }

    // Legacy support methods
    public async getEhrDocumentForPatient(patientId: string, _mspId: string) {
        return this.getRecordsForPatient(patientId);
    }
}

export const ehrService = EhrService.getInstance();

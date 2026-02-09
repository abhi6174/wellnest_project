import CryptoJS from 'crypto-js';
import * as crypto from 'crypto';
import { Patient } from '../models/Patient';
import { Pending } from '../models/Pending';
import { EhrDocument } from '../types/EhrDocument';
import { config } from '../config';
import { doctorService } from './DoctorService';

export class EhrService {
    private static instance: EhrService;
    private readonly SECRET_KEY: string;

    private constructor() {
        this.SECRET_KEY = config.encryption.secretKey;
    }

    public static getInstance(): EhrService {
        if (!EhrService.instance) {
            EhrService.instance = new EhrService();
        }
        return EhrService.instance;
    }

    /**
     * Encrypt data using AES
     */
    private encrypt(data: string): string {
        return CryptoJS.AES.encrypt(data, this.SECRET_KEY).toString();
    }

    /**
     * Decrypt data using AES
     */
    private decrypt(encryptedData: string): string {
        const bytes = CryptoJS.AES.decrypt(encryptedData, this.SECRET_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    /**
     * Check if doctor has access to patient EHR
     */
    public async isAccessApproved(patientId: string, doctorId: string): Promise<boolean> {
        const pendingRequest = await Pending.findOne({ pid: patientId, did: doctorId });
        return pendingRequest !== null && pendingRequest.status.toLowerCase() === 'accepted';
    }

    /**
     * Add EHR document for a patient
     */
    public async addEhrDocument(patientId: string, document: EhrDocument): Promise<void> {
        try {
            const ehrJson = JSON.stringify(document);
            const encryptedEhr = this.encrypt(ehrJson);

            const patient = new Patient({
                patientId,
                ehrId: patientId,
                ehrDocument: encryptedEhr,
            });

            await patient.save();
            console.log(`EHR document added for patient: ${patientId}`);
        } catch (error) {
            console.error('Error adding EHR document:', error);
            throw error;
        }
    }

    /**
     * Get EHR document for patient (patient's own access)
     */
    public async getEhrDocumentForPatient(patientId: string, _mspId: string): Promise<EhrDocument | null> {
        try {
            const patient = await Patient.findOne({ patientId });

            if (!patient) {
                return null;
            }

            const encryptedEhr = patient.ehrDocument;
            const decryptedEhrJson = this.decrypt(encryptedEhr);

            return JSON.parse(decryptedEhrJson) as EhrDocument;
        } catch (error) {
            console.error('Error getting EHR document for patient:', error);
            return null;
        }
    }

    /**
     * Get EHR document with doctor access control
     */
    public async getEhrDocument(
        patientId: string,
        did: string,
        mspId: string
    ): Promise<EhrDocument | null> {
        try {
            const patient = await Patient.findOne({ patientId });

            if (!patient) {
                return null;
            }

            const encryptedEhr = patient.ehrDocument;
            const decryptedEhrJson = this.decrypt(encryptedEhr);
            const ehrDocument = JSON.parse(decryptedEhrJson) as EhrDocument;

            const hash = this.getHash(ehrDocument);

            // 1. Verify access permission (Database check)
            const isApproved = await this.isAccessApproved(patientId, did);

            if (!isApproved) {
                console.log(`Access denied for Doctor ${did} to Patient ${patientId}`);
                return null;
            }

            // 2. Log access to blockchain (Non-blocking)
            // We await it to ensure it triggers, but catch errors so we don't block the view
            // due to concurrency/endorsement issues on the audit log.
            try {
                await doctorService.addAccess(did, patientId, hash, mspId);
                console.log('Access logged to blockchain');
            } catch (logError) {
                console.warn('Failed to log access to blockchain (Audit Log):', logError);
                // Continue to return document even if logging fails
            }

            return ehrDocument;
        } catch (error) {
            console.error('Error getting EHR document:', error);
            return null;
        }
    }

    /**
     * Update EHR document
     */
    public async updateEhr(
        did: string,
        patientId: string,
        mspId: string,
        ehrDocument: EhrDocument
    ): Promise<boolean> {
        try {
            const patient = await Patient.findOne({ patientId });

            if (!patient) {
                return false;
            }

            const hash = this.getHash(ehrDocument);

            // Submit update to blockchain
            const updateSuccess = await doctorService.addUpdate(did, patientId, hash, mspId);

            if (updateSuccess) {
                const ehrJson = JSON.stringify(ehrDocument);
                const encrypted = this.encrypt(ehrJson);

                patient.ehrDocument = encrypted;
                await patient.save();

                return true;
            }

            return false;
        } catch (error) {
            console.error('Error updating EHR:', error);
            return false;
        }
    }

    /**
     * Fetch PDF (decrypt EHR for patient)
     */
    public async fetchPdf(pid: string): Promise<EhrDocument> {
        const patient = await Patient.findOne({ patientId: pid });

        if (!patient) {
            throw new Error(`Patient not found with ID: ${pid}`);
        }

        const encryptedEHR = patient.ehrDocument;
        const decryptedJson = this.decrypt(encryptedEHR);

        return JSON.parse(decryptedJson) as EhrDocument;
    }

    /**
     * Generate SHA-256 hash of EHR document
     */
    public getHash(ehrDocument: EhrDocument): string {
        const ehrString = JSON.stringify(ehrDocument);
        const hash = crypto.createHash('sha256').update(ehrString).digest('hex');
        return hash;
    }
}

export const ehrService = EhrService.getInstance();

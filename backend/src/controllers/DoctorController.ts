import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { doctorService } from '../services/DoctorService';
import { ehrService } from '../services/EhrService';
import { Pending } from '../models/Pending';

const router = Router();

/**
 * POST /fabric/doctor/add-request
 * Add access request to patient
 */
router.post('/add-request', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { pid } = req.query;

        if (!pid) {
            res.status(400).json({ message: 'Patient ID is required' });
            return;
        }

        console.log('Add request');
        const did = req.user!.username;

        await doctorService.addRequest(did, pid as string);

        res.status(200).json({ message: 'Request added successfully' });
    } catch (error) {
        console.error('Add request error:', error);
        res.status(500).json({ message: 'Failed to add request' });
    }
});

/**
 * GET /fabric/doctor/patients
 * Get all accessible patients
 */
router.get('/patients', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const did = req.user!.username;
        const mspId = req.user!.mspId;

        const patientStatuses = await doctorService.getPatientStatus(did, mspId);

        res.status(200).json(patientStatuses);
    } catch (error) {
        console.error('Get patients error:', error);
        res.status(500).json({ message: 'Failed to get patients' });
    }
});

/**
 * GET /fabric/doctor/view-ehr
 * View patient EHR (only if access is approved)
 */
router.get('/view-ehr', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { patientId } = req.query;

        if (!patientId) {
            res.status(400).json({ message: 'Patient ID is required' });
            return;
        }

        const did = req.user!.username;
        const mspId = req.user!.mspId;

        const records = await ehrService.getRecords(patientId as string, did, mspId);

        if (records) {
            console.log('Returning EHR records');
            res.status(200).json(records);
        } else {
            res.status(404).json({ message: 'EHR records not found or access denied' });
        }
    } catch (error) {
        console.error('View EHR error:', error);
        res.status(500).json({ message: 'Failed to view EHR' });
    }
});

/**
 * GET /fabric/doctor/requests
 * Get all requests made by doctor
 */
router.get('/requests', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const did = req.user!.username;
        const requests = await Pending.find({ did });
        res.status(200).json(requests);
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({ message: 'Failed to get requests' });
    }
});

/**
 * POST /fabric/doctor/add-record
 * Add new EHR record for patient
 */
router.post('/add-record', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { patientId } = req.query;
        const recordData = req.body;

        if (!patientId) {
            res.status(400).json({ message: 'Patient ID is required' });
            return;
        }

        const did = req.user!.username;
        const mspId = req.user!.mspId;

        const isAdded = await ehrService.addRecord(patientId as string, did, recordData, mspId);

        if (isAdded) {
            console.log('EHR record added successfully!');
            res.status(200).send('EHR record added successfully!');
        } else {
            console.log('Failed to add record.');
            res.status(500).send('Failed to add record.');
        }
    } catch (error) {
        console.error('Add EHR record error:', error);
        res.status(500).json({ message: 'Failed to add EHR record' });
    }
});

export default router;

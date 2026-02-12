import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { patientService } from '../services/PatientService';
import { ehrService } from '../services/EhrService';

const router = Router();

/**
 * GET /fabric/patient/accepted
 * Get all doctors with accepted access
 */
router.get('/accepted', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const pid = req.user!.username;
        const mspId = req.user!.mspId;

        const doctors = await patientService.getDoctors(pid, mspId);

        res.status(200).json(doctors);
    } catch (error) {
        console.error('Get accepted doctors error:', error);
        res.status(404).json({ message: 'Failed to get accepted doctors' });
    }
});

/**
 * GET /fabric/patient/view-ehr
 * View patient's own EHR
 */
router.get('/view-ehr', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const patientId = req.user!.username;
        const mspId = req.user!.mspId;

        if (mspId !== 'Org2MSP') {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }

        const ehrDocument = await ehrService.getEhrDocumentForPatient(patientId, mspId);

        if (ehrDocument) {
            console.log('Returning EHR document');
            res.status(200).json(ehrDocument);
        } else {
            res.status(404).json({ message: 'EHR document not found' });
        }
    } catch (error) {
        console.error('View EHR error:', error);
        res.status(500).json({ message: 'Failed to view EHR' });
    }
});

/**
 * GET /fabric/patient/revoked
 * Get all doctors with revoked access
 */
router.get('/revoked', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const pid = req.user!.username;
        const mspId = req.user!.mspId;

        const doctorIds = await patientService.getRevokedDoctors(pid, mspId);

        res.status(200).json(doctorIds);
    } catch (error) {
        console.error('Get revoked doctors error:', error);
        res.status(500).json({ message: 'Failed to get revoked doctors' });
    }
});

/**
 * GET /fabric/patient/request
 * Get all pending requests
 */
router.get('/request', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        console.log('Pending request');
        const pid = req.user!.username;

        const pendingRequests = await patientService.getPendingRequest(pid);

        res.status(200).json(pendingRequests);
    } catch (error) {
        console.error('Get pending requests error:', error);
        res.status(500).json({ message: 'Failed to get pending requests' });
    }
});

/**
 * POST /fabric/patient/request/:did
 * Update request status (Accept/Reject)
 */
router.post('/request/:did', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        console.log('Update pending request');
        const { did } = req.params;
        const { status } = req.query;

        if (!status) {
            res.status(400).json({ message: 'Status is required' });
            return;
        }

        const pid = req.user!.username;
        const mspId = req.user!.mspId;

        await patientService.updateStatus(pid, did, status as string, mspId);

        res.status(200).json({ message: 'Status updated successfully' });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ message: 'Failed to update status' });
    }
});

/**
 * GET /fabric/patient/history/:did
 * Get transaction history for a specific doctor
 */
router.get('/history/:did', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { did } = req.params;
        const pid = req.user!.username;
        const mspId = req.user!.mspId;

        console.log('Calling GetHistory');
        const transactions = await patientService.getHistory(pid, did, mspId);

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Get history error:', error);
        res.status(404).json({ message: 'Failed to get history' });
    }
});

/**
 * GET /fabric/patient/history
 * Get full transaction history for the patient across all doctors
 */
router.get('/history', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const pid = req.user!.username;
        const mspId = req.user!.mspId;

        console.log('Calling GetFullHistory for patient');
        const transactions = await patientService.getPatientFullHistory(pid, mspId);

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Get full history error:', error);
        res.status(500).json({ message: 'Failed to get history' });
    }
});

export default router;

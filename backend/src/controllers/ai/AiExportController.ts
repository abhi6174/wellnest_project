import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../../middleware/authMiddleware';
import { ehrService } from '../../services/EhrService';

const router = Router();

/**
 * GET /ai/export/:patientId
 * Export temporary EHR data for an AI service based on the user's role.
 */
router.get('/export/:patientId', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { patientId } = req.params;
        const username = req.user!.username;
        const mspId = req.user!.mspId;

        console.log(`AI Export requested for patient: ${patientId} by user: ${username} (${mspId})`);

        if (mspId === 'Org1MSP') {
            // Doctor role: Can export data if they have approved access
            // getRecords inherently checks if access is approved and logs it to the blockchain (via DoctorService)
            const records = await ehrService.getRecords(patientId, username, mspId);

            // getRecords returns [] if access denied or no records found
            if (records && records.length > 0) {
                res.status(200).json(records);
            } else {
                 // Check if it's access denied or just no records. 
                 // We can simply check isAccessApproved here for a more specific error message.
                 const isApproved = await ehrService.isAccessApproved(patientId, username);
                 if (!isApproved) {
                     res.status(403).json({ message: 'Forbidden: Doctor does not have approved access to this patient. '});
                 } else {
                     res.status(404).json({ message: 'No EHR records found for the patient.' });
                 }
            }
        } else {
            // Unknown or unauthorized role (e.g. Org2MSP / Patient are now handled via a separate service)
            res.status(403).json({ message: 'Forbidden: This AI service is restricted to Doctor interface only.' });
        }

    } catch (error) {
        console.error('AI Export error:', error);
        res.status(500).json({ message: 'Failed to export EHR data for AI service.' });
    }
});

export default router;

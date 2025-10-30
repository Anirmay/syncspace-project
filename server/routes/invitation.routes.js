import express from 'express';
import { protect } from '../middleware/auth.middleware.js'; // Use your auth middleware
import { 
    getPendingInvitations,
    getInvitationsForWorkspace, // --- NEW
    sendInvitation, // --- NEW
    resendInvitation // --- NEW
} from '../controllers/invitation.controller.js';
    import { getInvitationById, respondToInvitation } from '../controllers/invitation.controller.js';

const router = express.Router();

// Get pending invitations for the logged-in user
router.get('/pending', protect, getPendingInvitations); // GET /api/invitations/pending

// --- NEW ROUTES ---

// Get all invitations for a specific workspace
router.get('/workspace/:workspaceId', protect, getInvitationsForWorkspace); // GET /api/invitations/workspace/:workspaceId

// Send a new invitation
router.post('/', protect, sendInvitation); // POST /api/invitations

// Resend a pending invitation
router.post('/resend/:inviteId', protect, resendInvitation); // POST /api/invitations/resend/:inviteId

// --- END NEW ROUTES ---

// Add routes here later for accepting, rejecting etc.
// Fetch a single invitation
router.get('/:inviteId', protect, getInvitationById); // GET /api/invitations/:inviteId

// Respond to an invitation (accept/reject)
router.patch('/:inviteId/respond', protect, respondToInvitation); // PATCH /api/invitations/:inviteId/respond
// router.patch('/:inviteId/respond', protect, respondToInvitation); // PATCH /api/invitations/:inviteId/respond

export default router;


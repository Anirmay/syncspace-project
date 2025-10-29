import express from 'express';
import { handleContactForm } from '../controllers/contact.controller.js';

const router = express.Router();

// Route: POST /api/contact
// Action: Handles submission from the contact form
router.post('/', handleContactForm);

export default router;


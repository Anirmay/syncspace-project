import express from 'express';
// Ensure the path to the controller is correct and includes the .js extension
import { handleContactForm } from '../controllers/contact.controller.js';

const router = express.Router();

// Define the route for handling contact form submissions
// When a POST request is made to /api/contact/, the handleContactForm function will execute
router.post('/', handleContactForm);

// Export the router as the default export
export default router;


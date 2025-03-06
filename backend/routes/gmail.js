/**
 * Gmail Routes
 * Handles Gmail integration for sending emails
 */

const express = require('express');
const router = express.Router();
const { gmail } = require('../config/google');
const { isAuthenticated } = require('../middlewares/auth');

/**
 * Helper function to create email message
 * @param {Object} options - Email options 
 * @returns {string} - Base64 encoded email
 */
const createMessage = (options) => {
  // Get email components
  const { from, to, subject, message } = options;
  
  // Create email content
  const emailLines = [
    `From: ${from}`,
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    message
  ];
  
  // Join with appropriate line endings
  const email = emailLines.join('\r\n');
  
  // Base64 encode the email
  return Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

/**
 * POST /api/gmail/send
 * Send email via Gmail
 */
router.post('/send', isAuthenticated, async (req, res) => {
  try {
    const { to, subject, message, templateData } = req.body;
    
    if (!to || !subject || (!message && !templateData)) {
      return res.status(400).json({ message: 'Missing required parameters (to, subject, message)' });
    }
    
    let emailContent = message;
    
    // If templateData is provided, use a template instead of raw message
    if (templateData) {
      emailContent = createEmailFromTemplate(templateData);
    }
    
    // Create email options
    const emailOptions = {
      from: 'Wisdom Bites Dental <noreply@wisdombites.com>',
      to,
      subject,
      message: emailContent
    };
    
    // Create email message for Gmail API
    const encodedMessage = createMessage(emailOptions);
    
    // Send the email
    const response = await gmail.users.messages.send({
      auth: req.oauth2Client,
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });
    
    res.status(200).json({
      message: 'Email sent successfully',
      messageId: response.data.id
    });
  } catch (error) {
    console.error('Gmail error:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

/**
 * POST /api/gmail/booking-confirmation
 * Send booking confirmation email
 */
router.post('/booking-confirmation', isAuthenticated, async (req, res) => {
  try {
    const { booking } = req.body;
    
    if (!booking || !booking.email) {
      return res.status(400).json({ message: 'Missing booking data or email' });
    }
    
    // Create booking confirmation template
    const template = createBookingConfirmationTemplate(booking);
    
    // Create email options
    const emailOptions = {
      from: 'Wisdom Bites Dental <noreply@wisdombites.com>',
      to: booking.email,
      subject: 'Your Dental Appointment Confirmation',
      message: template
    };
    
    // Create email message for Gmail API
    const encodedMessage = createMessage(emailOptions);
    
    // Send the email
    const response = await gmail.users.messages.send({
      auth: req.oauth2Client,
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });
    
    res.status(200).json({
      message: 'Booking confirmation email sent successfully',
      messageId: response.data.id
    });
  } catch (error) {
    console.error('Gmail booking confirmation error:', error);
    res.status(500).json({ message: 'Failed to send booking confirmation email', error: error.message });
  }
});

/**
 * Helper function to create email from template
 * @param {Object} data - Template data
 * @returns {string} - HTML email content
 */
const createEmailFromTemplate = (data) => {
  // Basic generic email template
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.subject || 'Wisdom Bites Dental'}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .header {
          background-color: #4a90e2;
          padding: 20px;
          text-align: center;
          color: white;
        }
        .content {
          padding: 20px;
        }
        .footer {
          background-color: #f5f5f5;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${data.title || 'Wisdom Bites Dental'}</h1>
      </div>
      <div class="content">
        ${data.content || ''}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Wisdom Bites Dental Clinic. All rights reserved.</p>
        <p>1/4A, North Road, Poddar Nagar, Jadavpur, Kolkata, West Bengal 700032, India</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Helper function to create booking confirmation template
 * @param {Object} booking - Booking data
 * @returns {string} - HTML email content
 */
const createBookingConfirmationTemplate = (booking) => {
  // Format date and time for display
  const formattedDate = new Date(booking.appointmentDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Basic booking confirmation template
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Dental Appointment Confirmation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .header {
          background-color: #4a90e2;
          padding: 20px;
          text-align: center;
          color: white;
        }
        .content {
          padding: 20px;
        }
        .appointment-details {
          background-color: #f9f9f9;
          border-left: 4px solid #4a90e2;
          padding: 15px;
          margin: 20px 0;
        }
        .footer {
          background-color: #f5f5f5;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #777;
        }
        .btn {
          display: inline-block;
          background-color: #4a90e2;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 4px;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Appointment Confirmation</h1>
      </div>
      <div class="content">
        <p>Dear ${booking.firstName} ${booking.lastName},</p>
        
        <p>Thank you for scheduling an appointment with Wisdom Bites Dental Clinic. Your appointment has been confirmed.</p>
        
        <div class="appointment-details">
          <h3>Appointment Details:</h3>
          <p><strong>Service:</strong> ${booking.specificService}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${booking.selectedTime}</p>
          ${booking.preferredDentist ? `<p><strong>Dentist:</strong> ${booking.preferredDentist}</p>` : ''}
        </div>
        
        <p>Please arrive 10 minutes prior to your appointment time to complete any necessary paperwork.</p>
        
        <p>If you need to reschedule or cancel your appointment, please contact us at least 24 hours in advance at +91 123 456 7890.</p>
        
        <p>See you soon!</p>
        
        <p>
          <a href="https://maps.google.com/?q=Wisdom+Bites+Dental+Clinic" class="btn">Get Directions</a>
        </p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Wisdom Bites Dental Clinic. All rights reserved.</p>
        <p>1/4A, North Road, Poddar Nagar, Jadavpur, Kolkata, West Bengal 700032, India</p>
        <p>Phone: +91 123 456 7890 | Email: info@wisdombites.com</p>
      </div>
    </body>
    </html>
  `;
};

module.exports = router; 
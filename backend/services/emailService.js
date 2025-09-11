import sgMail from "@sendgrid/mail";

// Load your SendGrid API key from environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text body
 * @param {string} html - HTML body
 */
async function sendEmail({ to, subject, text, html }) {
  if (!to || !subject) throw new Error("Recipient and subject are required");

  const msg = {
    to,
    from: process.env.EMAIL_FROM || "no-reply@kanbanapp.com",
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("SendGrid error:", error);
    if (error.response) console.error(error.response.body);
    throw new Error("Failed to send email");
  }
}

export default { sendEmail };

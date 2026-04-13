const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendBookingConfirmation = async (userEmail, bookingData) => {
  await transporter.sendMail({
    from: `"Sight Seekers" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Booking Confirmed — ${bookingData.booking_reference}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:0;background:#F5F0E8;font-family:'Helvetica Neue',Arial,sans-serif;">
        <div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <div style="background:#0C1A12;padding:32px 40px;text-align:center;">
            <p style="color:#D97706;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 8px;">Sight Seekers Kenya</p>
            <h1 style="color:white;font-size:26px;margin:0;font-weight:700;">Your Safari is Confirmed!</h1>
          </div>

          <!-- Body -->
          <div style="padding:40px;">
            <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 28px;">
              Great news! Your booking has been received and confirmed. We're thrilled to have you join us on this adventure.
            </p>

            <!-- Booking details box -->
            <div style="background:#F9FAFB;border-radius:12px;padding:24px;margin-bottom:28px;border:1px solid #E5E7EB;">
              <h3 style="color:#0C1A12;font-size:14px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 16px;">Booking Details</h3>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;border-bottom:1px solid #E5E7EB;">Reference</td><td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid #E5E7EB;">${bookingData.booking_reference}</td></tr>
                <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;border-bottom:1px solid #E5E7EB;">Package</td><td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid #E5E7EB;">${bookingData.package_name}</td></tr>
                <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;border-bottom:1px solid #E5E7EB;">Travelers</td><td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid #E5E7EB;">${bookingData.num_travelers}</td></tr>
                <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;border-bottom:1px solid #E5E7EB;">Payment Method</td><td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid #E5E7EB;">${bookingData.payment_method || 'Card'}</td></tr>
                <tr><td style="padding:8px 0;color:#6B7280;font-size:14px;font-weight:600;">Total Paid</td><td style="padding:8px 0;color:#D97706;font-size:18px;font-weight:700;text-align:right;">$${(bookingData.total_price / 100).toFixed(2)}</td></tr>
              </table>
            </div>

            <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 28px;">
              Our team will be in touch within 24 hours to confirm your travel dates and arrange any additional details. In the meantime, feel free to reply to this email with any questions.
            </p>

            <div style="text-align:center;margin-bottom:32px;">
              <a href="http://localhost:5173/dashboard" style="display:inline-block;background:#0C1A12;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;">View My Dashboard</a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background:#F9FAFB;padding:24px 40px;text-align:center;border-top:1px solid #E5E7EB;">
            <p style="color:#9CA3AF;font-size:12px;margin:0;">Sight Seekers Kenya · Nairobi, Kenya</p>
            <p style="color:#9CA3AF;font-size:12px;margin:4px 0 0;">We can't wait to see you in Kenya! 🦁</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};

const sendWelcomeEmail = async (userEmail, firstName) => {
  await transporter.sendMail({
    from: `"Sight Seekers" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Welcome to Sight Seekers! 🦁',
    html: `
      <h2>Welcome, ${firstName}!</h2>
      <p>Your account has been created. Start exploring our amazing safari packages today!</p>
      <p>Use code FIRSTSAFARI for 15% off your first booking.</p>
    `,
  });
};

const sendPaymentReceipt = async (userEmail, paymentData) => {
  await transporter.sendMail({
    from: `"Sight Seekers" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Payment Receipt — ${paymentData.booking_reference}`,
    html: `
      <h2>Payment Received</h2>
      <p>Amount: $${(paymentData.amount / 100).toFixed(2)}</p>
      <p>Method: ${paymentData.payment_method}</p>
      <p>Transaction ID: ${paymentData.transaction_id}</p>
      <p>Booking Reference: ${paymentData.booking_reference}</p>
    `,
  });
};

const sendCancellationRequest = async ({ full_name, email, phone, booking_ref, package_name, travel_date, reason, additional_info }) => {
  const businessEmail = process.env.EMAIL_USER;

  // Email to business
  await transporter.sendMail({
    from: `"Sight Seekers" <${businessEmail}>`,
    to: businessEmail,
    replyTo: email,
    subject: `Cancellation Request — ${booking_ref} — ${full_name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#F5F0E8;font-family:'Helvetica Neue',Arial,sans-serif;">
        <div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <div style="background:#7F1D1D;padding:32px 40px;">
            <p style="color:#FCA5A5;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 8px;">Sight Seekers — Cancellation Request</p>
            <h1 style="color:white;font-size:22px;margin:0;font-weight:700;">New Cancellation Request</h1>
          </div>
          <div style="padding:40px;">
            <div style="background:#FEF2F2;border-radius:12px;padding:24px;margin-bottom:28px;border:1px solid #FECACA;">
              <h3 style="color:#7F1D1D;font-size:14px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 16px;">Booking Details</h3>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;border-bottom:1px solid #FEE2E2;">Reference</td><td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid #FEE2E2;">${booking_ref}</td></tr>
                <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;border-bottom:1px solid #FEE2E2;">Package</td><td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid #FEE2E2;">${package_name}</td></tr>
                <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;border-bottom:1px solid #FEE2E2;">Travel Date</td><td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid #FEE2E2;">${travel_date}</td></tr>
                <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Reason</td><td style="padding:8px 0;color:#DC2626;font-size:13px;font-weight:600;text-align:right;">${reason}</td></tr>
              </table>
            </div>
            <div style="background:#F9FAFB;border-radius:12px;padding:24px;margin-bottom:28px;border:1px solid #E5E7EB;">
              <h3 style="color:#111827;font-size:14px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 16px;">Customer Details</h3>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;border-bottom:1px solid #E5E7EB;">Name</td><td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid #E5E7EB;">${full_name}</td></tr>
                <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;border-bottom:1px solid #E5E7EB;">Email</td><td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid #E5E7EB;">${email}</td></tr>
                <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Phone</td><td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600;text-align:right;">${phone || '—'}</td></tr>
              </table>
            </div>
            ${additional_info ? `
            <div style="background:#F9FAFB;border-radius:12px;padding:24px;border:1px solid #E5E7EB;">
              <h3 style="color:#111827;font-size:14px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 12px;">Additional Information</h3>
              <p style="color:#374151;font-size:14px;line-height:1.7;margin:0;">${additional_info}</p>
            </div>` : ''}
          </div>
          <div style="background:#F9FAFB;padding:20px 40px;text-align:center;border-top:1px solid #E5E7EB;">
            <p style="color:#9CA3AF;font-size:12px;margin:0;">Reply directly to this email to contact the customer at ${email}</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });

  // Confirmation email to customer
  await transporter.sendMail({
    from: `"Sight Seekers" <${businessEmail}>`,
    to: email,
    subject: `We received your cancellation request — ${booking_ref}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#F5F0E8;font-family:'Helvetica Neue',Arial,sans-serif;">
        <div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <div style="background:#0C1A12;padding:32px 40px;text-align:center;">
            <p style="color:#D97706;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 8px;">Sight Seekers Kenya</p>
            <h1 style="color:white;font-size:22px;margin:0;font-weight:700;">Cancellation Request Received</h1>
          </div>
          <div style="padding:40px;">
            <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px;">Hi ${full_name},</p>
            <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px;">
              We've received your cancellation request for <strong>${package_name}</strong> (Ref: <strong>${booking_ref}</strong>).
            </p>
            <div style="background:#F9FAFB;border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid #E5E7EB;">
              <p style="color:#374151;font-size:14px;line-height:1.7;margin:0;">
                Our team will review your request and contact you at this email address within <strong>24–48 hours</strong> with a follow-up regarding your cancellation and any applicable refunds.
              </p>
            </div>
            <p style="color:#6B7280;font-size:13px;line-height:1.7;margin:0 0 32px;">
              If you have any urgent questions, please reply directly to this email.
            </p>
            <div style="text-align:center;">
              <a href="http://localhost:5173" style="display:inline-block;background:#0C1A12;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;">Back to Sight Seekers</a>
            </div>
          </div>
          <div style="background:#F9FAFB;padding:24px 40px;text-align:center;border-top:1px solid #E5E7EB;">
            <p style="color:#9CA3AF;font-size:12px;margin:0;">Sight Seekers Kenya · Nairobi, Kenya</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};

module.exports = { sendBookingConfirmation, sendWelcomeEmail, sendPaymentReceipt, sendCancellationRequest };

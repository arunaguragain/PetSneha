const { transporter } = require('../config/email');

function formatDate(value) {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'Asia/Kathmandu' }).format(new Date(value));
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kathmandu',
  }).format(new Date(value));
}

function formatCurrency(value) {
  return `NPR ${Number(value || 0).toFixed(2)}`;
}

function formatPersonName(name, prefix = 'Dr.') {
  if (!name) return 'N/A';
  return /^dr\.?(\s|$)/i.test(name.trim()) ? name.trim() : `${prefix} ${name.trim()}`;
}

function paragraph(text) {
  return `<p style="margin:0 0 18px;color:#334155;font-size:16px;line-height:1.75;">${text}</p>`;
}

function actionButton(href, label) {
  return `<p style="margin:24px 0 0;"><a href="${href}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600;">${label}</a></p>`;
}

function shell(title, body) {
  return `
    <div style="font-family:Arial,sans-serif;background:#f7f5f1;padding:24px;color:#1f2937;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:20px;padding:28px;border:1px solid #e5e7eb;">
        <h1 style="margin:0 0 18px;font-size:28px;line-height:1.15;color:#0f172a;font-weight:700;">${title}</h1>
        <div style="font-size:16px;line-height:1.75;color:#334155;">
          ${body}
        </div>
      </div>
    </div>`;
}

function detailsBox(rows) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;margin:18px 0;overflow:hidden;">
      <tbody>
        ${rows
          .map(
            (row, index) => `
              <tr style="background:${index % 2 === 0 ? '#f8fafc' : '#ffffff'};">
                <td style="padding:14px 18px;font-weight:700;color:#0f172a;width:35%;vertical-align:top;">${row.label}</td>
                <td style="padding:14px 18px;color:#334155;text-align:right;vertical-align:top;">${row.value}</td>
              </tr>
            `
          )
          .join('')}
      </tbody>
    </table>`;
}

async function sendMail({ to, subject, html }) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
}

/**
 * Sends a password reset email.
 * @param {{ email: string, name?: string }} user
 * @param {string} token
 * @returns {Promise<import('nodemailer').SentMessageInfo>}
 */
async function sendPasswordResetEmail(user, token) {
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
  return sendMail({
    to: user.email,
    subject: 'Reset your PetSneha password',
    html: shell(
      'Reset your password',
      `<p>Hi ${user.name || 'there'},</p><p>Use the button below to reset your password securely.</p><p><a href="${resetLink}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`
    ),
  });
}

/**
 * Sends the booking confirmation email.
 * @param {{ email: string, name?: string }} user
 * @param {object} appointment
 * @param {object} vet
 * @returns {Promise<import('nodemailer').SentMessageInfo>}
 */
async function sendBookingConfirmationEmail(user, appointment, vet, pet) {
  const subject = `✓ Appointment confirmed — ${formatPersonName(vet.name)} · ${formatDate(appointment.date)}`;
  const html = shell(
    'Your appointment is confirmed',
    `
      ${paragraph(`Hi ${user.name || 'there'}, your appointment has been confirmed.`)}
      ${detailsBox([
        { label: 'Vet', value: formatPersonName(vet.name) },
        { label: 'Clinic', value: vet.clinicName || 'N/A' },
        { label: 'Date', value: formatDate(appointment.date) },
        { label: 'Time', value: appointment.timeSlot || 'TBD' },
        { label: 'Pet', value: appointment.petName || pet?.name || 'Your pet' },
        { label: 'Fee', value: formatCurrency(appointment.fee) },
      ])}
      ${paragraph('Arrive a few minutes early so the doctor can review the history calmly.')}
      ${actionButton(`${process.env.CLIENT_URL}/appointments/${appointment._id}`, 'View appointment')}
    `
  );

  return sendMail({ to: user.email, subject, html });
}

async function sendBookingRequestReceivedEmail(user, appointment, vet) {
  const subject = `Appointment request received — ${formatPersonName(vet.name)} · ${formatDate(appointment.date)}`;
  const html = shell(
    'Appointment request received',
    `
      ${paragraph(`Hi ${user.name || 'there'}, your booking request has been received.`)}
      ${detailsBox([
        { label: 'Vet', value: formatPersonName(vet.name) },
        { label: 'Clinic', value: vet.clinicName || 'N/A' },
        { label: 'Date', value: formatDate(appointment.date) },
        { label: 'Time', value: appointment.timeSlot || 'TBD' },
        { label: 'Pet', value: appointment.petName || 'Your pet' },
        { label: 'Fee', value: formatCurrency(appointment.fee) },
      ])}
      ${paragraph(`Dr. ${vet.name} will confirm or decline this appointment shortly.`)}
      ${actionButton(`${process.env.CLIENT_URL}/appointments/${appointment._id}`, 'View appointment')}
    `
  );

  return sendMail({ to: user.email, subject, html });
}

async function sendNewBookingRequestEmail(vet, appointment, petOwner, pet) {
  const subject = `New booking request — ${petOwner.name || 'Pet owner'} for ${formatDate(appointment.date)}`;
  const html = shell(
    'New booking request',
    `
      <p>Hi Dr. ${vet.name},</p>
      <p>You have a new booking request from ${petOwner.name || 'a pet owner'}.</p>
      ${detailsBox([
        { label: 'Pet owner', value: petOwner.name || petOwner.email },
        { label: 'Pet', value: pet.name || 'N/A' },
        { label: 'Date', value: formatDate(appointment.date) },
        { label: 'Time', value: appointment.timeSlot },
        { label: 'Fee', value: formatCurrency(appointment.fee) },
      ])}
      <div style="margin:20px 0 0;">
        <p>Review and confirm the request on your dashboard.</p>
        <p><a href="${process.env.CLIENT_URL}/vet/dashboard" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;">Go to dashboard</a></p>
      </div>
    `
  );

  return sendMail({ to: vet.email, subject, html });
}

async function sendAppointmentCancelledEmail(recipient, appointment, isVet) {
  const subject = `Appointment cancelled — ${formatDate(appointment.date)}`;
  const detailsUrl = isVet
    ? `${process.env.CLIENT_URL}/vet/dashboard`
    : `${process.env.CLIENT_URL}/appointments/${appointment._id || appointment.id}`;

  const html = shell(
    'Appointment cancelled',
    `
      <p>Hi ${recipient.name || 'there'},</p>
      <p>${isVet ? 'A consultation has been cancelled.' : 'Your appointment has been cancelled.'}</p>
      ${detailsBox([
        { label: 'Vet', value: `   ${appointment.vetName || appointment.vet?.name || 'N/A'}` },
        { label: 'Pet', value:   appointment.petName || appointment.pet?.name || 'N/A' },
        { label: 'Date', value: formatDate(appointment.date) },
        { label: 'Time', value: appointment.timeSlot },
        { label: 'Status', value: appointment.status || 'Cancelled' },
      ])}
      <div style="margin:20px 0 0;">
        <p>If you need to reschedule, you can do so from the appointments section.</p>
        <p><a href="${detailsUrl}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;">View appointments</a></p>
      </div>
    `
  );

  return sendMail({ to: recipient.email, subject, html });
}

/**
 * Sends the order confirmation email.
 * @param {{ email: string, name?: string }} user
 * @param {object} order
 * @returns {Promise<import('nodemailer').SentMessageInfo>}
 */
async function sendOrderConfirmationEmail(user, order) {
  const subject = `✓ Order #${order.orderNumber} confirmed — delivery in 2–3 days`;
  const itemsTable = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;">${item.name}</td>
          <td style="padding:8px 0;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 0;text-align:right;">${formatCurrency(item.price)}</td>
        </tr>`
    )
    .join('');

  const html = shell(
    'Your order is confirmed',
    `
      <p>Hi ${user.name || 'there'}, thanks for shopping with PetSneha.</p>
      <table style="width:100%;border-collapse:collapse;margin:18px 0;">
        <thead>
          <tr><th align="left">Item</th><th align="center">Qty</th><th align="right">Price</th></tr>
        </thead>
        <tbody>${itemsTable}</tbody>
      </table>
      ${detailsBox([
        { label: 'Delivery address', value: `${order.deliveryAddress?.fullName || ''}, ${order.deliveryAddress?.address || ''}` },
        { label: 'Expected delivery', value: '2–3 business days' },
        { label: 'Payment method', value: order.paymentMethod.toUpperCase() },
        { label: 'Total', value: formatCurrency(order.total) },
      ])}
      <div style="margin:20px 0 0;">
        <p><a href="${process.env.CLIENT_URL}/orders/${order._id}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;">Track order</a></p>
      </div>
    `
  );

  return sendMail({ to: user.email, subject, html });
}

/**
 * Sends a reminder email.
 * @param {{ email: string, name?: string, savedVetId?: object }} user
 * @param {object} reminder
 * @param {object} pet
 * @param {object} [savedVet]
 * @returns {Promise<import('nodemailer').SentMessageInfo>}
 */
async function sendReminderEmail(user, reminder, pet, savedVet) {
  const subject = `💉 Reminder — ${pet.name}'s ${reminder.title} is due in ${reminder.leadTimeDays} days`;
  const vetInfo = savedVet ? `${savedVet.name}${savedVet.clinicName ? ` · ${savedVet.clinicName}` : ''}` : 'No saved vet yet';
  const html = shell(
    'Reminder for your pet',
    `
      <p>Hi ${user.name || 'there'}, this is a reminder for ${pet.name}.</p>
      ${detailsBox([
        { label: 'Pet', value: pet.name },
        { label: 'Reminder', value: reminder.title },
        { label: 'Due date', value: formatDate(reminder.dueDate) },
        { label: 'Days remaining', value: reminder.leadTimeDays },
        { label: 'Saved vet', value: vetInfo },
      ])}
      <div style="margin:20px 0 0;">
        <p><a href="${process.env.CLIENT_URL}/appointments/new?petId=${pet._id}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;">Book appointment</a></p>
        <p><a href="${process.env.CLIENT_URL}/reminders/${reminder._id}?action=dismiss" style="color:#b91c1c;">Dismiss reminder</a></p>
      </div>
    `
  );

  return sendMail({ to: user.email, subject, html });
}

module.exports = {
  sendPasswordResetEmail,
  sendBookingConfirmationEmail,
  sendBookingRequestReceivedEmail,
  sendNewBookingRequestEmail,
  sendAppointmentCancelledEmail,
  sendOrderConfirmationEmail,
  sendReminderEmail,
  formatDate,
  formatDateTime,
};
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

function shell(title, body) {
  return `
    <div style="font-family:Arial,sans-serif;background:#f7f5f1;padding:24px;color:#1f2937;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:20px;padding:28px;border:1px solid #e5e7eb;">
        <h1 style="margin:0 0 18px;font-size:26px;line-height:1.2;color:#0f172a;">${title}</h1>
        ${body}
      </div>
    </div>`;
}

function detailsBox(rows) {
  return `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:18px;margin:18px 0;">
      ${rows.map((row) => `<div style="display:flex;justify-content:space-between;gap:16px;padding:6px 0;border-bottom:1px solid #e2e8f0;"><strong>${row.label}</strong><span>${row.value}</span></div>`).join('')}
    </div>`;
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
async function sendBookingConfirmationEmail(user, appointment, vet) {
  const subject = `✓ Appointment confirmed — Dr. ${vet.name} · ${formatDate(appointment.date)}`;
  const html = shell(
    'Your appointment is confirmed',
    `
      <p>Hi ${user.name || 'there'}, your appointment has been confirmed.</p>
      ${detailsBox([
        { label: 'Vet', value: `Dr. ${vet.name}` },
        { label: 'Clinic', value: vet.clinicName || 'N/A' },
        { label: 'Date', value: formatDate(appointment.date) },
        { label: 'Time', value: appointment.timeSlot },
        { label: 'Pet', value: appointment.petName || 'Your pet' },
        { label: 'Fee', value: formatCurrency(appointment.fee) },
      ])}
      <p>Arrive a few minutes early so the doctor can review the history calmly.</p>
      <p><a href="${process.env.CLIENT_URL}/appointments/${appointment._id}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;">View appointment</a></p>
      <p><a href="${process.env.CLIENT_URL}/appointments/${appointment._id}?action=cancel" style="color:#b91c1c;">Cancel appointment</a></p>
    `
  );

  return sendMail({ to: user.email, subject, html });
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
      <p><a href="${process.env.CLIENT_URL}/orders/${order._id}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;">Track order</a></p>
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
      <p><a href="${process.env.CLIENT_URL}/appointments/new?petId=${pet._id}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;">Book appointment</a></p>
      <p><a href="${process.env.CLIENT_URL}/reminders/${reminder._id}?action=dismiss" style="color:#b91c1c;">Dismiss reminder</a></p>
    `
  );

  return sendMail({ to: user.email, subject, html });
}

module.exports = {
  sendPasswordResetEmail,
  sendBookingConfirmationEmail,
  sendOrderConfirmationEmail,
  sendReminderEmail,
  formatDate,
  formatDateTime,
};
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button, ConfirmationOverlay } from '../../components/ui';
import { formatDate, safeArray } from '../../utils/api';

export default function ReminderSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const reminder = location.state?.reminder || {};
  const pet = location.state?.pet || {};
  const notifyVia = safeArray(reminder.notifyVia || ['push', 'email']);

  return (
    <ConfirmationOverlay
      open
      icon={<CheckCircle2 size={32} />}
      title="Reminder Saved!"
      description={`${pet.name || 'Your pet'}'s ${reminder.title || 'reminder'} set · notify ${reminder.leadTime || 1} days before via ${notifyVia.join(' + ')}`}
      actions={(
        <>
          <Button as={Link} variant="secondary" to="/dashboard" fullWidth>
            Back to dashboard
          </Button>
          <Button type="button" onClick={() => navigate(`/reminders/new?petId=${pet._id || ''}`)} fullWidth>
            Add another reminder
          </Button>
        </>
      )}
    >
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left text-sm text-slate-600">
        <div className="grid gap-2 sm:grid-cols-2">
          <p><span className="font-semibold text-slate-900">Pet:</span> {pet.name || '—'}</p>
          <p><span className="font-semibold text-slate-900">Reminder:</span> {reminder.title || '—'}</p>
          <p><span className="font-semibold text-slate-900">Due date:</span> {formatDate(reminder.dueDate)}</p>
          <p><span className="font-semibold text-slate-900">Notify me:</span> {notifyVia.join(' + ')}</p>
        </div>
      </div>
    </ConfirmationOverlay>
  );
}
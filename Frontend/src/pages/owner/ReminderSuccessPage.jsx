import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, IconBox } from '../../components/ui';
import { formatDate, safeArray } from '../../utils/api';

export default function ReminderSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const reminder = location.state?.reminder || {};
  const pet = location.state?.pet || {};
  const notifyVia = safeArray(reminder.notifyVia || ['push', 'email']);

  return (
    <div className="mx-auto flex max-w-[500px] justify-center pb-10 text-center">
      <Card className="rounded-3xl p-12 shadow-lg">
        <div className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full border border-primary-200 bg-primary-50 text-3xl">🔔</div>
        <h1 className="font-display text-[26px] text-neutral-900">Reminder Saved!</h1>
        <p className="mt-2 text-neutral-600">{pet.name || 'Your pet'}'s {reminder.title || 'reminder'} set · notify {reminder.leadTime || 1} days before via {notifyVia.join(' + ')}</p>

        <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-left text-sm text-neutral-600">
          <div className="grid gap-2 sm:grid-cols-2">
            <p><span className="font-semibold text-neutral-900">Pet:</span> {pet.name || '—'}</p>
            <p><span className="font-semibold text-neutral-900">Reminder:</span> {reminder.title || '—'}</p>
            <p><span className="font-semibold text-neutral-900">Due date:</span> {formatDate(reminder.dueDate)}</p>
            <p><span className="font-semibold text-neutral-900">Notify me:</span> {notifyVia.join(' + ')}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button as={Link} variant="secondary" to="/dashboard">Back to dashboard</Button>
          <Button type="button" onClick={() => navigate(`/reminders/new?petId=${pet._id || ''}`)}>Add another reminder</Button>
        </div>
      </Card>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { Button, Card, Select, Skeleton } from '../../components/ui';
import { completeAppointment, confirmAppointment, getVetAppointments, vetCancelAppointment } from '../../api/vetDashboard.api';
import { formatDate, getErrorMessage, unwrapItems } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

export default function VetAppointmentsPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    try {
      setLoading(true);
      const response = await getVetAppointments(filter === 'all' ? {} : { status: filter });
      setAppointments(unwrapItems(response));
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter]);

  const handleComplete = async (id) => {
    try {
      await completeAppointment(id, {});
      addToast('Appointment completed', 'success');
      await load();
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    }
  };

  const handleCancel = async (id) => {
    const reason = window.prompt('Cancel reason');
    if (!reason) {
      return;
    }
    try {
      await vetCancelAppointment(id, reason);
      addToast('Appointment cancelled', 'success');
      await load();
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    }
  };

  return (
    <div className="container-app px-10 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-neutral-900">Appointments</h1>
          <p className="mt-2 text-body-md text-neutral-600">Track and update appointment progress.</p>
        </div>
        <Select value={filter} onChange={(event) => setFilter(event.target.value)} className="max-w-[200px]">
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
        </Select>
      </div>
      {loading ? <Skeleton className="mt-6 h-72 w-full" /> : (
        <div className="mt-6 space-y-3">
          {appointments.map((appointment) => (
            <Card key={appointment._id || appointment.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-neutral-900">{appointment.pet?.name || 'Pet'} · {appointment.owner?.name || 'Owner'}</p>
                  <p className="text-body-md text-neutral-500">{formatDate(appointment.date)} · {appointment.timeSlot || 'Time pending'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => confirmAppointment(appointment._id || appointment.id)}>Confirm</Button>
                  <Button size="sm" onClick={() => handleComplete(appointment._id || appointment.id)}>Complete</Button>
                  <Button size="sm" variant="danger" onClick={() => handleCancel(appointment._id || appointment.id)}>Cancel</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
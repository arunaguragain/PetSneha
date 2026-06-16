import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Badge, Button, Card, Skeleton, InfoBox } from '../../components/ui';
import { confirmAppointment, getVetAppointments, getVetDashboard, toggleVetStatus } from '../../api/vetDashboard.api';
import { getErrorMessage, formatDate, unwrapItems, unwrapItem } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

export default function VetDashboardPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, appointmentsResponse] = await Promise.all([getVetDashboard(), getVetAppointments()]);
      
      const loadedDashboard = dashboardResponse.data?.dashboard
        || dashboardResponse.data?.item
        || dashboardResponse.data
        || dashboardResponse;
      setDashboard(loadedDashboard);

      const appointmentsList = appointmentsResponse.data?.appointments
        || appointmentsResponse.data?.items
        || (Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data : appointmentsResponse || []);
      setAppointments(appointmentsList);
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleConfirm = async (id) => {
    try {
      await confirmAppointment(id);
      addToast('Appointment confirmed', 'success');
      await load();
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    }
  };

  const handleStatus = async () => {
    try {
      await toggleVetStatus();
      addToast('Status updated', 'success');
      await load();
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    }
  };

  const isOpen = dashboard?.vet?.isOpenNow;

  return (
    <div className="container-app px-10 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-4xl text-neutral-900">Vet dashboard</h1>
            {dashboard?.vet && (
              <Badge variant={isOpen ? 'success' : 'danger'}>
                {isOpen ? 'Available' : 'Offline'}
              </Badge>
            )}
          </div>
          <p className="mt-2 text-body-md text-neutral-600">Manage appointments, status, and articles.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={isOpen ? 'secondary' : 'primary'} 
            onClick={handleStatus}
            className={isOpen ? '' : '!bg-success !hover:bg-success-600 !border-none !text-white'}
          >
            {isOpen ? 'Go Offline' : 'Go Online'}
          </Button>
          <Button as={Link} to="/vet/appointments">Appointments</Button>
        </div>
      </div>

      {dashboard?.vet && !dashboard.vet.isVerified && (
        <InfoBox type="error" className="mt-6">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-bold">Account Pending Verification</p>
              <p className="mt-1 text-sm">Your professional credentials and clinic details are currently being reviewed by our administrators. You will receive an email once your profile is verified and live (usually within 24 hours).</p>
            </div>
          </div>
        </InfoBox>
      )}

      {loading ? <Skeleton className="mt-6 h-60 w-full" /> : (
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <Card className="p-5"><p className="text-caption text-neutral-500">Today</p><p className="mt-1 font-display text-3xl text-neutral-900">{dashboard?.todayCount || appointments.length}</p></Card>
          <Card className="p-5"><p className="text-caption text-neutral-500">Pending</p><p className="mt-1 font-display text-3xl text-neutral-900">{dashboard?.pendingCount || appointments.filter((item) => String(item.status).toLowerCase() === 'pending').length}</p></Card>
          <Card className="p-5"><p className="text-caption text-neutral-500">Earnings</p><p className="mt-1 font-display text-3xl text-neutral-900">Rs {dashboard?.earnings || 0}</p></Card>
        </div>
      )}

      <Card className="mt-6 p-5">
        <h2 className="font-display text-2xl text-neutral-900">Upcoming appointments</h2>
        <div className="mt-4 space-y-3">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <Avatar name={appointment.pet?.name || 'Pet'} size="md" />
                <div>
                  <p className="font-semibold text-neutral-900">{appointment.pet?.name || 'Pet'} · {appointment.owner?.name || appointment.user?.name || 'Owner'}</p>
                  <p className="text-body-md text-neutral-500">{formatDate(appointment.date)} · {appointment.timeSlot || 'Time pending'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="neutral">{appointment.status || 'pending'}</Badge>
                <Button size="sm" variant="secondary" onClick={() => handleConfirm(appointment._id)}>Confirm</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
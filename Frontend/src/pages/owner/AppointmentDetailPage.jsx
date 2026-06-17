import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, Badge, Button, Card, Spinner } from '../../components/ui';
import { getAppointment, cancelAppointment } from '../../api/pet.api';
import { getErrorMessage, formatCurrency, formatDate } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { Calendar, Clock, MapPin, User, XCircle } from 'lucide-react';

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await getAppointment(id);
        setAppointment(response.data?.appointment || response.data || response);
      } catch (apiError) {
        addToast(getErrorMessage(apiError), 'danger');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [addToast, id, navigate]);

  const handleCancel = async () => {
    const confirmed = window.confirm('Are you sure you want to cancel this appointment?');
    if (!confirmed) return;

    try {
      setCancelling(true);
      await cancelAppointment(id);
      addToast('Appointment cancelled', 'success');
      navigate('/dashboard');
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!appointment) {
    return <div className="p-8 text-center text-[#64748B]">Appointment not found.</div>;
  }

  return (
    <div className="container-app px-10 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-[#64748B]">Appointment details</p>
          <h1 className="font-display text-3xl text-neutral-900">{appointment.petName || appointment.pet?.name || 'Appointment'}</h1>
        </div>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] mt-6">
        <div className="space-y-5">
          <Card className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#0F172A]">{appointment.petName || appointment.pet?.name || 'Your pet'}</h2>
                <p className="text-sm text-[#64748B] mt-1">{appointment.status || 'Pending'}</p>
              </div>
              <Badge variant={appointment.status === 'confirmed' ? 'success' : appointment.status === 'cancelled' ? 'danger' : 'warning'}>
                {appointment.status || 'pending'}
              </Badge>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <div className="flex items-center gap-2 text-sm text-[#334155]"><Calendar className="w-4 h-4" />Date</div>
                <p className="mt-2 text-base font-semibold text-[#0F172A]">{formatDate(appointment.date)}</p>
              </div>
              <div className="rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <div className="flex items-center gap-2 text-sm text-[#334155]"><Clock className="w-4 h-4" />Time</div>
                <p className="mt-2 text-base font-semibold text-[#0F172A]">{appointment.timeSlot || 'TBD'}</p>
              </div>
              <div className="rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <div className="flex items-center gap-2 text-sm text-[#334155]"><User className="w-4 h-4" />Pet owner</div>
                <p className="mt-2 text-base font-semibold text-[#0F172A]">{appointment.owner?.name || appointment.user?.name || appointment.petOwnerName || 'Owner'}</p>
              </div>
              <div className="rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <div className="flex items-center gap-2 text-sm text-[#334155]"><MapPin className="w-4 h-4" />Clinic</div>
                <p className="mt-2 text-base font-semibold text-[#0F172A]">{appointment.vet?.clinicName || appointment.vetName || 'Clinic details unavailable'}</p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-[#64748B]">Consultation fee</p>
                  <p className="text-xl font-semibold text-[#0F172A]">{formatCurrency(appointment.fee)}</p>
                </div>
                <span className="text-sm text-[#475569]">{appointment.vet?.name ? `Dr. ${appointment.vet.name}` : appointment.vetName || 'Veterinarian'}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-[#0F172A]">Notes</h2>
            <p className="mt-3 text-sm leading-6 text-[#475569]">{appointment.notes || 'No additional notes submitted.'}</p>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Avatar name={appointment.owner?.name || appointment.petOwnerName || 'Owner'} size="lg" />
              <div>
                <p className="text-sm text-[#64748B]">Contact</p>
                <p className="font-semibold text-[#0F172A]">{appointment.owner?.name || appointment.petOwnerName || 'Pet owner'}</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="rounded-3xl bg-[#F8FAFC] p-4 text-sm text-[#475569]">
                <p className="font-semibold text-[#0F172A]">Vet</p>
                <p>{appointment.vet?.name ? `Dr. ${appointment.vet.name}` : appointment.vetName || 'Not available'}</p>
              </div>
              <div className="rounded-3xl bg-[#F8FAFC] p-4 text-sm text-[#475569]">
                <p className="font-semibold text-[#0F172A]">Location</p>
                <p>{appointment.vet?.clinicName || 'Clinic not provided'}</p>
              </div>
            </div>
          </Card>

          {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
            <Button variant="danger" loading={cancelling} onClick={handleCancel}>
              <XCircle className="w-4 h-4 mr-2" /> Cancel appointment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge, Spinner } from '../../components/ui';
import { getAppointment, cancelAppointment } from '../../api/pet.api';
import { getErrorMessage, formatCurrency, formatDate } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { Calendar, Clock, MapPin, User, XCircle, Stethoscope, Phone, Mail, FileText, ArrowLeft } from 'lucide-react';

const statusVariant = (status) => {
  if (status === 'confirmed') return 'success';
  if (status === 'cancelled') return 'danger';
  return 'warning';
};

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

  const vetName = appointment.vetId?.name
    ? `Dr. ${appointment.vetId.name}`
    : appointment.vet?.name
    ? `Dr. ${appointment.vet.name}`
    : appointment.vetName || null;

  const clinicName = appointment.vetId?.clinicName
    || appointment.vet?.clinicName
    || appointment.clinic || null;

  const clinicAddress = appointment.vetId?.clinicAddress
    || appointment.vet?.clinicAddress || null;

  const ownerName = appointment.petOwnerId?.name
    || appointment.owner?.name
    || appointment.user?.name
    || appointment.petOwnerName || null;

  const ownerEmail = appointment.petOwnerId?.email
    || appointment.owner?.email
    || appointment.user?.email || null;

  const ownerPhone = appointment.petOwnerId?.phone
    || appointment.owner?.phone
    || appointment.user?.phone || null;

  const petName = appointment.petId?.name
    || appointment.pet?.name
    || appointment.petName || 'Your pet';

  const petSpecies = appointment.petId?.species || appointment.pet?.species || null;
  const petBreed = appointment.petId?.breed || appointment.pet?.breed || null;

  const canCancel = appointment.status === 'pending' || appointment.status === 'confirmed';

  return (
    <div className="bg-white min-h-screen">
      <div className="w-full px-[24px] lg:px-[64px] pt-[32px] pb-[48px]">

        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>
              Appointment details
            </h1>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-[#64748B] border border-[#E2E8F0] rounded-lg px-4 py-2 hover:bg-[#F8FAFC] transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        {/* Two-column layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

          {/* LEFT — main details */}
          <div className="space-y-5">

            {/* Status + basics card */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-[#0F172A]">{petName}</h2>
                  {(petSpecies || petBreed) && (
                    <p className="text-sm text-[#64748B] mt-0.5">
                      {[petSpecies, petBreed].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                <Badge variant={statusVariant(appointment.status)}>
                  {appointment.status || 'pending'}
                </Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#64748B] uppercase tracking-wide mb-2">
                    <Calendar className="w-4 h-4" /> Date
                  </div>
                  <p className="text-base font-semibold text-[#0F172A]">{formatDate(appointment.date || appointment.appointmentDate) || '—'}</p>
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#64748B] uppercase tracking-wide mb-2">
                    <Clock className="w-4 h-4" /> Time
                  </div>
                  <p className="text-base font-semibold text-[#0F172A]">{appointment.timeSlot || appointment.time || 'TBD'}</p>
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#64748B] uppercase tracking-wide mb-2">
                    <Stethoscope className="w-4 h-4" /> Veterinarian
                  </div>
                  <p className="text-base font-semibold text-[#0F172A]">{vetName || 'Not assigned yet'}</p>
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#64748B] uppercase tracking-wide mb-2">
                    <MapPin className="w-4 h-4" /> Clinic
                  </div>
                  <p className="text-base font-semibold text-[#0F172A]">{clinicName || 'Will be confirmed'}</p>
                  {clinicAddress && <p className="text-xs text-[#64748B] mt-0.5">{clinicAddress}</p>}
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#64748B] uppercase tracking-wide mb-2">
                    <User className="w-4 h-4" /> Pet owner
                  </div>
                  <p className="text-base font-semibold text-[#0F172A]">{ownerName || 'You'}</p>
                  {ownerEmail && <p className="text-xs text-[#64748B] mt-0.5">{ownerEmail}</p>}
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#64748B] uppercase tracking-wide mb-2">
                    Consultation fee
                  </div>
                  <p className="text-base font-semibold text-[#0F172A]">{formatCurrency(appointment.fee || appointment.consultationFee) || '—'}</p>
                  {appointment.serviceCharge ? (
                    <p className="text-xs text-[#64748B] mt-0.5">+ {formatCurrency(appointment.serviceCharge)} service charge</p>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Notes card */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-[#64748B]" />
                <h2 className="text-base font-semibold text-[#0F172A]">Notes</h2>
              </div>
              <p className="text-sm leading-6 text-[#475569]">
                {appointment.notes || 'No additional notes submitted.'}
              </p>
            </div>
          </div>

          {/* RIGHT — sidebar */}
          <div className="space-y-4">

            {/* Contact card */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-semibold text-[#0F172A]">Contact info</h2>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-[#64748B] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[#64748B] uppercase tracking-wide font-medium">Owner</p>
                    <p className="text-[#0F172A] font-medium">{ownerName || 'You'}</p>
                  </div>
                </div>

                {ownerEmail && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-[#64748B] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-[#64748B] uppercase tracking-wide font-medium">Email</p>
                      <p className="text-[#0F172A]">{ownerEmail}</p>
                    </div>
                  </div>
                )}

                {ownerPhone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-[#64748B] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-[#64748B] uppercase tracking-wide font-medium">Phone</p>
                      <p className="text-[#0F172A]">{ownerPhone}</p>
                    </div>
                  </div>
                )}

                <div className="border-t border-[#E2E8F0] pt-3">
                  <div className="flex items-start gap-3">
                    <Stethoscope className="w-4 h-4 text-[#64748B] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-[#64748B] uppercase tracking-wide font-medium">Vet</p>
                      <p className="text-[#0F172A] font-medium">{vetName || 'Not assigned yet'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#64748B] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[#64748B] uppercase tracking-wide font-medium">Location</p>
                    <p className="text-[#0F172A]">{clinicName || 'Will be confirmed'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cancel button */}
            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:opacity-60"
              >
                <XCircle className="w-4 h-4" />
                {cancelling ? 'Cancelling…' : 'Cancel appointment'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

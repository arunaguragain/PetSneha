import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Avatar, Badge, Button, Card, Divider, Input, Select, Skeleton, StarRating, Tabs, Textarea, VerifiedBadge } from '../../components/ui';
import { deletePet, downloadHealthRecordPDF, getAppointments, getHealthRecords, getPet, getPetReminders, createHealthRecord } from '../../api/pet.api';
import { getErrorMessage, formatDate, unwrapItems, unwrapItem, getPetEmoji, getStatusTone } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { Download, Plus, Calendar as CalendarIcon, Mail, Bell, Edit2, Trash2, ArrowRight, Check } from 'lucide-react';

const infoFields = [
  { key: 'breed', label: 'Breed' },
  { key: 'weight', label: 'Weight' },
  { key: 'age', label: 'Age' },
  { key: 'species', label: 'Species' },
  { key: 'colour', label: 'Colour' },
  { key: 'ownedSince', label: 'Owned since' },
];

export default function PetProfilePage() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pet, setPet] = useState(null);
  const [records, setRecords] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('health');
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [recordForm, setRecordForm] = useState({ title: '', type: '', date: '', nextDueDate: '', status: 'done', description: '' });

  // Guard first — BEFORE any fetch
  useEffect(() => {
    const isValidObjectId = /^[a-f\d]{24}$/i.test(petId);
    if (!isValidObjectId) {
      navigate('/dashboard', { replace: true });
    }
  }, [petId, navigate]);

  const getPhotoUrl = (photoSrc) => {
    if (!photoSrc) return '';
    if (photoSrc.startsWith('http')) return photoSrc;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5050/api').replace('/api', '');
    return `${baseUrl}${photoSrc}`;
  };

  const getSpeciesBadgeClass = (species) => {
    const sp = String(species || '').toLowerCase();
    if (sp === 'dog') return 'bg-[#EFF6FF] text-[#0046CE] font-semibold';
    if (sp === 'cat') return 'bg-[#F5F3FF] text-[#7C3AED] font-semibold';
    return 'bg-[#F1F5F9] text-[#475569] font-medium';
  };

  // Fetch only if petId looks valid
  useEffect(() => {
    const isValidObjectId = /^[a-f\d]{24}$/i.test(petId);
    if (!isValidObjectId) return; // skip fetch entirely

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [petRes, recordsRes, remindersRes, appointmentsRes] = await Promise.all([
          getPet(petId),
          getHealthRecords(petId),
          getPetReminders(petId),
          getAppointments(),
        ]);
        setPet(petRes.data?.pet || petRes.data);
        setRecords(recordsRes.data?.items || recordsRes.data || []);
        setReminders(remindersRes.data?.items || remindersRes.data || []);
        
        const appointmentsList = appointmentsRes.data?.appointments
          || appointmentsRes.data?.items
          || (Array.isArray(appointmentsRes.data) ? appointmentsRes.data : appointmentsRes || []);
        setAppointments(appointmentsList.filter((appointment) => String(appointment.petId || appointment.pet?._id || appointment.pet?.id) === String(petId)));
      } catch (error) {
        addToast(getErrorMessage(error) || 'Failed to load pet profile', 'danger');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [petId, navigate, addToast]);

  const handleDownloadPDF = async () => {
    try {
      const response = await downloadHealthRecordPDF(petId);
      const blob = response instanceof Blob ? response : new Blob([response], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${pet?.name || 'pet'}-health-records.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      addToast('PDF download started', 'success');
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this pet profile?')) {
      return;
    }

    try {
      await deletePet(petId);
      addToast('Pet deleted', 'success');
      navigate('/dashboard');
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    }
  };

  const handleAddRecord = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      await createHealthRecord(petId, recordForm);
      const response = await getHealthRecords(petId);
      setRecords(unwrapItems(response));
      addToast('Health record added', 'success');
      setRecordModalOpen(false);
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const activeReminders = useMemo(() => reminders, [reminders]);

  if (loading) {
    return <div className="p-8 text-center text-[#64748B]">Loading...</div>;
  }

  if (!pet) {
    return <div className="p-8 text-center text-[#64748B]">Pet not found.</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1440px] mx-auto px-8 py-10">
        
        {/* Pet header section (No card border, directly on page bg) */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <img 
              src={getPhotoUrl(pet.photo || pet.imageUrl) || (pet.species?.toLowerCase() === 'cat' ? '/paw-mark.png' : '/happy-puppy.png')} 
              alt={pet.name} 
              className="w-32 h-32 rounded-2xl object-cover bg-[#F1F5F9] flex-shrink-0 shadow-sm border border-[#E2E8F0]" 
            />
            
            <div className="text-center sm:text-left mt-2 sm:mt-0">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <h1 className="text-3xl font-bold text-[#0046CE]" style={{ fontFamily: 'Literata, serif' }}>
                  {pet.name}
                </h1>
                <span className={`text-xs px-3 py-1.5 rounded-full uppercase tracking-wider ${getSpeciesBadgeClass(pet.species)}`}>
                  {pet.breed || pet.species || 'Pet'}
                </span>
              </div>
              <div className="text-sm text-[#64748B] mt-2 font-medium">
                {pet.gender ? pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1) : 'Unknown'} • {pet.age ? `${pet.age} Years Old` : 'Age N/A'} • {pet.weight ? `${pet.weight} kg` : 'Weight N/A'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-2">
            <button 
              onClick={() => navigate(`/pets/${petId}/edit`)} 
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-[#0046CE] hover:bg-[#003DA8] text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition shadow-sm"
            >
              <Edit2 size={15} />
              Edit Profile
            </button>
            <button 
              onClick={handleDelete} 
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-xl px-5 py-2.5 text-sm font-semibold transition"
            >
              <Trash2 size={15} />
              Delete Pet
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="border-b border-[#E2E8F0] mt-8 flex gap-8">
          <button 
            onClick={() => setActiveTab('health')} 
            className={`pb-3 border-b-2 text-sm font-semibold transition-all ${
              activeTab === 'health' 
                ? 'border-[#0046CE] text-[#0046CE]' 
                : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            Health records
          </button>
          <button 
            onClick={() => setActiveTab('reminders')} 
            className={`pb-3 border-b-2 text-sm font-semibold transition-all ${
              activeTab === 'reminders' 
                ? 'border-[#0046CE] text-[#0046CE]' 
                : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            Reminders
          </button>
          <button 
            onClick={() => setActiveTab('appointments')} 
            className={`pb-3 border-b-2 text-sm font-semibold transition-all ${
              activeTab === 'appointments' 
                ? 'border-[#0046CE] text-[#0046CE]' 
                : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            Appointments
          </button>
        </div>

        {/* HEALTH RECORDS TAB */}
        {activeTab === 'health' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            
            {/* Left (col-span-2) */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-[#E2E8F0] border-t-4 border-t-[#0046CE] rounded-2xl p-6 shadow-sm">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4 mb-6">
                  <h2 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>
                    Vaccination History
                  </h2>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setRecordModalOpen(true)} 
                      className="flex items-center gap-1 bg-[#0046CE] hover:bg-[#003DA8] text-white rounded-xl px-4 py-2 text-sm font-semibold transition"
                    >
                      <Plus size={14} /> Add record manually
                    </button>
                    <button 
                      onClick={handleDownloadPDF} 
                      className="flex items-center gap-1.5 border border-[#0046CE] text-[#0046CE] hover:bg-blue-50 rounded-xl px-4 py-2 text-sm font-semibold transition"
                    >
                      <Download size={14} /> Download PDF
                    </button>
                  </div>
                </div>

                <div className="relative border-l-2 border-[#E2E8F0] ml-4 pl-6 space-y-6">
                  {records.length > 0 ? records.map((record) => {
                    const isDone = record.status === 'done' || record.status === 'completed';
                    return (
                      <div key={record._id || record.id} className="relative">
                        {/* Timeline dot */}
                        <span className={`absolute -left-[31px] top-2 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-white ${isDone ? 'border-[#0046CE]' : 'border-[#CBD5E1]'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isDone ? 'bg-[#0046CE]' : 'bg-[#CBD5E1]'}`} />
                        </span>

                        {/* Record item card */}
                        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition">
                          <div>
                            <h3 className="font-semibold text-[#1E293B] text-base">{record.title}</h3>
                            <p className="text-xs text-[#64748B] mt-0.5">{record.description || record.vetName || 'Administered at PetCare Clinic'}</p>
                            <p className="text-xs text-[#64748B] mt-1">{formatDate(record.date)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isDone ? (
                              <span className="bg-[#E6F4EA] text-[#137333] text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                                ✓ Done
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="bg-[#FEF7E0] text-[#B06000] text-xs font-semibold px-3 py-1 rounded-full">
                                  Due soon
                                </span>
                                <button 
                                  onClick={() => navigate('/vets')} 
                                  className="bg-[#0046CE] hover:bg-[#003DA8] text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
                                >
                                  Book now
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="border border-dashed border-[#E2E8F0] rounded-xl p-10 text-center text-sm text-[#64748B] bg-white">
                      No health records found. Add one manually or consult your vet.
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Right (col-span-1) */}
            <div className="lg:col-span-1 space-y-4">
              {/* Primary Vet card */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
                <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest mb-3">Primary Vet</p>
                <div className="flex items-center gap-3">
                  <img src="/vet-anita.png" alt="Vet" className="w-12 h-12 rounded-full object-cover bg-[#F1F5F9] border-2 border-[#E2E8F0]" />
                  <div>
                    <div className="font-semibold text-[#1E293B] text-sm">Dr. Anita Rai</div>
                    <div className="text-xs text-[#64748B]">Happy Paws Clinic, Lalitpur</div>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/vets')} 
                  className="w-full mt-4 border border-[#0046CE] text-[#0046CE] hover:bg-blue-50 rounded-xl py-2.5 text-sm font-semibold transition bg-transparent"
                >
                  Book Appointment
                </button>
              </div>

              {/* Tip Card */}
              <div className="bg-gradient-to-br from-[#4F46E5] to-[#6366F1] text-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
                <span className="inline-block bg-white text-[#4F46E5] text-[10px] font-bold px-2 py-0.5 rounded-full mb-3 uppercase tracking-wider">Tip</span>
                <h3 className="font-bold text-white text-base">Summer Tip</h3>
                <p className="text-sm text-white/90 mt-1.5 leading-relaxed font-medium">
                  Labradors like {pet.name || 'your pet'} need extra hydration during Kathmandu summers. Ensure fresh water is always available.
                </p>
                <div 
                  onClick={() => navigate('/articles')} 
                  className="text-xs text-white hover:text-white/90 mt-4 flex items-center gap-1 cursor-pointer font-semibold underline"
                >
                  Read more articles <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REMINDERS TAB */}
        {activeTab === 'reminders' && (
          <div className="mt-6">
            <div className="flex justify-end">
              <button 
                onClick={() => navigate(`/reminders/new?petId=${petId}`)}
                className="bg-[#0046CE] hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition"
              >
                + Set new reminder
              </button>
            </div>
            
            <h2 className="text-xl font-bold text-[#1E293B] mt-4" style={{ fontFamily: 'Literata, serif' }}>Active Reminders</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              {activeReminders.length > 0 ? activeReminders.map((reminder) => (
                <div key={reminder._id || reminder.id} className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <Bell className="w-5 h-5 text-[#0046CE]" />
                    <div className="flex items-center gap-2">
                      <button onClick={() => navigate(`/reminders/new?petId=${petId}`)} className="text-[#64748B] hover:text-[#1E293B]"><Edit2 className="w-4 h-4" /></button>
                      <button className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-[#1E293B] mt-3 truncate">{reminder.title}</h3>
                  <div className="text-sm text-[#64748B] flex items-center gap-1 mt-1 truncate">
                    <CalendarIcon className="w-4 h-4" /> {formatDate(reminder.dueDate)}
                  </div>
                  <div className="text-sm text-[#64748B] flex items-center gap-1 mt-1 truncate">
                    <Mail className="w-4 h-4" /> Notify via {(reminder.notifyVia || ['Email']).join(', ')}
                  </div>
                </div>
              )) : (
                <div className="col-span-3 border border-dashed border-[#E2E8F0] rounded-xl p-6 text-center text-sm text-[#64748B] bg-white">
                  No active reminders. Add one to keep track of medications or events.
                </div>
              )}
            </div>

            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4 mt-6 flex items-center justify-between">
              <div>
                <h3 className="text-[#0046CE] font-semibold">Never miss a health milestone</h3>
                <p className="text-sm text-[#64748B] mt-0.5">Enable push notifications to get alerts directly on your device.</p>
              </div>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-[#E2E8F0]">
                <Bell className="w-6 h-6 text-[#0046CE]" />
              </div>
            </div>
          </div>
        )}

        {/* APPOINTMENTS TAB */}
        {activeTab === 'appointments' && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>Appointments</h2>
            <div className="mt-4 space-y-3">
              {appointments.length > 0 ? appointments.map((appointment) => (
                <div key={appointment._id || appointment.id} className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-[#1E293B]">{appointment.vet?.name || appointment.vetName || 'Vet Visit'}</h3>
                    <div className="text-sm text-[#64748B] mt-1">{formatDate(appointment.date || appointment.appointmentDate)} • {appointment.timeSlot || appointment.time || 'Time pending'}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                    getStatusTone(appointment.status) === 'success' ? 'bg-[#F0FDF4] text-[#166534]' : 
                    getStatusTone(appointment.status) === 'warning' ? 'bg-[#FFFBEB] text-[#92400E]' : 
                    'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]'
                  }`}>
                    {appointment.status || 'Pending'}
                  </span>
                </div>
              )) : (
                <div className="border border-dashed border-[#E2E8F0] rounded-xl p-6 text-center text-sm text-[#64748B] bg-white">
                  No past or upcoming appointments found.
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Record Modal */}
      {recordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/60 px-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-lg text-[#1E293B] mb-4" style={{ fontFamily: 'Literata, serif' }}>Add health record</h3>
            <form className="space-y-4" onSubmit={handleAddRecord}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase mb-1">Title</label>
                  <input type="text" className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0046CE]" value={recordForm.title} onChange={(event) => setRecordForm((current) => ({ ...current, title: event.target.value }))} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase mb-1">Type</label>
                  <input type="text" className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0046CE]" value={recordForm.type} onChange={(event) => setRecordForm((current) => ({ ...current, type: event.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase mb-1">Date</label>
                  <input type="date" className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0046CE]" value={recordForm.date} onChange={(event) => setRecordForm((current) => ({ ...current, date: event.target.value }))} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase mb-1">Next due date</label>
                  <input type="date" className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0046CE]" value={recordForm.nextDueDate} onChange={(event) => setRecordForm((current) => ({ ...current, nextDueDate: event.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#64748B] uppercase mb-1">Status</label>
                  <select className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0046CE]" value={recordForm.status} onChange={(event) => setRecordForm((current) => ({ ...current, status: event.target.value }))}>
                    <option value="done">Done</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase mb-1">Description</label>
                <textarea className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0046CE] resize-none" rows={4} value={recordForm.description} onChange={(event) => setRecordForm((current) => ({ ...current, description: event.target.value }))} />
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#E2E8F0]">
                <button type="button" className="px-4 py-2 text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] rounded-lg transition" onClick={() => setRecordModalOpen(false)}>Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium bg-[#0046CE] text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-70">
                  {submitting ? 'Saving...' : 'Save record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
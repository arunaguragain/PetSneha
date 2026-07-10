import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Avatar, Badge, Button, Card, Divider, Input, Select, Skeleton, StarRating, Tabs, Textarea, VerifiedBadge } from '../../components/ui';
import { cancelAppointment, deletePet, downloadHealthRecordPDF, getAppointments, getHealthRecords, getPet, getPetReminders, createHealthRecord, deleteReminder } from '../../api/pet.api';
import { getArticles } from '../../api/content.api';
import { getErrorMessage, formatCurrency, formatDate, unwrapItems, unwrapItem, getPetEmoji, getStatusTone } from '../../utils/api';
import { translateDynamic } from '../../utils/mappings';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { Download, Plus, Calendar as CalendarIcon, Mail, Bell, Edit2, Trash2, ArrowRight, Check } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';

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
  const { t, i18n } = useTranslation();
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const [loading, setLoading] = useState(true);
  const [pet, setPet] = useState(null);
  const [records, setRecords] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('health');
  const [tipArticle, setTipArticle] = useState(null);

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

  const refreshAppointments = async () => {
    try {
      const appointmentsRes = await getAppointments();
      const appointmentsList = appointmentsRes.data?.appointments
        || appointmentsRes.data?.items
        || (Array.isArray(appointmentsRes.data) ? appointmentsRes.data : appointmentsRes || []);
      setAppointments(appointmentsList.filter((appointment) => {
        const apptPetId = appointment.petId?._id || appointment.petId || appointment.pet?._id || appointment.pet?.id;
        return String(apptPetId) === String(petId);
      }));
    } catch (error) {
      addToast(getErrorMessage(error) || t('petProfile.refreshError', 'Unable to refresh appointments'), 'danger');
    }
  };

  const handleAppointmentCancel = async (appointmentId) => {
    const confirmed = await confirm({
      title: t('petProfile.cancelAptTitle', 'Cancel appointment'),
      message: t('petProfile.cancelAptMsg', 'Are you sure you want to cancel this appointment? This cannot be undone.'),
      confirmText: t('petProfile.cancelAptConfirm', 'Yes, cancel'),
      cancelText: t('petProfile.cancelAptKeep', 'Keep appointment'),
      variant: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      await cancelAppointment(appointmentId);
      addToast(t('petProfile.aptCancelledSuccess', 'Appointment cancelled successfully'), 'success');
      await refreshAppointments();
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    }
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
        setAppointments(appointmentsList.filter((appointment) => {
          const apptPetId = appointment.petId?._id || appointment.petId || appointment.pet?._id || appointment.pet?.id;
          return String(apptPetId) === String(petId);
        }));
      } catch (error) {
        addToast(getErrorMessage(error) || t('petProfile.loadError', 'Failed to load pet profile'), 'danger');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [petId, navigate, addToast]);

  // Fetch a relevant article whenever pet loads
  useEffect(() => {
    if (!pet) return;
    const rawSpecies = (pet.species || pet.type || '').toLowerCase().trim();
    // Map species to search keywords that will match article titles/content
    const keywordMap = {
      dog: 'dog',
      puppy: 'dog',
      cat: 'cat',
      kitten: 'cat',
      bird: 'bird',
      parrot: 'parrot',
      rabbit: 'rabbit',
      fish: 'fish',
      hamster: 'hamster',
      turtle: 'turtle',
      guinea: 'guinea',
    };
    // Find the best matching keyword
    const keyword = Object.entries(keywordMap).find(([k]) => rawSpecies.includes(k))?.[1] || rawSpecies || 'pet';

    getArticles({ petType: keyword, limit: 1, status: 'published' })
      .then((res) => {
        const items = res.data?.articles || res.data?.items || [];
        if (items.length > 0) setTipArticle(items[0]);
      })
      .catch(() => {});
  }, [pet]);

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
      addToast(t('petProfile.pdfStarted', 'PDF download started'), 'success');
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    }
  };

  const handleDelete = async () => {
    const isConfirmed = await confirm({
      title: t('petProfile.deletePetTitle', 'Delete Pet Profile'),
      message: t('petProfile.deletePetMsg', 'Are you sure you want to delete {{name}}? This action cannot be undone and all health records, reminders, and appointments will be permanently lost.', { name: pet?.name || 'this pet' }),
      confirmText: t('petProfile.deletePetConfirm', 'Delete pet'),
      cancelText: t('common.cancel', 'Cancel'),
      variant: 'danger'
    });

    if (!isConfirmed) {
      return;
    }

    try {
      await deletePet(petId);
      addToast(t('petProfile.petDeleted', 'Pet deleted'), 'success');
      navigate('/dashboard');
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    const isConfirmed = await confirm({
      title: t('petProfile.deleteReminderTitle', 'Delete Reminder'),
      message: t('petProfile.deleteReminderMsg', 'Are you sure you want to delete this reminder?'),
      confirmText: t('common.delete', 'Delete'),
      cancelText: t('common.cancel', 'Cancel'),
      variant: 'danger'
    });

    if (!isConfirmed) return;

    try {
      await deleteReminder(reminderId);
      setReminders(prev => prev.filter(r => (r._id || r.id) !== reminderId));
      addToast(t('petProfile.reminderDeleted', 'Reminder deleted'), 'success');
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    }
  };

  const activeReminders = useMemo(() => reminders, [reminders]);

  if (loading) {
    return <div className="p-8 text-center text-[#64748B]">{t('common.loading', 'Loading...')}</div>;
  }

  if (!pet) {
    return <div className="p-8 text-center text-[#64748B]">{t('petProfile.notFound', 'Pet not found.')}</div>;
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
                  {translateDynamic(pet.breed || pet.species || 'Pet', i18n.language)}
                </span>
              </div>
              <div className="text-sm text-[#64748B] mt-2 font-medium">
                {pet.gender ? pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1) : t('common.unknown', 'Unknown')} • {pet.age ? `${pet.age} ${t('petProfile.yearsOld', 'Years Old')}` : t('petProfile.ageNA', 'Age N/A')} • {pet.weight ? `${pet.weight} kg` : t('petProfile.weightNA', 'Weight N/A')}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-2">
            <button 
              onClick={() => navigate(`/pets/${petId}/edit`)} 
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-[#0046CE] hover:bg-[#003DA8] text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition shadow-sm"
            >
              <Edit2 size={15} />
              {t('petProfile.editProfile', 'Edit Profile')}
            </button>
            <button 
              onClick={handleDelete} 
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-xl px-5 py-2.5 text-sm font-semibold transition"
            >
              <Trash2 size={15} />
              {t('petProfile.deletePet', 'Delete Pet')}
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
            {t('petProfile.healthRecords', 'Health records')}
          </button>
          <button 
            onClick={() => setActiveTab('reminders')} 
            className={`pb-3 border-b-2 text-sm font-semibold transition-all ${
              activeTab === 'reminders' 
                ? 'border-[#0046CE] text-[#0046CE]' 
                : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            {t('petProfile.reminders', 'Reminders')}
          </button>
          <button 
            onClick={() => setActiveTab('appointments')} 
            className={`pb-3 border-b-2 text-sm font-semibold transition-all ${
              activeTab === 'appointments' 
                ? 'border-[#0046CE] text-[#0046CE]' 
                : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            {t('petProfile.appointments', 'Appointments')}
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
                    {t('petProfile.vaccinationHistory', 'Vaccination History')}
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={() => navigate(`/pets/${petId}/records/new`)}
                      className="bg-[#0046CE] hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition"
                    >
                      {t('petProfile.addRecord', '+ Add record manually')}
                    </button>
                    <button 
                      onClick={handleDownloadPDF} 
                      className="flex items-center gap-1.5 border border-[#0046CE] text-[#0046CE] hover:bg-blue-50 rounded-xl px-4 py-2 text-sm font-semibold transition"
                    >
                      <Download size={14} /> {t('petProfile.downloadPDF', 'Download PDF')}
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
                            <h3 className="font-semibold text-[#1E293B] text-base">{translateDynamic(record.title, i18n.language)}</h3>
                            <p className="text-xs text-[#64748B] mt-0.5">{translateDynamic(record.description || record.vetName || t('petProfile.defaultVet', 'Administered at PetCare Clinic'), i18n.language)}</p>
                            <p className="text-xs text-[#64748B] mt-1">{formatDate(record.date)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isDone ? (
                              <span className="bg-[#E6F4EA] text-[#137333] text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                                ✓ {t('petProfile.done', 'Done')}
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="bg-[#FEF7E0] text-[#B06000] text-xs font-semibold px-3 py-1 rounded-full">
                                  {t('petProfile.dueSoon', 'Due soon')}
                                </span>
                                <button 
                                  onClick={() => navigate('/vets')} 
                                  className="bg-[#0046CE] hover:bg-[#003DA8] text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
                                >
                                  {t('petProfile.bookNow', 'Book now')}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="border border-dashed border-[#E2E8F0] rounded-xl p-10 text-center text-sm text-[#64748B] bg-white">
                      {t('petProfile.noRecords', 'No health records found. Add one manually or consult your vet.')}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Right (col-span-1) */}
            <div className="lg:col-span-1 space-y-4">
              {/* Primary Vet card */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
                <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest mb-3">{t('petProfile.primaryVet', 'Primary Vet')}</p>
                <div className="flex items-center gap-3">
                  <Avatar
                    src={(() => { const p = pet.savedVet?.profilePhoto || pet.savedVet?.imageUrl || pet.primaryVet?.profilePhoto || pet.primaryVet?.imageUrl; return p ? getImageUrl(p) : undefined; })()}
                    name={pet.savedVet?.name || pet.primaryVet?.name || 'Dr. Anita Rai'}
                    size="lg"
                  />
                  <div>
                    <div className="font-semibold text-[#1E293B] text-sm">{pet.savedVet?.name || pet.primaryVet?.name || 'Dr. Anita Rai'}</div>
                    <div className="text-xs text-[#64748B]">{translateDynamic(pet.savedVet?.clinicName || pet.primaryVet?.clinicName || 'Happy Paws Clinic, Lalitpur', i18n.language)}</div>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/vets')} 
                  className="w-full mt-4 border border-[#0046CE] text-[#0046CE] hover:bg-blue-50 rounded-xl py-2.5 text-sm font-semibold transition bg-transparent"
                >
                  {t('petProfile.bookAppointment', 'Book Appointment')}
                </button>
              </div>

              {/* Tip Card */}
              {tipArticle ? (
                <div
                  className="bg-gradient-to-br from-[#4F46E5] to-[#6366F1] text-white rounded-2xl p-5 shadow-sm relative overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/articles/${tipArticle._id}`)}
                >
                  <span className="inline-block bg-white text-[#4F46E5] text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 uppercase tracking-wider">
                    {translateDynamic(tipArticle.category, i18n.language) || t('petProfile.tipLabel', 'Tip')}
                  </span>
                  <h3 className="font-bold text-white text-sm line-clamp-2">{translateDynamic(tipArticle.title, i18n.language)}</h3>
                  <p className="text-xs text-white/85 mt-1.5 leading-relaxed line-clamp-2">
                    {translateDynamic(tipArticle.summary || tipArticle.excerpt || tipArticle.content?.slice(0, 100), i18n.language)}
                  </p>
                  <div className="text-xs text-white hover:text-white/90 mt-3 flex items-center gap-1 font-semibold underline">
                    {t('petProfile.readArticle', 'Read article')} <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-[#4F46E5] to-[#6366F1] text-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
                  <span className="inline-block bg-white text-[#4F46E5] text-[10px] font-bold px-2 py-0.5 rounded-full mb-3 uppercase tracking-wider">{t('petProfile.tipLabel', 'Tip')}</span>
                  <h3 className="font-bold text-white text-base">{t('petProfile.careTip', 'Care Tip')}</h3>
                  <p className="text-sm text-white/90 mt-1.5 leading-relaxed font-medium">
                    {t('petProfile.careTipDesc', 'Keep your pet healthy with regular vet check-ups and a balanced diet.')}
                  </p>
                  <div
                    onClick={() => navigate('/articles')}
                    className="text-xs text-white hover:text-white/90 mt-4 flex items-center gap-1 cursor-pointer font-semibold underline"
                  >
                    {t('petProfile.readMoreArticles', 'Read more articles')} <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}
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
                {t('petProfile.setNewReminder', '+ Set new reminder')}
              </button>
            </div>
            
            <h2 className="text-xl font-bold text-[#1E293B] mt-4" style={{ fontFamily: 'Literata, serif' }}>{t('petProfile.activeReminders', 'Active Reminders')}</h2>
            
            <div className="space-y-3 mt-3">
              {activeReminders.length > 0 ? activeReminders.map((reminder) => (
                <div key={reminder._id || reminder.id} className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm hover:shadow-md transition flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <Bell className="w-5 h-5 text-[#0046CE] shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#1E293B] truncate">{translateDynamic(reminder.title, i18n.language)}</h3>
                      <div className="text-sm text-[#64748B] flex items-center gap-1 mt-0.5">
                        <CalendarIcon className="w-3.5 h-3.5" /> {formatDate(reminder.dueDate)}
                      </div>
                      {(reminder.notifyVia || []).filter(v => v !== 'push').length > 0 && (
                        <div className="text-sm text-[#64748B] flex items-center gap-1 mt-0.5">
                          <Mail className="w-3.5 h-3.5" /> {t('petProfile.notifyViaEmail', 'Notify via email')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => navigate(`/reminders/new?petId=${petId}`, { state: { reminder, from: location.pathname } })} className="text-[#64748B] hover:text-[#1E293B]"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteReminder(reminder._id || reminder.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              )) : (
                <div className="border border-dashed border-[#E2E8F0] rounded-xl p-6 text-center text-sm text-[#64748B] bg-white">
                  {t('petProfile.noReminders', 'No active reminders. Add one to keep track of medications or events.')}
                </div>
              )}
            </div>

          </div>
        )}

        {/* APPOINTMENTS TAB */}
        {activeTab === 'appointments' && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>{t('petProfile.appointmentsTitle', 'Appointments')}</h2>
            <div className="mt-4 space-y-4">
              {appointments.length > 0 ? appointments.map((appointment) => (
                <Card key={appointment._id || appointment.id} className="p-4 shadow-sm hover:shadow-md transition">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-[#64748B]">
                        {translateDynamic(appointment.vetId?.clinicName || appointment.vet?.clinicName || appointment.vetName, i18n.language) || '—'}
                      </p>
                      <h3 className="font-semibold text-[#1E293B]">
                        {appointment.vetId?.name
                          ? (appointment.vetId.name.startsWith('Dr') ? appointment.vetId.name : `Dr. ${appointment.vetId.name}`)
                          : appointment.vet?.name
                          ? (appointment.vet.name.startsWith('Dr') ? appointment.vet.name : `Dr. ${appointment.vet.name}`)
                          : appointment.vetName || t('petProfile.vetVisit', 'Vet visit')}
                      </h3>
                      <div className="text-sm text-[#475569] flex flex-wrap gap-2 items-center">
                        <span>{formatDate(appointment.date || appointment.appointmentDate)}</span>
                        <span>•</span>
                        <span>{appointment.timeSlot || appointment.time || t('petProfile.timePending', 'Time pending')}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:items-end">
                      <span className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap ${
                        getStatusTone(appointment.status) === 'success' ? 'bg-[#F0FDF4] text-[#166534]' : 
                        getStatusTone(appointment.status) === 'warning' ? 'bg-[#FFFBEB] text-[#92400E]' : 
                        'bg-[#FEF2F2] text-[#B91C1C]'
                      }`}>
                        {t(`status.${appointment.status || 'pending'}`, appointment.status || t('petProfile.pending', 'Pending'))}
                      </span>
                      <p className="text-sm text-[#475569]">{t('petProfile.fee', 'Fee:')} {formatCurrency(appointment.fee)}</p>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" size="sm" onClick={() => navigate(`/appointments/${appointment._id || appointment.id}`)}>
                          {t('petProfile.viewDetails', 'View details')}
                        </Button>
                        {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                          <Button variant="danger" size="sm" onClick={() => handleAppointmentCancel(appointment._id || appointment.id)}>
                            {t('common.cancel', 'Cancel')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )) : (
                <div className="border border-dashed border-[#E2E8F0] rounded-xl p-6 text-center text-sm text-[#64748B] bg-white">
                  {t('petProfile.noAppointments', 'No past or upcoming appointments found.')}
                </div>
              )}
            </div>
          </div>
        )}

      </div>



    </div>
  );
}
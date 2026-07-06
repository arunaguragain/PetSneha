import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card, Skeleton } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { getAppointments, getPets, getPetReminders } from '../../api/pet.api';
import { getArticles } from '../../api/content.api';
import { getErrorMessage, getPetEmoji, unwrapItems } from '../../utils/api';
import { getSavedVet } from '../../utils/ownerState';
import { useToast } from '../../context/ToastContext';
import { AlertTriangle, AlertCircle, Bell, Calendar, CalendarDays, ChevronRight, Clock, Pencil, Plus, MapPin, Phone, Heart, Star, ShoppingCart, MoreHorizontal, Syringe, ClipboardList, Dumbbell, BookOpen, Utensils, PawPrint, Newspaper } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [articles, setArticles] = useState([]);
  const [seasonalArticle, setSeasonalArticle] = useState(null);
  const [error, setError] = useState('');
  const [savedVet, setSavedVet] = useState(null);

  const getPhotoUrl = (photoSrc) => {
    if (!photoSrc) return '';
    if (photoSrc.startsWith('http')) return photoSrc;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5050/api').replace('/api', '');
    return `${baseUrl}${photoSrc}`;
  };

  const getSpeciesBadgeClass = (species) => {
    const sp = String(species || '').toLowerCase();
    if (sp === 'dog') return 'bg-[#EFF6FF] text-[#0046CE]';
    if (sp === 'cat') return 'bg-[#F5F3FF] text-[#7C3AED]';
    return 'bg-[#F1F5F9] text-[#475569]';
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [petsResponse, appointmentsResponse] = await Promise.all([getPets(), getAppointments()]);
        
        const petsList = petsResponse.data?.pets
          || petsResponse.data?.items
          || (Array.isArray(petsResponse.data) ? petsResponse.data : petsResponse || []);
        setPets(petsList);

        const appointmentsList = appointmentsResponse.data?.appointments
          || appointmentsResponse.data?.items
          || (Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data : appointmentsResponse || []);
        setAppointments(appointmentsList);

        if (petsList.length > 0) {
          const remindersPromises = petsList.map(pet => getPetReminders(pet._id || pet.id).catch(() => null));
          const remindersResponses = await Promise.all(remindersPromises);
          const allReminders = remindersResponses.flatMap((res, index) => {
            if (!res) return [];
            const items = unwrapItems(res);
            return items.map(item => ({ ...item, petName: petsList[index].name }));
          });
          setReminders(allReminders);
        }

        setSavedVet(getSavedVet());

        // Fetch latest 3 published articles for sidebar
        try {
          const artRes = await getArticles({ limit: 3, status: 'published' });
          const artList = artRes?.data?.articles || artRes?.data?.items || artRes?.data || [];
          setArticles(Array.isArray(artList) ? artList.slice(0, 3) : []);
        } catch (_) {
          // non-critical — leave articles empty
        }

        // Fetch specific Seasonal Alert article
        try {
          const seasonRes = await getArticles({ limit: 50 }); // Fetch enough to find it
          const seasonList = seasonRes?.data?.articles || seasonRes?.data?.items || seasonRes?.data || [];
          if (Array.isArray(seasonList)) {
            const monsoonArticle = seasonList.find(a => a.title?.includes('Monsoon-Safe'));
            if (monsoonArticle) {
              setSeasonalArticle(monsoonArticle);
            }
          }
        } catch (_) {}
      } catch (apiError) {
        const message = getErrorMessage(apiError);
        setError(message);
        addToast(message, 'danger');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [addToast]);

  const upcomingAppointments = useMemo(
    () => {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      return [...appointments]
        .filter((appointment) => {
          const statusOk = ['pending', 'confirmed', 'scheduled'].includes(String(appointment.status).toLowerCase());
          const apptDate = new Date(appointment.date || appointment.appointmentDate || 0);
          return statusOk && apptDate >= startOfToday;
        })
        .sort((left, right) => new Date(left.date || left.appointmentDate || 0) - new Date(right.date || right.appointmentDate || 0))
        .slice(0, 3);
    },
    [appointments],
  );

  const upcomingVaccination = useMemo(() => {
    return reminders
      .filter(r => r.title?.toLowerCase().includes('vaccin') && new Date(r.dueDate) >= new Date())
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
  }, [reminders]);

  const pendingAlerts = useMemo(() => {
    return reminders.filter(r => new Date(r.dueDate) < new Date());
  }, [reminders]);

  const petNames = pets.length > 0 ? pets.map((p) => p.name).join(' and ') : 'your furry friends';

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1440px] mx-auto px-8 py-10">
        {error && !error.includes('422') && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm px-5 py-4 rounded-2xl flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Top Banner */}
        <div className="bg-[#0046CE] rounded-2xl px-8 pt-8 pb-20 flex items-center justify-between">
          <div>
            <h2
              className="text-3xl font-semibold text-white"
              style={{ fontFamily: 'Literata, serif' }}
            >
              {t('dashboard.welcomeBack')}, {user?.name || 'Pet parent'}
            </h2>
            <p className="text-sm text-white/70 mt-1.5">
              Here's an overview for {petNames}.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/emergency')}
              className="flex items-center gap-2 bg-white border border-[#FCA5A5] text-[#DC2626] hover:bg-red-50 rounded-xl px-5 py-2.5 text-sm font-semibold transition"
            >
              <AlertTriangle size={15} />
              Emergency
            </button>
            <button
              onClick={() => navigate('/vets')}
              className="flex items-center gap-2 bg-transparent text-white border border-white/80 hover:bg-white/10 rounded-xl px-5 py-2.5 text-sm font-semibold transition"
            >
              <Calendar size={15} />
              {t('buttons.bookAppointment')}
            </button>
          </div>
        </div>

        {/* 3 Stat Cards overlapping the banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-12 relative z-10 px-4">
          {/* Card 1 — Next Vaccination */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl px-6 py-5 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest">
                {t('pets.vaccinations')}
              </p>
              <p
                className="text-xl font-semibold text-[#1E293B] mt-3"
                style={{ fontFamily: 'Literata, serif' }}
              >
                {upcomingVaccination ? `${upcomingVaccination.petName || 'Pet'}: Upcoming` : 'No upcoming'}
              </p>
              <p className="text-sm text-[#64748B] mt-1">{upcomingVaccination ? new Date(upcomingVaccination.dueDate).toLocaleDateString() : (pets.length > 0 ? 'All up to date' : 'Add a pet first')}</p>
            </div>
            <div className="text-[#0046CE] flex-shrink-0 mt-1">
              <Syringe size={22} />
            </div>
          </div>

          {/* Card 2 — Upcoming Appointments */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl px-6 py-5 shadow-sm flex items-start justify-between">
            <div className="flex-1 pr-4">
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest">
                UPCOMING APPOINTMENTS
              </p>
              <p
                className="text-xl font-semibold text-[#1E293B] mt-3"
                style={{ fontFamily: 'Literata, serif' }}
              >
                {upcomingAppointments.length} Upcoming
              </p>
              <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-[#0046CE] rounded-full" style={{ width: upcomingAppointments.length > 0 ? '100%' : '0%' }}></div>
              </div>
            </div>
            <div className="text-[#0046CE] flex-shrink-0 mt-1">
              <ClipboardList size={22} />
            </div>
          </div>

          {/* Card 3 — Alerts */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl px-6 py-5 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest">
                PENDING ALERTS
              </p>
              <p
                className="text-xl font-semibold text-[#1E293B] mt-3"
                style={{ fontFamily: 'Literata, serif' }}
              >
                {pendingAlerts.length} Alert{pendingAlerts.length !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-[#64748B] mt-1">
                {pendingAlerts.length > 0 ? pendingAlerts[0].title : 'All caught up!'}
              </p>
            </div>
            <div className="text-[#0046CE] flex-shrink-0 mt-1">
              <Bell size={22} />
            </div>
          </div>
        </div>

        {/* Seasonal Tip Banner */}
        <div className="mt-6 bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl px-7 py-6">
          <span className="bg-[#0046CE] text-white text-[11px] font-bold px-3 py-1 rounded-full tracking-wide">
            SEASONAL TIP
          </span>
          <p
            className="text-[#0046CE] font-semibold text-lg mt-3"
            style={{ fontFamily: 'Literata, serif' }}
          >
            {seasonalArticle?.title || 'Monsoon-Safe Walking Routes and Times'}
          </p>
          <p className="text-sm text-[#475569] mt-1.5 max-w-2xl leading-relaxed">
            {seasonalArticle?.summary || seasonalArticle?.excerpt || 'Reducing infection risk while still exercising your dog in the rain.'}
          </p>
          <button
            onClick={() => seasonalArticle ? navigate(`/articles/${seasonalArticle._id || seasonalArticle.id}`) : navigate('/articles')}
            className="mt-3.5 text-sm text-[#0046CE] font-semibold flex items-center gap-1 hover:gap-2 transition-all"
          >
            Read Article <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* LEFT — col-span-2 */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Pets */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-xl font-semibold text-[#1E293B]"
                  style={{ fontFamily: 'Literata, serif' }}
                >
                  {t('dashboard.myPets')}
                </h3>
                <button
                  onClick={() => navigate('/pets/new')}
                  className="flex items-center gap-1.5 text-sm text-[#0046CE] font-medium hover:bg-[#EFF6FF] px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus size={16} />
                  {t('pets.addPet')}
                </button>
              </div>

              {pets.length === 0 ? (
                /* Empty state */
                <div className="bg-white border-2 border-dashed border-[#BFDBFE] rounded-2xl py-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] flex items-center justify-center text-[#0046CE]">
                    <PawPrint size={28} />
                  </div>
                  <p className="text-sm font-medium text-[#64748B]">{t('pets.noPets')}</p>
                  <button
                    onClick={() => navigate('/pets/new')}
                    className="mt-1 bg-[#0046CE] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#003DA8] transition"
                  >
                    + {t('pets.addPet')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pets.map(pet => {
                    const photoUrl = getPhotoUrl(pet.photo || pet.imageUrl);
                    return (
                      <div
                        key={pet._id || pet.id}
                        onClick={() => navigate(`/pets/${pet._id || pet.id}`)}
                        className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex items-center gap-4 shadow-sm cursor-pointer hover:shadow-md hover:border-[#BFDBFE] transition-all"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] overflow-hidden flex-shrink-0">
                          {photoUrl ? (
                            <img src={photoUrl} className="w-full h-full object-cover" alt={pet.name} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#0046CE]">
                              <PawPrint size={28} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#1E293B] truncate">{pet.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getSpeciesBadgeClass(pet.species)}`}>
                              {pet.species || 'PET'}
                            </span>
                            <span className="text-xs text-[#64748B]">
                              {pet.age ? `${pet.age} Years` : ''}
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-[#CBD5E1] flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Upcoming Events */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-xl font-semibold text-[#1E293B]"
                  style={{ fontFamily: 'Literata, serif' }}
                >
                  {t('appointments.upcomingAppointments')}
                </h3>
                <button
                  onClick={() => navigate('/records')}
                  className="text-sm text-[#0046CE] font-semibold hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {upcomingAppointments?.length === 0 || !upcomingAppointments ? (
                  <div className="bg-white border border-dashed border-[#E2E8F0] rounded-2xl py-10 text-center">
                    <p className="text-sm text-[#64748B]">{t('appointments.noAppointments')}</p>
                  </div>
                ) : (
                  upcomingAppointments.map((apt, i) => {
                    const dateObj = new Date(apt.date || apt.appointmentDate);
                    const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
                    const day = dateObj.getDate().toString().padStart(2, '0');
                    const petName = apt.petId?.name || apt.petName || 'Pet';
                    const clinicName = apt.vetId?.clinicName || apt.vetId?.name || apt.vetName || 'Clinic';
                    return (
                    <div
                      key={apt._id || i}
                      onClick={() => navigate(`/appointments/${apt._id || apt.id}`)}
                      className="bg-white border border-[#E2E8F0] rounded-2xl px-5 py-4 flex items-center gap-5 shadow-sm hover:shadow-md transition cursor-pointer"
                    >
                      <div className="bg-[#EFF6FF] rounded-xl px-3 py-2 text-center min-w-[56px] flex-shrink-0">
                        <p className="text-[10px] font-bold text-[#0046CE] uppercase tracking-wide">
                          {month}
                        </p>
                        <p className="text-2xl font-bold text-[#0046CE] leading-tight">
                          {day}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1E293B] truncate">{apt.reason || 'Appointment'}</p>
                        <p className="text-xs text-[#64748B] mt-0.5 truncate">{petName} • {clinicName}</p>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <span className="w-2 h-2 rounded-full bg-[#0046CE]" />
                        <span className="w-2 h-2 rounded-full bg-[#0046CE]" />
                        <span className="w-2 h-2 rounded-full bg-[#E2E8F0]" />
                      </div>
                    </div>
                  )})
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — col-span-1 */}
          <div className="space-y-6">
            {/* Saved Vet */}
            <div>
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest mb-3">
                SAVED VETERINARIAN
              </p>
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] overflow-hidden flex-shrink-0 flex items-center justify-center text-[#0046CE] font-bold text-lg relative">
                    <img
                      src={savedVet?.profilePhoto || savedVet?.imageUrl ? getPhotoUrl(savedVet.profilePhoto || savedVet.imageUrl) : `/${savedVet?.name}.png`}
                      className="w-full h-full object-cover absolute inset-0"
                      alt={savedVet?.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <span>{(savedVet?.name ? savedVet.name.replace('Dr. ', '') : 'V')[0].toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1E293B] text-sm">
                      {savedVet?.name || 'No saved vet'}
                    </p>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {savedVet?.clinicName || savedVet?.clinic || 'Save a vet from directory'}
                    </p>
                  </div>
                </div>
                {savedVet?.nextAvailable && (
                  <div className="flex items-center gap-2 mt-4 text-xs text-[#64748B]">
                    <Clock size={13} />
                    <span>Next Available: {savedVet.nextAvailable}</span>
                  </div>
                )}
                <button className="w-full mt-4 bg-[#0046CE] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#003DA8] transition">
                  Call Now
                </button>
                <button
                  onClick={() => {
                    const id = savedVet?._id || savedVet?.id;
                    if (id) {
                      navigate(`/vets/${id}/book`);
                    } else {
                      navigate('/vets');
                    }
                  }}
                  className="w-full mt-2.5 border border-[#0046CE] text-[#0046CE] rounded-xl py-3 text-sm font-semibold hover:bg-[#EFF6FF] transition bg-transparent"
                >
                  Book →
                </button>
              </div>
            </div>

            {/* Articles */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-[#1E293B]">Articles</p>
                <button onClick={() => navigate('/articles')} className="text-xs text-[#0046CE] font-medium hover:underline">View all</button>
              </div>
              <div className="space-y-2.5">
                {articles.length > 0 ? articles.map((article, i) => (
                  <div
                    key={article._id || article.id || i}
                    onClick={() => navigate(`/articles/${article._id || article.id}`)}
                    className="bg-white border border-[#E2E8F0] rounded-xl p-3.5 flex items-center gap-3 hover:shadow-sm hover:border-[#BFDBFE] transition cursor-pointer"
                  >
                    <div className={`w-10 h-10 ${i === 0 ? 'bg-[#475569]' : 'bg-[#0046CE]'} text-white rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <BookOpen size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1E293B] truncate">{article.title}</p>
                      <p className="text-xs text-[#64748B] mt-0.5">{article.readTime ? `${article.readTime} min read` : 'Read now'}</p>
                    </div>
                  </div>
                )) : (
                  // Fallback placeholders while loading / if no articles yet
                  [{ title: 'Puppy Training 101', time: '5 min read', bg: 'bg-[#475569]' }, { title: 'Healthy Diet for Cats', time: '3 min read', bg: 'bg-[#0046CE]' }].map((a, i) => (
                    <div
                      key={i}
                      onClick={() => navigate('/articles')}
                      className="bg-white border border-[#E2E8F0] rounded-xl p-3.5 flex items-center gap-3 hover:shadow-sm transition cursor-pointer"
                    >
                      <div className={`w-10 h-10 ${a.bg} text-white rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <BookOpen size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1E293B]">{a.title}</p>
                        <p className="text-xs text-[#64748B] mt-0.5">{a.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
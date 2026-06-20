import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  FileSpreadsheet, 
  BookOpen, 
  MessageSquare, 
  User, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Send, 
  Star,
  Clock,
  MapPin,
  Stethoscope,
  Briefcase,
  DollarSign,
  Heart,
  TrendingUp,
  Users,
  CheckCircle,
  AlertTriangle,
  Award,
  ChevronLeft,
  ChevronRight,
  Wifi,
  WifiOff
} from 'lucide-react';
import { 
  Avatar, 
  Badge, 
  Button, 
  Card, 
  Skeleton, 
  InfoBox, 
  Input, 
  Textarea, 
  Select, 
  StarRating 
} from '../../components/ui';
import { 
  getVetDashboard, 
  getVetAppointments, 
  confirmAppointment, 
  completeAppointment, 
  vetCancelAppointment, 
  toggleVetStatus, 
  submitVetArticle, 
  getMyVetArticles,
  replyToReview 
} from '../../api/vetDashboard.api';
import { updateVetProfile } from '../../api/vet.api';
import { getErrorMessage, formatDate } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../hooks/useAuth';

export default function VetDashboardPage({ defaultTab = 'dashboard' }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [articles, setArticles] = useState([]);
  
  // Form states
  const [articleForm, setArticleForm] = useState({ title: '', content: '', summary: '', petType: [], tags: [], readTime: 5 });
  const [submittingArticle, setSubmittingArticle] = useState(false);
  const [replyTexts, setReplyTexts] = useState({});
  const [replyingToId, setReplyingToId] = useState(null);
  
  // Clinical Record states
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  const [clinicalRecordForm, setClinicalRecordForm] = useState({
    diagnosis: '',
    treatment: '',
    notes: '',
    nextDueDate: '',
    prescriptions: [{ medicine: '', dosage: '', duration: '' }]
  });
  const [submittingRecord, setSubmittingRecord] = useState(false);

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    specialisation: '',
    clinicName: '',
    location: '',
    consultationFee: 0,
    bio: '',
    yearsExperience: 0,
    availability: {
      days: [],
      openTime: '09:00',
      closeTime: '17:00',
      is24Hours: false
    }
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Calendar States
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, apptsRes, articlesRes] = await Promise.all([
        getVetDashboard(),
        getVetAppointments(),
        getMyVetArticles()
      ]);

      const loadedDash = dashRes.data?.dashboard || dashRes.data?.item || dashRes.data || dashRes;
      setDashboard(loadedDash);

      const apptsList = apptsRes.data?.appointments || apptsRes.data?.items || (Array.isArray(apptsRes.data) ? apptsRes.data : apptsRes || []);
      setAppointments(apptsList);

      const articlesList = articlesRes.data?.articles || articlesRes.data?.items || (Array.isArray(articlesRes.data) ? articlesRes.data : articlesRes || []);
      setArticles(articlesList);

      if (loadedDash?.vet) {
        const v = loadedDash.vet;
        setProfileForm({
          name: v.name || '',
          specialisation: v.specialisation || '',
          clinicName: v.clinicName || '',
          location: v.location || '',
          consultationFee: v.consultationFee || 0,
          bio: v.bio || '',
          yearsExperience: v.yearsExperience || 0,
          availability: v.availability || { days: [], openTime: '09:00', closeTime: '17:00', is24Hours: false }
        });
      }
    } catch (err) {
      addToast(getErrorMessage(err), 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusToggle = async () => {
    try {
      await toggleVetStatus();
      addToast('Online status updated successfully', 'success');
      loadData();
    } catch (err) {
      addToast(getErrorMessage(err), 'danger');
    }
  };

  const handleConfirm = async (id) => {
    try {
      await confirmAppointment(id);
      addToast('Appointment confirmed', 'success');
      loadData();
    } catch (err) {
      addToast(getErrorMessage(err), 'danger');
    }
  };

  const handleCancel = async (id) => {
    const reason = window.prompt('Please enter cancellation reason:');
    if (reason === null) return;
    try {
      await vetCancelAppointment(id, reason || 'Cancelled by vet');
      addToast('Appointment cancelled successfully', 'success');
      loadData();
    } catch (err) {
      addToast(getErrorMessage(err), 'danger');
    }
  };

  const handlePublishArticle = async (e) => {
    e.preventDefault();
    if (!articleForm.title || !articleForm.content) {
      addToast('Title and content are required', 'danger');
      return;
    }
    try {
      setSubmittingArticle(true);
      await submitVetArticle(articleForm);
      addToast('Practitioner knowledge article published draft successfully', 'success');
      setArticleForm({ title: '', content: '', summary: '', petType: [], tags: [], readTime: 5 });
      const articlesRes = await getMyVetArticles();
      setArticles(articlesRes.data?.articles || articlesRes.data?.items || (Array.isArray(articlesRes.data) ? articlesRes.data : articlesRes || []));
    } catch (err) {
      addToast(getErrorMessage(err), 'danger');
    } finally {
      setSubmittingArticle(false);
    }
  };

  const handleSendReply = async (reviewId) => {
    const replyText = replyTexts[reviewId];
    if (!replyText) {
      addToast('Please type a reply first', 'danger');
      return;
    }
    if (!dashboard?.vet?._id) {
      addToast('Vet profile not loaded', 'danger');
      return;
    }
    try {
      setReplyingToId(reviewId);
      await replyToReview(dashboard.vet._id, reviewId, replyText);
      addToast('Reply submitted successfully', 'success');
      setReplyTexts(prev => ({ ...prev, [reviewId]: '' }));
      loadData();
    } catch (err) {
      addToast(getErrorMessage(err), 'danger');
    } finally {
      setReplyingToId(null);
    }
  };

  const handleApplyTemplate = (reviewId, template) => {
    setReplyTexts(prev => ({ ...prev, [reviewId]: template }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!dashboard?.vet?._id) return;
    try {
      setUpdatingProfile(true);
      await updateVetProfile(dashboard.vet._id, profileForm);
      addToast('Profile and settings updated successfully', 'success');
      loadData();
    } catch (err) {
      addToast(getErrorMessage(err), 'danger');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const addPrescriptionRow = () => {
    setClinicalRecordForm(prev => ({
      ...prev,
      prescriptions: [...prev.prescriptions, { medicine: '', dosage: '', duration: '' }]
    }));
  };

  const removePrescriptionRow = (index) => {
    const updated = [...clinicalRecordForm.prescriptions];
    updated.splice(index, 1);
    setClinicalRecordForm(prev => ({ ...prev, prescriptions: updated }));
  };

  const updatePrescriptionRow = (index, field, val) => {
    const updated = [...clinicalRecordForm.prescriptions];
    updated[index][field] = val;
    setClinicalRecordForm(prev => ({ ...prev, prescriptions: updated }));
  };

  const handleSubmitClinicalRecord = async (e) => {
    e.preventDefault();
    if (!selectedAppointmentId) {
      addToast('Please select a patient appointment', 'danger');
      return;
    }
    try {
      setSubmittingRecord(true);
      const notesParts = [
        clinicalRecordForm.notes,
        clinicalRecordForm.prescriptions.map(p => `${p.medicine} (${p.dosage}) for ${p.duration}`).filter(p => p.trim() !== ' () for ').join(', ')
      ].filter(Boolean);
      const combinedNotes = notesParts.join('\nPrescriptions: ');

      await completeAppointment(selectedAppointmentId, {
        diagnosis: clinicalRecordForm.diagnosis,
        treatment: clinicalRecordForm.treatment,
        notes: combinedNotes,
        nextDueDate: clinicalRecordForm.nextDueDate || undefined
      });
      addToast('Clinical record entry saved & appointment completed', 'success');
      setSelectedAppointmentId('');
      setClinicalRecordForm({
        diagnosis: '',
        treatment: '',
        notes: '',
        nextDueDate: '',
        prescriptions: [{ medicine: '', dosage: '', duration: '' }]
      });
      loadData();
    } catch (err) {
      addToast(getErrorMessage(err), 'danger');
    } finally {
      setSubmittingRecord(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    return { firstDay, days };
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
  };

  const toggleDaySelection = (day) => {
    const days = [...profileForm.availability.days];
    const idx = days.indexOf(day);
    if (idx > -1) {
      days.splice(idx, 1);
    } else {
      days.push(day);
    }
    setProfileForm(prev => ({
      ...prev,
      availability: { ...prev.availability, days }
    }));
  };

  const { firstDay, days } = getDaysInMonth(currentDate);
  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(null);
  }
  for (let i = 1; i <= days; i++) {
    calendarCells.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const getAppointmentsForDate = (date) => {
    return appointments.filter(appt => {
      const apptDate = new Date(appt.date);
      return apptDate.getDate() === date.getDate() &&
             apptDate.getMonth() === date.getMonth() &&
             apptDate.getFullYear() === date.getFullYear();
    });
  };

  const isVetOnline = dashboard?.vet?.isOpenNow;
  const ratingAvg = dashboard?.vet?.rating || 0;
  const reviewsList = dashboard?.vet?.reviews || [];

  const trustScoreProgress = dashboard?.vet?.isVerified ? 100 : 45;

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'appointments', label: 'Schedule & Calendar', icon: Calendar },
    { id: 'records', label: 'Clinical Entry', icon: FileSpreadsheet },
    { id: 'articles', label: 'Knowledge Hub', icon: BookOpen },
    { id: 'reviews', label: 'Patient Reviews', icon: MessageSquare },
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'credentials', label: 'Credentials', icon: ShieldCheck },
  ];

  if (loading && !dashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="text-center space-y-3">
          <Skeleton className="mx-auto h-12 w-12 rounded-full" />
          <p className="animate-pulse font-semibold text-[#0046CE]">Syncing VetStream Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-[#F8FAFC]">
      {/* VetStream Left Workspace Sidebar */}
      <aside className="w-72 bg-white border-r border-[#E2E8F0] flex flex-col justify-between shrink-0">
        <div>
          {/* Header Info */}
          <div className="p-6 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar name={dashboard?.vet?.name || 'Dr.'} size="lg" className="border-2 border-[#0046CE]/10" />
                <span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${isVetOnline ? 'bg-success' : 'bg-danger'}`} />
              </div>
              <div className="overflow-hidden">
                <h4 className="font-semibold text-neutral-900 truncate">{dashboard?.vet?.name || 'Veterinary Surgeon'}</h4>
                <p className="text-xs text-neutral-500 truncate">{dashboard?.vet?.specialisation || 'General Practice'}</p>
              </div>
            </div>
            
            {/* Quick Status toggle */}
            <div className="mt-5 flex items-center justify-between bg-neutral-50 rounded-xl p-3 border border-[#E2E8F0]">
              <span className="text-xs font-semibold text-neutral-600 flex items-center gap-2">
                {isVetOnline ? <Wifi className="h-3.5 w-3.5 text-success animate-pulse" /> : <WifiOff className="h-3.5 w-3.5 text-neutral-400" />}
                {isVetOnline ? 'Receiving Bookings' : 'Offline'}
              </span>
              <button 
                onClick={handleStatusToggle}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isVetOnline ? 'bg-success' : 'bg-neutral-300'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isVetOnline ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {sidebarItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    isActive 
                      ? 'bg-[#0046CE]/10 text-[#0046CE]' 
                      : 'text-neutral-600 hover:bg-[#F8FAFC] hover:text-neutral-950'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-[#0046CE]' : 'text-neutral-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footnote branding */}
        <div className="p-6 border-t border-[#E2E8F0]">
          <p className="text-xs text-center text-neutral-400 font-semibold">VETSTREAM workspace v1.0</p>
        </div>
      </aside>

      {/* Main Workspace Workspace */}
      <main className="flex-1 p-10 overflow-y-auto">
        
        {/* Verification banner if not verified */}
        {dashboard?.vet && !dashboard.vet.isVerified && (
          <div className="mb-8 p-4 bg-danger-50 border border-danger-200 rounded-2xl flex items-start gap-4">
            <div className="p-2.5 bg-danger-100 rounded-xl text-danger-700">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h5 className="font-bold text-danger-900">Credential Verification Pending</h5>
              <p className="text-sm text-danger-700 mt-1">
                Your medical license credentials are being verified by PetSneha admins. Some client booking features might be restricted until verification is complete.
              </p>
              <button onClick={() => setActiveTab('credentials')} className="mt-2 text-xs font-bold text-[#0046CE] hover:underline">
                View Verification Progress &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-4xl text-neutral-900 font-bold">Welcome back, {dashboard?.vet?.name || 'Practitioner'}</h1>
                <p className="text-neutral-500 mt-2">Here is a quick snapshot of your clinic's performance today.</p>
              </div>
            </div>

            {/* Stats Cards grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="p-6 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Scheduled Today</p>
                  <h3 className="font-display text-3xl font-bold text-neutral-900 mt-2">{dashboard?.todayAppointments?.length || 0}</h3>
                </div>
                <div className="p-3 bg-[#EFF6FF] text-[#0046CE] rounded-2xl">
                  <Calendar className="h-6 w-6" />
                </div>
              </Card>

              <Card className="p-6 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Pending Approvals</p>
                  <h3 className="font-display text-3xl font-bold text-neutral-900 mt-2">
                    {appointments.filter(a => a.status === 'pending').length}
                  </h3>
                </div>
                <div className="p-3 bg-warning-50 text-warning-700 rounded-2xl">
                  <Clock className="h-6 w-6" />
                </div>
              </Card>

              <Card className="p-6 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Average Rating</p>
                  <h3 className="font-display text-3xl font-bold text-neutral-900 mt-2 flex items-center gap-1.5">
                    {ratingAvg} <Star className="h-5 w-5 fill-warning text-warning" />
                  </h3>
                </div>
                <div className="p-3 bg-success-50 text-success-700 rounded-2xl">
                  <Heart className="h-6 w-6" />
                </div>
              </Card>

              <Card className="p-6 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Consultations</p>
                  <h3 className="font-display text-3xl font-bold text-neutral-900 mt-2">
                    {appointments.filter(a => a.status === 'completed').length}
                  </h3>
                </div>
                <div className="p-3 bg-neutral-50 text-[#0046CE] rounded-2xl">
                  <Users className="h-6 w-6" />
                </div>
              </Card>
            </div>

            {/* Performance Index & Simulated Chart */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2 p-6 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                  <div>
                    <h3 className="font-bold text-neutral-900 text-lg">Patient Visits Trends</h3>
                    <p className="text-xs text-neutral-500 mt-1">Overview of clinical consultations completed</p>
                  </div>
                  <Badge variant="primary" className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> +12.4% MoM
                  </Badge>
                </div>
                {/* Simulated Graph SVG */}
                <div className="h-64 mt-6 flex items-end justify-between gap-2 px-4 relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-x-0 top-0 border-t border-neutral-100" />
                  <div className="absolute inset-x-0 top-1/3 border-t border-neutral-100" />
                  <div className="absolute inset-x-0 top-2/3 border-t border-neutral-100" />
                  
                  {/* Columns */}
                  <div className="w-1/6 flex flex-col items-center gap-2 z-10">
                    <div className="w-full bg-neutral-200 rounded-t-lg h-24 transition-all hover:bg-[#0046CE]" />
                    <span className="text-xs font-semibold text-neutral-400">Mon</span>
                  </div>
                  <div className="w-1/6 flex flex-col items-center gap-2 z-10">
                    <div className="w-full bg-neutral-200 rounded-t-lg h-36 transition-all hover:bg-[#0046CE]" />
                    <span className="text-xs font-semibold text-neutral-400">Tue</span>
                  </div>
                  <div className="w-1/6 flex flex-col items-center gap-2 z-10">
                    <div className="w-full bg-[#0046CE]/70 rounded-t-lg h-48 transition-all hover:bg-[#0046CE]" />
                    <span className="text-xs font-semibold text-neutral-400">Wed</span>
                  </div>
                  <div className="w-1/6 flex flex-col items-center gap-2 z-10">
                    <div className="w-full bg-[#0046CE]/70 rounded-t-lg h-32 transition-all hover:bg-[#0046CE]" />
                    <span className="text-xs font-semibold text-neutral-400">Thu</span>
                  </div>
                  <div className="w-1/6 flex flex-col items-center gap-2 z-10">
                    <div className="w-full bg-[#0046CE] rounded-t-lg h-56 transition-all hover:bg-[#0046CE]-600" />
                    <span className="text-xs font-semibold text-neutral-400">Fri</span>
                  </div>
                  <div className="w-1/6 flex flex-col items-center gap-2 z-10">
                    <div className="w-full bg-neutral-300 rounded-t-lg h-16 transition-all hover:bg-[#0046CE]" />
                    <span className="text-xs font-semibold text-neutral-400">Sat</span>
                  </div>
                </div>
              </Card>

              {/* Clinic Performance card */}
              <Card className="p-6 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-neutral-900 text-lg">Clinic Performance</h3>
                  <p className="text-xs text-neutral-500 mt-1">Insights on satisfaction & response rate</p>
                  
                  <div className="mt-8 space-y-4">
                    <div>
                      <div className="flex justify-between text-sm font-semibold text-neutral-700">
                        <span>Appointment Success Rate</span>
                        <span>94%</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-2 rounded-full mt-2">
                        <div className="bg-success h-full rounded-full" style={{ width: '94%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm font-semibold text-neutral-700">
                        <span>Average Consultation Duration</span>
                        <span>22 mins</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-2 rounded-full mt-2">
                        <div className="bg-[#0046CE] h-full rounded-full" style={{ width: '75%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm font-semibold text-neutral-700">
                        <span>Patient Feedback Rate</span>
                        <span>82%</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-2 rounded-full mt-2">
                        <div className="bg-warning h-full rounded-full" style={{ width: '82%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-100 mt-6">
                  <Button variant="secondary" fullWidth onClick={() => setActiveTab('reviews')}>
                    Manage Patient Reviews
                  </Button>
                </div>
              </Card>
            </div>

            {/* Recent Appointments table */}
            <Card className="p-6 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl">
              <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0]">
                <div>
                  <h3 className="font-bold text-neutral-900 text-lg">Recent Appointments</h3>
                  <p className="text-xs text-neutral-500 mt-1">Pending and incoming patient visits</p>
                </div>
                <Button size="sm" as={Link} to="/vet/appointments">View Schedule</Button>
              </div>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] text-neutral-400 text-xs font-bold uppercase tracking-wider">
                      <th className="py-3 px-2">Patient Pet</th>
                      <th className="py-3 px-2">Owner Name</th>
                      <th className="py-3 px-2">Scheduled Date</th>
                      <th className="py-3 px-2">Time Slot</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.slice(0, 5).map((appt) => (
                      <tr key={appt._id} className="border-b border-neutral-100 hover:bg-[#F8FAFC]/50 transition">
                        <td className="py-3 px-2 font-semibold text-neutral-900 flex items-center gap-2">
                          <Avatar name={appt.pet?.name} size="sm" />
                          {appt.pet?.name || 'Unspecified'}
                        </td>
                        <td className="py-3 px-2 text-neutral-600">{appt.owner?.name || appt.user?.name || 'Owner'}</td>
                        <td className="py-3 px-2 text-neutral-600">{formatDate(appt.date)}</td>
                        <td className="py-3 px-2 text-neutral-600">{appt.timeSlot || 'Pending Slot'}</td>
                        <td className="py-3 px-2">
                          <Badge variant={
                            appt.status === 'confirmed' ? 'success' :
                            appt.status === 'completed' ? 'primary' :
                            appt.status === 'cancelled' ? 'danger' : 'neutral'
                          }>
                            {appt.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="inline-flex gap-2">
                            {appt.status === 'pending' && (
                              <Button size="sm" variant="success" className="px-3" onClick={() => handleConfirm(appt._id)}>Confirm</Button>
                            )}
                            {appt.status === 'confirmed' && (
                              <Button size="sm" className="px-3" onClick={() => {
                                setSelectedAppointmentId(appt._id);
                                setActiveTab('records');
                              }}>Diagnose</Button>
                            )}
                            {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                              <Button size="sm" variant="danger" className="px-3" onClick={() => handleCancel(appt._id)}>Cancel</Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {appointments.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-neutral-400">No appointments found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 2: Schedule & Calendar */}
        {activeTab === 'appointments' && (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Calendar Main Grid */}
            <Card className="lg:col-span-2 p-6 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                  <h3 className="font-bold text-neutral-900 text-lg">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-neutral-100 rounded-xl" onClick={() => changeMonth(-1)}>
                      <ChevronLeft className="h-5 w-5 text-neutral-600" />
                    </button>
                    <button className="p-2 hover:bg-neutral-100 rounded-xl" onClick={() => changeMonth(1)}>
                      <ChevronRight className="h-5 w-5 text-neutral-600" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 mt-6 text-center text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>

                <div className="grid grid-cols-7 gap-2 mt-2">
                  {calendarCells.map((dateCell, idx) => {
                    if (!dateCell) {
                      return <div key={`empty-${idx}`} className="h-20" />;
                    }
                    const isSelected = selectedDate.getDate() === dateCell.getDate() &&
                                       selectedDate.getMonth() === dateCell.getMonth() &&
                                       selectedDate.getFullYear() === dateCell.getFullYear();
                    const listForCell = getAppointmentsForDate(dateCell);
                    
                    return (
                      <button
                        key={dateCell.toISOString()}
                        onClick={() => setSelectedDate(dateCell)}
                        className={`h-20 border rounded-xl flex flex-col items-center justify-between p-1.5 transition ${
                          isSelected 
                            ? 'border-[#0046CE] bg-[#0046CE]/5 text-[#0046CE]' 
                            : 'border-neutral-200 hover:border-neutral-400 hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <span className="text-xs font-semibold">{dateCell.getDate()}</span>
                        {listForCell.length > 0 && (
                          <div className="flex gap-1 justify-center">
                            {listForCell.map((a, aIdx) => (
                              <span 
                                key={a._id || aIdx} 
                                className={`h-2 w-2 rounded-full ${
                                  a.status === 'confirmed' ? 'bg-success' : 'bg-warning'
                                }`} 
                              />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Sidebar "Today's Schedule" */}
            <Card className="p-6 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-neutral-900 text-lg">Schedule for {selectedDate.toDateString()}</h3>
                <p className="text-xs text-neutral-500 mt-1">Manage scheduled client bookings</p>

                <div className="mt-6 space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {getAppointmentsForDate(selectedDate).map((appt) => (
                    <div key={appt._id} className="border border-neutral-200 p-4 rounded-xl space-y-3 relative hover:border-[#0046CE]/40 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Avatar name={appt.pet?.name} size="sm" />
                          <div>
                            <p className="text-sm font-semibold text-neutral-900">{appt.pet?.name || 'Pet'}</p>
                            <p className="text-xs text-neutral-500">Owner: {appt.owner?.name || appt.user?.name || 'Owner'}</p>
                          </div>
                        </div>
                        <Badge variant={appt.status === 'confirmed' ? 'success' : 'neutral'}>
                          {appt.status}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center text-xs text-neutral-500">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {appt.timeSlot}</span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        {appt.status === 'pending' && (
                          <Button size="sm" variant="success" fullWidth onClick={() => handleConfirm(appt._id)}>Confirm</Button>
                        )}
                        {appt.status === 'confirmed' && (
                          <Button size="sm" fullWidth onClick={() => {
                            setSelectedAppointmentId(appt._id);
                            setActiveTab('records');
                          }}>Diagnose</Button>
                        )}
                        {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                          <Button size="sm" variant="danger" fullWidth onClick={() => handleCancel(appt._id)}>Cancel</Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {getAppointmentsForDate(selectedDate).length === 0 && (
                    <div className="text-center py-12 text-neutral-400">
                      <Calendar className="h-10 w-10 mx-auto stroke-1" />
                      <p className="text-xs mt-2 font-semibold">No appointments scheduled on this day.</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 3: Clinical Record Entry */}
        {activeTab === 'records' && (
          <Card className="max-w-4xl mx-auto p-8 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl">
            <div className="border-b border-[#E2E8F0] pb-4">
              <h3 className="font-bold text-neutral-900 text-lg">Complete Medical Entry</h3>
              <p className="text-xs text-neutral-500 mt-1">Document treatment notes, diagnosis and write prescriptions</p>
            </div>

            <form onSubmit={handleSubmitClinicalRecord} className="mt-6 space-y-6">
              {/* Select Active Appointment */}
              <div className="form-group">
                <label className="form-label form-label-required">Select Patient & Appointment</label>
                <select 
                  className="select" 
                  value={selectedAppointmentId} 
                  onChange={(e) => setSelectedAppointmentId(e.target.value)}
                  required
                >
                  <option value="">-- Choose active appointment --</option>
                  {appointments.filter(a => a.status === 'confirmed').map(a => (
                    <option key={a._id} value={a._id}>
                      {a.pet?.name || 'Pet'} ({a.owner?.name || a.user?.name || 'Owner'}) - {formatDate(a.date)} {a.timeSlot}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Input 
                  label="Subjective Assessment / Diagnosis" 
                  placeholder="e.g. Mild Gastrointestinal irritation"
                  value={clinicalRecordForm.diagnosis}
                  onChange={(e) => setClinicalRecordForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                  required
                />
                <Input 
                  label="Treatment / Plan Details" 
                  placeholder="e.g. IV Fluids hydration & diet restrictions"
                  value={clinicalRecordForm.treatment}
                  onChange={(e) => setClinicalRecordForm(prev => ({ ...prev, treatment: e.target.value }))}
                  required
                />
              </div>

              <Textarea 
                label="Clinical Assessment Notes" 
                placeholder="Write detail diagnosis observations, symptoms reported by owner, test reports details..."
                value={clinicalRecordForm.notes}
                onChange={(e) => setClinicalRecordForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
              />

              {/* Prescription builder */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-neutral-800">Prescriptions & Medicines</h4>
                  <Button type="button" size="sm" variant="secondary" onClick={addPrescriptionRow} className="flex items-center gap-1">
                    <Plus className="h-4 w-4" /> Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {clinicalRecordForm.prescriptions.map((prescription, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-1">
                        <input 
                          type="text"
                          placeholder="Medicine name"
                          className="input"
                          value={prescription.medicine}
                          onChange={(e) => updatePrescriptionRow(index, 'medicine', e.target.value)}
                          required
                        />
                      </div>
                      <div className="w-1/3">
                        <input 
                          type="text"
                          placeholder="Dosage (e.g. 1 tab twice daily)"
                          className="input"
                          value={prescription.dosage}
                          onChange={(e) => updatePrescriptionRow(index, 'dosage', e.target.value)}
                          required
                        />
                      </div>
                      <div className="w-1/4">
                        <input 
                          type="text"
                          placeholder="Duration (e.g. 5 days)"
                          className="input"
                          value={prescription.duration}
                          onChange={(e) => updatePrescriptionRow(index, 'duration', e.target.value)}
                          required
                        />
                      </div>
                      {clinicalRecordForm.prescriptions.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removePrescriptionRow(index)}
                          className="p-2 hover:bg-neutral-100 rounded-xl text-danger-600"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Input 
                  type="date"
                  label="Follow-up Recommendation (Optional)" 
                  value={clinicalRecordForm.nextDueDate}
                  onChange={(e) => setClinicalRecordForm(prev => ({ ...prev, nextDueDate: e.target.value }))}
                />
              </div>

              <div className="pt-4 border-t border-neutral-100 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setSelectedAppointmentId('')}>Reset Form</Button>
                <Button type="submit" loading={submittingRecord}>Submit Clinical Record</Button>
              </div>
            </form>
          </Card>
        )}

        {/* Tab 4: Knowledge Hub */}
        {activeTab === 'articles' && (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Create draft form */}
            <Card className="p-6 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl">
              <h3 className="font-bold text-neutral-900 text-lg">Practitioner Knowledge</h3>
              <p className="text-xs text-neutral-500 mt-1">Publish clinical studies, owner tips, or health warnings</p>

              <form onSubmit={handlePublishArticle} className="mt-6 space-y-4">
                <Input 
                  label="Article Title" 
                  placeholder="e.g. Understanding Pet Heatstroke in Summer"
                  value={articleForm.title}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
                
                <Input 
                  label="Summary / Catchphrase" 
                  placeholder="e.g. Critical tips for owners to spot early indicators of pet overheating."
                  value={articleForm.summary}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, summary: e.target.value }))}
                />

                <div className="grid gap-4 grid-cols-2">
                  <Input 
                    type="number"
                    label="Estimated Read Time (mins)" 
                    value={articleForm.readTime}
                    onChange={(e) => setArticleForm(prev => ({ ...prev, readTime: parseInt(e.target.value) }))}
                  />
                  <Select 
                    label="Category / Tag"
                    onChange={(e) => setArticleForm(prev => ({ ...prev, tags: [e.target.value] }))}
                  >
                    <option value="General Health">General Health</option>
                    <option value="Nutrition">Nutrition</option>
                    <option value="Emergency Care">Emergency Care</option>
                    <option value="Pet Behavior">Pet Behavior</option>
                  </Select>
                </div>

                <Textarea 
                  label="Content & Findings" 
                  placeholder="Write full article findings..."
                  value={articleForm.content}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={8}
                  required
                />

                <div className="pt-2 flex justify-end gap-3">
                  <Button type="submit" loading={submittingArticle}>Publish to Knowledge Stream</Button>
                </div>
              </form>
            </Card>

            {/* List Published */}
            <Card className="p-6 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl">
              <h3 className="font-bold text-neutral-900 text-lg">Your Published Articles ({articles.length})</h3>
              <p className="text-xs text-neutral-500 mt-1">Shared advice visible in pet owners search directory</p>

              <div className="mt-6 space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {articles.map((art) => (
                  <div key={art._id} className="border border-neutral-200 p-4 rounded-xl hover:border-primary-200 transition">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-neutral-900">{art.title}</h4>
                      <Badge variant={art.isVerified ? 'success' : 'neutral'}>
                        {art.isVerified ? 'Verified' : 'Reviewing'}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2 line-clamp-3">{art.content}</p>
                    <div className="flex justify-between items-center text-xs text-neutral-400 mt-3">
                      <span>Reads: {art.readTime} mins</span>
                      <span>Published: {new Date(art.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {articles.length === 0 && (
                  <div className="text-center py-12 text-neutral-400">
                    <BookOpen className="h-10 w-10 mx-auto stroke-1" />
                    <p className="text-xs mt-2">No articles published yet.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Tab 5: Patient Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Reviews Summary Header */}
            <Card className="p-6 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl flex flex-wrap items-center justify-between gap-6">
              <div>
                <h3 className="font-bold text-neutral-900 text-lg">Review Management</h3>
                <p className="text-xs text-neutral-500 mt-1">Manage ratings, testimonials & clinic feedback</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <h2 className="text-4xl font-extrabold text-neutral-900 flex items-center gap-1.5 justify-center">
                    {ratingAvg} <Star className="h-6 w-6 fill-warning text-warning" />
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">Average rating based on reviews</p>
                </div>
                <div className="h-10 w-px bg-neutral-200" />
                <div className="text-center">
                  <h2 className="text-4xl font-extrabold text-neutral-900">{reviewsList.length}</h2>
                  <p className="text-xs text-neutral-400 mt-1">Total Patient Feedback</p>
                </div>
              </div>
            </Card>

            {/* List of reviews */}
            <div className="space-y-4">
              {reviewsList.map((rev) => (
                <Card key={rev._id} className="p-6 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar name="Patient" size="md" />
                      <div>
                        <p className="font-semibold text-neutral-900">Pet Owner Review</p>
                        <p className="text-xs text-neutral-400">{new Date(rev.createdAt || Date.now()).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <StarRating rating={rev.rating} />
                  </div>

                  <p className="text-neutral-700 text-sm italic">"{rev.comment || 'No written comments left.'}"</p>

                  {/* Reply section */}
                  {rev.reply ? (
                    <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl mt-3 space-y-1">
                      <p className="text-xs font-bold text-neutral-500">Your Response:</p>
                      <p className="text-sm text-neutral-800">"{rev.reply}"</p>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-neutral-100 space-y-3">
                      {/* Response Templates */}
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => handleApplyTemplate(rev._id, 'Thank you so much for the feedback! Happy to assist.')}
                          className="text-xs font-semibold px-3 py-1.5 bg-neutral-100 rounded-full text-[#0046CE] hover:bg-[#EFF6FF]"
                        >
                          Thank Owner
                        </button>
                        <button 
                          onClick={() => handleApplyTemplate(rev._id, 'We appreciate the kind words. Wish health and comfort to your pet!')}
                          className="text-xs font-semibold px-3 py-1.5 bg-neutral-100 rounded-full text-[#0046CE] hover:bg-[#EFF6FF]"
                        >
                          Wish Health
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <input 
                          type="text"
                          placeholder="Type clinical response feedback..."
                          className="input flex-1"
                          value={replyTexts[rev._id] || ''}
                          onChange={(e) => setReplyTexts(prev => ({ ...prev, [rev._id]: e.target.value }))}
                        />
                        <Button 
                          onClick={() => handleSendReply(rev._id)}
                          loading={replyingToId === rev._id}
                          className="flex items-center gap-1.5"
                        >
                          <Send className="h-4 w-4" /> Reply
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
              {reviewsList.length === 0 && (
                <div className="text-center py-16 bg-white border border-[#E2E8F0] rounded-2xl text-neutral-400">
                  <MessageSquare className="h-10 w-10 mx-auto stroke-1" />
                  <p className="text-xs mt-2">No patient reviews submitted yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 6: Profile & Availability Settings */}
        {activeTab === 'profile' && (
          <Card className="max-w-4xl mx-auto p-8 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl">
            <h3 className="font-bold text-neutral-900 text-lg">Profile & Availability Workspace</h3>
            <p className="text-xs text-neutral-500 mt-1">Manage public profile details, consultation charges and scheduling hours</p>

            <form onSubmit={handleSaveProfile} className="mt-8 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Input 
                  label="Full Name" 
                  value={profileForm.name} 
                  onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
                <Input 
                  label="Clinical Specialisation" 
                  value={profileForm.specialisation}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, specialisation: e.target.value }))}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Input 
                  label="Clinic Name" 
                  value={profileForm.clinicName}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, clinicName: e.target.value }))}
                />
                <Input 
                  label="Clinic Location Address" 
                  value={profileForm.location}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Input 
                  type="number"
                  label="Consultation Fee (NPR)" 
                  value={profileForm.consultationFee}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, consultationFee: parseFloat(e.target.value) }))}
                  required
                />
                <Input 
                  type="number"
                  label="Years Experience" 
                  value={profileForm.yearsExperience}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, yearsExperience: parseInt(e.target.value) }))}
                />
              </div>

              <Textarea 
                label="Professional Biography" 
                value={profileForm.bio}
                onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
              />

              {/* Weekly Availability Schedule */}
              <div className="pt-4 border-t border-neutral-100 space-y-4">
                <h4 className="font-bold text-neutral-900 text-sm">Weekly Availability Calendar</h4>
                <p className="text-xs text-neutral-500">Select active days and booking operating hours</p>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                    const isSelected = profileForm.availability.days.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDaySelection(day)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                          isSelected 
                            ? 'bg-[#0046CE] text-white border-transparent' 
                            : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                <div className="grid gap-6 md:grid-cols-2 pt-2">
                  <Input 
                    type="time"
                    label="Operative Open Time" 
                    value={profileForm.availability.openTime}
                    onChange={(e) => setProfileForm(prev => ({
                      ...prev,
                      availability: { ...prev.availability, openTime: e.target.value }
                    }))}
                  />
                  <Input 
                    type="time"
                    label="Operative Close Time" 
                    value={profileForm.availability.closeTime}
                    onChange={(e) => setProfileForm(prev => ({
                      ...prev,
                      availability: { ...prev.availability, closeTime: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-100 flex justify-end">
                <Button type="submit" loading={updatingProfile}>Save Changes</Button>
              </div>
            </form>
          </Card>
        )}

        {/* Tab 7: Credentials & Onboarding Journey */}
        {activeTab === 'credentials' && (
          <div className="grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
            {/* Onboarding steps list */}
            <Card className="lg:col-span-2 p-8 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl space-y-6">
              <div>
                <h3 className="font-bold text-neutral-900 text-lg">Onboarding & Verification Journey</h3>
                <p className="text-xs text-neutral-500 mt-1">Complete credentials verification to enable all features</p>
              </div>

              <div className="space-y-6 mt-6">
                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-success-100 text-success-700 rounded-xl">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-neutral-900 text-sm">Personal Identity Verification</h5>
                    <p className="text-xs text-neutral-500 mt-1">Owner verified matching registration detail.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className={`p-2 rounded-xl ${dashboard?.vet?.isVerified ? 'bg-success-100 text-success-700' : 'bg-[#EFF6FF] text-[#0046CE]'}`}>
                    {dashboard?.vet?.isVerified ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5 animate-pulse" />}
                  </div>
                  <div>
                    <h5 className="font-bold text-neutral-900 text-sm">Medical License Verification</h5>
                    <p className="text-xs text-neutral-500 mt-1">License Number: <span className="font-mono text-neutral-950 font-semibold">{dashboard?.vet?.licenseNumber || 'PENDING'}</span></p>
                    <p className="text-xs text-neutral-400 mt-1">Currently being reviewed against Nepal Veterinary Council records.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-success-100 text-success-700 rounded-xl">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-neutral-900 text-sm">Clinic Details & Coordinates</h5>
                    <p className="text-xs text-neutral-500 mt-1">Location verified at: {dashboard?.vet?.location || 'Unspecified location'}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Trust Score */}
            <Card className="p-8 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-neutral-900 text-lg">Trust Score</h3>
                <p className="text-xs text-neutral-500 mt-1">Based on credentials accuracy</p>

                {/* Score Graphic */}
                <div className="mt-8 text-center relative flex flex-col items-center justify-center">
                  <svg className="w-36 h-36 transform -rotate-90">
                    <circle 
                      cx="72" 
                      cy="72" 
                      r="64" 
                      stroke="#E2E8F0" 
                      strokeWidth="10" 
                      fill="transparent" 
                    />
                    <circle 
                      cx="72" 
                      cy="72" 
                      r="64" 
                      stroke="#0046CE" 
                      strokeWidth="12" 
                      fill="transparent" 
                      strokeDasharray="402"
                      strokeDashoffset={402 - (402 * trustScoreProgress) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-3xl font-extrabold text-neutral-900">{trustScoreProgress}%</span>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-1">
                      {dashboard?.vet?.isVerified ? 'VERIFIED' : 'PARTIAL'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-100 mt-6 text-center">
                <p className="text-xs text-neutral-500">
                  {dashboard?.vet?.isVerified 
                    ? 'Verified badge is displayed publicly on your clinic listing.' 
                    : 'Submit pending credentials to reach 100% Verified status.'}
                </p>
              </div>
            </Card>
          </div>
        )}

      </main>
    </div>
  );
}
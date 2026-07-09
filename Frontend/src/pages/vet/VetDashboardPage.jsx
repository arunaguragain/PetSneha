import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  FileSpreadsheet, 
  BookOpen, 
  MessageSquare, 
  User, 
  Plus, 
  Trash2, 
  Send, 
  Star,
  Stethoscope,
  Heart,
  TrendingUp,
  Users,
  CheckCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Wifi,
  WifiOff,
  XCircle,
  Bell,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Clock,
  ShoppingBag,
  Package,
  X,
  Pencil
} from 'lucide-react';
import { 
  Avatar, 
  Badge, 
  Button, 
  Card, 
  Modal,
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
import { getMyProducts, getProducts, addProduct, editProduct, removeProduct, getSellerOrders, updateOrderStatus } from '../../api/shop.api';
import { updateVetProfile } from '../../api/vet.api';
import { getErrorMessage, formatDate, unwrapItems } from '../../utils/api';
import { getImageUrl } from '../../utils/imageUrl';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useAuth } from '../../hooks/useAuth';
import ForumPage from '../owner/ForumPage';

export default function VetDashboardPage({ defaultTab = 'dashboard' }) {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [articles, setArticles] = useState([]);
  
  // Forum states
  const [forumPosts, setForumPosts] = useState([]);
  const [forumLoading, setForumLoading] = useState(false);
  const [forumAnswers, setForumAnswers] = useState({});
  const [submittingAnswer, setSubmittingAnswer] = useState(null);
  
  // Form states
  const [articleForm, setArticleForm] = useState({ title: '', content: '', summary: '', petType: [], tags: [], readTime: 5, season: 'all' });
  const [articleImageFile, setArticleImageFile] = useState(null);
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

  // Cancellation modal states
  const [cancellingAppointmentId, setCancellingAppointmentId] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');

  // Product states
  const [vetProducts, setVetProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productAddOpen, setProductAddOpen] = useState(false);
  const [productEditOpen, setProductEditOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [productFormLoading, setProductFormLoading] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', category: 'food', petType: '', stock: '', images: []
  });

  // Order states
  const [sellerOrders, setSellerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [selectedSellerOrder, setSelectedSellerOrder] = useState(null);

  const displayAppointments = useMemo(() => {
    const active = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed');
    if (active.length > 0) {
      return active.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5);
    }
    return [...appointments].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  }, [appointments]);

  // Dynamic Notifications Feed computed from appointments
  const notifications = useMemo(() => {
    const list = [];
    appointments.forEach(appt => {
      if (appt.status === 'pending') {
        list.push({
          id: `init-${appt._id}`,
          type: 'info',
          title: 'New Booking',
          message: `${appt.owner?.name || appt.user?.name || 'Client'} requested an appointment for ${appt.pet?.name || 'Pet'} on ${formatDate(appt.date)} at ${appt.timeSlot}`,
          time: new Date(appt.createdAt || Date.now())
        });
      }
      if (appt.status === 'cancelled') {
        list.push({
          id: `cancel-${appt._id}`,
          type: 'danger',
          title: 'Cancelled',
          message: `Appointment for ${appt.pet?.name || 'Pet'} (Owner: ${appt.owner?.name || appt.user?.name || 'Client'}) on ${formatDate(appt.date)} was cancelled.`,
          time: new Date(appt.updatedAt || appt.createdAt || Date.now())
        });
      }
    });
    return list.sort((a, b) => b.time - a.time).slice(0, 5);
  }, [appointments]);

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
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

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
    fetchVetProducts();
    fetchSellerOrders();
  }, []);

  const fetchVetProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await getMyProducts();
      const productsList = response.data?.products || response.data?.items || (Array.isArray(response.data) ? response.data : response || []);
      setVetProducts(productsList);
    } catch (err) {
      addToast(getErrorMessage(err), 'danger');
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchSellerOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await getSellerOrders();
      const ordersList = response.data?.orders || response.data?.items || (Array.isArray(response.data) ? response.data : response || []);
      setSellerOrders(ordersList);
    } catch (err) {
      addToast(getErrorMessage(err), 'danger');
    } finally {
      setOrdersLoading(false);
    }
  };

  const filteredSellerOrders = useMemo(() => {
    const normalizedSearch = orderSearch.trim().toLowerCase();

    return sellerOrders.filter((order) => {
      const matchesStatus = orderStatusFilter === 'all' || String(order.status || '').toLowerCase() === orderStatusFilter;
      const orderNumber = String(order.orderNumber || order._id || '').toLowerCase();
      const matchesSearch = !normalizedSearch || orderNumber.includes(normalizedSearch);
      return matchesStatus && matchesSearch;
    });
  }, [sellerOrders, orderSearch, orderStatusFilter]);

  useEffect(() => {
    fetchVetProducts();
    fetchSellerOrders();
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
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'confirmed' } : a));
      await confirmAppointment(id);
      addToast('Appointment confirmed', 'success');
      loadData();
    } catch (err) {
      addToast(getErrorMessage(err), 'danger');
      loadData();
    }
  };

  const handleCancel = async (id) => {
    setCancellingAppointmentId(id);
    setCancellationReason('');
  };

  const handleConfirmCancellation = async () => {
    if (!cancellationReason.trim()) {
      addToast('Please provide a cancellation reason', 'danger');
      return;
    }
    
    try {
      const idToCancel = cancellingAppointmentId;
      setAppointments(prev => prev.map(a => a._id === idToCancel ? { ...a, status: 'cancelled' } : a));
      await vetCancelAppointment(cancellingAppointmentId, cancellationReason);
      addToast('Appointment cancelled successfully', 'success');
      loadData();
    } catch (err) {
      addToast(getErrorMessage(err), 'danger');
      loadData();
    } finally {
      setCancellingAppointmentId(null);
      setCancellationReason('');
    }
  };

  const handleCancelCancellation = () => {
    setCancellingAppointmentId(null);
    setCancellationReason('');
  };

  const handlePublishArticle = async (e) => {
    e.preventDefault();
    if (!articleForm.title || !articleForm.content) {
      addToast('Title and content are required', 'danger');
      return;
    }
    try {
      setSubmittingArticle(true);
      
      let payload;
      let headers = {};
      if (articleImageFile) {
        payload = new FormData();
        payload.append('title', articleForm.title);
        payload.append('content', articleForm.content);
        payload.append('summary', articleForm.summary || '');
        payload.append('readTime', articleForm.readTime || 5);
        payload.append('season', articleForm.season || 'all');
        payload.append('image', articleImageFile);
        if (articleForm.tags && articleForm.tags.length > 0) {
          payload.append('tags', articleForm.tags[0]);
        }
        headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        payload = articleForm;
      }

      await submitVetArticle(payload, headers);
      addToast('Practitioner knowledge article published draft successfully', 'success');
      setArticleForm({ title: '', content: '', summary: '', petType: [], tags: [], readTime: 5, season: 'all' });
      setArticleImageFile(null);
      
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

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
      
      // Sanitize availability object - only include necessary fields
      const sanitizedAvailability = {
        days: Array.isArray(profileForm.availability?.days) ? profileForm.availability.days : [],
        openTime: profileForm.availability?.openTime || '',
        closeTime: profileForm.availability?.closeTime || '',
        is24Hours: !!profileForm.availability?.is24Hours,
      };
      
      const formData = new FormData();
      Object.keys(profileForm).forEach(key => {
        if (key === 'availability') {
          formData.append(key, JSON.stringify(sanitizedAvailability));
        } else if (profileForm[key] !== undefined && profileForm[key] !== null) {
          formData.append(key, profileForm[key]);
        }
      });
      
      if (profilePictureFile) {
        formData.append('profilePicture', profilePictureFile);
      }
      
      await updateVetProfile(dashboard.vet._id, formData);
      addToast('Profile and settings updated successfully', 'success');
      setProfilePictureFile(null);
      setProfilePicturePreview(null);
      await refreshUser();
      loadData();
    } catch (err) {
      addToast(getErrorMessage(err), 'danger');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePictureFile(null);
    setProfilePicturePreview(null);
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
    const daysArray = profileForm.availability?.days || [];
    const days = [...daysArray];
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
    { id: 'products', label: 'My Products', icon: ShoppingBag },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'reviews', label: 'Patient Reviews', icon: MessageSquare },
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'forum', label: 'Community Forum', icon: Users },
  ];

  const resetProductForm = () => {
    setProductForm({
      name: '', description: '', price: '', category: 'food', petType: '', stock: '', images: []
    });
    setCurrentProduct(null);
  };

  const handleProductFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'images') {
      setProductForm(prev => ({ ...prev, [name]: files }));
    } else {
      setProductForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleProductAddSubmit = async (e) => {
    e.preventDefault();
    setProductFormLoading(true);
    try {
      const form = new FormData();
      form.append('name', productForm.name);
      form.append('description', productForm.description);
      form.append('price', Number(productForm.price));
      form.append('stock', Number(productForm.stock));
      form.append('category', productForm.category);
      const ptArray = typeof productForm.petType === 'string' ? productForm.petType.split(',').map(s => s.trim()).filter(Boolean) : productForm.petType;
      ptArray.forEach(pt => form.append('petType', pt));
      if (productForm.images && productForm.images.length) {
        Array.from(productForm.images).forEach(file => {
          if (file instanceof File || file instanceof Blob) {
            form.append('images', file);
          } else if (typeof file === 'string') {
            form.append('images', file);
          }
        });
      }
      await addProduct(form);
      setProductAddOpen(false);
      resetProductForm();
      addToast('Product submitted for approval!', 'success');
      await fetchVetProducts();
    } catch (err) {
      addToast(getErrorMessage(err), 'danger');
    } finally {
      setProductFormLoading(false);
    }
  };

  const handleProductEditSubmit = async (e) => {
    e.preventDefault();
    setProductFormLoading(true);
    try {
      const form = new FormData();
      form.append('name', productForm.name);
      form.append('description', productForm.description);
      form.append('price', Number(productForm.price));
      form.append('stock', Number(productForm.stock));
      form.append('category', productForm.category);
      const ptArray = typeof productForm.petType === 'string' ? productForm.petType.split(',').map(s => s.trim()).filter(Boolean) : productForm.petType;
      ptArray.forEach(pt => form.append('petType', pt));
      if (productForm.images && productForm.images.length) {
        Array.from(productForm.images).forEach(file => {
          if (file instanceof File || file instanceof Blob) {
            form.append('images', file);
          } else if (typeof file === 'string') {
            form.append('images', file);
          }
        });
      }
      await editProduct(currentProduct._id, form);
      setProductEditOpen(false);
      resetProductForm();
      addToast('Product updated successfully!', 'success');
      await fetchVetProducts();
    } catch (err) {
      addToast(getErrorMessage(err), 'danger');
    } finally {
      setProductFormLoading(false);
    }
  };

  const handleProductDelete = async (product) => {
    const yes = await confirm('Delete this product? This action cannot be undone.');
    if (!yes) return;
    try {
      await removeProduct(product._id);
      addToast('Product deleted', 'success');
      await fetchVetProducts();
    } catch (err) {
      addToast(getErrorMessage(err), 'danger');
    }
  };

  const openProductEdit = (product) => {
    setCurrentProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category,
      petType: (product.petType || []).join(', '),
      stock: product.stock,
      images: []
    });
    setProductEditOpen(true);
  };

  const handleCloseProductModal = () => {
    setProductAddOpen(false);
    setProductEditOpen(false);
    resetProductForm();
  };

  const approvedProductCount = vetProducts.filter(p => p.isVerifiedSeller).length;
  const pendingProductCount = vetProducts.filter(p => !p.isVerifiedSeller).length;

  // Compute weekly appointment data from real appointments
  const weeklyChartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = Array(7).fill(0);
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    appointments.forEach(appt => {
      const d = new Date(appt.date);
      if (d >= startOfWeek) {
        counts[d.getDay()] += 1;
      }
    });
    const maxCount = Math.max(...counts, 1);
    return days.map((day, i) => ({ day, count: counts[i], pct: Math.round((counts[i] / maxCount) * 100) }));
  }, [appointments]);

  // Compute real clinic performance stats
  const clinicStats = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    const successRate = total > 0 ? Math.round(((total - cancelled) / total) * 100) : 0;
    const feedbackRate = total > 0 ? Math.round((reviewsList.length / total) * 100) : 0;
    return { successRate, feedbackRate, completed, cancelled, total };
  }, [appointments, reviewsList]);

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
    <div className="flex bg-[#F8FAFC] h-screen overflow-hidden">
      {/* VetStream Left Workspace Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E2E8F0] flex flex-col shrink-0 h-full overflow-hidden">
          {/* Header Info */}
          <div className="px-4 py-3 border-b border-[#E2E8F0] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-[#E2E8F0] border border-[#0046CE]/10">
                  {dashboard?.vet?.profilePhoto ? (
                    <img src={getImageUrl(dashboard.vet.profilePhoto)} alt={dashboard?.vet?.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-neutral-500">
                      {(dashboard?.vet?.name || 'Dr.').charAt(0)}
                    </div>
                  )}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${isVetOnline ? 'bg-success' : 'bg-danger'}`} />
              </div>
              <div className="overflow-hidden min-w-0">
                <h4 className="font-semibold text-sm text-neutral-900 truncate">{dashboard?.vet?.name || 'Veterinary Surgeon'}</h4>
                <p className="text-[11px] text-neutral-500 truncate">{dashboard?.vet?.specialisation || 'General Practice'}</p>
              </div>
            </div>
            
            {/* Quick Status toggle */}
            <div className="mt-2.5 flex items-center justify-between bg-neutral-50 rounded-lg px-2.5 py-2 border border-[#E2E8F0]">
              <span className="text-[11px] font-semibold text-neutral-600 flex items-center gap-1.5">
                {isVetOnline ? <Wifi className="h-3 w-3 text-success animate-pulse" /> : <WifiOff className="h-3 w-3 text-neutral-400" />}
                {isVetOnline ? 'Receiving Bookings' : 'Offline'}
              </span>
              <button 
                onClick={handleStatusToggle}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isVetOnline ? 'bg-success' : 'bg-neutral-300'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isVetOnline ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* Navigation Links — compact, no scroll */}
          <nav className="flex-1 px-3 py-2 space-y-0.5">
            {sidebarItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition ${
                    isActive 
                      ? 'bg-[#0046CE]/10 text-[#0046CE]' 
                      : 'text-neutral-600 hover:bg-[#F8FAFC] hover:text-neutral-950'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#0046CE]' : 'text-neutral-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 px-8 pt-8 pb-24 overflow-y-auto">
        
        {/* Verification banner if not verified */}
        {dashboard?.vet && !dashboard.vet.isVerified && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-2xl flex items-start gap-4">
            <div className="p-2.5 bg-danger-100 rounded-xl text-danger-700">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h5 className="font-bold text-danger-900">Credential Verification Pending</h5>
              <p className="text-sm text-danger-700 mt-1">
                Your medical license credentials are being verified by PetSneha admins. Some client booking features might be restricted until verification is complete.
              </p>
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

            {/* Performance Index & Real Chart */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2 p-6 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                  <div>
                    <h3 className="font-bold text-neutral-900 text-lg">This Week's Appointments</h3>
                    <p className="text-xs text-neutral-500 mt-1">Daily appointment count for the current week</p>
                  </div>
                  <Badge variant="primary" className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> {appointments.filter(a => a.status === 'completed').length} Completed
                  </Badge>
                </div>
                {/* Real appointment chart bars */}
                <div className="h-56 mt-6 flex items-end justify-between gap-2 px-2 relative">
                  <div className="absolute inset-x-0 top-0 border-t border-neutral-100" />
                  <div className="absolute inset-x-0 top-1/3 border-t border-neutral-100" />
                  <div className="absolute inset-x-0 top-2/3 border-t border-neutral-100" />
                  {weeklyChartData.map(({ day, count, pct }) => (
                    <div key={day} className="flex-1 flex flex-col items-center gap-2 z-10">
                      <span className="text-[10px] font-bold text-neutral-500">{count > 0 ? count : ''}</span>
                      <div 
                        className={`w-full rounded-t-lg transition-all group-hover:opacity-80 ${
                          pct > 0 ? 'bg-[#0046CE]' : 'bg-neutral-100'
                        }`} 
                        style={{ height: `${Math.max(pct * 1.8, pct > 0 ? 12 : 4)}px` }} 
                        title={`${count} appointment${count !== 1 ? 's' : ''}`}
                      />
                      <span className="text-[10px] font-semibold text-neutral-400">{day}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Clinic Performance card — real computed data */}
              <Card className="p-6 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-neutral-900 text-lg">Clinic Performance</h3>
                  <p className="text-xs text-neutral-500 mt-1">Real-time satisfaction &amp; activity insights</p>
                  
                  <div className="mt-6 space-y-5">
                    <div>
                      <div className="flex justify-between text-sm font-semibold text-neutral-700">
                        <span>Appointment Success Rate</span>
                        <span>{clinicStats.successRate}%</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-2 rounded-full mt-2">
                        <div className="bg-success h-full rounded-full transition-all" style={{ width: `${clinicStats.successRate}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm font-semibold text-neutral-700">
                        <span>Completed Consultations</span>
                        <span>{clinicStats.completed}</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-2 rounded-full mt-2">
                        <div className="bg-[#0046CE] h-full rounded-full transition-all" style={{ width: `${clinicStats.total > 0 ? Math.round((clinicStats.completed / clinicStats.total) * 100) : 0}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm font-semibold text-neutral-700">
                        <span>Patient Feedback Rate</span>
                        <span>{clinicStats.feedbackRate}%</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-2 rounded-full mt-2">
                        <div className="bg-warning h-full rounded-full transition-all" style={{ width: `${Math.min(clinicStats.feedbackRate, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 mt-4">
                  <Button variant="secondary" fullWidth onClick={() => setActiveTab('reviews')}>
                    Manage Patient Reviews
                  </Button>
                </div>
              </Card>
            </div>

            {/* Recent Appointments grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card className="p-6 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl h-full">
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
                        {displayAppointments.map((appt) => (
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
                                  <button 
                                    onClick={() => handleConfirm(appt._id)}
                                    className="p-2 bg-success-50 text-success-700 hover:bg-success-100 rounded-xl transition shadow-sm border border-success-200/50"
                                    title="Approve Appointment"
                                  >
                                    <CheckCircle className="h-5 w-5" />
                                  </button>
                                )}
                                {appt.status === 'confirmed' && (
                                  <button 
                                    onClick={() => {
                                      setSelectedAppointmentId(appt._id);
                                      setActiveTab('records');
                                    }}
                                    className="p-2 bg-[#EFF6FF] text-[#0046CE] hover:bg-[#DBEAFE] rounded-xl transition shadow-sm border border-[#BFDBFE]"
                                    title="Diagnose & Complete"
                                  >
                                    <Stethoscope className="h-5 w-5" />
                                  </button>
                                )}
                                {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                                  <button 
                                    onClick={() => handleCancel(appt._id)}
                                    className="p-2 bg-danger-50 text-danger-700 hover:bg-danger-100 rounded-xl transition shadow-sm border border-danger-200/50"
                                    title="Cancel Booking"
                                  >
                                    <XCircle className="h-5 w-5" />
                                  </button>
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

              <div className="lg:col-span-1">
                <Card className="p-6 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl h-full flex flex-col justify-between">
                  <div>
                    <div className="pb-4 border-b border-[#E2E8F0]">
                      <h3 className="font-bold text-neutral-900 text-lg">Activity Notifications</h3>
                      <p className="text-xs text-neutral-500 mt-1 font-medium">Real-time alerts for booking initiations & cancellations</p>
                    </div>

                    <div className="mt-4 space-y-4 max-h-[320px] overflow-y-auto pr-1">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="border border-neutral-100 p-3.5 rounded-xl space-y-1.5 bg-neutral-50/50 hover:bg-neutral-50 transition">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              notif.type === 'danger' ? 'bg-danger-50 text-danger-700' : 'bg-[#EFF6FF] text-[#0046CE]'
                            }`}>
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-semibold">{notif.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-xs text-neutral-700 font-medium leading-relaxed">{notif.message}</p>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <div className="text-center py-12 text-neutral-400">
                          <Bell className="h-8 w-8 mx-auto stroke-1" />
                          <p className="text-xs mt-2 font-semibold">No recent booking actions.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Schedule & Calendar */}
        {activeTab === 'appointments' && (
          <div className="space-y-8">
            <div>
              <h1 className="font-display text-4xl text-neutral-900 font-bold">Schedule & Calendar</h1>
              <p className="text-neutral-500 mt-2">Manage your clinic's appointments and calendar</p>
            </div>
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
                                  a.status === 'confirmed' ? 'bg-success' : 
                                  a.status === 'completed' ? 'bg-neutral-400' :
                                  a.status === 'cancelled' ? 'bg-danger' : 
                                  'bg-warning'
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

                      <div className="flex gap-2 pt-2 justify-end">
                        {appt.status === 'pending' && (
                          <button 
                            onClick={() => handleConfirm(appt._id)}
                            className="flex-1 p-2 bg-success-50 text-success-700 hover:bg-success-100 rounded-xl transition flex items-center justify-center border border-success-200/50"
                            title="Approve"
                          >
                            <CheckCircle className="h-4.5 w-4.5 mr-1" />
                            <span className="text-xs font-semibold">Approve</span>
                          </button>
                        )}
                        {appt.status === 'confirmed' && (
                          <button 
                            onClick={() => {
                              setSelectedAppointmentId(appt._id);
                              setActiveTab('records');
                            }}
                            className="flex-1 p-2 bg-[#EFF6FF] text-[#0046CE] hover:bg-[#DBEAFE] rounded-xl transition flex items-center justify-center border border-[#BFDBFE]"
                            title="Diagnose"
                          >
                            <Stethoscope className="h-4.5 w-4.5 mr-1" />
                            <span className="text-xs font-semibold">Diagnose</span>
                          </button>
                        )}
                        {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                          <button 
                            onClick={() => handleCancel(appt._id)}
                            className="p-2 bg-danger-50 text-danger-700 hover:bg-danger-100 rounded-xl transition flex items-center justify-center border border-danger-200/50"
                            title="Cancel"
                          >
                            <XCircle className="h-4.5 w-4.5" />
                          </button>
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
          </div>
        )}

        {/* Tab 3: Clinical Record Entry */}
        {activeTab === 'records' && (
          <div className="space-y-8">
            <div>
              <h1 className="font-display text-4xl text-neutral-900 font-bold">Clinical Entry</h1>
              <p className="text-neutral-500 mt-2">Document treatment notes, diagnosis and write prescriptions</p>
            </div>
            <Card className="p-8 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl">
              <form onSubmit={handleSubmitClinicalRecord} className="space-y-6">
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
                          placeholder="Medicine name (optional)"
                          className="input"
                          value={prescription.medicine}
                          onChange={(e) => updatePrescriptionRow(index, 'medicine', e.target.value)}
                        />
                      </div>
                      <div className="w-1/3">
                        <input 
                          type="text"
                          placeholder="Dosage (optional)"
                          className="input"
                          value={prescription.dosage}
                          onChange={(e) => updatePrescriptionRow(index, 'dosage', e.target.value)}
                        />
                      </div>
                      <div className="w-1/4">
                        <input 
                          type="text"
                          placeholder="Duration (optional)"
                          className="input"
                          value={prescription.duration}
                          onChange={(e) => updatePrescriptionRow(index, 'duration', e.target.value)}
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
          </div>
        )}

        {/* Tab 4: Knowledge Hub */}
        {activeTab === 'articles' && (
          <div className="space-y-8">
            <div>
              <h1 className="font-display text-4xl text-neutral-900 font-bold">Knowledge Hub</h1>
              <p className="text-neutral-500 mt-2">Publish clinical studies, owner tips, or health warnings</p>
            </div>
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Create draft form */}
              <Card className="p-6 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl">
                <div className="border-b border-[#E2E8F0] pb-4">
                  <h3 className="font-bold text-neutral-900 text-lg">Create New Article</h3>
                </div>
                <form onSubmit={handlePublishArticle} className="mt-6 space-y-4">
                <Input 
                  label="Article Title" 
                  name="articleTitle"
                  autoComplete="off"
                  placeholder="e.g. Understanding Pet Heatstroke in Summer"
                  value={articleForm.title}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
                
                <Input 
                  label="Summary / Catchphrase" 
                  name="articleSummary"
                  autoComplete="off"
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
                <Select
                  label="Season"
                  value={articleForm.season}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, season: e.target.value }))}
                >
                  <option value="all">All</option>
                  <option value="monsoon">Monsoon</option>
                  <option value="winter">Winter</option>
                  <option value="summer">Summer</option>
                </Select>

                <div className="form-group">
                  <label className="form-label">Featured Image / Picture (Optional)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="input" 
                    onChange={(e) => setArticleImageFile(e.target.files[0])}
                  />
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
          </div>
        )}

        {/* Tab 5: Patient Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            <div>
              <h1 className="font-display text-4xl text-neutral-900 font-bold">Patient Reviews</h1>
              <p className="text-neutral-500 mt-2">Manage ratings, testimonials & clinic feedback</p>
            </div>
            {/* Reviews Summary Header */}
            <Card className="p-6 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl flex flex-wrap items-center justify-between gap-6">

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
                      <Avatar name={rev.authorId?.name || 'Pet Owner'} size="md" />
                      <div>
                        <p className="font-semibold text-neutral-900">{rev.authorId?.name || 'Pet Owner'}</p>
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
          <div className="space-y-8">
            <div>
              <h1 className="font-display text-4xl text-neutral-900 font-bold">Profile Settings</h1>
              <p className="text-neutral-500 mt-2">Manage public profile details, consultation charges and scheduling hours</p>
            </div>
            <Card className="p-8 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl">
              <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-neutral-100 border-2 border-dashed border-[#0046CE]/20 flex items-center justify-center">
                  {profilePicturePreview ? (
                    <img src={profilePicturePreview} alt="Profile preview" className="w-full h-full object-cover" />
                  ) : dashboard?.vet?.profilePhoto ? (
                    <img src={getImageUrl(dashboard.vet.profilePhoto)} alt="Current profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-neutral-400">
                      <User className="h-8 w-8 mx-auto mb-1" />
                      <p className="text-xs">No photo</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <label className="cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                    <span className="px-4 py-2 bg-[#0046CE] text-white rounded-lg text-sm font-semibold hover:bg-[#0046CE]/90 inline-block">
                      Upload Photo
                    </span>
                  </label>
                  {profilePictureFile && (
                    <button 
                      type="button"
                      onClick={handleRemoveProfilePicture}
                      className="px-4 py-2 bg-danger text-white rounded-lg text-sm font-semibold hover:bg-danger-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

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
                    const daysArray = profileForm.availability?.days || [];
                    const isSelected = daysArray.includes(day);
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
                    value={profileForm.availability?.openTime || '09:00'}
                    onChange={(e) => setProfileForm(prev => ({
                      ...prev,
                      availability: { ...prev.availability, openTime: e.target.value }
                    }))}
                  />
                  <Input 
                    type="time"
                    label="Operative Close Time" 
                    value={profileForm.availability?.closeTime || '17:00'}
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
          </div>
        )}

        {/* Credentials tab removed as requested */}

        {/* Tab 8: Community Forum (embedded with sidebar) */}
        {activeTab === 'forum' && (
          <ForumPage />
        )}

        {/* Tab: Products */}
        {activeTab === 'products' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-4xl text-neutral-900 font-bold">My Products</h1>
                <p className="text-neutral-500 mt-2">Products you sell through PetSneha marketplace</p>
              </div>
              <Button onClick={() => setProductAddOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add product
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 sm:grid-cols-3">
              <Card className="p-6 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Listed</p>
                  <h3 className="font-display text-3xl font-bold text-neutral-900 mt-2">{vetProducts.length}</h3>
                </div>
                <div className="p-3 bg-[#EFF6FF] text-[#0046CE] rounded-2xl">
                  <ShoppingBag className="h-6 w-6" />
                </div>
              </Card>
              <Card className="p-6 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Approved</p>
                  <h3 className="font-display text-3xl font-bold text-neutral-900 mt-2 flex items-center gap-2">
                    {approvedProductCount}
                    <Badge variant="success">Live</Badge>
                  </h3>
                </div>
                <div className="p-3 bg-success-50 text-success-700 rounded-2xl">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </Card>
              <Card className="p-6 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Pending Approval</p>
                  <h3 className="font-display text-3xl font-bold text-neutral-900 mt-2 flex items-center gap-2">
                    {pendingProductCount}
                    <Badge variant="warning">Pending</Badge>
                  </h3>
                </div>
                <div className="p-3 bg-warning-50 text-warning-700 rounded-2xl">
                  <Clock className="h-6 w-6" />
                </div>
              </Card>
            </div>

            {/* Product List */}
            {productsLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-72 rounded-2xl" />)}
              </div>
            ) : vetProducts.length === 0 ? (
              <Card className="p-12 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl text-center">
                <ShoppingBag className="h-10 w-10 mx-auto text-neutral-300 stroke-1" />
                <p className="font-semibold text-neutral-900 mt-3">No products listed yet</p>
                <p className="text-sm text-neutral-500 mt-1">Add your first product and submit it for admin approval</p>
                <Button className="mt-4" onClick={() => setProductAddOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add your first product
                </Button>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {vetProducts.map(product => (
                  <Card key={product._id} className="p-6 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl flex flex-col hover:shadow-md transition-shadow">
                    {/* Product image */}
                    {product.images && product.images.length > 0 && (
                      <div className="w-full h-40 rounded-xl overflow-hidden mb-4 bg-neutral-100">
                        <img
                          src={product.images[0].startsWith('http') ? product.images[0] : `${(import.meta.env.VITE_API_URL || 'http://localhost:5050/api').replace('/api', '')}${product.images[0]}`}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-neutral-900 text-[15px] leading-snug">{product.name}</h3>
                      {product.isVerifiedSeller ? (
                        <Badge variant="success">✓ Live</Badge>
                      ) : (
                        <Badge variant="warning">⏳ Pending</Badge>
                      )}
                    </div>
                    <span className="inline-block text-[11px] font-semibold uppercase tracking-wider bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-full mb-3 self-start">{product.category}</span>
                    <p className="text-[#0046CE] font-bold text-lg mb-2">Rs {product.price}</p>
                    <div className="flex gap-1.5 flex-wrap mb-3">
                      {(product.petType || []).map(pt => (
                        <span key={pt} className="text-[11px] font-medium bg-[#EFF6FF] text-[#0046CE] px-2 py-0.5 rounded-full">{pt}</span>
                      ))}
                    </div>
                    <p className="text-xs text-neutral-400 mb-3">Stock: {product.stock} units</p>
                    <p className="text-sm text-neutral-500 line-clamp-2 mb-4 flex-1">{product.description}</p>
                    <div className="flex gap-2 border-t border-neutral-100 pt-4 mt-auto">
                      <Button variant="secondary" size="sm" fullWidth onClick={() => openProductEdit(product)}>
                        <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                      <button
                        onClick={() => handleProductDelete(product)}
                        className="btn btn-sm w-full text-danger-600 border border-danger-200 bg-white hover:bg-danger-50 transition font-semibold rounded-xl flex items-center justify-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Add / Edit Product Modal */}
            <Modal
              open={productAddOpen || productEditOpen}
              onClose={handleCloseProductModal}
              size="lg"
              title={productAddOpen ? 'Add Product' : 'Edit Product'}
            >
              <div className="px-6 pb-6">
                {productAddOpen && (
                  <InfoBox type="info" className="mb-5">
                    Your product will be reviewed by the PetSneha admin before appearing in the marketplace.
                  </InfoBox>
                )}

                <form onSubmit={productAddOpen ? handleProductAddSubmit : handleProductEditSubmit} className="space-y-4">
                  <Input name="name" label="Product Name" required value={productForm.name} onChange={handleProductFormChange} />
                  <Textarea name="description" label="Description" required value={productForm.description} onChange={handleProductFormChange} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input name="price" label="Price (Rs)" type="number" min="0" required value={productForm.price} onChange={handleProductFormChange} />
                    <Input name="stock" label="Stock" type="number" min="0" required value={productForm.stock} onChange={handleProductFormChange} />
                  </div>
                  <Select name="category" label="Category" required value={productForm.category} onChange={handleProductFormChange}>
                    <option value="food">Food</option>
                    <option value="accessories">Accessories</option>
                    <option value="shelter">Shelter</option>
                    <option value="bodycare">Bodycare</option>
                    <option value="wastemanagement">Waste Management</option>
                  </Select>
                  <Input name="petType" label="Pet Types (comma separated)" hint="e.g. Dog, Cat" required value={productForm.petType} onChange={handleProductFormChange} />
                  <div className="form-group">
                    <label htmlFor="productImages" className="form-label">Product Images</label>
                    <input
                      type="file"
                      id="productImages"
                      name="images"
                      multiple
                      accept="image/*"
                      onChange={handleProductFormChange}
                      className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#EFF6FF] file:text-[#0046CE] hover:file:bg-[#DBEAFE] transition cursor-pointer"
                    />
                    <p className="text-xs text-neutral-400 mt-1.5">Upload product pictures (JPEG, PNG — optional)</p>
                  </div>
                  <div className="flex gap-3 justify-end pt-4 mt-2 border-t border-neutral-100">
                    <Button type="button" variant="secondary" onClick={handleCloseProductModal}>Cancel</Button>
                    <Button type="submit" loading={productFormLoading}>{productAddOpen ? 'Submit for Approval' : 'Save Changes'}</Button>
                  </div>
                </form>
              </div>
            </Modal>
          </div>
        )}

        {/* Tab: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-4xl text-neutral-900 font-bold">Orders</h1>
                <p className="text-neutral-500 mt-2">Orders containing your products from the marketplace.</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap justify-end">
                <Input
                  value={orderSearch}
                  onChange={(event) => setOrderSearch(event.target.value)}
                  placeholder="Search order number"
                  className="w-56"
                />
                <Select
                  value={orderStatusFilter}
                  onChange={(event) => setOrderStatusFilter(event.target.value)}
                  className="w-44"
                >
                  <option value="all">All</option>
                  <option value="placed">Placed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
                <Button variant="secondary" onClick={fetchSellerOrders} disabled={ordersLoading}>
                  {ordersLoading ? <span className="inline-block animate-spin h-4 w-4 rounded-full border-2 border-current border-r-transparent mr-2" /> : null}
                  Refresh
                </Button>
              </div>
            </div>

            {ordersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
              </div>
            ) : filteredSellerOrders.length === 0 ? (
              <Card className="p-12 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl text-center">
                <Package className="h-10 w-10 mx-auto text-neutral-300 stroke-1" />
                <p className="font-semibold text-neutral-900 mt-3">No orders yet</p>
                <p className="text-sm text-neutral-500 mt-1">Orders matching your current filters will appear here.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredSellerOrders.map(order => {
                  const statusFlow = { placed: 'processing', processing: 'shipped', shipped: 'delivered' };
                  const statusLabel = { placed: 'Confirm', processing: 'Mark Shipped', shipped: 'Mark Delivered' };
                  const nextStatus = statusFlow[order.status];

                  const handleAdvanceStatus = async () => {
                    if (!nextStatus) return;
                    try {
                      await updateOrderStatus(order._id, nextStatus);
                      addToast(`Order marked as ${nextStatus}`, 'success');
                      fetchSellerOrders();
                    } catch (err) {
                      addToast(getErrorMessage(err), 'danger');
                    }
                  };

                  return (
                    <Card
                      key={order._id}
                      className="p-5 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl space-y-4 cursor-pointer hover:shadow-md transition"
                      onClick={() => setSelectedSellerOrder(order)}
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <p className="font-bold text-neutral-900">Order #{order.orderNumber || order._id?.slice(-6)}</p>
                          <p className="text-xs text-neutral-500 mt-0.5">{formatDate(order.createdAt)} · {order.items?.length ?? 0} item(s)</p>
                          {order.deliveryAddress && (
                            <div className="text-xs text-neutral-600 mt-2 bg-neutral-50 rounded-lg p-2 space-y-0.5">
                              <p className="font-semibold text-neutral-800">{order.deliveryAddress.fullName} · {order.deliveryAddress.phone}</p>
                              <p>{order.deliveryAddress.address}, {order.deliveryAddress.area}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={
                            order.status === 'delivered' ? 'success' :
                            order.status === 'cancelled' ? 'danger' :
                            order.status === 'shipped' ? 'primary' :
                            'warning'
                          }>{order.status || 'placed'}</Badge>
                          {nextStatus && (
                            <Button size="sm" onClick={(event) => { event.stopPropagation(); handleAdvanceStatus(); }}>{statusLabel[order.status]}</Button>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-neutral-100 pt-3 flex items-center justify-between text-sm text-neutral-500">
                        <span>{order.items?.length ?? 0} item(s)</span>
                        <span className="font-semibold text-[#0046CE]">View details</span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      <Modal
        open={!!selectedSellerOrder}
        onClose={() => setSelectedSellerOrder(null)}
        size="lg"
        title={selectedSellerOrder ? `Order #${selectedSellerOrder.orderNumber || selectedSellerOrder._id?.slice(-6)}` : 'Order details'}
      >
        {selectedSellerOrder ? (
          <div className="px-6 pb-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#FAFBFD] p-4 space-y-2 text-sm text-[#475569]">
                <p><span className="font-semibold text-[#1E293B]">Status:</span> {selectedSellerOrder.status || 'placed'}</p>
                <p><span className="font-semibold text-[#1E293B]">Payment:</span> {String(selectedSellerOrder.paymentMethod || 'cod').toUpperCase()}</p>
                <p><span className="font-semibold text-[#1E293B]">Created:</span> {formatDate(selectedSellerOrder.createdAt)}</p>
                <p><span className="font-semibold text-[#1E293B]">Updated:</span> {formatDate(selectedSellerOrder.updatedAt)}</p>
                <p><span className="font-semibold text-[#1E293B]">Total:</span> Rs {selectedSellerOrder.total ?? selectedSellerOrder.totalAmount ?? 0}</p>
              </div>

              {/* Buyer Details (derive from deliveryAddress when user fields missing) */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#FAFBFD] p-4 text-sm text-[#475569]">
                <p className="font-semibold text-[#1E293B]">Buyer Details</p>
                <div className="grid gap-2 sm:grid-cols-2 mt-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Name</p>
                    <p className="font-medium">{selectedSellerOrder.userId?.name || selectedSellerOrder.deliveryAddress?.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Email</p>
                    <p className="font-medium">{selectedSellerOrder.userId?.email || selectedSellerOrder.deliveryAddress?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Phone</p>
                    <p className="font-medium">{selectedSellerOrder.userId?.phone || selectedSellerOrder.deliveryAddress?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">Delivery Address</p>
                    {selectedSellerOrder.deliveryAddress ? (
                      <p className="text-[#475569] leading-relaxed">
                        {selectedSellerOrder.deliveryAddress.address}
                        {selectedSellerOrder.deliveryAddress.area ? `, ${selectedSellerOrder.deliveryAddress.area}` : ''}
                      </p>
                    ) : (
                      <p className="font-medium">{selectedSellerOrder.userId?.address || 'N/A'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-[#64748B]">Items</h4>
              <div className="space-y-3">
                {selectedSellerOrder.items?.map((item, index) => {
                  const product = item.productId || {};
                  const imageSrc = Array.isArray(product.images) && product.images.length > 0 ? getImageUrl(product.images[0]) : null;
                  const seller = product.sellerId || {};

                  return (
                    <div key={`${selectedSellerOrder._id}-${index}`} className="flex gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-4">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F1F5F9]">
                        {imageSrc ? (
                          <img src={imageSrc} alt={product.name || item.name || 'Product'} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl">📰</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-[#1E293B]">{product.name || item.name || `Product #${index + 1}`}</p>
                            <p className="text-sm text-[#64748B]">Qty {item.quantity}</p>
                            {seller.name ? <p className="text-xs text-[#64748B] mt-1">Seller: {seller.name}{seller.phone ? ` · ${seller.phone}` : ''}</p> : null}
                          </div>
                          <p className="text-sm font-semibold text-[#0046CE]">Rs {item.price}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              {selectedSellerOrder && (() => {
                const statusFlow = { placed: 'processing', processing: 'shipped', shipped: 'delivered' };
                const statusLabel = { placed: 'Confirm', processing: 'Mark Shipped', shipped: 'Mark Delivered' };
                const nextStatus = statusFlow[selectedSellerOrder.status];
                return nextStatus ? (
                  <Button
                    type="button"
                    onClick={async () => {
                      try {
                        await updateOrderStatus(selectedSellerOrder._id, nextStatus);
                        addToast(`Order marked as ${nextStatus}`, 'success');
                        setSelectedSellerOrder(null);
                        fetchSellerOrders();
                      } catch (err) {
                        addToast(getErrorMessage(err), 'danger');
                      }
                    }}
                  >
                    {statusLabel[selectedSellerOrder.status]}
                  </Button>
                ) : null;
              })()}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Cancellation Reason Modal */}
      <Modal open={!!cancellingAppointmentId} onClose={handleCancelCancellation} size="sm" title="Cancel Appointment">
        <div className="px-6 pb-6">
          <p className="mb-4 text-sm text-neutral-600">Please provide a reason for cancelling this appointment.</p>
          <Textarea
            label="Cancellation Reason"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            placeholder="Enter the reason for cancellation"
            rows={3}
          />

          <div className="flex gap-3 w-full mt-6">
            <button 
              type="button"
              className="btn btn-secondary w-full"
              onClick={handleCancelCancellation}
            >
              Keep
            </button>
            <button 
              type="button"
              className="btn btn-danger w-full text-white"
              onClick={handleConfirmCancellation}
            >
              Cancel Now
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

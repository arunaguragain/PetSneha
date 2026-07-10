import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Avatar, Badge, Button, Card, Input, StarRating, Textarea, VerifiedBadge } from '../../components/ui';
import { getVet, submitReview } from '../../api/vet.api';
import { formatCurrency, getErrorMessage, unwrapItem, unwrapItems } from '../../utils/api';
import { translateDynamic } from '../../utils/mappings';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Check, Calendar as CalendarIcon, MapPin, Clock, Star, Award, FileBadge, GraduationCap, Zap } from 'lucide-react';
import { openGoogleMapsDirections } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { getImageUrl } from '../../utils/imageUrl';
import { AdminTopBar, AdminSidebar } from '../admin/AdminDashboardPage';

export default function VetProfilePage() {
  const { vetId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [vet, setVet] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, appointmentId: '', content: '' });

  useEffect(() => {
    const loadVet = async () => {
      try {
        setLoading(true);
        const response = await getVet(vetId);
        const loadedVet = response.data?.vet
          || response.data?.item
          || response.data
          || response;
        setVet(loadedVet);
        
        const reviewsList = loadedVet?.reviews
          || response.data?.reviews
          || response.data?.items
          || response.reviews
          || (Array.isArray(response.data) ? response.data : []);
        setReviews(reviewsList);
      } catch (apiError) {
        addToast(getErrorMessage(apiError), 'danger');
      } finally {
        setLoading(false);
      }
    };

    loadVet();
  }, [addToast, vetId]);


  const handleSubmitReview = async (event) => {
    event.preventDefault();
    try {
      setReviewLoading(true);
      await submitReview(vetId, { appointmentId: reviewForm.appointmentId || undefined, rating: reviewForm.rating, comment: reviewForm.content });
      addToast(t('vetProfile.reviewPublishedSuccess', '✓ Review published!'), 'success');
      setReviewOpen(false);
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[#64748B]">{t('common.loading', 'Loading...')}</div>;
  }

  if (!vet) {
    return <div className="p-8 text-center text-[#64748B]">{t('vetProfile.notFound', 'Vet not found.')}</div>;
  }

  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    `${vet?.clinicName || ''}, ${vet?.location || ''}, Kathmandu, Nepal`
  )}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  const handleAdminLogout = () => {
    const loginPath = logout();
    navigate(loginPath, { replace: true });
  };

  const handleAdminTabChange = (tabId) => {
    navigate('/admin/dashboard');
  };

  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <AdminTopBar user={user} onLogout={handleAdminLogout} />
        <AdminSidebar activeTab="vets" onChange={handleAdminTabChange} />
        <main className="ml-64 pt-16">
          <div className="w-full px-[24px] lg:px-[64px] pt-[32px] pb-[48px] max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 gap-[24px]">
              {/* Profile header */}
              <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
                <div className="w-24 h-24 rounded-xl object-cover border-2 border-[#E2E8F0] relative flex-shrink-0 bg-[#F1F5F9]">
                  <img
                    src={getImageUrl(vet.profilePhoto || vet.imageUrl)}
                    alt={vet.name}
                    className="w-full h-full rounded-xl object-cover"
                    onError={(e) => { e.currentTarget.src = '/profile.png'; }}
                  />
                  {vet.isVerified ? (
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-[#0046CE] rounded-full flex items-center justify-center border-2 border-white" title={t('vetProfile.verifiedVet', 'Verified Vet')}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <div className="absolute -bottom-2 -right-2 bg-yellow-500 rounded-full w-6 h-6 flex items-center justify-center border-2 border-white animate-pulse" title={t('vetProfile.pendingVerification', 'Pending Verification')}>
                      <span className="text-white text-[10px] font-bold">⏱</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-semibold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>{vet.name}</h1>
                    {vet.isVerified ? (
                      <VerifiedBadge />
                    ) : (
                      <Badge variant="warning">{t('vetProfile.pendingVerification', 'Pending Verification')}</Badge>
                    )}
                  </div>
                  <div className="inline-flex gap-2 mt-1">
                    <span className="bg-[#EFF6FF] text-[#0046CE] text-xs px-2 py-0.5 rounded-full whitespace-nowrap">DVM</span>
                    <span className="bg-[#EFF6FF] text-[#0046CE] text-xs px-2 py-0.5 rounded-full whitespace-nowrap">MVSc</span>
                  </div>
                  <div className="text-[#0046CE] font-medium text-sm mt-1">{translateDynamic(vet.specialisation || t('vetProfile.generalPractice', 'General Practice'), i18n.language)}</div>
                  <div className="flex items-center gap-4 text-sm text-[#64748B] mt-2 flex-wrap">
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <CalendarIcon className="w-4 h-4" /> {vet.yearsExperience || 0} {t('vetProfile.yearsExperience', 'Years Experience')}
                    </div>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <MapPin className="w-4 h-4" /> {translateDynamic(vet.clinicName || vet.location || t('vetProfile.clinicUnavailable', 'Clinic details unavailable'), i18n.language)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 mt-6 pt-6 border-t border-[#E2E8F0]">
                <div>
                  <div className="text-xs text-[#64748B] uppercase tracking-wide">{t('vetProfile.patientsServed', 'PATIENTS SERVED')}</div>
                  <div className="text-xl font-bold text-[#1E293B] mt-1">2,500+</div>
                </div>
                <div>
                  <div className="text-xs text-[#64748B] uppercase tracking-wide">{t('vetProfile.rating', 'RATING')}</div>
                  {vet?.reviewCount > 0 ? (
                    <div className="text-xl font-bold text-[#1E293B] mt-1 flex items-center gap-1">
                      {vet.rating} <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    </div>
                  ) : (
                    <div className="text-sm text-[#64748B] mt-1.5 font-medium">{t('vetProfile.noReviewsYet', 'No reviews yet — be the first to book and review')}</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="bg-[#F8FAFC] rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-[#1E293B] mb-2">{t('vetProfile.aboutMe', 'About Me')}</h3>
                  <p className="text-sm text-[#1E293B] leading-relaxed">
                    {translateDynamic(vet.bio || t('vetProfile.defaultBio', 'Dedicated veterinary professional with extensive experience in small animal care. Committed to providing compassionate and comprehensive medical treatment to ensure the health and well-being of your beloved pets.'), i18n.language)}
                  </p>
                </div>
                
                <div className="bg-[#F8FAFC] rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-[#1E293B] mb-2">{t('vetProfile.licensing', 'Licensing & Credentials')}</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm text-[#1E293B]">
                      <Award className="w-4 h-4 text-[#0046CE] mt-0.5 flex-shrink-0" /> {t('vetProfile.nvc', 'Nepal Veterinary Council (NVC)')}
                    </div>
                    <div className="flex items-start gap-2 text-sm text-[#1E293B]">
                      <FileBadge className="w-4 h-4 text-[#0046CE] mt-0.5 flex-shrink-0" /> {t('vetProfile.license', 'License:')} {vet.licenseNumber || 'NVC-1234'}
                    </div>
                    <div className="flex items-start gap-2 text-sm text-[#1E293B]">
                      <GraduationCap className="w-4 h-4 text-[#0046CE] mt-0.5 flex-shrink-0" /> {t('vetProfile.tuGrad', 'Tribhuvan University Graduate')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm mt-4">
                <h3 className="text-base font-semibold text-[#1E293B]">{t('vetProfile.clinicLocation', 'Clinic Location')}</h3>
                
                <div className="w-full h-48 bg-[#F1F5F9] rounded-lg mt-3 overflow-hidden border border-[#E2E8F0] relative">
                  {vet?.location ? (
                    <iframe
                      src={mapEmbedUrl}
                      title="Clinic Location Map"
                      className="w-full h-full border-0"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#64748B]">
                      <MapPin className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-sm">{t('vetProfile.mapUnavailable', 'Location map unavailable')}</span>
                    </div>
                  )}
                  {vet?.location && (
                    <div className="absolute top-2 left-2">
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${vet.clinicName || ''} ${vet.location || ''} Kathmandu Nepal`)}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-white px-2 py-1.5 rounded shadow-sm text-xs font-medium text-[#0046CE] flex items-center gap-1 hover:bg-gray-50"
                      >
                        {t('vetProfile.maps', 'Maps')} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 text-sm">
                  <div className="font-medium text-[#1E293B]">{vet?.clinicName || 'Gurung Family Vet Care'}</div>
                  <div className="text-[#64748B] mt-0.5">{vet?.location || 'Balaju, Kathmandu'}</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="w-full px-[24px] lg:px-[64px] pt-[32px] pb-[48px] max-w-[1600px] mx-auto">
        
        {/* Header row with back button (hidden for admins, they use sidebar) */}
        {user?.role !== 'admin' && (
          <div className="flex items-center justify-end mb-6">
            <button
              onClick={() => navigate('/vets')} 
              className="flex items-center gap-1.5 text-sm text-[#64748B] border border-[#E2E8F0] rounded-lg px-4 py-2 hover:bg-[#F8FAFC] transition"
            >
              <ArrowLeft className="w-4 h-4" /> {t('vetProfile.backToVets', 'Back to Vet Listings')}
            </button>
          </div>
        )}

        {/* Two column layout */}
        <div className="grid grid-cols-12 gap-[24px]">
          
          {/* Left (col-span-8) */}
          <div className="col-span-12 lg:col-span-8">
            
            {/* Profile header */}
            <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
              <div className="w-24 h-24 rounded-xl object-cover border-2 border-[#E2E8F0] relative flex-shrink-0 bg-[#F1F5F9]">
                <img
                  src={getImageUrl(vet.profilePhoto || vet.imageUrl)}
                  alt={vet.name}
                  className="w-full h-full rounded-xl object-cover"
                  onError={(e) => { e.currentTarget.src = '/profile.png'; }}
                />
                {vet.isVerified ? (
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-[#0046CE] rounded-full flex items-center justify-center border-2 border-white" title={t('vetProfile.verifiedVet', 'Verified Vet')}>
                    <Check className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  <div className="absolute -bottom-2 -right-2 bg-yellow-500 rounded-full w-6 h-6 flex items-center justify-center border-2 border-white animate-pulse" title={t('vetProfile.pendingVerification', 'Pending Verification')}>
                    <span className="text-white text-[10px] font-bold">⏱</span>
                  </div>
                )}
              </div>
              
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-semibold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>{vet.name}</h1>
                  {vet.isVerified ? (
                    <VerifiedBadge />
                  ) : (
                    <Badge variant="warning">{t('vetProfile.pendingVerification', 'Pending Verification')}</Badge>
                  )}
                </div>
                <div className="inline-flex gap-2 mt-1">
                  <span className="bg-[#EFF6FF] text-[#0046CE] text-xs px-2 py-0.5 rounded-full whitespace-nowrap">DVM</span>
                  <span className="bg-[#EFF6FF] text-[#0046CE] text-xs px-2 py-0.5 rounded-full whitespace-nowrap">MVSc</span>
                </div>
                <div className="text-[#0046CE] font-medium text-sm mt-1">{translateDynamic(vet.specialisation || t('vetProfile.generalPractice', 'General Practice'), i18n.language)}</div>
                <div className="flex items-center gap-4 text-sm text-[#64748B] mt-2 flex-wrap">
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <CalendarIcon className="w-4 h-4" /> {vet.yearsExperience || 0} {t('vetProfile.yearsExperience', 'Years Experience')}
                  </div>
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <MapPin className="w-4 h-4" /> {translateDynamic(vet.clinicName || vet.location || t('vetProfile.clinicUnavailable', 'Clinic details unavailable'), i18n.language)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-6 mt-6 pt-6 border-t border-[#E2E8F0]">
              <div>
                <div className="text-xs text-[#64748B] uppercase tracking-wide">{t('vetProfile.patientsServed', 'PATIENTS SERVED')}</div>
                <div className="text-xl font-bold text-[#1E293B] mt-1">2,500+</div>
              </div>
              <div>
                <div className="text-xs text-[#64748B] uppercase tracking-wide">{t('vetProfile.rating', 'RATING')}</div>
                {vet?.reviewCount > 0 ? (
                  <div className="text-xl font-bold text-[#1E293B] mt-1 flex items-center gap-1">
                    {vet.rating} <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  </div>
                ) : (
                  <div className="text-sm text-[#64748B] mt-1.5 font-medium">{t('vetProfile.noReviewsYet', 'No reviews yet — be the first to book and review')}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="bg-[#F8FAFC] rounded-xl p-4">
                <h3 className="text-sm font-semibold text-[#1E293B] mb-2">{t('vetProfile.aboutMe', 'About Me')}</h3>
                <p className="text-sm text-[#1E293B] leading-relaxed">
                  {translateDynamic(vet.bio || t('vetProfile.defaultBio', 'Dedicated veterinary professional with extensive experience in small animal care. Committed to providing compassionate and comprehensive medical treatment to ensure the health and well-being of your beloved pets.'), i18n.language)}
                </p>
              </div>
              
              <div className="bg-[#F8FAFC] rounded-xl p-4">
                <h3 className="text-sm font-semibold text-[#1E293B] mb-2">{t('vetProfile.licensing', 'Licensing & Credentials')}</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm text-[#1E293B]">
                    <Award className="w-4 h-4 text-[#0046CE] mt-0.5 flex-shrink-0" /> {t('vetProfile.nvc', 'Nepal Veterinary Council (NVC)')}
                  </div>
                  <div className="flex items-start gap-2 text-sm text-[#1E293B]">
                    <FileBadge className="w-4 h-4 text-[#0046CE] mt-0.5 flex-shrink-0" /> {t('vetProfile.license', 'License:')} {vet.licenseNumber || 'NVC-1234'}
                  </div>
                  <div className="flex items-start gap-2 text-sm text-[#1E293B]">
                    <GraduationCap className="w-4 h-4 text-[#0046CE] mt-0.5 flex-shrink-0" /> {t('vetProfile.tuGrad', 'Tribhuvan University Graduate')}
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            {vet?.reviewCount > 0 ? (
              <>
                <div className="flex justify-between items-center mt-8">
                  <h2 className="text-lg font-semibold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>{t('vetProfile.recentReviews', 'Recent Reviews')}</h2>
                  <span className="text-[#0046CE] text-sm hover:underline cursor-pointer">{t('vetProfile.viewAllReviews', 'View All {{count}} Reviews', { count: reviews.length || vet.reviewsCount || 0 })}</span>
                </div>

                <div className="mt-4 space-y-3">
                  {reviews.map((review) => (
                    <div key={review._id || review.id} className="bg-[#F8FAFC] rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#E2E8F0] flex items-center justify-center text-xs font-medium text-[#64748B]">
                            {(review.authorName || review.user?.name || 'A')[0]}
                          </div>
                          <span className="font-medium text-sm text-[#1E293B]">{review.authorName || review.user?.name || 'Anonymous'}</span>
                        </div>
                        <div className="text-xs text-[#64748B]">2 days ago</div>
                      </div>
                      
                      <div className="flex gap-0.5 text-yellow-400 mt-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < (review.rating || 5) ? 'fill-current' : 'text-[#E2E8F0] fill-current'}`} />
                        ))}
                      </div>
                      
                      <p className="text-sm text-[#1E293B] mt-2">{review.comment || review.content}</p>
                      
                      {review.reply && (
                        <div className="bg-white border border-[#E2E8F0] p-3 rounded-lg mt-3 ml-4 space-y-1">
                          <p className="text-xs font-bold text-[#0046CE]">{t('vetProfile.responseFromVet', 'Response from Vet:')}</p>
                          <p className="text-sm text-[#1E293B] font-medium">"{translateDynamic(review.reply, i18n.language)}"</p>
                        </div>
                      )}
                      
                      <div className="bg-white border border-[#E2E8F0] text-xs px-2 py-1 rounded-full mt-3 inline-flex items-center gap-1 text-[#64748B]">
                        {t('vetProfile.treatForDog', 'Treat for: Dog')}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-[#F8FAFC] border border-dashed border-[#E2E8F0] rounded-xl p-6 text-center text-sm text-[#64748B] mt-8">
                {t('vetProfile.noReviewsMsg', 'This vet has no reviews yet. Be the first to book an appointment and share your experience.')}
              </div>
            )}

            {user?.role !== 'admin' && (
              <button 
                onClick={() => setReviewOpen(true)}
                className="w-full bg-[#0046CE] hover:bg-blue-700 text-white rounded-lg py-3 text-sm font-medium mt-4 transition"
              >
                {t('vetProfile.addReview', 'Add Review')}
              </button>
            )}

          </div>

          {/* Right (col-span-4) */}
          <div className="col-span-12 lg:col-span-4">
            <div className="space-y-6 lg:sticky lg:top-[88px]">
              
              {/* Booking card */}
              {user?.role !== 'admin' && (
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
                  <h3 className="text-base font-semibold text-[#1E293B]">{t('vetProfile.bookAppointment', 'Book Appointment')}</h3>
                  
                  <div className="flex justify-between text-sm mt-4">
                    <span className="text-[#64748B]">{t('vetProfile.consultationFee', 'Consultation Fee')}</span>
                    <span className="font-semibold text-[#1E293B]">{formatCurrency(vet.consultationFee || vet.fee || 800)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm mt-3">
                    <span className="text-[#64748B] flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#64748B]" /> {t('vetProfile.nextAvailability', 'Next Availability')}</span>
                    <span className="text-[#0046CE] font-medium">{t('vetProfile.todayAvailability', 'Today, 4:30 PM')}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm mt-3">
                    <span className="text-[#64748B] flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#64748B]" /> {t('vetProfile.workingHours', 'Working Hours')}</span>
                    <span className="text-[#1E293B] font-medium">{t('vetProfile.defaultHours', '9:00 AM - 6:00 PM')}</span>
                  </div>
                  
                  <div className="mt-4 border-t border-[#E2E8F0]"></div>
                  
                  <button 
                    onClick={() => vet?.isVerified && navigate(`/vets/${vetId}/book`)}
                    disabled={!vet?.isVerified}
                    className={`w-full rounded-lg py-3 text-sm font-semibold mt-4 transition ${
                      vet?.isVerified
                        ? 'bg-[#0046CE] hover:bg-blue-700 text-white cursor-pointer'
                        : 'bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed'
                    }`}
                  >
                    {vet?.isVerified ? t('vetProfile.scheduleVisit', 'Schedule Visit') : t('vetProfile.bookingUnavailable', 'Booking unavailable — pending verification')}
                  </button>
                  
                  <div className="text-xs text-[#64748B] text-center mt-3 flex items-center justify-center gap-1">
                    <Zap className="w-4 h-4" /> {t('vetProfile.instantConfirmation', 'Instant confirmation within 15 mins')}
                  </div>
                </div>
              )}

              {/* Clinic Location card */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
                <h3 className="text-base font-semibold text-[#1E293B]">{t('vetProfile.clinicLocation', 'Clinic Location')}</h3>
                
                <div className="w-full h-48 bg-[#F1F5F9] rounded-lg mt-3 overflow-hidden border border-[#E2E8F0] relative">
                  {vet?.location ? (
                    <iframe
                      src={mapEmbedUrl}
                      title="Clinic Location Map"
                      className="w-full h-full border-0"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#64748B] text-xs">
                      <MapPin className="w-6 h-6 mb-1 text-[#CBD5E1]" />
                      {t('vetProfile.locationUnavailable', 'Location not available')}
                    </div>
                  )}
                </div>
                
                <div className="text-sm font-semibold text-[#1E293B] mt-3">{translateDynamic(vet.clinicName || 'Happy Paws Clinic', i18n.language)}</div>
                <div className="text-xs text-[#64748B] mt-1">{translateDynamic(vet.location || 'Lazimpat, Kathmandu', i18n.language)}</div>
                
                <button 
                  onClick={() => openGoogleMapsDirections(`${vet.clinicName || vet.name}, ${vet.location || ''}, Kathmandu, Nepal`)}
                  className="w-full border border-[#0046CE] hover:bg-blue-50 text-[#0046CE] rounded-lg py-2 text-sm font-medium mt-4 transition flex items-center justify-center gap-1.5"
                >
                  {t('vetProfile.getDirections', 'Get Directions')}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/60 px-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-[#1E293B] mb-4">{t('vetProfile.writeReview', 'Write a Review')}</h2>
            <form className="space-y-4" onSubmit={handleSubmitReview}>
              <div className="flex items-center gap-3 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                <img
                  src={getImageUrl(vet.profilePhoto || vet.imageUrl)}
                  alt={vet.name}
                  className="w-10 h-10 rounded-full object-cover bg-[#E2E8F0]"
                  onError={(e) => { e.currentTarget.src = '/profile.png'; }}
                />
                <div>
                  <p className="font-semibold text-sm text-[#1E293B]">{vet.name}</p>
                  <p className="text-xs text-[#64748B]">{translateDynamic(vet.clinicName || vet.location, i18n.language)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[#1E293B]">{t('vetProfile.yourRating', 'Your rating')}</span>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-6 h-6 cursor-pointer transition ${star <= reviewForm.rating ? 'text-yellow-400 fill-current' : 'text-[#E2E8F0] fill-current hover:text-yellow-200'}`}
                      onClick={() => setReviewForm((current) => ({ ...current, rating: star }))}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">{t('vetProfile.appointmentIdLabel', 'Appointment ID (Optional)')}</label>
                <input 
                  type="text" 
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0046CE]" 
                  value={reviewForm.appointmentId} 
                  onChange={(event) => setReviewForm((current) => ({ ...current, appointmentId: event.target.value }))} 
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">{t('vetProfile.describeExperience', 'Describe your experience')}</label>
                <textarea 
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0046CE] resize-none" 
                  rows={4}
                  value={reviewForm.content} 
                  onChange={(event) => setReviewForm((current) => ({ ...current, content: event.target.value }))} 
                  placeholder={t('vetProfile.howWasVisit', 'How was your visit?')}
                />
              </div>
              
              <p className="text-xs text-[#64748B]">{t('vetProfile.reviewPublic', 'Your review will be posted publicly.')}</p>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#E2E8F0]">
                <button type="button" className="px-4 py-2 text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] rounded-lg transition" onClick={() => setReviewOpen(false)}>{t('common.cancel', 'Cancel')}</button>
                <button type="submit" disabled={reviewLoading} className="px-4 py-2 text-sm font-medium bg-[#0046CE] text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-70">
                  {reviewLoading ? t('vetProfile.publishing', 'Publishing...') : t('vetProfile.publishReview', 'Publish review')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
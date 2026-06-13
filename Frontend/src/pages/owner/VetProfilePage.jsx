import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Avatar, Badge, Button, Card, Input, StarRating, Textarea, VerifiedBadge } from '../../components/ui';
import { getVet, submitReview } from '../../api/vet.api';
import { formatCurrency, getErrorMessage, unwrapItem, unwrapItems } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Check, Calendar as CalendarIcon, MapPin, Clock, Star, Award, BookOpen, GraduationCap } from 'lucide-react';

export default function VetProfilePage() {
  const { vetId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
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
      addToast('✓ Review published!', 'success');
      setReviewOpen(false);
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[#64748B]">Loading...</div>;
  }

  if (!vet) {
    return <div className="p-8 text-center text-[#64748B]">Vet not found.</div>;
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-8">
        
        {/* Back link */}
        <div 
          onClick={() => navigate('/vets')} 
          className="text-sm text-[#0046CE] cursor-pointer mb-6 flex items-center gap-1 hover:underline w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Vet Listings
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left (col-span-2) */}
          <div className="md:col-span-2">
            
            {/* Profile header */}
            <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
              <div className="w-24 h-24 rounded-xl object-cover border-2 border-[#E2E8F0] relative flex-shrink-0 bg-[#F1F5F9]">
                <img src={vet.imageUrl || '/profile.png'} alt={vet.name} className="w-full h-full rounded-xl object-cover" />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-[#0046CE] rounded-full flex items-center justify-center border-2 border-white">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
              
              <div>
                <h1 className="text-2xl font-semibold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>{vet.name}</h1>
                <div className="inline-flex gap-2 mt-1">
                  <span className="bg-[#EFF6FF] text-[#0046CE] text-xs px-2 py-0.5 rounded-full whitespace-nowrap">DVM</span>
                  <span className="bg-[#EFF6FF] text-[#0046CE] text-xs px-2 py-0.5 rounded-full whitespace-nowrap">MVSc</span>
                </div>
                <div className="text-[#0046CE] font-medium text-sm mt-1">{vet.specialisation || 'General Practice'}</div>
                <div className="flex items-center gap-4 text-sm text-[#64748B] mt-2 flex-wrap">
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <CalendarIcon className="w-4 h-4" /> {vet.yearsExperience || 0} Years Experience
                  </div>
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <MapPin className="w-4 h-4" /> {vet.clinicName || vet.location || 'Clinic details unavailable'}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex gap-6 mt-6 pt-6 border-t border-[#E2E8F0]">
              <div>
                <div className="text-xs text-[#64748B] uppercase tracking-wide">PATIENTS SERVED</div>
                <div className="text-xl font-bold text-[#1E293B] mt-1">2,500+</div>
              </div>
              <div>
                <div className="text-xs text-[#64748B] uppercase tracking-wide">RATING</div>
                <div className="text-xl font-bold text-[#1E293B] mt-1 flex items-center gap-1">
                  {vet.rating || 4.9} <Star className="w-5 h-5 text-yellow-400 fill-current" />
                </div>
              </div>
            </div>

            {/* Two column info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="bg-[#F8FAFC] rounded-xl p-4">
                <h3 className="text-sm font-semibold text-[#1E293B] mb-2">About Me</h3>
                <p className="text-sm text-[#1E293B] leading-relaxed">
                  {vet.bio || "Dedicated veterinary professional with extensive experience in small animal care. Committed to providing compassionate and comprehensive medical treatment to ensure the health and well-being of your beloved pets."}
                </p>
              </div>
              
              <div className="bg-[#F8FAFC] rounded-xl p-4">
                <h3 className="text-sm font-semibold text-[#1E293B] mb-2">Licensing & Credentials</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm text-[#1E293B]">
                    <Award className="w-4 h-4 text-[#0046CE] mt-0.5 flex-shrink-0" /> Nepal Veterinary Council (NVC)
                  </div>
                  <div className="flex items-start gap-2 text-sm text-[#1E293B]">
                    <BookOpen className="w-4 h-4 text-[#0046CE] mt-0.5 flex-shrink-0" /> License: {vet.licenseNumber || 'NVC-1234'}
                  </div>
                  <div className="flex items-start gap-2 text-sm text-[#1E293B]">
                    <GraduationCap className="w-4 h-4 text-[#0046CE] mt-0.5 flex-shrink-0" /> Tribhuvan University Graduate
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="flex justify-between items-center mt-8">
              <h2 className="text-lg font-semibold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>Recent Reviews</h2>
              <span className="text-[#0046CE] text-sm hover:underline cursor-pointer">View All {reviews.length || vet.reviewsCount || 0} Reviews</span>
            </div>

            <div className="mt-4 space-y-3">
              {reviews.length ? reviews.map((review) => (
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
                  
                  <div className="bg-white border border-[#E2E8F0] text-xs px-2 py-1 rounded-full mt-3 inline-flex items-center gap-1 text-[#64748B]">
                    Treat for: Dog
                  </div>
                </div>
              )) : (
                <div className="text-sm text-[#64748B] p-4 bg-[#F8FAFC] rounded-xl text-center">No reviews yet.</div>
              )}
            </div>

            <button 
              onClick={() => setReviewOpen(true)}
              className="w-full bg-[#0046CE] hover:bg-blue-700 text-white rounded-lg py-3 text-sm font-medium mt-4 transition"
            >
              Add Review
            </button>

          </div>

          {/* Right (col-span-1) */}
          <div className="md:col-span-1">
            
            {/* Booking card */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm sticky top-6">
              <h3 className="text-base font-semibold text-[#1E293B]">Book Appointment</h3>
              
              <div className="flex justify-between text-sm mt-4">
                <span className="text-[#64748B]">Consultation Fee</span>
                <span className="font-semibold text-[#1E293B]">{formatCurrency(vet.consultationFee || vet.fee || 800)}</span>
              </div>
              
              <div className="flex justify-between text-sm mt-3">
                <span className="text-[#64748B]">Next Availability</span>
                <span className="text-[#0046CE] font-medium">Today, 4:30 PM</span>
              </div>
              
              <div className="flex justify-between text-sm mt-3">
                <span className="text-[#64748B]">Working Hours</span>
                <span className="text-[#1E293B] font-medium">9:00 AM - 6:00 PM</span>
              </div>
              
              <div className="mt-4 border-t border-[#E2E8F0]"></div>
              
              <button 
                onClick={() => navigate(`/vets/${vetId}/book`)}
                className="w-full bg-[#0046CE] hover:bg-blue-700 text-white rounded-lg py-3 text-sm font-semibold mt-4 transition"
              >
                Schedule Visit
              </button>
              
              <div className="text-xs text-[#64748B] text-center mt-3 flex items-center justify-center gap-1">
                ⚡ Instant confirmation within 15 mins
              </div>
            </div>

            {/* Clinic Location card */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm mt-6">
              <h3 className="text-sm font-semibold text-[#1E293B]">Clinic Location</h3>
              
              <div className="w-full h-32 bg-[#F1F5F9] rounded-lg mt-3 flex flex-col items-center justify-center text-[#64748B] text-xs border border-[#E2E8F0]">
                <MapPin className="w-6 h-6 mb-1 text-[#CBD5E1]" />
                Map Preview
              </div>
              
              <div className="text-sm font-medium text-[#1E293B] mt-3">{vet.clinicName || 'Happy Paws Clinic'}</div>
              <div className="text-xs text-[#64748B] mt-1">{vet.location || 'Lazimpat, Kathmandu'}</div>
              
              <button className="w-full border border-[#0046CE] hover:bg-blue-50 text-[#0046CE] rounded-lg py-2 text-sm font-medium mt-4 transition">
                Get Directions
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/60 px-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-[#1E293B] mb-4">Write a Review</h2>
            <form className="space-y-4" onSubmit={handleSubmitReview}>
              <div className="flex items-center gap-3 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                <img src={vet.imageUrl || '/profile.png'} alt={vet.name} className="w-10 h-10 rounded-full object-cover bg-[#E2E8F0]" />
                <div>
                  <p className="font-semibold text-sm text-[#1E293B]">{vet.name}</p>
                  <p className="text-xs text-[#64748B]">{vet.clinicName || vet.location}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[#1E293B]">Your rating</span>
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
                <label className="block text-xs font-medium text-[#64748B] mb-1">Appointment ID (Optional)</label>
                <input 
                  type="text" 
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0046CE]" 
                  value={reviewForm.appointmentId} 
                  onChange={(event) => setReviewForm((current) => ({ ...current, appointmentId: event.target.value }))} 
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">Describe your experience</label>
                <textarea 
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0046CE] resize-none" 
                  rows={4}
                  value={reviewForm.content} 
                  onChange={(event) => setReviewForm((current) => ({ ...current, content: event.target.value }))} 
                  placeholder="How was your visit?"
                />
              </div>
              
              <p className="text-xs text-[#64748B]">Your review will be posted publicly.</p>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#E2E8F0]">
                <button type="button" className="px-4 py-2 text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] rounded-lg transition" onClick={() => setReviewOpen(false)}>Cancel</button>
                <button type="submit" disabled={reviewLoading} className="px-4 py-2 text-sm font-medium bg-[#0046CE] text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-70">
                  {reviewLoading ? 'Publishing...' : 'Publish review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Avatar, Badge, Button, Card, Input, Select } from '../../components/ui';
import { bookAppointment, getVet, getVetSlots } from '../../api/vet.api';
import { getPets } from '../../api/pet.api';
import { formatCurrency, formatDate, getErrorMessage, unwrapItem, unwrapItems } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Info } from 'lucide-react';

const buildCalendarDays = (monthDate) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const days = [];

  // Add padding for start of month
  const startDay = start.getDay();
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  for (let day = 1; day <= end.getDate(); day += 1) {
    days.push(new Date(year, month, day));
  }

  return days;
};

export default function BookingPage() {
  const { vetId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [vet, setVet] = useState(null);
  const [pets, setPets] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [monthDate, setMonthDate] = useState(new Date());
  const [step, setStep] = useState(1);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [vetResponse, petsResponse] = await Promise.all([getVet(vetId), getPets()]);
        
        const loadedVet = vetResponse.data?.vet
          || vetResponse.data?.item
          || vetResponse.data
          || vetResponse;
        setVet(loadedVet);

        const petsList = petsResponse.data?.pets
          || petsResponse.data?.items
          || (Array.isArray(petsResponse.data) ? petsResponse.data : petsResponse || []);
        setPets(petsList);
      } catch (apiError) {
        addToast(getErrorMessage(apiError), 'danger');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [addToast, vetId]);

  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    const loadSlots = async () => {
      try {
        const response = await getVetSlots(vetId, selectedDate);
        const slotsList = response.data?.slots
          || response.data?.items
          || (Array.isArray(response.data) ? response.data : response || []);
        setSlots(slotsList);
      } catch (apiError) {
        addToast(getErrorMessage(apiError), 'danger');
      }
    };

    loadSlots();
  }, [addToast, selectedDate, vetId]);

  const days = useMemo(() => buildCalendarDays(monthDate), [monthDate]);

  const handleDateSelect = (date) => {
    if (!date) return;
    const isoDate = date.toISOString().slice(0, 10);
    setSelectedDate(isoDate);
    setStep(2);
    setSelectedSlot('');
  };

  const handleSubmit = async () => {
    if (!selectedPetId) {
      addToast('Please select a pet', 'danger');
      return;
    }
    try {
      setSubmitting(true);
      await bookAppointment({ vetId, petId: selectedPetId, date: selectedDate, timeSlot: selectedSlot });
      addToast('Appointment booked!', 'success');
      navigate('/dashboard');
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[#64748B]">Loading...</div>;
  }

  const fee = vet?.consultationFee || vet?.fee || 800;
  const serviceCharge = fee * 0.05;
  const total = fee + serviceCharge;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Header */}
        <h1 className="text-2xl font-semibold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>Book an Appointment</h1>
        <p className="text-sm text-[#64748B] mt-1">Schedule a visit with your preferred veterinarian.</p>

        {/* Stepper */}
        <div className="flex items-center gap-2 my-8">
          {/* Step 1 */}
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-medium ${step >= 1 ? 'bg-[#0046CE] text-white' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
              1
            </div>
            <span className={`font-medium ${step >= 1 ? 'text-[#1E293B]' : 'text-[#64748B]'}`}>Select Date</span>
          </div>
          
          <div className="flex-1 h-px bg-[#E2E8F0]"></div>
          
          {/* Step 2 */}
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-medium ${step >= 2 ? 'bg-[#0046CE] text-white' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
              2
            </div>
            <span className={`font-medium ${step >= 2 ? 'text-[#1E293B]' : 'text-[#64748B]'}`}>Pick Time</span>
          </div>
          
          <div className="flex-1 h-px bg-[#E2E8F0]"></div>
          
          {/* Step 3 */}
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-medium ${step >= 3 ? 'bg-[#0046CE] text-white' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
              3
            </div>
            <span className={`font-medium ${step >= 3 ? 'text-[#1E293B]' : 'text-[#64748B]'}`}>Confirm</span>
          </div>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          
          {/* Left (col-span-3) — Calendar & Slots */}
          <div className="md:col-span-3">
            
            {/* Calendar */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
              {/* Month nav */}
              <div className="flex justify-between items-center">
                <button onClick={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} className="p-1 hover:bg-[#F1F5F9] rounded-lg transition">
                  <ChevronLeft className="w-5 h-5 text-[#64748B]" />
                </button>
                <div className="text-base font-semibold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>
                  {monthDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                </div>
                <button onClick={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} className="p-1 hover:bg-[#F1F5F9] rounded-lg transition">
                  <ChevronRight className="w-5 h-5 text-[#64748B]" />
                </button>
              </div>
              
              {/* Day grid */}
              <div className="grid grid-cols-7 gap-1 mt-4">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                  <div key={d} className="text-xs text-[#64748B] text-center py-2">{d}</div>
                ))}
                
                {days.map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} className="w-9 h-9" />;
                  
                  const isoDate = day.toISOString().slice(0, 10);
                  const isPast = new Date(isoDate) < new Date().setHours(0, 0, 0, 0);
                  const isSelected = selectedDate === isoDate;
                  
                  return (
                    <div key={isoDate} className="flex justify-center items-center">
                      <button
                        type="button"
                        disabled={isPast}
                        onClick={() => handleDateSelect(day)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition
                          ${isPast ? 'text-[#CBD5E1] cursor-not-allowed' 
                            : isSelected ? 'bg-[#0046CE] text-white font-medium' 
                            : 'text-[#1E293B] hover:bg-[#EFF6FF] cursor-pointer'}`}
                      >
                        {day.getDate()}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-[#1E293B] flex items-center gap-1">
                  <Info className="w-4 h-4 text-[#0046CE]" /> Available Time Slots
                </h2>
                
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {slots.length > 0 ? slots.map((slot) => {
                    const isAvailable = slot.available !== false && !slot.booked;
                    const isSelected = selectedSlot === slot.slot;
                    
                    return (
                      <button
                        key={slot.slot}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => { setSelectedSlot(slot.slot); setStep(3); }}
                        className={`border rounded-lg py-2 text-center text-sm transition
                          ${!isAvailable ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#CBD5E1] cursor-not-allowed line-through' 
                            : isSelected ? 'bg-[#0046CE] border-[#0046CE] text-white font-medium' 
                            : 'bg-white border-[#E2E8F0] text-[#1E293B] hover:border-[#0046CE] hover:text-[#0046CE] cursor-pointer'}`}
                      >
                        {slot.slot}
                      </button>
                    );
                  }) : (
                    <div className="col-span-3 text-sm text-[#64748B] p-4 bg-[#F8FAFC] rounded-xl text-center border border-[#E2E8F0]">
                      No slots available for this date.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right (col-span-2) — Booking summary card */}
          <div className="md:col-span-2">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm sticky top-6">
              
              <img src={vet?.imageUrl || '/profile.png'} alt={vet?.name} className="w-full h-20 object-cover rounded-lg bg-[#F1F5F9]" />
              
              <h3 className="font-semibold text-[#1E293B] mt-3">{vet?.name}</h3>
              <p className="text-sm text-[#64748B]">{vet?.specialisation || 'General Practice'}</p>
              
              <div className="mt-3 space-y-2">
                <div className="flex items-start gap-2 text-sm text-[#64748B]">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{vet?.clinicName || vet?.location || 'Clinic Details Unavailable'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#64748B]">
                  <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                  <span>{selectedDate ? formatDate(selectedDate) : 'Select a date'} {selectedSlot && `• ${selectedSlot}`}</span>
                </div>
              </div>

              {/* Pet Selection */}
              <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
                <label className="block text-xs font-semibold text-[#64748B] uppercase mb-2">Patient Details</label>
                <select 
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0046CE]"
                  value={selectedPetId} 
                  onChange={(e) => setSelectedPetId(e.target.value)}
                >
                  <option value="">Select your pet...</option>
                  {pets.map((pet) => <option key={pet._id} value={pet._id}>{pet.name}</option>)}
                </select>
              </div>

              {/* Fee Breakdown */}
              <h4 className="text-xs font-semibold text-[#64748B] uppercase mt-4">Fee Breakdown</h4>
              <div className="space-y-1 mt-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Consultation Fee</span>
                  <span className="text-[#1E293B]">NPR {fee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Service Charge (5%)</span>
                  <span className="text-[#1E293B]">NPR {serviceCharge}</span>
                </div>
                <div className="border-t border-[#E2E8F0] my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#1E293B]">Total Payable</span>
                  <span className="font-bold text-[#0046CE] text-base">NPR {total}</span>
                </div>
              </div>

              <button 
                onClick={handleSubmit} 
                disabled={!selectedDate || !selectedSlot || !selectedPetId || submitting}
                className="w-full bg-[#0046CE] text-white rounded-lg py-3 text-sm font-semibold mt-4 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? 'Confirming...' : 'Confirm booking →'}
              </button>
              
              <div className="text-xs text-[#64748B] text-center mt-2">
                By confirming, you agree to PetSneha's terms of service.
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
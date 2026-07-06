import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createHealthRecord, getPet } from '../../api/pet.api';
import { getErrorMessage } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

export default function AddHealthRecordPage() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [pet, setPet] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [recordForm, setRecordForm] = useState({ 
    title: '', 
    type: 'other', 
    customType: '', 
    date: '', 
    nextDueDate: '', 
    status: 'done', 
    description: '' 
  });

  useEffect(() => {
    const loadPet = async () => {
      try {
        const res = await getPet(petId);
        setPet(res.data?.pet || res.data);
      } catch (error) {
        addToast(getErrorMessage(error) || 'Failed to load pet', 'danger');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    if (petId) loadPet();
  }, [petId, navigate, addToast]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (recordForm.type === 'other' && !recordForm.customType.trim()) {
      addToast('Please specify the custom record type.', 'danger');
      return;
    }

    try {
      setSubmitting(true);
      await createHealthRecord(petId, recordForm);
      addToast('Health record added successfully', 'success');
      navigate(`/pets/${petId}`);
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[#64748B]">Loading...</div>;
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="w-full px-[24px] lg:px-[64px] pt-[32px] pb-[48px]">
        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1E293B] mb-1" style={{ fontFamily: 'Literata, serif' }}>
              Add Health Record
            </h1>
            <p className="text-sm text-[#64748B]">
              Add a new health record for {pet?.name || 'your pet'}.
            </p>
          </div>
          <button 
            onClick={() => navigate(`/pets/${petId}`)}
            className="flex items-center gap-1.5 text-sm text-[#64748B] border border-[#E2E8F0] rounded-lg px-4 py-2 hover:bg-[#F8FAFC] transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1">Title</label>
              <input 
                type="text" 
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0046CE]" 
                value={recordForm.title} 
                onChange={(event) => setRecordForm((current) => ({ ...current, title: event.target.value }))} 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1">Type</label>
              <select 
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0046CE]" 
                value={recordForm.type} 
                onChange={(event) => setRecordForm((current) => ({ ...current, type: event.target.value }))}
              >
                <option value="other">Other</option>
                <option value="vaccination">Vaccination</option>
                <option value="checkup">Checkup</option>
                <option value="treatment">Treatment</option>
                <option value="deworming">Deworming</option>
              </select>
            </div>
            
            {recordForm.type === 'other' && (
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1">Specify type</label>
                <input
                  type="text"
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0046CE]"
                  value={recordForm.customType}
                  onChange={(event) => setRecordForm((current) => ({ ...current, customType: event.target.value }))}
                  placeholder="e.g. flea treatment, surgery follow-up"
                  required
                />
              </div>
            )}
            
            <div>
              <label className="block text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1">Date *</label>
              <input 
                type="date" 
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0046CE]" 
                value={recordForm.date} 
                onChange={(event) => setRecordForm((current) => ({ ...current, date: event.target.value }))} 
                required 
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1">Next due date</label>
              <input 
                type="date" 
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0046CE]" 
                value={recordForm.nextDueDate} 
                onChange={(event) => setRecordForm((current) => ({ ...current, nextDueDate: event.target.value }))} 
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1">Status</label>
              <select 
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0046CE]" 
                value={recordForm.status} 
                onChange={(event) => setRecordForm((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="done">Done</option>
                <option value="upcoming">Upcoming</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1">Description</label>
            <textarea 
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0046CE] resize-none" 
              rows={4} 
              value={recordForm.description} 
              onChange={(event) => setRecordForm((current) => ({ ...current, description: event.target.value }))} 
              placeholder="Add any relevant notes or observations..."
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button 
              type="submit" 
              disabled={submitting} 
              className="bg-[#0046CE] hover:bg-blue-700 text-white rounded-lg px-8 py-2.5 text-sm font-semibold transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving record...' : 'Save health record'}
            </button>
            <button 
              type="button" 
              className="px-6 py-2.5 text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg transition" 
              onClick={() => navigate(`/pets/${petId}`)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

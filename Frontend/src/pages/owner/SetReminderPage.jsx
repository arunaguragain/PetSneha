import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Input, Select, Textarea } from '../../components/ui';
import { createReminder, getPets, updateReminder } from '../../api/pet.api';
import { getErrorMessage, unwrapItems } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft } from 'lucide-react';

const leadOptions = [1, 2, 3, 7, 14];

export default function SetReminderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { addToast } = useToast();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const editReminder = location.state?.reminder;
  const isEditMode = !!editReminder;

  // Check if the title is one of our standard options
  const standardOptions = ['Vaccination', 'Deworming', 'Grooming', 'Vet visit'];
  const initialTitle = editReminder ? (standardOptions.includes(editReminder.title) ? editReminder.title : '') : '';
  const initialCustomTitle = editReminder && !standardOptions.includes(editReminder.title) ? editReminder.title : '';
  const initialDueDate = editReminder?.dueDate ? new Date(editReminder.dueDate).toISOString().split('T')[0] : '';

  const [form, setForm] = useState({
    title: initialTitle,
    customTitle: initialCustomTitle,
    dueDate: initialDueDate,
    leadTime: editReminder?.leadTime ?? 7,
    notifyVia: editReminder?.notifyVia || ['email'],
    petId: editReminder?.petId?._id || editReminder?.petId || params.get('petId') || '',
    notes: editReminder?.notes || '',
  });

  useEffect(() => {
    const loadPets = async () => {
      try {
        const response = await getPets();
        setPets(unwrapItems(response));
      } catch (apiError) {
        addToast(getErrorMessage(apiError), 'danger');
      } finally {
        setPageLoading(false);
      }
    };

    loadPets();
  }, [addToast]);

  const handleChange = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const payload = {
        petId: form.petId,
        title: form.title || form.customTitle,
        dueDate: form.dueDate,
        leadTime: Number(form.leadTime),
        notifyVia: form.notifyVia,
        notes: form.notes,
      };

      let response;
      if (isEditMode) {
        response = await updateReminder(editReminder._id || editReminder.id, payload);
      } else {
        response = await createReminder(payload);
      }
      
      const reminder = response?.reminder || response?.data?.reminder || payload;
      addToast(isEditMode ? '✓ Reminder updated!' : '✓ Reminder saved!', 'success');
      navigate('/reminders/success', { state: { reminder, pet: pets.find((pet) => String(pet._id || pet.id) === String(form.petId)) || null, isUpdate: isEditMode } });
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="w-full px-[24px] lg:px-[64px] pt-[32px] pb-[48px]">
        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1E293B] mb-1" style={{ fontFamily: 'Literata, serif' }}>
              {isEditMode ? 'Edit Reminder' : 'Set Reminder'}
            </h1>
            <p className="text-sm text-[#64748B]">Schedule a health event or reminder for your pet.</p>
          </div>
          <button
            onClick={() => {
              if (location.state?.from) {
                navigate(location.state.from);
              } else {
                navigate(-1);
              }
            }}
            className="flex items-center gap-1.5 text-sm text-[#64748B] border border-[#E2E8F0] rounded-lg px-4 py-2 hover:bg-[#F8FAFC] transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Reminder type + custom */}
          <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
            <div>
              <label className="block text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1">Reminder type</label>
              <select
                value={form.title}
                onChange={handleChange('title')}
                disabled={pageLoading}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#0046CE]"
              >
                <option value="">Choose type</option>
                <option>Vaccination</option>
                <option>Deworming</option>
                <option>Grooming</option>
                <option>Vet visit</option>
              </select>
            </div>
            <div className="hidden md:flex items-end pb-3 justify-center text-sm text-[#64748B]">or</div>
            <div>
              <label className="block text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1">Custom reminder</label>
              <input
                type="text"
                value={form.customTitle}
                onChange={handleChange('customTitle')}
                placeholder="e.g. Flea treatment"
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#0046CE]"
              />
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1">Due date <span className="text-red-500">*</span></label>
            <input
              type="date"
              required
              value={form.dueDate}
              onChange={handleChange('dueDate')}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#0046CE]"
            />
          </div>

          {/* Lead time */}
          <div>
            <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide mb-2">Lead time</p>
            <div className="flex flex-wrap gap-2">
              {leadOptions.map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, leadTime: days }))}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    Number(form.leadTime) === days
                      ? 'border-[#0046CE] bg-[#0046CE] text-white'
                      : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#0046CE] hover:text-[#0046CE]'
                  }`}
                >
                  {days === 7 ? '1 week' : days === 14 ? '2 weeks' : `${days} day${days > 1 ? 's' : ''}`}
                </button>
              ))}
            </div>
          </div>

          {/* Pet */}
          <div>
            <label className="block text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1">Pet <span className="text-red-500">*</span></label>
            <select
              value={form.petId}
              onChange={handleChange('petId')}
              required
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#0046CE]"
            >
              <option value="">Select pet</option>
              {pets.map((pet) => (
                <option key={pet._id || pet.id} value={pet._id || pet.id}>{pet.name}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={handleChange('notes')}
              rows={4}
              placeholder="Any extra details..."
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#0046CE] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="border border-[#E2E8F0] text-[#64748B] rounded-lg px-5 py-2.5 text-sm hover:bg-[#F8FAFC] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0046CE] hover:bg-blue-700 text-white rounded-lg px-5 py-2.5 text-sm font-semibold transition disabled:opacity-70"
            >
              {loading ? 'Saving…' : 'Save reminder →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
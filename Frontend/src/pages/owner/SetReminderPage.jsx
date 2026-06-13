import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, Input, Select, Textarea } from '../../components/ui';
import { createReminder, getPets } from '../../api/pet.api';
import { getErrorMessage, unwrapItems } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const leadOptions = [1, 2, 3, 7, 14];

export default function SetReminderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { addToast } = useToast();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [form, setForm] = useState({
    title: '',
    customTitle: '',
    dueDate: '',
    leadTime: 7,
    notifyVia: ['push', 'email'],
    petId: params.get('petId') || '',
    notes: '',
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

  const toggleNotify = (channel) => {
    setForm((current) => {
      const existing = current.notifyVia.includes(channel);
      return { ...current, notifyVia: existing ? current.notifyVia.filter((item) => item !== channel) : [...current.notifyVia, channel] };
    });
  };

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

      const response = await createReminder(payload);
      const reminder = response?.reminder || response?.data?.reminder || payload;
      addToast('✓ Reminder saved!', 'success');
      navigate('/reminders/success', { state: { reminder, pet: pets.find((pet) => String(pet._id || pet.id) === String(form.petId)) || null } });
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-10">
      <div className="container-app max-w-[600px] px-10 py-5">
        <Link to={location.state?.from || '/dashboard'} className="font-semibold text-neutral-600 hover:text-primary-600">← Back</Link>
      </div>

      <div className="container-app max-w-[600px] px-10">
        <Card className="p-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
              <Select label="Reminder type" value={form.title} onChange={handleChange('title')} disabled={pageLoading}>
                <option value="">Choose type</option>
                <option>Vaccination</option>
                <option>Deworming</option>
                <option>Grooming</option>
                <option>Vet visit</option>
              </Select>
              <div className="hidden md:block pb-4 text-center text-body-md text-neutral-500">or</div>
              <Input label="Custom reminder" value={form.customTitle} onChange={handleChange('customTitle')} />
            </div>

            <Input label="Due date" type="date" required value={form.dueDate} onChange={handleChange('dueDate')} />

            <div>
              <p className="mb-2 text-label-lg text-neutral-900">Lead time</p>
              <div className="flex flex-wrap gap-2">
                {leadOptions.map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, leadTime: days }))}
                    className={`rounded-full border px-4 py-2 text-label-lg transition ${Number(form.leadTime) === days ? 'border-primary-600 bg-primary-600 text-white' : 'border-neutral-200 bg-white text-neutral-700'}`}
                  >
                    {days === 7 ? '1 week' : days === 14 ? '2 weeks' : `${days} day${days > 1 ? 's' : ''}`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-label-lg text-neutral-900">Notify via</p>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-body-md text-neutral-600">
                  <input type="checkbox" checked={form.notifyVia.includes('push')} onChange={() => toggleNotify('push')} className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-600/15" />
                  Push notification ✓
                </label>
                <label className="flex items-center gap-2 text-body-md text-neutral-600">
                  <input type="checkbox" checked={form.notifyVia.includes('email')} onChange={() => toggleNotify('email')} className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-600/15" />
                  Email ✓
                </label>
              </div>
            </div>

            <Select label="Pet" value={form.petId} onChange={handleChange('petId')} required>
              <option value="">Select pet</option>
              {pets.map((pet) => (
                <option key={pet._id || pet.id} value={pet._id || pet.id}>{pet.name}</option>
              ))}
            </Select>

            <Textarea label="Notes" value={form.notes} onChange={handleChange('notes')} rows={4} />

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" loading={loading}>Save reminder →</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPet, updatePet } from '../../api/pet.api';
import { getErrorMessage } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { Camera, CheckCircle2 } from 'lucide-react';

export default function EditPetPage() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const fileRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [ownedSince, setOwnedSince] = useState('');
  const [breed, setBreed] = useState('');
  const [species, setSpecies] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [colour, setColour] = useState('');
  const [gender, setGender] = useState('');
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState('');
  const [errors, setErrors] = useState({});

  const getPhotoUrl = (photoSrc) => {
    if (!photoSrc) return '';
    if (photoSrc.startsWith('http')) return photoSrc;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5050/api').replace('/api', '');
    return `${baseUrl}${photoSrc}`;
  };

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const res = await getPet(petId);
        const data = res.data?.pet || res.data;
        if (data) {
          setName(data.name || '');
          setSpecies(data.species || '');
          setBreed(data.breed || '');
          setAge(data.age !== undefined ? String(data.age) : '');
          setWeight(data.weight !== undefined ? String(data.weight) : '');
          setColour(data.colour || '');
          setGender(data.gender ? data.gender.charAt(0).toUpperCase() + data.gender.slice(1) : '');
          if (data.ownedSince) {
            setOwnedSince(`${data.ownedSince}-01-01`);
          }
          if (data.photo || data.imageUrl) {
            setPreview(getPhotoUrl(data.photo || data.imageUrl));
          }
        }
      } catch (err) {
        addToast('Failed to load pet details', 'danger');
      }
    };
    fetchPet();
  }, [petId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') navigate(-1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!species.trim()) newErrors.species = 'Species is required';
    if (!breed.trim()) newErrors.breed = 'Breed is required';
    if (!gender) newErrors.gender = 'Gender selection is required';

    if (age !== '' && parseInt(age) < 0) {
      newErrors.age = 'Cannot be negative';
    }
    if (weight !== '' && parseFloat(weight) < 0) {
      newErrors.weight = 'Cannot be negative';
    }

    if (ownedSince) {
      const selectedDate = new Date(ownedSince);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        newErrors.ownedSince = 'Cannot be in future';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('species', species.toLowerCase());
      formData.append('breed', breed.trim());
      formData.append('age', parseInt(age) || 0);
      formData.append('weight', parseFloat(weight) || 0);
      formData.append('colour', colour.trim());
      formData.append('gender', gender.toLowerCase());

      let year = new Date().getFullYear();
      if (ownedSince) {
        const parsedYear = parseInt(ownedSince.split('-')[0]) || parseInt(ownedSince);
        if (parsedYear) {
          year = parsedYear;
        }
      }
      formData.append('ownedSince', year);

      if (photo) formData.append('photo', photo);

      await updatePet(petId, formData);

      addToast(`✓ ${name} updated successfully!`, 'success');
      navigate(`/pets/${petId}`);
    } catch (error) {
      addToast(getErrorMessage(error) || 'Failed to update pet. Please try again.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1E293B]/65 backdrop-blur-sm p-4 overflow-hidden">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="p-5 pb-3 border-b border-[#F1F5F9]">
          <h2 className="text-xl font-bold text-[#0046CE] leading-tight" style={{ fontFamily: 'Literata, serif' }}>
            Edit Companion Profile
          </h2>
          <p className="text-[#64748B] text-[11px] mt-0.5">
            Update the details below for your pet's clinical health records.
          </p>
        </div>

        {/* Scrollable form container just in case height is very restricted */}
        <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Photo Upload Row */}
          <div className="flex items-center gap-4 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
            <div 
              onClick={() => fileRef.current?.click()}
              className="relative w-16 h-16 rounded-xl border-2 border-dashed border-[#CBD5E1] flex items-center justify-center cursor-pointer hover:border-[#0046CE] transition-all overflow-hidden bg-white shrink-0 group"
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-5 h-5 text-[#64748B] group-hover:text-[#0046CE] transition-colors" />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs font-semibold text-[#1E293B]">Pet Photo</p>
              <p className="text-[10px] text-[#64748B] mt-0.5">High quality JPG or PNG (Max 5MB)</p>
              <button 
                type="button" 
                onClick={() => fileRef.current?.click()}
                className="mt-1.5 text-xs text-[#0046CE] font-bold hover:underline text-left block"
              >
                {preview ? 'Change Photo' : 'Upload Photo'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>
          </div>          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#475569]">Pet Name</label>
                {errors.name && <span className="text-[10px] text-red-500 font-semibold">{errors.name}</span>}
              </div>
              <input 
                type="text" 
                placeholder="Enter name"
                className={`w-full bg-white border ${errors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-[#E2E8F0] focus:border-[#0046CE] focus:ring-[#0046CE]'} rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 transition-all placeholder:text-[#94A3B8]`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#475569]">Species</label>
                  {errors.species && <span className="text-[10px] text-red-500 font-semibold">{errors.species}</span>}
                </div>
                <input 
                  type="text" 
                  placeholder="e.g. Dog"
                  className={`w-full bg-white border ${errors.species ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-[#E2E8F0] focus:border-[#0046CE] focus:ring-[#0046CE]'} rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 transition-all placeholder:text-[#94A3B8]`}
                  value={species}
                  onChange={(e) => {
                    setSpecies(e.target.value);
                    if (errors.species) setErrors(prev => ({ ...prev, species: null }));
                  }}
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#475569]">Breed</label>
                  {errors.breed && <span className="text-[10px] text-red-500 font-semibold">{errors.breed}</span>}
                </div>
                <input 
                  type="text" 
                  placeholder="e.g. Golden Retriever"
                  className={`w-full bg-white border ${errors.breed ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-[#E2E8F0] focus:border-[#0046CE] focus:ring-[#0046CE]'} rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 transition-all placeholder:text-[#94A3B8]`}
                  value={breed}
                  onChange={(e) => {
                    setBreed(e.target.value);
                    if (errors.breed) setErrors(prev => ({ ...prev, breed: null }));
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#475569]">Owned Since</label>
                  {errors.ownedSince && <span className="text-[10px] text-red-500 font-semibold">{errors.ownedSince}</span>}
                </div>
                <input 
                  type="date" 
                  max={todayStr}
                  className={`w-full bg-white border ${errors.ownedSince ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-[#E2E8F0] focus:border-[#0046CE] focus:ring-[#0046CE]'} rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 transition-all text-[#1E293B]`}
                  value={ownedSince}
                  onChange={(e) => {
                    setOwnedSince(e.target.value);
                    if (errors.ownedSince) setErrors(prev => ({ ...prev, ownedSince: null }));
                  }}
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#475569]">Age (Years)</label>
                  {errors.age && <span className="text-[10px] text-red-500 font-semibold">{errors.age}</span>}
                </div>
                <input 
                  type="number" 
                  min="0"
                  placeholder="0"
                  className={`w-full bg-white border ${errors.age ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-[#E2E8F0] focus:border-[#0046CE] focus:ring-[#0046CE]'} rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 transition-all placeholder:text-[#94A3B8]`}
                  value={age}
                  onChange={(e) => {
                    setAge(e.target.value);
                    if (errors.age) setErrors(prev => ({ ...prev, age: null }));
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#475569]">Weight (kg)</label>
                  {errors.weight && <span className="text-[10px] text-red-500 font-semibold">{errors.weight}</span>}
                </div>
                <input 
                  type="number" 
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  className={`w-full bg-white border ${errors.weight ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-[#E2E8F0] focus:border-[#0046CE] focus:ring-[#0046CE]'} rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 transition-all placeholder:text-[#94A3B8]`}
                  value={weight}
                  onChange={(e) => {
                    setWeight(e.target.value);
                    if (errors.weight) setErrors(prev => ({ ...prev, weight: null }));
                  }}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#475569] mb-1">Colour</label>
                <input 
                  type="text" 
                  placeholder="e.g. Golden, Brindle"
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#0046CE] focus:ring-1 focus:ring-[#0046CE] transition-all placeholder:text-[#94A3B8]"
                  value={colour}
                  onChange={(e) => setColour(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#475569]">Gender</label>
                {errors.gender && <span className="text-[10px] text-red-500 font-semibold">{errors.gender}</span>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setGender('Male');
                    if (errors.gender) setErrors(prev => ({ ...prev, gender: null }));
                  }}
                  className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    gender === 'Male' 
                      ? 'border-[#0046CE] bg-[#EFF6FF] text-[#0046CE]' 
                      : 'border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC]'
                  } ${errors.gender && !gender ? 'border-red-500' : ''}`}
                >
                  <span className="text-base leading-none">♂</span> Male
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setGender('Female');
                    if (errors.gender) setErrors(prev => ({ ...prev, gender: null }));
                  }}
                  className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    gender === 'Female' 
                      ? 'border-[#0046CE] bg-[#EFF6FF] text-[#0046CE]' 
                      : 'border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC]'
                  } ${errors.gender && !gender ? 'border-red-500' : ''}`}
                >
                  <span className="text-base leading-none">♀</span> Female
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="flex-[0.4] py-2 rounded-lg border border-[#0046CE] text-[#0046CE] font-semibold text-xs hover:bg-[#EFF6FF] transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#0046CE] hover:bg-[#003DA8] text-white font-semibold text-xs transition-colors disabled:opacity-70 shadow-[0_4px_10px_rgba(0,70,206,0.2)]"
            >
              {loading ? 'Saving...' : (
                <>
                  <CheckCircle2 size={15} />
                  Save Changes
                </>
              )}
            </button>
          </div>

          <p className="text-center text-[10px] text-[#94A3B8] italic pt-1">
            By editing, you agree to PetSneha's clinical data privacy policy.
          </p>
        </form>
      </div>
    </div>
  );
}

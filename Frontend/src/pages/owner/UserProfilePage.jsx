import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button, Card, Input } from '../../components/ui';
import { updateProfile } from '../../api/user.api';
import { getPets } from '../../api/pet.api';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage, getPetEmoji } from '../../utils/api';
import { getImageUrl } from '../../utils/imageUrl';
import { Camera, Save, User as UserIcon, PawPrint, PlusCircle } from 'lucide-react';

export default function UserProfilePage() {
  const { t } = useTranslation();
  const { user, updateUserLocally } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '', // Email is usually read-only, but we'll show it
    phone: user?.phone || '',
  });
  const [photoPreview, setPhotoPreview] = useState(user?.profilePhoto ? getImageUrl(user?.profilePhoto) : null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [pets, setPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getPets()
      .then(res => {
        const petsList = res.data?.pets || res.data?.items || (Array.isArray(res.data) ? res.data : res || []);
        setPets(petsList);
        setLoadingPets(false);
      })
      .catch(err => {
        console.error("Failed to fetch pets", err);
        setLoadingPets(false);
      });
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      addToast('Name is required', 'danger');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('phone', formData.phone);
      if (selectedFile) {
        data.append('profilePhoto', selectedFile);
      }

      const response = await updateProfile(data);
      const updatedUser = response?.data?.user || response?.data?.data?.user;
      
      if (updatedUser) {
        updateUserLocally(updatedUser);
      }
      
      addToast(t('settings.profileUpdated', 'Profile updated successfully'), 'success');
      setSelectedFile(null); // Clear selected file after save
    } catch (error) {
      addToast(getErrorMessage(error), 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1440px] mx-auto px-8 py-10">
        <h1 className="text-3xl font-bold text-[#1E293B] mb-8" style={{ fontFamily: 'Literata, serif' }}>
          {t('settings.myProfile', 'My Profile')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Settings Column */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8 shadow-sm border border-[#E2E8F0]">
              <div className="flex flex-col md:flex-row gap-10">
                {/* Photo Section */}
                <div className="flex flex-col items-center space-y-4 shrink-0">
                  <div className="relative w-40 h-40 rounded-full overflow-hidden bg-[#F1F5F9] border-4 border-white shadow-lg flex items-center justify-center group">
                    {photoPreview ? (
                      <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-20 h-20 text-[#94A3B8]" />
                    )}
                    
                    {/* Overlay for clicking */}
                    <div 
                      className="absolute inset-0 bg-[#0F172A]/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="w-8 h-8 mb-2" />
                      <span className="text-xs font-semibold tracking-wide">CHANGE PHOTO</span>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                </div>

                {/* Form Section */}
                <div className="flex-1 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#475569] mb-1.5 uppercase tracking-wide">
                      {t('auth.name', 'Full Name')} <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Jane Doe"
                      className="text-lg py-3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#475569] mb-1.5 uppercase tracking-wide">
                      {t('auth.email', 'Email Address')}
                    </label>
                    <Input 
                      value={formData.email}
                      disabled
                      className="bg-[#F1F5F9] text-[#64748B] cursor-not-allowed text-lg py-3"
                    />
                    <p className="text-xs text-[#94A3B8] mt-1.5 font-medium">Email address cannot be changed.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#475569] mb-1.5 uppercase tracking-wide">
                      {t('auth.phone', 'Phone Number')}
                    </label>
                    <Input 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +977 9800000000"
                      className="text-lg py-3"
                    />
                  </div>

                  <div className="pt-6 flex justify-end border-t border-[#F1F5F9] mt-6">
                    <Button 
                      onClick={handleSave} 
                      loading={loading}
                      className="min-w-[160px] flex items-center justify-center gap-2 py-3 bg-[#0046CE] hover:bg-[#003DA8]"
                    >
                      <Save className="w-4 h-4" />
                      {t('buttons.save', 'Save Changes')}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: My Pets */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="p-6 shadow-sm border border-[#E2E8F0]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#1E293B] flex items-center gap-2" style={{ fontFamily: 'Literata, serif' }}>
                  <PawPrint className="w-5 h-5 text-[#0046CE]" />
                  My Pets
                </h2>
              </div>

              {loadingPets ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-4 bg-[#F8FAFC] p-4 rounded-xl">
                      <div className="w-12 h-12 bg-[#E2E8F0] rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-[#E2E8F0] rounded w-24"></div>
                        <div className="h-3 bg-[#E2E8F0] rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : pets.length > 0 ? (
                <div className="space-y-4">
                  {pets.map((pet) => (
                    <Link
                      key={pet._id || pet.id}
                      to={`/pets/${pet._id || pet.id}`}
                      className="flex items-center gap-4 p-4 rounded-xl border border-[#E2E8F0] hover:border-[#BFDBFE] hover:bg-[#EFF6FF] transition group"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex items-center justify-center border border-[#E2E8F0] shrink-0">
                        {pet.photo ? (
                          <img 
                            src={getImageUrl(pet.photo)} 
                            alt="" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span className="text-2xl">{getPetEmoji(pet.species)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-[#1E293B] truncate group-hover:text-[#0046CE] transition">
                          {pet.name}
                        </div>
                        <div className="text-xs font-medium text-[#64748B] uppercase tracking-wide truncate">
                          {pet.breed || pet.species}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-[#64748B] text-sm">
                  You don't have any pets registered yet.
                </div>
              )}

              <Button 
                variant="secondary" 
                onClick={() => navigate('/pets/new')}
                className="w-full mt-6 flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Add New Pet
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

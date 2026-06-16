import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Badge, Button, Card, Input, Skeleton, VerifiedBadge } from '../../components/ui';
import { getVets, saveVet } from '../../api/vet.api';
import { getErrorMessage, formatCurrency, unwrapItems } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { setSavedVet } from '../../utils/ownerState';
import { Search, MapPin, Receipt, PawPrint, Heart, Star, Check } from 'lucide-react';


export default function VetDirectoryPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [vets, setVets] = useState([]);
  const [search, setSearch] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [maxFee, setMaxFee] = useState('');
  const [feeMenuOpen, setFeeMenuOpen] = useState(false);
  const feeMenuRef = useRef(null);

  const loadVets = async (params = {}) => {
    try {
      setLoading(true);
      const response = await getVets(params);
      const vetsList = response.data?.vets
        || response.data?.items
        || (Array.isArray(response.data) ? response.data : response || []);
      setVets(vetsList);
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVets({ search, isVerified: verifiedOnly || undefined, maxFee: maxFee || undefined });
  }, [search, verifiedOnly, maxFee]);

  const filteredVets = useMemo(() => vets.filter((vet) => {
    const matchesSearch = [vet.name, vet.specialisation, vet.location, vet.clinicName].filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase());
    const matchesSaved = !savedOnly || String(vet._id) === String(localStorage.getItem('petsneha_saved_vet_id') || '');
    return matchesSearch && matchesSaved;
  }), [savedOnly, search, vets]);

  const handleSaveVet = async (vet) => {
    try {
      await saveVet(vet._id);
      setSavedVet(vet);
      localStorage.setItem('petsneha_saved_vet_id', vet._id);
      addToast('✓ Saved as your vet!', 'success');
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8 relative">
        <h1 className="text-2xl font-semibold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>Find Verified Vets</h1>
        
        {/* Filter bar */}
        <div className="flex items-center gap-3 mt-4 relative">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by name, clinic, or specialization..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-[#0046CE] transition"
            />
          </div>
          
          <button 
            type="button" 
            onClick={() => setVerifiedOnly(!verifiedOnly)} 
            className={`rounded-full px-4 py-2 text-sm transition ${verifiedOnly ? 'bg-[#0046CE] text-white font-medium' : 'bg-white border border-[#E2E8F0] text-[#1E293B]'}`}
          >
            ✓ Verified only
          </button>
          
          <div ref={feeMenuRef}>
            <button 
              type="button" 
              onClick={() => setFeeMenuOpen(!feeMenuOpen)} 
              className={`rounded-full px-4 py-2 text-sm transition ${maxFee ? 'bg-[#0046CE] text-white border-[#0046CE]' : 'bg-white border border-[#E2E8F0] text-[#1E293B]'}`}
            >
              Fee range ▾
            </button>
            
            {feeMenuOpen && (
              <div className="absolute top-14 left-0 md:left-auto right-auto md:right-32 bg-white border border-[#E2E8F0] rounded-xl shadow-md p-4 w-72 z-10">
                <p className="text-sm font-medium text-[#1E293B]">Fee Range</p>
                <div className="mt-4 px-2">
                  <input 
                    type="range" 
                    min="0" 
                    max="2000" 
                    step="100"
                    value={maxFee || 2000} 
                    onChange={(e) => setMaxFee(e.target.value)}
                    className="w-full accent-[#0046CE]"
                  />
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-full px-4 py-2 text-sm text-center flex-1">Rs 0</div>
                  <span className="text-[#64748B]">-</span>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-full px-4 py-2 text-sm text-center flex-1">Rs {maxFee || 2000}</div>
                </div>
              </div>
            )}
          </div>
          
          <button 
            type="button" 
            onClick={() => setSavedOnly(!savedOnly)} 
            className={`rounded-full px-4 py-2 text-sm transition ${savedOnly ? 'bg-[#0046CE] text-white font-medium' : 'bg-white border border-[#E2E8F0] text-[#1E293B]'}`}
          >
            □ Saved vets
          </button>
        </div>

        {/* Vet grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 bg-[#F8FAFC] rounded-xl animate-pulse border border-[#E2E8F0]" />)
          ) : filteredVets.map((vet) => (
            <div 
              key={vet._id} 
              className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              onClick={() => navigate(`/vets/${vet._id}`)}
            >
              <div>
                {/* Top row */}
                <div className="flex items-start gap-3">
                  <img
                    src={vet.profilePhoto || vet.imageUrl || '/profile.png'}
                    alt={vet.name}
                    className="w-16 h-16 rounded-xl object-cover bg-[#F1F5F9]"
                    onError={(e) => { e.currentTarget.src = '/profile.png'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[#1E293B] text-base truncate">{vet.name}</h3>
                        {(vet.isVerified || true) && (
                          <span className="inline-flex items-center gap-1 bg-[#EFF6FF] text-[#0046CE] text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
                            <Check className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-[#64748B] flex items-center gap-1 flex-shrink-0">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" /> 4.9 (124)
                      </div>
                    </div>
                    <div className="text-sm text-[#64748B] mt-1 truncate">{vet.specialisation || 'General Practice'}</div>
                  </div>
                </div>
                
                {/* Location row */}
                <div className="flex items-center gap-4 mt-3 text-xs text-[#64748B] flex-wrap">
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <MapPin className="w-3.5 h-3.5" /> {vet.location || vet.clinicName || 'Kathmandu'}
                  </div>
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <Receipt className="w-3.5 h-3.5" /> {formatCurrency(vet.consultationFee || vet.fee || 800)}
                  </div>
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <PawPrint className="w-3.5 h-3.5" /> Small Animal Care
                  </div>
                </div>
              </div>
              
              {/* Bottom row */}
              <div className="flex items-center gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => navigate(`/vets/${vet._id}/book`)}
                  className="flex-1 bg-[#0046CE] hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium transition"
                >
                  Book Now
                </button>
                <button 
                  onClick={() => handleSaveVet(vet)}
                  className="w-10 h-10 border border-[#E2E8F0] hover:border-red-500 rounded-lg flex items-center justify-center text-[#64748B] hover:text-red-500 transition flex-shrink-0"
                  title="Save Vet"
                >
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
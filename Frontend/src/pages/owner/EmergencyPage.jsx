import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Skeleton, VerifiedBadge, Avatar } from '../../components/ui';
import { getEmergencyVets } from '../../api/vet.api';
import { formatCurrency, getErrorMessage, unwrapItems } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { AlertTriangle, MapPin, Phone, Navigation, Crosshair } from 'lucide-react';

export default function EmergencyPage() {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [clinics, setClinics] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const response = await getEmergencyVets();
        setClinics(unwrapItems(response));
      } catch (apiError) {
        addToast(getErrorMessage(apiError), 'danger');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [addToast]);

  return (
    <div className="bg-white min-h-screen">
      
      {/* Emergency banner */}
      <div className="w-full bg-red-600 text-white text-sm py-3 px-6 flex items-center justify-center gap-2">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <span className="font-medium text-center">URGENT: Emergency Mode Active. Showing nearest 24/7 open clinics.</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        
        {/* Heading */}
        <h1 className="text-2xl font-semibold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>Emergency Care Finder</h1>
        <p className="text-sm text-[#64748B] mt-1">Finding the fastest route to professional help for your pet.</p>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
          
          {/* Left (col-span-3) — Map */}
          <div className="lg:col-span-3">
            <div className="w-full h-96 bg-[#F1F5F9] rounded-xl overflow-hidden relative border border-[#E2E8F0]">
              {/* Map placeholder */}
              <div className="w-full h-full flex items-center justify-center text-[#64748B] bg-[#E2E8F0] bg-opacity-30 relative">
                
                {/* Simulated map content */}
                <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#CBD5E1 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
                
                <div className="z-10 flex flex-col items-center">
                  <MapPin className="w-8 h-8 text-[#CBD5E1] mb-2" />
                  <span className="text-sm">Map View Loading...</span>
                </div>
                
                {/* Map legend */}
                <div className="absolute bottom-4 left-4 bg-white rounded-xl px-4 py-3 shadow-md text-xs space-y-2 z-10 border border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    <span className="text-[#1E293B]">Open now</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0046CE]"></div>
                    <span className="text-[#1E293B]">24-hour</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]"></div>
                    <span className="text-[#1E293B]">Closed</span>
                  </div>
                </div>

                {/* Current location chip */}
                <div className="absolute bottom-4 right-4 bg-white rounded-lg px-3 py-2 shadow-md text-xs flex items-center gap-2 z-10 border border-[#E2E8F0]">
                  <div>
                    <div className="text-[#64748B] uppercase text-[10px] tracking-wide">CURRENT LOCATION</div>
                    <div className="font-medium text-[#1E293B]">Lazimpat, Kathmandu</div>
                  </div>
                  <Crosshair className="w-4 h-4 text-[#0046CE]" />
                </div>
              </div>
            </div>
          </div>

          {/* Right (col-span-2) — Clinic list */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-32 bg-[#F8FAFC] rounded-xl animate-pulse border border-[#E2E8F0]" />)}
              </div>
            ) : (
              <div className="space-y-3 max-h-[384px] overflow-y-auto pr-2 pb-2">
                {clinics.length > 0 ? clinics.map((vet) => {
                  const isOpen247 = String(vet.name).toLowerCase().includes('emergency') || true; // Mocking status logic for layout
                  
                  return (
                    <div key={vet._id || vet.id} className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm relative">
                      
                      {/* Status badge top-right */}
                      <div className="absolute top-4 right-4 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide bg-[#F0FDF4] text-[#166534]">
                        OPEN NOW 24/7
                      </div>
                      
                      <h3 className="font-semibold text-[#1E293B] text-base pr-24 truncate">{vet.name}</h3>
                      <div className="text-sm text-[#64748B] flex items-start gap-1 mt-2">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{vet.clinicName || vet.location || 'Kathmandu, Nepal'} • 2.4 km away</span>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <a 
                          href={`tel:${vet.phone || '9800000000'}`}
                          className="flex-1 bg-[#0046CE] hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium transition flex items-center justify-center gap-1.5"
                        >
                          <Phone className="w-4 h-4" /> Call
                        </a>
                        <button 
                          className="flex-1 border border-[#0046CE] hover:bg-blue-50 text-[#0046CE] rounded-lg py-2 text-sm font-medium transition flex items-center justify-center gap-1.5"
                        >
                          <Navigation className="w-4 h-4" /> Directions
                        </button>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="border border-dashed border-[#E2E8F0] rounded-xl p-6 text-center text-sm text-[#64748B]">
                    No emergency clinics found in your area.
                  </div>
                )}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
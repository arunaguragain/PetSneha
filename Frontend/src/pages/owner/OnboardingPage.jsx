import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import OwnerChecklistPanel from '../../components/onboarding/OwnerChecklistPanel';

export default function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1440px] mx-auto px-8 py-10">
        <div className="rounded-3xl bg-[#0046CE] px-6 py-8 text-white shadow-sm sm:px-8">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.2em] text-white/80">Onboarding</div>
            <h1 className="mt-2 text-3xl font-semibold" style={{ fontFamily: 'Literata, serif' }}>New owner checklist</h1>
            <p className="mt-3 text-sm text-white/90">
              Keep the first few pet-care decisions organized in one place, and mark them off as you go.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/articles')}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-[#0046CE] transition hover:bg-blue-50"
          >
            Back to articles <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6">
          <OwnerChecklistPanel variant="full" />
        </div>
      </div>
    </div>
  );
}
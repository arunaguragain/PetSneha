import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingFooter from '../components/landing/LandingFooter';
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from '../components/ui';

export default function PlaceholderPage() {
  const location = useLocation();
  const path = location.pathname.substring(1).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 text-neutral-900">
      <LandingNavbar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mb-6">
          <Clock className="w-10 h-10" />
        </div>
        
        <h1 className="text-4xl font-display font-bold text-neutral-900 mb-4">
          {path || 'Coming Soon'}
        </h1>
        
        <p className="text-lg text-neutral-600 mb-8">
          We're working hard to get this page ready. Check back later for updates to our {path.toLowerCase()} section.
        </p>
        
        <Button as={Link} to="/" variant="primary" size="lg" className="flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Back to Home
        </Button>
      </main>

      <LandingFooter />
    </div>
  );
}

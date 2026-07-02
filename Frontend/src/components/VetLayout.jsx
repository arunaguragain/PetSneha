import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function VetLayout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-hidden bg-[#F8FAFC]">
        <Outlet />
      </main>
    </div>
  );
}

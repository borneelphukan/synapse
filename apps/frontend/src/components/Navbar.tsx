'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Icon } from '@synapse/ui';

export const Navbar = () => {
  const { logout } = useAuth();

  return (
    <nav className="w-full h-16 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2">
         <Icon type="hub" className="text-sky-500 !text-[20px]" />
         <span className="font-bold text-slate-100 tracking-tight">Synapse <span className="text-sky-500">AI</span></span>
      </div>
      
      <button 
        onClick={logout}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
      >
        <Icon type="logout" className="!text-[16px]" />
        Logout
      </button>
    </nav>
  );
};

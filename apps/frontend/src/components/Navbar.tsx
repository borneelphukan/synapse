'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Badge, Icon } from '@synapse/ui';
import { api } from '@/shared/api';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  isPaid: boolean;
  plan: string;
}

interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      api.getMe().then(setUser).catch(console.error);
    }
  }, [isAuthenticated]);

  const initials = user 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : '??';

  return (
    <nav className="w-full h-16 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 shrink-0 relative z-50">
      {/* Left: Mobile Menu Toggle */}
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 mr-2 text-slate-400 hover:text-white transition-colors"
        >
          <Icon type="menu" className="!text-[24px]" />
        </button>
      </div>
      
      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* User Profile Trigger */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-slate-800 transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-[12px] font-bold text-slate-300">
              {initials}
            </div>
            <Icon 
              type="keyboard_arrow_down" 
              className={`!text-[20px] text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsDropdownOpen(false)} 
              />
              
              <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Header */}
                <div className="p-5 flex items-start gap-4 border-b border-slate-800">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-100 truncate">
                          {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
                        </h4>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {user?.email || '...'}
                        </p>
                      </div>
                      <button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-400 transition-all">
                        <Icon type="settings" className="!text-[18px]" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-5">
                      {/* Theme Toggle Switch (Moved to left) */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTheme();
                        }}
                        className={`w-11 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-slate-700' : 'bg-sky-500/20'}`}
                      >
                        <div className={`absolute top-1 left-1.5 w-4 h-4 rounded-full flex items-center justify-center transition-all ${theme === 'dark' ? 'translate-x-0 bg-slate-500' : 'translate-x-4 bg-sky-500'}`}>
                          <Icon type={theme === 'dark' ? 'dark_mode' : 'light_mode'} className="!text-[10px] text-white" />
                        </div>
                      </button>

                      {user && user.plan !== 'PRO' && (
                        <Link href="/pricing" className="hover:opacity-80 transition-opacity">
                          <Badge label="Upgrade" type="orange" size="sm" className="font-black" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="px-5 py-4 flex items-center justify-between">
                  <button 
                    onClick={logout}
                    className="text-sm font-bold text-slate-300 hover:text-red-400 transition-colors flex items-center gap-2"
                  >
                     <Icon type="logout" className="!text-[16px]" /> Sign Out
                  </button>
                  <p className="text-[10px] text-black dark:text-white">v1.0.4</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

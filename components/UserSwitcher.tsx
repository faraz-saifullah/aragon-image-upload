'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from '@/components/icons';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface UserSwitcherProps {
  currentUser: User | null;
  onUserChange: (user: User) => void;
}

export function UserSwitcher({ currentUser, onUserChange }: UserSwitcherProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch users
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error('Failed to fetch users:', err));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!currentUser) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg animate-pulse">
        <div className="w-8 h-8 bg-slate-300 rounded-full" />
        <div className="w-24 h-4 bg-slate-300 rounded" />
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
        aria-label="Switch user"
        aria-expanded={isOpen}
      >
        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-lg">
          {currentUser.avatar || currentUser.name.charAt(0)}
        </div>
        <div className="hidden md:flex flex-col items-start">
          <span className="text-sm font-semibold text-black">{currentUser.name}</span>
          <span className="text-xs text-neutral-600">{currentUser.email}</span>
        </div>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-[100]">
          <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase">
            Switch User (Prototype)
          </div>
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => {
                onUserChange(user);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 transition-colors ${
                currentUser.id === user.id ? 'bg-orange-50' : ''
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xl ${
                  currentUser.id === user.id
                    ? 'bg-gradient-to-br from-orange-400 to-orange-600'
                    : 'bg-gradient-to-br from-slate-400 to-slate-600'
                }`}
              >
                {user.avatar || user.name.charAt(0)}
              </div>
              <div className="flex flex-col items-start flex-1">
                <span className="text-sm font-semibold text-black">{user.name}</span>
                <span className="text-xs text-neutral-600">{user.email}</span>
              </div>
              {currentUser.id === user.id && (
                <svg
                  className="w-5 h-5 text-orange-500"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

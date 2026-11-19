import React, { useState } from 'react';
import { FranchiseId, OFFICIAL_FRANCHISES } from '@ipl/shared-types';
import { Trophy, Shield, Sparkles, Mail, Lock, User, ArrowRight } from 'lucide-react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  favoriteFranchise: FranchiseId;
  matchesPlayed: number;
  trophiesWon: number;
  avatarSeed: string;
}

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  onContinueGuest: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, onContinueGuest }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('Rajesh Sharma');
  const [email, setEmail] = useState('rajesh@iplauction.com');
  const [password, setPassword] = useState('password123');
  const [favFranchise, setFavFranchise] = useState<FranchiseId>('CSK');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const profile: UserProfile = {
      id: `usr_${Date.now()}`,
      name: name.trim() || 'Franchise Boss',
      email: email.trim(),
      favoriteFranchise: favFranchise,
      matchesPlayed: 4,
      trophiesWon: 2,
      avatarSeed: name.trim() || 'boss'
    };
    localStorage.setItem('ipl_user_profile', JSON.stringify(profile));
    onLoginSuccess(profile);
  };

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col justify-between p-4 sm:p-6 text-white max-w-md mx-auto">
      {/* Brand Header */}
      <div className="pt-8 text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center shadow-2xl shadow-orange-500/30 ring-4 ring-white/10">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            AUCTIONN
          </h1>
          <p className="text-xs text-amber-400 font-mono tracking-widest uppercase mt-0.5 font-bold">
            PRO FRANCHISE EDITION
          </p>
        </div>
      </div>

      {/* Auth Card */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-2xl space-y-5 my-auto">
        <div className="flex border-b border-white/10 pb-3 justify-around text-sm font-bold">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`pb-2 transition-all ${
              !isRegister
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`pb-2 transition-all ${
              isRegister
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Register Owner
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <div>
              <label className="block text-zinc-400 font-semibold mb-1">Full Owner Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full bg-surface-900 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-zinc-400 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-surface-900 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 font-semibold mb-1">Secret Key / Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-900 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 font-semibold mb-1.5">Primary Franchise Allegiance</label>
            <div className="grid grid-cols-5 gap-1.5">
              {OFFICIAL_FRANCHISES.map(f => (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => setFavFranchise(f.id)}
                  className={`p-2 rounded-xl text-center font-black text-xs transition-all border ${
                    favFranchise === f.id
                      ? 'border-emerald-400 ring-2 ring-emerald-400/30 scale-105'
                      : 'border-white/5 opacity-60 bg-surface-900'
                  }`}
                  style={{ backgroundColor: favFranchise === f.id ? f.color : undefined, color: favFranchise === f.id ? f.textColor : undefined }}
                >
                  {f.short}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-emeraldBid-500 hover:bg-emeraldBid-600 text-zinc-950 font-black text-sm shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
          >
            <span>{isRegister ? 'Create Owner Account' : 'Sign In to War Room'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onContinueGuest}
            className="text-xs text-zinc-400 hover:text-white underline underline-offset-4 transition-colors"
          >
            Continue as Guest Owner &rarr;
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] text-zinc-600 pb-4">
        Official BCCI Slabs • 6-Set Rotation • 100-Point Playing XI Formula
      </div>
    </div>
  );
};


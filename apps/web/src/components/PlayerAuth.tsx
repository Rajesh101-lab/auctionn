import React from 'react';
import {
  SignInButton,
  SignUpButton,
  SignIn,
  SignUp
} from '@clerk/react';
import { Shield, Sparkles, ArrowRight, User } from 'lucide-react';

interface PlayerAuthProps {
  onGuest: () => void;
}

export const PlayerAuth: React.FC<PlayerAuthProps> = ({ onGuest }) => {
  const [showSignInModal, setShowSignInModal] = React.useState(false);
  const [showSignUpModal, setShowSignUpModal] = React.useState(false);

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col justify-between py-12 sm:py-16 px-6 text-white max-w-md mx-auto">
      {/* Editorial Header */}
      <div className="pt-10 text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-600 flex items-center justify-center shadow-2xl ring-4 ring-white/10">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Auctionn</h1>
          <p className="text-xs text-amber-400 font-mono tracking-widest uppercase font-bold mt-0.5">
            War Room Simulator
          </p>
        </div>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Sign in with your Clerk account to unlock live multiplayer bidding, custom war rooms, and real-time team championship tracking.
        </p>
      </div>

      {/* Clerk Auth Card */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4 my-auto">
        <div className="space-y-3 text-center">
          <div className="text-xs font-bold text-slate-300">
            Official Clerk Player Authentication
          </div>

          <div className="space-y-2.5">
            <SignInButton mode="modal">
              <button className="w-full py-3.5 rounded-2xl bg-emeraldBid-500 hover:bg-emeraldBid-600 active:scale-95 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2">
                <span>Sign In with Clerk</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-white/10 active:scale-95 transition-all">
                Create New Clerk Account
              </button>
            </SignUpButton>
          </div>
        </div>

        <div className="relative py-2 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative bg-surface-900 px-3 text-[10px] text-slate-500 font-mono uppercase">
            Or Play Offline
          </span>
        </div>

        <button
          type="button"
          onClick={onGuest}
          className="w-full py-2.5 rounded-xl bg-surface-950/80 hover:bg-surface-800 text-slate-300 text-xs font-medium border border-white/5 transition-all flex items-center justify-center gap-2"
        >
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>Continue as Guest Player</span>
        </button>

        <div className="p-3 bg-surface-950/60 rounded-2xl border border-white/5 text-[11px] text-slate-400 text-center">
          ℹ️ <strong>Franchise Selection</strong> takes place live inside the war room lobby after entering.
        </div>
      </div>

      <div className="text-center text-[10px] text-slate-500 pb-2 font-mono">
        Secured with Clerk Enterprise Auth • App: Auctionn
      </div>
    </div>
  );
};

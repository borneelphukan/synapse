import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@synapse/ui';
import { api } from '@/shared/api';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
            <Icon type="lock_reset" className="!text-[28px] text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Reset your password</h1>
          <p className="text-slate-500 text-sm mt-1">We'll send a reset link to your email</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <Icon type="mark_email_read" className="!text-[32px] text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-100">Check your email</h2>
              <p className="text-slate-500 text-sm">
                If an account exists for <strong className="text-slate-300">{email}</strong>, a password reset link has been sent. It expires in 1 hour.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 text-sm font-semibold transition-colors mt-4"
              >
                <Icon type="arrow_back" className="!text-[16px]" /> Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
                  <Icon type="error" className="!text-[16px] text-red-400 shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Email address</label>
                <div className="relative">
                  <Icon type="mail" className="!text-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="you@company.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>

              <button
                id="forgot-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                style={{ background: loading ? '#1e293b' : 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
              >
                {loading ? (
                  <><Icon type="sync" className="!text-[16px] animate-spin" /> Sending...</>
                ) : (
                  <><Icon type="send" className="!text-[16px]" /> Send Reset Link</>
                )}
              </button>

              <div className="text-center">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-400 text-sm transition-colors">
                  <Icon type="arrow_back" className="!text-[14px]" /> Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

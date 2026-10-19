import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CircleUserRound, LogOut, Mail, ShieldCheck, Smartphone } from 'lucide-react';
import type { PreferredLanguage } from '../lib/types';
import { useStore } from '../context/StoreContext';
import { currentCustomerAccountKey } from '../lib/storage';

const SESSION_KEY = 'blitz_customer_auth_session_v1';
const DEMO_ACCOUNTS_KEY = 'blitz_demo_customer_accounts_v1';
const AUTH_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '');
const AUTH_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const hasCloudAuth = Boolean(AUTH_URL && AUTH_KEY);
const demoMode = import.meta.env.DEV && !hasCloudAuth;

type ContactType = 'email' | 'phone';
interface CustomerSession {
  contact: string;
  contactType: ContactType;
  name?: string;
  preferredLanguage?: PreferredLanguage;
  access_token?: string;
  refresh_token?: string;
  user?: { id?: string; email?: string; phone?: string; user_metadata?: Record<string, unknown> };
}
interface DemoAccount {
  id: string;
  contact: string;
  contactType: ContactType;
  name: string;
  passwordHash: string;
  preferredLanguage: PreferredLanguage;
}

function readSession(): CustomerSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as CustomerSession) : null;
  } catch {
    return null;
  }
}

function readDemoAccounts(): DemoAccount[] {
  try {
    return JSON.parse(localStorage.getItem(DEMO_ACCOUNTS_KEY) ?? '[]') as DemoAccount[];
  } catch {
    return [];
  }
}

function detectContactType(contact: string): ContactType {
  return contact.includes('@') ? 'email' : 'phone';
}

function validateContact(contact: string): string | null {
  if (contact.includes('@')) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)
      ? null
      : 'Enter a valid email address.';
  }
  const digits = contact.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 15
    ? null
    : 'Enter a valid phone number (9–15 digits).';
}

async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

async function cloudAuth(path: string, body: Record<string, unknown>) {
  if (!AUTH_URL || !AUTH_KEY) throw new Error('Cloud authentication has not been configured.');
  const response = await fetch(`${AUTH_URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: {
      apikey: AUTH_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const result = (await response.json().catch(() => ({}))) as {
    message?: string;
    msg?: string;
    error_description?: string;
    error?: string;
    access_token?: string;
    refresh_token?: string;
    user?: CustomerSession['user'];
    session?: { access_token?: string; refresh_token?: string; user?: CustomerSession['user'] };
  };
  if (!response.ok) {
    throw new Error(
      result.msg || result.message || result.error_description || result.error || 'Authentication failed. Please try again.',
    );
  }
  return result;
}

export function AccountPage() {
  const { siteSettings, loyaltyBalances, refreshLoyaltyBalances, storeInfo, language, setLanguage } = useStore();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [session, setSession] = useState<CustomerSession | null>(() => readSession());
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<PreferredLanguage>(language);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const accountKey = currentCustomerAccountKey();
  const points = accountKey ? (loyaltyBalances[accountKey] ?? 0) : 0;
  const pointsGoal = Math.max(1, siteSettings.rewardThreshold || 100);
  const pointsProgress = Math.min(100, (points / pointsGoal) * 100);




  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    const normalizedContact = contact.trim();
    const contactError = validateContact(normalizedContact);
    if (contactError) {
      setError(contactError);
      return;
    }
    if (password.length < 8) {
      setError('Use a password with at least 8 characters.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Enter your name to create an account.');
      return;
    }

    const contactType = detectContactType(normalizedContact);
    setBusy(true);
    try {
      if (hasCloudAuth) {
        const identity = contactType === 'email' ? { email: normalizedContact.toLowerCase() } : { phone: normalizedContact };
        if (mode === 'signup') {
          const result = await cloudAuth('signup', {
            ...identity,
            password,
            data: { full_name: name.trim(), preferred_language: preferredLanguage },
          });
          const cloudSession = result.session ?? result;
          if (cloudSession.access_token && cloudSession.user) {
            const nextSession: CustomerSession = {
              contact: normalizedContact,
              contactType,
              name: name.trim(),
              preferredLanguage,
              access_token: cloudSession.access_token,
              refresh_token: cloudSession.refresh_token,
              user: cloudSession.user,
            };
            localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
            setSession(nextSession);
            setPreferredLanguage(nextSession.preferredLanguage ?? preferredLanguage);
            setLanguage(nextSession.preferredLanguage ?? preferredLanguage);
            refreshLoyaltyBalances();
          }
          setMessage(
            cloudSession.access_token
              ? 'Your account was created successfully.'
              : 'Account created. Check your email or phone for the verification step, then sign in.',
          );
          setMode('signin');
          setPassword('');
        } else {
          const result = await cloudAuth('token?grant_type=password', { ...identity, password });
          if (!result.access_token || !result.user) throw new Error('Login succeeded without a session. Check your auth-provider settings.');
          const metadata = result.user.user_metadata ?? {};
          const nextSession: CustomerSession = {
            contact: normalizedContact,
            contactType,
            name: String(metadata.full_name ?? ''),
            preferredLanguage: (metadata.preferred_language as PreferredLanguage | undefined) ?? 'English',
            access_token: result.access_token,
            refresh_token: result.refresh_token,
            user: result.user,
          };
          localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
          setSession(nextSession);
          setPreferredLanguage(nextSession.preferredLanguage ?? preferredLanguage);
          setLanguage(nextSession.preferredLanguage ?? preferredLanguage);
          refreshLoyaltyBalances();
          setMessage('You are signed in.');
          setPassword('');
        }
      } else if (demoMode) {
        // Local preview only. Production builds never create fake/local accounts.
        const accounts = readDemoAccounts();
        const existing = accounts.find((account) => account.contact.toLowerCase() === normalizedContact.toLowerCase());
        const passwordHash = await hashPassword(password);
        if (mode === 'signup') {
          if (existing) throw new Error('An account with this email or phone already exists in this browser.');
          const account: DemoAccount = {
            id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            contact: normalizedContact,
            contactType,
            name: name.trim(),
            passwordHash,
            preferredLanguage,
          };
          localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify([...accounts, account]));
          const nextSession: CustomerSession = {
            contact: account.contact,
            contactType: account.contactType,
            name: account.name,
            preferredLanguage: account.preferredLanguage,
          };
          localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
          setSession(nextSession);
          setPreferredLanguage(nextSession.preferredLanguage ?? preferredLanguage);
          setLanguage(nextSession.preferredLanguage ?? preferredLanguage);
          refreshLoyaltyBalances();
          setMessage('Preview account created in this browser only. It is not a real online account.');
          setMode('signin');
          setPassword('');
        } else {
          if (!existing || existing.passwordHash !== passwordHash) {
            throw new Error('Account not found in this browser, or the password is incorrect.');
          }
          const nextSession: CustomerSession = {
            contact: existing.contact,
            contactType: existing.contactType,
            name: existing.name,
            preferredLanguage: existing.preferredLanguage,
          };
          localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
          setSession(nextSession);
          setPreferredLanguage(nextSession.preferredLanguage ?? preferredLanguage);
          setLanguage(nextSession.preferredLanguage ?? preferredLanguage);
          refreshLoyaltyBalances();
          setMessage('Signed in to this browser’s preview account.');
          setPassword('');
        }
      } else {
        throw new Error('Account service is not configured for this published site. The store owner must connect Supabase Auth first.');
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    if (session?.access_token && AUTH_URL && AUTH_KEY) {
      try {
        await fetch(`${AUTH_URL}/auth/v1/logout`, {
          method: 'POST',
          headers: { apikey: AUTH_KEY, Authorization: `Bearer ${session.access_token}` },
        });
      } catch {
        // Local session cleanup still completes when the network is unavailable.
      }
    }
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    refreshLoyaltyBalances();
    setMessage('You have signed out.');
    setError('');
  };


  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
      <div className="rounded-3xl border border-white/10 bg-[#12141c] p-6 sm:p-8 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center mb-5">
          <CircleUserRound className="w-7 h-7 text-violet-300" />
        </div>
        <h1 className="text-3xl font-bold">Your account</h1>
        <p className="text-sm text-zinc-400 mt-2">Create an account or sign in with your email address or phone number.</p>

        {demoMode && (
          <div className="mt-6 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-100">
            <p className="font-semibold flex gap-2 items-center"><ShieldCheck className="w-4 h-4" /> Preview mode</p>
            <p className="text-xs text-amber-100/75 mt-1">Accounts are stored only in this browser during local development. To enable real customer accounts on Netlify, configure Supabase Auth using the setup guide. Do not use preview accounts for real customers.</p>
          </div>
        )}
        {!hasCloudAuth && !demoMode && (
          <div className="mt-6 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-100">
            <p className="font-semibold">Account service needs setup</p>
            <p className="text-xs text-red-100/80 mt-1">Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your local environment and Netlify environment variables. See <code>SUPABASE_SETUP.md</code>.</p>
          </div>
        )}

        {session ? (
          <div className="mt-7 space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
              <p className="text-lg font-semibold">Welcome{session.name ? `, ${session.name}` : ''}!</p>
              <p className="text-sm text-zinc-400 flex items-center gap-2 break-all">
                {session.contactType === 'email' ? <Mail className="w-4 h-4 shrink-0" /> : <Smartphone className="w-4 h-4 shrink-0" />}
                {session.contact}
              </p>
              <p className="text-xs text-zinc-500">Preferred language: {session.preferredLanguage ?? 'English'}</p>
            </div>
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-sm font-semibold text-amber-100">Your loyalty points</p><p className="text-xs text-zinc-400 mt-1">Earn points when account-linked orders are marked Delivered.</p></div>
                <div className="text-2xl font-black text-amber-300">{points}</div>
              </div>
              <div className="h-2 rounded-full bg-black/40 overflow-hidden"><div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pointsProgress}%` }} /></div>
              <p className="text-xs text-zinc-400">{Math.max(0, pointsGoal - points)} more point{Math.max(0, pointsGoal - points) === 1 ? '' : 's'} to reach {pointsGoal}.</p>
              <p className="text-sm text-amber-100">Reward: {siteSettings.rewardDescription}</p>
              {points >= pointsGoal && <a href={`https://wa.me/${storeInfo.whatsappDigits}?text=${encodeURIComponent(`Hi ${siteSettings.storeName}, I have ${points} loyalty points and would like to claim my reward: ${siteSettings.rewardDescription}`)}`} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-lg bg-amber-400/15 border border-amber-400/25 px-3 py-2 text-sm text-amber-200 hover:bg-amber-400/20">Request my reward</a>}
              <p className="text-[11px] text-zinc-500">Loyalty balances currently save in this browser. Connect shared database storage before using rewards across devices.</p>
            </div>
            <button type="button" onClick={signOut} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm hover:bg-white/5">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
            <div className="border-t border-white/10 pt-5 text-sm text-zinc-400">
              <p>Keep your order code after checkout to track an order.</p>
              <Link to="/track" className="mt-3 inline-flex items-center gap-2 text-violet-300 hover:text-white">Track an order <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-7 grid grid-cols-2 rounded-xl border border-white/10 bg-black/20 p-1">
              <button type="button" onClick={() => { setMode('signup'); setError(''); setMessage(''); }} className={`rounded-lg py-2 text-sm font-medium ${mode === 'signup' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'}`}>Create account</button>
              <button type="button" onClick={() => { setMode('signin'); setError(''); setMessage(''); }} className={`rounded-lg py-2 text-sm font-medium ${mode === 'signin' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'}`}>Sign in</button>
            </div>
            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="text-xs text-zinc-400">Full name *</label>
                  <input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50" placeholder="Your name" />
                </div>
              )}
              <div>
                <label className="text-xs text-zinc-400">Email address or phone number *</label>
                <input required autoComplete="username" inputMode="text" value={contact} onChange={(event) => setContact(event.target.value)} className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50" placeholder="you@gmail.com or +970…" />
              </div>
              {mode === 'signup' && (
                <div>
                  <label className="text-xs text-zinc-400">Preferred language *</label>
                  <select value={preferredLanguage} onChange={(event) => { const nextLanguage = event.target.value as PreferredLanguage; setPreferredLanguage(nextLanguage); setLanguage(nextLanguage); }} className="mt-1 w-full bg-[#171a23] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50">
                    <option value="English">English</option>
                    <option value="Arabic">العربية (Arabic)</option>
                    <option value="Hebrew">עברית (Hebrew)</option>
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs text-zinc-400">Password *</label>
                <input required type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50" placeholder="At least 8 characters" />
              </div>
              {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
              {message && <p role="status" className="text-sm text-emerald-400">{message}</p>}
              <button type="submit" disabled={busy || (!hasCloudAuth && !demoMode)} className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">
                {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
              </button>
              <p className="text-[11px] text-zinc-600">By continuing, you agree that your account details are used to provide store account services. Cloud accounts require the store’s authentication service to be configured.</p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

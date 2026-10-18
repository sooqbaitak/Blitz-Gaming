import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export function AdminLogin() {
  const { loginAdmin, isAdmin } = useStore();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAdmin) navigate('/admin', { replace: true });
  }, [isAdmin, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(password)) {
      navigate('/admin');
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#12141c] p-8 shadow-2xl"
      >
        <div className="w-12 h-12 rounded-2xl bg-violet-600/20 flex items-center justify-center mb-6">
          <Lock className="w-6 h-6 text-violet-400" />
        </div>
        <h1 className="text-2xl font-bold">Admin access</h1>
        <p className="text-sm text-zinc-500 mt-1">Blitz Gaming dashboard</p>
        <label className="block mt-6 text-xs text-zinc-500">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50"
          placeholder="Enter admin password"
          autoFocus
        />
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        <button
          type="submit"
          className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-semibold hover:opacity-90"
        >
          Sign in
        </button>
        <p className="mt-4 text-[11px] text-amber-300/80 text-center">
          Demo dashboard only. Client-side login does not secure a live store; configure server-side authentication before publishing.
        </p>
        <Link to="/" className="block text-center text-xs text-zinc-500 mt-4 hover:text-white">
          ← Back to store
        </Link>
      </form>
    </div>
  );
}

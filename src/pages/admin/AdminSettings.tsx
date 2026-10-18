import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { setAdminPassword, DEFAULT_ADMIN_PASSWORD } from '../../lib/storage';

export function AdminSettings() {
  const { storeInfo } = useStore();
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [msg, setMsg] = useState('');

  const changePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass.length < 6) {
      setMsg('Password must be at least 6 characters');
      return;
    }
    if (pass !== pass2) {
      setMsg('Passwords do not match');
      return;
    }
    setAdminPassword(pass);
    setMsg('Password updated. Use the new password next login.');
    setPass('');
    setPass2('');
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="rounded-2xl border border-white/8 bg-[#12141c] p-6 mb-6 space-y-3 text-sm">
        <h2 className="font-semibold text-base">Store info</h2>
        <p>
          <span className="text-zinc-500">Name:</span> {storeInfo.storeName}
        </p>
        <p>
          <span className="text-zinc-500">WhatsApp:</span> {storeInfo.whatsapp}
        </p>
        <p>
          <span className="text-zinc-500">Order email:</span> {storeInfo.email}
        </p>
        <p>
          <span className="text-zinc-500">Location:</span> {storeInfo.location}
        </p>
        <p>
          <span className="text-zinc-500">Facebook:</span>{' '}
          <a href={storeInfo.facebook} className="text-violet-400 break-all" target="_blank" rel="noreferrer">
            {storeInfo.facebook}
          </a>
        </p>
        <p>
          <span className="text-zinc-500">Instagram:</span>{' '}
          <a href={storeInfo.instagram} className="text-violet-400" target="_blank" rel="noreferrer">
            {storeInfo.instagram}
          </a>
        </p>
        <p className="text-xs text-zinc-600 pt-2">
          Payment method: Cash on Delivery only. Free delivery from {storeInfo.freeDeliveryFrom} ₪.
        </p>
      </div>

      <form onSubmit={changePass} className="rounded-2xl border border-white/8 bg-[#12141c] p-6 space-y-4">
        <h2 className="font-semibold">Change admin password</h2>
        <p className="text-xs text-zinc-500">
          Default is <code>{DEFAULT_ADMIN_PASSWORD}</code>. Change it before going live.
        </p>
        <div>
          <label className="text-xs text-zinc-500">New password</label>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500">Confirm password</label>
          <input
            type="password"
            value={pass2}
            onChange={(e) => setPass2(e.target.value)}
            className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm"
          />
        </div>
        {msg && <p className="text-sm text-emerald-400">{msg}</p>}
        <button type="submit" className="px-5 py-2.5 rounded-xl bg-violet-600 text-sm font-semibold hover:bg-violet-500">
          Update password
        </button>
      </form>

      <div className="mt-6 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-zinc-400">
        <strong className="text-amber-300">Admin URL:</strong> /admin/login. It is hidden from the public navigation for convenience only; the current client-side login is not real security and must be replaced with server-side authentication before launch.
      </div>
    </div>
  );
}

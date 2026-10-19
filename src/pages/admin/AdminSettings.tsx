import { useState } from 'react';
import { ArrowDown, ArrowUp, Save, Settings2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import type { StoreSettings } from '../../lib/types';
import { setAdminPassword, DEFAULT_ADMIN_PASSWORD } from '../../lib/storage';

async function compressSettingImage(file: File, maxDimension: number): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Please select an image file');
  const image = await createImageBitmap(file);
  const ratio = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * ratio));
  canvas.height = Math.max(1, Math.round(image.height * ratio));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Image upload is not supported by this browser');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error('Image compression failed')), 'image/jpeg', 0.76));
  if (blob.size > 600 * 1024) throw new Error('The compressed image is too large. Please use a smaller image or paste an image URL instead.');
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Image could not be read'));
    reader.onerror = () => reject(new Error('Image could not be read'));
    reader.readAsDataURL(blob);
  });
}

const SECTION_LABELS: Record<string, string> = {
  categories: 'Shop by category',
  processors: 'Processors',
  motherboards: 'Motherboards',
  gpus: 'Graphics cards',
  monitors: 'Monitors',
  cases: 'Gaming cases',
  cooling: 'Cooling and fans',
  psu: 'Power supplies',
  accessories: 'Gaming accessories',
  furniture: 'Furniture & room setup',
};

export function AdminSettings() {
  const { storeInfo, siteSettings, updateSiteSettings } = useStore();
  const [form, setForm] = useState<StoreSettings>(siteSettings);
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [msg, setMsg] = useState('');
  const [passMsg, setPassMsg] = useState('');


  const update = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    updateSiteSettings({ [key]: value } as Partial<StoreSettings>);
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const next = [...form.homeSectionOrder];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= next.length) return;
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    update('homeSectionOrder', next);
  };

  const saveSettings = (event: React.FormEvent) => {
    event.preventDefault();
    updateSiteSettings({
      ...form,
      storeName: form.storeName.trim() || 'Blitz Gaming',
      baseFontSize: Math.min(22, Math.max(12, Number(form.baseFontSize) || 16)),
      rewardThreshold: Math.max(1, Math.floor(Number(form.rewardThreshold) || 100)),
      homeSectionOrder: form.homeSectionOrder,
    });
    setMsg('Site settings saved in this browser. Configure shared database/storage before expecting changes on other devices.');
  };

  const changePass = (event: React.FormEvent) => {
    event.preventDefault();
    if (pass.length < 8) {
      setPassMsg('Use at least 8 characters.');
      return;
    }
    if (pass !== pass2) {
      setPassMsg('Passwords do not match.');
      return;
    }
    setAdminPassword(pass);
    setPassMsg('Password updated in this browser. This client-side login is not production security.');
    setPass('');
    setPass2('');
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Store settings & page editor</h1>
        <p className="text-sm text-zinc-500 mt-1">Customize the storefront's identity, homepage, typography and loyalty program.</p>
      </div>

      <form onSubmit={saveSettings} className="rounded-2xl border border-white/8 bg-[#12141c] p-6 space-y-6">
        <section className="space-y-4">
          <h2 className="font-semibold text-base flex items-center gap-2"><Settings2 className="w-4 h-4 text-violet-300" /> Store identity</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Site / store name"><input value={form.storeName} onChange={(e) => update('storeName', e.target.value)} className="input" /></Field>
            <Field label="Short tagline"><input value={form.tagline} onChange={(e) => update('tagline', e.target.value)} className="input" /></Field>
            <Field label="Logo image URL or upload">
              <input value={form.logoUrl.startsWith('data:') ? '' : form.logoUrl} onChange={(e) => update('logoUrl', e.target.value)} className="input" placeholder="https://... or /images/logo.png" />
              <input type="file" accept="image/*" onChange={async (e) => { const file = e.currentTarget.files?.[0]; e.currentTarget.value = ''; if (!file) return; try { update('logoUrl', await compressSettingImage(file, 600)); } catch (error) { alert(error instanceof Error ? error.message : 'Unable to upload image'); } }} className="block w-full text-xs text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-zinc-200" />
              {form.logoUrl && <img src={form.logoUrl} alt="Logo preview" className="mt-2 h-12 max-w-40 object-contain rounded bg-white/5 p-1" />}
            </Field>
            <Field label="Hero / homepage image URL or upload">
              <input value={form.heroImage.startsWith('data:') ? '' : form.heroImage} onChange={(e) => update('heroImage', e.target.value)} className="input" placeholder="https://... or /images/hero-gaming.jpg" />
              <input type="file" accept="image/*" onChange={async (e) => { const file = e.currentTarget.files?.[0]; e.currentTarget.value = ''; if (!file) return; try { update('heroImage', await compressSettingImage(file, 1600)); } catch (error) { alert(error instanceof Error ? error.message : 'Unable to upload image'); } }} className="block w-full text-xs text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-zinc-200" />
              {form.heroImage && <img src={form.heroImage} alt="Homepage hero preview" className="mt-2 h-16 w-full rounded-lg object-cover" />}
            </Field>
            <Field label="Homepage hero title"><input value={form.heroTitle} onChange={(e) => update('heroTitle', e.target.value)} className="input" /></Field>
            <Field label="Hero highlighted words"><input value={form.heroAccentText} onChange={(e) => update('heroAccentText', e.target.value)} className="input" /></Field>
            <Field label="Homepage introduction" className="sm:col-span-2"><textarea value={form.heroDescription} onChange={(e) => update('heroDescription', e.target.value)} className="input min-h-[90px] resize-y" rows={3} /></Field>
          </div>
        </section>

        <section className="space-y-4 border-t border-white/8 pt-5">
          <h2 className="font-semibold text-base">Typography & colors</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Accent color"><div className="flex gap-2"><input type="color" value={form.accentColor} onChange={(e) => update('accentColor', e.target.value)} className="w-12 h-11 rounded-lg border border-white/10 bg-transparent p-1" /><input value={form.accentColor} onChange={(e) => update('accentColor', e.target.value)} className="input" /></div></Field>
            <Field label="Heading text color"><div className="flex gap-2"><input type="color" value={form.headingColor} onChange={(e) => update('headingColor', e.target.value)} className="w-12 h-11 rounded-lg border border-white/10 bg-transparent p-1" /><input value={form.headingColor} onChange={(e) => update('headingColor', e.target.value)} className="input" /></div></Field>
            <Field label="Body text color"><div className="flex gap-2"><input type="color" value={form.bodyTextColor} onChange={(e) => update('bodyTextColor', e.target.value)} className="w-12 h-11 rounded-lg border border-white/10 bg-transparent p-1" /><input value={form.bodyTextColor} onChange={(e) => update('bodyTextColor', e.target.value)} className="input" /></div></Field>
            <Field label="Font size (px)"><input type="number" min={12} max={22} value={form.baseFontSize} onChange={(e) => update('baseFontSize', Number(e.target.value))} className="input" /></Field>
            <Field label="Font family"><select value={form.fontFamily} onChange={(e) => update('fontFamily', e.target.value)} className="input"><option value="Inter, ui-sans-serif, system-ui, sans-serif">Inter / System</option><option value="Arial, Helvetica, sans-serif">Arial</option><option value="Georgia, serif">Georgia</option><option value="Tahoma, Arial, sans-serif">Tahoma</option><option value="'Trebuchet MS', sans-serif">Trebuchet MS</option></select></Field>
          </div>
          <div className="rounded-xl border border-white/10 p-4" style={{ fontFamily: form.fontFamily, fontSize: `${form.baseFontSize}px`, color: form.bodyTextColor }}>
            <strong style={{ color: form.headingColor }}>Preview: BLITZ Gaming</strong>
            <p className="mt-1 text-white">Typography, base text size and accent color example.</p>
          </div>
        </section>

        <section className="space-y-4 border-t border-white/8 pt-5">
          <h2 className="font-semibold text-base">Homepage layout</h2>
          <Field label="Product cards per row on desktop">
            <select value={form.homeGridColumns} onChange={(e) => update('homeGridColumns', Number(e.target.value))} className="input max-w-xs">
              <option value={2}>2 columns — larger cards</option>
              <option value={3}>3 columns — balanced</option>
              <option value={4}>4 columns — compact</option>
            </select>
          </Field>
          <p className="text-xs text-zinc-500">This setting applies to product grids on the homepage. Mobile screens remain two columns for readability.</p>
        </section>

        <section className="space-y-4 border-t border-white/8 pt-5">
          <h2 className="font-semibold text-base">Homepage section order</h2>
          <p className="text-xs text-zinc-500">Use the arrows to change the order of major sections on the homepage.</p>
          <div className="space-y-2">
            {form.homeSectionOrder.map((key, index) => (
              <div key={key} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] border border-white/8 px-3 py-2">
                <span className="text-sm"><span className="text-zinc-500 mr-3">{index + 1}.</span>{SECTION_LABELS[key] ?? key}</span>
                <div className="flex gap-1">
                  <button type="button" disabled={index === 0} onClick={() => moveSection(index, -1)} className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30" aria-label={`Move ${key} up`}><ArrowUp className="w-4 h-4" /></button>
                  <button type="button" disabled={index === form.homeSectionOrder.length - 1} onClick={() => moveSection(index, 1)} className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30" aria-label={`Move ${key} down`}><ArrowDown className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 border-t border-white/8 pt-5">
          <h2 className="font-semibold text-base">Page content editor</h2>
          <p className="text-xs text-zinc-500">Edit text shown on the About, Shipping, Returns, Warranty, Privacy, Terms, Support, Brands and Offers pages. Separate paragraphs with a blank line. Shipping delivery fees are still calculated separately by checkout logic.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {([
              ['about', 'About page'], ['shipping', 'Shipping & delivery page'], ['returns', 'Returns & exchanges page'],
              ['warranty', 'Warranty page'], ['privacy', 'Privacy policy page'], ['terms', 'Terms & conditions page'],
              ['support', 'Customer support introduction'], ['brands', 'Brands page introduction'], ['offers', 'Offers page introduction'],
            ] as const).map(([key, label]) => (
              <Field key={key} label={label} className={key === 'about' || key === 'shipping' || key === 'terms' ? 'sm:col-span-2' : ''}>
                <textarea value={form.pageContent?.[key] ?? ''} onChange={(e) => update('pageContent', { ...form.pageContent, [key]: e.target.value })} className="input min-h-[100px] resize-y" rows={4} />
              </Field>
            ))}
          </div>
          <p className="text-xs text-zinc-500">Use {`{location}`}, {`{whatsapp}`}, {`{email}`} or {`{storeName}`} in page text to insert your current store details automatically. Custom text is saved in this browser and is not automatically translated.</p>
        </section>

        <section className="space-y-4 border-t border-white/8 pt-5">
          <h2 className="font-semibold text-base">Loyalty rewards</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Points required to unlock reward"><input type="number" min={1} value={form.rewardThreshold} onChange={(e) => update('rewardThreshold', Number(e.target.value))} className="input" /></Field>
            <Field label="Reward / prize details"><textarea value={form.rewardDescription} onChange={(e) => update('rewardDescription', e.target.value)} className="input min-h-[80px] resize-y" rows={3} /></Field>
          </div>
          <p className="text-xs text-zinc-500">Each product also has its own points amount in Admin → Products. Points are awarded when an account-linked order is marked Delivered.</p>
        </section>

        <section className="space-y-2 border-t border-white/8 pt-5 text-sm">
          <h2 className="font-semibold">Contact details</h2>
          <p className="text-zinc-400">Order email: {storeInfo.email}</p>
          <p className="text-zinc-400">WhatsApp: {storeInfo.whatsapp}</p>
          <p className="text-zinc-400">Location: {storeInfo.location}</p>
        </section>

        {msg && <p className="text-sm text-emerald-400">{msg}</p>}
        <button type="submit" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 font-semibold hover:bg-violet-500"><Save className="w-4 h-4" /> Save site settings</button>
      </form>

      <form onSubmit={changePass} className="rounded-2xl border border-white/8 bg-[#12141c] p-6 space-y-4">
        <h2 className="font-semibold">Change local admin password</h2>
        <p className="text-xs text-zinc-500">The current default is <code>{DEFAULT_ADMIN_PASSWORD}</code>. This only changes the browser-local demo login; replace it with server-side authentication before launch.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="New password"><input type="password" autoComplete="new-password" value={pass} onChange={(e) => setPass(e.target.value)} className="input" /></Field>
          <Field label="Confirm password"><input type="password" autoComplete="new-password" value={pass2} onChange={(e) => setPass2(e.target.value)} className="input" /></Field>
        </div>
        {passMsg && <p className="text-sm text-amber-300">{passMsg}</p>}
        <button type="submit" className="px-5 py-2.5 rounded-xl bg-white/10 text-sm font-semibold hover:bg-white/15">Update password</button>
      </form>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-zinc-400">
        <strong className="text-amber-300">Deployment note:</strong> products, orders, these settings and loyalty balances are still saved in this browser. Upload to cloud storage and use a shared database before expecting edits or orders to sync between customer devices and the admin dashboard.
      </div>
    </div>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return <label className={`block text-xs text-zinc-500 space-y-1.5 ${className ?? ''}`}><span>{label}</span>{children}</label>;
}

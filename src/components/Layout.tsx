import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { WhatsAppFloat } from './WhatsAppFloat';
import { CartDrawer } from './CartDrawer';
import { useState } from 'react';

export function Layout() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0b0f] text-zinc-100">
      <Header onOpenCart={() => setCartOpen(true)} />
      <main className="flex-1">
        <Outlet context={{ openCart: () => setCartOpen(true) }} />
      </main>
      <Footer />
      <WhatsAppFloat />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, MapPin, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export function Footer() {
  const { storeInfo } = useStore();

  return (
    <footer className="bg-[#07080c] border-t border-white/8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-amber-400 flex items-center justify-center font-black text-xs">
              BG
            </div>
            <span className="font-bold text-lg">Blitz Gaming</span>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Your store for genuine PC components and gaming gear in Palestine. Authentic products,
            competitive prices and cash on delivery — based in {storeInfo.location}.
          </p>
          <div className="flex gap-3 mt-5">
            <a
              href={storeInfo.facebook}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-blue-600/30 flex items-center justify-center transition"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href={storeInfo.instagram}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-pink-600/30 flex items-center justify-center transition"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={`https://wa.me/${storeInfo.whatsappDigits}`}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-emerald-600/30 flex items-center justify-center transition"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-zinc-300">Shop</h4>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li><Link to="/build" className="hover:text-white">Build your PC</Link></li>
            <li><Link to="/shop" className="hover:text-white">All categories</Link></li>
            <li><Link to="/brands" className="hover:text-white">Brands</Link></li>
            <li><Link to="/category/pc-cases" className="hover:text-white">PC cases</Link></li>
            <li><Link to="/category/air-coolers" className="hover:text-white">Cooling</Link></li>
            <li><Link to="/category/furniture-room-setup" className="hover:text-white">Furniture</Link></li>
            <li><Link to="/offers" className="hover:text-white">Offers</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-zinc-300">
            Customer service
          </h4>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li><Link to="/shipping" className="hover:text-white">Shipping & delivery</Link></li>
            <li><Link to="/returns" className="hover:text-white">Returns & exchanges</Link></li>
            <li><Link to="/warranty" className="hover:text-white">Warranty</Link></li>
            <li><Link to="/track" className="hover:text-white">Track order</Link></li>
            <li><Link to="/about" className="hover:text-white">About us</Link></li>
            <li><Link to="/privacy" className="hover:text-white">Privacy policy</Link></li>
            <li><Link to="/terms" className="hover:text-white">Terms & conditions</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-zinc-300">Contact</h4>
          <ul className="space-y-3 text-sm text-zinc-400">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-violet-400 shrink-0" />
              {storeInfo.location}, Palestine
            </li>
            <li className="flex items-start gap-2">
              <MessageCircle className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
              <a href={`https://wa.me/${storeInfo.whatsappDigits}`} className="hover:text-white">
                WhatsApp: {storeInfo.whatsapp}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="w-4 h-4 mt-0.5 text-amber-400 shrink-0" />
              <a href={`mailto:${storeInfo.email}`} className="hover:text-white">
                {storeInfo.email}
              </a>
            </li>
          </ul>
          <p className="mt-4 text-xs text-zinc-600">
            Cash on delivery · Free delivery from 1,000.00 ₪
          </p>
        </div>
      </div>
      <div className="border-t border-white/5 py-4 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} Blitz Gaming — All rights reserved. Hebron, Palestine.
      </div>
    </footer>
  );
}

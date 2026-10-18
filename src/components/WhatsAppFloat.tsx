import { MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export function WhatsAppFloat() {
  const { storeInfo } = useStore();
  const text = encodeURIComponent('Hello Blitz Gaming! I have a question about a product.');

  return (
    <a
      href={`https://wa.me/${storeInfo.whatsappDigits}?text=${text}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-900/40 flex items-center justify-center hover:scale-105 transition-transform"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" fill="currentColor" />
    </a>
  );
}

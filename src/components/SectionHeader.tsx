import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function SectionHeader({
  title,
  subtitle,
  to,
  linkLabel = 'View all',
}: {
  title: string;
  subtitle?: string;
  to?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>}
      </div>
      {to && (
        <Link
          to={to}
          className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 shrink-0"
        >
          {linkLabel} <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

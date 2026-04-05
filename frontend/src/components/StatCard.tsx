import { TrendingUp } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

interface StatCardProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  trend?: string;
}

export const StatCard = ({ eyebrow, title, description, icon: Icon, trend }: StatCardProps) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 dark:bg-dark-surface text-brand-dark group-hover:bg-brand-dark group-hover:text-brand-primary transition-colors">
          <Icon size={24} strokeWidth={1.5} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-brand-primary bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
            <TrendingUp size={12} /> {trend}
          </div>
        )}
      </div>

      <div className="mt-5">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-dark-text-muted">{eyebrow}</p>
        <h3 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-dark-text-heading tracking-tight">{title}</h3>
        <p className="mt-2 text-sm font-medium text-slate-500 dark:text-dark-text-muted leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

import { ClipboardList } from 'lucide-react';
import type { WasteLog } from '../types';

interface RecentLogsTableProps {
  logs: WasteLog[];
  emptyMessage?: string;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  }).toUpperCase();
};

export const RecentLogsTable = ({ logs, emptyMessage = 'No Data Available' }: RecentLogsTableProps) => {
  if (!logs.length) {
    return (
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#CFCFCF] dark:border-dark-border bg-[#F8F9FA] dark:bg-dark-surface py-16">
        <ClipboardList size={40} className="text-[#CFCFCF] dark:text-dark-text-muted" />
        <p className="mt-4 text-[11px] font-black uppercase tracking-widest text-neutral-500 dark:text-dark-text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-[#CFCFCF] dark:border-dark-border bg-white dark:bg-dark-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8F9FA] dark:bg-dark-surface border-b border-[#CFCFCF] dark:border-dark-border">
              {['Classification', 'Quantity', 'Yield (Points)', 'Timestamp'].map((header) => (
                <th key={header} className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#004040] dark:text-dark-text-muted">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#CFCFCF] dark:divide-dark-border">
            {logs.map((log, index) => (
              <tr key={log.id ?? index} className="hover:bg-neutral-50 dark:hover:bg-dark-surface transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-[#00563f] dark:bg-brand-primary" />
                    <span className="text-[12px] font-black text-[#004040] dark:text-dark-text-heading uppercase tracking-wider">
                      {log.type}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-bold text-neutral-600 dark:text-dark-text">
                  {log.quantity} {log.quantity === 1 ? 'UNIT' : 'UNITS'}
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-black text-[#00563f] dark:text-brand-primary">
                    +{log.points} CREDITS
                  </span>
                </td>
                <td className="px-6 py-4 text-[10px] font-bold text-neutral-400 dark:text-dark-text-muted uppercase tracking-tighter">
                  {formatDate(log.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
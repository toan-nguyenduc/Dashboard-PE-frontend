import { getStatusInfo } from '@/config/status.config';
import { cn } from '@/lib/utils';

interface StatusTagProps {
  status: number;
  showCode?: boolean;
  className?: string;
}

/**
 * StatusTag renders video status with high-contrast text and a glowing dot indicator.
 * No box background, fully compatible with both Dark and Light modes.
 */
export function StatusTag({ status, showCode = true, className }: StatusTagProps) {
  const info = getStatusInfo(status);

  let dotColor = 'bg-slate-400 dark:bg-slate-500';
  let textColor = 'text-slate-700 dark:text-slate-300';

  if (info.group === 'success') {
    dotColor = 'bg-emerald-500 shadow-xs shadow-emerald-500/50';
    textColor = 'text-emerald-700 dark:text-emerald-400 font-semibold';
  } else if (info.group === 'processing') {
    dotColor = 'bg-blue-500 animate-pulse shadow-xs shadow-blue-500/50';
    textColor = 'text-blue-700 dark:text-blue-400 font-semibold';
  } else if (info.group === 'failed') {
    dotColor = 'bg-red-500 shadow-xs shadow-red-500/50';
    textColor = 'text-red-700 dark:text-red-400 font-semibold';
  }

  return (
    <span className={cn('inline-flex items-center gap-2 text-xs select-none', className)}>
      <span className={cn('h-2 w-2 rounded-full shrink-0', dotColor)} />
      <span className={cn('truncate', textColor)}>{info.label}</span>
      {showCode && (
        <span className="text-[11px] font-mono text-muted-foreground">
          ({status})
        </span>
      )}
    </span>
  );
}

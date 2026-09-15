import { Tag } from 'antd';
import { getStatusInfo } from '@/config/status.config';
import { cn } from '@/lib/utils';

interface StatusTagProps {
  status: number;
  showCode?: boolean;
  className?: string;
}

export function StatusTag({ status, showCode = true, className }: StatusTagProps) {
  const info = getStatusInfo(status);

  let color = 'default';

  if (info.group === 'success') {
    color = 'success';
  } else if (info.group === 'processing') {
    const isActivelyRunning = [22, 32, 42, 52, 62, 72].includes(status);
    color = isActivelyRunning ? 'processing' : 'warning';
  } else if (info.group === 'failed') {
    color = 'error';
  }

  return (
    <Tag color={color} className={cn('font-medium m-0 flex-inline items-center py-0.5 px-2 rounded-md', className)}>
      <span>{info.label}</span>
      {showCode && <span className="ml-1.5 opacity-80 font-mono text-[11px]">({status})</span>}
    </Tag>
  );
}

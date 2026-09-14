import { useState } from 'react';
import {
  STATUS_FILTER_GROUPS,
  VIDEO_STATUS_MAP,
} from '@/config/status.config';
import type { VideoFilterParams } from '@/types/video.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface VideoFilterBarProps {
  filters: Omit<VideoFilterParams, 'page' | 'size'>;
  total: number;
  loading: boolean;
  onFilterChange: (filters: Partial<Omit<VideoFilterParams, 'page' | 'size'>>) => void;
  onRefresh: () => void;
}

export function VideoFilterBar({
  filters,
  total,
  loading,
  onFilterChange,
  onRefresh,
}: VideoFilterBarProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onFilterChange({ search: searchInput });
  };

  const handleReset = () => {
    setSearchInput('');
    onFilterChange({
      search: '',
      statusGroup: 'all',
      status: undefined,
      csmMediaId: undefined,
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5 mb-5 shadow-xs space-y-4">
      {/* Top row: Status Group Tabs & Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs font-semibold text-muted-foreground mr-1 shrink-0">
            Nhóm trạng thái:
          </span>
          <div className="inline-flex rounded-lg bg-muted p-1 border border-border">
            {STATUS_FILTER_GROUPS.map((group) => {
              const isActive = (filters.statusGroup || 'all') === group.value;
              return (
                <button
                  key={group.value}
                  onClick={() =>
                    onFilterChange({
                      statusGroup: group.value,
                      status: undefined,
                    })
                  }
                  className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap',
                    isActive
                      ? 'bg-background text-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {group.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground self-end sm:self-center">
          <span>Tổng số video:</span>
          <span className="font-mono font-bold text-sm text-primary">
            {total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Bottom row: Search Form + Specific Status Selector + Actions */}
      <form
        onSubmit={handleSearchSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center"
      >
        <div className="lg:col-span-6 flex gap-2">
          <Input
            placeholder="Tìm theo ID, CSM ID, đường dẫn gốc, resource ID..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9"
          />
          <Button type="submit" size="sm" className="shrink-0 h-9">
            Tìm kiếm
          </Button>
        </div>

        <div className="lg:col-span-3">
          <Select
            value={filters.status !== undefined ? String(filters.status) : 'all'}
            onValueChange={(val) =>
              onFilterChange({
                status: val === 'all' ? undefined : Number(val),
              })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Mã trạng thái cụ thể" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả mã trạng thái</SelectItem>
              {Object.entries(VIDEO_STATUS_MAP).map(([code, info]) => (
                <SelectItem key={code} value={code}>
                  {code} — {info.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="lg:col-span-3 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-9 flex-1 sm:flex-none"
          >
            Đặt lại
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="h-9 flex-1 sm:flex-none font-medium"
          >
            {loading ? 'Đang tải...' : 'Làm mới'}
          </Button>
        </div>
      </form>
    </div>
  );
}

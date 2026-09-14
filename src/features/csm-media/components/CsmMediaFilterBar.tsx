import { useState } from 'react';
import type { CsmMediaFilterParams } from '@/types/csm-media.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CsmMediaFilterBarProps {
  filters: Omit<CsmMediaFilterParams, 'page' | 'size'>;
  total: number;
  loading: boolean;
  onFilterChange: (filters: Partial<Omit<CsmMediaFilterParams, 'page' | 'size'>>) => void;
  onRefresh: () => void;
}

export function CsmMediaFilterBar({
  filters,
  total,
  loading,
  onFilterChange,
  onRefresh,
}: CsmMediaFilterBarProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onFilterChange({ search: searchInput });
  };

  const handleReset = () => {
    setSearchInput('');
    onFilterChange({
      search: '',
      status: undefined,
      convertStatus: undefined,
      originUploadStatus: undefined,
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5 mb-5 shadow-xs space-y-4">
      {/* Top summary counter */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground uppercase tracking-wider">
          Bộ lọc Kho Media (CSM)
        </span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Tổng số media:</span>
          <span className="font-mono font-bold text-sm text-primary">
            {total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Filter Form */}
      <form
        onSubmit={handleSearchSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center"
      >
        <div className="lg:col-span-5 flex gap-2">
          <Input
            placeholder="Tìm theo tên media, ID, đường dẫn..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9"
          />
          <Button type="submit" size="sm" className="shrink-0 h-9">
            Tìm kiếm
          </Button>
        </div>

        <div className="lg:col-span-2">
          <Select
            value={filters.convertStatus !== undefined ? String(filters.convertStatus) : 'all'}
            onValueChange={(val) =>
              onFilterChange({
                convertStatus: val === 'all' ? undefined : Number(val),
              })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Trạng thái convert" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="100">100 — Chờ convert</SelectItem>
              <SelectItem value="1">1 — Thành công</SelectItem>
              <SelectItem value="24">24 — Download lỗi</SelectItem>
              <SelectItem value="34">34 — Verify lỗi</SelectItem>
              <SelectItem value="44">44 — Split lỗi</SelectItem>
              <SelectItem value="54">54 — Transcode lỗi</SelectItem>
              <SelectItem value="64">64 — Package lỗi</SelectItem>
              <SelectItem value="74">74 — Upload lỗi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="lg:col-span-2">
          <Select
            value={filters.originUploadStatus !== undefined ? String(filters.originUploadStatus) : 'all'}
            onValueChange={(val) =>
              onFilterChange({
                originUploadStatus: val === 'all' ? undefined : Number(val),
              })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Trạng thái upload gốc" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả upload gốc</SelectItem>
              <SelectItem value="1">1 — Đã upload gốc</SelectItem>
              <SelectItem value="0">0 — Chưa upload</SelectItem>
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

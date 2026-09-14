import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import dayjs from 'dayjs';
import { StatusTag } from './StatusTag';
import { APP_CONFIG } from '@/config/app.config';
import { VIDEO_STATUS_MAP } from '@/config/status.config';
import type { Video } from '@/types/video.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface VideoTableProps {
  videos: Video[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  onPageChange: (page: number, pageSize: number) => void;
  onViewDetail: (video: Video) => void;
  onEdit: (video: Video) => void;
  onColumnFilterApply?: (filters: { csmMediaId?: number; status?: number }) => void;
}

export function VideoTable({
  videos,
  total,
  page,
  pageSize,
  loading,
  onPageChange,
  onViewDetail,
  onEdit,
  onColumnFilterApply,
}: VideoTableProps) {
  // Column filter popover states
  const [csmIdFilter, setCsmIdFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  const columns = useMemo<ColumnDef<Video>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 80,
        cell: ({ getValue }) => (
          <span className="font-mono font-bold text-primary">
            #{getValue<number>()}
          </span>
        ),
      },
      {
        accessorKey: 'csmMediaId',
        header: () => (
          <div className="flex items-center gap-1.5">
            <span>CSM ID</span>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    'h-5 w-5 rounded hover:bg-muted inline-flex items-center justify-center text-[10px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors',
                    csmIdFilter && 'text-primary font-bold'
                  )}
                  title="Lọc theo CSM ID"
                >
                  ▼
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3 space-y-2" align="start">
                <p className="text-xs font-semibold text-foreground">Lọc theo CSM Media ID</p>
                <Input
                  placeholder="Nhập ID..."
                  value={csmIdFilter}
                  onChange={(e) => setCsmIdFilter(e.target.value)}
                  className="h-8 text-xs"
                />
                <div className="flex justify-end gap-1.5 pt-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      setCsmIdFilter('');
                      if (onColumnFilterApply) onColumnFilterApply({ csmMediaId: undefined });
                    }}
                  >
                    Xóa
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      if (onColumnFilterApply) {
                        onColumnFilterApply({
                          csmMediaId: csmIdFilter ? Number(csmIdFilter) : undefined,
                        });
                      }
                    }}
                  >
                    Áp dụng
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ),
        size: 110,
        cell: ({ getValue }) => {
          const id = getValue<number>();
          if (id === null || id === undefined) return <span className="text-muted-foreground">—</span>;
          return (
            <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted text-foreground">
              {id} {id <= 0 ? '(Test)' : ''}
            </span>
          );
        },
      },
      {
        accessorKey: 'originalPath',
        header: 'Đường dẫn file gốc',
        cell: ({ getValue }) => {
          const path = getValue<string>();
          return (
            <div className="max-w-[320px] truncate text-xs text-foreground" title={path || undefined}>
              {path || '—'}
            </div>
          );
        },
      },
      {
        id: 'resolution_duration',
        header: 'Độ phân giải / Thời lượng',
        size: 180,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-medium text-foreground">
              {row.original.resolution || '—'}
            </span>
            <span className="text-muted-foreground/50">|</span>
            <span className="text-muted-foreground">
              {formatDuration(row.original.duration)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'priority',
        header: 'Ưu tiên',
        size: 90,
        cell: ({ getValue }) => {
          const prio = getValue<number | null>();
          return (
            <span
              className={cn(
                'font-mono text-xs font-semibold',
                prio && prio > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
              )}
            >
              {prio ?? 0}
            </span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: () => (
          <div className="flex items-center gap-1.5">
            <span>Trạng thái</span>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    'h-5 w-5 rounded hover:bg-muted inline-flex items-center justify-center text-[10px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors',
                    statusFilter !== 'all' && 'text-primary font-bold'
                  )}
                  title="Lọc trạng thái cột"
                >
                  ▼
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3 space-y-2" align="start">
                <p className="text-xs font-semibold text-foreground">Lọc theo trạng thái</p>
                <Select
                  value={statusFilter}
                  onValueChange={(val) => {
                    setStatusFilter(val);
                    if (onColumnFilterApply) {
                      onColumnFilterApply({
                        status: val === 'all' ? undefined : Number(val),
                      });
                    }
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {Object.entries(VIDEO_STATUS_MAP).map(([code, info]) => (
                      <SelectItem key={code} value={code}>
                        {code} — {info.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </PopoverContent>
            </Popover>
          </div>
        ),
        size: 220,
        cell: ({ getValue }) => <StatusTag status={getValue<number>()} />,
      },
      {
        accessorKey: 'modifiedAt',
        header: 'Cập nhật',
        size: 140,
        cell: ({ getValue }) => {
          const date = getValue<string>();
          return (
            <span className="text-xs text-muted-foreground font-mono">
              {date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '—'}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Thao tác',
        size: 140,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs font-medium text-primary hover:bg-primary/10"
              onClick={() => onViewDetail(row.original)}
            >
              Chi tiết
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(row.original)}
            >
              Sửa
            </Button>
          </div>
        ),
      },
    ],
    [csmIdFilter, statusFilter, onColumnFilterApply, onViewDetail, onEdit]
  );

  const table = useReactTable({
    data: videos,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  const startRecord = total > 0 ? page * pageSize + 1 : 0;
  const endRecord = Math.min((page + 1) * pageSize, total);

  return (
    <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
      {/* Scrollable Table Container */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.column.getSize() }}
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <span className="text-xs">Đang tải dữ liệu video...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => onViewDetail(row.original)}
                  className="cursor-pointer hover:bg-muted/40 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-28 text-center text-muted-foreground text-xs">
                  Không tìm thấy video nào phù hợp với bộ lọc.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination & Page Size Toolbar */}
      <div className="p-3 sm:p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground bg-muted/20">
        <div>
          Hiển thị <span className="font-semibold text-foreground">{startRecord}-{endRecord}</span> trên tổng số{' '}
          <span className="font-semibold text-foreground font-mono">{total.toLocaleString()}</span> video
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <span>Hiển thị:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => onPageChange(0, Number(val))}
            >
              <SelectTrigger className="h-7 w-20 text-xs">
                <SelectValue placeholder="Số hàng" />
              </SelectTrigger>
              <SelectContent>
                {APP_CONFIG.pagination.pageSizeOptions.map((sz) => (
                  <SelectItem key={sz} value={String(sz)}>
                    {sz} / trang
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onPageChange(page - 1, pageSize)}
              disabled={page <= 0 || loading}
            >
              ◀ Trước
            </Button>
            <span className="px-2 font-mono font-medium text-foreground">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onPageChange(page + 1, pageSize)}
              disabled={page >= totalPages - 1 || loading}
            >
              Sau ▶
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

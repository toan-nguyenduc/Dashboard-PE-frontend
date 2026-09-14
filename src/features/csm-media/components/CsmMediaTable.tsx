import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import dayjs from 'dayjs';
import { APP_CONFIG } from '@/config/app.config';
import type { CsmMedia } from '@/types/csm-media.types';
import { Button } from '@/components/ui/button';
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

interface CsmMediaTableProps {
  mediaList: CsmMedia[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  onViewDetail: (media: CsmMedia) => void;
  onReEncode: (media: CsmMedia) => void;
  onColumnFilterApply?: (filters: { convertStatus?: number }) => void;
}

export function CsmMediaTable({
  mediaList,
  loading,
  total,
  page,
  pageSize,
  onPageChange,
  onViewDetail,
  onReEncode,
  onColumnFilterApply,
}: CsmMediaTableProps) {
  const [convertStatusFilter, setConvertStatusFilter] = useState<string>('all');

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getConvertStatusBadge = (status: number | null) => {
    switch (status) {
      case 100:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-400 font-semibold">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            Chờ convert (100)
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Convert xong (1)
          </span>
        );
      case 24:
      case 34:
      case 44:
      case 54:
      case 64:
      case 74:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-red-700 dark:text-red-400 font-semibold">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Lỗi bước {Math.floor(status / 10)} ({status})
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            {status !== null ? `Status ${status}` : '—'}
          </span>
        );
    }
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  const columns = useMemo<ColumnDef<CsmMedia>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'CSM ID',
        size: 90,
        cell: ({ getValue }) => (
          <span className="font-mono font-bold text-primary">
            #{getValue<number>()}
          </span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Tên Media',
        size: 240,
        cell: ({ getValue }) => {
          const name = getValue<string>();
          return (
            <div className="max-w-[240px] truncate text-xs font-semibold text-foreground" title={name}>
              {name || '—'}
            </div>
          );
        },
      },
      {
        accessorKey: 'originalPath',
        header: 'Đường dẫn file gốc',
        cell: ({ getValue }) => {
          const path = getValue<string>();
          return (
            <div className="max-w-[280px] truncate text-xs text-muted-foreground font-mono" title={path || undefined}>
              {path || '—'}
            </div>
          );
        },
      },
      {
        id: 'res_duration',
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
        accessorKey: 'convertStatus',
        header: () => (
          <div className="flex items-center gap-1.5">
            <span>Trạng thái Kho (CSM)</span>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    'h-5 w-5 rounded hover:bg-muted inline-flex items-center justify-center text-[10px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors',
                    convertStatusFilter !== 'all' && 'text-primary font-bold'
                  )}
                  title="Lọc trạng thái CSM"
                >
                  ▼
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-60 p-3 space-y-2" align="start">
                <p className="text-xs font-semibold text-foreground">Lọc theo trạng thái convert</p>
                <Select
                  value={convertStatusFilter}
                  onValueChange={(val) => {
                    setConvertStatusFilter(val);
                    if (onColumnFilterApply) {
                      onColumnFilterApply({
                        convertStatus: val === 'all' ? undefined : Number(val),
                      });
                    }
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
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
              </PopoverContent>
            </Popover>
          </div>
        ),
        size: 190,
        cell: ({ getValue }) => getConvertStatusBadge(getValue<number | null>()),
      },
      {
        id: 'linkedVideo',
        header: 'Video PE liên kết',
        size: 200,
        cell: ({ row }) => {
          const m = row.original;
          if (!m.linkedVideoId) {
            return <span className="text-xs text-muted-foreground">Chưa có</span>;
          }

          const isFailed = m.linkedVideoStatus && [23, 24, 33, 34, 43, 44, 53, 54, 63, 64, 73, 74].includes(m.linkedVideoStatus);
          const isSuccess = m.linkedVideoStatus && [1, 71].includes(m.linkedVideoStatus);

          return (
            <div className="flex flex-col text-xs">
              <span className="font-mono font-semibold text-primary">
                Video #{m.linkedVideoId}
              </span>
              <span
                className={cn(
                  'text-[11px] truncate',
                  isFailed && 'text-red-600 dark:text-red-400 font-medium',
                  isSuccess && 'text-emerald-600 dark:text-emerald-400 font-medium',
                  !isFailed && !isSuccess && 'text-blue-600 dark:text-blue-400'
                )}
              >
                {m.linkedVideoStatusDescription || `Status ${m.linkedVideoStatus}`}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'updatedAt',
        header: 'Cập nhật',
        size: 130,
        cell: ({ getValue }) => {
          const date = getValue<string | null>();
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
        size: 160,
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
              variant="default"
              size="sm"
              className="h-7 px-2 text-xs font-medium"
              onClick={() => onReEncode(row.original)}
            >
              Re-encode
            </Button>
          </div>
        ),
      },
    ],
    [convertStatusFilter, onColumnFilterApply, onViewDetail, onReEncode]
  );

  const table = useReactTable({
    data: mediaList,
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
                    <span className="text-xs">Đang tải danh sách CSM Media...</span>
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
                  Không tìm thấy media nào trong kho phù hợp với bộ lọc.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Toolbar */}
      <div className="p-3 sm:p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground bg-muted/20">
        <div>
          Hiển thị <span className="font-semibold text-foreground">{startRecord}-{endRecord}</span> trên tổng số{' '}
          <span className="font-semibold text-foreground font-mono">{total.toLocaleString()}</span> media
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

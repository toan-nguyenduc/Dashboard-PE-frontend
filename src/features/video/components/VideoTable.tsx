import { useMemo, useState } from "react";
import { Table, Dropdown, Tooltip } from "antd";
import type { MenuProps } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import dayjs from "dayjs";
import { StatusTag } from "./StatusTag";
import { canReconvert, isFullSuccess } from "@/config/status.config";
import { APP_CONFIG } from "@/config/app.config";
import type { Video } from "@/types/video.types";
import { MoreVertical, Eye, Edit, RefreshCw, Check, Copy } from "lucide-react";
import { TableSkeleton } from "@/components/TableSkeleton";

interface VideoTableProps {
  videos: Video[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  onPageChange: (page: number, pageSize: number) => void;
  onSortChange?: (sortBy: string, sortDir: "asc" | "desc") => void;
  onViewDetail: (video: Video) => void;
  onEdit?: (video: Video) => void;
  onReconvert?: (video: Video) => void;
}

function cleanVal(v?: unknown): string {
  if (v === null || v === undefined) return '';
  const str = String(v).trim();
  if (['None', 'none', '—', '-', '_', 'null', 'undefined'].includes(str)) return '';
  return str;
}

function extractTitle(metaInfo: string | null): string {
  const clean = cleanVal(metaInfo);
  if (!clean) return "";
  try {
    return cleanVal(JSON.parse(clean).title);
  } catch {
    return "";
  }
}

function parsePathStr(raw: string | null) {
  const clean = cleanVal(raw);
  if (!clean) return "";
  try {
    const parsed = JSON.parse(clean);
    if (parsed && typeof parsed === "object") {
      const parts: string[] = [];
      if (cleanVal(parsed.domain)) parts.push(String(parsed.domain).trim().replace(/\/+$/, ''));
      if (cleanVal(parsed.bucket)) parts.push(String(parsed.bucket).trim().replace(/^\/+|\/+$/g, ''));
      if (cleanVal(parsed.path)) parts.push(String(parsed.path).trim().replace(/^\/+/, ''));
      return parts.join("/");
    }
  } catch {}
  return clean;
}

function formatDuration(seconds?: number | null): string {
  if (!seconds) return "";
  return `${seconds}s`; // Display as raw seconds based on reqs
}

function formatDate(isoString: string | null): string {
  const clean = cleanVal(isoString);
  if (!clean) return "";
  return dayjs(clean).format("DD/MM/YYYY HH:mm:ss");
}

function CopyBtn({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Tooltip title={`Copy ${label}`}>
      <span
        onClick={(e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="ml-1.5 inline-flex items-center justify-center rounded text-muted-foreground hover:text-primary transition-colors cursor-pointer"
      >
        {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
      </span>
    </Tooltip>
  );
}

export function VideoTable({
  videos,
  total,
  page,
  pageSize,
  loading,
  onPageChange,
  onSortChange,
  onViewDetail,
  onEdit,
  onReconvert,
}: VideoTableProps) {
  
  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>,
    sorter: SorterResult<Video> | SorterResult<Video>[]
  ) => {
    // Pagination (antd uses 1-based index, we use 0-based)
    if (pagination.current && pagination.pageSize) {
      onPageChange(pagination.current - 1, pagination.pageSize);
    }

    // Sorting
    if (onSortChange && !Array.isArray(sorter) && sorter.columnKey) {
      if (sorter.order) {
        onSortChange(sorter.columnKey as string, sorter.order === 'ascend' ? 'asc' : 'desc');
      } else {
        // Default back to ID desc if sort is cleared
        onSortChange('id', 'desc');
      }
    }
  };

  const columns: ColumnsType<Video> = useMemo(() => [
    {
      title: "Tên video",
      key: "title",
      width: 280,
      render: (_, record) => {
        const title = extractTitle(record.metaInfo);
        const csmId = record.csmMediaId;
        return (
          <div className="flex flex-col gap-0.5 max-w-[280px]">
            <span className="text-[14px] font-[600] text-[#2f3e46] truncate" title={title || "Không có tên"}>
              {title || `Video #${record.id}`}
            </span>
            <span className="text-[12px] text-[#6c757d] font-mono flex items-center">
              CSM ID: {csmId} <CopyBtn value={String(csmId)} label="CSM ID" />
            </span>
          </div>
        );
      }
    },
    {
      title: "Original Path",
      key: "originalPath",
      width: 220,
      render: (_, record) => {
        const full = parsePathStr(record.originalPath);
        if (!full) return null;
        return (
          <Tooltip title={
            <div className="flex flex-col gap-1 max-w-[300px] break-all">
              <span>{full}</span>
            </div>
          } placement="topLeft">
            <div className="max-w-[200px] truncate text-sm text-primary hover:underline cursor-pointer flex items-center">
              <span className="truncate">{full}</span>
              <CopyBtn value={full} label="Path" />
            </div>
          </Tooltip>
        );
      }
    },
    {
      title: "Nguồn video",
      key: "source",
      width: 120,
      render: (_, record) => {
        const csmId = record.csmMediaId;
        if (csmId === 0) return <span className="text-violet-600 font-medium text-sm">FastChannel</span>;
        if (csmId > 0) return <span className="text-blue-600 font-medium text-sm">Kho Nội dung</span>;
        return <span className="text-orange-500 font-medium text-sm">Nội bộ / Test</span>;
      }
    },
    {
      title: "Phân giải",
      dataIndex: "resolution",
      key: "resolution",
      width: 100,
      render: (val) => <span className="text-sm font-medium">{cleanVal(val)}</span>
    },
    {
      title: "Thời lượng",
      dataIndex: "duration",
      key: "duration",
      width: 90,
      sorter: true,
      render: (val) => <span className="text-sm font-mono">{formatDuration(val)}</span>
    },
    {
      title: "Bắt đầu Convert",
      dataIndex: "convertStartTime",
      key: "convertStartTime",
      width: 150,
      sorter: true,
      render: (val) => <span className="text-sm">{formatDate(val)}</span>
    },
    {
      title: "Kết thúc Convert",
      dataIndex: "convertEndTime",
      key: "convertEndTime",
      width: 150,
      sorter: true,
      render: (val) => <span className="text-sm">{formatDate(val)}</span>
    },
    {
      title: "Ưu tiên",
      dataIndex: "priority",
      key: "priority",
      width: 80,
      sorter: true,
      render: (val) => <span className="text-sm">{val ?? 0}</span>
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 200,
      render: (val) => <StatusTag status={val} />
    },
    {
      title: "",
      key: "actions",
      width: 60,
      fixed: 'right',
      render: (_, record) => {
        const _canReconvert = canReconvert(record.status);
        const _isSuccess = isFullSuccess(record.status);
        
        const items: MenuProps['items'] = [
          {
            key: 'view',
            icon: <Eye size={16} />,
            label: 'Xem chi tiết',
            onClick: () => onViewDetail(record)
          },
          {
            key: 'edit',
            icon: <Edit size={16} />,
            label: 'Chỉnh sửa',
            onClick: () => onEdit && onEdit(record)
          },
          { type: 'divider' },
          {
            key: 'reconvert',
            icon: <RefreshCw size={16} />,
            label: _isSuccess ? 'Re-encode (CSM)' : 'Re-verify',
            disabled: !_canReconvert,
            onClick: () => onReconvert && onReconvert(record)
          }
        ];

        return (
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted cursor-pointer text-muted-foreground">
              <MoreVertical size={16} />
            </span>
          </Dropdown>
        );
      }
    }
  ], [onViewDetail, onEdit, onReconvert]);

  if (loading && videos.length === 0) {
    return <TableSkeleton columns={10} rows={10} />;
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden antd-table-wrapper">
      <Table
        columns={columns}
        dataSource={videos}
        rowKey="id"
        onChange={handleTableChange}
        loading={loading}
        pagination={{
          current: page + 1,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          pageSizeOptions: APP_CONFIG.pagination.pageSizeOptions.map(String),
          showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} / tổng ${total.toLocaleString()}`,
          position: ['bottomLeft'],
          className: "px-4 py-3 m-0 border-t border-border/50 bg-muted/20"
        }}
        scroll={{ x: 1400 }}
        size="middle"
        rowClassName="hover:bg-muted/40 transition-colors"
      />
    </div>
  );
}

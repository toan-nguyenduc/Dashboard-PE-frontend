import { useMemo, useState } from "react";
import { Table, Tooltip, Tag } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import dayjs from "dayjs";
import { APP_CONFIG } from "@/config/app.config";
import type { CsmMedia } from "@/types/csm-media.types";
import { Check, Copy } from "lucide-react";
import { TableSkeleton } from "@/components/TableSkeleton";

interface CsmMediaTableProps {
  mediaList: CsmMedia[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  onPageChange: (page: number, pageSize: number) => void;
  onSortChange?: (sortBy: string, sortDir: "asc" | "desc") => void;
  onViewDetail: (media: CsmMedia) => void;
  onReEncode: (media: CsmMedia) => void;
}

function cleanVal(v?: unknown): string {
  if (v === null || v === undefined) return '';
  const str = String(v).trim();
  if (['None', 'none', '—', '-', '_', 'null', 'undefined'].includes(str)) return '';
  return str;
}

function formatDuration(seconds?: number | null): string {
  if (!seconds) return "";
  return `${seconds}s`;
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

function ConvertStatusTag({ status }: { status: number | null }) {
  if (status === null || status === undefined) return <span className="text-muted-foreground">-</span>;
  if (status === 1) return <Tag color="success">Thành công (1)</Tag>;
  if (status === 100) return <Tag color="warning">Chờ convert (100)</Tag>;
  return <Tag color="error">Lỗi ({status})</Tag>;
}

export function CsmMediaTable({
  mediaList,
  total,
  page,
  pageSize,
  loading,
  onPageChange,
  onSortChange,
  onViewDetail,
  onReEncode,
}: CsmMediaTableProps) {
  
  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>,
    sorter: SorterResult<CsmMedia> | SorterResult<CsmMedia>[]
  ) => {
    if (pagination.current && pagination.pageSize) {
      onPageChange(pagination.current - 1, pagination.pageSize);
    }
    if (onSortChange && !Array.isArray(sorter) && sorter.columnKey) {
      if (sorter.order) {
        onSortChange(sorter.columnKey as string, sorter.order === 'ascend' ? 'asc' : 'desc');
      } else {
        onSortChange('id', 'desc');
      }
    }
  };

  const columns: ColumnsType<CsmMedia> = useMemo(() => [
    {
      title: "Media",
      key: "name",
      width: 280,
      render: (_, record) => {
        const name = cleanVal(record.name);
        const slug = cleanVal(record.slug);
        return (
          <div className="flex flex-col gap-0.5 max-w-[280px]">
            <span className="text-[14px] font-[600] text-[#2f3e46] truncate" title={name || "Không có tên"}>
              {name || `Media #${record.id}`}
            </span>
            <span className="text-[12px] text-[#6c757d] font-mono flex items-center truncate" title={slug}>
              CSM ID: {record.id} <CopyBtn value={String(record.id)} label="CSM ID" />
            </span>
          </div>
        );
      }
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 80,
      render: (val) => <span className="text-sm font-medium">{val ?? '-'}</span>
    },
    {
      title: "Type",
      dataIndex: "fileType",
      key: "fileType",
      width: 90,
      render: (val) => {
        if (val === 1) return <span className="text-sm">NAS</span>;
        if (val === 2) return <span className="text-sm">S3</span>;
        return <span className="text-sm text-muted-foreground">{val ?? '-'}</span>;
      }
    },
    {
      title: "Resolution",
      dataIndex: "resolution",
      key: "resolution",
      width: 100,
      render: (val) => <span className="text-sm font-medium">{cleanVal(val)}</span>
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      width: 90,
      sorter: true,
      render: (val) => <span className="text-sm font-mono">{formatDuration(val)}</span>
    },
    {
      title: "AI Review",
      dataIndex: "aiReviewStatus",
      key: "aiReviewStatus",
      width: 100,
      render: (val) => {
        if (val === 1) return <Tag color="success">Đã duyệt</Tag>;
        if (val === 0) return <Tag color="default">Chưa duyệt</Tag>;
        return <span className="text-sm text-muted-foreground">-</span>;
      }
    },
    {
      title: "Convert Status",
      dataIndex: "convertStatus",
      key: "convertStatus",
      width: 150,
      render: (val) => <ConvertStatusTag status={val} />
    },
    {
      title: "Published At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      sorter: true,
      render: (val) => <span className="text-sm text-muted-foreground">{formatDate(val)}</span>
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 140,
      sorter: true,
      render: (val) => <span className="text-sm text-muted-foreground">{formatDate(val)}</span>
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 190,
      fixed: 'right',
      render: (_, record) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <button
            type="button"
            onClick={() => onViewDetail(record)}
            className="rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            Xem
          </button>
          <button
            type="button"
            onClick={() => onReEncode(record)}
            className="rounded-md px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-500/10 transition-colors"
          >
            Re-encode
          </button>
        </div>
      )
    }
  ], [onViewDetail, onReEncode]);

  if (loading && mediaList.length === 0) {
    return <TableSkeleton columns={10} rows={10} />;
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden antd-table-wrapper">
      <Table
        columns={columns}
        dataSource={mediaList}
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
        scroll={{ x: 1300 }}
        size="middle"
        rowClassName="hover:bg-muted/40 transition-colors"
      />
    </div>
  );
}

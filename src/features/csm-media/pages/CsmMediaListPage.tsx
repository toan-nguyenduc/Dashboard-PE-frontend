import { useState } from 'react';
import { useCsmMedia } from '../hooks/useCsmMedia';
import { useCsmMediaStats } from '../hooks/useCsmMediaStats';
import { CsmMediaTable } from '../components/CsmMediaTable';
import { CsmMediaDetailDrawer } from '../components/CsmMediaDetailDrawer';
import { ReEncodeModal } from '../components/ReEncodeModal';
import type { CsmMedia, ReEncodeRequest } from '@/types/csm-media.types';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { DatePicker, Input, Button } from "antd";
import dayjs from "dayjs";
import { Search, RefreshCw } from "lucide-react";

const { RangePicker } = DatePicker;

export function CsmMediaListPage() {
  const {
    mediaList,
    total,
    page,
    pageSize,
    loading,
    filters,
    setPage,
    setPageSize,
    setFilters,
    triggerReEncode,
    refresh,
  } = useCsmMedia();

  const { stats, refreshStats } = useCsmMediaStats(filters);

  const [selectedMedia, setSelectedMedia] = useState<CsmMedia | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [reEncodeModalVisible, setReEncodeModalVisible] = useState(false);
  const [reEncodeMedia, setReEncodeMedia] = useState<CsmMedia | null>(null);
  const [reEncodeLoading, setReEncodeLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search || "");

  const handleViewDetail = (media: CsmMedia) => {
    setSelectedMedia(media);
    setDrawerVisible(true);
  };

  const handleOpenReEncode = (media: CsmMedia) => {
    setReEncodeMedia(media);
    setReEncodeModalVisible(true);
  };

  const handleConfirmReEncode = async (id: number, data: ReEncodeRequest) => {
    setReEncodeLoading(true);
    try {
      await triggerReEncode(id, data);
      if (selectedMedia && selectedMedia.id === id) {
        setSelectedMedia({
          ...selectedMedia,
          convertStatus: 100,
          originUploadStatus: 1,
          linkedVideoStatus: 0,
          linkedVideoStatusDescription: 'Chờ convert',
        });
      }
      refreshStats();
    } finally {
      setReEncodeLoading(false);
      setReEncodeModalVisible(false);
    }
  };

  const rangePresets: { label: string; value: [dayjs.Dayjs, dayjs.Dayjs] }[] = [
    { label: "Hôm nay", value: [dayjs().startOf("day"), dayjs().endOf("day")] },
    { label: "7 ngày qua", value: [dayjs().subtract(7, "d"), dayjs()] },
    { label: "30 ngày qua", value: [dayjs().subtract(30, "d"), dayjs()] },
  ];

  const handleTimeRangeChange = (dates: any) => {
    if (!dates || !dates[0] || !dates[1]) {
      setFilters({ timeRange: "all" });
      return;
    }
    const [start, end] = dates;
    const today = dayjs().startOf("day");
    
    if (start.isSame(today, 'day') && end.isSame(dayjs().endOf("day"), 'day')) {
      setFilters({ timeRange: "today" });
    } else if (start.isSame(dayjs().subtract(7, "d"), 'day')) {
      setFilters({ timeRange: "7d" });
    } else if (start.isSame(dayjs().subtract(30, "d"), 'day')) {
      setFilters({ timeRange: "30d" });
    } else {
      setFilters({ timeRange: JSON.stringify([start.toISOString(), end.toISOString()]) });
    }
  };

  const handleSearchSubmit = () => {
    setFilters({ search: searchInput });
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Quản lý CSM Media
        </h1>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <RangePicker 
            presets={rangePresets} 
            onChange={handleTimeRangeChange}
            className="w-full sm:w-72 shadow-sm rounded-lg" 
            placeholder={["Từ ngày", "Đến ngày"]}
          />
          <Button 
            icon={<RefreshCw size={16} />} 
            onClick={() => { refresh(); refreshStats(); }}
            loading={loading}
            className="w-full sm:w-auto"
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* 3 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Card */}
        <Card
          onClick={() => setFilters({ convertStatus: undefined, originUploadStatus: undefined })}
          className={cn(
            'p-4 sm:p-5 cursor-pointer hover:border-primary/50 transition-all shadow-xs',
            filters.convertStatus === undefined && 'border-primary ring-1 ring-primary/20'
          )}
        >
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Tổng Media trong kho
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-black font-mono text-primary">
            {stats.total.toLocaleString()}
          </div>
        </Card>

        {/* Waiting Convert Card */}
        <Card
          onClick={() => setFilters({ convertStatus: 100 })}
          className={cn(
            'p-4 sm:p-5 cursor-pointer hover:border-warning/50 transition-all shadow-xs bg-orange-500/5 border-orange-500/20',
            filters.convertStatus === 100 && 'border-orange-500 ring-1 ring-orange-500/30'
          )}
        >
          <div className="text-sm font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider flex items-center justify-between">
            <span>Chờ convert (100)</span>
            <span className="h-2 w-2 rounded-full bg-orange-500" />
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-black font-mono text-orange-700 dark:text-orange-400">
            {stats.waitingConvert.toLocaleString()}
          </div>
        </Card>

        {/* Failed Card */}
        <Card
          className="p-4 sm:p-5 shadow-xs bg-red-500/5 border-red-500/20"
        >
          <div className="text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-wider flex items-center justify-between">
            <span>Thất bại</span>
            <span className="h-2 w-2 rounded-full bg-red-500" />
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-black font-mono text-red-700 dark:text-red-400">
            {stats.failed.toLocaleString()}
          </div>
        </Card>
      </div>

      {/* Table Controls (Search) */}
      <div className="flex justify-between items-center bg-card p-3 rounded-t-xl border border-border border-b-0">
        <Input
          placeholder="Tìm theo tên media, ID, slug..."
          prefix={<Search size={16} className="text-muted-foreground mr-2" />}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onPressEnter={handleSearchSubmit}
          className="max-w-md shadow-sm"
          allowClear
        />
      </div>

      {/* Table */}
      <CsmMediaTable
        mediaList={mediaList}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={(newPage, newPageSize) => {
          setPage(newPage);
          setPageSize(newPageSize);
        }}
        onSortChange={(sortBy, sortDir) => setFilters({ sortBy, sortDir })}
        onViewDetail={handleViewDetail}
        onReEncode={handleOpenReEncode}
      />

      {/* Detail Drawer */}
      <CsmMediaDetailDrawer
        visible={drawerVisible}
        media={selectedMedia}
        onClose={() => {
          setDrawerVisible(false);
          setTimeout(() => setSelectedMedia(null), 300);
        }}
        onReEncode={(media) => {
          handleOpenReEncode(media);
        }}
      />

      {/* Re-encode Modal */}
      <ReEncodeModal
        visible={reEncodeModalVisible}
        media={reEncodeMedia}
        loading={reEncodeLoading}
        onConfirm={handleConfirmReEncode}
        onCancel={() => setReEncodeModalVisible(false)}
      />
    </div>
  );
}

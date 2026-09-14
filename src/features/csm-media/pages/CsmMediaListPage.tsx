import { useState, useMemo } from 'react';
import { useCsmMedia } from '../hooks/useCsmMedia';
import { CsmMediaFilterBar } from '../components/CsmMediaFilterBar';
import { CsmMediaTable } from '../components/CsmMediaTable';
import { CsmMediaDetailDrawer } from '../components/CsmMediaDetailDrawer';
import { ReEncodeModal } from '../components/ReEncodeModal';
import type { CsmMedia, ReEncodeRequest } from '@/types/csm-media.types';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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

  const [selectedMedia, setSelectedMedia] = useState<CsmMedia | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [reEncodeModalVisible, setReEncodeModalVisible] = useState(false);
  const [reEncodeMedia, setReEncodeMedia] = useState<CsmMedia | null>(null);
  const [reEncodeLoading, setReEncodeLoading] = useState(false);

  // Compute summary stats from current page records
  const stats = useMemo(() => {
    const waitingConvertCount = mediaList.filter((m) => m.convertStatus === 100).length;
    const failedCount = mediaList.filter(
      (m) => m.convertStatus && [24, 34, 44, 54, 64, 74].includes(m.convertStatus)
    ).length;
    const linkedVideoCount = mediaList.filter((m) => m.linkedVideoId !== null).length;

    return { waitingConvertCount, failedCount, linkedVideoCount };
  }, [mediaList]);

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
    } finally {
      setReEncodeLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Quản lý Kho Media (CSM Media)
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Tra cứu toàn bộ media từ kho gốc CSM, theo dõi trạng thái chuyển mã và kích hoạt Re-encode khi cần
        </p>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Card */}
        <Card
          onClick={() => setFilters({ convertStatus: undefined, originUploadStatus: undefined })}
          className="p-4 sm:p-5 cursor-pointer hover:border-primary/50 transition-all shadow-xs"
        >
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Tổng Media trong kho
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-primary">
            {total.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">Kho nội dung CSM</div>
        </Card>

        {/* Waiting Convert Card */}
        <Card
          onClick={() => setFilters({ convertStatus: 100 })}
          className={cn(
            'p-4 sm:p-5 cursor-pointer hover:border-blue-500/50 transition-all shadow-xs bg-blue-500/5 border-blue-500/20',
            filters.convertStatus === 100 && 'border-blue-500 ring-1 ring-blue-500/30'
          )}
        >
          <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center justify-between">
            <span>Chờ convert (100)</span>
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-blue-700 dark:text-blue-400">
            {stats.waitingConvertCount}
          </div>
          <div className="mt-1 text-[11px] text-blue-600/70 dark:text-blue-400/70">
            (Trên trang hiện tại)
          </div>
        </Card>

        {/* Failed Card */}
        <Card
          className="p-4 sm:p-5 shadow-xs bg-red-500/5 border-red-500/20"
        >
          <div className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider flex items-center justify-between">
            <span>Thất bại</span>
            <span className="h-2 w-2 rounded-full bg-red-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-red-700 dark:text-red-400">
            {stats.failedCount}
          </div>
          <div className="mt-1 text-[11px] text-red-600/70 dark:text-red-400/70">
            (Mã lỗi x4 trên trang)
          </div>
        </Card>

        {/* Linked Video Card */}
        <Card
          className="p-4 sm:p-5 shadow-xs bg-emerald-500/5 border-emerald-500/20"
        >
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center justify-between">
            <span>Đã liên kết PE</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400">
            {stats.linkedVideoCount}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600/70 dark:text-emerald-400/70">
            (Có video tương ứng)
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <CsmMediaFilterBar
        filters={filters}
        onFilterChange={setFilters}
        onRefresh={refresh}
        loading={loading}
        total={total}
      />

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
        onViewDetail={handleViewDetail}
        onReEncode={handleOpenReEncode}
        onColumnFilterApply={(columnFilters) => setFilters(columnFilters)}
      />

      {/* Detail Drawer */}
      <CsmMediaDetailDrawer
        visible={drawerVisible}
        media={selectedMedia}
        onClose={() => setDrawerVisible(false)}
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

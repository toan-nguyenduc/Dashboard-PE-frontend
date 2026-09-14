import { useState, useMemo } from 'react';
import { useVideos } from '../hooks/useVideos';
import { VideoFilterBar } from '../components/VideoFilterBar';
import { VideoTable } from '../components/VideoTable';
import { VideoDetailDrawer } from '../components/VideoDetailDrawer';
import { VideoEditModal } from '../components/VideoEditModal';
import { VIDEO_STATUS_MAP } from '@/config/status.config';
import type { Video, VideoUpdateRequest } from '@/types/video.types';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function VideoListPage() {
  const {
    videos,
    total,
    page,
    pageSize,
    loading,
    filters,
    setPage,
    setPageSize,
    setFilters,
    updateVideo,
    updateStatus,
    refresh,
  } = useVideos();

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Quick stats computed from current visible list
  const stats = useMemo(() => {
    let processingCount = 0;
    let failedCount = 0;
    let successCount = 0;
    let waitingCount = 0;

    videos.forEach((v) => {
      const info = VIDEO_STATUS_MAP[v.status];
      if (!info) return;
      if (info.group === 'processing') processingCount++;
      else if (info.group === 'failed') failedCount++;
      else if (info.group === 'success') successCount++;
      else if (info.group === 'waiting') waitingCount++;
    });

    return { processingCount, failedCount, successCount, waitingCount };
  }, [videos]);

  const handleViewDetail = (video: Video) => {
    setSelectedVideo(video);
    setDrawerOpen(true);
  };

  const handleOpenEdit = (video: Video) => {
    setEditingVideo(video);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (id: number, values: VideoUpdateRequest) => {
    const updated = await updateVideo(id, values);
    if (selectedVideo && selectedVideo.id === id) {
      setSelectedVideo(updated);
    }
  };

  const handleUpdateStatusAndRefresh = async (id: number, newStatus: number) => {
    const updated = await updateStatus(id, newStatus);
    if (selectedVideo && selectedVideo.id === id) {
      setSelectedVideo(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Giám sát Video Transcode
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Theo dõi trạng thái thời gian thực và quản lý các video trong quy trình Pertitle Encoding (PE)
        </p>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Card */}
        <Card
          onClick={() => setFilters({ statusGroup: 'all', status: undefined })}
          className={cn(
            'p-4 sm:p-5 cursor-pointer hover:border-primary/50 transition-all shadow-xs',
            filters.statusGroup === 'all' && 'border-primary ring-1 ring-primary/20'
          )}
        >
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Tổng số video
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-primary">
            {total.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">Toàn hệ thống PE</div>
        </Card>

        {/* Processing Card */}
        <Card
          onClick={() => setFilters({ statusGroup: 'processing', status: undefined })}
          className={cn(
            'p-4 sm:p-5 cursor-pointer hover:border-blue-500/50 transition-all shadow-xs bg-blue-500/5 border-blue-500/20',
            filters.statusGroup === 'processing' && 'border-blue-500 ring-1 ring-blue-500/30'
          )}
        >
          <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center justify-between">
            <span>Đang xử lý</span>
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-blue-700 dark:text-blue-400">
            {stats.processingCount}
          </div>
          <div className="mt-1 text-[11px] text-blue-600/70 dark:text-blue-400/70">
            (Trên trang hiện tại)
          </div>
        </Card>

        {/* Failed Card */}
        <Card
          onClick={() => setFilters({ statusGroup: 'failed', status: undefined })}
          className={cn(
            'p-4 sm:p-5 cursor-pointer hover:border-red-500/50 transition-all shadow-xs bg-red-500/5 border-red-500/20',
            filters.statusGroup === 'failed' && 'border-red-500 ring-1 ring-red-500/30'
          )}
        >
          <div className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider flex items-center justify-between">
            <span>Thất bại</span>
            <span className="h-2 w-2 rounded-full bg-red-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-red-700 dark:text-red-400">
            {stats.failedCount}
          </div>
          <div className="mt-1 text-[11px] text-red-600/70 dark:text-red-400/70">
            (Trên trang hiện tại)
          </div>
        </Card>

        {/* Success Card */}
        <Card
          onClick={() => setFilters({ statusGroup: 'success', status: undefined })}
          className={cn(
            'p-4 sm:p-5 cursor-pointer hover:border-emerald-500/50 transition-all shadow-xs bg-emerald-500/5 border-emerald-500/20',
            filters.statusGroup === 'success' && 'border-emerald-500 ring-1 ring-emerald-500/30'
          )}
        >
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center justify-between">
            <span>Thành công</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400">
            {stats.successCount}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600/70 dark:text-emerald-400/70">
            (Trên trang hiện tại)
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <VideoFilterBar
        filters={filters}
        total={total}
        loading={loading}
        onFilterChange={setFilters}
        onRefresh={refresh}
      />

      {/* Main Video Table (TanStack Table) */}
      <VideoTable
        videos={videos}
        total={total}
        page={page}
        pageSize={pageSize}
        loading={loading}
        onPageChange={(newPage, newPageSize) => {
          setPage(newPage);
          setPageSize(newPageSize);
        }}
        onViewDetail={handleViewDetail}
        onEdit={handleOpenEdit}
        onColumnFilterApply={(columnFilters) => setFilters(columnFilters)}
      />

      {/* Detail Sheet Drawer */}
      <VideoDetailDrawer
        video={selectedVideo}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onEdit={(v) => {
          setDrawerOpen(false);
          handleOpenEdit(v);
        }}
        onUpdateStatus={handleUpdateStatusAndRefresh}
      />

      {/* Edit Dialog Modal */}
      <VideoEditModal
        video={editingVideo}
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}

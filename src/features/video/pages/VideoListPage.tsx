import { useState } from "react";
import { useVideos } from "../hooks/useVideos";
import { useVideoStats } from "../hooks/useVideoStats";
import { VideoTable } from "../components/VideoTable";
import { VideoDetailDrawer } from "../components/VideoDetailDrawer";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Video } from "@/types/video.types";
import { DatePicker, Input, Button } from "antd";
import dayjs from "dayjs";
import { Search, RefreshCw } from "lucide-react";
import { videoService } from "../services/video.service";
import { toast } from "sonner";

const { RangePicker } = DatePicker;

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
    refresh,
  } = useVideos();

  const { stats, refreshStats } = useVideoStats(filters);

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search || "");

  const handleViewDetail = (video: Video) => {
    setSelectedVideo(video);
    setDrawerVisible(true);
  };

  const handleEdit = (video: Video) => {
    // Open drawer in edit mode (we'll implement this mode inside the drawer)
    setSelectedVideo(video);
    setDrawerVisible(true);
  };

  const handleReconvert = async (video: Video) => {
    try {
      await videoService.reconvertVideo(video.id);
      toast.success(`Đã gửi yêu cầu xử lý lại video #${video.id}`);
      refresh();
      refreshStats();
    } catch {
      toast.error(`Yêu cầu xử lý lại video #${video.id} thất bại`);
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
          Giám sát Video Transcode
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

      {/* 4 Summary KPI Cards — Global Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {/* Total */}
        <Card
          onClick={() => setFilters({ statusGroup: "all", status: undefined })}
          className={cn(
            "p-4 sm:p-5 cursor-pointer hover:border-primary/50 transition-all shadow-xs",
            filters.statusGroup === "all" && "border-primary ring-1 ring-primary/20"
          )}
        >
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Tổng số video
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-black font-mono text-primary">
            {stats.total.toLocaleString()}
          </div>
        </Card>

        {/* Processing */}
        <Card
          onClick={() => setFilters({ statusGroup: "processing", status: undefined })}
          className={cn(
            "p-4 sm:p-5 cursor-pointer hover:border-blue-500/50 transition-all shadow-xs bg-blue-500/5 border-blue-500/20",
            filters.statusGroup === "processing" && "border-blue-500 ring-1 ring-blue-500/30"
          )}
        >
          <div className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center justify-between">
            <span>Đang xử lý</span>
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-black font-mono text-blue-700 dark:text-blue-400">
            {stats.processing.toLocaleString()}
          </div>
        </Card>

        {/* Failed */}
        <Card
          onClick={() => setFilters({ statusGroup: "failed", status: undefined })}
          className={cn(
            "p-4 sm:p-5 cursor-pointer hover:border-red-500/50 transition-all shadow-xs bg-red-500/5 border-red-500/20",
            filters.statusGroup === "failed" && "border-red-500 ring-1 ring-red-500/30"
          )}
        >
          <div className="text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-wider flex items-center justify-between">
            <span>Thất bại</span>
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-black font-mono text-red-700 dark:text-red-400">
            {stats.failed.toLocaleString()}
          </div>
        </Card>

        {/* Success */}
        <Card
          onClick={() => setFilters({ statusGroup: "success", status: undefined })}
          className={cn(
            "p-4 sm:p-5 cursor-pointer hover:border-emerald-500/50 transition-all shadow-xs bg-emerald-500/5 border-emerald-500/20",
            filters.statusGroup === "success" && "border-emerald-500 ring-1 ring-emerald-500/30"
          )}
        >
          <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center justify-between">
            <span>Thành công</span>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-black font-mono text-emerald-700 dark:text-emerald-400">
            {stats.success.toLocaleString()}
          </div>
        </Card>
      </div>

      {/* Table Controls (Search) */}
      <div className="flex justify-between items-center bg-card p-3 rounded-t-xl border border-border border-b-0">
        <Input
          placeholder="Tìm theo tên video, ID, CSM ID..."
          prefix={<Search size={16} className="text-muted-foreground mr-2" />}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onPressEnter={handleSearchSubmit}
          className="max-w-md shadow-sm"
          allowClear
        />
        {/* Additional filters can be placed here if needed */}
      </div>

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
        onSortChange={(sortBy, sortDir) => setFilters({ sortBy, sortDir })}
        onViewDetail={handleViewDetail}
        onEdit={handleEdit}
        onReconvert={handleReconvert}
      />

      {selectedVideo && (
        <VideoDetailDrawer
          visible={drawerVisible}
          onClose={() => {
            setDrawerVisible(false);
            setTimeout(() => setSelectedVideo(null), 300);
          }}
          video={selectedVideo}
          onReconvert={handleReconvert}
        />
      )}
    </div>
  );
}

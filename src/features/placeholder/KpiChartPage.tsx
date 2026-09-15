export function KpiChartPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
      <div className="text-5xl font-black text-muted-foreground/30">KPI</div>
      <h1 className="text-2xl font-bold text-foreground">KPI Chart</h1>
      <p className="text-muted-foreground text-sm max-w-sm">
        Trang biểu đồ KPI đang được phát triển. Sẽ hiển thị các chỉ số hiệu suất transcode theo thời gian.
      </p>
      <div className="px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-semibold">
        Đang phát triển...
      </div>
    </div>
  );
}

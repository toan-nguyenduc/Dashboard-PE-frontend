import { useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { UserCircle, Cpu, FileJson, Settings } from "lucide-react";

export function ConfigCsmPage() {
  const location = useLocation();
  const path = location.pathname;

  let pageInfo = {
    title: "Cấu hình CSM",
    description: "Quản lý các thông số kết nối và tích hợp hệ thống CSM",
    icon: <Settings className="h-8 w-8 text-primary" />,
    badge: "Config CSM",
  };

  if (path.includes("/profile-master")) {
    pageInfo = {
      title: "CSM Profile Master",
      description: "Định nghĩa và quản lý các template master profile transcode cho CSM Media",
      icon: <FileJson className="h-8 w-8 text-amber-500" />,
      badge: "Master Profiles",
    };
  } else if (path.includes("/detail-gpu")) {
    pageInfo = {
      title: "Detail GPU Worker",
      description: "Cấu hình tài nguyên GPU và phân bổ worker cho từng node transcode PE",
      icon: <Cpu className="h-8 w-8 text-emerald-500" />,
      badge: "GPU Cluster",
    };
  } else if (path.includes("/profile")) {
    pageInfo = {
      title: "CSM Profile",
      description: "Cấu hình các profile encode mặc định theo từng phân giải và định dạng",
      icon: <UserCircle className="h-8 w-8 text-blue-500" />,
      badge: "Profiles",
    };
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            {pageInfo.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {pageInfo.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {pageInfo.description}
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
          {pageInfo.badge}
        </div>
      </div>

      <Card className="bg-card border-border shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg">Trạng thái cấu hình</CardTitle>
          <CardDescription>
            Module {pageInfo.title} đang được đồng bộ dữ liệu từ hệ thống CSM & Enc-Server.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
            <div className="text-4xl font-black text-muted-foreground/20">READY</div>
            <p className="text-sm text-muted-foreground max-w-md">
              Tính năng đang hoàn thiện giao diện chi tiết. Các thông số cấu hình mặc định đang hoạt động ổn định trên các cụm worker.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

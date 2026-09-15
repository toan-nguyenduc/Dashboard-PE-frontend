import { Skeleton } from "antd";
import React from "react";

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ columns = 8, rows = 5 }) => {
  return (
    <div className="w-full space-y-4">
      {/* Rows skeleton */}
      {Array.from({ length: rows }).map((_, rIndex) => (
        <div key={rIndex} className="flex items-center gap-4 py-3 border-b border-border/50">
          {Array.from({ length: columns }).map((_, cIndex) => (
            <div key={cIndex} style={{ flex: cIndex === 0 ? 1 : 2 }}>
              <Skeleton.Input active size="small" block />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

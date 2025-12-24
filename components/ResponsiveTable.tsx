import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  mobileLabel?: string; // Label for mobile card view
  hideOnMobile?: boolean; // Hide this column on mobile
}

interface ResponsiveTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  loading?: boolean;
  mobileCardRender?: (item: T) => React.ReactNode; // Custom mobile card
}

function ResponsiveTable<T>({ 
  columns, 
  data, 
  keyExtractor, 
  onRowClick,
  emptyMessage = 'لا توجد بيانات',
  loading = false,
  mobileCardRender
}: ResponsiveTableProps<T>) {
  
  if (loading) {
    return (
      <div className="w-full">
        {/* Desktop Skeleton */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-gray-100">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-6 bg-gray-200 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile Skeleton */}
        <div className="md:hidden space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">📦</span>
        </div>
        <p className="text-gray-500 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={`transition-colors ${onRowClick ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-gray-700">
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {data.map((item) => {
          // If custom mobile card renderer is provided, use it
          if (mobileCardRender) {
            return (
              <div
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={`bg-white rounded-xl p-4 border border-gray-100 shadow-sm ${onRowClick ? 'active:scale-[0.98]' : ''} transition-transform`}
              >
                {mobileCardRender(item)}
              </div>
            );
          }

          // Default mobile card layout
          return (
            <div
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={`bg-white rounded-xl p-4 border border-gray-100 shadow-sm ${onRowClick ? 'active:scale-[0.98]' : ''} transition-transform`}
            >
              <div className="space-y-2">
                {columns
                  .filter(col => !col.hideOnMobile)
                  .map((col) => (
                    <div key={col.key} className="flex justify-between items-start gap-3">
                      <span className="text-xs text-gray-500 font-medium flex-shrink-0">
                        {col.mobileLabel || col.header}:
                      </span>
                      <span className="text-sm text-gray-900 font-medium text-left">
                        {col.render(item)}
                      </span>
                    </div>
                  ))}
              </div>
              {onRowClick && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                  <span className="text-xs text-brand-orange font-bold flex items-center gap-1">
                    عرض التفاصيل <ChevronLeft size={14} />
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ResponsiveTable;

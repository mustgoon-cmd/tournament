import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface TablePaginationProps {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  itemLabel?: string;
  pageSizeOptions?: number[];
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  itemLabel = '条',
  pageSizeOptions = [10, 20, 50],
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  return (
    <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-4 lg:flex-row lg:items-center lg:justify-end">
      <div className="text-sm text-slate-500">
        总共 {total} {itemLabel}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-all hover:border-slate-300 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronRight className="h-5 w-5 rotate-180" />
        </button>
        <div className="flex h-11 min-w-[52px] items-center justify-center rounded-xl bg-blue-500 px-4 text-lg font-semibold text-white shadow-lg shadow-blue-100">
          {currentPage}
        </div>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-all hover:border-slate-300 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <div className="relative">
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
            className="h-11 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-medium text-slate-600 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}条/页
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>共 {totalPages} 页</span>
        </div>
      </div>
    </div>
  );
};

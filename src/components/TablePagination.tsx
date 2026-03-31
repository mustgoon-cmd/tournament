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
  compact?: boolean;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  itemLabel = '条',
  pageSizeOptions = [10, 20, 50],
  compact = false,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const containerClass = compact
    ? 'flex flex-col gap-3 border-t border-slate-100 px-5 py-3 lg:flex-row lg:items-center lg:justify-end'
    : 'flex flex-col gap-4 border-t border-slate-100 px-6 py-4 lg:flex-row lg:items-center lg:justify-end';
  const totalClass = compact ? 'text-xs text-slate-500' : 'text-sm text-slate-500';
  const controlWrapClass = compact ? 'flex flex-wrap items-center gap-2.5' : 'flex flex-wrap items-center gap-3';
  const arrowBtnClass = compact
    ? 'flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-all hover:border-slate-300 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50'
    : 'flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-all hover:border-slate-300 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50';
  const pageClass = compact
    ? 'flex h-9 min-w-[44px] items-center justify-center rounded-lg bg-indigo-600 px-3 text-base font-semibold text-white shadow-md shadow-indigo-100'
    : 'flex h-11 min-w-[52px] items-center justify-center rounded-xl bg-indigo-600 px-4 text-lg font-semibold text-white shadow-lg shadow-indigo-100';
  const selectClass = compact
    ? 'h-9 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-xs font-medium text-slate-600 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100'
    : 'h-11 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-medium text-slate-600 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100';
  const pageTextClass = compact ? 'flex items-center gap-2 text-xs text-slate-500' : 'flex items-center gap-2 text-sm text-slate-500';
  const arrowIconClass = compact ? 'h-4 w-4' : 'h-5 w-5';
  const selectIconClass = compact ? 'pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400' : 'pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400';

  return (
    <div className={containerClass}>
      <div className={totalClass}>
        总共 {total} {itemLabel}
      </div>
      <div className={controlWrapClass}>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={arrowBtnClass}
        >
          <ChevronRight className={`${arrowIconClass} rotate-180`} />
        </button>
        <div className={pageClass}>
          {currentPage}
        </div>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={arrowBtnClass}
        >
          <ChevronRight className={arrowIconClass} />
        </button>
        <div className="relative">
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
            className={selectClass}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}条/页
              </option>
            ))}
          </select>
          <ChevronDown className={selectIconClass} />
        </div>
        <div className={pageTextClass}>
          <span>共 {totalPages} 页</span>
        </div>
      </div>
    </div>
  );
};

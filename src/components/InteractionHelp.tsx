import React, { useEffect, useState } from 'react';
import { Info } from 'lucide-react';

function InteractionBubble({
  children,
  className = '',
  placement = 'bottom',
}: {
  children: React.ReactNode;
  className?: string;
  placement?: 'bottom' | 'right' | 'top';
}) {
  const wrapperClass =
    placement === 'right'
      ? 'absolute left-full top-1/2 z-30 ml-3 w-[360px] max-w-[calc(100vw-4rem)] -translate-y-1/2'
      : placement === 'top'
        ? 'absolute bottom-full left-0 z-30 mb-3 w-[360px] max-w-[calc(100vw-4rem)]'
      : 'absolute left-0 top-full z-30 mt-3 w-[360px] max-w-[calc(100vw-4rem)]';

  return (
    <div className={`${wrapperClass} ${className}`.trim()}>
      <div className="relative">
        {placement === 'right' ? (
          <div className="absolute left-0 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-l border-amber-200 bg-amber-50" />
        ) : placement === 'top' ? (
          <div className="absolute bottom-0 left-5 h-3 w-3 translate-y-1/2 rotate-45 border-r border-b border-amber-200 bg-amber-50" />
        ) : (
          <div className="absolute left-5 top-0 h-3 w-3 -translate-y-1/2 rotate-45 border-l border-t border-amber-200 bg-amber-50" />
        )}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] leading-6 text-amber-800 shadow-lg shadow-amber-100/80">
          {children}
        </div>
      </div>
    </div>
  );
}

function InteractionPanel({
  children,
  className = '',
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] leading-6 text-amber-800 shadow-lg shadow-amber-100/80 ${className}`.trim()}>
      {title ? <p className="mb-2 text-xs font-semibold tracking-[0.02em] text-amber-700">{title}</p> : null}
      {children}
    </div>
  );
}

function InteractionTag({
  interactive,
  onClick,
}: {
  interactive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex w-fit items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 transition-all ${
        interactive ? 'hover:bg-amber-100' : 'cursor-default'
      }`}
    >
      <Info className="h-4 w-4" />
      交互说明
    </button>
  );
}

export function InteractionHelp({
  content,
  prototypeMode = false,
  className = '',
  bubbleClassName = '',
  placement = 'bottom',
  stacked = false,
  title,
}: {
  content: React.ReactNode;
  prototypeMode?: boolean;
  className?: string;
  bubbleClassName?: string;
  placement?: 'bottom' | 'right' | 'top';
  stacked?: boolean;
  title?: React.ReactNode;
}) {
  const [open, setOpen] = useState(prototypeMode);

  useEffect(() => {
    setOpen(prototypeMode);
  }, [prototypeMode]);

  const expanded = open;

  if (stacked) {
    return (
      <div className={`space-y-3 ${className}`.trim()}>
        <InteractionTag
          interactive
          onClick={() => {
            setOpen((prev) => !prev);
          }}
        />
        {expanded && (
          <InteractionPanel className={bubbleClassName} title={title}>
            {content}
          </InteractionPanel>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative inline-flex">
        <InteractionTag
          interactive
          onClick={() => {
            setOpen((prev) => !prev);
          }}
        />
        {expanded && (
          <InteractionBubble className={bubbleClassName} placement={placement}>
            {content}
          </InteractionBubble>
        )}
      </div>
    </div>
  );
}

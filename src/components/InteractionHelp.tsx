import React, { useState } from 'react';
import { Info } from 'lucide-react';

function InteractionBubble({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-5 top-0 h-3 w-3 -translate-y-1/2 rotate-45 border-l border-t border-amber-200 bg-amber-50" />
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] leading-6 text-amber-800 shadow-sm">
        {children}
      </div>
    </div>
  );
}

export function InteractionHelp({
  content,
  prototypeMode = false,
  className = '',
  bubbleClassName = '',
}: {
  content: React.ReactNode;
  prototypeMode?: boolean;
  className?: string;
  bubbleClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const expanded = prototypeMode || open;

  return (
    <div className={className}>
      <div className="inline-flex flex-col">
        <button
          type="button"
          onClick={() => {
            if (!prototypeMode) {
              setOpen((prev) => !prev);
            }
          }}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 transition-all hover:bg-amber-100"
        >
          <Info className="h-4 w-4" />
          交互说明
        </button>
        {expanded && (
          <InteractionBubble className={`mt-3 ${bubbleClassName}`.trim()}>
            {content}
          </InteractionBubble>
        )}
      </div>
    </div>
  );
}

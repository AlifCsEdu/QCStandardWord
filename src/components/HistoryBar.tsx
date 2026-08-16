import React from 'react';

interface HistoryBarProps {
  recents: string[];
  onCopyRecent: (text: string) => void;
  onClearHistory: () => void;
}

export const HistoryBar: React.FC<HistoryBarProps> = React.memo(({
  recents,
  onCopyRecent,
  onClearHistory,
}) => {
  if (!recents || recents.length === 0) {
    return (
      <div id="histbar" className="history-bar-container hidden" />
    );
  }

  return (
    <div
      id="histbar"
      className="history-bar-container flex items-center gap-3 px-5 py-2 bg-[#141418] border-b border-stone-800/80"
    >
      <span className="text-xs font-bold text-amber-400 whitespace-nowrap">
        History:
      </span>

      <div
        id="hchips"
        className="flex items-center gap-1.5 overflow-x-auto flex-1 scrollbar-thin"
      >
        {recents.map((text, idx) => (
          <button
            key={idx}
            data-hcopy={text}
            onClick={() => onCopyRecent(text)}
            className="hchip bg-[#1a1a20] hover:bg-[#22222a] text-stone-200 border border-stone-700/80 hover:border-amber-500/50 rounded-full min-h-[36px] sm:min-h-[40px] px-3.5 py-1.5 text-xs transition-all duration-150 active:scale-95 inline-flex items-center cursor-pointer whitespace-nowrap"
            title="Click to re-copy"
          >
            <span className="htxt">{text}</span>
          </button>
        ))}
      </div>

      <button
        id="hclearAll"
        onClick={onClearHistory}
        title="Clear copy history"
        className="bg-amber-950/40 hover:bg-amber-900/60 text-amber-400 border border-amber-800/60 rounded-md min-h-[36px] sm:min-h-[40px] px-3.5 py-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap transition-all duration-150 active:scale-95"
      >
        Clear History
      </button>
    </div>
  );
});

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
      className="history-bar-container flex items-center gap-3 px-5 py-2 bg-stone-900 border-b border-stone-800"
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
            className="hchip bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 hover:border-amber-500/50 rounded-full px-2.5 py-0.5 text-xs transition-colors duration-150 inline-flex items-center cursor-pointer whitespace-nowrap"
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
        className="bg-amber-950/40 hover:bg-amber-900/60 text-amber-400 border border-amber-800/60 rounded px-2 py-0.5 text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors duration-150"
      >
        Clear History
      </button>
    </div>
  );
});

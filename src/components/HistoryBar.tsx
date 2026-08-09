import React from 'react';

interface HistoryBarProps {
  recents: string[];
  onCopyRecent: (text: string) => void;
  onClearHistory: () => void;
}

export const HistoryBar: React.FC<HistoryBarProps> = ({
  recents,
  onCopyRecent,
  onClearHistory,
}) => {
  if (!recents || recents.length === 0) {
    return (
      <div id="histbar" className="history-bar-container hidden" style={{ display: 'none' }} />
    );
  }

  return (
    <div
      id="histbar"
      className="history-bar-container flex items-center gap-3 px-5 py-2 bg-amber-950/20 border-b border-amber-500/20 backdrop-blur-md"
      style={{ display: 'flex' }}
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
            className="hchip bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 border border-zinc-700/80 hover:border-amber-500/50 rounded-full px-2.5 py-0.5 text-xs transition-colors duration-150 inline-flex items-center cursor-pointer whitespace-nowrap"
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
        className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded px-2 py-0.5 text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors duration-150"
      >
        Clear History
      </button>
    </div>
  );
};

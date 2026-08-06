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
      <div id="histbar" style={{ display: 'none' }} />
    );
  }

  return (
    <div
      id="histbar"
      className="history-bar-container"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 20px',
        background: '#fff9db',
        borderBottom: '1px solid #ffe066',
      }}
    >
      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59f00', whiteSpace: 'nowrap' }}>
        History:
      </span>

      <div
        id="hchips"
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          flex: 1,
          scrollbarWidth: 'thin',
        }}
      >
        {recents.map((text, idx) => (
          <button
            key={idx}
            data-hcopy={text}
            onClick={() => onCopyRecent(text)}
            className="hchip"
            title="Click to re-copy"
            style={{
              padding: '3px 10px',
              borderRadius: '12px',
              border: '1px solid #fcc419',
              background: '#ffffff',
              color: '#343a40',
              fontSize: '0.8rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <span className="htxt">{text}</span>
          </button>
        ))}
      </div>

      <button
        id="hclearAll"
        onClick={onClearHistory}
        title="Clear copy history"
        style={{
          padding: '2px 8px',
          borderRadius: '4px',
          border: '1px solid #fcc419',
          background: '#fff3bf',
          color: '#e67700',
          fontSize: '0.75rem',
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Clear History
      </button>
    </div>
  );
};

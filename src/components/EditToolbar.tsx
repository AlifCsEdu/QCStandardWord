import React, { useRef, useState } from 'react';

interface EditToolbarProps {
  editMode: boolean;
  onOpenAddModal: () => void;
  onExport: () => void;
  onImport: (payload: any) => void;
  onReset: () => void;
}

export const EditToolbar: React.FC<EditToolbarProps> = ({
  editMode,
  onOpenAddModal,
  onExport,
  onImport,
  onReset,
}) => {
  const [armedReset, setArmedReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        onImport(parsed);
      } catch (err) {
        console.error('Failed to parse import file:', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetClick = () => {
    if (!armedReset) {
      setArmedReset(true);
      setTimeout(() => {
        setArmedReset(false);
      }, 4000);
    } else {
      setArmedReset(false);
      onReset();
    }
  };

  return (
    <div
      id="editstrip"
      className={`editstrip-container ${editMode ? 'show' : ''}`}
      style={{
        display: editMode ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        background: '#e7f5ff',
        borderBottom: '1px solid #a5d8ff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1971c2' }}>
          Edit Mode Controls:
        </span>
        <button
          id="addBtn"
          onClick={onOpenAddModal}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: '1px solid #1971c2',
            background: '#1971c2',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          + Add Wording
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          id="exportBtn"
          onClick={onExport}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #495057',
            background: '#ffffff',
            color: '#495057',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Export JSON
        </button>

        <button
          id="importBtn"
          onClick={handleImportButtonClick}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #495057',
            background: '#ffffff',
            color: '#495057',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Import JSON
        </button>
        <input
          type="file"
          id="importFile"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          style={{ display: 'none' }}
        />

        <button
          id="resetBtn"
          className={armedReset ? 'arm' : ''}
          onClick={handleResetClick}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: armedReset ? '1px solid #e03131' : '1px solid #ced4da',
            background: armedReset ? '#e03131' : '#ffffff',
            color: armedReset ? '#ffffff' : '#c92a2a',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {armedReset ? 'Tap again to confirm' : 'Reset All'}
        </button>
      </div>
    </div>
  );
};

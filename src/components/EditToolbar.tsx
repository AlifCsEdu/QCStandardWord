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
      className={`editstrip-container ${editMode ? 'show flex' : 'hidden'} items-center justify-between px-5 py-2.5 bg-cyan-950/20 border-b border-cyan-500/20 backdrop-blur-md`}
      style={{ display: editMode ? 'flex' : 'none' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-cyan-400">
          Edit Mode Controls:
        </span>
        <button
          id="addBtn"
          onClick={onOpenAddModal}
          className="bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400/30 px-3.5 py-1.5 rounded-md font-semibold text-xs cursor-pointer transition-colors shadow-sm"
        >
          + Add Wording
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          id="exportBtn"
          onClick={onExport}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors"
        >
          Export JSON
        </button>

        <button
          id="importBtn"
          onClick={handleImportButtonClick}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors"
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
          className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all duration-150 border ${
            armedReset
              ? 'arm bg-red-600 hover:bg-red-500 border-red-500 text-white animate-pulse'
              : 'bg-red-950/20 hover:bg-red-950/40 border-red-500/30 text-red-400'
          }`}
          onClick={handleResetClick}
        >
          {armedReset ? 'Tap again to confirm' : 'Reset All'}
        </button>
      </div>
    </div>
  );
};

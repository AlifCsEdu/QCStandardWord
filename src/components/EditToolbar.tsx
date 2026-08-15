import React, { useRef, useState } from 'react';

interface EditToolbarProps {
  editMode: boolean;
  onOpenAddModal: () => void;
  onExport: () => void;
  onImport: (payload: any) => void;
  onReset: () => void;
}

export const EditToolbar: React.FC<EditToolbarProps> = React.memo(({
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
      className={`editstrip-container ${
        editMode ? 'flex' : 'hidden'
      } items-center justify-between px-5 py-2.5 bg-card border-b border-border flex-wrap gap-2 touch-manipulation`}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-sm font-bold text-foreground">
          Edit Mode Controls:
        </span>
        <button
          id="addBtn"
          onClick={onOpenAddModal}
          className="min-h-[44px] bg-stone-700 hover:bg-stone-600 text-stone-100 border border-stone-600 px-4 py-2 rounded-lg font-semibold text-xs cursor-pointer transition-colors shadow-xs"
        >
          + Add Wording
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          id="exportBtn"
          onClick={onExport}
          className="min-h-[44px] bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
        >
          Export JSON
        </button>

        <button
          id="importBtn"
          onClick={handleImportButtonClick}
          className="min-h-[44px] bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
        >
          Import JSON
        </button>
        <input
          type="file"
          id="importFile"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />

        <button
          id="resetBtn"
          className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 border ${
            armedReset
              ? 'arm bg-rose-600 hover:bg-rose-500 border-rose-500 text-white animate-pulse'
              : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-rose-400'
          }`}
          onClick={handleResetClick}
        >
          {armedReset ? 'Tap again to confirm' : 'Reset All'}
        </button>
      </div>
    </div>
  );
});

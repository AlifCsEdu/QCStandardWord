import React, { useState } from 'react';
import { Drawer, Badge, Button, Select, Checkbox, Group, Stack, Text, Textarea, ActionIcon, Paper } from '@mantine/core';
import { IconCopy, IconTrash, IconFileImport, IconX } from '@tabler/icons-react';
import type { DelimiterKey } from '../types/qc.ts';

interface BatchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  batchQueue: string[];
  onRemoveItem: (index: number) => void;
  onClearBatch: () => void;
  delimiter: DelimiterKey;
  onSetDelimiter: (key: DelimiterKey) => void;
  autoclear: boolean;
  onSetAutoclear: (val: boolean) => void;
  onCopyBatch: () => void;
  onBulkImport: (rawText: string) => void;
}

export const BatchDrawer: React.FC<BatchDrawerProps> = ({
  isOpen,
  onClose,
  batchQueue,
  onRemoveItem,
  onClearBatch,
  delimiter,
  onSetDelimiter,
  autoclear,
  onSetAutoclear,
  onCopyBatch,
  onBulkImport,
}) => {
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');

  const handleBulkSubmit = () => {
    if (pasteText.trim()) {
      onBulkImport(pasteText);
      setPasteText('');
      setPasteModalOpen(false);
    }
  };

  return (
    <>
      {/* Backdrop overlay for backward compatibility */}
      <div
        id="backdrop"
        className={`drawer-backdrop ${isOpen ? 'show' : ''}`}
        onClick={onClose}
        style={{
          display: isOpen ? 'block' : 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 998,
        }}
      />

      {/* Mantine v7 Drawer container */}
      <Drawer
        opened={isOpen}
        onClose={onClose}
        position="right"
        size="md"
        keepMounted
        title={
          <Group gap="xs">
            <Text fw={700} size="lg">
              Batch Queue & Operations
            </Text>
            <Badge id="bbcount" color="blue" size="md">
              {batchQueue.length}
            </Badge>
          </Group>
        }
        padding="md"
        withCloseButton={false}
      >
        <div
          id="batchDrawer"
          className={`batch-drawer ${isOpen ? 'open' : ''}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            gap: '16px',
          }}
        >
          {/* Top Header Controls Bar */}
          <Group justify="space-between" align="center" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)', paddingBottom: '12px' }}>
            <Badge id="bcount" size="lg" color="blue" variant="filled">
              {batchQueue.length}
            </Badge>
            <ActionIcon id="bclose" onClick={onClose} variant="subtle" color="gray" size="lg">
              <IconX size={20} />
            </ActionIcon>
          </Group>

          {/* Settings Section: Delimiter & Auto-clear */}
          <Paper p="sm" radius="md" withBorder bg="var(--mantine-color-gray-0, #f8f9fa)">
            <Stack gap="xs">
              <Group justify="space-between" align="center">
                <Text size="sm" fw={600} htmlFor="joinSel" component="label">
                  Delimiter:
                </Text>
                <select
                  id="joinSel"
                  value={delimiter}
                  onChange={(e) => onSetDelimiter(e.target.value as DelimiterKey)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--mantine-color-gray-4)',
                    fontSize: '0.85rem',
                    background: '#fff',
                  }}
                >
                  <option value="nl">Newline (\n)</option>
                  <option value="comma">Comma (, )</option>
                  <option value="semi">Semicolon (; )</option>
                  <option value="space">Space ( )</option>
                </select>
              </Group>

              <Group justify="space-between" align="center">
                <Text size="sm" fw={600} htmlFor="autoclear" component="label" style={{ cursor: 'pointer' }}>
                  Auto-clear on copy:
                </Text>
                <input
                  id="autoclear"
                  type="checkbox"
                  checked={autoclear}
                  onChange={(e) => onSetAutoclear(e.target.checked)}
                  style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                />
              </Group>
            </Stack>
          </Paper>

          {/* Queued Items List */}
          <div
            id="blist"
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              minHeight: '200px',
            }}
          >
            {batchQueue.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl" size="sm">
                No items in batch queue. Click "+ Batch" on wording rows to add.
              </Text>
            ) : (
              batchQueue.map((itemText, idx) => (
                <Paper
                  key={idx}
                  data-bi={idx}
                  className="bitem"
                  p="xs"
                  radius="sm"
                  withBorder
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  <Text className="bt" size="sm" fw={500} style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {itemText}
                  </Text>

                  <Group gap={4}>
                    <button
                      data-bc={idx}
                      onClick={async () => {
                        if (typeof navigator !== 'undefined' && navigator.clipboard) {
                          await navigator.clipboard.writeText(itemText);
                        }
                      }}
                      title="Copy single item"
                      style={{
                        border: 'none',
                        background: '#e7f5ff',
                        color: '#1971c2',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      Copy
                    </button>

                    <button
                      data-rm={idx}
                      onClick={() => onRemoveItem(idx)}
                      title="Remove item"
                      style={{
                        border: 'none',
                        background: '#ffe3e3',
                        color: '#e03131',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      ✕
                    </button>
                  </Group>
                </Paper>
              ))
            )}
          </div>

          {/* Footer Action Buttons */}
          <Stack gap="xs" style={{ borderTop: '1px solid var(--mantine-color-gray-2)', paddingTop: '12px' }}>
            <Button
              id="bcopy"
              onClick={onCopyBatch}
              disabled={batchQueue.length === 0}
              fullWidth
              size="md"
              color="blue"
              leftSection={<IconCopy size={18} />}
            >
              Copy Batch (<span id="bcopycount">{batchQueue.length}</span>)
            </Button>

            <Group grow gap="xs">
              <Button
                id="bclear"
                onClick={onClearBatch}
                disabled={batchQueue.length === 0}
                variant="outline"
                color="red"
                size="sm"
                leftSection={<IconTrash size={16} />}
              >
                Clear Queue
              </Button>

              <Button
                id="bpaste"
                onClick={() => setPasteModalOpen(true)}
                variant="default"
                size="sm"
                leftSection={<IconFileImport size={16} />}
              >
                Bulk Paste
              </Button>
            </Group>
          </Stack>
        </div>
      </Drawer>

      {/* Bulk Paste Modal */}
      {pasteModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Paper p="lg" radius="md" withBorder style={{ background: '#ffffff', width: '400px', maxWidth: '90vw' }}>
            <Text fw={700} size="md" mb="xs">
              Bulk Import Defect Lines
            </Text>
            <Textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste defect lines (one per line)..."
              rows={6}
              mb="md"
            />
            <Group justify="flex-end" gap="xs">
              <Button variant="default" onClick={() => setPasteModalOpen(false)}>
                Cancel
              </Button>
              <Button color="blue" onClick={handleBulkSubmit}>
                Import Lines
              </Button>
            </Group>
          </Paper>
        </div>
      )}
    </>
  );
};

'use client';

import { useEffect, useState } from 'react';

import { Dialog } from '@base-ui/react/dialog';

type PdfPreviewModalProps = {
  file: File | null;
  onClose: () => void;
};

function PdfPreviewModal({ file, onClose }: PdfPreviewModalProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setObjectUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const open = file !== null;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 flex h-[90vh] w-[95vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl transition-all duration-200 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
            <Dialog.Title className="truncate pr-4 text-sm font-medium text-foreground">
              {file?.name ?? 'Dokument PDF'}
            </Dialog.Title>
            <Dialog.Close
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={onClose}
              aria-label="Zamknij podglad">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-hidden">
            {objectUrl ? (
              <iframe
                src={objectUrl}
                title={file?.name ?? 'PDF'}
                className="h-full w-full border-0"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Ladowanie podgladu...
              </div>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export { PdfPreviewModal };

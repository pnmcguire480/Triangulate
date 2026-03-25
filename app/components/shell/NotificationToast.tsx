// ============================================================
// Triangulate — Notification Toast Provider (Chunk 6.4)
// sonner-based toast rail for real-time alerts
// ============================================================

import { Toaster } from 'sonner';

export default function NotificationToast() {
  return (
    <Toaster
      position="bottom-right"
      visibleToasts={3}
      toastOptions={{
        className: 'bg-surface text-ink border border-border shadow-lg text-sm font-body',
        duration: 5000,
      }}
      richColors
    />
  );
}

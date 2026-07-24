'use client';

import { useEffect } from 'react';

export default function PaymentPoller() {
  useEffect(() => {
    // Initial run on page mount
    const pollPendingPayments = async () => {
      try {
        await fetch('/api/payments/poll-pending', { method: 'POST' });
      } catch (err) {
        console.warn('Background payment polling failed:', err);
      }
    };

    pollPendingPayments();

    // Poll every 30 seconds
    const interval = setInterval(pollPendingPayments, 30000);

    return () => clearInterval(interval);
  }, []);

  return null;
}

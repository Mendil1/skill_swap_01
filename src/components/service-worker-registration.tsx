"use client";

import { useEffect } from 'react';
import { registerServiceWorker } from '@/utils/service-worker';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}

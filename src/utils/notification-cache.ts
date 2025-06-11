"use client";

/**
 * Notification Cache Service
 *
 * This utility provides a performance-optimized way to store and retrieve
 * notification data, reducing network requests during page navigation.
 */

import { useState, useEffect } from "react";

// Define notification cache type
interface NotificationCache {
  data: Array<{
    id?: string;
    notification_id?: string;
    user_id: string;
    type: string;
    message: string;
    is_read: boolean;
    reference_id?: string;
    created_at?: string;
    recipient_id?: string;
  }>;
  timestamp: number;
  userId: string;
}

// Default cache expiry time (increased from 120 seconds to 300 seconds for better performance)
const DEFAULT_CACHE_EXPIRY = 300000;

// In-memory cache shared across all component instances
let globalCache: NotificationCache | null = null;

export function useNotificationCache() {
  const [cache, setCache] = useState<NotificationCache | null>(globalCache);

  // Sync with global cache on mount
  useEffect(() => {
    if (globalCache && !cache) {
      setCache(globalCache);
    }
  }, [cache]);

  // Function to set cache data
  const setNotificationCache = (
    data: Array<{
      id?: string;
      notification_id?: string;
      user_id: string;
      type: string;
      message: string;
      is_read: boolean;
      reference_id?: string;
      created_at?: string;
      recipient_id?: string;
    }>, 
    userId: string
  ) => {
    const newCache = {
      data,
      timestamp: Date.now(),
      userId
    };

    // Update both local and global cache
    setCache(newCache);
    globalCache = newCache;

    // Also store in sessionStorage for persistence across page refreshes
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('notification_cache', JSON.stringify(newCache));
      } catch (e) {
        console.error('Failed to store notification cache in sessionStorage:', e);
      }
    }
  };

  // Function to check if cache is valid
  const isValidCache = (expiryTime = DEFAULT_CACHE_EXPIRY): boolean => {
    if (!cache) return false;

    const now = Date.now();
    return now - cache.timestamp < expiryTime;
  };

  // Function to get cache data
  const getCachedNotifications = () => {
    return cache?.data || [];
  };

  // Function to get userId from cache
  const getCachedUserId = () => {
    return cache?.userId || null;
  };

  // Initialize from sessionStorage on first load
  useEffect(() => {
    if (typeof window !== 'undefined' && !globalCache) {
      try {
        const stored = sessionStorage.getItem('notification_cache');
        if (stored) {
          const parsedCache = JSON.parse(stored);
          globalCache = parsedCache;
          setCache(parsedCache);
        }
      } catch (e) {
        console.error('Failed to load notification cache from sessionStorage:', e);
      }
    }
  }, []);

  return {
    setNotificationCache,
    isValidCache,
    getCachedNotifications,
    getCachedUserId,
    cache
  };
}

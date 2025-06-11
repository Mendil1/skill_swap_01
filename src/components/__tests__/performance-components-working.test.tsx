/**
 * Performance Components Test Suite - Working Version
 */

import { render } from '@testing-library/react';

// Mock the utility functions before importing components
jest.mock('@/utils/notification-retry', () => ({
  processPendingNotifications: jest.fn(),
}));

jest.mock('@/utils/service-worker', () => ({
  registerServiceWorker: jest.fn(),
}));

jest.mock('@/utils/performance-monitor', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

// Import components after mocks
import NetworkMonitorWrapper from '../network-monitor-wrapper';
import PerformanceMonitorWrapper from '../performance-monitor-wrapper';
import ServiceWorkerRegistration from '../service-worker-registration';

// Mock browser APIs
Object.defineProperty(window, 'navigator', {
  writable: true,
  value: {
    onLine: true,
  },
});

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: {
    getItem: jest.fn(() => '[]'),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
});

describe('Performance Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'development';
  });

  describe('NetworkMonitorWrapper', () => {
    it('should render without crashing', () => {
      expect(() => {
        render(<NetworkMonitorWrapper userId="test-user" />);
      }).not.toThrow();
    });

    it('should render without crashing when no userId provided', () => {
      expect(() => {
        render(<NetworkMonitorWrapper userId={undefined} />);
      }).not.toThrow();
    });
  });

  describe('PerformanceMonitorWrapper', () => {
    it('should render without crashing', () => {
      expect(() => {
        render(<PerformanceMonitorWrapper />);
      }).not.toThrow();
    });
  });

  describe('ServiceWorkerRegistration', () => {
    it('should render without crashing', () => {
      expect(() => {
        render(<ServiceWorkerRegistration />);
      }).not.toThrow();
    });

    it('should call registerServiceWorker', () => {
      const { registerServiceWorker } = require('@/utils/service-worker');
      render(<ServiceWorkerRegistration />);
      expect(registerServiceWorker).toHaveBeenCalled();
    });
  });

  describe('Integration', () => {
    it('should render all performance components together', () => {
      expect(() => {
        render(
          <>
            <NetworkMonitorWrapper userId="test-user" />
            <PerformanceMonitorWrapper />
            <ServiceWorkerRegistration />
          </>
        );
      }).not.toThrow();
    });
  });
});

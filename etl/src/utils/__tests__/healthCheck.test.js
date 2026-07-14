import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import APIHealthCheck from '../healthCheck.js';

vi.mock('axios');

describe('APIHealthCheck', () => {
  const healthCheck = new APIHealthCheck();

  beforeEach(() => { vi.clearAllMocks(); });

  describe('checkEmbassaments', () => {
    it('returns true when API responds with array', async () => {
      axios.get.mockResolvedValue({ status: 200, data: [{}] });
      expect(await healthCheck.checkEmbassaments()).toBe(true);
    });

    it('returns false on network error', async () => {
      axios.get.mockRejectedValue(new Error('ECONNREFUSED'));
      expect(await healthCheck.checkEmbassaments()).toBe(false);
    });

    it('returns false on non-array response', async () => {
      axios.get.mockResolvedValue({ status: 200, data: { error: true } });
      expect(await healthCheck.checkEmbassaments()).toBe(false);
    });

    it('returns false on timeout', async () => {
      axios.get.mockRejectedValue(new Error('ECONNABORTED'));
      expect(await healthCheck.checkEmbassaments()).toBe(false);
    });
  });

  describe('checkPrecipitation', () => {
    it('returns true when API responds with array', async () => {
      axios.get.mockResolvedValue({ status: 200, data: [{}] });
      expect(await healthCheck.checkPrecipitation()).toBe(true);
    });

    it('returns false on error', async () => {
      axios.get.mockRejectedValue(new Error('timeout'));
      expect(await healthCheck.checkPrecipitation()).toBe(false);
    });
  });

  describe('runFullHealthCheck', () => {
    it('returns HEALTHY when both APIs are up', async () => {
      axios.get.mockResolvedValue({ status: 200, data: [{}] });
      const result = await healthCheck.runFullHealthCheck();

      expect(result.status).toBe('HEALTHY');
      expect(result.allApisHealthy).toBe(true);
      expect(result.apis.embassaments.status).toBe('healthy');
      expect(result.apis.precipitation.status).toBe('healthy');
      expect(result.timestamp).toBeDefined();
    });

    it('returns DEGRADED when embassaments API is down', async () => {
      axios.get
        .mockRejectedValueOnce(new Error('connection refused'))
        .mockResolvedValueOnce({ status: 200, data: [{}] });

      const result = await healthCheck.runFullHealthCheck();
      expect(result.status).toBe('DEGRADED');
      expect(result.allApisHealthy).toBe(false);
      expect(result.apis.embassaments.status).toBe('unhealthy');
      expect(result.apis.precipitation.status).toBe('healthy');
    });

    it('returns DEGRADED when precipitation API is down', async () => {
      axios.get
        .mockResolvedValueOnce({ status: 200, data: [{}] })
        .mockRejectedValueOnce(new Error('timeout'));

      const result = await healthCheck.runFullHealthCheck();
      expect(result.status).toBe('DEGRADED');
      expect(result.allApisHealthy).toBe(false);
    });

    it('returns DEGRADED when both APIs are down', async () => {
      axios.get.mockRejectedValue(new Error('network error'));

      const result = await healthCheck.runFullHealthCheck();
      expect(result.status).toBe('DEGRADED');
      expect(result.allApisHealthy).toBe(false);
    });
  });

  describe('getDetailedStatus', () => {
    it('extends health check with record counts', async () => {
      axios.get
        // Health checks
        .mockResolvedValueOnce({ status: 200, data: [{}] })
        .mockResolvedValueOnce({ status: 200, data: [{}] })
        // Record count queries
        .mockResolvedValueOnce({ data: [{ 'COUNT(*)': 87138 }] })
        .mockResolvedValueOnce({ data: [{ 'COUNT(*)': 135388 }] });

      const result = await healthCheck.getDetailedStatus();
      expect(result.recordCounts.embassaments).toBe(87138);
      expect(result.recordCounts.precipitation).toBe(135388);
    });

    it('returns health status even if count queries fail', async () => {
      axios.get
        .mockResolvedValueOnce({ status: 200, data: [{}] })
        .mockResolvedValueOnce({ status: 200, data: [{}] })
        .mockRejectedValueOnce(new Error('query failed'));

      const result = await healthCheck.getDetailedStatus();
      expect(result.status).toBe('HEALTHY');
      expect(result.recordCounts).toBeUndefined();
    });
  });
});

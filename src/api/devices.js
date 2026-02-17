/**
 * Mock Device API
 *
 * Simulates network requests to a device management backend.
 * Configurable delay and failure rate for testing.
 */

const MOCK_DELAY_MS = 1200;
const MOCK_FAILURE_RATE = 0.1; // 10% — set to 1.0 to always fail

const MOCK_DEVICES = [
  { id: 'dev_001', name: 'Sensor Node 01', type: 'temperature', status: 'online', battery: 87, lastSeen: '2026-02-17T14:30:00.000Z', location: 'Zone A' },
  { id: 'dev_002', name: 'Sensor Node 02', type: 'humidity', status: 'online', battery: 62, lastSeen: '2026-02-17T14:29:00.000Z', location: 'Zone A' },
  { id: 'dev_003', name: 'Gateway Unit 01', type: 'gateway', status: 'online', battery: null, lastSeen: '2026-02-17T14:30:00.000Z', location: 'Zone B' },
  { id: 'dev_004', name: 'Sensor Node 03', type: 'motion', status: 'offline', battery: 15, lastSeen: '2026-02-17T11:00:00.000Z', location: 'Zone B' },
  { id: 'dev_005', name: 'Sensor Node 04', type: 'temperature', status: 'online', battery: 94, lastSeen: '2026-02-17T14:30:00.000Z', location: 'Zone C' },
  { id: 'dev_006', name: 'Sensor Node 05', type: 'pressure', status: 'warning', battery: 31, lastSeen: '2026-02-17T14:15:00.000Z', location: 'Zone C' },
  { id: 'dev_007', name: 'Controller Unit', type: 'controller', status: 'online', battery: null, lastSeen: '2026-02-17T14:30:00.000Z', location: 'Zone A' },
  { id: 'dev_008', name: 'Sensor Node 06', type: 'co2', status: 'online', battery: 78, lastSeen: '2026-02-17T14:28:00.000Z', location: 'Zone D' },
  { id: 'dev_009', name: 'Sensor Node 07', type: 'temperature', status: 'offline', battery: 0, lastSeen: '2026-02-16T08:00:00.000Z', location: 'Zone D' },
  { id: 'dev_010', name: 'Access Point 01', type: 'ap', status: 'online', battery: null, lastSeen: '2026-02-17T14:30:00.000Z', location: 'Zone B' },
];

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function maybeFail() {
  if (Math.random() < MOCK_FAILURE_RATE) {
    throw new Error('Network request failed: server returned 503');
  }
}

/**
 * Fetch all devices
 * @param {AbortSignal} [signal] - Optional AbortController signal
 * @returns {Promise<Device[]>}
 */
export async function fetchDevices(signal) {
  await delay(MOCK_DELAY_MS);

  if (signal?.aborted) {
    throw new DOMException('Fetch aborted', 'AbortError');
  }

  maybeFail();

  // Simulate slight data variations between fetches
  return MOCK_DEVICES.map(d => ({
    ...d,
    lastSeen: new Date().toISOString(),
    // Occasionally vary battery level slightly to simulate real data
    battery: d.battery !== null ? Math.max(0, d.battery + Math.floor(Math.random() * 3) - 1) : null,
  }));
}

/**
 * Fetch a single device by ID
 * @param {string} id
 * @returns {Promise<Device>}
 */
export async function fetchDevice(id) {
  await delay(Math.floor(MOCK_DELAY_MS / 2));
  maybeFail();

  const device = MOCK_DEVICES.find(d => d.id === id);
  if (!device) {
    throw new Error(`Device not found: ${id}`);
  }
  return { ...device, lastSeen: new Date().toISOString() };
}

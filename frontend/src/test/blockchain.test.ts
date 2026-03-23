import { describe, it, expect, beforeEach } from 'vitest';
import { Order } from '@/lib/data';

// We need a fresh MockBlockchain for each test, so we import the class-level module
// and create instances manually. However, since the class is not exported directly,
// we test through the singleton + re-import pattern.

// Helper: create a minimal mock Order object
function createMockOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-001',
    vendorId: 'vendor-001',
    items: [
      { productId: 'p1', name: 'Apples', price: 120, quantity: 2, image: '' },
    ],
    total: 240,
    status: 'pending',
    date: new Date().toISOString(),
    customer: {
      name: 'Test Customer',
      phone: '9999999999',
      address: '123 Test St',
      pincode: '411001',
    },
    ...overrides,
  } as Order;
}

describe('MockBlockchain – Idempotence', () => {
  // Since grofastLedger is a singleton, we test against it directly.
  // We use unique order IDs per test to avoid cross-test interference.
  let ledger: typeof import('@/lib/blockchain').grofastLedger;

  beforeEach(async () => {
    // Dynamic import to get the singleton
    const mod = await import('@/lib/blockchain');
    ledger = mod.grofastLedger;
  });

  it('should return the same hash when the same order is recorded twice', () => {
    const order = createMockOrder({ id: `idem-test-${Date.now()}-1` });

    const hash1 = ledger.recordOrder(order);
    const hash2 = ledger.recordOrder(order);

    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it('should NOT add a duplicate block for the same order', () => {
    const order = createMockOrder({ id: `idem-test-${Date.now()}-2` });
    const lengthBefore = ledger.getChainLength();

    ledger.recordOrder(order);
    const lengthAfterFirst = ledger.getChainLength();

    ledger.recordOrder(order);
    const lengthAfterSecond = ledger.getChainLength();

    expect(lengthAfterFirst).toBe(lengthBefore + 1);
    expect(lengthAfterSecond).toBe(lengthAfterFirst); // no new block
  });

  it('should return different hashes for different orders', () => {
    const orderA = createMockOrder({ id: `idem-test-${Date.now()}-A`, total: 100 });
    const orderB = createMockOrder({ id: `idem-test-${Date.now()}-B`, total: 999 });

    const hashA = ledger.recordOrder(orderA);
    const hashB = ledger.recordOrder(orderB);

    expect(hashA).not.toBe(hashB);
  });

  it('isOrderRecorded should return correct status', () => {
    const orderId = `idem-test-${Date.now()}-3`;
    const order = createMockOrder({ id: orderId });

    expect(ledger.isOrderRecorded(orderId)).toBe(false);

    ledger.recordOrder(order);

    expect(ledger.isOrderRecorded(orderId)).toBe(true);
  });

  it('getTransaction should still work after idempotent calls', () => {
    const order = createMockOrder({ id: `idem-test-${Date.now()}-4` });

    const hash = ledger.recordOrder(order);
    // Call again (idempotent)
    ledger.recordOrder(order);

    const block = ledger.getTransaction(hash);
    expect(block).toBeDefined();
    expect(block!.orderData.orderId).toBe(order.id);
    expect(block!.orderData.total).toBe(order.total);
  });
});

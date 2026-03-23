// Mock Blockchain implementation for demonstration purposes
// In a real application, this would interact with a smart contract on Ethereum, Polygon, etc.
// using ethers.js or web3.js.

import { Order } from '@/lib/data';

interface Block {
    index: number;
    timestamp: number;
    orderData: {
        orderId: string;
        vendorId: string;
        total: number;
        items: number;
        customerId: string;
    };
    previousHash: string;
    hash: string;
}

interface UserIdentity {
    name: string;
    phone: string;
    address: string;
    pincode: string;
}

class MockBlockchain {
    private chain: Block[] = [];
    private processedOrders: Map<string, string> = new Map(); // orderId → blockHash
    private identities: Map<string, UserIdentity> = new Map();

    constructor() {
        // Create Genesis Block
        this.chain.push({
            index: 0,
            timestamp: Date.now(),
            orderData: { orderId: 'genesis', vendorId: 'system', total: 0, items: 0, customerId: 'system' },
            previousHash: '0',
            hash: this.calculateHash(0, '0', 'genesis')
        });

        // Pre-populate mock identities for demonstration
        // These would normally be verified by a smart contract
        this.identities.set('u1773487666063', {
            name: 'Shiva',
            phone: '+91 9876543210',
            address: '123, Shiva Residency, Wakad, Pune',
            pincode: '411057'
        });
        
        // Add a generic one for test@example.com / shiva
        this.identities.set('test-user-id', {
            name: 'Shiva',
            phone: '+91 9876543210',
            address: '45, Emerald Square, Mumbai',
            pincode: '400001'
        });
    }

    private getLatestBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    private calculateHash(index: number, previousHash: string, dataStr: string): string {
        // A simple weak hash for demonstration. A real blockchain uses SHA-256
        let hash = 0;
        const str = `${index}${previousHash}${dataStr}`;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;
    }

    /**
     * Records an order on the blockchain ledger.
     * This method is **idempotent**: calling it multiple times with the same
     * order ID will return the original transaction hash without creating
     * duplicate blocks.
     */
    public recordOrder(order: Order): string {
        // Idempotency check — if this order has already been recorded, return the existing hash
        const existingHash = this.processedOrders.get(order.id);
        if (existingHash) {
            return existingHash;
        }

        const previousBlock = this.getLatestBlock();
        const dataForHashing = JSON.stringify({
            orderId: order.id,
            vendorId: order.vendorId,
            total: order.total,
        });

        const newBlock: Block = {
            index: previousBlock.index + 1,
            timestamp: Date.now(),
            orderData: {
                orderId: order.id,
                vendorId: order.vendorId,
                total: order.total,
                items: order.items.length,
                customerId: order.customer.name
            },
            previousHash: previousBlock.hash,
            hash: this.calculateHash(previousBlock.index + 1, previousBlock.hash, dataForHashing)
        };

        this.chain.push(newBlock);

        // Store the mapping for idempotency
        this.processedOrders.set(order.id, newBlock.hash);

        return newBlock.hash;
    }

    /** Check whether an order has already been recorded on the ledger. */
    public isOrderRecorded(orderId: string): boolean {
        return this.processedOrders.has(orderId);
    }

    public getTransaction(hash: string): Block | undefined {
        return this.chain.find(b => b.hash === hash);
    }

    /** Returns the current length of the chain (including the genesis block). */
    public getChainLength(): number {
        return this.chain.length;
    }

    /** 
     * Retrieves a verified identity from the blockchain. 
     * In a real app, this would query a decentralized identity (DID) contract.
     */
    public getUserIdentity(userId: string): UserIdentity | undefined {
        return this.identities.get(userId);
    }
}

export const grofastLedger = new MockBlockchain();

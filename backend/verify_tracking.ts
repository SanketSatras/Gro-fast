import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function verifyTracking() {
    console.log('🚀 Starting Verification of Order Tracking Feature...');

    try {
        // 1. Create a mock order
        console.log('\nStep 1: Creating a mock order...');
        const orderData = {
            userId: 'u' + Date.now(),
            items: [{ id: 'p1', name: 'Amul Milk', price: 30, quantity: 2, image: 'milk.jpg' }],
            total: 60,
            customer: {
                name: 'Test User',
                phone: '1234567890',
                address: '123 Test Street',
                pincode: '411001'
            },
            paymentMethod: 'cod',
            vendorId: 'v1'
        };

        const createRes = await axios.post(`${API_BASE}/orders`, orderData);
        const orderId = createRes.data.id;
        console.log(`✅ Order created with ID: ${orderId}`);

        // 2. Fetch the order details
        console.log('\nStep 2: Fetching order details...');
        const fetchRes = await axios.get(`${API_BASE}/orders/${orderId}`);
        if (fetchRes.data.id === orderId) {
            console.log('✅ Order fetched successfully.');
        } else {
            throw new Error('Order ID mismatch during fetch');
        }

        // 3. Update status to 'confirmed'
        console.log('\nStep 3: Updating status to "confirmed"...');
        await axios.patch(`${API_BASE}/orders/${orderId}/status`, { status: 'confirmed' });
        const confirmedRes = await axios.get(`${API_BASE}/orders/${orderId}`);
        console.log(`✅ Status updated to: ${confirmedRes.data.status}`);

        // 4. Update delivery location
        console.log('\nStep 4: Updating delivery location...');
        const mockLocation = { lat: 18.5204, lng: 73.8567 };
        await axios.patch(`${API_BASE}/orders/${orderId}/location`, { location: mockLocation });
        const locationRes = await axios.get(`${API_BASE}/orders/${orderId}`);
        if (locationRes.data.deliveryBoy?.location?.lat === mockLocation.lat) {
            console.log('✅ Delivery location updated successfully.');
        } else {
            console.log('Current delivery boy data:', locationRes.data.deliveryBoy);
            throw new Error('Location update verification failed');
        }

        console.log('\n✨ Backend Verification Successful!');
    } catch (error: any) {
        console.error('\n❌ Verification Failed:');
        if (error.response) {
            console.error('Data:', error.response.data);
            console.error('Status:', error.response.status);
        } else {
            console.error('Error:', error.message);
        }
    }
}

verifyTracking();

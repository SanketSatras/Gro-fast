import axios from 'axios';

async function testRegister() {
    const email = `testuser${Date.now()}@gmail.com`;
    console.log('Sending registration request for:', email);
    try {
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test User',
            email: email,
            password: 'Password123!',
            phone: '+919999999999',
            role: 'customer'
        });
        console.log('SUCCESS: Registration status:', response.status);
        console.log('User data:', response.data);
    } catch (err: any) {
        console.error('FAILURE: Registration error:', err.response?.status, err.response?.data || err.message);
        process.exit(1);
    }
}

testRegister();

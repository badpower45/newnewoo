// Test login endpoint directly
const API_URL = 'https://bodeelezaby-backend-test.hf.space/api';

async function testLogin() {
    console.log('🧪 Testing login endpoint...\n');
    
    // Test with user's credentials
    const credentials = {
        email: 'bodbod531@outlook.com',
        password: '13572468'
    };
    
    try {
        console.log('📤 Sending login request...');
        console.log('   Email:', credentials.email);
        
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });
        
        console.log('📊 Status:', response.status, response.statusText);
        
        const data = await response.json();
        console.log('📦 Response:', JSON.stringify(data, null, 2));
        
        if (response.ok && data.auth) {
            console.log('\n✅ LOGIN SUCCESS!');
            console.log('🎫 Token:', data.token?.substring(0, 20) + '...');
            console.log('👤 User:', data.user);
        } else {
            console.log('\n❌ LOGIN FAILED!');
            console.log('Error:', data.error || data.message || 'Unknown error');
        }
        
    } catch (error) {
        console.error('❌ Network Error:', error.message);
    }
}

async function testHealth() {
    console.log('\n\n🏥 Testing health endpoint...\n');
    
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        
        console.log('Status:', response.status);
        console.log('Data:', data);
        
        if (data.status === 'ok') {
            console.log('✅ Backend is alive!');
        }
    } catch (error) {
        console.error('❌ Backend not responding:', error.message);
    }
}

async function runTests() {
    await testHealth();
    await testLogin();
}

runTests();

// Test creating order with your account
const API_URL = 'https://bkaa.vercel.app/api';

async function testCreateOrder() {
    console.log('🧪 Testing order creation...\n');
    
    // First, login to get token
    console.log('1️⃣ Logging in...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'bodbod531@outlook.com',
            password: '13572468'
        })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login Status:', loginResponse.status);
    
    if (!loginData.auth || !loginData.token) {
        console.log('❌ Login failed:', loginData);
        return;
    }
    
    console.log('✅ Login success! User ID:', loginData.user.id);
    const token = loginData.token;
    const userId = loginData.user.id;
    
    // Now try to create an order
    console.log('\n2️⃣ Creating test order...');
    
    const orderData = {
        userId: userId,
        total: 100,
        items: [
            {
                id: '10',
                name: 'كرواسون',
                price: 12,
                quantity: 2,
                image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400'
            }
        ],
        branchId: 1,
        paymentMethod: 'cod',
        deliveryAddress: 'Test Address',
        shippingDetails: {
            firstName: 'عبد الرحمن',
            lastName: '',
            phone: '01234567890',
            address: 'Test Address',
            fulfillmentType: 'delivery'
        }
    };
    
    try {
        const orderResponse = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });
        
        console.log('Order Status:', orderResponse.status);
        const orderResult = await orderResponse.json();
        
        if (orderResponse.ok) {
            console.log('✅ Order created successfully!');
            console.log('Order ID:', orderResult.data?.id);
            console.log('Order Code:', orderResult.data?.orderCode);
        } else {
            console.log('❌ Order creation failed!');
            console.log('Error:', JSON.stringify(orderResult, null, 2));
        }
        
    } catch (error) {
        console.error('❌ Network error:', error);
    }
}

async function testGetOrders() {
    console.log('\n\n3️⃣ Testing get orders...\n');
    
    // Login first
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'bodbod531@outlook.com',
            password: '13572468'
        })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.token) {
        console.log('❌ Login failed');
        return;
    }
    
    const token = loginData.token;
    
    // Get orders
    const ordersResponse = await fetch(`${API_URL}/orders`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    
    console.log('Get Orders Status:', ordersResponse.status);
    const ordersData = await ordersResponse.json();
    
    if (ordersResponse.ok) {
        console.log('✅ Orders retrieved!');
        console.log('Total orders:', ordersData.data?.length || 0);
        if (ordersData.data && ordersData.data.length > 0) {
            console.table(ordersData.data.map(o => ({
                id: o.id,
                code: o.order_code,
                total: o.total,
                status: o.status,
                date: o.date
            })));
        }
    } else {
        console.log('❌ Get orders failed!');
        console.log('Error:', JSON.stringify(ordersData, null, 2));
    }
}

async function run() {
    await testCreateOrder();
    await testGetOrders();
}

run();

const API_URL = '/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {
    auth: {
        login: async (credentials: any) => {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            return res.json();
        },
        register: async (data: any) => {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return res.json();
        }
    },
    products: {
        getAll: async () => {
            const res = await fetch(`${API_URL}/products`);
            return res.json();
        },
        getOne: async (id: string) => {
            const res = await fetch(`${API_URL}/products/${id}`);
            return res.json();
        }
    },
    cart: {
        get: async (userId: string) => {
            const res = await fetch(`${API_URL}/cart?userId=${userId}`, { headers: getHeaders() });
            return res.json();
        },
        add: async (data: { userId: string, productId: string, quantity: number }) => {
            const res = await fetch(`${API_URL}/cart/add`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        },
        remove: async (userId: string, productId: string) => {
            const res = await fetch(`${API_URL}/cart/remove/${productId}`, {
                method: 'DELETE',
                headers: getHeaders(),
                body: JSON.stringify({ userId })
            });
            return res.json();
        },
        update: async (data: { userId: string, productId: string, quantity: number }) => {
            const res = await fetch(`${API_URL}/cart/update`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        }
    },
    orders: {
        create: async (data: any) => {
            const res = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        },
        getAll: async (userId: string) => {
            const res = await fetch(`${API_URL}/orders?userId=${userId}`, { headers: getHeaders() });
            return res.json();
        }
    }
};

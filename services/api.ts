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
        },
        delete: async (id: string) => {
            const res = await fetch(`${API_URL}/products/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return res.json();
        },
        create: async (data: any) => {
            const res = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        },
        upload: async (formData: FormData) => {
            const res = await fetch(`${API_URL}/products/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });
            return res.json();
        },
        getByBarcode: async (barcode: string) => {
            const res = await fetch(`${API_URL}/products/barcode/${barcode}`);
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
        },
        clear: async (userId: string) => {
            const res = await fetch(`${API_URL}/cart/clear`, {
                method: 'DELETE',
                headers: getHeaders(),
                body: JSON.stringify({ userId })
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
        getAll: async (userId?: string) => {
            const url = userId ? `${API_URL}/orders?userId=${userId}` : `${API_URL}/orders`;
            const res = await fetch(url, { headers: getHeaders() });
            return res.json();
        },
        updateStatus: async (id: string, status: string) => {
            const res = await fetch(`${API_URL}/orders/${id}/status`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ status })
            });
            return res.json();
        }
    },
    users: {
        getAll: async () => {
            const res = await fetch(`${API_URL}/users`, { headers: getHeaders() });
            return res.json();
        },
        get: async (id: string) => {
            const res = await fetch(`${API_URL}/users/${id}`, { headers: getHeaders() });
            return res.json();
        },
        create: async (data: any) => {
            const res = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        },
        delete: async (id: string) => {
            const res = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return res.json();
        }
    },
    chat: {
        createConversation: async (customerId: number | null, customerName: string) => {
            const res = await fetch(`${API_URL}/chat/conversations`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ customerId, customerName })
            });
            return res.json();
        },
        getConversations: async (status?: string, agentId?: number) => {
            let url = `${API_URL}/chat/conversations`;
            const params = new URLSearchParams();
            if (status) params.append('status', status);
            if (agentId) params.append('agentId', agentId.toString());
            if (params.toString()) url += `?${params.toString()}`;

            const res = await fetch(url, { headers: getHeaders() });
            return res.json();
        },
        getConversation: async (id: number) => {
            const res = await fetch(`${API_URL}/chat/conversations/${id}`, {
                headers: getHeaders()
            });
            return res.json();
        },
        assignConversation: async (id: number, agentId: number) => {
            const res = await fetch(`${API_URL}/chat/conversations/${id}/assign`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ agentId })
            });
            return res.json();
        },
        closeConversation: async (id: number) => {
            const res = await fetch(`${API_URL}/chat/conversations/${id}/close`, {
                method: 'PATCH',
                headers: getHeaders()
            });
            return res.json();
        },
        sendMessage: async (conversationId: number, senderId: number | null, senderType: string, message: string) => {
            const res = await fetch(`${API_URL}/chat/messages`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ conversationId, senderId, senderType, message })
            });
            return res.json();
        },
        markAsRead: async (conversationId: number) => {
            const res = await fetch(`${API_URL}/chat/messages/read`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ conversationId })
            });
            return res.json();
        }
    }
};

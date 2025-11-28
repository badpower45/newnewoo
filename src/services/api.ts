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
    },
    chat: {
        createConversation: async (customerId: string | null, customerName: string) => {
            const res = await fetch(`${API_URL}/chat/conversations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerId, customerName })
            });
            return res.json();
        },
        getAllConversations: async (status?: string, agentId?: string) => {
            let url = `${API_URL}/chat/conversations`;
            const params = new URLSearchParams();
            if (status) params.append('status', status);
            if (agentId) params.append('agentId', agentId);
            if (params.toString()) url += `?${params.toString()}`;

            const res = await fetch(url, { headers: getHeaders() });
            return res.json();
        },
        getConversation: async (conversationId: string) => {
            const res = await fetch(`${API_URL}/chat/conversations/${conversationId}`);
            return res.json();
        },
        assignConversation: async (conversationId: string, agentId: string) => {
            const res = await fetch(`${API_URL}/chat/conversations/${conversationId}/assign`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ agentId })
            });
            return res.json();
        },
        closeConversation: async (conversationId: string) => {
            const res = await fetch(`${API_URL}/chat/conversations/${conversationId}/close`, {
                method: 'PATCH',
                headers: getHeaders()
            });
            return res.json();
        },
        sendMessage: async (conversationId: string, senderId: string | null, senderType: string, message: string) => {
            const res = await fetch(`${API_URL}/chat/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId, senderId, senderType, message })
            });
            return res.json();
        },
        markAsRead: async (conversationId: string) => {
            const res = await fetch(`${API_URL}/chat/messages/read`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId })
            });
            return res.json();
        }
    }
};

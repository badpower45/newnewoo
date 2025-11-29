import { API_URL, SUPABASE_ANON_KEY } from '../src/config';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
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
            const res = await fetch(`${API_URL}/products`, { headers: getHeaders() });
            const json = await res.json();
            const normalize = (p: any) => ({ ...p, price: Number(p?.price) || 0 });
            return {
                ...json,
                data: Array.isArray(json.data) ? json.data.map(normalize) : json.data
            };
        },
        getAllByBranch: async (branchId: number) => {
            const res = await fetch(`${API_URL}/products?branchId=${branchId}`, { headers: getHeaders() });
            const json = await res.json();
            const normalize = (p: any) => ({ ...p, price: Number(p?.price) || 0 });
            return {
                ...json,
                data: Array.isArray(json.data) ? json.data.map(normalize) : json.data
            };
        },
        getOne: async (id: string) => {
            const res = await fetch(`${API_URL}/products/${id}`, { headers: getHeaders() });
            const json = await res.json();
            if (json && json.data && typeof json.data === 'object') {
                return { ...json, data: { ...json.data, price: Number(json.data.price) || 0 } };
            }
            return json;
        },
        getByCategory: async (category: string) => {
            const res = await fetch(`${API_URL}/products?category=${encodeURIComponent(category)}`, { headers: getHeaders() });
            return res.json();
        },
        search: async (query: string) => {
            const res = await fetch(`${API_URL}/products/search?q=${encodeURIComponent(query)}`, { headers: getHeaders() });
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
        update: async (id: string, data: any) => {
            const res = await fetch(`${API_URL}/products/${id}`, {
                method: 'PUT',
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
            const res = await fetch(`${API_URL}/products/barcode/${barcode}`, { headers: getHeaders() });
            return res.json();
        }
    },
    cart: {
        get: async (userId: string) => {
            const res = await fetch(`${API_URL}/cart?userId=${userId}`, { headers: getHeaders() });
            return res.json();
        },
        add: async (data: { userId: string, productId: string, quantity: number, substitutionPreference?: string }) => {
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
        update: async (data: { userId: string, productId: string, quantity: number, substitutionPreference?: string }) => {
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
        getOne: async (id: string) => {
            const res = await fetch(`${API_URL}/orders/${id}`, { headers: getHeaders() });
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
        update: async (id: string, data: any) => {
            const res = await fetch(`${API_URL}/users/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        },
        updateLoyaltyPoints: async (id: string, points: number, operation: 'add' | 'subtract' | 'set' | 'reset') => {
            const res = await fetch(`${API_URL}/users/${id}/loyalty-points`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ points, operation })
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
    },
    branches: {
        getAll: async () => {
            const res = await fetch(`${API_URL}/branches`, { headers: getHeaders() });
            return res.json();
        },
        getOne: async (id: number) => {
            const res = await fetch(`${API_URL}/branches/${id}`, { headers: getHeaders() });
            return res.json();
        },
        getNearby: async (lat: number, lng: number, radius: number = 10) => {
            const res = await fetch(`${API_URL}/branches/nearby?lat=${lat}&lng=${lng}&radius=${radius}`, {
                headers: getHeaders()
            });
            return res.json();
        },
        checkCoverage: async (id: number, lat: number, lng: number) => {
            const res = await fetch(`${API_URL}/branches/${id}/check-coverage`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ latitude: lat, longitude: lng })
            });
            return res.json();
        },
        create: async (data: any) => {
            const res = await fetch(`${API_URL}/branches`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        },
        update: async (id: number, data: any) => {
            const res = await fetch(`${API_URL}/branches/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        },
        delete: async (id: number) => {
            const res = await fetch(`${API_URL}/branches/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return res.json();
        }
    },
    branchProducts: {
        getByBranch: async (branchId: number) => {
            const res = await fetch(`${API_URL}/branch-products/${branchId}`, {
                headers: getHeaders()
            });
            return res.json();
        },
        add: async (data: { branchId: number, productId: number, branchPrice: number, stockQuantity: number }) => {
            const res = await fetch(`${API_URL}/branch-products`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        },
        update: async (branchId: number, productId: number, data: any) => {
            const res = await fetch(`${API_URL}/branch-products/${branchId}/${productId}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        },
        delete: async (branchId: number, productId: number) => {
            const res = await fetch(`${API_URL}/branch-products/${branchId}/${productId}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return res.json();
        },
        bulkUpdateStock: async (updates: Array<{ branchId: number, productId: number, stockQuantity: number }>) => {
            const res = await fetch(`${API_URL}/branch-products/bulk-update-stock`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ updates })
            });
            return res.json();
        }
    },
    deliverySlots: {
        getByBranch: async (branchId: number, date?: string) => {
            let url = `${API_URL}/delivery-slots/${branchId}`;
            if (date) url += `?date=${date}`;
            const res = await fetch(url, { headers: getHeaders() });
            return res.json();
        },
        getOne: async (slotId: number) => {
            const res = await fetch(`${API_URL}/delivery-slots/${slotId}`, {
                headers: getHeaders()
            });
            return res.json();
        },
        create: async (data: any) => {
            const res = await fetch(`${API_URL}/delivery-slots`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        },
        update: async (slotId: number, data: any) => {
            const res = await fetch(`${API_URL}/delivery-slots/${slotId}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        },
        delete: async (slotId: number) => {
            const res = await fetch(`${API_URL}/delivery-slots/${slotId}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return res.json();
        },
        reserve: async (slotId: number, orderId: number) => {
            const res = await fetch(`${API_URL}/delivery-slots/${slotId}/reserve`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ orderId })
            });
            return res.json();
        },
        release: async (slotId: number, orderId: number) => {
            const res = await fetch(`${API_URL}/delivery-slots/${slotId}/release`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ orderId })
            });
            return res.json();
        },
        bulkCreate: async (data: any) => {
            const res = await fetch(`${API_URL}/delivery-slots/bulk-create`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        }
    },
    
    // Distribution APIs (توزيع الطلبات)
    distribution: {
        // موظفي التوصيل
        getDeliveryStaff: async (branchId?: number) => {
            const url = branchId 
                ? `${API_URL}/distribution/delivery-staff?branchId=${branchId}`
                : `${API_URL}/distribution/delivery-staff`;
            const res = await fetch(url, { headers: getHeaders() });
            return res.json();
        },
        createDeliveryStaff: async (data: any) => {
            const res = await fetch(`${API_URL}/distribution/delivery-staff`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        },
        updateDeliveryStaff: async (id: number, data: any) => {
            const res = await fetch(`${API_URL}/distribution/delivery-staff/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        },
        deleteDeliveryStaff: async (id: number) => {
            const res = await fetch(`${API_URL}/distribution/delivery-staff/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return res.json();
        },
        
        // طلبات للتحضير
        getOrdersToPrepare: async (branchId?: number, status?: string) => {
            let url = `${API_URL}/distribution/orders-to-prepare?`;
            if (branchId) url += `branchId=${branchId}&`;
            if (status) url += `status=${status}`;
            const res = await fetch(url, { headers: getHeaders() });
            return res.json();
        },
        
        // بدء تحضير الطلب
        startPreparation: async (orderId: number) => {
            const res = await fetch(`${API_URL}/distribution/start-preparation/${orderId}`, {
                method: 'POST',
                headers: getHeaders()
            });
            return res.json();
        },
        
        // عناصر التحضير
        getPreparationItems: async (orderId: number) => {
            const res = await fetch(`${API_URL}/distribution/preparation-items/${orderId}`, { 
                headers: getHeaders() 
            });
            return res.json();
        },
        updatePreparationItem: async (itemId: number, isPrepared: boolean, notes?: string) => {
            const res = await fetch(`${API_URL}/distribution/preparation-items/${itemId}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ isPrepared, notes })
            });
            return res.json();
        },
        
        // إتمام التحضير
        completePreparation: async (orderId: number) => {
            const res = await fetch(`${API_URL}/distribution/complete-preparation/${orderId}`, {
                method: 'POST',
                headers: getHeaders()
            });
            return res.json();
        },
        
        // موظفي التوصيل المتاحين
        getAvailableDelivery: async (branchId: number) => {
            const res = await fetch(`${API_URL}/distribution/available-delivery/${branchId}`, { 
                headers: getHeaders() 
            });
            return res.json();
        },
        
        // تعيين ديليفري للطلب
        assignDelivery: async (orderId: number, deliveryStaffId: number) => {
            const res = await fetch(`${API_URL}/distribution/assign-delivery/${orderId}`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ deliveryStaffId })
            });
            return res.json();
        },
        
        // الديليفري يستلم الطلب
        pickupOrder: async (orderId: number) => {
            const res = await fetch(`${API_URL}/distribution/pickup-order/${orderId}`, {
                method: 'POST',
                headers: getHeaders()
            });
            return res.json();
        },
        
        // الديليفري يوصل الطلب
        deliverOrder: async (orderId: number) => {
            const res = await fetch(`${API_URL}/distribution/deliver-order/${orderId}`, {
                method: 'POST',
                headers: getHeaders()
            });
            return res.json();
        },
        
        // جلب طلبات الديليفري الحالي
        getDeliveryOrders: async () => {
            const res = await fetch(`${API_URL}/distribution/my-delivery-orders`, {
                headers: getHeaders()
            });
            return res.json();
        },
        
        // الديليفري وصل - في انتظار العميل
        arrivingOrder: async (orderId: number) => {
            const res = await fetch(`${API_URL}/distribution/arriving-order/${orderId}`, {
                method: 'POST',
                headers: getHeaders()
            });
            return res.json();
        },
        
        // الديليفري يرفض الطلب
        rejectOrder: async (orderId: number, reason: string) => {
            const res = await fetch(`${API_URL}/distribution/reject-order/${orderId}`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ reason })
            });
            return res.json();
        },
        
        // تحديث بيانات الفرع
        updateBranchContact: async (branchId: number, data: any) => {
            const res = await fetch(`${API_URL}/distribution/branches/${branchId}/contact`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        }
    }
};

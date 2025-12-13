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
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || data.message || 'Login failed');
            }
            return data;
        },
        register: async (data: any) => {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const responseData = await res.json();
            if (!res.ok) {
                throw new Error(responseData.error || responseData.message || 'Registration failed');
            }
            return responseData;
        },
        forgotPassword: async (email: string) => {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            return data;
        },
        resetPassword: async (token: string, newPassword: string) => {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            return data;
        },
        googleLogin: async (googleData: { googleId: string; email: string; name: string; picture?: string }) => {
            const res = await fetch(`${API_URL}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(googleData)
            });
            return res.json();
        },
        facebookLogin: async (fbData: { facebookId: string; email?: string; name: string; picture?: string }) => {
            const res = await fetch(`${API_URL}/auth/facebook`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fbData)
            });
            return res.json();
        }
    },
    products: {
        getAll: async () => {
            const res = await fetch(`${API_URL}/products`, { headers: getHeaders() });
            const json = await res.json();
            const normalize = (p: any) => ({ ...p, price: Number(p?.price) || 0 });
            // Backend returns array directly, not wrapped in {data: [...]}
            const data = Array.isArray(json) ? json : (json.data || []);
            return data.map(normalize);
        },
        getAllByBranch: async (branchId: number) => {
            const res = await fetch(`${API_URL}/products?branchId=${branchId}`, { headers: getHeaders() });
            if (!res.ok && res.status === 404) {
                // backend missing branch filter; fallback to all products
                const all = await fetch(`${API_URL}/products`, { headers: getHeaders() });
                const jsonAll = await all.json();
                const normalize = (p: any) => ({ ...p, price: Number(p?.price) || 0 });
                const data = Array.isArray(jsonAll) ? jsonAll : (jsonAll.data || []);
                return data.map(normalize);
            }
            const json = await res.json();
            const normalize = (p: any) => ({ ...p, price: Number(p?.price) || 0 });
            // Backend returns array directly, not wrapped in {data: [...]}
            const data = Array.isArray(json) ? json : (json.data || []);
            return data.map(normalize);
        },
        getOne: async (id: string, branchId?: number) => {
            const url = branchId 
                ? `${API_URL}/products/${id}?branchId=${branchId}`
                : `${API_URL}/products/${id}`;
            const res = await fetch(url, { headers: getHeaders() });
            const json = await res.json();
            // Backend returns product directly, not wrapped
            const product = json.data || json;
            if (product && typeof product === 'object') {
                return { ...product, price: Number(product.price) || 0 };
            }
            return json;
        },
        getByCategory: async (category: string, branchId?: number) => {
            let url = `${API_URL}/products?category=${encodeURIComponent(category)}`;
            if (branchId) {
                url += `&branchId=${branchId}`;
            }
            const res = await fetch(url, { headers: getHeaders() });
            const json = await res.json();
            const normalize = (p: any) => ({ ...p, price: Number(p?.price) || 0 });
            // Backend returns array directly
            const data = Array.isArray(json) ? json : (json.data || []);
            return data.map(normalize);
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
        get: async (userId: string, branchId?: number) => {
            const branch = branchId || 1;
            const res = await fetch(`${API_URL}/cart?userId=${userId}&branchId=${branch}`, { headers: getHeaders() });
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
            const json = await res.json();
            if (!res.ok) {
                throw { response: { data: json } };
            }
            return json;
        },
        getAll: async (userId?: string) => {
            const url = userId ? `${API_URL}/orders?userId=${userId}` : `${API_URL}/orders`;
            const res = await fetch(url, { headers: getHeaders() });
            return res.json();
        },
        // Admin: Get all orders with auth token
        getAllAdmin: async (status?: string, branchId?: number) => {
            let url = `${API_URL}/orders/admin/all?`;
            if (status) url += `status=${status}&`;
            if (branchId) url += `branchId=${branchId}`;
            const res = await fetch(url, { headers: getHeaders() });
            return res.json();
        },
        getOne: async (id: string) => {
            const res = await fetch(`${API_URL}/orders/${id}`, { headers: getHeaders() });
            return res.json();
        },
        getByCode: async (orderCode: string) => {
            const res = await fetch(`${API_URL}/orders/track/${orderCode}`, { headers: getHeaders() });
            if (!res.ok) {
                const error = await res.json();
                throw { response: { data: error } };
            }
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
        },
        getProfile: async () => {
            const res = await fetch(`${API_URL}/users/profile`, {
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch profile');
            return res.json();
        },
        updateProfile: async (data: any) => {
            const res = await fetch(`${API_URL}/users/profile`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to update profile');
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
            if (!res.ok) {
                throw new Error('Failed to fetch branches');
            }
            const json = await res.json();
            // API returns {message: 'success', data: [...]} or {success: true, data: [...]}
            return json.data || json;
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
        assignDelivery: async (orderId: number, deliveryStaffId: number, acceptTimeoutMinutes?: number, expectedDeliveryMinutes?: number) => {
            const res = await fetch(`${API_URL}/distribution/assign-delivery/${orderId}`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ 
                    deliveryStaffId,
                    acceptTimeoutMinutes: acceptTimeoutMinutes || 5,
                    expectedDeliveryMinutes: expectedDeliveryMinutes || 30
                })
            });
            return res.json();
        },
        
        // الديليفري يقبل الطلب
        acceptOrder: async (orderId: number) => {
            const res = await fetch(`${API_URL}/distribution/accept-order/${orderId}`, {
                method: 'POST',
                headers: getHeaders()
            });
            return res.json();
        },
        
        // الديليفري يستلم الطلب من الفرع
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
        
        // انتهاء وقت قبول الطلب
        expireOrder: async (orderId: number) => {
            const res = await fetch(`${API_URL}/distribution/expire-order/${orderId}`, {
                method: 'POST',
                headers: getHeaders()
            });
            return res.json();
        },
        
        // تقييم الديليفري
        rateDelivery: async (orderId: number, ratingData: {
            orderRating: number;
            deliveryRating: number;
            speedRating: number;
            comment?: string;
        }) => {
            const res = await fetch(`${API_URL}/distribution/rate-delivery/${orderId}`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(ratingData)
            });
            return res.json();
        },
        
        // جلب التقييمات المعلقة (بعد 15 دقيقة من التوصيل)
        checkPendingRatings: async () => {
            const res = await fetch(`${API_URL}/distribution/pending-ratings`, {
                headers: getHeaders()
            });
            return res.json();
        },
        
        // جلب إحصائيات الديليفري
        getDeliveryStats: async () => {
            const res = await fetch(`${API_URL}/distribution/delivery-stats`, {
                headers: getHeaders()
            });
            return res.json();
        },
        
        // جلب جميع التوصيلات النشطة للموزع
        getActiveDeliveries: async (branchId?: number) => {
            const url = branchId 
                ? `${API_URL}/distribution/active-deliveries?branchId=${branchId}`
                : `${API_URL}/distribution/active-deliveries`;
            const res = await fetch(url, {
                headers: getHeaders()
            });
            return res.json();
        },
        
        // جلب جميع موظفي التوصيل مع إحصائياتهم
        getAllDeliveryStaff: async (branchId?: number) => {
            const url = branchId 
                ? `${API_URL}/distribution/all-delivery-staff?branchId=${branchId}`
                : `${API_URL}/distribution/all-delivery-staff`;
            const res = await fetch(url, {
                headers: getHeaders()
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
    },

    // Delivery Fees APIs
    deliveryFees: {
        // حساب رسوم التوصيل
        calculate: async (branchId: number, subtotal: number, customerLat?: number, customerLng?: number) => {
            const res = await fetch(`${API_URL}/delivery-fees/calculate`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ branchId, subtotal, customerLat, customerLng })
            });
            return res.json();
        },

        // الحصول على إعدادات رسوم التوصيل لفرع
        getByBranch: async (branchId: number) => {
            const res = await fetch(`${API_URL}/delivery-fees/${branchId}`, {
                headers: getHeaders()
            });
            return res.json();
        },

        // تحديث إعدادات رسوم التوصيل (Admin only)
        update: async (id: number, data: any) => {
            const res = await fetch(`${API_URL}/delivery-fees/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        }
    },

    // Coupons APIs
    coupons: {
        // التحقق من صحة الكوبون وتطبيقه
        validate: async (code: string, subtotal: number) => {
            const res = await fetch(`${API_URL}/coupons/validate`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ code, subtotal })
            });
            return res.json();
        },

        // الحصول على جميع الكوبونات (Admin only)
        getAll: async () => {
            const res = await fetch(`${API_URL}/coupons`, {
                headers: getHeaders()
            });
            return res.json();
        },

        // إنشاء كوبون جديد (Admin only)
        create: async (data: any) => {
            const res = await fetch(`${API_URL}/coupons`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        },

        // تحديث كوبون (Admin only)
        update: async (id: number, data: any) => {
            const res = await fetch(`${API_URL}/coupons/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        },

        // حذف كوبون (Admin only)
        delete: async (id: number) => {
            const res = await fetch(`${API_URL}/coupons/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return res.json();
        },

        // الحصول على إحصائيات استخدام كوبون (Admin only)
        getUsage: async (code: string) => {
            const res = await fetch(`${API_URL}/coupons/usage/${code}`, {
                headers: getHeaders()
            });
            return res.json();
        }
    },

    // Magazine Offers API
    magazine: {
        // جلب جميع العروض
        getAll: async (category?: string) => {
            let url = `${API_URL}/magazine`;
            if (category) url += `?category=${encodeURIComponent(category)}`;
            const res = await fetch(url, { headers: getHeaders() });
            return res.json();
        },

        // جلب الفئات
        getCategories: async () => {
            const res = await fetch(`${API_URL}/magazine/categories`, { headers: getHeaders() });
            return res.json();
        },

        // إنشاء عرض جديد (Admin)
        create: async (data: any) => {
            const res = await fetch(`${API_URL}/magazine`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        },

        // تحديث عرض (Admin)
        update: async (id: number, data: any) => {
            const res = await fetch(`${API_URL}/magazine/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        },

        // حذف عرض (Admin)
        delete: async (id: number) => {
            const res = await fetch(`${API_URL}/magazine/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return res.json();
        }
    },

    // Hot Deals API
    hotDeals: {
        // جلب جميع العروض الساخنة
        getAll: async () => {
            const res = await fetch(`${API_URL}/hot-deals`, { headers: getHeaders() });
            return res.json();
        },

        // جلب العرض السريع (Flash Deal)
        getFlashDeal: async () => {
            const res = await fetch(`${API_URL}/hot-deals/flash`, { headers: getHeaders() });
            return res.json();
        },

        // إنشاء عرض جديد (Admin)
        create: async (data: any) => {
            const res = await fetch(`${API_URL}/hot-deals`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        },

        // تحديث عرض (Admin)
        update: async (id: number, data: any) => {
            const res = await fetch(`${API_URL}/hot-deals/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        },

        // تحديث الكمية المباعة
        updateSold: async (id: number, quantity: number = 1) => {
            const res = await fetch(`${API_URL}/hot-deals/${id}/sold`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ quantity })
            });
            return res.json();
        },

        // حذف عرض (Admin)
        delete: async (id: number) => {
            const res = await fetch(`${API_URL}/hot-deals/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return res.json();
        }
    },

    // ===================== STORIES =====================
    stories: {
        // Get all active stories
        getAll: async () => {
            const res = await fetch(`${API_URL}/stories`, { headers: getHeaders() });
            return res.json();
        },

        // Get single story
        getOne: async (id: number) => {
            const res = await fetch(`${API_URL}/stories/${id}`, { headers: getHeaders() });
            return res.json();
        },

        // Record a view
        recordView: async (storyId: number, userId?: string) => {
            const res = await fetch(`${API_URL}/stories/${storyId}/view`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ userId })
            });
            return res.json();
        },

        // Get all stories for admin (including expired)
        getAllAdmin: async () => {
            const res = await fetch(`${API_URL}/stories/admin/all`, { headers: getHeaders() });
            return res.json();
        },

        // Create new story (Admin)
        create: async (data: {
            title: string;
            media_url: string;
            media_type?: 'image' | 'video';
            duration?: number;
            link_url?: string;
            link_text?: string;
            expires_in_hours?: number;
            priority?: number;
            branch_id?: number;
        }) => {
            const res = await fetch(`${API_URL}/stories`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        },

        // Update story (Admin)
        update: async (id: number, data: any) => {
            const res = await fetch(`${API_URL}/stories/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        },

        // Delete story (Admin)
        delete: async (id: number) => {
            const res = await fetch(`${API_URL}/stories/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return res.json();
        }
    },

    // ===================== FAVORITES =====================
    favorites: {
        // Get user's favorites
        get: async (userId: string) => {
            const res = await fetch(`${API_URL}/favorites/${userId}`, {
                headers: getHeaders()
            });
            return res.json();
        },

        // Add to favorites
        add: async (userId: string, productId: string) => {
            const res = await fetch(`${API_URL}/favorites`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ userId, productId })
            });
            return res.json();
        },

        // Remove from favorites
        remove: async (userId: string, productId: string) => {
            const res = await fetch(`${API_URL}/favorites/${userId}/${productId}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return res.json();
        },

        // Check if product is in favorites
        check: async (userId: string, productId: string) => {
            const res = await fetch(`${API_URL}/favorites/${userId}/check/${productId}`, {
                headers: getHeaders()
            });
            return res.json();
        },

        // Clear all favorites
        clear: async (userId: string) => {
            const res = await fetch(`${API_URL}/favorites/${userId}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return res.json();
        }
    },

    // ===================== CATEGORIES =====================
    categories: {
        // Get all active categories
        getAll: async () => {
            const res = await fetch(`${API_URL}/categories`, {
                headers: getHeaders()
            });
            if (!res.ok) {
                throw new Error('Failed to fetch categories');
            }
            const json = await res.json();
            // API returns {success: true, data: [...]}
            return json.data || json;
        },

        // Get single category
        getOne: async (id: number) => {
            const res = await fetch(`${API_URL}/categories/${id}`, {
                headers: getHeaders()
            });
            return res.json();
        },

        // Get category by name
        getByName: async (name: string) => {
            const res = await fetch(`${API_URL}/categories/name/${encodeURIComponent(name)}`, {
                headers: getHeaders()
            });
            return res.json();
        },

        // Admin: Get all categories (including inactive)
        getAllAdmin: async () => {
            const res = await fetch(`${API_URL}/categories/admin/all`, {
                headers: getHeaders()
            });
            return res.json();
        },

        // Admin: Create category
        create: async (data: {
            name: string;
            name_ar?: string;
            image?: string;
            icon?: string;
            bg_color?: string;
            description?: string;
            parent_id?: number;
            display_order?: number;
            is_active?: boolean;
        }) => {
            const res = await fetch(`${API_URL}/categories`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        },

        // Admin: Update category
        update: async (id: number, data: any) => {
            const res = await fetch(`${API_URL}/categories/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        },

        // Admin: Delete category
        delete: async (id: number) => {
            const res = await fetch(`${API_URL}/categories/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return res.json();
        },

        // Admin: Reorder categories
        reorder: async (categories: Array<{ id: number; display_order: number }>) => {
            const res = await fetch(`${API_URL}/categories/reorder`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ categories })
            });
            return res.json();
        },

        // Get subcategories
        getSubcategories: async (parentId: number) => {
            const res = await fetch(`${API_URL}/categories/${parentId}/subcategories`, {
                headers: getHeaders()
            });
            return res.json();
        }
    },

    // Facebook Reels API
    facebookReels: {
        getAll: async () => {
            const res = await fetch(`${API_URL}/facebook-reels`, {
                headers: getHeaders()
            });
            return res.json();
        },

        getAllAdmin: async () => {
            const res = await fetch(`${API_URL}/facebook-reels/admin/all`, {
                headers: getHeaders()
            });
            return res.json();
        },

        getById: async (id: number) => {
            const res = await fetch(`${API_URL}/facebook-reels/${id}`, {
                headers: getHeaders()
            });
            return res.json();
        },

        create: async (data: {
            title: string;
            thumbnail_url: string;
            video_url?: string;
            facebook_url: string;
            views_count?: string;
            duration?: string;
            is_active?: boolean;
            display_order?: number;
        }) => {
            const res = await fetch(`${API_URL}/facebook-reels`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        },

        update: async (id: number, data: Partial<{
            title: string;
            thumbnail_url: string;
            video_url: string;
            facebook_url: string;
            views_count: string;
            duration: string;
            is_active: boolean;
            display_order: number;
        }>) => {
            const res = await fetch(`${API_URL}/facebook-reels/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        },

        delete: async (id: number) => {
            const res = await fetch(`${API_URL}/facebook-reels/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return res.json();
        },

        reorder: async (reels: Array<{ id: number; display_order: number }>) => {
            const res = await fetch(`${API_URL}/facebook-reels/reorder`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ reels })
            });
            return res.json();
        }
    },

    // Brand Offers API - عروض البراندات
    brandOffers: {
        getAll: async () => {
            const res = await fetch(`${API_URL}/brand-offers`, {
                headers: getHeaders()
            });
            return res.json();
        },

        getAllAdmin: async () => {
            const res = await fetch(`${API_URL}/brand-offers/admin`, {
                headers: getHeaders()
            });
            return res.json();
        },

        getById: async (id: number) => {
            const res = await fetch(`${API_URL}/brand-offers/${id}`, {
                headers: getHeaders()
            });
            return res.json();
        },

        create: async (data: {
            title: string;
            title_ar: string;
            subtitle?: string;
            subtitle_ar?: string;
            discount_text?: string;
            discount_text_ar?: string;
            background_type?: string;
            background_value?: string;
            text_color?: string;
            badge_color?: string;
            badge_text_color?: string;
            image_url?: string;
            brand_logo_url?: string;
            linked_product_id?: number;
            linked_brand_id?: number;
            link_type?: string;
            custom_link?: string;
            is_active?: boolean;
            display_order?: number;
            starts_at?: string;
            expires_at?: string;
        }) => {
            const res = await fetch(`${API_URL}/brand-offers`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        },

        update: async (id: number, data: Partial<{
            title: string;
            title_ar: string;
            subtitle: string;
            subtitle_ar: string;
            discount_text: string;
            discount_text_ar: string;
            background_type: string;
            background_value: string;
            text_color: string;
            badge_color: string;
            badge_text_color: string;
            image_url: string;
            brand_logo_url: string;
            linked_product_id: number;
            linked_brand_id: number;
            link_type: string;
            custom_link: string;
            is_active: boolean;
            display_order: number;
            starts_at: string;
            expires_at: string;
        }>) => {
            const res = await fetch(`${API_URL}/brand-offers/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        },

        delete: async (id: number) => {
            const res = await fetch(`${API_URL}/brand-offers/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return res.json();
        },

        reorder: async (orders: Array<{ id: number; display_order: number }>) => {
            const res = await fetch(`${API_URL}/brand-offers/reorder/batch`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ orders })
            });
            return res.json();
        }
    },

    // Bulk Import API
    bulkImport: {
        uploadExcel: async (file: File) => {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', file);
            
            const res = await fetch(`${API_URL}/products/bulk-import`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'apikey': SUPABASE_ANON_KEY
                },
                body: formData
            });
            
            return res.json();
        },

        downloadTemplate: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/products/bulk-import/template`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'apikey': SUPABASE_ANON_KEY
                }
            });
            
            return res.blob();
        }
    },

    // Generic HTTP methods for custom endpoints
    get: async (endpoint: string) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers: getHeaders()
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || error.message || 'Request failed');
        }
        return res.json();
    },

    post: async (endpoint: string, data?: any) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || error.message || 'Request failed');
        }
        return res.json();
    },

    put: async (endpoint: string, data?: any) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || error.message || 'Request failed');
        }
        return res.json();
    },

    delete: async (endpoint: string) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || error.message || 'Request failed');
        }
        return res.json();
    },

    addresses: {
        getAll: async (userId: number) => {
            const res = await fetch(`${API_URL}/addresses?userId=${userId}`, {
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch addresses');
            return res.json();
        },
        create: async (data: any) => {
            const res = await fetch(`${API_URL}/addresses`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to create address');
            return res.json();
        },
        update: async (id: number, data: any) => {
            const res = await fetch(`${API_URL}/addresses/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to update address');
            return res.json();
        },
        delete: async (id: number) => {
            const res = await fetch(`${API_URL}/addresses/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to delete address');
            return res.json();
        },
        setDefault: async (id: number) => {
            const res = await fetch(`${API_URL}/addresses/${id}/set-default`, {
                method: 'PUT',
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to set default address');
            return res.json();
        }
    },

    loyalty: {
        getTransactions: async (userId: number) => {
            const res = await fetch(`${API_URL}/loyalty/transactions?userId=${userId}`, {
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch loyalty transactions');
            return res.json();
        }
    },

    homeSections: {
        get: async (branchId?: number) => {
            const url = branchId 
                ? `${API_URL}/home-sections?branchId=${branchId}`
                : `${API_URL}/home-sections`;
            const res = await fetch(url, {
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch home sections');
            return res.json();
        }
    }
};

export default api;
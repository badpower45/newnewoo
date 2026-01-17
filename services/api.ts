import { API_URL } from '../src/config';

// Enhanced getHeaders with better token handling
const getHeaders = () => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };
    
    if (token && token !== 'null' && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('📤 Sending request with token:', token.substring(0, 20) + '...');
    } else {
        console.warn('⚠️ No valid token found in localStorage');
    }
    
    return headers;
};

export const api = {
    API_URL, // Export API_URL for direct use
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
            const firstName = typeof data.firstName === 'string' ? data.firstName.trim() : data.firstName;
            const lastName = typeof data.lastName === 'string' ? data.lastName.trim() : data.lastName;
            const nameFromParts = `${firstName || ''} ${lastName || ''}`.trim();
            const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : data.email;
            const phone = typeof data.phone === 'string' ? data.phone.trim() : data.phone;
            const payload = {
                ...data,
                firstName,
                lastName,
                name: (typeof data.name === 'string' && data.name.trim()) ? data.name.trim() : nameFromParts,
                email,
                phone
            };
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
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
        googleLogin: async (googleData: { 
            googleId: string; 
            email: string; 
            name: string; 
            picture?: string;
            phone?: string;
            birthDate?: string;
            givenName?: string;
            familyName?: string;
        }) => {
            const res = await fetch(`${API_URL}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(googleData)
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || 'Google login failed');
            }
            return data;
        },
        verifyEmail: async (token: string) => {
            const res = await fetch(`${API_URL}/auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || 'Failed to verify email');
            }
            return data;
        },
        resendVerification: async (email: string) => {
            const res = await fetch(`${API_URL}/auth/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || 'Failed to resend verification');
            }
            return data;
        },
        facebookLogin: async (fbData: { 
            facebookId: string; 
            email?: string; 
            name: string; 
            picture?: string;
            phone?: string;
            birthDate?: string;
            firstName?: string;
            lastName?: string;
        }) => {
            const res = await fetch(`${API_URL}/auth/facebook`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fbData)
            });
            return res.json();
        },
        completeProfile: async (profileData: {
            phone?: string;
            birthDate?: string;
            firstName?: string;
            lastName?: string;
            email?: string;
        }) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/auth/complete-profile`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to complete profile');
            }
            return data;
        }
    },
    products: {
        // ⚠️ DEPRECATED: يستهلك Egress كبير - استخدم getByCategory أو getPaginated
        getAll: async () => {
            console.warn('⚠️ getAll() is deprecated - use getPaginated() to reduce egress!');
            const res = await fetch(`${API_URL}/products`, { headers: getHeaders() });
            const json = await res.json();
            const normalize = (p: any) => ({ ...p, price: Number(p?.price) || 0 });
            const data = Array.isArray(json) ? json : (json.data || []);
            return data.map(normalize);
        },
        // جلب منتجات بنظام Pagination لتقليل Egress
        getPaginated: async (page: number = 1, limit: number = 20, branchId?: number) => {
            const offset = (page - 1) * limit;
            let url = `${API_URL}/products?limit=${limit}&offset=${offset}`;
            if (branchId) url += `&branchId=${branchId}`;
            
            const res = await fetch(url, { headers: getHeaders() });
            const json = await res.json();
            const normalize = (p: any) => ({ ...p, price: Number(p?.price) || 0 });
            const data = Array.isArray(json) ? json : (json.data || []);
            
            console.log(`📦 Loaded ${data.length} products (page ${page}, limit ${limit})`);
            return data.map(normalize);
        },
        // جلب منتجات قسم معين مع limit
        getBySection: async (category: string, branchId?: number, limit: number = 8) => {
            let url = `${API_URL}/products?category=${encodeURIComponent(category)}&limit=${limit}`;
            if (branchId) url += `&branchId=${branchId}`;
            
            const res = await fetch(url, { headers: getHeaders() });
            const json = await res.json();
            const normalize = (p: any) => ({ ...p, price: Number(p?.price) || 0 });
            const data = Array.isArray(json) ? json : (json.data || []);
            
            console.log(`📦 Loaded ${data.length} products for ${category} (limit ${limit})`);
            return data.map(normalize);
        },
        getAllByBranch: async (branchId: number, options?: { includeMagazine?: boolean; limit?: number }) => {
            let url = `${API_URL}/products?branchId=${branchId}`;
            if (options?.includeMagazine) {
                url += '&includeMagazine=true';
            }
            const res = await fetch(url, { headers: getHeaders() });
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
            const branchId = localStorage.getItem('selectedBranchId') || '1';
            const res = await fetch(`${API_URL}/products/search?q=${encodeURIComponent(query)}&branchId=${branchId}`, { headers: getHeaders() });
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
            const result = await res.json();
            if (!res.ok) {
                throw new Error(result.message || result.error || 'فشل إنشاء المنتج');
            }
            return result;
        },
        update: async (id: string, data: any) => {
            const res = await fetch(`${API_URL}/products/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (!res.ok) {
                throw new Error(result.message || result.error || 'فشل تحديث المنتج');
            }
            return result;
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
        getByBarcode: async (barcode: string, branchId?: number) => {
            const url = branchId 
                ? `${API_URL}/products/barcode/${barcode}?branchId=${branchId}`
                : `${API_URL}/products/barcode/${barcode}`;
            const res = await fetch(url, { headers: getHeaders() });
            return res.json();
        },
        // Frame management APIs
        uploadFrame: async (formData: FormData) => {
            const res = await fetch(`${API_URL}/products/upload-frame`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'فشل رفع الإطار');
            }
            return res.json();
        },
        getFrames: async () => {
            const res = await fetch(`${API_URL}/products/frames`, { headers: getHeaders() });
            if (!res.ok) {
                throw new Error('فشل تحميل الإطارات');
            }
            const result = await res.json();
            if (Array.isArray(result)) {
                return { success: true, data: result };
            }
            if (!Array.isArray(result?.data) && Array.isArray(result?.frames)) {
                return { ...result, data: result.frames };
            }
            return result;
        },
        deleteFrame: async (frameId: number) => {
            const res = await fetch(`${API_URL}/products/frames/${frameId}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (!res.ok) {
                throw new Error('فشل حذف الإطار');
            }
            return res.json();
        },
        updateProductFrame: async (productId: string, frameData: { frame_overlay_url: string; frame_enabled: boolean }) => {
            const res = await fetch(`${API_URL}/products/${productId}/frame`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify(frameData)
            });
            if (!res.ok) {
                throw new Error('فشل تحديث إطار المنتج');
            }
            return res.json();
        }
    },
    heroSections: {
        // Public fetch for homepage
        getAll: async (options?: { all?: boolean }) => {
            const qs = options?.all ? '?all=true' : '';
            const token = localStorage.getItem('token');
            const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
            const res = await fetch(`${API_URL}/hero-sections${qs}`, { headers });
            const text = await res.text();
            try {
                const json = text ? JSON.parse(text) : {};
                if (!res.ok) {
                    throw new Error(json?.message || `Failed to load hero sections: ${res.status}`);
                }
                return json;
            } catch (err) {
                if (!res.ok) {
                    throw err;
                }
                // Parsing failed
                throw new Error('Invalid hero sections response');
            }
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
        },
        cancel: async (orderId: string, cancellation_reason?: string) => {
            const res = await fetch(`${API_URL}/order-cancellation/cancel/${orderId}`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ cancellation_reason })
            });
            const json = await res.json();
            if (!res.ok) {
                throw new Error(json.error || 'فشل في إلغاء الطلب');
            }
            return json;
        }
    },
    returns: {
        create: async (payload: { order_id: number; items: any[]; return_reason: string; return_notes?: string }) => {
            const res = await fetch(`${API_URL}/returns/create`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (!res.ok) {
                throw new Error(json.error || 'فشل في إنشاء طلب الإرجاع');
            }
            return json;
        },
        check: async (code: string) => {
            const res = await fetch(`${API_URL}/returns/check/${code}`, {
                headers: getHeaders()
            });
            const json = await res.json();
            if (!res.ok) {
                throw new Error(json.error || 'لم يتم العثور على الطلب');
            }
            return json;
        }
    },
    users: {
        getAll: async () => {
            const res = await fetch(`${API_URL}/users`, { headers: getHeaders() });
            const data = await res.json();
            // Wrap in data object to match expected format
            return { data: data.data || data };
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
        getAll: async (category?: string, brandId?: number) => {
            let url = `${API_URL}/magazine`;
            const params = [];
            if (category) params.push(`category=${encodeURIComponent(category)}`);
            if (brandId) params.push(`brandId=${brandId}`);
            if (params.length) {
                url += `?${params.join('&')}`;
            }
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

    // Magazine Pages API
    magazinePages: {
        getAll: async () => {
            const res = await fetch(`${API_URL}/magazine/pages`, { headers: getHeaders() });
            return res.json();
        },
        getOne: async (id: number) => {
            const res = await fetch(`${API_URL}/magazine/pages/${id}`, { headers: getHeaders() });
            return res.json();
        }
    },

    // Hot Deals API
    hotDeals: {
        // جلب جميع العروض الساخنة
        getAll: async (brandId?: number) => {
            let url = `${API_URL}/hot-deals`;
            if (brandId) url += `?brandId=${brandId}`;
            const res = await fetch(url, { headers: getHeaders() });
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
            console.log('📡 Calling API: GET /categories');
            const res = await fetch(`${API_URL}/categories`, {
                headers: getHeaders()
            });
            console.log('📡 Response status:', res.status);
            if (!res.ok) {
                throw new Error('Failed to fetch categories');
            }
            const json = await res.json();
            console.log('📡 Response data:', json);
            // API returns {success: true, data: [...]}
            return json;
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
        getAllAdmin: async (options?: { includeOfferOnly?: boolean }) => {
            console.log('📡 Calling API: GET /categories/admin/all');
            const query = options?.includeOfferOnly ? '?includeOfferOnly=true' : '';
            const res = await fetch(`${API_URL}/categories/admin/all${query}`, {
                headers: getHeaders()
            });
            console.log('📡 Admin categories response status:', res.status);
            if (!res.ok) {
                console.error('❌ Admin categories API failed:', res.status, res.statusText);
                throw new Error(`Failed to fetch admin categories: ${res.status}`);
            }
            const json = await res.json();
            console.log('📡 Admin categories data:', json);
            return json;
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

    // Stories API
    stories: {
        getAll: async () => {
            const res = await fetch(`${API_URL}/stories`, {
                headers: getHeaders()
            });
            return res.json();
        },

        getAllAdmin: async () => {
            const res = await fetch(`${API_URL}/stories/admin/all`, {
                headers: getHeaders()
            });
            return res.json();
        },

        getById: async (id: number) => {
            const res = await fetch(`${API_URL}/stories/${id}`, {
                headers: getHeaders()
            });
            return res.json();
        },

        create: async (data: {
            title: string;
            media_url: string;
            media_type?: 'image' | 'video';
            duration?: number;
            link_url?: string;
            link_text?: string;
            circle_name?: string;
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

        update: async (id: number, data: Partial<{
            title: string;
            media_url: string;
            media_type: 'image' | 'video';
            duration: number;
            link_url: string;
            link_text: string;
            circle_name: string;
            expires_in_hours: number;
            priority: number;
            is_active: boolean;
            branch_id: number;
        }>) => {
            const res = await fetch(`${API_URL}/stories/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return res.json();
        },

        delete: async (id: number) => {
            const res = await fetch(`${API_URL}/stories/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return res.json();
        },

        recordView: async (id: number, userId?: number) => {
            const res = await fetch(`${API_URL}/stories/${id}/view`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ userId })
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
        },
        redeemPoints: async (pointsToRedeem: number) => {
            const res = await fetch(`${API_URL}/loyalty/redeem`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ pointsToRedeem })
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to redeem points');
            }
            return res.json();
        }
    },

    brands: {
        getAll: async () => {
            const res = await fetch(`${API_URL}/brands`, {
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch brands');
            return res.json();
        },
        create: async (data: any) => {
            const res = await fetch(`${API_URL}/brands`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to create brand');
            return res.json();
        },
        update: async (id: string, data: any) => {
            const res = await fetch(`${API_URL}/brands/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to update brand');
            return res.json();
        },
        delete: async (id: string) => {
            const res = await fetch(`${API_URL}/brands/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to delete brand');
            return res.json();
        }
    },

    reviews: {
        getByProduct: async (productId: string, page = 1, limit = 10, sort = 'recent') => {
            const res = await fetch(
                `${API_URL}/reviews/product/${productId}?page=${page}&limit=${limit}&sort=${sort}`, 
                { headers: getHeaders() }
            );
            if (!res.ok) throw new Error('Failed to fetch reviews');
            const data = await res.json();
            // Return reviews array from response
            return { data: data.reviews || [], stats: data.stats, distribution: data.distribution };
        },
        create: async (data: { product_id: string; rating: number; comment?: string; images?: string[] }) => {
            const res = await fetch(`${API_URL}/reviews/add`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to create review');
            }
            return res.json();
        },
        delete: async (id: string) => {
            const res = await fetch(`${API_URL}/reviews/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to delete review');
            return res.json();
        },
        markHelpful: async (reviewId: string) => {
            const res = await fetch(`${API_URL}/reviews/helpful/${reviewId}`, {
                method: 'POST',
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to mark review as helpful');
            return res.json();
        }
    },

    loyaltyBarcode: {
        createRedemption: async (points_to_redeem: number) => {
            const res = await fetch(`${API_URL}/loyalty-barcode/create-redemption`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ points_to_redeem })
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to create barcode');
            }
            return res.json();
        },
        useBarcode: async (barcode: string, order_id?: number) => {
            const res = await fetch(`${API_URL}/loyalty-barcode/use-barcode/${barcode}`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ order_id })
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to use barcode');
            }
            return res.json();
        },
        validate: async (barcode: string) => {
            const res = await fetch(`${API_URL}/loyalty-barcode/validate/${barcode}`, {
                headers: getHeaders()
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to validate barcode');
            }
            return res.json();
        },
        getMyBarcodes: async () => {
            const res = await fetch(`${API_URL}/loyalty-barcode/my-barcodes`, {
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch barcodes');
            return res.json();
        },
        cancel: async (barcodeId: string) => {
            const res = await fetch(`${API_URL}/loyalty-barcode/cancel/${barcodeId}`, {
                method: 'POST',
                headers: getHeaders()
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to cancel barcode');
            }
            return res.json();
        }
    },

    images: {
        upload: async (file: File) => {
            const formData = new FormData();
            formData.append('image', file);
            
            const res = await fetch(`${API_URL}/upload/single`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });
            if (!res.ok) throw new Error('Failed to upload image');
            const data = await res.json();
            return data.data.url;
        },
        uploadBrandImage: async (file: File, type: 'logo' | 'banner', brandId?: string) => {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('type', type);
            if (brandId) formData.append('brandId', brandId);
            else formData.append('brandId', `temp_${Date.now()}`);
            
            const res = await fetch(`${API_URL}/upload/brand`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to upload brand image');
            }
            const data = await res.json();
            return data.data.url;
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
    },

    // Enhanced Loyalty System
    loyaltyEnhanced: {
        getBalance: async () => {
            const res = await fetch(`${API_URL}/loyalty-enhanced/balance`, {
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch loyalty balance');
            return res.json();
        },
        getTransactions: async (limit = 50, offset = 0) => {
            const res = await fetch(`${API_URL}/loyalty-enhanced/transactions?limit=${limit}&offset=${offset}`, {
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch transactions');
            return res.json();
        },
        convert: async (points: number) => {
            const res = await fetch(`${API_URL}/loyalty-enhanced/convert`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ points })
            });
            if (!res.ok) throw new Error('Failed to convert points');
            return res.json();
        },
        calculateOrder: async (subtotal: number, usePoints = 0, address?: any) => {
            const res = await fetch(`${API_URL}/loyalty-enhanced/calculate-order`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ subtotal, usePoints, address })
            });
            if (!res.ok) throw new Error('Failed to calculate order');
            return res.json();
        },
        getConfig: async () => {
            const res = await fetch(`${API_URL}/loyalty-enhanced/config`, {
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch config');
            return res.json();
        }
    },

    // Enhanced Returns System
    returnsEnhanced: {
        create: async (data: any) => {
            const res = await fetch(`${API_URL}/returns-enhanced/create`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to create return');
            return res.json();
        },
        getMyReturns: async (status?: string, limit = 20, offset = 0) => {
            const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
            if (status) params.append('status', status);
            const res = await fetch(`${API_URL}/returns-enhanced/my-returns?${params.toString()}`, {
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch returns');
            return res.json();
        },
        getByCode: async (returnCode: string) => {
            const res = await fetch(`${API_URL}/returns-enhanced/${returnCode}`, {
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch return');
            return res.json();
        },
        getStats: async () => {
            const res = await fetch(`${API_URL}/returns-enhanced/stats/overview`, {
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch stats');
            return res.json();
        }
    },

    // Admin user controls
    adminUsers: {
        blockByEmail: async (email: string, reason?: string) => {
            const res = await fetch(`${API_URL}/users/block-email`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ email, reason })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || 'Failed to block user');
            }
            return data;
        },
        unblockByEmail: async (email: string) => {
            const res = await fetch(`${API_URL}/users/unblock-email`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || 'Failed to unblock user');
            }
            return data;
        }
    },

    // Admin Enhanced System
    adminEnhanced: {
        // Notifications
        sendNotification: async (data: any) => {
            const res = await fetch(`${API_URL}/admin-enhanced/notifications/send`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to send notification');
            return res.json();
        },
        getNotificationHistory: async (limit = 50, offset = 0) => {
            const res = await fetch(`${API_URL}/admin-enhanced/notifications/history?limit=${limit}&offset=${offset}`, {
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch history');
            return res.json();
        },
        // CTAs
        createCTA: async (data: any) => {
            const res = await fetch(`${API_URL}/admin-enhanced/cta/create`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to create CTA');
            return res.json();
        },
        getAllCTAs: async (position?: string, is_active?: boolean) => {
            const params = new URLSearchParams();
            if (position) params.append('position', position);
            if (is_active !== undefined) params.append('is_active', String(is_active));
            const res = await fetch(`${API_URL}/admin-enhanced/cta/all?${params.toString()}`, {
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch CTAs');
            return res.json();
        },
        getActiveCTAs: async (position = 'home_middle') => {
            const res = await fetch(`${API_URL}/admin-enhanced/cta/active?position=${position}`, {
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch active CTAs');
            return res.json();
        },
        updateCTA: async (id: number, data: any) => {
            const res = await fetch(`${API_URL}/admin-enhanced/cta/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to update CTA');
            return res.json();
        },
        deleteCTA: async (id: number) => {
            const res = await fetch(`${API_URL}/admin-enhanced/cta/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to delete CTA');
            return res.json();
        },
        trackCTAClick: async (id: number, userId?: number) => {
            const res = await fetch(`${API_URL}/admin-enhanced/cta/${id}/track-click`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ user_id: userId })
            });
            if (!res.ok) throw new Error('Failed to track click');
            return res.json();
        },
        // Dashboard
        getDashboardOverview: async (period = '30') => {
            const res = await fetch(`${API_URL}/admin-enhanced/dashboard/overview?period=${period}`, {
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch dashboard');
            return res.json();
        }
    }
};

export default api;

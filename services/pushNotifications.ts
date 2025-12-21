/**
 * Push Notifications Service
 * خدمة إرسال الإشعارات الفورية للمستخدمين
 */

import { API_URL } from '../src/config';

interface NotificationPayload {
    title: string;
    body: string;
    icon?: string;
    image?: string;
    url?: string;
    data?: any;
}

interface NotificationOptions {
    userIds?: number[];
    sendToAll?: boolean;
    segment?: 'all' | 'customers' | 'vip';
}

class PushNotificationService {
    private getAuthHeaders() {
        // Reuse same headers shape as api helpers
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
    }

    private async sendNotification(payload: any): Promise<boolean> {
        const res = await fetch(`${API_URL}/notifications/send`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || error.message || 'Failed to send notification');
        }

        return true;
    }

    /**
     * إرسال إشعار لجميع المستخدمين
     */
    async sendToAll(payload: NotificationPayload): Promise<boolean> {
        try {
            const response = await this.sendNotification({
                title: payload.title,
                body: payload.body,
                image_url: payload.image,
                action_url: payload.url,
                notification_type: 'custom',
                target_segment: 'all',
                metadata: payload.data || {}
            });

            return response;
        } catch (error) {
            console.error('❌ فشل إرسال الإشعار:', error);
            return false;
        }
    }

    /**
     * إرسال إشعار لمستخدمين محددين
     */
    async sendToUsers(userIds: number[], payload: NotificationPayload): Promise<boolean> {
        try {
            const response = await this.sendNotification({
                title: payload.title,
                body: payload.body,
                image_url: payload.image,
                action_url: payload.url,
                notification_type: 'custom',
                target_segment: 'custom',
                target_user_ids: userIds,
                metadata: payload.data || {}
            });

            return response;
        } catch (error) {
            console.error('❌ فشل إرسال الإشعار:', error);
            return false;
        }
    }

    /**
     * إرسال إشعار عند إضافة ريل جديد
     */
    async notifyNewReel(reelData: { title: string; thumbnail: string; url: string }): Promise<boolean> {
        const payload: NotificationPayload = {
            title: '🎬 فيديو جديد!',
            body: `شاهد الآن: ${reelData.title}`,
            image: reelData.thumbnail,
            url: `/magazine?reel=${reelData.url}`,
            data: {
                type: 'new_reel',
                reelUrl: reelData.url
            }
        };

        return this.sendToAll(payload);
    }

    /**
     * إرسال إشعار عند إضافة عرض جديد
     */
    async notifyNewOffer(offerData: { title: string; discount: number; image: string; productId?: number }): Promise<boolean> {
        const payload: NotificationPayload = {
            title: `🔥 عرض جديد - خصم ${offerData.discount}%!`,
            body: offerData.title,
            image: offerData.image,
            url: offerData.productId ? `/product/${offerData.productId}` : '/deals',
            data: {
                type: 'new_offer',
                productId: offerData.productId,
                discount: offerData.discount
            }
        };

        return this.sendToAll(payload);
    }

    /**
     * إرسال إشعار عند إضافة منتج جديد
     */
    async notifyNewProduct(productData: { name: string; price: number; image: string; id: number }): Promise<boolean> {
        const payload: NotificationPayload = {
            title: '✨ منتج جديد!',
            body: `${productData.name} - ${productData.price} جنيه`,
            image: productData.image,
            url: `/product/${productData.id}`,
            data: {
                type: 'new_product',
                productId: productData.id
            }
        };

        return this.sendToAll(payload);
    }

    /**
     * إرسال إشعار عند إضافة بانر جديد
     */
    async notifyNewBanner(bannerData: { title: string; image: string; targetUrl?: string }): Promise<boolean> {
        const payload: NotificationPayload = {
            title: '🎉 عرض خاص!',
            body: bannerData.title,
            image: bannerData.image,
            url: bannerData.targetUrl || '/',
            data: {
                type: 'new_banner'
            }
        };

        return this.sendToAll(payload);
    }

    /**
     * إرسال إشعار بتحديث حالة الطلب
     */
    async notifyOrderStatusUpdate(
        userId: number,
        orderId: number,
        status: string,
        statusLabel: string
    ): Promise<boolean> {
        const statusEmoji: { [key: string]: string } = {
            'confirmed': '✅',
            'preparing': '👨‍🍳',
            'out_for_delivery': '🚚',
            'delivered': '✅',
            'cancelled': '❌'
        };

        const payload: NotificationPayload = {
            title: `${statusEmoji[status] || '📦'} تحديث طلبك #${orderId}`,
            body: `حالة الطلب: ${statusLabel}`,
            url: `/orders/${orderId}`,
            data: {
                type: 'order_status',
                orderId,
                status
            }
        };

        return this.sendToUsers([userId], payload);
    }

    /**
     * إشعار بكوبون خصم جديد
     */
    async notifyNewCoupon(couponCode: string, discount: number, expiryDate: string): Promise<boolean> {
        const payload: NotificationPayload = {
            title: `🎁 كود خصم ${discount}%!`,
            body: `استخدم الكود: ${couponCode} قبل ${expiryDate}`,
            url: '/products',
            data: {
                type: 'new_coupon',
                couponCode,
                discount
            }
        };

        return this.sendToAll(payload);
    }
                        body: data.body,
                        icon: data.icon || '/logo.png',
                        image: data.image,
                        badge: '/logo.png',
                        tag: data.data?.type || 'general',
                        requireInteraction: false
                    });
                }
                
                resolve(true);
            }, 500);
        });
    }

    /**
     * طلب الإذن للإشعارات من المستخدم
     */
    async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.warn('⚠️ المتصفح لا يدعم الإشعارات');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    }

    /**
     * تسجيل المستخدم للإشعارات (FCM/OneSignal)
     */
    async subscribeUser(userId: number): Promise<boolean> {
        try {
            // هنا يتم التكامل مع FCM أو OneSignal
            console.log(`📱 تسجيل المستخدم ${userId} للإشعارات`);
            
            // Mock implementation
            localStorage.setItem('push_subscribed', 'true');
            localStorage.setItem('push_user_id', userId.toString());
            
            return true;
        } catch (error) {
            console.error('❌ فشل تسجيل المستخدم للإشعارات:', error);
            return false;
        }
    }

    /**
     * إلغاء تسجيل المستخدم من الإشعارات
     */
    async unsubscribeUser(): Promise<boolean> {
        try {
            console.log('🔕 إلغاء تسجيل المستخدم من الإشعارات');
            
            localStorage.removeItem('push_subscribed');
            localStorage.removeItem('push_user_id');
            
            return true;
        } catch (error) {
            console.error('❌ فشل إلغاء التسجيل:', error);
            return false;
        }
    }
}

// تصدير instance واحد
export const pushNotificationService = new PushNotificationService();

// تصدير الأنواع
export type { NotificationPayload, NotificationOptions };

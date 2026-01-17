import { supabase } from './supabaseClient';

interface PageViewData {
    page_path: string;
    page_title?: string;
    referrer?: string;
    user_id?: number;
}

class AnalyticsService {
    private sessionId: string;
    private pageStartTime: number = 0;
    private currentPath: string = '';

    constructor() {
        // Generate or retrieve session ID
        this.sessionId = this.getOrCreateSessionId();
    }

    private getOrCreateSessionId(): string {
        let sessionId = sessionStorage.getItem('analytics_session_id');
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('analytics_session_id', sessionId);
        }
        return sessionId;
    }

    private getDeviceType(): string {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return 'tablet';
        }
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
            return 'mobile';
        }
        return 'desktop';
    }

    private getBrowser(): string {
        const ua = navigator.userAgent;
        if (ua.indexOf('Firefox') > -1) return 'Firefox';
        if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) return 'Opera';
        if (ua.indexOf('Trident') > -1) return 'IE';
        if (ua.indexOf('Edge') > -1) return 'Edge';
        if (ua.indexOf('Chrome') > -1) return 'Chrome';
        if (ua.indexOf('Safari') > -1) return 'Safari';
        return 'Unknown';
    }

    private getOS(): string {
        const ua = navigator.userAgent;
        if (ua.indexOf('Win') > -1) return 'Windows';
        if (ua.indexOf('Mac') > -1) return 'MacOS';
        if (ua.indexOf('Linux') > -1) return 'Linux';
        if (ua.indexOf('Android') > -1) return 'Android';
        if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) return 'iOS';
        return 'Unknown';
    }

    async trackPageView(data: PageViewData) {
        try {
            // Record page end time if exists
            if (this.currentPath && this.pageStartTime) {
                const duration = Math.floor((Date.now() - this.pageStartTime) / 1000);
                // Update previous page view with duration
                await this.updatePageDuration(this.currentPath, duration);
            }

            // Start tracking new page
            this.currentPath = data.page_path;
            this.pageStartTime = Date.now();

            const pageViewData = {
                user_id: data.user_id || null,
                session_id: this.sessionId,
                page_path: data.page_path,
                page_title: data.page_title || document.title,
                referrer: data.referrer || document.referrer,
                user_agent: navigator.userAgent,
                device_type: this.getDeviceType(),
                browser: this.getBrowser(),
                os: this.getOS(),
                visited_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('page_views')
                .insert([pageViewData]);

            if (error) {
                console.error('Error tracking page view:', error);
            }
        } catch (error) {
            console.error('Analytics error:', error);
        }
    }

    private async updatePageDuration(path: string, duration: number) {
        try {
            // Update the most recent page view for this session and path
            const { error } = await supabase
                .from('page_views')
                .update({ duration_seconds: duration })
                .eq('session_id', this.sessionId)
                .eq('page_path', path)
                .is('duration_seconds', null)
                .order('visited_at', { ascending: false })
                .limit(1);

            if (error) {
                console.error('Error updating page duration:', error);
            }
        } catch (error) {
            console.error('Error updating duration:', error);
        }
    }

    // Get analytics data for admin dashboard
    async getAnalytics(days: number = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const { data, error } = await supabase
                .from('page_views')
                .select('*')
                .gte('visited_at', startDate.toISOString());

            if (error) throw error;

            return this.processAnalyticsData(data || []);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            return null;
        }
    }

    private processAnalyticsData(data: any[]) {
        const totalViews = data.length;
        const uniqueVisitors = new Set(data.map(d => d.user_id || d.session_id)).size;
        const uniqueUsers = new Set(data.filter(d => d.user_id).map(d => d.user_id)).size;
        
        // Device breakdown
        const devices = data.reduce((acc: any, view) => {
            acc[view.device_type] = (acc[view.device_type] || 0) + 1;
            return acc;
        }, {});

        // Browser breakdown
        const browsers = data.reduce((acc: any, view) => {
            acc[view.browser] = (acc[view.browser] || 0) + 1;
            return acc;
        }, {});

        // Top pages
        const pages = data.reduce((acc: any, view) => {
            const path = view.page_path;
            if (!acc[path]) {
                acc[path] = { path, count: 0, title: view.page_title };
            }
            acc[path].count++;
            return acc;
        }, {});

        const topPages = Object.values(pages)
            .sort((a: any, b: any) => b.count - a.count)
            .slice(0, 10);

        // Average duration
        const durationsAvg = data
            .filter(d => d.duration_seconds)
            .reduce((sum, d) => sum + d.duration_seconds, 0) / data.filter(d => d.duration_seconds).length || 0;

        return {
            totalViews,
            uniqueVisitors,
            uniqueUsers,
            guestVisitors: uniqueVisitors - uniqueUsers,
            devices,
            browsers,
            topPages,
            avgDuration: Math.round(durationsAvg),
        };
    }

    // Track when user leaves the page
    setupBeforeUnload() {
        window.addEventListener('beforeunload', () => {
            if (this.currentPath && this.pageStartTime) {
                const duration = Math.floor((Date.now() - this.pageStartTime) / 1000);
                // Use sendBeacon for reliable sending during page unload
                const data = JSON.stringify({
                    session_id: this.sessionId,
                    page_path: this.currentPath,
                    duration_seconds: duration
                });
                navigator.sendBeacon('/api/analytics/duration', data);
            }
        });
    }
}

export const analyticsService = new AnalyticsService();

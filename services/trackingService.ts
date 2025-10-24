import type { ActivityLog } from '../types';

const ANALYTICS_DB_KEY = 'resumeMatcherAnalyticsDB';

// Helper function to parse User Agent string
// This is a simplified parser
const parseUserAgent = (ua: string) => {
    let browser = 'Unknown';
    let os = 'Unknown';

    // OS Detection
    if (/windows/i.test(ua)) os = 'Windows';
    else if (/macintosh|mac os x/i.test(ua)) os = 'Mac OS';
    else if (/linux/i.test(ua)) os = 'Linux';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';

    // Browser Detection
    if (/firefox/i.test(ua)) browser = 'Firefox';
    else if (/chrome/i.test(ua) && !/edge/i.test(ua)) browser = 'Chrome';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
    else if (/edge/i.test(ua)) browser = 'Edge';
    else if (/msie|trident/i.test(ua)) browser = 'Internet Explorer';

    return { browser, os };
};

export const trackingService = {
    getAnalytics: (): ActivityLog[] => {
        const db = localStorage.getItem(ANALYTICS_DB_KEY);
        try {
            return db ? JSON.parse(db) : [];
        } catch {
            return [];
        }
    },

    saveAnalytics: (db: ActivityLog[]) => {
        // Sort by date descending before saving
        db.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        localStorage.setItem(ANALYTICS_DB_KEY, JSON.stringify(db));
    },

    logActivity: async (
        event: 'login' | 'register' | 'analysis_run' | 'generator_run',
        userId: string
    ): Promise<void> => {
        try {
            let ip = '127.0.0.1';
            let country = 'Local';
            let city = 'N/A';
            
            // Fetch IP address
            try {
                const ipResponse = await fetch('https://api.ipify.org?format=json');
                if (ipResponse.ok) {
                    const ipData = await ipResponse.json();
                    ip = ipData.ip;
                }
            } catch (e) {
                console.warn("Could not fetch IP address:", e);
            }

            // Fetch Geolocation based on IP
            if (ip !== '127.0.0.1') {
                try {
                    const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`);
                    if (geoResponse.ok) {
                        const geoData = await geoResponse.json();
                        country = geoData.country_name || 'Unknown';
                        city = geoData.city || 'Unknown';
                    }
                } catch(e) {
                     console.warn("Could not fetch geolocation data:", e);
                }
            }
            
            const { browser, os } = parseUserAgent(navigator.userAgent);
            
            // Simulate MAC Address (browsers cannot access this for security reasons)
            const macAddress = `Simulated-MAC-${userId.slice(-6)}`;

            const newLog: ActivityLog = {
                id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                timestamp: new Date().toISOString(),
                userId,
                event,
                ip,
                country,
                city,
                browser,
                os,
                macAddress,
            };

            const db = trackingService.getAnalytics();
            db.push(newLog);
            trackingService.saveAnalytics(db);

        } catch (error) {
            console.error("Failed to log activity:", error);
        }
    }
};

import type { User, Plan } from '../types';

// In a real application, this would be a secure backend with a database.
// For this simulation, we use localStorage.

const DB_KEY = 'resumeMatcherUserDB';
const SESSION_KEY = 'resumeMatcherSession';
const GUEST_SESSION_KEY = 'resumeMatcherGuestSession';


const getDb = (): Record<string, User> => {
    const db = localStorage.getItem(DB_KEY);
    return db ? JSON.parse(db) : {};
};

const saveDb = (db: Record<string, User>) => {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
};

const PLAN_LIMITS: Record<Plan, number> = {
    free: 5, // Reduced for easy testing
    standard: 10000,
    pro: Infinity,
};

export const authService = {
    // --- Guest Session Management ---
    getGuestSession: (): { usageCount: number; guestId: string } => {
        const session = localStorage.getItem(GUEST_SESSION_KEY);
        if (session) {
            try {
                const parsed = JSON.parse(session);
                if (parsed.guestId) return parsed;
            } catch {
                // Malformed session, create a new one
            }
        }
        // Create a new session if none exists or if it's malformed
        const newSession = { 
            usageCount: 0, 
            guestId: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        };
        authService.saveGuestSession(newSession);
        return newSession;
    },

    saveGuestSession: (session: { usageCount: number; guestId: string }) => {
        localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
    },
    
    clearGuestSession: () => {
        localStorage.removeItem(GUEST_SESSION_KEY);
    },

    // --- User Account Management ---
    register: (email: string, fullName: string, phone: string, password: string): Promise<User> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const db = getDb();
                if (db[email]) {
                    return reject(new Error("User with this email already exists."));
                }
                const newUser: User = {
                    email,
                    fullName,
                    phone,
                    password, // In a real app, hash and salt this password
                    plan: 'free',
                    usageCount: 0,
                };
                db[email] = newUser;
                saveDb(db);
                localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
                authService.clearGuestSession(); // Clear guest data on registration
                resolve(newUser);
            }, 500);
        });
    },

    login: (email: string, password: string): Promise<User> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const db = getDb();
                const user = db[email];
                if (!user) {
                    return reject(new Error("No user found with this email."));
                }
                if (user.password !== password) {
                    return reject(new Error("Incorrect password."));
                }
                localStorage.setItem(SESSION_KEY, JSON.stringify(user));
                authService.clearGuestSession(); // Clear guest data on login
                resolve(user);
            }, 500);
        });
    },

    logout: () => {
        localStorage.removeItem(SESSION_KEY);
    },

    getCurrentUser: (): User | null => {
        const session = localStorage.getItem(SESSION_KEY);
        if (!session) return null;
        try {
            const user: User = JSON.parse(session);
            const db = getDb();
            return db[user.email] || null;
        } catch {
            return null;
        }
    },

    forgotPassword: (email: string): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const db = getDb();
                if (!db[email]) {
                    // To prevent email enumeration, don't reveal if the user exists
                    // In a real app, you'd send an email if the user exists.
                    // For simulation, we'll just resolve.
                    return resolve(true);
                }
                resolve(true);
            }, 500)
        })
    },

    resetPassword: (email: string, newPassword: string): Promise<User> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const db = getDb();
                const user = db[email];
                if (!user) {
                    return reject(new Error("User not found. This should not happen in a real flow."));
                }
                user.password = newPassword;
                db[email] = user;
                saveDb(db);
                localStorage.setItem(SESSION_KEY, JSON.stringify(user));
                resolve(user);
            }, 500);
        });
    },

    incrementUsage: (): { canProceed: boolean; user: User | null; guestSession: { usageCount: number; guestId: string } | null } => {
        const user = authService.getCurrentUser();
        
        if (user) { // Handle logged-in user
            if (user.usageCount >= PLAN_LIMITS[user.plan]) {
                return { canProceed: false, user, guestSession: null };
            }
            user.usageCount += 1;
            const db = getDb();
            db[user.email] = user;
            saveDb(db);
            localStorage.setItem(SESSION_KEY, JSON.stringify(user));
            return { canProceed: true, user, guestSession: null };
        } else { // Handle guest user
            const guestSession = authService.getGuestSession();
            if (guestSession.usageCount >= PLAN_LIMITS['free']) {
                return { canProceed: false, user: null, guestSession: guestSession };
            }
            guestSession.usageCount += 1;
            authService.saveGuestSession(guestSession);
            return { canProceed: true, user: null, guestSession: guestSession };
        }
    },

    upgradePlan: (newPlan: Plan): Promise<User> => {
        return new Promise((resolve, reject) => {
             const user = authService.getCurrentUser();
             if (!user) {
                 return reject(new Error("No active user session."));
             }
             user.plan = newPlan;
             if (newPlan !== 'free') {
                user.usageCount = 0;
             }
             
             const db = getDb();
             db[user.email] = user;
             saveDb(db);
             localStorage.setItem(SESSION_KEY, JSON.stringify(user));
             resolve(user);
        });
    },

    getPlanLimit: (plan: Plan): number => PLAN_LIMITS[plan],
};

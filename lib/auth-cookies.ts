import { setCookie, getCookie, removeCookie } from './cookies';

// Auth cookie constants
const AUTH_COOKIE_KEYS = {
    REMEMBER_EMAIL: 'remembered_email',
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_ID: 'user_id',
    SESSION_EXPIRY: 'session_expiry'
};

/**
 * Set authentication cookies when user logs in
 */
export const setAuthCookies = (
    email: string,
    rememberMe: boolean,
    authToken: string,
    refreshToken: string,
    userId: string
) => {
    const expiryDays = rememberMe ? 30 : 1; // 30 days for remember me, 1 day for session

    if (rememberMe) {
        setCookie(AUTH_COOKIE_KEYS.REMEMBER_EMAIL, email, { expires: 30 });
    }

    // Set auth token with expiry
    setCookie(AUTH_COOKIE_KEYS.AUTH_TOKEN, authToken, {
        expires: expiryDays,
        secure: true,
        sameSite: 'strict'
    });

    // Set refresh token
    setCookie(AUTH_COOKIE_KEYS.REFRESH_TOKEN, refreshToken, {
        expires: 30, // Refresh token has longer expiry
        secure: true,
        sameSite: 'strict'
    });

    // Set user ID
    setCookie(AUTH_COOKIE_KEYS.USER_ID, userId, {
        expires: expiryDays,
        secure: true,
        sameSite: 'strict'
    });

    // Set expiry timestamp
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    setCookie(AUTH_COOKIE_KEYS.SESSION_EXPIRY, expiryDate.toISOString(), {
        expires: expiryDays
    });
};

/**
 * Clear all authentication cookies
 */
export const clearAuthCookies = () => {
    Object.values(AUTH_COOKIE_KEYS).forEach(key => {
        removeCookie(key);
    });
};

/**
 * Check if user is remembered
 */
export const isUserRemembered = (): boolean => {
    return !!getCookie(AUTH_COOKIE_KEYS.REMEMBER_EMAIL);
};

/**
 * Get remembered email
 */
export const getRememberedEmail = (): string | null => {
    return getCookie(AUTH_COOKIE_KEYS.REMEMBER_EMAIL);
};

/**
 * Check if auth token exists and is valid
 */
export const isAuthTokenValid = (): boolean => {
    const expiryStr = getCookie(AUTH_COOKIE_KEYS.SESSION_EXPIRY);
    if (!expiryStr) return false;

    try {
        const expiry = new Date(expiryStr);
        return expiry > new Date();
    } catch {
        return false;
    }
};

/**
 * Get auth token from cookie
 */
export const getAuthToken = (): string | null => {
    return getCookie(AUTH_COOKIE_KEYS.AUTH_TOKEN);
};

/**
 * Get refresh token from cookie
 */
export const getRefreshToken = (): string | null => {
    return getCookie(AUTH_COOKIE_KEYS.REFRESH_TOKEN);
};

/**
 * Get user ID from cookie
 */
export const getUserId = (): string | null => {
    return getCookie(AUTH_COOKIE_KEYS.USER_ID);
};
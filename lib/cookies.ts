import Cookies from 'js-cookie';

// Default cookie options
const defaultOptions = {
    expires: 7, // 7 days
    path: '/',
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
};

// Cookie keys
export const COOKIE_KEYS = {
    THEME: 'swift_tasks_theme',
    REMEMBER_ME: 'swift_tasks_remember_me',
    USER_PREFERENCES: 'swift_tasks_user_prefs',
    LAST_PROJECT: 'swift_tasks_last_project',
    SIDEBAR_COLLAPSED: 'swift_tasks_sidebar_collapsed',
};

/**
 * Set a cookie with the given name and value
 */
export const setCookie = (name: string, value: string | object, options = {}) => {
    const cookieValue = typeof value === 'object' ? JSON.stringify(value) : value;
    Cookies.set(name, cookieValue, { ...defaultOptions, ...options });
};

/**
 * Get a cookie by name
 */
export const getCookie = (name: string): string | null => {
    const value = Cookies.get(name);
    if (!value) return null;
    return value;
};

/**
 * Get a cookie and parse it as JSON
 */
export const getJSONCookie = <T>(name: string): T | null => {
    const value = getCookie(name);
    if (!value) return null;

    try {
        return JSON.parse(value) as T;
    } catch (error) {
        console.error(`Failed to parse cookie ${name} as JSON`, error);
        return null;
    }
};

/**
 * Remove a cookie by name
 */
export const removeCookie = (name: string, options = {}) => {
    Cookies.remove(name, { ...defaultOptions, ...options });
};

/**
 * Check if a cookie exists
 */
export const hasCookie = (name: string): boolean => {
    return !!getCookie(name);
};

/**
 * Set user preferences as a cookie
 */
export const setUserPreferences = (preferences: object) => {
    setCookie(COOKIE_KEYS.USER_PREFERENCES, preferences);
};

/**
 * Get user preferences from cookie
 */
export const getUserPreferences = <T>(): T | null => {
    return getJSONCookie<T>(COOKIE_KEYS.USER_PREFERENCES);
};

/**
 * Set theme preference
 */
export const setTheme = (theme: 'light' | 'dark' | 'system') => {
    setCookie(COOKIE_KEYS.THEME, theme);
};

/**
 * Get current theme preference
 */
export const getTheme = (): 'light' | 'dark' | 'system' => {
    return (getCookie(COOKIE_KEYS.THEME) as 'light' | 'dark' | 'system') || 'system';
};

/**
 * Set remember me preference
 */
export const setRememberMe = (remember: boolean) => {
    setCookie(COOKIE_KEYS.REMEMBER_ME, remember.toString());
};

/**
 * Get remember me preference
 */
export const getRememberMe = (): boolean => {
    const value = getCookie(COOKIE_KEYS.REMEMBER_ME);
    return value === 'true';
};

/**
 * Set last visited project
 */
export const setLastProject = (projectId: string) => {
    setCookie(COOKIE_KEYS.LAST_PROJECT, projectId);
};

/**
 * Get last visited project
 */
export const getLastProject = (): string | null => {
    return getCookie(COOKIE_KEYS.LAST_PROJECT);
};

/**
 * Set sidebar collapsed state
 */
export const setSidebarCollapsed = (collapsed: boolean) => {
    setCookie(COOKIE_KEYS.SIDEBAR_COLLAPSED, collapsed.toString());
};

/**
 * Get sidebar collapsed state
 */
export const getSidebarCollapsed = (): boolean => {
    const value = getCookie(COOKIE_KEYS.SIDEBAR_COLLAPSED);
    return value === 'true';
};
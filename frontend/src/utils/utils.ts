export const setAuthData = (data: any) => {
    localStorage.setItem("isLogin", "true");
    localStorage.setItem("role", data.role);
    localStorage.setItem("token_type", data.token_type);
    localStorage.setItem("token", data.token);
    localStorage.setItem("id", data.id);
};

export const clearAuthData = () => {
    localStorage.clear();
};

export const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    const tokenType = localStorage.getItem('token_type');
    return token ? { Authorization: `${tokenType} ${token}` } : {};
};

export const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
};

export const getRole = () => {
    return localStorage.getItem('role');
};

export const getUserId = () => {
    return localStorage.getItem('id');
};

export const redirectBasedOnRole = () => {
    const role = getRole();
    if (role === 'admin') {
        window.location.href = '/admin';
    } else if (role === 'customer') {
        window.location.href = '/';
    } else {
        window.location.href = '/login';
    }
};
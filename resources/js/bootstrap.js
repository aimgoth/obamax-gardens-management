import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Get CSRF token from meta tag
const token = document.querySelector('meta[name="csrf-token"]')?.content;
if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
}

// Global route helper for Electron compatibility
if (typeof window.route === 'undefined') {
    window.route = (name, params = {}) => {
        const routes = {
            'assistant.index': '/assistant',
            'assistant.ask': '/assistant/ask',
            'dashboard': '/dashboard',
            'login': '/login',
            'logout': '/logout',
        };
        return routes[name] || '/';
    };
}

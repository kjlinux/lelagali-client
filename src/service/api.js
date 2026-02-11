/**
 * Service API HTTP pour lelagali
 * Configure axios et gère les appels au backend Laravel
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = this.getToken();
    }

    /**
     * Récupérer le token depuis le localStorage
     */
    getToken() {
        return localStorage.getItem('client_auth_token');
    }

    /**
     * Sauvegarder le token dans le localStorage
     */
    setToken(token) {
        if (token) {
            localStorage.setItem('client_auth_token', token);
            this.token = token;
        } else {
            localStorage.removeItem('client_auth_token');
            this.token = null;
        }
    }

    /**
     * Récupérer l'utilisateur connecté depuis le localStorage
     */
    getUser() {
        const userStr = localStorage.getItem('client_user');
        return userStr ? JSON.parse(userStr) : null;
    }

    /**
     * Sauvegarder l'utilisateur dans le localStorage
     */
    setUser(user) {
        if (user) {
            localStorage.setItem('client_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('client_user');
        }
    }

    /**
     * Vérifier si l'utilisateur est connecté
     */
    isAuthenticated() {
        return !!this.token;
    }

    /**
     * Headers de base pour toutes les requêtes
     */
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    /**
     * Effectuer une requête HTTP
     */
    async request(method, endpoint, data = null, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            method,
            headers: this.getHeaders(options.auth !== false),
            ...options
        };

        if (data) {
            if (data instanceof FormData) {
                delete config.headers['Content-Type'];
                config.body = data;
            } else {
                config.body = JSON.stringify(data);
            }
        }

        try {
            const response = await fetch(url, config);
            const contentType = response.headers.get('content-type');

            let responseData;
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            if (!response.ok) {
                // Gestion des erreurs HTTP
                if (response.status === 401 && options.auth !== false) {
                    // Token expiré ou invalide (seulement pour les requêtes authentifiées)
                    this.setToken(null);
                    this.setUser(null);
                    // Redirection automatique vers la page de login
                    window.location.href = '/login';
                    throw new Error('Session expirée. Veuillez vous reconnecter.');
                }

                throw new Error(responseData.message || responseData.error || `Erreur HTTP ${response.status}`);
            }

            return responseData;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /**
     * Méthodes HTTP raccourcies
     */
    async get(endpoint, options = {}) {
        return this.request('GET', endpoint, null, options);
    }

    async post(endpoint, data, options = {}) {
        return this.request('POST', endpoint, data, options);
    }

    async put(endpoint, data, options = {}) {
        return this.request('PUT', endpoint, data, options);
    }

    async patch(endpoint, data, options = {}) {
        return this.request('PATCH', endpoint, data, options);
    }

    async delete(endpoint, options = {}) {
        return this.request('DELETE', endpoint, null, options);
    }

    /**
     * Upload de fichier
     */
    async uploadFile(endpoint, file, fieldName = 'file', additionalData = {}) {
        const formData = new FormData();
        formData.append(fieldName, file);

        // Ajouter les données supplémentaires
        Object.keys(additionalData).forEach((key) => {
            formData.append(key, additionalData[key]);
        });

        return this.request('POST', endpoint, formData);
    }
}

// Instance singleton
const api = new ApiService();

export default api;

import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL
});

api.interceptors.request.use(
    async config => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default api;
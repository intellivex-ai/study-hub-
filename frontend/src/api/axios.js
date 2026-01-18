import axios from 'axios';

const api = axios.create({
    baseURL: 'https://study-hub-backend-fjub.onrender.com',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;

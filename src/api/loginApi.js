import axios from 'axios';
import config from '../config/config';

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${config.backendUrl}/api/login`, {
            email,
            password,
        });

        return response.data;
    } catch (error) {
        console.error('Error en el login:', error.response?.data || error.message);
        throw error.response?.data || new Error('Error en la solicitud');
    }
};
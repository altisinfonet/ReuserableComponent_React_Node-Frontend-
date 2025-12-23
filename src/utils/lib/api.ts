import axios, { AxiosError, AxiosResponse } from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL, // e.g. https://api.example.com
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

/* -------------------------------------------
   REQUEST INTERCEPTOR
-------------------------------------------- */
axiosInstance.interceptors.request.use(
    (config) => {
        // If you later add token-based auth
        // const token = localStorage.getItem('access_token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }

        return config;
    },
    (error) => Promise.reject(error)
);

/* -------------------------------------------
   RESPONSE INTERCEPTOR
-------------------------------------------- */
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError<any>) => {
        const message =
            error.response?.data?.message ||
            error.message ||
            'Something went wrong';

        // Optional: central toast handling
        // _ERROR(message);

        return Promise.reject(error);
    }
);

export default axiosInstance;

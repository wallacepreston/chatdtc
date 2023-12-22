import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { useAuthHeader } from 'react-auth-kit';
import { REACT_APP_API_URL } from '../constants/api';
import { useStatus } from '../contexts/status';

interface Options {
    url: string;
    method: string;
    body?: any;
    exposeError?: boolean;
}

const useApi = () => {
    const authHeader = useAuthHeader();
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<Error | null>();
    const [loading, setLoading] = useState(false);
    const { setStatus } = useStatus();

    const apiRequest = useCallback(
        async ({ url, method, body = null }: Options) => {
            return axios({
                method,
                url: `${REACT_APP_API_URL}${url}`,
                data: body,
                headers: { Authorization: authHeader() }
            });
        },
        [authHeader]
    );

    const callApiLazy = useCallback(
        async ({ url, method, body = null, exposeError }: Options) => {
            setLoading(true);
            try {
                const res = await apiRequest({ url, method, body });
                setData(res.data);
            } catch (err: unknown) {
                if (err instanceof AxiosError) {
                    setError(err);
                    const errorMessage = err.response?.data.message || 'Something went wrong.';
                    if (exposeError) {
                        setStatus({ type: 'error', message: errorMessage });
                    }
                }
            }
            setLoading(false);
        },
        [apiRequest, setStatus]
    );

    const callApi = async ({ url, method, body = null, exposeError }: Options) => {
        setLoading(true);
        try {
            const res = await apiRequest({ url, method, body });
            return res.data;
        } catch (err: unknown) {
            if (err instanceof AxiosError) {
                const errorMessage = err.response?.data.message || 'Something went wrong.';
                if (exposeError) {
                    setStatus({ type: 'error', message: errorMessage });
                }
                setError(err);
            }
        }
        setLoading(false);
    };

    return { data, error, loading, callApi, callApiLazy };
};

export default useApi;

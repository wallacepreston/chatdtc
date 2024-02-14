import { useState, useCallback } from 'react';
import axios, { AxiosError, AxiosRequestConfig, ResponseType } from 'axios';
import { useAuthHeader } from 'react-auth-kit';
import { REACT_APP_API_URL } from '../constants/api';
import { useStatus } from '../contexts/status';

interface Options {
    url: string;
    method?: string;
    body?: any;
    exposeError?: boolean;
    responseType?: ResponseType;
}

const useApi = () => {
    const authHeader = useAuthHeader();
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<Error | null>();
    const [loading, setLoading] = useState(false);
    const { setStatus } = useStatus();

    const apiRequest = useCallback(
        async ({ url, method, body = null, responseType }: Options) => {
            const params: AxiosRequestConfig<any> = {
                method,
                url: `${REACT_APP_API_URL}${url}`,
                data: body,
                headers: { Authorization: authHeader() }
            };
            if (responseType) params.responseType = responseType;
            return axios(params);
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
                    const errorMessage =
                        err.response?.data.message || err.response?.data.error || 'Something went wrong.';
                    if (exposeError) {
                        setStatus({ type: 'error', message: errorMessage });
                    }
                }
            }
            setLoading(false);
        },
        [apiRequest, setStatus]
    );

    const callApi = async ({ url, method, body = null, exposeError, responseType }: Options) => {
        setLoading(true);
        try {
            const res = await apiRequest({ url, method, body, responseType });
            return res;
        } catch (err: unknown) {
            if (err instanceof AxiosError) {
                console.log('>>>>>>>>> err', err);
                console.log('>>>>>>>>> err.response.data', err.response?.data);

                const errorMessage = err.response?.data.message || err.response?.data.error || 'Something went wrong.';
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

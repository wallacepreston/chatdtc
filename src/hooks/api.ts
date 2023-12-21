import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuthHeader } from 'react-auth-kit';
import { REACT_APP_API_URL } from '../constants/api';

interface Options {
    url: string;
    method?: string;
    body?: any;
}

const useApi = () => {
    const authHeader = useAuthHeader();
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<Error | null>();
    const [loading, setLoading] = useState(false);

    const apiRequest = useCallback(
        async ({ url, method = 'get', body = null }: Options) => {
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
        async ({ url, method, body = null }: Options) => {
            setLoading(true);
            try {
                const res = await apiRequest({ url, method, body });
                setData(res.data);
            } catch (err: unknown) {
                if (err instanceof Error) setError(err);
            }
            setLoading(false);
        },
        [apiRequest]
    );

    const callApi = async ({ url, method, body = null }: Options) => {
        setLoading(true);
        try {
            const res = await apiRequest({ url, method, body });
            return res.data;
        } catch (err: unknown) {
            if (err instanceof Error) setError(err);
        }
        setLoading(false);
    };

    return { data, error, loading, callApi, callApiLazy };
};

export default useApi;

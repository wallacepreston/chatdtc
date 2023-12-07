import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuthHeader } from 'react-auth-kit';
import { REACT_APP_API_URL } from '../constants/api';

interface Options {
    url: string;
    method: string;
    body?: any;
}

const useApi = () => {
    const authHeader = useAuthHeader();
    const [data, setData] = useState(null);
    const [error, setError] = useState<Error | null>();
    const [loading, setLoading] = useState(false);

    const callApi = useCallback(
        async ({ url, method, body = null }: Options) => {
            setLoading(true);
            try {
                const res = await axios({
                    method,
                    url: `${REACT_APP_API_URL}${url}`,
                    data: body,
                    headers: { Authorization: authHeader() }
                });
                setData(res.data);
            } catch (err: unknown) {
                if (err instanceof Error) setError(err);
            }
            setLoading(false);
        },
        [authHeader]
    );

    return { data, error, loading, callApi };
};

export default useApi;

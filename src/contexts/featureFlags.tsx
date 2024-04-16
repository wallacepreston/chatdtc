import { ReactNode, useEffect, useState } from 'react';
import { createContext, useContext } from 'react';
import useApi from '../hooks/api';

export const FeatureFlagsContext = createContext<FeatureFlagsByName>({});

export function useFeatureFlags() {
    return useContext(FeatureFlagsContext);
}

interface ProviderProps {
    children: ReactNode;
}

interface FeatureFlagsByName {
    Max_User_Messages?: string;
    Validate_Prompt?: string;
}

export const FeatureFlagsProvider = ({ children }: ProviderProps) => {
    const { callApi } = useApi();
    const [featureFlags, setFeatureFlags] = useState<FeatureFlagsByName>({}); // default value

    useEffect(() => {
        const fetchFeatureFlags = async () => {
            try {
                const response = await callApi({
                    url: '/api/feature-flags',
                    method: 'get',
                    exposeError: true
                }); // replace with your API endpoint
                if (!response || !response.data) {
                    return;
                }
                setFeatureFlags(response.data);
            } catch (error) {
                console.error('Failed to fetch feature flags:', error);
            }
        };

        fetchFeatureFlags();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <FeatureFlagsContext.Provider value={featureFlags}>{children}</FeatureFlagsContext.Provider>;
};

import React from 'react';
import { useUser } from '../../contexts/user';
import NotificationItem from './notificationItem';
import useApi from '../../hooks/api';
import { useStatus } from '../../contexts/status';

function Notifications() {
    const { notifications, setNotifications } = useUser();
    const { setStatus } = useStatus();
    const { callApi } = useApi();

    const handleAcknowledge = async (id: number) => {
        try {
            const res = await callApi({
                url: `/api/notification/${id}`,
                method: 'post',
                body: { acknowledged: true },
                exposeError: true
            });

            if (!res) {
                return;
            }

            const { data } = res;
            if (!data || data.status !== 'success') {
                setStatus({
                    type: 'error',
                    message: 'Error acknowledging notification'
                });
                return;
            }

            const { notifications } = data;

            setNotifications(notifications);
        } catch (error) {
            setStatus({
                type: 'error',
                message: 'Error acknowledging notification'
            });
        }
    };

    return (
        <>
            {notifications.map((notification, i) => {
                return (
                    <NotificationItem
                        key={notification.id || i}
                        notification={notification}
                        handleAcknowledge={handleAcknowledge}
                    />
                );
            })}
        </>
    );
}

export default Notifications;

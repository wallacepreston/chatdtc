import React, { useState, useEffect } from 'react';
import SideBar from '../components/sidebar';
import Footer from '../components/footer';
import Center from '../components/center';
import Topper from '../components/topper';
import { CHAT_DTC_TITLE } from '../constants/api';
import { useUser } from '../contexts/user';

const MainPage = () => {
    const [footerHeight, setFooterHeight] = useState<number>(0);
    const [newInput, setNewInput] = useState<string>('');
    const [width, setWidth] = useState<number>(window.innerWidth);
    const { user } = useUser();

    const { balance } = user;
    const insufficientBalance = !balance || balance < 3;

    useEffect(() => {
        document.title = `New chat | ${CHAT_DTC_TITLE}`;
    }, []);

    const handleHeightChange = (height: number) => {
        setFooterHeight(height);
    };

    useEffect(() => {
        const updateWidth = () => {
            setWidth(window.innerWidth);
        };

        window.addEventListener('resize', updateWidth);

        return () => window.removeEventListener('resize', updateWidth);
    }, [width]);

    const setInput = (input: string) => {
        setNewInput(input);
        setTimeout(() => setNewInput(''), 1);
    };

    const handleWidth = () => {
        if (width > 1000) {
            return '260px';
        } else {
            return '0px';
        }
    };

    const handleMainWidth = () => {
        if (width > 1000) {
            return 'calc(100vw - 260px)';
        } else {
            return '100vw';
        }
    };

    return (
        <div id='main' style={{ width: handleMainWidth(), height: '100vh', display: 'flex', justifyContent: 'center' }}>
            {width < 1000 && <Topper chatTitle='New chat' />}
            <Center setInput={setInput} footerHeight={footerHeight} />
            <Footer
                setHeight={handleHeightChange}
                newInput={newInput}
                openModal={() => {}}
                isOverMaxMessages={false}
                insufficientBalance={insufficientBalance}
                type='form'
            />
        </div>
    );
};

export default MainPage;

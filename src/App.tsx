import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, RequireAuth } from 'react-auth-kit';
import AuthPage from './pages/AuthPage';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import ChatPage from './pages/ChatPage';
import SharePage from './pages/SharePage';
import NotFoundPage from './pages/NotFoundPage';
import { ThinkingProvider } from './contexts/thinking';
import { StatusProvider } from './contexts/status';
import Status from './components/status';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import SelectWineryModal from './components/selectWineryModal';
import { UserProvider } from './contexts/user';
import { ChatProvider } from './contexts/chat';

const App = () => {
    return (
        <div id='App'>
            <ThemeProvider theme={theme}>
                <StatusProvider>
                    <ThinkingProvider>
                        <AuthProvider
                            authType='cookie'
                            authName='auth'
                            cookieDomain={window.location.hostname}
                            cookieSecure={false}
                        >
                            <UserProvider>
                                <ChatProvider>
                                    <Status />
                                    <Router>
                                        <SelectWineryModal />
                                        <Routes>
                                            <Route
                                                path='/'
                                                element={
                                                    <RequireAuth loginPath='/auth'>
                                                        <MainPage />
                                                    </RequireAuth>
                                                }
                                            />
                                            <Route
                                                path='/c/:id'
                                                element={
                                                    <RequireAuth loginPath='/auth'>
                                                        <ChatPage />
                                                    </RequireAuth>
                                                }
                                            />
                                            <Route path='/share/:id' element={<SharePage />} />
                                            <Route path='/auth' element={<AuthPage />} />
                                            <Route path='/auth/login' element={<LoginPage />} />
                                            <Route path='*' element={<NotFoundPage />} />
                                        </Routes>
                                    </Router>
                                </ChatProvider>
                            </UserProvider>
                        </AuthProvider>
                    </ThinkingProvider>
                </StatusProvider>
            </ThemeProvider>
        </div>
    );
};

export default App;

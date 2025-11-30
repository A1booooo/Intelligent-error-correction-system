import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import MainLayout from '@/components/layout/MainLayout';
import Sidebar from '@/components/layout/Sidebar';

export default function Main() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const token = localStorage.getItem('access-token');

  // 未认证且不在登录页时重定向
  useEffect(() => {
    async function isLogin() {
      if (
        !token &&
        !pathname.includes('/login') &&
        !pathname.includes('/signup') &&
        !pathname.includes('/forgot-password')
      ) {
        navigate('/login');
      }
    }
    isLogin();
  }, [pathname, navigate]);
  return (
    <>
      <Sidebar>
        <MainLayout />
      </Sidebar>
    </>
  );
}

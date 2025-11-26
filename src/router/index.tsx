import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '@/components/layout/MainLayout';
import MainPage from '@/pages/Main';
import HomePage from '@/features/Home/Home';
import UploadQuestionPage from '@/features/UploadQuestion/UploadQuestion';
import QuestionDetailPage from '@/features/UploadQuestion/QuestionDetail';
import MyQuestionPage from '@/features/MyQuestion/MyQuestion';
import ForgotPasswordPage from '../auth/ForgotPassword/ForgotPassword';
import SignupPage from '@/auth/Signup/Signup';
import LoginPage from '@/auth/Login/Login';

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 认证路由 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        {/* 主应用路由 */}
        <Route path="/" element={<MainLayout />}>
          <Route path="" element={<Navigate to="/home" />} />
          <Route path="" element={<MainPage />}>
            <Route path="home" element={<HomePage />} />
            <Route path="upload-question">
              <Route path="" element={<UploadQuestionPage />} />
              <Route path="question-detail" element={<QuestionDetailPage />} />
            </Route>
            <Route path="my-question" element={<MyQuestionPage />} />
            <Route
              path="knowledge-base"
              /* element={ TODO: KnowledgeBasePage } */
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default Router;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '@/components/layout/MainLayout';
import MainPage from '@/pages/Main';
import HomePage from '@/features/Home/Home';
import UploadQuestionPage from '@/features/UploadQuestion/UploadQuestion';
import QuestionDetailPage from '@/features/UploadQuestion/QuestionDetail';

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route path="" element={<Navigate to="/home" />} />
          <Route path="" element={<MainPage />}>
            <Route path="home" element={<HomePage />} />
            <Route path="upload-question">
              <Route path="" element={<UploadQuestionPage />} />
              <Route path="question-detail" element={<QuestionDetailPage />} />
            </Route>
            <Route
              path="my-question"
              /* element={ TODO: MyQuestionPage } */
            />
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

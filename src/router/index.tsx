import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '@/components/layout/MainLayout';
import MainPage from '@/pages/Main';
import HomePage from '@/features/Home/Home';
import AiExplainPage from "@/pages/AiExplainPage/AiExplainPage"; 
import PracticePage from "@/pages/practice/PracticePage";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route path="" element={<Navigate to="/home" />} />
          <Route path="" element={<MainPage />}>
            <Route path="home" element={<HomePage />} />
            <Route
              path="upload-question"
              /*element={ TODO: UploadQuestionPage } */
            />
            <Route
              path="my-question"
              /* element={ TODO: MyQuestionPage } */
            />
            <Route
              path="knowledge-base"
              /* element={ TODO: KnowledgeBasePage } */
            />
            <Route path="ai-explain" element={<AiExplainPage />} />
            <Route path="practice" element={<PracticePage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "@/components/layout/MainLayout";
import HomePage from "@/pages/home/HomePage";
import UploadPage from "@/pages/upload/UploadPage";
import MyMistakesPage from "@/pages/my-mistakes/MyMistakesPage";
import KnowledgeBasePage from "@/pages/knowledge-base/KnowledgeBasePage";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route path="" element={<Navigate to="/home" />} />
          <Route path="home" element={<HomePage />}>
            <Route path="upload" element={<UploadPage />} />
            <Route path="my-mistakes" element={<MyMistakesPage />} />
            <Route path="knowledge-base" element={<KnowledgeBasePage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>)
}

export default Router
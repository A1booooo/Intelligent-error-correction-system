import request from '../../utils/request';
import { ExtractFirstResponse, knowledgeResponse } from './type';

export async function extractFirst(file: File, fileType: string) {
  const formData = new FormData();
  formData.append('file', file);

  return request.post<ExtractFirstResponse>({
    url: 'api/v1/ocr/extract-first',
    data: formData,
    params: { fileType },
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function getKnowledge(questionId: string) {
  return request.get<knowledgeResponse>({
    url: `/api/question/${questionId}/knowledge`,
  });
}

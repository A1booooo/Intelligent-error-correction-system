import request from '../../utils/request';
import { ExtractFirstResponse } from './type';

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

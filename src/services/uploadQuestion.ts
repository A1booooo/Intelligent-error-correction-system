import request from '../utils/http';

export async function extractFirst(file: File, fileType: string) {
  const formData = new FormData();
  formData.append('file', file);

  return request.post('api/v1/ocr/extract-first', formData, {
    params: { fileType },
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

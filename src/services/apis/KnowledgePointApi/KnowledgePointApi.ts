import request from '@/utils/request';
import {
  KnowledgePointNode,
  KnowledgeTooltip,
  // QuestionItem,
  RelatedData,
  AddSonPointParams,
  KnowledgeDefinition,
  KnowledgeStatistic,
} from './type';
const API_VERSION = 'v1';


//  1. 获取根知识点

export const fetchRootPoints = (params: { subject: string }) => {
  return request.get<KnowledgePointNode[]>({
    url: `/api/${API_VERSION}/keypoints_explanation/get_key_points`,
    params,
  });
};

//  2. 获取子知识点

export const fetchChildPoints = (knowledgeId: number | string) => {
  return request.get<KnowledgePointNode[]>({
    url: `/api/${API_VERSION}/keypoints_explanation/get_son_key_points`,
    params: { knowledgeId },
  }).then(res => {
    return res;
  });
};

// 3. 获取定义

export const fetchDefinition = (knowledgeId: number | string) => {
  return request.get<KnowledgeDefinition>({
    url: `/api/${API_VERSION}/keypoints_explanation/${knowledgeId}`,
  });
};

//  4. 获取统计数据

export const fetchStatistic = (knowledgeId: number | string) => {
  return request.get<KnowledgeStatistic | string>({
    url: `/api/${API_VERSION}/keypoints_explanation/${knowledgeId}/related-questions-statistic`,
  });
};

//  5. 获取相关知识点

export const fetchRelatedPoints = (knowledgeId: number | string) => {
  return request.get<KnowledgePointNode[]>({
    url: `/api/${API_VERSION}/keypoints_explanation/${knowledgeId}/related-points`,
  });
};

//  6. 获取相关错题或笔记

export const fetchRelatedQuestionsOrNote = (knowledgeId: number | string) => {
  return request.get<RelatedData>({
    url: `/api/${API_VERSION}/keypoints_explanation/${knowledgeId}/related-questions`,
  }).then(res => {
    // 处理note字段，可能是JSON字符串
    if (res.code === 200 && res.data && res.data.note) {
      try {
        // 如果note是转义的JSON字符串，尝试解析
        const noteStr = res.data.note;
        if (noteStr.startsWith('"') && noteStr.endsWith('"')) {
          const parsed = JSON.parse(noteStr);
          res.data.note = parsed === '' ? null : parsed;
        } else if (noteStr === '""') {
          res.data.note = null;
        }
      } catch (e) {
        // 解析失败，保持原值
        console.warn('解析note字段失败:', e);
      }
    }
    return res;
  });
};

//  7. 获取提示信息

export const fetchTooltip = (knowledgeId: number | string) => {
  return request.get<KnowledgeTooltip>({
    url: `/api/${API_VERSION}/keypoints_explanation/${knowledgeId}/show-tooltip`,
  });
};

//  8. 标记为已掌握

export const markAsMastered = (knowledgeId: number | string) => {
  return request.post<void>({
    url: `/api/${API_VERSION}/keypoints_explanation/${knowledgeId}/mark-as-mastered`,
  });
};

//  9. 保存或更新笔记

export const saveNote = (knowledgeId: number | string, content: string) => {
  return request.post<void>({
    url: `/api/${API_VERSION}/keypoints_explanation/${knowledgeId}/notes`,
    data: content,
    headers: { 'Content-Type': 'text/plain' },
  });
};

//  10. 重命名知识点

export const renamePoint = (knowledgeId: number | string, newName: string) => {
  return request.post<void>({
    url: `/api/${API_VERSION}/keypoints_explanation/${knowledgeId}/rename`,
    data: newName,
    headers: { 'Content-Type': 'text/plain' },
  });
};

//  11. 添加子知识点

export const addSonPoint = (parentId: number | string, data: AddSonPointParams) => {

  return request.post<void>({
    url: `/api/${API_VERSION}/keypoints_explanation/${parentId}/add-son-point`,
    data,
  }).then(res => {
    return res;
  });
};

//  12. 删除知识点

export const deletePoint = (knowledgeId: number | string) => {
  return request.delete<void>({
    url: `/api/${API_VERSION}/keypoints_explanation/${knowledgeId}/delete`,
  });
};

export default {
  fetchRootPoints,
  fetchChildPoints,
  fetchDefinition,
  fetchStatistic,
  fetchRelatedPoints,
  fetchRelatedQuestionsOrNote,
  fetchTooltip,
  markAsMastered,
  saveNote,
  renamePoint,
  addSonPoint,
  deletePoint,
};

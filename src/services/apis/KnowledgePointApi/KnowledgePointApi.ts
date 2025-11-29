import request from '@/utils/request';
import {KnowledgePointNode,
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

export const fetchChildPoints = (knowledgeId: number) => {
  return request.get<KnowledgePointNode[]>({
    url: `/api/${API_VERSION}/keypoints_explanation/get_son_key_points`,
    params: { knowledgeId },
  });
};

// 3. 获取定义

export const fetchDefinition = (knowledgeId: number) => {
  return request.get<KnowledgeDefinition>({
    url: `/api/${API_VERSION}/keypoints_explanation/${knowledgeId}`,
  });
};

//  4. 获取统计数据

export const fetchStatistic = (knowledgeId: number) => {
  return request.get<KnowledgeStatistic>({
    url: `/api/${API_VERSION}/keypoints_explanation/${knowledgeId}/related-questions-statistic`,
  });
};

//  5. 获取相关知识点

export const fetchRelatedPoints = (knowledgeId: number) => {
  return request.get<KnowledgePointNode[]>({
    url: `/api/${API_VERSION}/keypoints_explanation/${knowledgeId}/related-points`,
  });
};

//  6. 获取相关错题或笔记 

export const fetchRelatedQuestionsOrNote = (knowledgeId: number) => {
  return request.get<RelatedData>({
    url: `/api/${API_VERSION}/keypoints_explanation/${knowledgeId}/related-questions`,
  });
};

//  7. 获取提示信息

export const fetchTooltip = (knowledgeId: number) => {
  return request.get<KnowledgeTooltip>({
    url: `/api/${API_VERSION}/keypoints_explanation/${knowledgeId}/show-tooltip`,
  });
};

//  8. 标记为已掌握

export const markAsMastered = (knowledgeId: number) => {
  return request.post<void>({
    url: `/api/${API_VERSION}/keypoints_explanation/${knowledgeId}/mark-as-mastered`,
  });
};

//  9. 保存或更新笔记

export const saveNote = (knowledgeId: number, content: string) => {
  return request.post<void>({
    url: `/api/${API_VERSION}/keypoints_explanation/${knowledgeId}/notes`,
    data: content,
    headers: { 'Content-Type': 'application/json' },
  });
};

//  10. 重命名知识点

export const renamePoint = (knowledgeId: number, newName: string) => {
  return request.post<void>({
    url: `/api/${API_VERSION}/keypoints_explanation/${knowledgeId}/rename`,
    data: newName,
    headers: { 'Content-Type': 'application/json' },
  });
};

//  11. 添加子知识点

export const addSonPoint = (parentId: number, data: AddSonPointParams) => {
  return request.post<void>({
    url: `/api/${API_VERSION}/keypoints_explanation/${parentId}/add-son-point`,
    data,
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
};
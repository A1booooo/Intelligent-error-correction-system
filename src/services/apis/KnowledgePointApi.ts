import request from '@/utils/request';

const API_VERSION = 'v1';

export interface KnowledgePointNode {
  id: number;
  keyPoints: string;
  hasChildren?: boolean;
}

export interface KnowledgeTooltip {
  degreeOfProficiency: number;
  count: number;
  lastReviewTime: string;
}

export interface QuestionItem {
  id: number;
  content: string;
}

export interface RelatedData {
  questions: QuestionItem[];
  note: string | null;
}

export interface AddSonPointParams {
  pointName: string;
  pointDesc?: string;
  sonPoints?: AddSonPointParams[];
}

export interface KnowledgeDefinition {
  content?: string;
  isMastered?: boolean;
  [key: string]: unknown;
}

export interface KnowledgeStatistic {
  totalCount?: number;
  wrongCount?: number;
  solvedCount?: number;
  [key: string]: number | undefined;
}

export const knowledgeApi = {
  fetchRootPoints: (params: { subject: string }) => {
    return request.get<KnowledgePointNode[]>({
      url: `/api/${API_VERSION}/keypoints_explanation/get_key_points`,
      params,
    });
  },

  fetchChildPoints: (knowledgeId: number) => {
    return request.get<KnowledgePointNode[]>({
      url: `/api/${API_VERSION}/keypoints_explanation/get_son_key_points`,
      params: { knowledgeId },
    });
  },

  fetchDefinition: (knowledgeId: number) => {
    return request.get<KnowledgeDefinition>({
      url: `/api/${API_VERSION}/keypoints_explanation/${knowledgeId}`,
    });
  },

  fetchStatistic: (knowledgeId: number) => {
    return request.get<KnowledgeStatistic>({
      url: `/api/${API_VERSION}/keypoints_explanation/${knowledgeId}/related-questions-statistic`,
    });
  },

  fetchRelatedPoints: (knowledgeId: number) => {
    return request.get<KnowledgePointNode[]>({
      url: `/api/${API_VERSION}/keypoints_explanation/${knowledgeId}/related-points`,
    });
  },

  /**
   * 6. 获取相关错题或笔记 (聚合接口)
   */
  fetchRelatedQuestionsOrNote: (knowledgeId: number) => {
    return request.get<RelatedData>({
      url: `/api/${API_VERSION}/keypoints_explanation/${knowledgeId}/related-questions`,
    });
  },

  fetchTooltip: (knowledgeId: number) => {
    return request.get<KnowledgeTooltip>({
      url: `/api/${API_VERSION}/keypoints_explanation/${knowledgeId}/show-tooltip`,
    });
  },

  markAsMastered: (knowledgeId: number) => {
    return request.post<void>({
      url: `/api/${API_VERSION}/keypoints_explanation/${knowledgeId}/mark-as-mastered`,
    });
  },

  /**
   * 9. 保存或更新笔记
   */
  saveNote: (knowledgeId: number, content: string) => {
    return request.post<void>({
      url: `/api/${API_VERSION}/keypoints_explanation/${knowledgeId}/notes`,
      data: content,
      headers: { 'Content-Type': 'text/plain' },
    });
  },

  renamePoint: (knowledgeId: number, newName: string) => {
    return request.post<void>({
      url: `/api/${API_VERSION}/keypoints_explanation/${knowledgeId}/rename`,
      data: newName,
      headers: { 'Content-Type': 'text/plain' },
    });
  },

  addSonPoint: (parentId: number, data: AddSonPointParams) => {
    return request.post<void>({
      url: `/api/${API_VERSION}/keypoints_explanation/${parentId}/add-son-point`,
      data,
    });
  },
};

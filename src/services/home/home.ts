import request from '../../utils/request';
import {
  KeyPointResponse,
  OverdueResponse,
  OverviewResponse,
  StudyDynamicResponse,
  TrickyKnowledgeResponse,
} from '../../services/home/type';

export async function GetOverview(): Promise<OverviewResponse> {
  const res = await request.get<OverviewResponse>({
    url: '/api/v1/overview/get_overview',
  });
  return res;
}

export async function GetOverDue() {
  const res = await request.get<OverdueResponse>({
    url: '/api/v1/feedback/review/overdue-count',
  });
  return res;
}

export async function GetTrickyKnowledge() {
  const res = await request.get<TrickyKnowledgeResponse>({
    url: '/api/v1/feedback/review/tricky_knowledge',
  });
  return res;
}

export async function GetKeyPoint() {
  const res = await request.get<KeyPointResponse>({
    url: '/api/v1/ai_suggession/get_key_point',
  });
  return res;
}

export async function GetStudyDynamic() {
  const res = await request.get<StudyDynamicResponse>({
    url: '/api/v1/overview/get_study_dynamic',
  });
  return res;
}

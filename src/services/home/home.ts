import request from '../../utils/request';
import { OverviewResponse } from '../../services/home/type';

export async function GetOverview(): Promise<OverviewResponse> {
  const res = await request.get<OverviewResponse>({
    url: '/api/v1/overview/get_overview',
  });
  return res;
}

export async function GetOverDue(): Promise<object> {
  const res = await request.get<object>({
    url: '/api/v1/feedback/review/overdue-count',
  });
  return res;
}

export async function GetTrickyKnowledge(): Promise<object> {
  const res = await request.get<object>({
    url: '/api/v1/feedback/review/tricky_knowledge',
  });
  return res;
}

export async function GetKeyPoint(): Promise<object> {
  const res = await request.get<object>({
    url: '/api/v1/ai_suggession/get_key_point',
  });
  return res;
}

export async function GetStudyDynamic(): Promise<object> {
  const res = await request.get<object>({
    url: '/api/v1/overview/get_study_dynamic',
  });
  return res;
}

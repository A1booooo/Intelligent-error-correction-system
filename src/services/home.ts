import request from '../utils/http';
import { OverviewResponse } from './type';

export function GetOverview(): Promise<OverviewResponse> {
  return request.get('/api/v1/overview/get_overview');
}

export function GetOverDue(): Promise<object> {
  return request.get('/api/v1/feedback/review/overdue-count');
}

export function GetTrickyKnowledge(): Promise<object> {
  return request.get('/api/v1/feedback/review/tricky_knowledge');
}

export function GetKeyPoint(): Promise<object> {
  return request.get('/api/v1/ai_suggession/get_key_point');
}

export function GetStudyDynamic(): Promise<object> {
  return request.get('/api/v1/overview/get_study_dynamic');
}

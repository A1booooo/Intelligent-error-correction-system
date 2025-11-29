import request from '../../utils/request';
import { ToggleErrorReasonData, UpdateOtherReasonData } from './type';

export function toggleErrorReason(data: ToggleErrorReasonData) {
  return request.post({ url: '/api/v1/mistake-reason/toggle', data });
}

export function updateOtherReason(data: UpdateOtherReasonData) {
  return request.post({
    url: '/api/v1/mistake-reason/update-other-reason',
    data,
  });
}

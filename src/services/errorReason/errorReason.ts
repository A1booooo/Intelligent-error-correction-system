import request from '../../utils/request';
import {
  ToggleErrorReasonData,
  UpdateOtherReasonData,
  SubmitStudyNoteData,
} from './type';

export function toggleErrorReason(data: ToggleErrorReasonData) {
  return request.post({ url: '/api/v1/mistake-reason/toggle', data });
}

export function updateOtherReason(data: UpdateOtherReasonData) {
  return request.post({
    url: '/api/v1/mistake-reason/update-other-reason',
    data,
  });
}

export function submitStudyNote(data: SubmitStudyNoteData) {
  return request.post({
    url: '/api/v1/mistake-reason/study-note/submit',
    data,
  });
}

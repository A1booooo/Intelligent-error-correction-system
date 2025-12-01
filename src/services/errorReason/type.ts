export interface ToggleErrorReasonData {
  questionId: string;
  reasonName: string;
}

export interface UpdateOtherReasonData {
  questionId: string;
  otherReasonText: string;
}

export interface SubmitStudyNoteData {
  questionId: string;
  studyNote: string;
}

export interface UserResponse {
  traceId: string;
  code: number;
  info: string;
  data: {
    userId: string;
    userName: string;
    accessToken: string;
    refreshToken: string;
  };
}

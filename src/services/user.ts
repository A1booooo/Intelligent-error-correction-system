import request from '../utils/http';

export function Login(data: object) {
  return request.post('/api/userAccount/login', data);
}

export function Signup(data: { userAccount: string; userPassword: string }) {
  return request.post('/api/userAccount/register', data);
}

export function SendCode(userAccount: string) {
  return request.post('/api/userAccount/sendEmailCode', {
    params: { userAccount },
  });
}

export function Logout() {
  return request.post('/api/userAccount/logout');
}

export function ResetPassword(data: {
  userAccount: string;
  newPassword: string;
  checkCode: string;
}) {
  return request.post('/api/userAccount/resetPassword', data);
}

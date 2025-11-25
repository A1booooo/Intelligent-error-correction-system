import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    verificationCode: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [countdown, setCountdown] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);

  const handleSendCode = async () => {
    if (!formData.email) {
      setErrors({ ...errors, email: '请输入邮箱地址' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrors({ ...errors, email: '请输入有效的邮箱地址' });
      return;
    }

    setIsSendingCode(true);
    setTimeout(() => {
      setIsSendingCode(false);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    if (errors[id]) {
      setErrors({ ...errors, [id]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstname.trim()) {
      newErrors.firstname = '请输入名字';
    }
    if (!formData.lastname.trim()) {
      newErrors.lastname = '请输入姓氏';
    }
    if (!formData.email) {
      newErrors.email = '请输入邮箱地址';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = '请输入有效的邮箱地址';
      }
    }
    if (!formData.verificationCode) {
      newErrors.verificationCode = '请输入验证码';
    } else if (formData.verificationCode.length !== 6) {
      newErrors.verificationCode = '验证码应为6位数字';
    }
    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < 8) {
      newErrors.password = '密码长度至少为8个字符';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('注册信息:', formData);
    }
  };

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">创建账户</h1>
          <p className="text-muted-foreground text-sm text-balance">
            填写以下信息以创建您的账户
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">邮箱</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="example@email.com"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <FieldDescription className="text-red-500 text-xs">
              {errors.email}
            </FieldDescription>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="verificationCode">验证码</FieldLabel>
          <div className="flex gap-2">
            <Input
              id="verificationCode"
              type="text"
              placeholder="请输入6位验证码"
              maxLength={6}
              value={formData.verificationCode}
              onChange={handleChange}
              className={errors.verificationCode ? 'border-red-500' : ''}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleSendCode}
              disabled={countdown > 0 || isSendingCode}
              className="whitespace-nowrap min-w-[100px]"
            >
              {isSendingCode
                ? '发送中...'
                : countdown > 0
                  ? `${countdown}秒后重试`
                  : '发送验证码'}
            </Button>
          </div>
          {errors.verificationCode && (
            <FieldDescription className="text-red-500 text-xs">
              {errors.verificationCode}
            </FieldDescription>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="password">密码</FieldLabel>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? 'border-red-500' : ''}
          />
          {errors.password ? (
            <FieldDescription className="text-red-500 text-xs">
              {errors.password}
            </FieldDescription>
          ) : (
            <FieldDescription>密码长度至少为8个字符</FieldDescription>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="confirmPassword">确认密码</FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={errors.confirmPassword ? 'border-red-500' : ''}
          />
          {errors.confirmPassword && (
            <FieldDescription className="text-red-500 text-xs">
              {errors.confirmPassword}
            </FieldDescription>
          )}
        </Field>
        <Field>
          <Button type="submit" className="w-full">
            创建账户
          </Button>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            已有账户？{' '}
            <Link
              to="/login"
              className="underline underline-offset-4 hover:text-foreground"
            >
              立即登录
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}

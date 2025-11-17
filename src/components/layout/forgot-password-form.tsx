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
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const [step, setStep] = useState<'email' | 'reset' | 'success'>('email');
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    newPassword: '',
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
    // 清除对应字段的错误
    if (errors[id]) {
      setErrors({ ...errors, [id]: '' });
    }
  };

  const validateEmailStep = () => {
    const newErrors: Record<string, string> = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetStep = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.newPassword) {
      newErrors.newPassword = '请输入新密码';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = '密码长度至少为8个字符';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmailStep()) {
      setStep('reset');
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateResetStep()) {
      console.log('密码重置成功:', formData);
      setStep('success');
    }
  };

  if (step === 'email') {
    return (
      <form
        className={cn('flex flex-col gap-6', className)}
        onSubmit={handleEmailStepSubmit}
        {...props}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">忘记密码？</h1>
            <p className="text-muted-foreground text-sm text-balance">
              输入您的邮箱地址，我们将发送验证码以重置密码
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
                    ? `${countdown}秒`
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
            <Button type="submit" className="w-full">
              下一步
            </Button>
          </Field>
          <Field>
            <FieldDescription className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-foreground"
              >
                <ArrowLeft className="size-3" />
                返回登录
              </Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    );
  }

  if (step === 'reset') {
    return (
      <form
        className={cn('flex flex-col gap-6', className)}
        onSubmit={handleResetSubmit}
        {...props}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">重置密码</h1>
            <p className="text-muted-foreground text-sm text-balance">
              请输入您的新密码
            </p>
          </div>
          <Field>
            <FieldLabel htmlFor="newPassword">新密码</FieldLabel>
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              className={errors.newPassword ? 'border-red-500' : ''}
            />
            {errors.newPassword ? (
              <FieldDescription className="text-red-500 text-xs">
                {errors.newPassword}
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
              重置密码
            </Button>
          </Field>
          <Field>
            <FieldDescription className="text-center">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-foreground"
              >
                <ArrowLeft className="size-3" />
                返回上一步
              </button>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    );
  }

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle2 className="size-8 text-green-600" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">密码重置成功！</h1>
            <p className="text-muted-foreground text-sm text-balance">
              您的密码已成功重置，现在可以使用新密码登录了
            </p>
          </div>
        </div>
        <Field>
          <Link to="/login" className="w-full">
            <Button type="button" className="w-full">
              返回登录
            </Button>
          </Link>
        </Field>
      </FieldGroup>
    </div>
  );
}

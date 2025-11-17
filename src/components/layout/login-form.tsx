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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  return (
    <form className={cn('flex flex-col gap-6', className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">登录您的账户</h1>
          <p className="text-muted-foreground text-sm text-balance">
            输入您的邮箱和密码进行登录
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">邮箱</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="example@email.com"
            required
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">密码</FieldLabel>
            <Link
              to="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              忘记密码？
            </Link>
          </div>
          <Input id="password" type="password" required />
        </Field>
        <Field>
          <Button type="submit" className="w-full">
            登录
          </Button>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            还没有账户？{' '}
            <Link
              to="/signup"
              className="underline underline-offset-4 hover:text-foreground"
            >
              立即注册
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}

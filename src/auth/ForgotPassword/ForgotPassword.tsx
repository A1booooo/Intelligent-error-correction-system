import { BrainCog } from 'lucide-react';
import { ForgotPasswordForm } from '@/components/layout/forgot-password-form';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  return (
    <div className="grid min-h-svh">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <BrainCog className="size-4" />
            </div>
            智能纠错系统
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center translate-y-[-50px]">
          <div className="w-full max-w-xs">
            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}

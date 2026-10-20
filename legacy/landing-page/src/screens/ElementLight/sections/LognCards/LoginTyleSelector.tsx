import React from 'react';
import { useNavigate } from 'react-router-dom';

// Simple utility function to replace cn
const cn = (...classes: (string | undefined | null | false)[]): string => 
  classes.filter(Boolean).join(' ');

// Types
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm';
}

// Card Components
function Card({ className, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: CardProps) {
  return (
    <div
      data-slot="card-header"
      className={cn("px-6 py-4", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: CardProps) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-xl font-medium text-gray-900", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: CardProps) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-gray-500 text-sm mt-1", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: CardProps) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 pb-6", className)}
      {...props}
    />
  );
}

// Button Component
function Button({ className, variant = "default", size = "default", ...props }: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    default: "bg-black text-white hover:bg-gray-800",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
    outline: "border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50",
  };
  
  const sizes = {
    default: "h-10 px-4 text-sm rounded-lg",
    sm: "h-8 px-3 text-xs rounded-md",
  };

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

// Main Component
function LoginTypeSelector() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="p-2 -ml-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <div className="text-right">
              <CardTitle>Company Portal</CardTitle>
              <CardDescription>
                Sign in to access your company dashboard
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/contributor-login')}
              className="w-full justify-between group"
            >
              <span>Continue as Contributor</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
            
            <Button
              onClick={() => navigate('/company-login')}
              className="w-full justify-between group bg-green-500 hover:bg-green-600 text-white"
            >
              <span>Continue as Buyer</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
            
            <Button
              onClick={() => navigate('/admin-login')}
              variant="outline"
              className="w-full justify-between group"
            >
              <span>Continue as Admin</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Secure authentication powered by NCCR
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginTypeSelector;
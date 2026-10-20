import React, { useState } from 'react';
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
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

interface ContributorLoginProps {
  onBack: () => void;
}

interface ContributorFormData {
  email: string;
  password: string;
  rememberMe: boolean;
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
      className={cn("text-lg font-medium text-gray-900", className)}
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
      className={cn("px-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: CardProps) {
  return (
    <div
      data-slot="card-footer"
      className={cn("px-6 pb-6 pt-4", className)}
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

// Input Component
function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full h-10 px-3 text-sm bg-white border border-gray-200 rounded-lg transition-colors focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 placeholder:text-gray-400",
        className
      )}
      {...props}
    />
  );
}

// Label Component  
function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "text-sm font-medium text-gray-700 mb-1.5 block",
        className
      )}
      {...props}
    />
  );
}

// Navigation Tabs Component
function NavigationTabs({ current }: { current: 'contributor' | 'company' | 'admin' }) {
  const navigate = useNavigate();
  
  const tabs = [
    { id: 'contributor', label: 'Contributor', path: '/contributor-login' },
    { id: 'company', label: 'Company', path: '/company-login' },
    { id: 'admin', label: 'Admin', path: '/admin-login' }
  ];

  return (
    <div className="flex bg-gray-50 rounded-lg p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => navigate(tab.path)}
          className={cn(
            "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
            current === tab.id 
              ? "bg-white text-gray-900 shadow-sm" 
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// Main Component
function ContributorLogin({ onBack }: ContributorLoginProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ContributorFormData>({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('Contributor login:', formData);
    alert('Contributor login submitted!');
  };

  const handleInputChange = (field: keyof Omit<ContributorFormData, 'rememberMe'>) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, rememberMe: e.target.checked }));
  };

  // Override onBack to navigate to login type selector
  const handleBack = () => {
    navigate('/login-type-selector');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        {/* Navigation at top */}
        <div className="p-4 pb-0">
          <NavigationTabs current="contributor" />
        </div>
        
        <CardHeader>
          <div className="flex items-start justify-between">
            <Button variant="ghost" size="sm" onClick={handleBack} className="p-2 -ml-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <div className="text-right">
              <CardTitle>Welcome back</CardTitle>
              <CardDescription>
                Sign in to your contributor account
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="contributor-email">Email address</Label>
              <Input
                id="contributor-email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="contributor-password" className="mb-0">Password</Label>
                <button
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    alert('Forgot password clicked!');
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <Input 
                id="contributor-password" 
                type="password" 
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange('password')}
                required 
              />
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="remember-contributor" 
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                checked={formData.rememberMe}
                onChange={handleCheckboxChange}
              />
              <Label htmlFor="remember-contributor" className="text-sm mb-0">Remember me</Label>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <div className="w-full space-y-3">
            <Button onClick={handleSubmit} className="w-full bg-green-500 hover:bg-green-600 text-white">
              Sign in
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => alert('Google login clicked!')}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            <p className="text-center text-sm text-gray-500">
              New to NCCR?{' '}
              <button 
                className="text-green-600 hover:text-green-700 font-medium"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  alert('Register clicked!');
                }}
              >
                Create account
              </button>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default ContributorLogin;
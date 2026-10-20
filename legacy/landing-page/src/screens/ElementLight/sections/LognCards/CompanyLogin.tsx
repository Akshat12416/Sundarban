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

interface CompanyLoginProps {
  onBack: () => void;
}

interface CompanyFormData {
  companyId: string;
  companyEmail: string;
  password: string;
  keepSignedIn: boolean;
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
function CompanyLogin({ onBack }: CompanyLoginProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CompanyFormData>({
    companyId: '',
    companyEmail: '',
    password: '',
    keepSignedIn: false
  });

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('Company login:', formData);
    alert('Company login submitted!');
  };

  const handleInputChange = (field: keyof Omit<CompanyFormData, 'keepSignedIn'>) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, keepSignedIn: e.target.checked }));
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
          <NavigationTabs current="company" />
        </div>
        
        <CardHeader>
          <div className="flex items-start justify-between">
            <Button variant="ghost" size="sm" onClick={handleBack} className="p-2 -ml-2">
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
          <div className="space-y-4">
            <div>
              <Label htmlFor="company-id">Company ID</Label>
              <Input
                id="company-id"
                type="text"
                placeholder="Enter your company ID"
                value={formData.companyId}
                onChange={handleInputChange('companyId')}
                required
              />
            </div>

            <div>
              <Label htmlFor="company-email">Company Email</Label>
              <Input
                id="company-email"
                type="email"
                placeholder="company@example.com"
                value={formData.companyEmail}
                onChange={handleInputChange('companyEmail')}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="company-password" className="mb-0">Password</Label>
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
                id="company-password" 
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
                id="remember-company" 
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                checked={formData.keepSignedIn}
                onChange={handleCheckboxChange}
              />
              <Label htmlFor="remember-company" className="text-sm mb-0">Keep me signed in</Label>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <div className="w-full space-y-3">
            <Button onClick={handleSubmit} className="w-full bg-green-500 hover:bg-green-600 text-white">
              Sign in to Company Portal
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => alert('Microsoft login clicked!')}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="#00BCF2" d="M0 0h11.377v11.372H0z"/>
                <path fill="#00BCF2" d="M12.623 0H24v11.372H12.623z"/>
                <path fill="#00BCF2" d="M0 12.623h11.377V24H0z"/>
                <path fill="#00BCF2" d="M12.623 12.623H24V24H12.623z"/>
              </svg>
              Continue with Microsoft
            </Button>

            <p className="text-center text-sm text-gray-500">
              Need company access?{' '}
              <button 
                className="text-green-600 hover:text-green-700 font-medium"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  alert('Contact support clicked!');
                }}
              >
                Contact support
              </button>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default CompanyLogin;
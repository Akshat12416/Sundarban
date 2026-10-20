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

interface AdminLoginProps {
  onBack: () => void;
}

interface AdminFormData {
  adminId: string;
  password: string;
  twoFactorCode: string;
  trustDevice: boolean;
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
function AdminLogin({ onBack }: AdminLoginProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AdminFormData>({
    adminId: '',
    password: '',
    twoFactorCode: '',
    trustDevice: false
  });

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('Admin login:', formData);
    window.location.href = "http://localhost:5173/";
  };

  const handleInputChange = (field: keyof Omit<AdminFormData, 'trustDevice'>) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, trustDevice: e.target.checked }));
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
          <NavigationTabs current="admin" />
        </div>
        
        <CardHeader>
          <div className="flex items-start justify-between">
            <Button variant="ghost" size="sm" onClick={handleBack} className="p-2 -ml-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <div className="text-right">
              <CardTitle>Admin Portal</CardTitle>
              <CardDescription>
                Secure administrative access to NCCR systems
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-id">Administrator ID</Label>
              <Input
                id="admin-id"
                type="text"
                placeholder="Enter your admin ID"
                value={formData.adminId}
                onChange={handleInputChange('adminId')}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="admin-password" className="mb-0">Password</Label>
                <button
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    alert('Reset password clicked!');
                  }}
                >
                  Reset password
                </button>
              </div>
              <Input 
                id="admin-password" 
                type="password" 
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange('password')}
                required 
              />
            </div>

            {/* <div>
              <Label htmlFor="two-factor">Two-Factor Authentication</Label>
              <Input
                id="two-factor"
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                value={formData.twoFactorCode}
                onChange={handleInputChange('twoFactorCode')}
                className="text-center font-mono text-base"
                required
              />
            </div> */}

            {/* <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="trust-device" 
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                checked={formData.trustDevice}
                onChange={handleCheckboxChange}
              />
              <Label htmlFor="trust-device" className="text-sm mb-0">Trust this device for 30 days</Label>
            </div> */}
          </div>
        </CardContent>

        <CardFooter>
          <div className="w-full space-y-3">
            <Button onClick={handleSubmit} className="w-full bg-black hover:bg-gray-800 text-white">
              Access Admin Portal
            </Button>
            
            {/* <Button 
              variant="outline" 
              className="w-full"
              onClick={() => alert('SSO login clicked!')}
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0L1.608 6v12L12 24l10.392-6V6L12 0zm-1.5 6h3v12h-3V6z"/>
              </svg>
              Continue with SSO
            </Button> */}

            <p className="text-center text-sm text-gray-500">
              Having access issues?{' '}
              <button 
                className="text-green-600 hover:text-green-700 font-medium"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  alert('Contact IT support clicked!');
                }}
              >
                Contact IT Support
              </button>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default AdminLogin;
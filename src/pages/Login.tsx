
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { authenticateUser } from "@/services/dataService";
import { User } from "@/types";
import { FileText, Check, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // For demo purposes, we're using a simplified authentication
    // In a real app, you'd validate with a backend API
    setTimeout(() => {
      const user = authenticateUser(email, password);
      
      if (user) {
        onLogin(user);
        navigate('/');
      } else {
        setError("Invalid email or password. Try with admin@bidflowpro.com or manager@bidflowpro.com");
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleDemoLogin = (role: 'admin' | 'manager' | 'viewer') => {
    setIsLoading(true);
    
    let email = '';
    switch (role) {
      case 'admin':
        email = 'admin@bidflowpro.com';
        break;
      case 'manager':
        email = 'manager@bidflowpro.com';
        break;
      case 'viewer':
        email = 'viewer@bidflowpro.com';
        break;
    }
    
    setTimeout(() => {
      const user = authenticateUser(email, 'password');
      if (user) {
        onLogin(user);
        navigate('/');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-3 rounded-xl">
              <FileText className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">BidFlow Pro</h1>
          <p className="text-gray-600 mt-2">Project & Bid Tracker</p>
        </div>
        
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-xs text-indigo-600 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  Or continue with demo accounts
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 w-full">
              <Button
                variant="outline"
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
                className="text-xs"
              >
                <Check className="mr-1 h-3 w-3" />
                Admin
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => handleDemoLogin('manager')}
                disabled={isLoading}
                className="text-xs"
              >
                <Check className="mr-1 h-3 w-3" />
                Manager
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => handleDemoLogin('viewer')}
                disabled={isLoading}
                className="text-xs"
              >
                <Check className="mr-1 h-3 w-3" />
                Viewer
              </Button>
            </div>
            
            <p className="text-center text-xs text-gray-500 mt-4">
              Don't have an account?{" "}
              <a href="#" className="text-indigo-600 hover:underline">
                Sign up
              </a>
            </p>
          </CardFooter>
        </Card>
        
        <p className="text-center text-xs text-gray-500 mt-8">
          © {new Date().getFullYear()} BidFlow Pro. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, MailIcon, LockIcon, Github, User, Check } from 'lucide-react';

export default function NewSignup() {
  const navigate = useNavigate();
  const { signup, googleSignIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const passwordRequirements = [
    { regex: /.{8,}/, text: '8 characters minimum' },
    { regex: /[A-Z]/, text: 'at least one uppercase letter' },
    { regex: /[0-9]/, text: 'at least one number' },
    { regex: /[^A-Za-z0-9]/, text: 'at least one special character' },
  ];

  const isPasswordValid = (password: string) =>
    passwordRequirements.every(req => req.regex.test(password));

  const doPasswordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.full_name || !formData.email || !formData.password) {
      toast({
        title: 'Validation error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (!isPasswordValid(formData.password)) {
      toast({
        title: 'Password Error',
        description: 'Your password does not meet the requirements',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Password Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call the signup method from auth context
      await signup({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password
      });

      toast({
        title: 'Account created!',
        description: 'Your account has been successfully created.',
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Signup failed',
        description: error.message || 'There was a problem creating your account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      // Import Firebase auth methods
      const { signInWithPopup } = await import('firebase/auth');
      const { auth, googleProvider } = await import('@/firebase');

      // Trigger Google OAuth popup
      const result = await signInWithPopup(auth, googleProvider);

      // Get the ID token from the authenticated user
      const idToken = await result.user.getIdToken();

      // Send the real ID token to the backend
      await googleSignIn(idToken);

      toast({
        title: 'Account created!',
        description: 'You have successfully signed up with Google.',
      });
      navigate('/dashboard');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign up with Google. Please try again.';
      toast({
        title: 'Google sign-up failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container flex min-h-screen items-center justify-center">
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-lg overflow-hidden shadow-xl">
        {/* Left side - Brand */}
        <div className="md:w-1/2 bg-gradient-to-br from-purple-700 to-indigo-800 p-12 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center">
              <svg
                className="h-10 w-10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span className="ml-3 text-2xl font-bold">Lumicoria.ai</span>
            </div>
            <h2 className="text-3xl font-bold mt-12">Join Lumicoria</h2>
            <p className="mt-4 text-white/80 text-lg">
              Create your account and start your journey with our AI-powered assistants.
            </p>
          </div>

          <div className="mt-auto">
            <p className="text-sm text-white/60">
              Boost your productivity and well-being with our intelligent agents
            </p>
          </div>
        </div>

        {/* Right side - Signup Form */}
        <div className="md:w-1/2 p-12">
          <div className="max-w-sm mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Create an account</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MailIcon className="h-4 w-4 text-gray-500" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <LockIcon className="h-4 w-4 text-gray-500" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  Password must contain:
                  <ul className="mt-1 list-disc list-inside">
                    {passwordRequirements.map((req, index) => (
                      <li key={index} className={req.regex.test(formData.password) ? 'text-green-600' : 'text-red-500'}>
                        {req.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <LockIcon className="h-4 w-4 text-gray-500" />
                  </div>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
                {formData.confirmPassword && (
                  <div className="flex items-center text-xs mt-1">
                    {doPasswordsMatch ? (
                      <span className="text-green-600 flex items-center">
                        <Check className="h-3 w-3 mr-1" />
                        Passwords match
                      </span>
                    ) : (
                      <span className="text-red-500">Passwords don't match</span>
                    )}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : "Create Account"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or continue with</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" aria-hidden="true">
                  <path
                    d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.6875 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                    fill="#EA4335"
                  />
                  <path
                    d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.25 12.0004 19.25C8.8704 19.25 6.2154 17.14 5.2704 14.295L1.28039 17.39C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                    fill="#34A853"
                  />
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                <Github className="h-5 w-5 mr-2" />
                GitHub
              </Button>
            </div>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-purple-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

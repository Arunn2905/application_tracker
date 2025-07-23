import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Briefcase } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
    } catch (error) {
      // Error is handled in the AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (email, password) => {
    setValue('email', email);
    setValue('password', password);
    // Trigger form submission
    handleSubmit(onSubmit)();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Briefcase className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to JobTracker
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Track your job applications with ease
          </p>
        </div>

        {/* Demo Credentials Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">
            Demo Credentials - Click to Login:
          </h3>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('demo@jobtracker.com', 'password123')}
              className="w-full text-left p-2 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded text-xs hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            >
              <div className="text-blue-700 dark:text-blue-300">
                <strong>Email:</strong> demo@jobtracker.com<br />
                <strong>Password:</strong> password123
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('test@test.com', 'test123')}
              className="w-full text-left p-2 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded text-xs hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            >
              <div className="text-blue-700 dark:text-blue-300">
                <strong>Email:</strong> test@test.com<br />
                <strong>Password:</strong> test123
              </div>
            </button>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              icon={<Mail className="h-5 w-5" />}
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              icon={<Lock className="h-5 w-5" />}
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 3,
                  message: 'Password must be at least 3 characters',
                },
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Forgot your password?
            </Link>
          </div>

          <Button
            type="submit"
            size="lg"
            loading={loading}
            className="w-full"
          >
            Sign in
          </Button>

          <div className="text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
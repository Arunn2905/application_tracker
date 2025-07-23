import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Lock, Save, Bell, Shield } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface ProfileForm {
  name: string;
  email: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationSettings {
  emailReminders: boolean;
  weeklyDigest: boolean;
  applicationUpdates: boolean;
}

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailReminders: true,
    weeklyDigest: false,
    applicationUpdates: true,
  });

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    watch,
    reset: resetPassword,
  } = useForm<PasswordForm>();

  const newPassword = watch('newPassword');

  const onProfileSubmit = async (data: ProfileForm) => {
    setLoading(true);
    try {
      await api.put('/auth/profile', data);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setPasswordLoading(true);
    try {
      await api.put('/auth/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password updated successfully');
      resetPassword();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleNotificationChange = async (setting: keyof NotificationSettings, value: boolean) => {
    try {
      const updatedSettings = { ...notificationSettings, [setting]: value };
      await api.put('/auth/notifications', updatedSettings);
      setNotificationSettings(updatedSettings);
      toast.success('Notification settings updated');
    } catch (error) {
      toast.error('Failed to update notification settings');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Profile Information
              </h2>
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  icon={<User className="h-4 w-4" />}
                  error={profileErrors.name?.message}
                  {...registerProfile('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                  })}
                />

                <Input
                  label="Email Address"
                  type="email"
                  icon={<Mail className="h-4 w-4" />}
                  error={profileErrors.email?.message}
                  {...registerProfile('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  loading={loading}
                  icon={<Save className="h-4 w-4" />}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Change Password
              </h2>
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
              <Input
                label="Current Password"
                type="password"
                icon={<Lock className="h-4 w-4" />}
                error={passwordErrors.currentPassword?.message}
                {...registerPassword('currentPassword', {
                  required: 'Current password is required',
                })}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="New Password"
                  type="password"
                  icon={<Lock className="h-4 w-4" />}
                  error={passwordErrors.newPassword?.message}
                  {...registerPassword('newPassword', {
                    required: 'New password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  icon={<Lock className="h-4 w-4" />}
                  error={passwordErrors.confirmPassword?.message}
                  {...registerPassword('confirmPassword', {
                    required: 'Please confirm your new password',
                    validate: (value) =>
                      value === newPassword || 'Passwords do not match',
                  })}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  loading={passwordLoading}
                  icon={<Shield className="h-4 w-4" />}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Notification Settings
              </h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Email Reminders
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive email notifications for upcoming interviews and deadlines
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notificationSettings.emailReminders}
                    onChange={(e) => handleNotificationChange('emailReminders', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Weekly Digest
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get a weekly summary of your job search progress
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notificationSettings.weeklyDigest}
                    onChange={(e) => handleNotificationChange('weeklyDigest', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Application Updates
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Notifications when you update application statuses
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notificationSettings.applicationUpdates}
                    onChange={(e) => handleNotificationChange('applicationUpdates', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Account Status */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Account Status
            </h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Account Status:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user?.isVerified 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                }`}>
                  {user?.isVerified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Member Since:</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
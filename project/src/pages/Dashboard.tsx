import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  TrendingUp, 
  Calendar, 
  Upload,
  Plus,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/Card';
import { Button } from '../components/Button';
import { api } from '../services/api';

interface DashboardStats {
  totalApplications: number;
  appliedCount: number;
  interviewCount: number;
  offerCount: number;
  rejectedCount: number;
  recentApplications: Array<{
    id: string;
    company: string;
    position: string;
    status: string;
    appliedDate: string;
  }>;
  upcomingReminders: Array<{
    id: string;
    title: string;
    date: string;
    type: string;
  }>;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    appliedCount: 0,
    interviewCount: 0,
    offerCount: 0,
    rejectedCount: 0,
    recentApplications: [],
    upcomingReminders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'interview':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'offer':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'interview':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'offer':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome back! Here's an overview of your job search progress.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Applications
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalApplications}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  In Progress
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.appliedCount + stats.interviewCount}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Offers
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.offerCount}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalApplications > 0 
                    ? Math.round((stats.offerCount / stats.totalApplications) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Recent Applications
              </h3>
              <Link to="/applications">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardBody>
            {stats.recentApplications.length > 0 ? (
              <div className="space-y-4">
                {stats.recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(app.status)}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {app.position}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {app.company}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(app.appliedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No applications yet
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get started by adding your first job application.
                </p>
                <div className="mt-6">
                  <Link to="/applications">
                    <Button icon={<Plus className="h-4 w-4" />}>
                      Add Application
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Upcoming Reminders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Upcoming Reminders
              </h3>
              <Link to="/reminders">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardBody>
            {stats.upcomingReminders.length > 0 ? (
              <div className="space-y-4">
                {stats.upcomingReminders.map((reminder) => (
                  <div key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {reminder.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {reminder.type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(reminder.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(reminder.date).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No upcoming reminders
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Stay organized by setting up interview reminders.
                </p>
                <div className="mt-6">
                  <Link to="/reminders">
                    <Button icon={<Plus className="h-4 w-4" />}>
                      Add Reminder
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Quick Actions
            </h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/applications">
                <div className="group p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                  <div className="text-center">
                    <Plus className="mx-auto h-8 w-8 text-gray-400 group-hover:text-blue-500" />
                    <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      Add Application
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Track a new job application
                    </p>
                  </div>
                </div>
              </Link>

              <Link to="/resumes">
                <div className="group p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 group-hover:text-blue-500" />
                    <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      Upload Resume
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Add a new resume version
                    </p>
                  </div>
                </div>
              </Link>

              <Link to="/analytics">
                <div className="group p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                  <div className="text-center">
                    <TrendingUp className="mx-auto h-8 w-8 text-gray-400 group-hover:text-blue-500" />
                    <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      View Analytics
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Check your progress
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { TrendingUp, Calendar, Target, Clock, Award, Building } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/Card';
import { api } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface AnalyticsData {
  statusDistribution: {
    labels: string[];
    data: number[];
  };
  monthlyApplications: {
    labels: string[];
    data: number[];
  };
  topCompanies: {
    labels: string[];
    data: number[];
  };
  responseRate: number;
  averageResponseTime: number;
  totalApplications: number;
  successRate: number;
}

export const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No data available
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Add some job applications to see analytics.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  const statusChartData = {
    labels: analytics.statusDistribution.labels,
    datasets: [
      {
        data: analytics.statusDistribution.data,
        backgroundColor: [
          '#3B82F6', // Blue
          '#8B5CF6', // Purple
          '#F59E0B', // Amber
          '#10B981', // Green
          '#EF4444', // Red
        ],
        borderWidth: 0,
      },
    ],
  };

  const monthlyChartData = {
    labels: analytics.monthlyApplications.labels,
    datasets: [
      {
        label: 'Applications',
        data: analytics.monthlyApplications.data,
        backgroundColor: '#3B82F6',
        borderColor: '#1D4ED8',
        borderWidth: 1,
      },
    ],
  };

  const companiesChartData = {
    labels: analytics.topCompanies.labels,
    datasets: [
      {
        label: 'Applications',
        data: analytics.topCompanies.data,
        backgroundColor: '#6366F1',
        borderColor: '#4F46E5',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your job search progress and identify improvement opportunities.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Applications
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.totalApplications}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.successRate}%
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Response Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.responseRate}%
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Avg. Response Time
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.averageResponseTime} days
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Application Status Distribution
            </h3>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <Pie data={statusChartData} options={pieOptions} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Applications Over Time
            </h3>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <Bar data={monthlyChartData} options={chartOptions} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Top Companies Applied To
            </h3>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <Bar
                data={companiesChartData}
                options={{
                  ...chartOptions,
                  indexAxis: 'y' as const,
                }}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Key Insights
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Most applications are in "Applied" status
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Consider following up on applications older than 2 weeks
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {analytics.successRate}% success rate
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {analytics.successRate > 10 ? 'Great job!' : 'Focus on quality over quantity'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Average response time: {analytics.averageResponseTime} days
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {analytics.averageResponseTime > 14 ? 'Consider following up sooner' : 'Good response timing'}
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
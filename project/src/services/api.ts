import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock data for testing
const MOCK_DATA = {
  applications: [
    {
      id: '1',
      company: 'Google',
      position: 'Senior Frontend Developer',
      status: 'interview',
      appliedDate: '2024-01-15',
      salary: 150000,
      location: 'Mountain View, CA',
      notes: 'Great company culture, exciting projects',
    },
    {
      id: '2',
      company: 'Microsoft',
      position: 'Full Stack Engineer',
      status: 'applied',
      appliedDate: '2024-01-10',
      salary: 140000,
      location: 'Seattle, WA',
      notes: 'Applied through LinkedIn',
    },
    {
      id: '3',
      company: 'Apple',
      position: 'iOS Developer',
      status: 'offer',
      appliedDate: '2024-01-05',
      salary: 160000,
      location: 'Cupertino, CA',
      notes: 'Received offer, considering options',
    },
  ],
  resumes: [
    {
      id: '1',
      name: 'Senior Developer Resume',
      filename: 'resume-senior-dev.pdf',
      fileSize: 245760,
      uploadDate: '2024-01-01',
      isDefault: true,
      tags: ['senior', 'frontend', 'react'],
      usageCount: 5,
    },
    {
      id: '2',
      name: 'Full Stack Resume',
      filename: 'resume-fullstack.pdf',
      fileSize: 198432,
      uploadDate: '2024-01-02',
      isDefault: false,
      tags: ['fullstack', 'javascript', 'node'],
      usageCount: 3,
    },
  ],
  reminders: [
    {
      id: '1',
      title: 'Google Interview',
      description: 'Technical interview with the frontend team',
      date: '2024-01-25',
      time: '14:00',
      type: 'interview',
      isCompleted: false,
      notificationSent: false,
    },
    {
      id: '2',
      title: 'Follow up with Microsoft',
      description: 'Send follow-up email about application status',
      date: '2024-01-20',
      time: '10:00',
      type: 'follow-up',
      isCompleted: false,
      notificationSent: false,
    },
  ],
};

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle mock responses and token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If it's a network error (backend not running), return mock data
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      const url = error.config.url;
      const method = error.config.method?.toLowerCase();
      
      // Mock API responses
      if (url?.includes('/applications') && method === 'get') {
        return Promise.resolve({ data: MOCK_DATA.applications });
      }
      if (url?.includes('/resumes') && method === 'get') {
        return Promise.resolve({ data: MOCK_DATA.resumes });
      }
      if (url?.includes('/reminders') && method === 'get') {
        return Promise.resolve({ data: MOCK_DATA.reminders });
      }
      if (url?.includes('/dashboard/stats') && method === 'get') {
        return Promise.resolve({
          data: {
            totalApplications: MOCK_DATA.applications.length,
            appliedCount: MOCK_DATA.applications.filter(a => a.status === 'applied').length,
            interviewCount: MOCK_DATA.applications.filter(a => a.status === 'interview').length,
            offerCount: MOCK_DATA.applications.filter(a => a.status === 'offer').length,
            rejectedCount: MOCK_DATA.applications.filter(a => a.status === 'rejected').length,
            recentApplications: MOCK_DATA.applications.slice(0, 5),
            upcomingReminders: MOCK_DATA.reminders.slice(0, 3),
          }
        });
      }
      if (url?.includes('/analytics') && method === 'get') {
        return Promise.resolve({
          data: {
            statusDistribution: {
              labels: ['Applied', 'Interview', 'Offer', 'Rejected'],
              data: [1, 1, 1, 0],
            },
            monthlyApplications: {
              labels: ['Dec 2023', 'Jan 2024'],
              data: [2, 3],
            },
            topCompanies: {
              labels: ['Google', 'Microsoft', 'Apple'],
              data: [1, 1, 1],
            },
            responseRate: 67,
            averageResponseTime: 7,
            totalApplications: 3,
            successRate: 33,
          }
        });
      }
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
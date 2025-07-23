import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit,
  Trash2,
  ExternalLink,
  Calendar,
  DollarSign,
  Building,
  User,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardHeader, CardBody } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ApplicationModal } from '../components/ApplicationModal';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface Application {
  id: string;
  company: string;
  position: string;
  status: string;
  appliedDate: string;
  salary?: number;
  location?: string;
  jobUrl?: string;
  notes?: string;
  contactPerson?: string;
  contactEmail?: string;
  resumeId?: string;
  resumeName?: string;
}

export const Applications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications');
      setApplications(response.data);
    } catch (error) {
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApplication = () => {
    setEditingApplication(null);
    setShowModal(true);
  };

  const handleEditApplication = (application: Application) => {
    setEditingApplication(application);
    setShowModal(true);
  };

  const handleDeleteApplication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) {
      return;
    }

    try {
      await api.delete(`/applications/${id}`);
      setApplications(applications.filter(app => app.id !== id));
      toast.success('Application deleted successfully');
    } catch (error) {
      toast.error('Failed to delete application');
    }
  };

  const handleApplicationSaved = (application: Application) => {
    if (editingApplication) {
      setApplications(applications.map(app => 
        app.id === application.id ? application : app
      ));
    } else {
      setApplications([application, ...applications]);
    }
    setShowModal(false);
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'phone screen':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
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

  const statuses = ['all', 'applied', 'phone screen', 'interview', 'offer', 'rejected'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Job Applications
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage and track all your job applications in one place.
            </p>
          </div>
          <Button 
            onClick={handleCreateApplication}
            icon={<Plus className="h-4 w-4" />}
          >
            Add Application
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Applications Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardBody>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded w-20 mb-4"></div>
                  <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : filteredApplications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {application.position}
                    </h3>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
                      <Building className="h-4 w-4 mr-1" />
                      <span className="text-sm">{application.company}</span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditApplication(application)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteApplication(application.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(application.appliedDate), 'MMM dd, yyyy')}
                    </div>
                  </div>

                  {application.location && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span>📍 {application.location}</span>
                    </div>
                  )}

                  {application.salary && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <DollarSign className="h-3 w-3 mr-1" />
                      <span>${application.salary.toLocaleString()}</span>
                    </div>
                  )}

                  {application.contactPerson && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <User className="h-3 w-3 mr-1" />
                      <span>{application.contactPerson}</span>
                    </div>
                  )}

                  {application.resumeName && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <FileText className="h-3 w-3 mr-1" />
                      <span>{application.resumeName}</span>
                    </div>
                  )}
                </div>

                {application.notes && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {application.notes}
                    </p>
                  </div>
                )}

                {application.jobUrl && (
                  <div className="flex justify-end">
                    <a
                      href={application.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Job
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No applications found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first job application.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <div className="mt-6">
                  <Button 
                    onClick={handleCreateApplication}
                    icon={<Plus className="h-4 w-4" />}
                  >
                    Add Your First Application
                  </Button>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Application Modal */}
      {showModal && (
        <ApplicationModal
          application={editingApplication}
          onClose={() => setShowModal(false)}
          onSave={handleApplicationSaved}
        />
      )}
    </div>
  );
};
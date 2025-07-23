import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Calendar, Building, DollarSign, FileText, User, Mail, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from './Button';
import { Input } from './Input';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface ApplicationData {
  id?: string;
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
}

interface ApplicationModalProps {
  application?: ApplicationData | null;
  onClose: () => void;
  onSave: (application: ApplicationData) => void;
}

interface Resume {
  id: string;
  name: string;
  filename: string;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  application,
  onClose,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const isEditing = Boolean(application);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApplicationData>({
    defaultValues: application || {
      appliedDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'applied',
    },
  });

  useEffect(() => {
    fetchResumes();
    if (application) {
      reset({
        ...application,
        appliedDate: format(new Date(application.appliedDate), 'yyyy-MM-dd'),
      });
    }
  }, [application, reset]);

  const fetchResumes = async () => {
    try {
      const response = await api.get('/resumes');
      setResumes(response.data);
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
    }
  };

  const onSubmit = async (data: ApplicationData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        salary: data.salary ? Number(data.salary) : null,
      };

      const response = isEditing
        ? await api.put(`/applications/${application.id}`, payload)
        : await api.post('/applications', payload);

      onSave(response.data);
      toast.success(`Application ${isEditing ? 'updated' : 'created'} successfully`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} application`);
    } finally {
      setLoading(false);
    }
  };

  const statuses = [
    'applied',
    'phone screen',
    'interview',
    'offer',
    'rejected',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {isEditing ? 'Edit Application' : 'Add New Application'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Company"
                  icon={<Building className="h-4 w-4" />}
                  error={errors.company?.message}
                  {...register('company', { required: 'Company is required' })}
                />

                <Input
                  label="Position"
                  icon={<User className="h-4 w-4" />}
                  error={errors.position?.message}
                  {...register('position', { required: 'Position is required' })}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    {...register('status', { required: 'Status is required' })}
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.status && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {errors.status.message}
                    </p>
                  )}
                </div>

                <Input
                  label="Applied Date"
                  type="date"
                  icon={<Calendar className="h-4 w-4" />}
                  error={errors.appliedDate?.message}
                  {...register('appliedDate', { required: 'Applied date is required' })}
                />

                <Input
                  label="Salary (optional)"
                  type="number"
                  placeholder="e.g., 85000"
                  icon={<DollarSign className="h-4 w-4" />}
                  error={errors.salary?.message}
                  {...register('salary')}
                />

                <Input
                  label="Location (optional)"
                  placeholder="e.g., San Francisco, CA"
                  {...register('location')}
                />

                <Input
                  label="Job URL (optional)"
                  type="url"
                  placeholder="https://..."
                  icon={<ExternalLink className="h-4 w-4" />}
                  {...register('jobUrl')}
                />

                <Input
                  label="Contact Person (optional)"
                  placeholder="e.g., John Smith"
                  icon={<User className="h-4 w-4" />}
                  {...register('contactPerson')}
                />

                <Input
                  label="Contact Email (optional)"
                  type="email"
                  placeholder="contact@company.com"
                  icon={<Mail className="h-4 w-4" />}
                  {...register('contactEmail')}
                />

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Resume Used (optional)
                  </label>
                  <select
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    {...register('resumeId')}
                  >
                    <option value="">Select a resume</option>
                    {resumes.map(resume => (
                      <option key={resume.id} value={resume.id}>
                        {resume.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  rows={4}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Add any notes about this application..."
                  {...register('notes')}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                >
                  {isEditing ? 'Update' : 'Create'} Application
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
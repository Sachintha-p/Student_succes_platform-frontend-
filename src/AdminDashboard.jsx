import React, { useState } from 'react';
import axios from 'axios';
import { PlayIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleScrape = async () => {
    setStatus('loading');
    setMessage('Connecting to TopJobs and syncing with Neon DB...');

    try {
      // 1. Call your new Spring Boot Admin Endpoint
      const response = await axios.post('http://localhost:8080/api/v1/admin/scrape-jobs');
      
      // 2. Success handling
      setStatus('success');
      setMessage(response.data); // "Successfully synced with TopJobs!"
    } catch (error) {
      // 3. Error handling
      setStatus('error');
      setMessage(error.response?.data || 'Failed to connect to the backend scraper service.');
    }
  };import React, { useState } from 'react';
import axios from 'axios';
import { PlayIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleScrape = async () => {
    setStatus('loading');
    setMessage('Connecting to TopJobs and syncing with Neon DB...');

    try {
      // 1. Call your new Spring Boot Admin Endpoint
      const response = await axios.post('http://localhost:8080/api/v1/admin/scrape-jobs');
      
      // 2. Success handling
      setStatus('success');
      setMessage(response.data); // "Successfully synced with TopJobs!"
    } catch (error) {
      // 3. Error handling
      setStatus('error');
      setMessage(error.response?.data || 'Failed to connect to the backend scraper service.');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">Admin Control Panel</h1>
        <p className="text-gray-600">Manage platform data and system integrations.</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Job Listings Sync</h2>
              <p className="text-sm text-gray-500">Fetch the latest IT vacancies from TopJobs.lk directly into the database.</p>
            </div>
            
            <button
              onClick={handleScrape}
              disabled={status === 'loading'}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                status === 'loading' 
                ? 'bg-gray-100 text-slate-500 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-md'
              }`}
            >
              {status === 'loading' ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-slate-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Syncing...
                </span>
              ) : (
                <>
                  <PlayIcon className="h-5 w-5" />
                  Run Scraper
                </>
              )}
            </button>
          </div>

          {/* Feedback Section */}
          {status !== 'idle' && (
            <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${
              status === 'success' ? 'bg-green-50 border border-green-100' : 
              status === 'error' ? 'bg-red-50 border border-red-100' : 'bg-blue-50 border border-blue-100'
            }`}>
              {status === 'success' && <CheckCircleIcon className="h-6 w-6 text-green-500 mt-0.5" />}
              {status === 'error' && <ExclamationCircleIcon className="h-6 w-6 text-red-500 mt-0.5" />}
              {status === 'loading' && <PlayIcon className="h-6 w-6 text-blue-500 mt-0.5 animate-pulse" />}
              
              <div>
                <p className={`font-semibold ${
                  status === 'success' ? 'text-green-800' : 
                  status === 'error' ? 'text-red-800' : 'text-blue-800'
                }`}>
                  {status === 'loading' ? 'Process Started' : status === 'success' ? 'Sync Complete' : 'Sync Failed'}
                </p>
                <p className="text-sm opacity-90">{message}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">Admin Control Panel</h1>
        <p className="text-gray-600">Manage platform data and system integrations.</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Job Listings Sync</h2>
              <p className="text-sm text-gray-500">Fetch the latest IT vacancies from TopJobs.lk directly into the database.</p>
            </div>
            
            <button
              onClick={handleScrape}
              disabled={status === 'loading'}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                status === 'loading' 
                ? 'bg-gray-100 text-slate-500 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-md'
              }`}
            >
              {status === 'loading' ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-slate-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Syncing...
                </span>
              ) : (
                <>
                  <PlayIcon className="h-5 w-5" />
                  Run Scraper
                </>
              )}
            </button>
          </div>

          {/* Feedback Section */}
          {status !== 'idle' && (
            <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${
              status === 'success' ? 'bg-green-50 border border-green-100' : 
              status === 'error' ? 'bg-red-50 border border-red-100' : 'bg-blue-50 border border-blue-100'
            }`}>
              {status === 'success' && <CheckCircleIcon className="h-6 w-6 text-green-500 mt-0.5" />}
              {status === 'error' && <ExclamationCircleIcon className="h-6 w-6 text-red-500 mt-0.5" />}
              {status === 'loading' && <PlayIcon className="h-6 w-6 text-blue-500 mt-0.5 animate-pulse" />}
              
              <div>
                <p className={`font-semibold ${
                  status === 'success' ? 'text-green-800' : 
                  status === 'error' ? 'text-red-800' : 'text-blue-800'
                }`}>
                  {status === 'loading' ? 'Process Started' : status === 'success' ? 'Sync Complete' : 'Sync Failed'}
                </p>
                <p className="text-sm opacity-90">{message}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
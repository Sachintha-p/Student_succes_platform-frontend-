import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Module3Header from '../../components/Module3Header';
import DashboardAccessButton from '../../components/DashboardAccessButton';
import { ChevronLeft, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { DatePicker, TimePicker } from './DateTimePicker';

const CreateEvent = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    eventTime: '09:00',
    venue: '',
    category: '',
    maxAttendees: '',
    isOnline: false,
    isPublished: true
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const categories = ['Tech Talk', 'Networking', 'Workshop', 'Seminar', 'Sports', 'Cultural', 'Academic', 'Social', 'Other'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Title must not exceed 200 characters';
    }

    if (formData.description && formData.description.trim().length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }

    if (!formData.eventDate) {
      newErrors.eventDate = 'Date and time are required';
    } else {
      const eventDateTime = new Date(`${formData.eventDate}T${formData.eventTime}`);
      if (eventDateTime <= new Date()) {
        newErrors.eventDate = 'Event date and time must be in the future';
      }
    }

    if (!formData.isOnline) {
      if (!formData.venue.trim()) {
        newErrors.venue = 'Venue is required for in-person events';
      } else if (formData.venue.trim().length < 3) {
        newErrors.venue = 'Venue must be at least 3 characters';
      } else if (formData.venue.trim().length > 200) {
        newErrors.venue = 'Venue must not exceed 200 characters';
      }
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.maxAttendees) {
      const attendees = parseInt(formData.maxAttendees);
      if (isNaN(attendees)) {
        newErrors.maxAttendees = 'Must be a valid number';
      } else if (attendees < 1) {
        newErrors.maxAttendees = 'Must be at least 1';
      } else if (attendees > 10000) {
        newErrors.maxAttendees = 'Must not exceed 10000';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const eventData = {
        title: formData.title,
        description: formData.description,
        eventDate: `${formData.eventDate}T${formData.eventTime || '09:00'}`,
        venue: formData.venue,
        category: formData.category,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
        isOnline: formData.isOnline,
        isPublished: formData.isPublished
      };

      const response = await fetch('http://localhost:8080/api/v1/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        setSuccessMessage('Event created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/module3');
        }, 2000);
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.message || 'Failed to create event' });
      }
    } catch (err) {
      console.error("Error creating event:", err);
      setErrors({ submit: 'An error occurred while creating the event' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#090e17] text-gray-300 font-sans min-h-screen">
      <Module3Header/>
      <DashboardAccessButton />
      
      <div className="flex pt-24">
        <Sidebar/>

        <main className="flex-1 ml-72">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-[#00d09c]/10 to-transparent border-b border-gray-800/50 px-10 py-12">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/module3')}
              className="p-2.5 bg-[#121826] border border-gray-800 rounded-lg text-gray-400 hover:text-[#00d09c] hover:border-[#00d09c] transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">Create New Event</h1>
              <p className="text-gray-400 text-lg font-medium">Organize and promote a campus event</p>
            </div>
          </div>
        </div>

        <div className="p-10">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-8 bg-green-500/15 border border-green-500/40 text-green-400 p-5 rounded-lg flex items-center gap-3">
            <CheckCircle size={20} className="flex-shrink-0" />
            <p className="font-bold">{successMessage}</p>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-[#121826] border border-gray-800 rounded-2xl p-10 max-w-3xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Error Alert */}
            {errors.submit && (
              <div className="bg-red-500/15 border border-red-500/40 text-red-400 p-5 rounded-lg flex items-center gap-3">
                <AlertCircle size={20} className="flex-shrink-0" />
                <p className="font-bold">{errors.submit}</p>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-black uppercase text-gray-500 tracking-wider mb-3">
                Event Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Tech Talk: AI in Education"
                className={`w-full bg-[#090e17] border rounded-lg py-3.5 px-5 text-white placeholder:text-gray-600 focus:outline-none transition-all ${
                  errors.title
                    ? 'border-red-500/60 focus:border-red-400'
                    : 'border-gray-800 hover:border-gray-700 focus:border-[#00d09c]'
                }`}
              />
              {errors.title && <p className="text-red-400 text-sm mt-2.5 font-medium">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-black uppercase text-gray-500 tracking-wider mb-3">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell us about the event..."
                rows="5"
                className={`w-full bg-[#090e17] border rounded-lg py-3.5 px-5 text-white placeholder:text-gray-600 focus:outline-none transition-all resize-none ${
                  errors.description
                    ? 'border-red-500/60 focus:border-red-400'
                    : 'border-gray-800 hover:border-gray-700 focus:border-[#00d09c]'
                }`}
              />
              {errors.description && <p className="text-red-400 text-sm mt-2.5 font-medium">{errors.description}</p>}
            </div>

            {/* Date & Time */}
            <div>
              <label className="block text-sm font-black uppercase text-gray-500 tracking-wider mb-3">
                Date & Time *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <DatePicker 
                  value={formData.eventDate} 
                  onChange={(date) => setFormData(prev => ({...prev, eventDate: date}))}
                  label="Select Date"
                  error={errors.eventDate}
                  required={true}
                  minDate={new Date().toISOString().split('T')[0]}
                />
                <div>
                  <label className="block text-xs text-gray-500 font-bold mb-2.5 uppercase tracking-wider">Select Time</label>
                  <TimePicker 
                    value={formData.eventTime} 
                    onChange={(time) => setFormData(prev => ({...prev, eventTime: time}))}
                  />
                </div>
              </div>
            </div>

            {/* Online Toggle */}
            <div className="bg-[#090e17] border border-gray-800 rounded-lg p-5 flex items-center justify-between">
              <label htmlFor="isOnline" className="text-white font-bold cursor-pointer">
                This is an online event
              </label>
              <input
                type="checkbox"
                name="isOnline"
                id="isOnline"
                checked={formData.isOnline}
                onChange={handleChange}
                className="w-5 h-5 accent-[#00d09c] cursor-pointer"
              />
            </div>

            {/* Venue */}
            {!formData.isOnline && (
              <div>
                <label className="block text-sm font-black uppercase text-gray-500 tracking-wider mb-3">
                  Venue Location *
                </label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="e.g., Auditorium A, Main Campus"
                  className={`w-full bg-[#090e17] border rounded-lg py-3.5 px-5 text-white placeholder:text-gray-600 focus:outline-none transition-all ${
                    errors.venue
                      ? 'border-red-500/60 focus:border-red-400'
                      : 'border-gray-800 hover:border-gray-700 focus:border-[#00d09c]'
                  }`}
                />
                {errors.venue && <p className="text-red-400 text-sm mt-2.5 font-medium">{errors.venue}</p>}
              </div>
            )}

            {/* Category & Max Attendees */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-black uppercase text-gray-500 tracking-wider mb-3">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full bg-[#090e17] border rounded-lg py-3.5 px-5 text-white focus:outline-none transition-all ${
                    errors.category
                      ? 'border-red-500/60 focus:border-red-400'
                      : 'border-gray-800 hover:border-gray-700 focus:border-[#00d09c]'
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-400 text-sm mt-2.5 font-medium">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-black uppercase text-gray-500 tracking-wider mb-3">
                  Max Attendees
                </label>
                <input
                  type="number"
                  name="maxAttendees"
                  value={formData.maxAttendees}
                  onChange={handleChange}
                  placeholder="Leave blank for unlimited"
                  min="1"
                  className={`w-full bg-[#090e17] border rounded-lg py-3.5 px-5 text-white placeholder:text-gray-600 focus:outline-none transition-all ${
                    errors.maxAttendees
                      ? 'border-red-500/60 focus:border-red-400'
                      : 'border-gray-800 hover:border-gray-700 focus:border-[#00d09c]'
                  }`}
                />
                {errors.maxAttendees && <p className="text-red-400 text-sm mt-2.5 font-medium">{errors.maxAttendees}</p>}
              </div>
            </div>

            {/* Publish Toggle */}
            <div className="bg-[#090e17] border border-gray-800 rounded-lg p-5 flex items-center justify-between">
              <label htmlFor="isPublished" className="text-white font-bold cursor-pointer">
                Publish this event immediately
              </label>
              <input
                type="checkbox"
                name="isPublished"
                id="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="w-5 h-5 accent-[#00d09c] cursor-pointer"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t border-gray-800">
              <button
                type="button"
                onClick={() => navigate('/module3')}
                className="flex-1 bg-gray-800/60 hover:bg-gray-700/70 text-gray-300 py-3.5 rounded-lg font-bold transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 py-3.5 rounded-lg font-black transition-all shadow-[0_6px_20px_rgba(0,208,156,0.3)] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
        </div>
      </main>
    </div>
    </div>
  );
};

export default CreateEvent;

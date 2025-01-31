import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Scale, Target, Settings, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../contexts/ProfileContext';
import MainLayout from '../layouts/MainLayout';
import MeasurementsForm from './MeasurementsForm';
import PreferencesForm from './PreferencesForm';
import GoalsForm from './GoalsForm';

const ProfileSettings = () => {
  const { profile, loading, error, updateProfile } = useProfile();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(() => ({
    displayName: profile?.displayName || '',
    bio: profile?.bio || ''
  }));
  const [updateError, setUpdateError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        bio: profile.bio || ''
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setUpdateError(null);

    try {
      await updateProfile(formData);
      setUpdateError(null);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setUpdateError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3dd8e8]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-8 text-center">
        {error}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-gray-400 p-8 text-center">
        Profile not found
      </div>
    );
  }

  return (
    <MainLayout>
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-zinc-800 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Profile Settings</h1>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'measurements', label: 'Measurements', icon: Scale },
          { id: 'goals', label: 'Goals', icon: Target },
          { id: 'preferences', label: 'Preferences', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#3dd8e8] text-black'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-zinc-900 rounded-lg p-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {updateError && (
                <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
                  {updateError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className="w-full px-4 py-2 bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3dd8e8]"
                  disabled={saving}
                  placeholder="Enter your display name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full px-4 py-2 bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3dd8e8] h-32 resize-none"
                  placeholder="Tell us about yourself..."
                  disabled={saving}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={saving}
                className="w-full bg-[#3dd8e8] text-black py-3 rounded-lg font-semibold hover:bg-[#34c5d3] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
                ) : (
                  'Save Changes'
                )}
              </motion.button>
            </form>
          </div>
        )}

        {activeTab === 'measurements' && (
          <MeasurementsForm />
        )}

        {activeTab === 'goals' && (
          <GoalsForm />
        )}

        {activeTab === 'preferences' && (
          <PreferencesForm />
        )}
      </div>
    </div>
    </MainLayout>
  );
};

export default ProfileSettings;
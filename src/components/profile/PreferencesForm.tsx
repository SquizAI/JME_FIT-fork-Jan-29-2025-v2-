import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Moon, Sun, Globe, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useProfile } from '../../contexts/ProfileContext';

const PreferencesForm = () => {
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleNotificationChange = async (key: string, value: boolean) => {
    if (!profile?.preferences?.notifications) return;
    
    setLoading(true);
    try {
      await updateProfile({
        preferences: {
          ...profile.preferences,
          notifications: {
            ...profile.preferences.notifications,
            [key]: value
          }
        }
      });
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = async (theme: 'light' | 'dark') => {
    if (!profile?.preferences) return;
    
    setLoading(true);
    try {
      await updateProfile({
        preferences: {
          ...profile.preferences,
          theme
        }
      });
    } catch (error) {
      console.error('Failed to update theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnitChange = async (units: 'metric' | 'imperial') => {
    if (!profile?.preferences) return;
    
    setLoading(true);
    try {
      await updateProfile({
        preferences: {
          ...profile.preferences,
          units
        }
      });
    } catch (error) {
      console.error('Failed to update units:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-zinc-800 rounded-lg text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold">Preferences</h2>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#3dd8e8]" />
          Notifications
        </h3>
        <div className="space-y-4">
          {[
            { key: 'workoutReminders', label: 'Workout Reminders' },
            { key: 'progressUpdates', label: 'Progress Updates' },
            { key: 'nutritionReminders', label: 'Nutrition Reminders' }
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span>{label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile?.preferences?.notifications?.[key] || false}
                  onChange={(e) => handleNotificationChange(key, e.target.checked)}
                  className="sr-only peer"
                  disabled={loading}
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3dd8e8]"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          {profile?.preferences?.theme === 'dark' ? (
            <Moon className="w-5 h-5 text-[#3dd8e8]" />
          ) : (
            <Sun className="w-5 h-5 text-[#3dd8e8]" />
          )}
          Theme
        </h3>
        <div className="flex gap-4">
          <button
            onClick={() => handleThemeChange('light')}
            className={`px-4 py-2 rounded-lg ${
              profile?.preferences?.theme === 'light'
                ? 'bg-[#3dd8e8] text-black'
                : 'bg-zinc-800'
            }`}
            disabled={loading}
          >
            Light
          </button>
          <button
            onClick={() => handleThemeChange('dark')}
            className={`px-4 py-2 rounded-lg ${
              profile?.preferences?.theme === 'dark'
                ? 'bg-[#3dd8e8] text-black'
                : 'bg-zinc-800'
            }`}
            disabled={loading}
          >
            Dark
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#3dd8e8]" />
          Units
        </h3>
        <div className="flex gap-4">
          <button
            onClick={() => handleUnitChange('metric')}
            className={`px-4 py-2 rounded-lg ${
              profile?.preferences?.units === 'metric'
                ? 'bg-[#3dd8e8] text-black'
                : 'bg-zinc-800'
            }`}
            disabled={loading}
          >
            Metric
          </button>
          <button
            onClick={() => handleUnitChange('imperial')}
            className={`px-4 py-2 rounded-lg ${
              profile?.preferences?.units === 'imperial'
                ? 'bg-[#3dd8e8] text-black'
                : 'bg-zinc-800'
            }`}
            disabled={loading}
          >
            Imperial
          </button>
        </div>
      </div>
    </div>
    </MainLayout>
  );
};

export default PreferencesForm;
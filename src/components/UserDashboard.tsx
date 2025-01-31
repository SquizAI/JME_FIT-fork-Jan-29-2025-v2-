import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Calendar, Book, Settings, LogOut, Package, ChevronRight, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 
import { useProfile } from '../contexts/ProfileContext';
import OrderHistory from './dashboard/OrderHistory';
import ProgressTracker from './dashboard/ProgressTracker';
import MainLayout from './layouts/MainLayout';
import { OpenAIService } from '../services/openai';
import type { ProgramRecommendation } from '../types/questionnaire';

const UserDashboard = () => {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [recommendation, setRecommendation] = useState<ProgramRecommendation | null>(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const getRecommendation = async () => {
      if (!profile?.goals) return;
      
      setLoadingRecommendation(true);
      try {
        const rec = await OpenAIService.getRecommendation({
          goal: profile.goals.map(g => g.type).join(', '),
          time: profile.availability?.daysPerWeek 
            ? `${profile.availability.daysPerWeek} days per week` 
            : '3-4 days per week',
          experience: profile.fitnessLevel || 'beginner',
          challenges: '',
          preferences: profile.availability?.preferredTimes?.join(', ') || 'flexible'
        });
        setRecommendation(rec);
      } catch (err) {
        console.error('Failed to get recommendation:', err);
      } finally {
        setLoadingRecommendation(false);
      }
    };

    if (!profile?.subscription) {
      getRecommendation();
    }
  }, [profile]);
  if (profileLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3dd8e8]"></div>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-400">Profile not found</div>
        </div>
      </MainLayout>
    );
  }
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <span className="text-gray-400">Welcome, {profile.displayName}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {profile.subscription ? (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="col-span-full bg-zinc-900 p-6 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Package className="w-8 h-8 text-[#3dd8e8]" />
                    <div>
                      <h3 className="text-xl font-semibold">{profile.subscription.plan}</h3>
                      <p className="text-gray-400">
                        {new Date(profile.subscription.started_at).toLocaleDateString()} - {' '}
                        {profile.subscription.expires_at 
                          ? new Date(profile.subscription.expires_at).toLocaleDateString()
                          : 'Ongoing'}
                      </p>
                    </div>
                  </div>
                  <Link 
                    to={`/memberships/${profile.subscription.plan.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-[#3dd8e8] hover:text-[#34c5d3] transition-colors"
                  >
                    View Program Details
                    <ChevronRight className="inline-block w-5 h-5 ml-1" />
                  </Link>
                </div>
              </motion.div>
            ) : recommendation ? (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="col-span-full bg-zinc-900 p-6 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Recommended Program</h3>
                    <p className="text-gray-400 mb-4">{recommendation.explanation}</p>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.customizedPlan.focusAreas.map((area, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-[#3dd8e8]/20 text-[#3dd8e8] rounded-full text-sm"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Link 
                    to={`/memberships/${recommendation.recommendedProgram}`}
                    className="flex items-center gap-2 bg-[#3dd8e8] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#34c5d3] transition-colors"
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </motion.div>
            ) : null}
            <Link to="/dashboard/progress">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-zinc-900 p-6 rounded-lg"
              >
                <Activity className="w-8 h-8 text-[#3dd8e8] mb-4" />
                <h3 className="text-xl font-semibold mb-2">Workout Progress</h3>
                <p className="text-gray-400">Track your fitness journey</p>
              </motion.div>
            </Link>

            <Link to="/dashboard/schedule">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-zinc-900 p-6 rounded-lg"
              >
                <Calendar className="w-8 h-8 text-[#3dd8e8] mb-4" />
                <h3 className="text-xl font-semibold mb-2">Schedule</h3>
                <p className="text-gray-400">View upcoming sessions</p>
              </motion.div>
            </Link>

            <Link to="/dashboard/nutrition">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-zinc-900 p-6 rounded-lg"
              >
                <Book className="w-8 h-8 text-[#3dd8e8] mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nutrition Log</h3>
                <p className="text-gray-400">Track your meals and macros</p>
              </motion.div>
            </Link>

            <Link to="/dashboard/settings">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-zinc-900 p-6 rounded-lg"
              >
                <Settings className="w-8 h-8 text-[#3dd8e8] mb-4" />
                <h3 className="text-xl font-semibold mb-2">Settings</h3>
                <p className="text-gray-400">Manage your account</p>
              </motion.div>
            </Link>
          </div>

          <div className="mt-12 bg-zinc-900 p-8 rounded-lg">
            <h2 className="text-2xl font-semibold mb-6">Recent Activity</h2>
            <div className="space-y-4">
              <OrderHistory />
              {[1, 2, 3].map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-black rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">Workout Completed</h3>
                    <p className="text-gray-400">Upper Body Strength</p>
                  </div>
                  <span className="text-gray-400">2 days ago</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default UserDashboard;
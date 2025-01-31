import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProfileService } from '../services/profile';
import { OpenAIService } from '../services/openai';
import { useProfile } from '../contexts/ProfileContext';
import { motion } from 'framer-motion';
import OnboardingLayout from '../components/onboarding/OnboardingLayout';
import GoalsStep from '../components/onboarding/GoalsStep';
import ExperienceStep from '../components/onboarding/ExperienceStep';
import AvailabilityStep from '../components/onboarding/AvailabilityStep';
import type { ProgramRecommendation } from '../types/questionnaire';

const STEPS = [
  { id: 'goals', title: 'What are your fitness goals?', subtitle: 'Select all that apply' },
  { id: 'experience', title: 'What\'s your fitness experience?', subtitle: 'This helps us personalize your program' },
  { id: 'availability', title: 'When can you train?', subtitle: 'Let us know your schedule' }
];

const OnboardingFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<ProgramRecommendation | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshProfile } = useProfile();

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSkip = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await ProfileService.skipOnboarding(user.id);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to skip onboarding:', err);
      setError('Failed to skip onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (availability: {
    daysPerWeek: number;
    preferredTimes: string[];
  }) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      // Get AI recommendation based on user answers
      const recommendation = await OpenAIService.getRecommendation({
        goal: selectedGoals.join(', '),
        time: `${availability.daysPerWeek} days per week`,
        experience: selectedLevel,
        challenges: '',
        preferences: availability.preferredTimes.join(', ')
      });

      setRecommendation(recommendation);

      // Create complete profile data
      const profileData = {
        fitnessLevel: selectedLevel,
        goals: selectedGoals.map(goal => ({
          type: goal,
          target: null,
          deadline: null
        })),
        availability: {
          daysPerWeek: availability.daysPerWeek,
          preferredTimes: availability.preferredTimes,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        workoutPreferences: {
          preferredWorkoutTime: availability.preferredTimes[0] || 'morning',
          workoutDuration: 60,
          workoutEnvironment: 'gym'
        },
        onboardingStatus: 'completed',
        onboardingStep: 3,
        onboardingData: {
          completedAt: new Date().toISOString(),
          goals: selectedGoals,
          fitnessLevel: selectedLevel,
          availability: availability,
          recommendation: recommendation
        }
      };

      await ProfileService.updateProfile(user.id, profileData);
      await refreshProfile();
      
      // Navigate to recommended program
      navigate(`/programs/${recommendation.recommendedProgram}`);
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setError('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={STEPS.length}
      onBack={currentStep > 0 ? handleBack : undefined}
      title={STEPS[currentStep].title}
      subtitle={STEPS[currentStep].subtitle}
      onSkip={currentStep === 0 ? handleSkip : undefined}
      error={error || undefined}
    >
      {currentStep === 0 && (
        <GoalsStep
          selectedGoals={selectedGoals}
          onSelect={(goals) => {
            setSelectedGoals(goals);
            if (goals.length > 0) handleNext();
          }}
        />
      )}

      {currentStep === 1 && (
        <ExperienceStep
          selectedLevel={selectedLevel}
          onSelect={(level) => {
            setSelectedLevel(level);
            handleNext();
          }}
        />
      )}

      {currentStep === 2 && (
        <AvailabilityStep
          onSubmit={handleComplete}
        />
      )}
    </OnboardingLayout>
  );
};

export default OnboardingFlow;
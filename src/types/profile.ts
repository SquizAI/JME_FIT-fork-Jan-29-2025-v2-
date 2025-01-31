export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export interface UserGoal {
  type: 'weight-loss' | 'muscle-gain' | 'strength' | 'endurance';
  target?: string;
  deadline?: string;
}

export interface UserAvailability {
  daysPerWeek: number;
  preferredTimes: string[];
  timezone: string;
}

export interface UserMeasurements {
  height?: number;
  weight?: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  date: string;
  notes?: string;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  workoutPreferences: {
    location: 'gym' | 'home' | 'both';
    equipment: string[];
    focusAreas: string[];
  };
  dietaryRestrictions: string[];
  units: 'metric' | 'imperial';
}

export interface UserProfile {
  id: string;
  displayName: string;
  healthMetrics?: {
    bloodPressure?: string;
    restingHeartRate?: number;
    sleepQuality?: number;
    stressLevel?: number;
    hydration?: number;
  };
  workoutPreferences?: {
    preferredWorkoutTime?: string;
    workoutDuration?: number;
    restInterval?: string;
    musicPreference?: string;
    workoutEnvironment?: string;
  };
  progressPhotos?: {
    front: string[];
    side: string[];
    back: string[];
    timestamps: string[];
  };
  injuryHistory?: {
    currentInjuries: string[];
    pastInjuries: string[];
    movementRestrictions: string[];
  };
  nutritionPreferences?: {
    dietaryRestrictions: string[];
    allergies: string[];
    mealFrequency: number;
    preferredCuisines: string[];
    supplementUsage: string[];
  };
  achievements?: {
    badges: string[];
    milestones: string[];
    streaks: {
      current: number;
      longest: number;
      history: string[];
    };
  };
  socialConnections?: {
    workoutBuddies: string[];
    followers: string[];
    following: string[];
    privacySettings: {
      profileVisibility: 'public' | 'friends' | 'private';
      progressVisibility: 'public' | 'friends' | 'private';
    };
  };
  equipmentAccess?: {
    homeEquipment: string[];
    gymAccess: boolean;
    preferredEquipment: string[];
    resistanceBands: boolean;
    weights: boolean;
  };
  recoveryMetrics?: {
    sleepHours?: number;
    sorenessLevels: Record<string, number>;
    recoveryActivities: string[];
    stressFactors: string[];
  };
  personalizationSettings?: {
    motivationQuotes: boolean;
    reminderFrequency: 'daily' | 'weekly' | 'monthly';
    preferredContentFormat: 'video' | 'text' | 'audio';
    difficultyAutoAdjust: boolean;
    measurementSystem: 'metric' | 'imperial';
  };
  bio?: string;
  avatarUrl?: string;
  fitnessLevel: FitnessLevel;
  goals: UserGoal[];
  availability: UserAvailability;
  measurements: UserMeasurements[];
  preferences: UserPreferences;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}
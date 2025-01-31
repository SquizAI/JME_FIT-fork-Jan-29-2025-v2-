export interface GoalSuggestion {
  type: 'weight-loss' | 'muscle-gain' | 'strength' | 'endurance' | 'flexibility' | 'health';
  target: string;
  timeframe: string;
  milestones: string[];
  reasoning: string;
}

export interface QuestionnaireAnswer {
  goal: string;
  time: string;
  experience: string;
  challenges: string;
  preferences: string;
}

export interface ProgramRecommendation {
  recommendedProgram: 'app-workouts' | 'nutrition' | 'plus';
  explanation: string;
  customizedPlan: {
    workoutFrequency: string;
    focusAreas: string[];
    nutritionTips: string[];
    estimatedTimeframe: string;
  };
  additionalRecommendations: string[];
}
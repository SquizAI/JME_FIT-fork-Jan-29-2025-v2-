import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingDown, Dumbbell, Timer, Brain, Plus } from 'lucide-react';
import { OpenAIService } from '../../services/openai';
import type { GoalSuggestion } from '../../types/questionnaire';

interface GoalsStepProps {
  onSelect: (goals: string[]) => void;
  selectedGoals: string[];
}

const predefinedGoals = [
  {
    id: 'weight-loss',
    label: 'Weight Loss',
    icon: TrendingDown,
    description: 'Lose fat and improve body composition'
  },
  {
    id: 'muscle-gain',
    label: 'Build Muscle',
    icon: Dumbbell,
    description: 'Gain muscle mass and strength'
  },
  {
    id: 'strength',
    label: 'Get Stronger',
    icon: Target,
    description: 'Improve overall strength and power'
  },
  {
    id: 'endurance',
    label: 'Boost Endurance',
    icon: Timer,
    description: 'Enhance cardiovascular fitness'
  }
];

const GoalsStep: React.FC<GoalsStepProps> = ({ onSelect, selectedGoals }) => {
  const [aiSuggestions, setAiSuggestions] = useState<GoalSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAiSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const suggestions = await OpenAIService.getGoalSuggestions({
        currentLevel: 'beginner', // This should come from previous step
        interests: ['fitness', 'health'],
        limitations: []
      });
      if (Array.isArray(suggestions)) {
        setAiSuggestions(suggestions);
      } else {
        throw new Error('Invalid suggestions format');
      }
      setShowSuggestions(true);
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
      setError('Failed to get suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleGoal = (goalId: string) => {
    const newGoals = selectedGoals.includes(goalId)
      ? selectedGoals.filter(id => id !== goalId)
      : [...selectedGoals, goalId];
    onSelect(newGoals);
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4">
        {predefinedGoals.map(goal => {
          const Icon = goal.icon;
          const isSelected = selectedGoals.includes(goal.id);

          return (
            <motion.button
              key={goal.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleGoal(goal.id)}
              className={`w-full p-6 rounded-lg text-left transition-colors ${
                isSelected
                  ? 'bg-[#3dd8e8] text-black'
                  : 'bg-zinc-900 hover:bg-zinc-800'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${
                  isSelected ? 'bg-black/20' : 'bg-black'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{goal.label}</h3>
                  <p className={`text-sm ${
                    isSelected ? 'text-black/80' : 'text-gray-400'
                  }`}>
                    {goal.description}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="text-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={getAiSuggestions}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <Brain className="w-5 h-5 text-[#3dd8e8]" />
          Get AI Goal Suggestions
        </motion.button>
      </div>

      {showSuggestions && (
        aiSuggestions && aiSuggestions.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 p-6 rounded-lg"
        >
          <h3 className="text-lg font-semibold mb-4">AI Suggested Goals</h3>
          <div className="space-y-4">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="bg-black p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{suggestion.target}</h4>
                  <span className="text-sm text-[#3dd8e8]">{suggestion.timeframe}</span>
                </div>
                <p className="text-sm text-gray-400 mb-3">{suggestion.reasoning}</p>
                <div className="space-y-2">
                  {suggestion.milestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                      <Plus className="w-4 h-4 text-[#3dd8e8]" />
                      {milestone}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        ) : (
          <div className="text-center text-gray-400">
            {error || 'No suggestions available'}
          </div>
        )
      )}
    </div>
  );
};

export default GoalsStep;
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Apple, Coffee, Utensils, Moon, ArrowLeft } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { useNavigate } from 'react-router-dom';

const NutritionLog = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const navigate = useNavigate();

  const meals = [
    {
      id: 1,
      type: 'breakfast',
      time: '08:00 AM',
      foods: [
        { name: 'Oatmeal', calories: 300, protein: 10, carbs: 45, fat: 6 },
        { name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0 }
      ]
    },
    {
      id: 2,
      type: 'lunch',
      time: '12:30 PM',
      foods: [
        { name: 'Chicken Salad', calories: 450, protein: 35, carbs: 20, fat: 15 }
      ]
    }
  ];

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast':
        return Coffee;
      case 'lunch':
        return Utensils;
      case 'dinner':
        return Moon;
      default:
        return Apple;
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-zinc-800 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-3xl font-bold">Nutrition Log</h1>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 bg-[#3dd8e8] text-black px-4 py-2 rounded-lg"
            >
              <Plus className="w-5 h-5" />
              Add Meal
            </motion.button>
          </div>

          <div className="bg-zinc-900 rounded-lg p-6">
            <div className="grid gap-6">
              {meals.map((meal) => {
                const MealIcon = getMealIcon(meal.type);
                const totalCalories = meal.foods.reduce((sum, food) => sum + food.calories, 0);
                const totalProtein = meal.foods.reduce((sum, food) => sum + food.protein, 0);
                const totalCarbs = meal.foods.reduce((sum, food) => sum + food.carbs, 0);
                const totalFat = meal.foods.reduce((sum, food) => sum + food.fat, 0);

                return (
                  <motion.div
                    key={meal.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-black p-4 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-zinc-900 rounded-lg">
                          <MealIcon className="w-6 h-6 text-[#3dd8e8]" />
                        </div>
                        <div>
                          <h3 className="font-semibold capitalize">{meal.type}</h3>
                          <p className="text-sm text-gray-400">{meal.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{totalCalories} cal</p>
                        <p className="text-sm text-gray-400">
                          P: {totalProtein}g • C: {totalCarbs}g • F: {totalFat}g
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {meal.foods.map((food, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">{food.name}</span>
                          <span>{food.calories} cal</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default NutritionLog;
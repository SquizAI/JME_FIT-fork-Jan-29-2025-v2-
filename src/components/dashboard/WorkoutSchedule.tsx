import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Dumbbell, Plus, ArrowLeft } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { useNavigate } from 'react-router-dom';

const WorkoutSchedule = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const navigate = useNavigate();

  const workouts = [
    {
      id: 1,
      title: 'Upper Body Strength',
      time: '07:00 AM',
      duration: '60 min',
      type: 'strength'
    },
    {
      id: 2,
      title: 'HIIT Cardio',
      time: '05:30 PM',
      duration: '45 min',
      type: 'cardio'
    }
  ];

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
              <h1 className="text-3xl font-bold">Workout Schedule</h1>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 bg-[#3dd8e8] text-black px-4 py-2 rounded-lg"
            >
              <Plus className="w-5 h-5" />
              Schedule Workout
            </motion.button>
          </div>

          <div className="bg-zinc-900 rounded-lg p-6">
            <div className="grid gap-6">
              {workouts.map((workout) => (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-black p-4 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-zinc-900 rounded-lg">
                        <Dumbbell className="w-6 h-6 text-[#3dd8e8]" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{workout.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {workout.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {workout.duration}
                          </div>
                        </div>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-[#3dd8e8]"
                    >
                      Edit
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default WorkoutSchedule;
import { supabase } from '../lib/supabase';
import type { UserProfile, UserMeasurements } from '../types/profile';

interface PaymentMethod {
  id: string;
  payment_type: string;
  last_four: string;
  expiry_date: string;
  is_default: boolean;
}

interface UserPreferences {
  theme: string;
  notifications: {
    order_updates: boolean;
    promotional_emails: boolean;
    workout_reminders: boolean;
  };
  default_payment_id?: string;
  default_shipping_address?: any;
}

export const ProfileService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        display_name,
        bio,
        avatar_url,
        fitness_level,
        goals,
        availability,
        preferences,
        created_at,
        updated_at
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;

    // Fetch user preferences
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    return {
      ...data,
      preferences: preferences || {
        theme: 'dark',
        notifications: {
          order_updates: true,
          promotional_emails: true,
          workout_reminders: true
        }
      }
    };
  },

  async savePaymentMethod(userId: string, paymentMethod: Omit<PaymentMethod, 'id'>) {
    const { data, error } = await supabase
      .from('saved_payment_methods')
      .insert({
        user_id: userId,
        ...paymentMethod
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePreferences(userId: string, preferences: Partial<UserPreferences>) {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...preferences
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, profile: Partial<UserProfile>) {
    if (!userId) throw new Error('User ID is required');
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        display_name: profile.displayName,
        bio: profile.bio,
        avatar_url: profile.avatarUrl,
        fitness_level: profile.fitnessLevel,
        goals: profile.goals,
        availability: profile.availability,
        preferences: profile.preferences,
        progress_photos: profile.progressPhotos,
        achievements: profile.achievements,
        social_connections: profile.socialConnections,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('*')
      .single();

    if (error) throw error;
    
    // Transform snake_case to camelCase
    return {
      id: data.id,
      displayName: data.display_name,
      bio: data.bio,
      avatarUrl: data.avatar_url,
      fitnessLevel: data.fitness_level,
      goals: data.goals,
      availability: data.availability,
      preferences: data.preferences,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateHealthMetrics(userId: string, metrics: UserProfile['healthMetrics']) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        health_metrics: metrics,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addProgressPhoto(userId: string, type: 'front' | 'side' | 'back', photoUrl: string) {
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('progress_photos')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const progressPhotos = profile.progress_photos || {
      front: [],
      side: [],
      back: [],
      timestamps: []
    };

    progressPhotos[type].push(photoUrl);
    progressPhotos.timestamps.push(new Date().toISOString());

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        progress_photos: progressPhotos,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) throw updateError;
  },

  async getAchievements(userId: string) {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements (*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getSocialConnections(userId: string) {
    const { data, error } = await supabase
      .from('social_connections')
      .select(`
        *,
        connected_profile:connected_user_id (
          id,
          display_name,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (error) throw error;
    return data;
  },

  async addMeasurement(userId: string, measurement: Omit<UserMeasurements, 'id'>) {
    const { data, error } = await supabase
      .from('user_measurements')
      .upsert({
        user_id: userId,
        date: measurement.date,
        weight: measurement.weight,
        body_fat: measurement.bodyFat,
        chest: measurement.chest,
        waist: measurement.waist,
        hips: measurement.hips,
        arms: measurement.arms,
        thighs: measurement.thighs,
        notes: measurement.notes
      }, { onConflict: 'user_id,date' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMeasurements(userId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('user_measurements')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (startDate && endDate) {
      query = query
        .gte('date', startDate)
      console.error('Profile update error:', error);
      throw new Error('Failed to update profile');
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  async completeOnboarding(userId: string, data: {
    fitnessLevel: string;
    goals: any[];
    availability: any;
  }) {
    const { error } = await supabase
      .from('profiles')
      .update({
        fitness_level: data.fitnessLevel,
        fitness_goals: data.goals,
        availability: data.availability,
        onboarding_status: 'completed',
        onboarding_step: 3,
        onboarding_data: {
          completedAt: new Date().toISOString(),
          ...data
        }
      })
      .eq('id', userId);

    if (error) throw error;
  },

  async skipOnboarding(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .update({
        onboarding_status: 'completed',
        onboarding_step: 3,
        onboarding_data: {
          skippedAt: new Date().toISOString(),
          skipped: true
        }
      })
      .eq('id', userId);

    if (error) throw error;
  },

  async updateAchievements(userId: string, achievements: UserProfile['achievements']) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        achievements,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSocialConnections(userId: string, connections: UserProfile['socialConnections']) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        social_connections: connections,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    
    // Transform snake_case to camelCase
    return {
      id: data.id,
      displayName: data.display_name,
      bio: data.bio,
      avatarUrl: data.avatar_url,
      fitnessLevel: data.fitness_level,
      goals: data.goals,
      availability: data.availability,
      preferences: data.preferences,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
};
import { supabase } from './supabaseClient';

export const fetchConfig = async () => {
  const { data, error } = await supabase.from('config').select('*');
  if (error) {
    console.error('Error fetching config:', error);
    return null;
  }
  return data && data.length > 0 ? data[0] : null;
};

export const fetchUsers = async () => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('Error fetching users:', error);
    return null;
  }
  return data;
};

export const fetchQuestions = async () => {
  const { data, error } = await supabase.from('questions').select('*');
  if (error) {
    console.error('Error fetching questions:', error);
    return null;
  }
  return data;
};

export const fetchScrapbook = async (userId) => {
  const { data, error } = await supabase.from('scrapbook').select('*').eq('userId', userId);
  if (error) {
    console.error('Error fetching scrapbook:', error);
    return null;
  }
  // The local backend returned an empty structure if not found
  return data && data.length > 0 ? data[0] : { userId, photos: [], messages: [] };
};

export const fetchOpinions = async () => {
  const { data, error } = await supabase.from('opinions').select('*');
  if (error) {
    console.error('Error fetching opinions:', error);
    return null;
  }
  return data;
};

export const fetchAnonymous = async () => {
  const { data, error } = await supabase.from('anonymous').select('*');
  if (error) {
    console.error('Error fetching anonymous:', error);
    return null;
  }
  return data;
};

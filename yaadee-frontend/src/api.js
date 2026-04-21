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

export const fetchPolls = async () => {
  const { data, error } = await supabase.from('polls').select('*').order('created_at', { ascending: false });
  if (error) console.error('Error fetching polls:', error);
  return data;
};

export const createPoll = async (question, options) => {
  const { data, error } = await supabase.from('polls').insert([
    { question, options, status: 'pending' }
  ]).select();
  if (error) console.error('Error creating poll:', error);
  return data;
};

export const startPoll = async (id) => {
  const { data, error } = await supabase.from('polls')
    .update({ status: 'active', started_at: new Date().toISOString() })
    .eq('id', id).select();
  if (error) console.error('Error starting poll:', error);
  return data;
};

export const closePoll = async (id) => {
  const { data, error } = await supabase.from('polls')
    .update({ status: 'completed' })
    .eq('id', id).select();
  if (error) console.error('Error closing poll:', error);
  return data;
};

export const submitVote = async (pollId, selectedOption, voterName) => {
  const { data, error } = await supabase.from('votes').insert([
    { poll_id: pollId, selected_option: selectedOption, voter_name: voterName }
  ]).select();
  if (error) console.error('Error submitting vote:', error);
  return data;
};

export const fetchPollResults = async (pollId) => {
  const { data, error } = await supabase.from('votes').select('selected_option').eq('poll_id', pollId);
  if (error) console.error('Error fetching poll results:', error);
  return data;
};

export const subscribeToActivePolls = (callback) => {
  return supabase.channel('polls-channel')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'polls' }, (payload) => {
      if (payload.new.status === 'active') {
        callback(payload.new);
      }
    })
    .subscribe();
};

export const subscribeToCompletedPolls = (callback) => {
  return supabase.channel('polls-completed-channel')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'polls' }, (payload) => {
      if (payload.new.status === 'completed') {
        callback(payload.new);
      }
    })
    .subscribe();
};

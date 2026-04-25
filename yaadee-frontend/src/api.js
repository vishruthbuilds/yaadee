import { supabase } from './supabaseClient';

/**
 * Compresses an image file using Canvas.
 * Resizes to a max width/height while maintaining aspect ratio and reduces quality.
 */
export const compressImage = (file, maxWidth = 1200, quality = 0.7) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          },
          'image/jpeg',
          quality
        );
      };
    };
  });
};

/**
 * Uploads a file to Supabase Storage and returns the public URL.
 */
export const uploadFile = async (file, bucket = 'yaadee') => {
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error uploading to storage:', error);
    // If bucket doesn't exist, this might fail. 
    // In a real app, you'd ensure the bucket exists or handle the specific error.
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
};

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

export const createPoll = async (question) => {
  const { data, error } = await supabase.from('polls').insert([
    { question, options: [], status: 'pending' }
  ]).select();
  if (error) console.error('Error creating poll:', error);
  return data;
};

export const startPoll = async (id, durationSeconds = 30) => {
  const expiresAt = new Date(Date.now() + durationSeconds * 1000).toISOString();
  const { data, error } = await supabase.from('polls')
    .update({ status: 'active', started_at: new Date().toISOString(), options: [expiresAt] })
    .eq('id', id).select();
  if (error) console.error('Error starting poll:', error);
  return data;
};

export const extendPoll = async (id, extraSeconds = 10) => {
  // Fetch current to get options
  const { data: pollData } = await supabase.from('polls').select('options').eq('id', id).single();
  if (pollData && pollData.options && pollData.options.length > 0) {
    const currentExpiresAt = new Date(pollData.options[0]).getTime();
    const newExpiresAt = new Date(currentExpiresAt + extraSeconds * 1000).toISOString();
    
    const { data, error } = await supabase.from('polls')
      .update({ options: [newExpiresAt] })
      .eq('id', id).select();
    if (error) console.error('Error extending poll:', error);
    return data;
  }
  return null;
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

export const subscribeToVotes = (pollId, callback) => {
  const channel = supabase.channel(`votes-${pollId}-${Math.random()}`);
  channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votes' }, (payload) => {
    if (payload.new.poll_id === pollId) {
      callback(payload.new);
    }
  }).subscribe();
  return channel;
};

export const subscribeToActivePolls = (callback) => {
  const channel = supabase.channel(`polls-active-${Math.random()}`);
  channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'polls' }, (payload) => {
      if (payload.new.status === 'active') {
        callback(payload.new);
      }
    })
    .subscribe();
  return channel;
};

export const subscribeToCompletedPolls = (callback) => {
  const channel = supabase.channel(`polls-completed-${Math.random()}`);
  channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'polls' }, (payload) => {
      if (payload.new.status === 'completed') {
        callback(payload.new);
      }
    })
    .subscribe();
  return channel;
};

export const unsubscribeChannel = (channel) => {
  if (channel) supabase.removeChannel(channel);
};

export const addUser = async (name, photoUrl, bio) => {
  const result = await supabase.from('users').insert([
    { id: crypto.randomUUID(), name, photoUrl: photoUrl || null, quote: bio || '' }
  ]).select();
  if (result.error) console.error('Error adding user:', result.error);
  return result;
};

export const updateUser = async (id, name, photoUrl, bio) => {
  const result = await supabase.from('users').update({ name, photoUrl: photoUrl || null, quote: bio || '' }).eq('id', id).select();
  if (result.error) console.error('Error updating user:', result.error);
  return result;
};

export const deleteUser = async (id) => {
  const result = await supabase.from('users').delete().eq('id', id);
  if (result.error) console.error('Error deleting user:', result.error);
  return result;
};

export const deletePoll = async (id) => {
  // Supabase delete might fail if foreign keys (votes) exist, unless ON DELETE CASCADE is set.
  // We'll delete votes first to be safe.
  await supabase.from('votes').delete().eq('poll_id', id);
  const { data, error } = await supabase.from('polls').delete().eq('id', id);
  if (error) console.error('Error deleting poll:', error);
  return data;
};

export const addQuestion = async (text, options, correctAnswer) => {
  const { data, error } = await supabase.from('questions').insert([
    { id: crypto.randomUUID(), text, options, correctAnswer }
  ]).select();
  if (error) console.error('Error adding question:', error);
  return data;
};

export const deleteQuestion = async (id) => {
  const { data, error } = await supabase.from('questions').delete().eq('id', id);
  if (error) console.error('Error deleting question:', error);
  return data;
};

// --- New Supabase Migration Functions ---

export const addOpinion = async (text, authorName) => {
  const { data, error } = await supabase.from('opinions').insert([
    { id: crypto.randomUUID(), text, authorName: authorName || 'Anonymous', created_at: new Date().toISOString() }
  ]).select();
  if (error) console.error('Error adding opinion:', error);
  return { data, error };
};

export const addAnonymousMessage = async (text) => {
  const { data, error } = await supabase.from('anonymous').insert([
    { id: crypto.randomUUID(), text, created_at: new Date().toISOString() }
  ]).select();
  if (error) console.error('Error adding anonymous message:', error);
  return { data, error };
};

export const addScrapbookMessage = async (userId, text, from) => {
  // First fetch current scrapbook
  const { data: existing } = await supabase.from('scrapbook').select('*').eq('userId', userId).single();
  
  const newMessage = {
    id: crypto.randomUUID(),
    text,
    from: from || 'Anonymous',
    timestamp: new Date().toISOString()
  };

  if (existing) {
    const updatedMessages = [...(existing.messages || []), newMessage];
    const { data, error } = await supabase.from('scrapbook')
      .update({ messages: updatedMessages })
      .eq('userId', userId)
      .select();
    return { data, error };
  } else {
    const { data, error } = await supabase.from('scrapbook').insert([
      { userId, messages: [newMessage], photos: [] }
    ]).select();
    return { data, error };
  }
};

export const addScrapbookPhoto = async (userId, photoUrl) => {
  const { data: existing } = await supabase.from('scrapbook').select('*').eq('userId', userId).single();
  
  if (existing) {
    const updatedPhotos = [...(existing.photos || []), photoUrl];
    const { data, error } = await supabase.from('scrapbook')
      .update({ photos: updatedPhotos })
      .eq('userId', userId)
      .select();
    return { data, error };
  } else {
    const { data, error } = await supabase.from('scrapbook').insert([
      { userId, messages: [], photos: [photoUrl] }
    ]).select();
    return { data, error };
  }
};

export const fetchTimeCapsule = async () => {
  const { data, error } = await supabase.from('time_capsule').select('*').single();
  if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
    console.error('Error fetching time capsule:', error);
  }
  return data || { book_images: [], reel_images: [], final_video: null };
};

export const updateTimeCapsule = async (updates) => {
  // Try to update the first row
  const { data: existing } = await supabase.from('time_capsule').select('id').single();
  
  if (existing) {
    const { data, error } = await supabase.from('time_capsule')
      .update(updates)
      .eq('id', existing.id)
      .select();
    return { data, error };
  } else {
    const { data, error } = await supabase.from('time_capsule')
      .insert([updates])
      .select();
    return { data, error };
  }
};

export const fetchThrowbacks = async () => {
  const { data, error } = await supabase.from('throwbacks').select('*');
  if (error) console.error('Error fetching throwbacks:', error);
  return data || [];
};

export const addThrowback = async (name, photo, bio) => {
  const { data, error } = await supabase.from('throwbacks').insert([
    { id: crypto.randomUUID(), name, photo, bio }
  ]).select();
  return { data, error };
};

export const updateThrowback = async (id, name, photo, bio) => {
  const { data, error } = await supabase.from('throwbacks').update({ name, photo, bio }).eq('id', id).select();
  return { data, error };
};

export const deleteThrowback = async (id) => {
  const { error } = await supabase.from('throwbacks').delete().eq('id', id);
  return { error };
};

// --- Class Chaos Game ---

export const fetchChaosQuestions = async () => {
  const { data, error } = await supabase.from('chaos_questions').select('*');
  return { data, error };
};

export const addChaosQuestion = async (type, data, answer) => {
  const { data: result, error } = await supabase.from('chaos_questions').insert([
    { id: crypto.randomUUID(), type, data, answer }
  ]).select();
  return { data: result, error };
};

export const updateChaosQuestion = async (id, updates) => {
  const { data, error } = await supabase.from('chaos_questions').update(updates).eq('id', id).select();
  return { data, error };
};

export const deleteChaosQuestion = async (id) => {
  const { error } = await supabase.from('chaos_questions').delete().eq('id', id);
  return { error };
};

export const fetchChaosGameState = async () => {
  const { data, error } = await supabase.from('chaos_game_state').select('*').single();
  if (error && error.code === 'PGRST116') {
    // Initialize if not exists
    const initialState = { 
      id: '00000000-0000-0000-0000-000000000000', 
      status: 'lobby', 
      current_question_index: 0, 
      timer_remaining: 30, 
      is_paused: false 
    };
    await supabase.from('chaos_game_state').insert([initialState]);
    return { data: initialState, error: null };
  }
  return { data, error };
};

export const updateChaosGameState = async (updates) => {
  const { data, error } = await supabase.from('chaos_game_state')
    .update(updates)
    .eq('id', '00000000-0000-0000-0000-000000000000')
    .select();
  return { data, error };
};

export const joinChaosGame = async (playerName) => {
  // Check if player already exists to avoid duplicates
  const { data: existing } = await supabase.from('chaos_players').select('*').eq('name', playerName);
  if (existing && existing.length > 0) {
    return { data: existing, error: null };
  }

  const { data, error } = await supabase.from('chaos_players').insert([
    { id: crypto.randomUUID(), name: playerName, score: 0 }
  ]).select();
  return { data, error };
};

export const fetchChaosPlayers = async () => {
  const { data, error } = await supabase.from('chaos_players').select('*').order('score', { ascending: false });
  return { data, error };
};

export const submitChaosResponse = async (playerId, questionId, response) => {
  const { data: question } = await supabase.from('chaos_questions').select('*').eq('id', questionId).single();
  if (!question) return { error: 'Question not found' };

  let points = 0;
  if (question.type === 'timeline') {
    // response is array of indices [0, 1, 2, 3] in user's order
    const correctOrder = JSON.parse(question.answer); 
    correctOrder.forEach((val, i) => {
      if (response[i] === val) points += 5; // 5 pts per correct position
    });
  } else {
    // image_guess or nickname
    if (response.toLowerCase().trim() === question.answer.toLowerCase().trim()) {
      points = 20; // 20 pts for correct guess
    }
  }

  if (points > 0) {
    const { data: player } = await supabase.from('chaos_players').select('score').eq('id', playerId).single();
    const newScore = (player?.score || 0) + points;
    await supabase.from('chaos_players').update({ score: newScore }).eq('id', playerId);
  }
  return { error: null, points };
};

export const subscribeToReactions = (callback) => {
  const channel = supabase.channel('global-reactions');
  channel.on('broadcast', { event: 'emoji-reaction' }, (payload) => {
    callback(payload.payload);
  }).subscribe();
  return channel;
};

export const sendReaction = (emoji) => {
  const channel = supabase.channel('global-reactions');
  channel.send({
    type: 'broadcast',
    event: 'emoji-reaction',
    payload: { emoji, id: Math.random() }
  });
};

export const resetChaosGame = async () => {
  await supabase.from('chaos_players').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  return updateChaosGameState({ status: 'lobby', current_question_index: 0, timer_remaining: 30, is_paused: false });
};

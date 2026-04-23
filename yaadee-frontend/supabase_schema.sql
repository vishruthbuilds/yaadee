-- CLASS CHAOS TABLES

-- 1. Chaos Questions Table
-- Stores the memory-based quiz questions
CREATE TABLE IF NOT EXISTS public.chaos_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'image_guess', 'nickname', 'timeline'
    data JSONB NOT NULL, -- Stores images or nickname strings
    answer TEXT NOT NULL, -- The correct student name or chronological order
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Chaos Players Table
-- Tracks participants and their live quiz scores
CREATE TABLE IF NOT EXISTS public.chaos_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Chaos Game State Table
-- Synchronizes the game phases for all connected users
CREATE TABLE IF NOT EXISTS public.chaos_game_state (
    id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000000',
    status TEXT DEFAULT 'lobby', -- 'lobby', 'active', 'ended', 'revealed'
    current_question_index INTEGER DEFAULT 0,
    timer_remaining INTEGER DEFAULT 30,
    is_paused BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert initial game state row if it doesn't exist
INSERT INTO public.chaos_game_state (id, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'lobby')
ON CONFLICT (id) DO NOTHING;


-- REAL-TIME ENABLEMENT
-- Ensure these tables are included in the 'supabase_realtime' publication
-- Run this in the SQL Editor to enable real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.chaos_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chaos_game_state;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chaos_questions;


-- SECURITY POLICIES (RLS)
-- Allow all users to read questions and game state
ALTER TABLE public.chaos_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.chaos_questions FOR SELECT USING (true);

ALTER TABLE public.chaos_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.chaos_players FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update" ON public.chaos_players FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.chaos_game_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.chaos_game_state FOR SELECT USING (true);
CREATE POLICY "Allow public update" ON public.chaos_game_state FOR UPDATE USING (true);

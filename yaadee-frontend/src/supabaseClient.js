import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mrwsqdxmshnfhiyjfxuq.supabase.co';
const supabaseKey = 'sb_publishable_1dIfkK80bFgThrWaC29e0w_Gmd5YnBx';

export const supabase = createClient(supabaseUrl, supabaseKey);

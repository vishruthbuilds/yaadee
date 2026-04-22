const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mrwsqdxmshnfhiyjfxuq.supabase.co';
const supabaseKey = 'sb_publishable_1dIfkK80bFgThrWaC29e0w_Gmd5YnBx';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Users:', data);
  }
}

checkUsers();

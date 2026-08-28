import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqjcfohjfsvdzylgvywp.supabase.co';
const supabaseAnonKey = 'sb_publishable_3WxoJr7UnrRVK3X7q2onaA_v7XhKIer';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

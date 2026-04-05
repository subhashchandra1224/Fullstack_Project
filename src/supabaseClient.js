import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://rydyylnpexiobejpcuie.supabase.co"
const supabaseAnonKey = "sb_publishable_vWIlT-V57WY1me-V7n_Jcw_INVgszyT"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
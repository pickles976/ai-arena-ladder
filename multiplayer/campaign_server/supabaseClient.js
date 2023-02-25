import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kbnorlxawefgklyeofdm.supabase.co'
// const supabaseKey = process.env.SUPABASE_KEY
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtibm9ybHhhd2VmZ2tseWVvZmRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzY1Njg2MTUsImV4cCI6MTk5MjE0NDYxNX0.uzdXwAq2i5eL35cBdmHtqEywiKg-2IGBzcuq5gfYLVM"

const supabase = createClient(supabaseUrl, supabaseKey)

export async function getAllChampions() {
  let { data: champion, error } = await supabase
    .from(`champion`)
    .select(`*`)
  return champion
}

export async function getAllCode(code_ids) {
  let { data: code, error } = await supabase
    .from('TacticalCode')
    .select('*')
    .in('id', code_ids)
  return code
}

export async function getAllUsers(user_ids) {
  let { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', user_ids)
  return users
}
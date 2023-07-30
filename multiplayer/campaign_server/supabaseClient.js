import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kbnorlxawefgklyeofdm.supabase.co'
const supabaseKey = process.env.SUPABASE_SECRET_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

export async function getAllChampions() {
  let { data: champion, error } = await supabase
    .from(`champion`)
    .select(`*`)
    .eq('active', true)
  return champion
}

export async function getAllCode(code_ids) {
  let { data: code, error } = await supabase
    .from('battle_code')
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

export async function createWar(numStars, seed, champions) {
  const { data, error } = await supabase
  .from('galactic_war')
  .insert([
    { 'num_systems': numStars, 'seed': seed, 'champions': champions },
  ])
  .select()
  return data
}

export async function createStars(stars) { 
  const { data, error } = await supabase
  .from('star_systems')
  .insert(stars)
  .select()
  return data
}

export async function updateStars(stars) {
  const { data, error } = await supabase
  .from('star_systems')
  .upsert(stars)
  if (error) throw error
}

export async function updateChampions(champions) {
  const { data, error } = await supabase
  .from('champion')
  .upsert(champions)
  .select()
  // console.log(data, error)
}

export async function updateGalaxy(galaxy) {
  const { data, error } = await supabase
  .from('galactic_war')
  .upsert(galaxy)
}

export async function deleteAllStars(galaxy_id) {
  const { data, error } = await supabase
  .from('star_systems')
  .delete()
  .eq('galactic_war', galaxy_id)
}

import { supabase } from './supabase';
import { crypto } from 'crypto'; // Note: in RN use a compatible crypto lib or simple random string

// Simple unique token generator for RN
function generateToken(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createInviteToken(roomId: string) {
  const token = generateToken();

  const { data, error } = await supabase
    .from('invites')
    .insert({
      room_id: roomId,
      token: token,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating invite token:', error);
    throw error;
  }

  return data.token;
}

export async function validateInviteToken(token: string) {
  const { data, error } = await supabase
    .from('invites')
    .select('room_id, expires_at')
    .eq('token', token)
    .single();

  if (error || !data) {
    return { valid: false, error: 'Бөлме табылмады немесе сілтеме жарамсыз' };
  }

  const now = new Date();
  if (data.expires_at && new Date(data.expires_at) < now) {
    return { valid: false, error: 'Сілтеменің мерзімі өтіп кетті' };
  }

  return { valid: true, roomId: data.room_id };
}

export async function markInviteUsed(token: string) {
  await supabase
    .from('invites')
    .rpc('increment', { row_id: token, col_name: 'used_count' }); // Needs a DB function
}

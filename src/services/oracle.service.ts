import { IS_MOCK_MODE } from '@/constants/config';
import { supabase } from '@/lib/supabase/client';
import { mockDelay } from '@/mocks/delay';

export interface Question {
  id: string;
  user_id: string;
  question_text: string;
  answer: 'YES' | 'NO';
  created_at: string;
}

// In-memory store for mock mode
const mockStore: Question[] = [];

async function saveQuestion(userId: string, questionText: string, answer: 'YES' | 'NO'): Promise<Question> {
  if (IS_MOCK_MODE) {
    await mockDelay(300);
    const q: Question = {
      id: `${Date.now()}-${Math.random()}`,
      user_id: userId,
      question_text: questionText,
      answer,
      created_at: new Date().toISOString(),
    };
    mockStore.unshift(q);
    return q;
  }

  const { data, error } = await supabase
    .from('questions')
    .insert({ user_id: userId, question_text: questionText, answer })
    .select()
    .single();

  if (error) throw error;
  return data as Question;
}

async function getQuestions(userId: string): Promise<Question[]> {
  if (IS_MOCK_MODE) {
    await mockDelay(200);
    return [...mockStore];
  }

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Question[];
}

export const oracleService = { saveQuestion, getQuestions };

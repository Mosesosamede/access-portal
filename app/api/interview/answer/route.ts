import { GoogleGenAI } from '@google/genai';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Lazily get Groq client
let groqClient: Groq | null = null;
function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is required for audio transcription.');
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

function getServerSupabase(cookieStore: any) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {}
      },
    },
  });
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = getServerSupabase(cookieStore);

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;
    const questionNumberStr = formData.get('questionNumber') as string;
    const questionText = formData.get('questionText') as string;
    const videoUrl = formData.get('videoUrl') as string;
    const durationStr = formData.get('duration') as string;
    const interviewId = formData.get('interviewId') as string;

    if (!questionNumberStr || !questionText || !videoUrl || !interviewId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const questionNumber = parseInt(questionNumberStr, 10);
    const duration = parseInt(durationStr || '0', 10);

    let transcript = '';
    let transcriptionStatus: 'transcribed' | 'failed' | 'pending' = 'pending';

    if (audioFile && audioFile.size > 0) {
      const arrayBuffer = await audioFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileExt = audioFile.name ? path.extname(audioFile.name) : '.webm';
      const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}${fileExt}`);

      try {
        await fs.promises.writeFile(tempFilePath, buffer);

        // Transcribe audio using Groq Whisper model
        const groq = getGroqClient();
        const transcription = await groq.audio.transcriptions.create({
          file: fs.createReadStream(tempFilePath),
          model: 'whisper-large-v3',
          temperature: 0,
          response_format: 'verbose_json',
        });

        transcript = transcription.text?.trim() || '';
        transcriptionStatus = 'transcribed';
      } catch (transcribeError) {
        console.error('Groq Whisper Transcription failed:', transcribeError);
        transcript = '[Audio Transcription Failed]';
        transcriptionStatus = 'failed';
      } finally {
        try {
          await fs.promises.unlink(tempFilePath);
        } catch (unlinkErr) {
          console.error('Failed to delete temp audio file:', unlinkErr);
        }
      }
    } else {
      transcript = '[No audio file provided]';
      transcriptionStatus = 'failed';
    }

    // Save answer to Database (will trigger update of current_question via the DB trigger)
    const { data: answer, error: insertError } = await supabase
      .from('interview_answers')
      .insert({
        interview_id: interviewId,
        user_id: user.id,
        question_number: questionNumber,
        question: questionText,
        video_url: videoUrl,
        duration_seconds: duration,
        transcript: transcript,
        upload_status: 'uploaded',
        transcription_status: transcriptionStatus
      })
      .select('*')
      .single();

    if (insertError) {
      // Let's try upserting in case of retry
      const { data: upsertedAnswer, error: upsertError } = await supabase
        .from('interview_answers')
        .upsert({
          interview_id: interviewId,
          user_id: user.id,
          question_number: questionNumber,
          question: questionText,
          video_url: videoUrl,
          duration_seconds: duration,
          transcript: transcript,
          upload_status: 'uploaded',
          transcription_status: transcriptionStatus
        }, {
          onConflict: 'interview_id,question_number'
        })
        .select('*')
        .single();

      if (upsertError) {
        console.error('Insert/Upsert answer failed:', upsertError);
        return NextResponse.json({ error: upsertError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        answer: upsertedAnswer,
        transcript,
        message: 'Answer successfully saved and updated'
      });
    }

    return NextResponse.json({
      success: true,
      answer,
      transcript,
      message: 'Answer successfully saved'
    });
  } catch (error: any) {
    console.error('Answer API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

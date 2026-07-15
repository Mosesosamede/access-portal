import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = getServerSupabase(cookieStore);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's interview
    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (interviewError) {
      return NextResponse.json({ error: interviewError.message }, { status: 500 });
    }

    if (!interview) {
      return NextResponse.json({ exists: false });
    }

    // Fetch user's submitted answers
    const { data: answers, error: answersError } = await supabase
      .from('interview_answers')
      .select('*')
      .eq('interview_id', interview.id)
      .order('question_number', { ascending: true });

    if (answersError) {
      return NextResponse.json({ error: answersError.message }, { status: 500 });
    }

    // Fetch AI results if completed
    let aiResult = null;
    if (interview.status === 'completed' || interview.status === 'review_ongoing') {
      const { data: resData } = await supabase
        .from('interview_ai_results')
        .select('*')
        .eq('interview_id', interview.id)
        .maybeSingle();
      aiResult = resData;
    }

    return NextResponse.json({
      exists: true,
      interview,
      answers,
      aiResult
    });
  } catch (error: any) {
    console.error('Interview status GET error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = getServerSupabase(cookieStore);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if interview already exists
    const { data: existingInterview, error: checkError } = await supabase
      .from('interviews')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (existingInterview) {
      return NextResponse.json({
        success: true,
        interview: existingInterview,
        message: 'Resumed existing interview session'
      });
    }

    // Create new interview session
    const { data: newInterview, error: insertError } = await supabase
      .from('interviews')
      .insert({
        user_id: user.id,
        status: 'in_progress',
        current_question: 1,
        started_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Insert to history log
    await supabase.from('interview_status_history').insert({
      interview_id: newInterview.id,
      previous_status: null,
      new_status: 'in_progress',
      changed_by: 'system',
      reason: 'Interview session initiated'
    });

    return NextResponse.json({
      success: true,
      interview: newInterview,
      message: 'Created new interview session'
    });
  } catch (error: any) {
    console.error('Interview status POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

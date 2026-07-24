import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { full_name, email, phone_number, password, bookCodeId } = await req.json();

    if (!email || !full_name || !phone_number || !password || !bookCodeId) {
      return NextResponse.json({
        success: false,
        message: 'All fields (Full Name, Email, Phone Number, Password, and Book Code) are required.',
      }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(full_name).trim();
    const cleanPhone = String(phone_number).trim();

    const supabase = getServiceSupabase();

    // Step 1: Check existing account in registration_progress and applicants
    const { data: existingRp } = await supabase
      .from('registration_progress')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    const { data: existingApp } = await supabase
      .from('applicants')
      .select('id, user_id, onboarding_step, progress_percent')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingRp || existingApp) {
      const status = existingRp?.application_status || (existingApp ? 'Submitted' : 'Ongoing');
      const step = existingRp?.step_reached || existingApp?.onboarding_step || 1;

      if (status === 'Ongoing') {
        return NextResponse.json({
          success: false,
          isExistingAccount: true,
          applicationStatus: 'Ongoing',
          stepReached: step,
          message: 'Welcome back! Your application is still in progress.',
        });
      } else if (status === 'Submitted') {
        return NextResponse.json({
          success: false,
          isExistingAccount: true,
          applicationStatus: 'Submitted',
          message: 'Your application has already been submitted.',
        });
      }
    }

    // Step 2: Create Authentication Account
    let userId: string = '';

    // Check if user exists in auth or create user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: { full_name: cleanName, phone_number: cleanPhone },
    });

    if (authError) {
      if (authError.message?.toLowerCase().includes('already registered') || authError.message?.toLowerCase().includes('already been registered')) {
        // User already exists in auth
        // Try getting user list by email
        const { data: usersData } = await supabase.auth.admin.listUsers();
        const foundUser = usersData?.users?.find(u => u.email?.toLowerCase() === cleanEmail);
        if (foundUser) {
          userId = foundUser.id;
        } else {
          return NextResponse.json({
            success: false,
            isExistingAccount: true,
            applicationStatus: 'Ongoing',
            message: 'An account with this email already exists. Please log in to continue.',
          });
        }
      } else {
        console.error('Auth create user error:', authError);
        return NextResponse.json({
          success: false,
          message: authError.message || 'Error creating authentication account.',
        }, { status: 400 });
      }
    } else if (authData.user) {
      userId = authData.user.id;
    }

    // Step 3: Reserve the Book Code
    // Update matching record in book_codes (email_used = cleanEmail, is_used remains false until submission)
    const { error: bcErr } = await supabase
      .from('book_codes')
      .update({
        email_used: cleanEmail,
        assigned_to_email: cleanEmail,
      })
      .eq('id', bookCodeId);

    if (bcErr) {
      console.warn('Book code reservation warning:', bcErr.message);
    }

    // Step 4: Create Initial Applicant Record
    const initialApplicant = {
      user_id: userId,
      full_name: cleanName,
      email: cleanEmail,
      phone_number: cleanPhone,
      used_book_code_id: bookCodeId,
      onboarding_step: 1,
      progress_percent: 11,
      status_tag: 'Draft',
    };

    const { data: createdApp, error: appErr } = await supabase
      .from('applicants')
      .upsert(initialApplicant, { onConflict: 'email' })
      .select('id')
      .single();

    if (appErr) {
      console.error('Error creating initial applicant record:', appErr);
    }

    // Create / Upsert registration_progress record
    const { error: rpErr } = await supabase
      .from('registration_progress')
      .upsert({
        email: cleanEmail,
        user_id: userId,
        step_reached: 1,
        progress_percent: 11,
        application_status: 'Ongoing',
        last_updated: new Date().toISOString(),
      }, { onConflict: 'email' });

    if (rpErr) {
      console.error('Error updating registration_progress:', rpErr);
    }

    return NextResponse.json({
      success: true,
      userId,
      email: cleanEmail,
      fullName: cleanName,
      applicantId: createdApp?.id || null,
      message: 'Account created successfully.',
    });
  } catch (err: any) {
    console.error('Create account API error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Server error' }, { status: 500 });
  }
}

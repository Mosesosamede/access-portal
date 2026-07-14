import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PRICES } from '@/lib/constants';
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import { PaymentConfirmationEmail } from '@/components/emails/PaymentConfirmation';
import * as React from 'react';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  const { transaction_id, expectedCurrency, userEmail } = await req.json();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get referral code from HttpOnly cookie
  const referralCode = req.cookies.get('referral_code')?.value || '';

  // 1. Verify with Flutterwave
  const res = await fetch(
    `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
    {
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      },
    }
  );

  const data = await res.json();
  const tx = data.data;

  if (data.status !== 'success' || tx.status !== 'successful') {
    return NextResponse.json({ success: false, message: 'Payment verification failed' });
  }

  // Verification Logic
  const expectedAmount = PRICES[expectedCurrency as keyof typeof PRICES];
  
  if (
    tx.amount !== expectedAmount ||
    tx.currency !== expectedCurrency ||
    tx.customer.email !== userEmail
  ) {
    return NextResponse.json({ success: false, message: 'Payment mismatch' });
  }

  // 2. Verify existence
  const { data: existingTx, error: selectError } = await supabase
    .from('purchases')
    .select('id, reward_processed')
    .eq('transaction_id', transaction_id)
    .maybeSingle();

  if (selectError) {
    return NextResponse.json({ success: false, message: 'Database lookup error' }, { status: 500 });
  }

  let purchaseId = '';
  let isRewardProcessed = false;

  if (existingTx) {
    purchaseId = existingTx.id;
    isRewardProcessed = !!existingTx.reward_processed;
  } else {
    // 3. Insert Purchase
    const { data: purchase, error: pErr } = await supabase
      .from('purchases')
      .insert({
        transaction_id: transaction_id,
        customer_email: tx.customer.email,
        amount_paid: tx.amount,
        refercode: referralCode || null,
        reward_processed: false,
      })
      .select('id, reward_processed')
      .single();

    if (pErr) {
        console.error('Insert error:', pErr);
        return NextResponse.json({ success: false, message: 'Database insertion error' }, { status: 500 });
    }

    purchaseId = purchase.id;
    isRewardProcessed = false;
  }

  // Record referral rewards if referralCode is present and not already processed
  if (referralCode && !isRewardProcessed) {
    try {
      // 1. Fetch partner record from Firebase
      const partnersRef = db.collection('partners');
      const partnerSnapshot = await partnersRef.where('referralCode', '==', referralCode).get();

      if (!partnerSnapshot.empty) {
        const partnerDoc = partnerSnapshot.docs[0];
        const partnerData = partnerDoc.data();
        const partnerId = partnerData.partnerId;
        const rewardRate = Number(partnerData.rewardRate) || 0; // Fixed flat commission reward rate, e.g. 200 or 500

        // Create commission document
        const commsRef = db.collection('partner_commissions');
        const commDocRef = commsRef.doc();
        const commissionId = commDocRef.id;

        await commDocRef.set({
          commissionId,
          partnerId,
          purchaseId: purchaseId,
          transactionId: transaction_id,
          email: tx.customer.email,
          amountPaid: Number(tx.amount),
          commissionAmount: rewardRate,
          payoutStatus: 'pending',
          createdAt: FieldValue.serverTimestamp(),
        });

        // Update partner stats atomically
        const statsRef = db.collection('partner_stats').doc(partnerId);
        const statsDoc = await statsRef.get();

        if (!statsDoc.exists) {
          await statsRef.set({
            partnerId,
            totalClicks: 0,
            totalPurchases: 1,
            totalCommission: rewardRate,
            balance: rewardRate,
            lastUpdated: FieldValue.serverTimestamp(),
          });
        } else {
          await statsRef.update({
            totalPurchases: FieldValue.increment(1),
            totalCommission: FieldValue.increment(rewardRate),
            balance: FieldValue.increment(rewardRate),
            lastUpdated: FieldValue.serverTimestamp(),
          });
        }

        // Try to update the purchase record in Supabase to set reward_processed = true
        try {
          await supabase
            .from('purchases')
            .update({ reward_processed: true })
            .eq('id', purchaseId);
        } catch (subErr) {
          console.warn('Supabase update reward_processed column skipped/failed:', subErr);
        }
      }
    } catch (fireErr) {
      console.error('Error processing referral rewards:', fireErr);
    }
  }

  // 4. Retrieve generated code from database (handled by trigger)
  const { data: codeData, error: cErr } = await supabase
    .from('book_codes')
    .select('code_string')
    .eq('purchase_id', purchaseId)
    .single();

  if (cErr) {
      console.error('Code retrieval error:', cErr);
      return NextResponse.json({ success: false, message: 'Code retrieval error' }, { status: 500 });
  }

  // 5. Send Email
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // upgrade later with STARTTLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const emailHtml = await render(React.createElement(PaymentConfirmationEmail, { bookCode: codeData.code_string }));

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: 'Payment Confirmed — Access Your Portal 🚀',
      html: emailHtml,
    });
  } catch (error) {
    console.error('Email sending error:', error);
    // Don't fail the payment if email fails, but log it
  }

  return NextResponse.json({ success: true, code: codeData.code_string });
}

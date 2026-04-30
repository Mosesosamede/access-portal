import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateCode } from '@/lib/codeGenerator';

export async function POST(req: Request) {
  const secretHash = process.env.FLUTTERWAVE_HASH;
  const signature = req.headers.get('verif-hash');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  if (signature !== secretHash) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const payload = await req.json();

  if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
    const tx = payload.data;

    // Check for duplicates
    const { data: existingTx } = await supabase
        .from('purchases')
        .select('id')
        .eq('customer_email', tx.customer.email)
        .eq('amount_paid', tx.amount)
        .single();

    if (!existingTx) {
        // Insert Purchase
        const { data: purchase, error: pErr } = await supabase
            .from('purchases')
            .insert({
            customer_email: tx.customer.email,
            amount_paid: tx.amount,
            })
            .select('id')
            .single();

        if (!pErr && purchase) {
             // Generate and assign code
            await supabase
                .from('book_codes')
                .insert({
                code_string: generateCode(),
                purchase_id: purchase.id,
                is_used: false
                });
        }
    }
  }

  return NextResponse.json({ received: true });
}

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const secretHash = process.env.FLUTTERWAVE_HASH;
  const signature = req.headers.get('verif-hash');

  if (!signature || signature !== secretHash) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const payload = await req.json();

  console.log('Flutterwave webhook received:', payload.event, payload.data?.id);

  return NextResponse.json({ received: true });
}

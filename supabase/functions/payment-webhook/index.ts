import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

declare const Deno: { env: { get(name: string): string | undefined } };

serve(async (req: Request): Promise<Response> => {
  const signature = req.headers.get('x-paystack-signature')
  const secret = Deno.env.get('PAYSTACK_SECRET_KEY')

  // Verify signature
  // Note: For production, you MUST verify the signature using HMAC SHA512
  // const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
  // if (hash !== signature) ...

  const body = await req.json() as { event?: string; data?: Record<string, unknown> } | null
  const event = body?.event ?? ""
  const data = body?.data ?? {}

  if (event === 'charge.success') {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const reference = String(data.reference ?? "")
    const metadata = data.metadata as { course_id?: string; user_id?: string } | undefined

    // Update payment status
    await supabaseClient
      .from('payments')
      .update({ 
        status: 'succeeded', 
        raw_payload: body 
      })
      .eq('reference', reference)

    // Enroll student
    if (metadata?.course_id && metadata?.user_id) {
       // Check if already enrolled
       const { data: existing } = await supabaseClient
         .from('enrollments')
         .select('id')
         .eq('course_id', metadata.course_id)
         .eq('student_id', metadata.user_id)
         .single()
       
       if (!existing) {
         await supabaseClient.from('enrollments').insert({
           course_id: metadata.course_id,
           student_id: metadata.user_id,
           payment_status: 'succeeded',
           access_state: 'active'
         })
       }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
})

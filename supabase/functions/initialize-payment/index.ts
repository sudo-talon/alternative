import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

declare const Deno: { env: { get(name: string): string | undefined } };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { course_id, success_url, cancel_url } = await req.json() as {
      course_id: string;
      success_url?: string;
      cancel_url?: string;
    }

    // 1. Get user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    // 2. Get course details
    const { data: course, error: courseError } = await supabaseClient
      .from('courses')
      .select('*')
      .eq('id', course_id)
      .single()

    if (courseError || !course) throw new Error('Course not found')

    const amount = course.price_cents || 0
    const currency = course.currency || 'NGN'
    const email = user.email

    // 3. Initialize Paystack transaction
    const paystackSecret = Deno.env.get('PAYSTACK_SECRET_KEY')
    if (!paystackSecret) throw new Error('Paystack secret key not configured')

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount, // Paystack expects amount in kobo (cents)
        currency,
        callback_url: success_url,
        metadata: {
          course_id,
          user_id: user.id,
          cancel_url
        },
      }),
    })

    const data = await response.json()

    if (!data.status) {
      throw new Error(data.message || 'Failed to initialize payment')
    }

    // 4. Create pending payment record
    await supabaseClient.from('payments').insert({
      student_id: user.id,
      course_id: course_id,
      amount_cents: amount,
      currency: currency,
      status: 'pending',
      provider: 'paystack',
      reference: data.data.reference,
    })

    return new Response(
      JSON.stringify({ 
        authorization_url: data.data.authorization_url, 
        reference: data.data.reference 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: unknown) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

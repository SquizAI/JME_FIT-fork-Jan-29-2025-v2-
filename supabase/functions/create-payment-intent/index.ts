import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@12.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true'
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient()
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, // No content for OPTIONS
      headers: corsHeaders
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }

  try {
    // Parse request body
    const { items } = await req.json();

    if (!items?.length) {
      throw new Error('No items provided');
    }

    // Calculate total amount in cents
    const amount = items.reduce((sum: number, item: any) => {
      if (!item.price || item.price <= 0) {
        throw new Error(`Invalid price for item: ${item.title}`);
      }
      if (!item.quantity || item.quantity <= 0) {
        throw new Error(`Invalid quantity for item: ${item.title}`);
      }
      return sum + Math.round(item.price * 100) * item.quantity;
    }, 0);

    if (amount <= 0) {
      throw new Error('Invalid total amount');
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true
      },
      metadata: {
        items: JSON.stringify(items.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          metadata: item.metadata
        })))
      }
    });

    // Return success response
    return new Response(
      JSON.stringify({ 
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (err) {
    console.error('Error:', err);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: err instanceof Error ? err.message : 'Internal server error'
      }),
      { 
        status: err instanceof Error && err.message === 'Method not allowed' ? 405 : 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});
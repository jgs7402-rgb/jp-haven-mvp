import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabaseClient';

/**
 * Example API route for testing Supabase connection
 * Performs a simple SELECT query on the "users" table
 */
export async function GET() {
  try {
    // Simple select query from "users" table
    const { data, error } = await supabaseClient
      .from('users')
      .select('*');

    if (error) {
      console.error('[TEST API] Supabase query error:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details: error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
      count: data?.length || 0,
    });
  } catch (error) {
    console.error('[TEST API] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/auth/verify';
import { hasActiveSubscription } from '@/lib/storage/subscription';

export async function GET(request: NextRequest) {
  try {
    // Verify Firebase authentication
    const authHeader = request.headers.get('authorization');
    const userInfo = await verifyFirebaseToken(authHeader);

    if (!userInfo) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      const subscriptionStatus = await hasActiveSubscription(userInfo.uid);
      return NextResponse.json(subscriptionStatus);
    } catch (dbError: any) {
      console.error('Database error checking subscription status:', {
        error: dbError,
        message: dbError?.message,
        stack: dbError?.stack,
        uid: userInfo.uid,
      });
      
      // Return a safe default response instead of 500
      // This prevents infinite redirect loops
      return NextResponse.json({
        hasActiveSubscription: false,
        subscriptionStatus: null,
        subscriptionEndsAt: null,
      });
    }
  } catch (error: any) {
    console.error('Error checking subscription status:', {
      error,
      message: error?.message,
      stack: error?.stack,
    });
    
    // Return a safe default response instead of 500
    // This prevents infinite redirect loops
    return NextResponse.json({
      hasActiveSubscription: false,
      subscriptionStatus: null,
      subscriptionEndsAt: null,
    });
  }
}

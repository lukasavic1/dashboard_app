import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccount) {
    try {
      const serviceAccountJson = JSON.parse(serviceAccount);
      initializeApp({
        credential: cert(serviceAccountJson),
      });
    } catch (error) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', error);
    }
  } else {
    // In development, you might not have service account
    // This will fail at runtime if trying to verify tokens
    console.warn(
      'FIREBASE_SERVICE_ACCOUNT_KEY not set - token verification will fail with 401. ' +
        'Add it from Firebase Console → Project settings → Service accounts.'
    );
  }
}

/**
 * Verify Firebase ID token from request headers
 * Returns the decoded token with user ID and email
 */
export async function verifyFirebaseToken(
  authHeader: string | null
): Promise<{ uid: string; email: string | null } | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  // Avoid calling getAuth() when Firebase Admin was never initialized (returns 401 otherwise)
  if (getApps().length === 0) {
    return null;
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
    };
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return null;
  }
}

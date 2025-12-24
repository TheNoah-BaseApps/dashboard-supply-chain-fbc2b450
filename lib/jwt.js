import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-characters-long'
);

export async function signToken(payload) {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);
    return token;
  } catch (error) {
    console.error('Error signing token:', error);
    throw new Error('Failed to sign token');
  }
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export async function getTokenFromRequest(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});
      return cookies.token;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting token from request:', error);
    return null;
  }
}

export async function getUserFromRequest(request) {
  try {
    const token = await getTokenFromRequest(request);
    if (!token) return null;
    
    const payload = await verifyToken(token);
    return payload;
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}
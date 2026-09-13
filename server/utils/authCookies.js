const PROD = process.env.NODE_ENV === 'production';

export const cookieOptions = {
  httpOnly: true,
  sameSite: PROD ? 'none' : 'lax',
  secure: PROD,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const clearCookieOptions = {
  httpOnly: true,
  sameSite: PROD ? 'none' : 'lax',
  secure: PROD,
  path: '/',
};
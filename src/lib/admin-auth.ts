import crypto from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE_NAME = 'portfolio_admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 horas

export function isCmsEnvironmentEnabled(): boolean {
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.PORTFOLIO_CMS_ENABLED === 'true'
  );
}

function getSecretKey(): string | null {
  const secret = process.env.PORTFOLIO_ADMIN_TOKEN?.trim();
  if (!secret || secret.length < 16) {
    return null;
  }
  return secret;
}

export function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export function createSignedSessionCookieValue(): string | null {
  const secret = getSecretKey();
  if (!secret) return null;
  const issuedAt = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`admin:${issuedAt}`)
    .digest('hex');
  return `${issuedAt}.${signature}`;
}

export function verifySignedSessionCookieValue(cookieValue?: string): boolean {
  const secret = getSecretKey();
  if (!secret || !cookieValue) return false;

  const parts = cookieValue.split('.');
  if (parts.length !== 2) return false;

  const [issuedAtStr, signature] = parts;
  const issuedAt = Number(issuedAtStr);
  if (!Number.isFinite(issuedAt)) return false;

  const age = Date.now() - issuedAt;
  if (age < 0 || age > SESSION_TTL_MS) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`admin:${issuedAtStr}`)
    .digest('hex');

  return timingSafeCompare(expectedSignature, signature);
}

export async function isRequestAdminAuthenticated(
  request: Request
): Promise<boolean> {
  if (!isCmsEnvironmentEnabled()) {
    return false;
  }

  const secret = getSecretKey();
  if (!secret) {
    return false;
  }

  // 1. Verifica Cookie HttpOnly assinado (fluxo principal de login na UI)
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (sessionCookie && verifySignedSessionCookieValue(sessionCookie)) {
      return true;
    }
  } catch {
    // Fallback para leitura manual do header Cookie
    const rawCookieHeader = request.headers.get('cookie') ?? '';
    const match = rawCookieHeader.match(
      new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE_NAME}=([^;]+)`)
    );
    if (match && verifySignedSessionCookieValue(decodeURIComponent(match[1]))) {
      return true;
    }
  }

  // 2. Verifica header explícito x-admin-token ou Authorization: Bearer
  const headerToken = request.headers.get('x-admin-token')?.trim();
  const authHeader = request.headers.get('authorization')?.trim();
  const bearerToken = authHeader?.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : null;

  const candidate = headerToken || bearerToken;
  if (candidate && timingSafeCompare(secret, candidate)) {
    return true;
  }

  return false;
}

export function verifySameOriginRequest(request: Request): boolean {
  const originHeader = request.headers.get('origin');
  if (!originHeader) {
    return false;
  }
  try {
    const requestOrigin = new URL(request.url).origin;
    const callerOrigin = new URL(originHeader).origin;
    return requestOrigin === callerOrigin;
  } catch {
    return false;
  }
}


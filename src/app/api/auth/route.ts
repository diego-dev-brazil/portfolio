import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  createSignedSessionCookieValue,
  isCmsEnvironmentEnabled,
  isRequestAdminAuthenticated,
  timingSafeCompare,
  verifySameOriginRequest,
} from '../../../lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const cmsEnabled =
    isCmsEnvironmentEnabled() &&
    Boolean(process.env.PORTFOLIO_ADMIN_TOKEN?.trim());
  const authenticated = cmsEnabled
    ? await isRequestAdminAuthenticated(request)
    : false;

  return NextResponse.json({
    cmsEnabled,
    authenticated,
  });
}

export async function POST(request: Request) {
  if (!isCmsEnvironmentEnabled()) {
    return NextResponse.json(
      { error: 'Modo administrativo desabilitado neste ambiente.' },
      { status: 403 }
    );
  }

  if (!verifySameOriginRequest(request)) {
    return NextResponse.json(
      { error: 'Origem da requisição inválida.' },
      { status: 403 }
    );
  }

  const configuredSecret = process.env.PORTFOLIO_ADMIN_TOKEN?.trim();
  if (!configuredSecret || configuredSecret.length < 16) {
    return NextResponse.json(
      {
        error:
          'Configure PORTFOLIO_ADMIN_TOKEN (mín. 16 caracteres) no arquivo .env.local do servidor.',
      },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as { password?: string };
    const candidate = typeof body.password === 'string' ? body.password.trim() : '';

    if (!candidate || !timingSafeCompare(configuredSecret, candidate)) {
      return NextResponse.json(
        { error: 'Senha administrativa inválida.' },
        { status: 401 }
      );
    }

    const signedCookieValue = createSignedSessionCookieValue();
    if (!signedCookieValue) {
      return NextResponse.json(
        { error: 'Erro ao iniciar sessão administrativa.' },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ authenticated: true });
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: signedCookieValue,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 12, // 12 horas
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Requisição de login inválida.' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  if (!verifySameOriginRequest(request)) {
    return NextResponse.json(
      { error: 'Origem inválida.' },
      { status: 403 }
    );
  }

  const response = NextResponse.json({ authenticated: false });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });

  return response;
}


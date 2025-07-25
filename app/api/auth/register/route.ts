import { NextRequest, NextResponse } from 'next/server';
import { createUser, generateToken } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'メールアドレスとパスワードは必須です' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'パスワードは6文字以上である必要があります' },
        { status: 400 }
      );
    }

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 409 }
      );
    }

    const user = await createUser(email, password, name);
    const token = generateToken(user);

    const response = NextResponse.json({
      message: 'ユーザー登録に成功しました',
      user: { id: user.id, email: user.email, name: user.name }
    });

    // HTTPOnlyクッキーにトークンを設定
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7日間
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'ユーザー登録処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

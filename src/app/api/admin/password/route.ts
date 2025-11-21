import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromRequest, updatePassword } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  const isAuthenticated = verifySessionFromRequest(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '현재 비밀번호와 새 비밀번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    const result = await updatePassword(currentPassword, newPassword);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || '비밀번호 변경에 실패했습니다.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: result.message || '비밀번호가 성공적으로 변경되었습니다.' 
    });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { error: '비밀번호 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


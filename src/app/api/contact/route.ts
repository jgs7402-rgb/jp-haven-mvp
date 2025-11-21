import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import nodemailer from 'nodemailer';

// Vercel 서버리스 환경에서 동적 렌더링 강제
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Rate limiting을 위한 간단한 메모리 저장소 (프로덕션에서는 Redis 등 사용 권장)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 5; // 5분에 5회
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5분

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, phone, time, note } = body;

    // 기본 검증
    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    // Google Sheets Webhook 또는 Email 전송
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    const emailApiKey = process.env.EMAIL_API_KEY;
    const emailTo = process.env.EMAIL_TO || 'jgs7402@gamil.com';

    if (webhookUrl) {
      // Google Sheets Webhook으로 전송
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            phone,
            time: time || 'N/A',
            note: note || 'N/A',
            timestamp: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error('Webhook failed');
        }
      } catch (error) {
        console.error('Webhook error:', error);
        // Webhook 실패 시 이메일로 폴백
      }
    }

    // Email 전송 (SMTP + nodemailer)
    if (emailTo && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const from =
          process.env.EMAIL_FROM || `장지 상담문의 <${process.env.SMTP_USER}>`;

        const subject = `[장지 상담문의] ${name} (${phone})`;
        const text = [
          `이름: ${name}`,
          `연락처: ${phone}`,
          `희망 상담시간: ${time || ''}`,
          '',
          '상담 내용:',
          note || '',
          '',
          `접수 시각: ${new Date().toISOString()}`,
        ].join('\n');

        await transporter.sendMail({
          from,
          to: emailTo,
          subject,
          text,
        });

        console.log('[CONTACT] Email sent to:', emailTo);
      } catch (error) {
        console.error('[CONTACT] Email send error:', error);
      }
    } else {
      // SMTP 설정이 없으면 최소한 대상 주소와 내용을 콘솔에 남겨 둡니다.
      console.log('[CONTACT] Email target (SMTP not configured):', emailTo, {
        name,
        phone,
        time,
        note,
      });
    }

    // 어드민에서 관리할 수 있도록 로컬 JSON에 저장
    try {
      const filePath = join(process.cwd(), 'data', 'contacts.json');
      let existing: any[] = [];
      try {
        const existingRaw = await readFile(filePath, 'utf-8');
        existing = JSON.parse(existingRaw);
      } catch {
        existing = [];
      }

      const newEntry = {
        id: Date.now().toString(),
        name,
        phone,
        time: time || '',
        note: note || '',
        createdAt: new Date().toISOString(),
        status: 'new',
      };

      existing.push(newEntry);
      await writeFile(filePath, JSON.stringify(existing, null, 2), 'utf-8');

      console.log('[CONTACT] Saved contact entry:', newEntry);
    } catch (saveError) {
      console.error('[CONTACT] Failed to save contact entry:', saveError);
      // 저장 실패해도 응답은 성공 처리 (이메일 전송이 우선)
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}


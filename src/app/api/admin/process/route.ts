/// src/app/api/process/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabase, PROCESS_STEPS_TABLE } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * 상용 공개용 GET 핸들러
 * locale 별 장례 절차 목록을 내려준다.
 *  - locale=ko → 한국어 메시지
 *  - locale=vi → 베트남어 메시지 (영어 없음)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawLocale = searchParams.get("locale");
    const locale: "ko" | "vi" = rawLocale === "vi" ? "vi" : "ko";

    const { data, error } = await supabase
      .from(PROCESS_STEPS_TABLE)
      .select("step_order, text")
      .eq("locale", locale)
      .order("step_order", { ascending: true });

    if (error) {
      console.error("[PROCESS PUBLIC] Supabase error:", error);

      const msg =
        locale === "ko"
          ? "장례 절차를 불러오는 중 오류가 발생했습니다."
          : "Đã xảy ra lỗi khi tải danh sách quy trình tang lễ.";

      return NextResponse.json(
        {
          success: false,
          locale,
          error: msg,
        },
        { status: 500 }
      );
    }

    const steps =
      data
        ?.sort(
          (a: { step_order: number }, b: { step_order: number }) =>
            a.step_order - b.step_order
        )
        .map((row: { text: string }) => row.text) ?? [];

    return NextResponse.json(
      {
        success: true,
        locale,
        steps,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[PROCESS PUBLIC] Unexpected error:", err);

    const msgKo = "서버 오류로 장례 절차를 불러오지 못했습니다.";
    const msgVi =
      "Đã xảy ra lỗi máy chủ, không thể tải danh sách quy trình tang lễ.";

    return NextResponse.json(
      {
        success: false,
        error_ko: msgKo,
        error_vi: msgVi,
      },
      { status: 500 }
    );
  }
}
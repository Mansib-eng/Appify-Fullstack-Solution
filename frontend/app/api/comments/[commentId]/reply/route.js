import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { callBackendWithToken } from "@/lib/backend";

export async function POST(request, { params }) {
  try {
    const token = (await cookies()).get("token")?.value;
    const { commentId } = await params;
    const body = await request.json();

    const response = await callBackendWithToken(`/comments/${commentId}/reply`, token, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { message: "Unable to add reply", error: error.message },
      { status: 500 }
    );
  }
}

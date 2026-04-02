import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { callBackendWithToken } from "@/lib/backend";

export async function POST(_request, { params }) {
  try {
    const token = (await cookies()).get("token")?.value;
    const { postId } = await params;

    const response = await callBackendWithToken(`/posts/${postId}/like`, token, {
      method: "POST",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { message: "Unable to toggle post like", error: error.message },
      { status: 500 }
    );
  }
}

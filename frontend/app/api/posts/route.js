import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { callBackendWithToken } from "@/lib/backend";

export async function GET(request) {
  try {
    const token = (await cookies()).get("token")?.value;
    const { search } = new URL(request.url);

    const response = await callBackendWithToken(`/posts${search}`, token, {
      method: "GET",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { message: "Unable to fetch posts", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const token = (await cookies()).get("token")?.value;
    const formData = await request.formData();

    const forwarded = new FormData();
    for (const [key, value] of formData.entries()) {
      forwarded.append(key, value);
    }

    const response = await callBackendWithToken("/posts", token, {
      method: "POST",
      body: forwarded,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { message: "Unable to create post", error: error.message },
      { status: 500 }
    );
  }
}
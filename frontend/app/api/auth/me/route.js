import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { callBackendWithToken } from "@/lib/backend";

export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const response = await callBackendWithToken("/auth/me", token, {
      method: "GET",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { message: "Unable to fetch user", error: error.message },
      { status: 500 }
    );
  }
}

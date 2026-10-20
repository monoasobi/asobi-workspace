import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
const headers = { "Cache-Control": "private, no-store" };
// Same constant-time comparison pattern as the existing admin/Agent authentication.
export async function POST(request: Request) {
  const secret = process.env.REVALIDATION_SECRET;
  if (!secret)
    return Response.json({ error: "Unavailable" }, { status: 503, headers });
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer "))
    return Response.json({ error: "Unauthorized" }, { status: 401, headers });
  const digest = (value: string) => createHash("sha256").update(value).digest();
  if (!timingSafeEqual(digest(authorization.slice(7)), digest(secret)))
    return Response.json({ error: "Unauthorized" }, { status: 401, headers });
  const body = z
    .object({ scope: z.literal("catalog") })
    .strict()
    .safeParse(await request.json().catch(() => null));
  if (!body.success)
    return Response.json({ error: "Invalid scope" }, { status: 400, headers });
  revalidatePath("/");
  return Response.json({ ok: true }, { headers });
}

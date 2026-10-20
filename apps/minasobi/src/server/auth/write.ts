import "server-only";
import { getAdminSession } from "./access";
import { privateHeaders, rejectCrossOrigin } from "./request";
export async function authorizeWrite(request: Request) {
  const session = await getAdminSession();
  if (!session.authenticated)
    return Response.json(
      { error: "Unauthorized" },
      { status: 401, headers: privateHeaders },
    );
  if (session.role !== "admin")
    return Response.json(
      { error: "열람 전용 권한입니다." },
      { status: 403, headers: privateHeaders },
    );
  return rejectCrossOrigin(request);
}

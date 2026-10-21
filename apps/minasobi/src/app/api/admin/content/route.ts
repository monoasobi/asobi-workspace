import { getAdminSession } from "@/server/auth/access";
import { getBooksData, getDeletedMusics } from "@/server/queries/content";
import { contentReply } from "@/server/contentRoutes";
export async function GET() {
  if (!(await getAdminSession()).authenticated)
    return contentReply({ error: "로그인이 필요합니다." }, 401);
  return contentReply({
    data: await getBooksData(),
    deleted: await getDeletedMusics(),
  });
}

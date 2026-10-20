import { Button, Flex, Heading, ScrollArea, Separator, Text } from "@radix-ui/themes";
import type { AdminDashboardData, SelectedNode } from "../AdminDashboard";
import { getSelectedNodeKey } from "../AdminDocumentPanel/utils";
import { getMusicDocuments } from "./selection";
import styles from "../AdminPage.module.css";

interface AdminContentNavProps {
  data: AdminDashboardData;
  musicId?: number;
  selectedNode: SelectedNode;
  canManage: boolean;
  disabled: boolean;
  onSelect: (node: SelectedNode) => void;
}

export const AdminContentNav = ({ data, musicId, selectedNode, canManage, disabled, onSelect }: AdminContentNavProps) => {
  const { novels, comics, lyric, books } = getMusicDocuments(data, musicId);
  const renderItem = (label: string, node: SelectedNode, detail?: string) => (
    <Button
      key={getSelectedNodeKey(node)}
      className={styles.contentNavButton}
      variant="soft"
      color={getSelectedNodeKey(selectedNode) === getSelectedNodeKey(node) ? undefined : "gray"}
      disabled={disabled}
      aria-current={getSelectedNodeKey(selectedNode) === getSelectedNodeKey(node) ? "true" : undefined}
      onClick={() => onSelect(node)}
    >
      <Flex direction="column" gap="1" minWidth="0" align="start">
        <Text size="2" weight="medium">{label}</Text>
        {detail && <Text size="1" color="gray">{detail}</Text>}
      </Flex>
    </Button>
  );
  return (
    <ScrollArea className={styles.treeScroll} type="auto" scrollbars="vertical">
      <Flex direction="column" gap="4" p="2">
        <Heading size="2">곡 콘텐츠</Heading>
        {musicId !== undefined ? <>
          {renderItem("곡 정보", { type: "music", id: musicId })}
          <Separator size="4" />
          <Flex direction="column" gap="2">
            <Text size="1" weight="bold" color="gray">소설</Text>
            {novels.map((novel) => renderItem(novel.title, { type: "novel", id: novel.id }, novel.writer))}
            {canManage && renderItem("+ 소설 추가", { type: "newNovel", musicId })}
            {!canManage && novels.length === 0 && <Text size="2" color="gray">등록된 소설이 없습니다.</Text>}
          </Flex>
          <Flex direction="column" gap="2">
            <Text size="1" weight="bold" color="gray">만화</Text>
            {comics.map((comic) => renderItem(comic.title, { type: "comic", id: comic.id }, comic.writer))}
            {canManage && renderItem("+ 만화 추가", { type: "newComic", musicId })}
            {!canManage && comics.length === 0 && <Text size="2" color="gray">등록된 만화가 없습니다.</Text>}
          </Flex>
          <Flex direction="column" gap="2">
            <Text size="1" weight="bold" color="gray">가사</Text>
            {lyric ? renderItem("가사", { type: "lyric", id: musicId }, `${lyric.lineCount}줄`) : canManage ? renderItem("+ 가사 추가", { type: "newLyric", musicId }) : <Text size="2" color="gray">등록된 가사가 없습니다.</Text>}
          </Flex>
          <Flex direction="column" gap="2">
            <Text size="1" weight="bold" color="gray">연결 서적</Text>
            {books.map((book) => renderItem(book.name, { type: "book", id: book.id }))}
            {books.length === 0 && <Text size="2" color="gray">연결된 서적이 없습니다.</Text>}
          </Flex>
        </> : <Text size="2" color="gray">좌측 사이드바에서 곡을 선택해 주세요.</Text>}
        <Separator size="4" />
        <Flex direction="column" gap="2">
          <Text size="1" weight="bold" color="gray">서적 관리</Text>
          {canManage && renderItem("+ 서적 추가", { type: "newBook" })}
          <details>
            <summary className={styles.bookSummary}>전체 서적 ({data.books.length})</summary>
            <Flex direction="column" gap="2" mt="3">
              {data.books.map((book) => renderItem(book.name, { type: "book", id: book.id }))}
            </Flex>
          </details>
        </Flex>
      </Flex>
    </ScrollArea>
  );
};

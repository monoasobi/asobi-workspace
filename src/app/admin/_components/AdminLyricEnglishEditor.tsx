"use client";

import type { LyricLine } from "@appTypes/lyric";
import { Button, Card, Flex, Text, TextArea } from "@radix-ui/themes";
import { useState } from "react";

interface Props {
  musicId: number;
  lyrics: LyricLine[];
  updatedAt: string;
  onSaved: () => void;
  isRefreshing: boolean;
}

export const AdminLyricEnglishEditor = ({ musicId, lyrics, updatedAt, onSaved, isRefreshing }: Props) => {
  const [baseline, setBaseline] = useState(() => lyrics.map(line => ({ en: line.en ?? "", enReading: line.enReading ?? "" })));
  const [draft, setDraft] = useState(baseline);
  const [version, setVersion] = useState(updatedAt);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline);
  const busy = isSaving || isRefreshing;

  const save = async () => {
    if (busy || !dirty) return;
    setIsSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/lyric-tracks/${musicId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expectedUpdatedAt: version, lines: draft }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "저장에 실패했습니다.");
      setBaseline(draft);
      setVersion(result.updatedAt);
      setMessage({ error: false, text: "영어 해석·독음을 저장했습니다." });
      onSaved();
    } catch (error) {
      setMessage({ error: true, text: error instanceof Error ? error.message : "연결을 확인하고 다시 시도해 주세요." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Flex direction="column" gap="3" p="3">
      <Text size="2" color="gray">일본어 원문과 타이밍을 기준으로 영어 내용만 편집합니다. 저장한 내용은 LOUDASOBI에서 사용합니다.</Text>
      <Flex gap="2" align="center" wrap="wrap">
        <Button onClick={save} disabled={busy || !dirty} loading={isSaving}>전체 저장</Button>
        <Button variant="soft" color="gray" disabled={busy || !dirty} onClick={() => { setDraft(baseline); setMessage(null); }}>되돌리기</Button>
        {dirty && <Text size="2" color="amber">저장하지 않은 변경사항이 있습니다.</Text>}
      </Flex>
      {message && <Text role="status" size="2" color={message.error ? "red" : "green"}>{message.text}</Text>}
      {lyrics.map((line, index) => (
        <Card key={line.id ?? index}>
          <Flex direction="column" gap="2">
            <Text size="1" color="gray">{index + 1} · {line.start.toFixed(2)}–{line.end.toFixed(2)}초</Text>
            <Text lang="ja">{line.jp}</Text>
            <Text size="2" color="gray">{line.kr}</Text>
            {([ ["en", "영어 해석"], ["enReading", "영어 독음"] ] as const).map(([field, label]) => (
              <Flex key={field} direction="column" gap="1" asChild>
                <label>
                  <Text size="2">{label}</Text>
                  <TextArea lang="en" value={draft[index][field]} disabled={busy} rows={2}
                    onChange={event => {
                      const value = event.target.value;
                      setDraft(previous => previous.map((entry, i) => i === index ? { ...entry, [field]: value } : entry));
                    }} />
                </label>
              </Flex>
            ))}
          </Flex>
        </Card>
      ))}
    </Flex>
  );
};

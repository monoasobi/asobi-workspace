# 5단계 편집기 이관 계약과 QA

기준: 2026-10-20. 기존 가사·콜 편집기를 새 관리자에 이관하고 정적 검사·합성 로컬 DB 저장 검증을 마쳤습니다. **실제 브라우저 입력·영상 재생·시각 QA는 사용자 요청으로 보류 중**입니다. production build·배포·운영 DB 변경은 하지 않았습니다.

## 화면과 코드 위치

- `/musics/[id]`: 기존 좌우 곡 정보/콜 정보. 각 섹션에서 편집 페이지로 이동합니다.
- `/musics/[id]/lyrics`: Mono 가사 타임라인. 영어 해석·독음도 같은 줄 편집창에 있습니다.
- `/musics/[id]/calls`: Loud 콜 편집기. 공개와 같은 콜 렌더러를 미리보기로 사용합니다.
- 세 페이지는 같은 관리자 sidebar/layout을 사용합니다. 다른 곡을 고르면 현재 편집 종류를 유지하며, 가사가 없는 곡은 가사 페이지 대신 곡 상세로 이동합니다. 가사 트랙 생성은 6단계입니다.
- 편집 영역 너비 1024px 이상에서 편집합니다. 좁아지면 재생을 멈추고 안내를 표시하며 초안은 유지합니다. 사이드바 접기로 너비를 확보할 수 있습니다.

| 소유 위치 | 역할 |
| --- | --- |
| `apps/adminasobi/src/components/editors/shared` | 두 편집기의 단축키·history·zoom·viewport·이동 보호 등록·JSON 복사 |
| `.../editors/lyric-timeline` | Mono 원본 선택/드래그/스냅/resize, 가사 줄 UI |
| `.../editors/CallGuideEditor*` | Loud 원본 콜/펄스/패턴·연결/스냅샷·문구/아이콘 |
| `.../editors/playback` | Mono 원본 pending seek·영상/가사 재생 제어 |
| `packages/loudasobi-view` | Loud 공개/콜 미리보기 renderer·player·clock·volume·i18n 메시지 |
| `packages/content-core/src/lyricTrackInput.ts` | 기존 Mono 가사 입력 schema. 기존 앱도 re-export |

기존 관리자는 9단계의 실제 전환 확인까지 임시 유지합니다. 새 관리자용 기능을 원본 저장소에 역이식하지 않았습니다. 공개 Loud player 진입점은 공용 패키지의 얇은 re-export이며 앱끼리 내부 소스를 참조하지 않습니다.

## 이번에 함께 쓰도록 바꾼 동작

| 동작 | 두 편집기의 공통 규칙 |
| --- | --- |
| 재생/정지 | Space. 중복 리스너 없이 편집기 하나가 처리 |
| 미세 탐색 | ←/↑ -0.01초, →/↓ +0.01초. 키를 누르고 있으면 반복 |
| 실행 취소/다시 실행 | Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z 또는 Y. 최대 이전 상태 100개 |
| 저장 | Cmd/Ctrl+S. 텍스트 입력 중에도 현재 문서 저장 |
| 확대/축소 | Cmd/Ctrl+휠·타임라인 빈 곳 드래그·+/-. 기준 위치를 유지하며 확대 |
| 편집 예외 | IME 조합 중 단축키 제외. 텍스트/아이콘 검색 입력 중 Space·화살표·undo는 기본 입력 동작 유지 |
| 적용 범위 | 현재 편집 작업 영역과 해당 portal. 사이드바·상단 이동 버튼의 기본 키 동작 보호 |
| 볼륨 | 새 관리자 두 편집기가 Loud 기존 volume atom과 저장 키 사용 |
| 이동 보호 | 공통 dirty/busy 등록. 저장 중 이동 차단, 미저장 변경 폐기 확인, 문서 이탈 beforeunload |

가사 편집기의 Enter 현재 줄 선택도 보존합니다. 버튼/링크에 포커스가 있으면 Enter 기본 동작을 우선합니다. 콜/가사 블록 드래그에는 Cmd/Ctrl 확대 제스처를 적용하지 않아 기존 스냅 해제를 보존합니다. 가사/콜의 초기 확대와 허용 범위는 각각 원래 값을 유지합니다.

## Loud에서 가사 편집기로 확장한 편의 기능

- 실행 취소/다시 실행과 버튼. 가사 본문·영어 필드·ID·sync를 함께 복구합니다.
- 초안 JSON 복사. 저장 충돌이나 통신 실패 때 사용자가 내용을 보관할 수 있습니다.
- 선택 줄 반복 재생. 선택한 첫 줄 1초 전부터 해당 줄 끝까지 반복하며 선택을 바꾸면 반복을 해제합니다.
- 기준 위치를 유지하는 확대 제스처, 공통 저장 단축키와 편집 영역 너비 판정.
- 기존 Mono SRT 내보내기·분할/삭제·다중 선택·재생 위치 스냅·동영상 패널 크기 조절은 유지합니다.

반대로 콜 펄스/패턴 편집, 콜 전용 문구/아이콘 같은 기능은 가사 모델에 추가하지 않았습니다. 두 타임라인을 하나의 범용 엔진으로 만들지 않습니다. Mono의 첫 재생 전 seek와 Loud의 프레임 clock이 달라 재생 제어 훅은 각각 유지합니다. 가사 0.01초, 콜 소수 넷째 자리, `source sync + sync_offset` 의미도 그대로입니다.

## 저장과 충돌 보호

- 가사 `/api/admin/musics/[id]/lyrics`: 가사 query/mutation마다 세션, write 역할/동일 Origin/입력·body 크기 검증. ID 0을 허용합니다.
- 기존 Mono schema를 공유하며 줄 사이 겹침 허용, optional 줄 ID와 영어 필드를 유지합니다. 줄 ID가 없는 경우에만 새 ID를 부여합니다. 분할 시 첫 줄 ID를 유지하고 두 번째 줄에 새 ID를 부여합니다.
- 가사 저장은 가사 sync/본문/수정 시각만 바꿉니다. source revision을 비교해 오래된 원문·영상 기준 초안은 409로 거부합니다. 실패해도 초안은 유지합니다.
- 가사 변경 뒤 콜 참조/원문 스냅샷·표시 경고를 다시 계산하고 건수를 알립니다. 콜 문서를 자동 수정하지 않습니다. 기존 콜 형식이 잘못됐어도 유효한 가사 저장을 막지 않고 점검 대상으로 알립니다.
- 콜 `/guide`: 기존 transaction과 전체 revision을 유지하고 콜+전용 offset만 함께 저장합니다. sourceRevision으로 원문 변경을 구분해 최신 메타데이터만 확인한 뒤 오래된 가사 기반 초안의 revision을 자동 승격하지 않습니다.
- 8단계 사용자 결정에 따라 공통 가사 저장 후 기존 Mono 캐시만 무효화합니다. Loud 전용 콜/offset 저장에는 알림이 없습니다. DB 저장 성공과 Mono 알림 실패는 별도 표시·재시도하며 열린 화면 자동 갱신은 하지 않습니다. 로컬 재생 상태는 유지합니다. 상세 경계는 cache-and-environments.md를 읽습니다.

## 이동 보호의 한계와 수동 QA

현대 브라우저는 Navigation API의 현재 history index를 사용하고 popstate capture에서 취소 후 원래 index로 복귀합니다. 해당 API가 없는 브라우저는 Next history state를 보존하며 별도 위치만 추가합니다. **구형 브라우저에서 guard 설치 이전의 위치 정보가 없는 항목으로 이동을 취소할 경우, 현재 URL을 재기록하는 fallback이 앞으로 가기 이력을 잘라낼 수 있습니다.** 실제 Safari/Chrome/App Router 조합의 이동 결과는 아직 확인하지 않았습니다. [MDN currentEntry](https://developer.mozilla.org/en-US/docs/Web/API/Navigation/currentEntry)

나중에 사용자와 확인할 항목:

1. 상세↔두 편집기·사이드바 곡 전환·직접 URL·로그아웃·뒤로/앞으로·새로고침. dirty 취소 시 초안/URL 유지, 저장 중 이동 차단.
2. 실제 YouTube 첫 재생 전 seek·재생/일시정지·0.01초 탐색·볼륨·선택 줄/콜 반복·너비 축소 후 복구.
3. 가사 다중 선택·이동·길이 조절·playhead 스냅·Cmd/Ctrl 예외·분할/삭제·영어 입력/저장/재조회·SRT.
4. 두 편집기 undo/redo·텍스트 입력 자체 undo·아이콘 검색/한글 IME·portal·Space 버튼 포커스·확대 기준점.
5. 두 창에서 가사/콜/영상/offset을 다르게 수정한 뒤 충돌과 초안 보존. 가사 원문 수정/삭제 후 콜 연결 경고와 공개 미리보기 일치.
6. 박수 펄스·마지막 펄스 자르기·강조/색/아이콘·viewer 읽기 전용·라이트/다크·패널/독립 스크롤.

## 실행한 검사와 재현

- 루트 `npm run lint`, `npm run typecheck`: 모든 앱/공용 패키지 통과.
- `npm run check:core`: 3개, admin `check:editors`: 4개, `check:security`: 3개 통과.
- Mono 기존 activeLyric·timelineSnap 검사: 2개 통과.
- `npm ci --dry-run --ignore-scripts --offline`: lockfile 설치 계획 통과. 실제 clean install이나 배포 빌드 검증을 뜻하지 않습니다.
- `node apps/adminasobi/scripts/local-flow-check.mjs`: 기존 곡/설정 분리 저장·권한·공개 HTTP 반영 회귀 통과.
- `node apps/adminasobi/scripts/editor-flow-check.mjs`: 로컬 ID 0 합성 fixture에서 auth/role/Origin/400/404/409, 영어·줄 ID·필드 소유권, 가사 수정 뒤 콜 참조 경고, 두 페이지 HTTP 200 통과. 수정한 fixture는 원래 값·시각으로 복원했습니다.

HTTP 검사는 세 로컬 서버가 127.0.0.1:3100/3101/3102에서 실행 중이어야 합니다. 검사 helper는 정확한 `.local/development.sqlite`와 loopback 갱신 대상만 허용하며 편집 검사는 확인용 곡 하나인지 추가 검사합니다. 실제 콘텐츠 DB에 연결해 실행하지 않습니다. SSR 200은 브라우저에서 편집 동작이 확인됐다는 뜻이 아닙니다.

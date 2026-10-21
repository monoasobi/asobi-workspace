# 6단계 콘텐츠·추천 관리 이관

> 2026-10-21 후속: 사용자 운영 소설 38 수정 응답으로 저장 성공을 확인했습니다. Mono 캐시 알림은 실패 상태이며 원인 상세 표시를 추가했습니다. 사용자 승인으로 공개 두 앱의 옛 관리자/API/쓰기 mutation은 제거했고 콘텐츠 관리 소유자는 apps/minasobi입니다. 콘텐츠 계약 검사 5개 통과. 운영 파일 업로드/정리 전체 QA 완료를 뜻하지 않습니다.

2026-10-20 기준: 코드 이관과 정적/합성 로컬 HTTP 검증을 마쳤습니다. 사용자는 기존 QA와 검토사항을 별도로 진행 중이며 **결정이 모이면 함께 반영**하기로 했습니다. 화면·실제 콘텐츠·R2 통합·운영 전환은 완료 처리하지 않습니다.

## 기능 대조와 실제 진입점

| 기존 기능 | 새 관리자 진입점 | 재사용·변경 |
| --- | --- | --- |
| 곡 생성과 선택적 앨범아트 | 상단 곡 추가 → `/musics/new` | Mono music editorConfig·FormData·파일 미리보기/제한 재사용. 곡 생성 후 이미지 실패 시 생성 ID를 유지해 같은 곡에 PUT 재시도 |
| 공통 곡 정보·앨범아트·Loud 설정 | `/musics/[id]` | 3단계 개별 폼 그대로. source/offset·공개 설정 소유권 보존 |
| 곡 삭제 | 곡 상세의 곡 숨기기 | 기존 soft delete. 가사·원작·서적·콜·설정·파일 보존 |
| 숨긴 곡 복원 | 상단 숨긴 곡 → `/musics/deleted` | 기존 restoreMusic 함수를 관리자 API/화면에 연결. 복원 시 기존 Loud publish 설정도 다시 적용될 수 있음을 확인 |
| 곡별 원작/가사/연결 서적 | 곡 상세 원작·가사 문서 → `/musics/[id]/content` | 기존 getMusicDocuments·문서 타입·editorConfigs·조회 데이터·선택 검증 재사용. 선택 문서는 query string에 보존 |
| 소설 생성/수정/삭제 | 콘텐츠 내 소설 목록 | 번역 여부/역자·출판 여부/서적 조건 유지. novel.bookId와 book_novels를 같은 관계로 합치지 않음 |
| 만화 생성/수정/삭제 | 콘텐츠 내 만화 목록 | 기존 메타데이터와 length 계약 유지 |
| 가사 문서 생성/JSON 수정/삭제 | 콘텐츠 내 가사 문서 | 기존 JSON payload/EN/줄 ID 계약 보존. 수정은 5단계 revision 저장 API를 사용하며 편집 시작 revision 유지. 삭제도 revision 확인 |
| 가사 타임라인/SRT | 문서의 타임라인 이동·SRT 버튼 | 5단계 원본 편집기·직렬화 재사용 |
| 전체 서적과 곡 연결 서적 | 상단 서적 → `/books`, 곡 콘텐츠 내 서적 | 기존 novelIds 순서·구매 링크·숨긴 곡의 novel 관계를 편집 payload에서 보존 |
| 추천 그룹/정렬 | 상단 추천 정렬 → `/sidebar` | Loud 원본 드래그/버튼 이동·ko/ja/en 그룹명·미리보기·revision·현재 공개곡 membership 검증 재사용 |
| 읽기 전용·로그인·이동 보호 | 모든 새 페이지/API | 기존 공통 guard·viewer·Origin·private/no-store 사용. 콘텐츠/추천 dirty/busy를 같은 guard에 등록 |

기존 Mono 관리자에 원작 본문/만화 파일을 업로드하거나 비공개 원작을 렌더링하는 별도 편집 기능은 없었습니다. 이번 단계에서 새 파일 편집기를 만들지 않았습니다. 앨범아트 blob 미리보기, 가사 영상 미리보기, 콜 감상 미리보기는 해당 기존 경로로 유지합니다. 소설/만화 공개 제공 API·독자 인증·Agent 읽기 API는 Mono에 남겨 관리자 이관과 분리했습니다.

## 코드 소유권

- `components/content/editorConfigs`, `adminSelectedDocument`, `utils`, `selection`, `types`: 기존 Mono 구현에서 이관. 하나의 필드 렌더러가 shadcn Input/NativeSelect·native textarea/checkbox로 표시하며 FormData 변환은 원본 사용.
- `components/content/AdminDocumentPanel`, `ContentWorkspace`: 공통 관리자 layout·URL·guard·refresh에 맞춘 연결부. 범용 CMS/새 폼 프레임워크 없음.
- `packages/content-core/src/contentInput.ts`: 기존 Mono 소설/만화/서적 Zod schema의 단일 원본. 이전 앱 schema는 re-export하며 입력 의미를 바꾸지 않음.
- 관리자 `server/queries/content.ts`, `mutations/content.ts`: 기존 dashboard 조회와 실제 쓰는 CRUD를 이관. 조회/쓰기 내부 인증 추가.
- `server/contentRoutes.ts`: 반복되는 write 인증·입력·크기·에러·공개 갱신 경계만 공유. 가사 JSON 갱신은 기존 `saveLyrics`로 단일화.
- `SidebarOrderEditor*`, sidebar query/mutation/API: 기존 Loud 구현 재사용. 같은 출처 localStorage 알림 대신 공개 서버 갱신 결과와 재시도 UI 사용.

## 보존과 보호

- 음악 ID 0 보존, 새 곡은 DB의 기존 ID 생성 계약 사용. 기존 ID 재배정·일괄 재생성 없음.
- 서적 생성/수정/삭제와 소설 삭제의 관계 갱신을 트랜잭션으로 묶었습니다. 서적의 중복/없는 novel ID는 변경 전에 거부합니다.
- 출판 소설이 bookId로 참조하는 서적 삭제는 409로 막습니다. 참조를 조용히 null로 바꾸거나 독자 공개 조건을 바꾸지 않습니다.
- 숨긴 곡의 novel도 기존 서적 편집 데이터에 남깁니다. 전체 목록 필터를 저장 payload에 재사용해 숨긴 연결을 지우지 않습니다.
- 가사 삭제는 가사 행만 삭제하고 콜 자료를 지우거나 자동 재연결하지 않습니다. 공개/콜 편집에서 소스 연결 재점검이 필요합니다.
- 문서/추천 저장 성공과 공개 갱신 실패를 구분합니다. 생성/삭제 후 갱신 실패가 있으면 재시도할 수 있도록 결과 화면에 머물고 명시적인 이동 버튼을 제공합니다.
- 기존 소설·만화·서적 메타데이터에는 revision 계약이 없으므로 이번에도 동시 편집 충돌 보호를 새로 추가하지 않았습니다. 가사/콜/추천의 충돌 보호와 구분합니다. 같은 메타데이터 문서를 여러 창에서 수정하면 마지막 저장이 적용될 수 있습니다.
- 예전 두 관리자/API는 9단계 전환 확인 전까지 유지합니다. 새 경로가 생겼다는 이유로 기존 경로·비밀값·R2 객체를 제거하지 않습니다.

## 실행 검증

- 전체 `npm run lint`, `npm run typecheck`: 모든 앱/패키지 통과. 마지막 연결 수정 후 admin lint/typecheck 재확인 통과.
- core 3개, editor 4개, security 3개, 새 content 계약 2개 통과.
- `node apps/minasobi/scripts/local-flow-check.mjs`: 기존 곡/설정 저장과 공개 HTTP 반영 회귀 통과.
- `node apps/minasobi/scripts/editor-flow-check.mjs`: 기존 가사/콜 revision·EN·필드 소유권 회귀 통과.
- `node apps/minasobi/scripts/content-flow-check.mjs`: 인증·viewer·Origin·입력, 곡/소설/만화/서적/가사 CRUD, 없는 소설 ID 거부 시 관계/링크 무변경, 숨긴 곡의 서적 관계 보존, 가사 삭제 revision, 곡 숨김/복원 시 관련 행 보존, 추천 revision/membership, 새 페이지 HTTP 200 통과.
- 콘텐츠 검사는 정확한 `.local/development.sqlite`, 확인용 곡 하나와 빈 콘텐츠 fixture, loopback 갱신 대상만 허용합니다. `finally`에서 관련 10개 테이블을 원래 값·시각으로 복원하고 공개 캐시를 다시 갱신합니다. 실제 콘텐츠 DB에서는 실행하지 않습니다.

미검증: 실제 브라우저 폼 입력·드래그·레이아웃/스크롤·history·R2 이미지 업로드/부분 실패 복구·실제 콘텐츠 전수 대조·production build·배포. 로컬 HTTP/계약 검사로 대신하지 않습니다. 새 의존성과 DB schema/migration 변경은 없습니다.

## 다음 재개

사용자가 요청하면 7단계 Mono 공개 UI의 shadcn 전환을 진행합니다. 사용자가 별도로 진행 중인 QA·검토사항은 답변이 모일 때 반영합니다. 이미지 운영 키 교체·갱신 지연 결정·원격/배포·기존 관리자 종료를 이번 단계 승인에 포함하지 않습니다.


## QA 후속 — 곡 상세 내부 콘텐츠 관리

MusicDetail의 왼쪽 카드에서 곡 정보/원작·가사 문서를 전환합니다. 숨긴 폼은 유지해 곡 정보/콘텐츠 사이의 미저장 초안을 보존합니다. MusicContentAccordion은 기존 AdminDocumentPanel·editorConfigs·조회/저장/가사 revision/SRT를 재사용하며 소설/만화/가사/연결 서적을 한 영역으로 합칩니다. 이미 연결된 소설/만화/가사는 추가 버튼을 숨기고 빈 범주의 오른쪽에 + 아이콘을 제공합니다. 과거 복수 문서가 있으면 선택 가능하게 유지합니다. 전체 서적은 이 영역에서 제거하며 독립 /books 관리는 유지합니다.

기존 /musics/[id]/content 링크는 선택 query를 보존해 /musics/[id]?tab=content로 redirect합니다. 문서 생성 후 같은 곡 상세로 돌아오며 삭제/캐시 알림 재시도/가사 revision 검증을 재사용합니다. 한 화면에 합쳐진 폼들의 저장 중 중복 조작과 타임라인 이동은 기존 전역 NavigationGuard를 따릅니다. 가사/콜 타임라인 URL은 바꾸지 않았습니다.

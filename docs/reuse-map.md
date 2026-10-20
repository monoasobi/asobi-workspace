# 기존 코드 재사용·소유권 지도

기준일: 2026-10-20. 상태: **7단계 UI·최소 디자인 시스템까지 로컬 검증 완료. 조건별 전체 화면·사용자 QA/운영 전환 대기**. 4단계 승인된 CDN/72개 객체 검증도 보존합니다.

기존 소스 전체는 각각 `apps/monoasobi`, `apps/loudasobi`에 Git 이력과 함께 가져왔습니다. 2단계에서는 아래 실제 이동 목록의 공통 구현을 packages로 옮기고 소비자 import를 변경했습니다. public 자산과 편집기/재생 알고리즘은 보존했습니다. 아래 본문 표에는 이후 관리자/미리보기 이관 목표도 포함되며, 모든 목표가 구현됐다는 뜻은 아닙니다.

`M` = `/Users/nine/Documents/work/monoasobi-react-ts-web`, `L` = `/Users/nine/Documents/work/loudasobi`. 표의 원본 경로는 각 루트 기준 상대 경로입니다. 세부 기준 HEAD·검증 결과는 [migration-status.md](migration-status.md), 전체 라우트/설정 목록은 [source-inventory.md](source-inventory.md)를 봅니다.

## 적용 원칙

- **기존 코드 그대로 이관 → 필요한 부분만 수정 → 실제 중복만 공통 추출** 순서입니다. 이 표는 재개발 명세가 아닙니다.
- 패키지는 실제 소비자가 생길 때 만듭니다. 앱 내부 전용 훅을 공용 엔진으로 확장하지 않습니다.
- 최초 앱 복사 후 생기는 관리자·타입·DB 매핑의 임시 중복은 아래 조건으로 제거합니다. 새 구현을 병렬로 계속 관리하지 않습니다.
- 표의 `packages/*`는 최종 소유 위치이며, 1단계에서 전부 옮긴다는 의미가 아닙니다. 먼저 두 앱의 기존 구조를 복원합니다.

## UI·공개 앱·도메인 코드

| 원본 경로 | 재사용 기능 | 새 소유 위치 | 필요한 수정 | 임시 중복 제거 조건 |
| --- | --- | --- | --- | --- |
| L `src/components/ui/{button,input,select,dropdown-menu,checkbox,separator,badge,native-select,switch,tooltip,accordion,label,scroll-area,sheet,popover,slider}.tsx` | 기존 shadcn 기본 부품. ScrollArea의 viewportRef/viewportProps 확장 포함 | `packages/ui` | exports·alias·의존성·소비 앱 Tailwind 탐색 연결. CLI 재생성으로 덮어쓰지 않음 | 실제 소비 앱을 패키지 import로 바꾸고 검사 후 앱 사본 제거 |
| L `components.json`, `src/lib/utils.ts`, `src/app/globals.css`, `postcss.config.mjs` | radix-nova 설정, cn, 공통 테마 변수·애니메이션 | `packages/ui` + 앱별 설정 | Loud 팔레트·라이트/다크 값은 공용 brand.css, Tailwind 매핑은 styles.css. 앱 레이아웃은 분리 | 공통 토큰을 한 원본에서 쓰고 기존 앱 중복 정의 제거 |
| L `src/components/ui/icon-picker.tsx`, `icons-data.ts`, `src/lib/lucideIconNames.json`, `docs/licenses/shadcn-iconpicker.txt` | 관리자 아이콘 검색·선택, 대규모 검색 데이터, 라이선스 | 우선 `apps/adminasobi` 내부 | 범용 UI 진입점에 대규모 데이터 포함 금지. 현재 가상화/검색 구현·MIT 고지 보존 | 콜 편집기 이관 후 이전 관리자 선택기 제거. 실제 다른 소비자가 생길 때만 별도 공유 검토 |
| L `src/lib/callGuide.ts`, `lyricPresentation.ts`, `lyricText.ts`, `src/types/lyric.d.ts` | 콜 JSON parse/resolve/검증·패턴·가사 표시 보정·타입 | `packages/content-core` | 앱 alias 제거. 서버 query·Next 캐시·locale provider 혼입 금지 | 공개/관리자가 한 구현을 import하고 기존 앱 계산 사본 제거 |
| M `src/types/{music,lyric,novel,comic,book}.d.ts`, `src/lib/lyricEnglish.ts`, `src/server/schemas/admin.schema.ts`; L `src/server/queries/catalog.ts`의 linesSchema | 공통 데이터 계약·가사 영어 필드 표시 분리·검증 | 공통 부분 `packages/content-core`, 관리자 폼 스키마 `apps/adminasobi` | Mono/Loud 가사 타입·겹침 검증 차이 확인. 독음·번역·stable ID·legacy 필드 보존. 입력 허용 범위 임의 강화 금지 | 소비자별 검증 계약을 유지한 채 공통 부분의 사본 제거 |
| L `src/components/player/{GuidePreview,LyricGuideCard,HighlightedText,ClapIndicator}.tsx`, `GuidePreview/`, `ClapIndicator/`, `src/components/common/{CallIcon,HandSwing,FanLightBadge}.tsx`, `src/lib/{callIcons,fanlights}.ts` | 공개 콜 렌더링과 관리자 감상 미리보기, 최신 박수 표시 | `packages/loudasobi-view` | i18n/PlaybackClock 등 실제 의존성과 스타일 포함 범위 연결. 관리자용 렌더러 재작성 금지 | 공개/미리보기 모두 공유 뷰를 사용하면 앱 표시 사본 제거 |
| L `src/components/player/MusicExperience.tsx`, `MusicExperience/`, `PlayerBar.tsx`, `src/atoms/player.ts` | react-player 재생·프레임 알림·키보드·고정 컨트롤 | 우선 `apps/loudasobi`, 관리자에서도 실제 공유하는 부분은 `loudasobi-view` | 프레임 clock 계약과 React 구독 경계 보존. Mono 플레이어와 범용 통합하지 않음 | 관리자가 사용하는 재생 부분의 실제 소비를 확인한 뒤 그 부분만 단일 소유 |
| L `src/i18n/`, `src/app/admin/layout.tsx`, `CallGuideEditor/EditorWorkspace.tsx` | ko/ja/en 메시지·쿠키 locale, 한국어 관리자와 미리보기 locale 분리 | 공개 앱 설정은 `apps/loudasobi`; 공유 뷰에 필요한 메시지는 뷰 패키지의 명시 진입점 | 관리자가 공개 앱 내부를 import하지 않게 필요한 메시지/provider 경계만 추출. locale 전환 시 플레이어 유지 | 양쪽 provider 연결 확인 후 추출한 메시지 사본 제거 |
| L `src/components/layout/{SongList,AppFrame,Header,SettingsMenu}.tsx`, `SongList/`, `AppFrame/`, `src/lib/sidebarOrder.ts` | 공개 셸·추천/앨범/발매순·그룹·스크롤·focus 갱신 | 공개 셸 `apps/loudasobi`; 공통 순수 정렬 계약 `content-core`; 관리자 재사용 곡 목록은 관리자 내부 또는 실제 공유 경계 | 보존된 SongList를 활용하되 공개/관리자 조회 필터와 상태 저장은 분리. 전체 앱 프레임을 범용화하지 않음 | 관리자 기능 확정 후 공통 계산만 한 원본으로 정리. 공개 셸 복제 금지 |
| M `src/components/layout/`, `src/components/custom/`, `src/app/page.tsx`, `src/app/{guide,players,heartbeat,onthestage}/`, `src/atoms/{appearance,font,sidebar,privateReader}.atom.ts` | 공개 셸·특수 페이지·사용자 설정 | `apps/monoasobi` | 1단계 동작 그대로. 7단계 기본 UI만 공통 부품으로 교체 | Radix Themes 전체 참조 소진 후 provider/CSS/의존성 제거 |
| M `src/components/content/`, `src/app/novel/`, `src/app/comic/`, `src/app/_components/RouteShell.tsx` | Markdown/만화·구매 링크·번역 안내·읽던 위치 | `apps/monoasobi` | 독자 인증·스토리지 키·문단/글꼴·스크롤 보존. `.rt-ScrollAreaViewport` 의존을 실제 viewport/ref로 교체 | 각 화면 시각/스크롤 QA 후 기존 테마 참조 제거 |
| M `src/components/common/{VideoPlayer,YouTubeLyricsPlayer,LyricOverlay,LyricsDisplayV2,Resizable}.tsx`, `VideoPlayer/`, `YouTubeLyricsPlayer/` | 공개 영상·가사 재생·시간 판정·모바일 확대 | `apps/monoasobi`; 가사 관리자에서 쓰는 부분만 실제 공유 경계 검토 | `[start,end)` 경계·100분의 1초 정규화·모바일 상단 레이어·볼륨 보존 | 계산이 실제 같을 때만 추출. 서로 다른 플레이어를 하나로 다시 쓰지 않음 |

## 관리자·인증·저장

| 원본 경로 | 재사용 기능 | 새 소유 위치 | 필요한 수정 | 임시 중복 제거 조건 |
| --- | --- | --- | --- | --- |
| L `src/app/admin/_components/AdminMusicManager.tsx`, `src/atoms/adminSidebar.ts`; M `AdminDashboard.tsx`, `AdminDashboard/`, `src/atoms/adminNavigation.atom.ts`, `src/components/layout/SidebarClient.tsx` | 곡 탐색·곡별 문서 탐색·선택 복원·이동 보호 | `apps/adminasobi` 공통 layout와 곡 상세 | 좌우 곡/콜 정보, URL 선택곡, 편집기 별도 페이지. sessionStorage의 ID 0 허용 및 상태 복원. 현 info/guide 탭·Activity 구조는 최종에서 제거 | 통합 관리자 상세/두 편집 페이지 직접 진입·곡 전환·저장 보호 검증 후 옛 셸 제거 |
| M `src/app/admin/_components/AdminDocumentPanel.tsx`, `AdminDocumentPanel/` | 음악·소설·만화·가사·서적 폼·AlbumArtField, editorConfigs | `apps/adminasobi` | 기존 field/payload 변환 활용, shadcn UI 경계 교체, 곡 정보와 콜 필드 저장 범위 분리 | 기능별 새 화면/권한/저장 QA 후 기존 관리자 패널 제거 |
| M `src/app/admin/_components/lyric-timeline/` | 영어 포함 가사 타임라인·드래그·스냅·영상·패널·단축키 | `apps/adminasobi`의 `/musics/[id]/lyrics` | 기존 훅/계산 유지, UI 교체와 routing 연결, revision 보호 추가, 공통 사이드바/이동 보호 | 원본 기능·초안 보호·재생 QA 후 Mono 기존 관리자 편집 경로 제거/이동 안내 |
| L `src/app/admin/_components/CallGuideEditor.tsx`, `CallGuideEditor/`, `AdminMusicManager/CallEditorPanel.tsx`, `src/lib/recentGuideTexts.ts` | 콜 타임라인·패턴/펄스·undo·원문 스냅샷·초안·편집기 설정·최근 문구 | `apps/adminasobi`의 `/musics/[id]/calls` | standalone route를 최종으로 연결. embedded 설정 연동/guideSaveInput은 필요한 계약만 재사용. 범용 타임라인 재작성 금지 | 새 독립 페이지/공유 미리보기/저장·충돌 QA 후 이전 route와 embedded 호출 제거 |
| L `src/app/admin/_components/{MusicSettingsForm,SidebarOrderEditor}.tsx`, `SidebarOrderEditor/` | 전용 영상/BPM/팬라이트/publish/offset, 추천 그룹/정렬 | `apps/adminasobi` | 기존 schema·필드 소유권·초안 보호·충돌 유지. 새 타이틀 CRUD/추천 관리 엔진 금지 | 새 폼·정렬 기능/쓰기 범위 확인 후 이전 관리자 기능 제거 |
| M `src/app/admin/_components/AdminSrtExport.tsx`, `AdminSrtExport/` | SRT 내보내기 | `apps/adminasobi` | 새 데이터 진입점/선택곡 연결. 기존 직렬화 유지 | 새 내보내기 결과/권한 확인 후 옛 진입점 제거 |
| L `src/server/auth/{admin,access,request}.ts`, `AdminAuthForm.tsx`; M `src/server/auth/admin.ts`, `AdminLogin.tsx` | HMAC 8시간 세션·admin/viewer·동일 출처·로그인 UI | `apps/adminasobi` | Loud audience 검증/세션 패턴 기준으로 최소 변경. 새 전용 cookie/audience. Mono 관리 query 내부 인증·write Origin 검사 보완 | 새 관리자 로그인/역할·쓰기 거부 QA 및 운영 전환 후 양쪽 옛 관리자 auth/쓰기에만 쓰던 비밀값 제거 |
| M `src/server/queries/admin.ts`, `src/server/mutations/{admin,albumArt}.ts`, `src/server/schemas/admin.schema.ts`, `src/app/api/admin/` | 공통 콘텐츠 CRUD·논리 삭제·이미지 관리 | `apps/adminasobi` 서버·API | 기존 mutation/업로드 실패 정리 순서 재사용, query마다 인증, 가사 revision, section별 필드 갱신, 공개 갱신 대상 분리 | 관리 기능별 쓰기/권한/갱신 QA 후 옛 관리자 API 종료. 공개 API는 유지 |
| L `src/server/queries/{admin,music,guide,sidebar}.ts`, `src/server/mutations/`, `src/server/schemas/music.ts`, `src/app/api/admin/` | 전용 설정·콜·추천 query/mutation·revision 검증 | `apps/adminasobi` 서버·API | getDb를 공유 DB 패키지로 연결, 공개에서도 쓰는 sidebar 읽기는 앱별 정책 분리. 콜+offset 트랜잭션 유지 | 새 저장 경로 QA 후 기존 관리자 쓰기 종료. 공개 query는 별도 유지 |

## 데이터·파일·설정

| 원본 경로 | 재사용 기능 | 새 소유 위치 | 필요한 수정 | 임시 중복 제거 조건 |
| --- | --- | --- | --- | --- |
| M `src/server/db/schema.ts`, `drizzle/`, `drizzle.config.ts`; L `src/server/db/schema.ts` | 정식 11개 테이블·relations·0000~0008 이력, Loud 부분 매핑 | `packages/database` | Mono 정식 정의와 journal/snapshot 보존. Loud musicSettings/callGuides/sidebarSettings 이름 차이는 소비자 import로 최소 조정. 일부 필드 공개 노출 방지 | 공유 정의로 모든 소비자 연결 후 Loud 부분 매핑 제거. 앱별 migrate 진입점도 단일 소유로 인계 |
| M/L `src/server/db/index.ts` | libSQL·Drizzle 연결 | `packages/database` 서버 전용 | 즉시 연결(M)·지연 연결(L) 차이를 소비자 import와 환경 검증에 맞게 처리, 공개 앱 read와 관리자 write 권한 설정은 별도 확인 | 세 앱이 명시적 server-only 진입점을 쓰면 앱별 연결 중복 제거 |
| M `src/server/queries/{publicCatalog,lyric,music,novel,comic,book,sidebar,mapper,activeMusic}.ts`; L `src/server/queries/{catalog,sidebar}.ts` | 공개 조회·논리 삭제/publish 필터·캐시 | 각 공개 앱 서버 | DB 정의만 공유. Mono cacheTag/hours와 Loud 동적 조회를 임의 통일하지 않음. 공개 영어 제거/포함 계약 유지 | query를 거대 공용 서비스로 옮기지 않음. 공유할 순수 변환이 확인될 때만 content-core 추출 |
| M `src/server/storage.ts`, `src/server/albumArtImage.ts`, `src/server/mutations/albumArt.ts`, `src/lib/albumArt.ts`; M/L `src/components/common/AlbumArtwork.tsx` | R2·Sharp·키 검증·업로드/조건부 교체·이미지 fallback | 업로드는 관리자 서버, 보호 파일 읽기는 Mono 서버, 범용 표시/loader는 `packages/ui` | 공용 loader에 서버 secret/인증 의존 금지. 보호 R2 읽기를 유지하며 관리자 쓰기와 필요한 저수준 연결만 실제 중복 시 추출. 별도 업로드 서비스/이미지 API 앱 금지 | assets 전환·캐시/교체/삭제 확인 후 옛 앨범아트 읽기 호환 경로 종료 검토. 소설/만화 R2 경로는 유지 |
| M `src/app/api/content/`, `src/server/auth/private-reader.ts`, `src/app/private/`, `src/app/api/private-reader/`, `src/server/auth/agent.ts`, `src/server/queries/agent.ts`, `src/app/api/agent/` | 공개/보호 콘텐츠 제공·독자 인증·Agent 읽기 | `apps/monoasobi` | 공개 URL·토큰·쿠키·독자 접근 조건 보존. 관리자 통합을 이유로 admin 앱에 이동/삭제하지 않음 | 제거 대상 아님. 앨범아트만 별도 전환 계획을 따름 |
| M `src/app/api/admin/_utils.ts`; L `src/lib/catalogUpdates.ts`, `src/components/layout/AppFrame/useCatalogRefresh.ts` | 저장 후 캐시/열린 화면 갱신 | 각 공개 앱 무효화 진입점 + 관리자 서버 알림 | 기존 focus 재조회 재사용. 앱 간 서버 인증 알림 추가, 저장/알림 실패 분리. cross-domain storage 가정 제거 | 각 앱의 새 갱신 연결 QA 후 같은 앱 안에서만 쓰던 임시 경로 정리 |
| M/L `public/`, `src/app` 아이콘·메타데이터, `src/lib/metadata.ts`, M `public/fonts/` | 로고·책/갤러리 이미지·로컬 폰트·manifest·OG | 각 공개 앱의 기존 URL 위치 | 파일명을 임의 변경하지 않음. 공유 폰트/자산은 실제 소비 확인 후 추출. 외부 Pretendard JP CSS 참조도 보존 | 기존 정적 앨범아트는 fallback 사용 여부와 R2 전환 확인 전 삭제하지 않음 |
| M `scripts/`, `src/server/db/seed*`; L `src/data/preview/` | 기존 집중 검사·운영 이전 도구·보관 자료 | 검사: 앱/소유 패키지별, 운영 도구: 최종 DB 소유 위치, 보관 자료: 구분 보존 | 경로만 필요한 만큼 조정. seed·backfill·이전 도구를 install/dev/build에 자동 연결 금지. preview fallback 금지 | 도구별 사용 여부 확인 후 정리. 운영 데이터 작업은 별도 승인, 과거 이전을 재실행하지 않음 |
| M/L `AGENTS.md`, 기존 계획·운영 docs, config/lockfile | 작업 규칙·운영 지식·실행 기준 | 새 루트 지침 + 앱별 정합화 문서, root lockfile | 이전 Radix-only/가사 Mono 전용/마이그레이션 Mono 전용 규칙을 단계에 맞게 인계. npm script는 실제 workspace 호출 | 새 소유권 확인 후 모순되는 복사 지침·앱별 lockfile 정리 |

## 새로 작성할 최소 연결 코드와 이유

1단계에서 루트 workspace/lockfile·실행 명령·Next root·환경변수 예시·제외 규칙을 구성했고, 2단계에서 공용 exports·의존성·DB 연결을 구성했습니다. 제품 UI·편집기·재생/콜 계산은 기존 구현을 재사용했습니다. 다음 항목의 1번은 실제 소비 경계까지 완료했고 2~4번은 후속 단계입니다.

1. 루트 npm workspace·앱별 이름/포트/공용 exports: 앱끼리 상대 경로 의존 없이 기존 코드를 빌드하기 위한 설정입니다.
2. 관리자 공통 layout·곡 상세 좌우 구성·별도 편집 route: 사용자가 확정한 화면 구조에 기존 폼/편집기를 연결하는 얇은 조립 부분입니다.
3. 가사 revision 보호 및 관리자 인증 경계의 누락 보완: 기존 코드에서 확인된 차이를 메우기 위한 최소 변경입니다.
4. 앱 간 공개 갱신 알림·독립 이미지 loader: 배포/도메인이 나뉘면서 기존 같은 출처 경로를 그대로 사용할 수 없는 부분입니다.

각 단계가 끝나면 실제 이동한 경로·새 코드 이유·소비자·남은 임시 사본을 이 표에 갱신합니다. 이관하지 않은 구현을 완료로 표시하지 않습니다.

## 2단계 실제 이동·제거 결과

| 기존 위치 | 현재 소유 위치 | 상태/남은 연결 |
| --- | --- | --- |
| Loud `src/components/ui` 기본 16개 TSX | `packages/ui/src/components` | 기존 함수/클래스를 보존해 이동. 옛 사본 제거, 모든 소비자 package import |
| Loud `src/lib/utils.ts` | `packages/ui/src/lib/utils.ts` | cn 단일 원본. sheet/tooltip의 앱 alias 제거 |
| Loud globals의 팔레트·라이트/다크 값·Tailwind 매핑/dark variant | `packages/ui/src/brand.css`, `packages/ui/src/styles.css` | 사용자 결정으로 세 앱 공용 브랜드 확정. Loud는 styles.css로 소비, Mono는 7단계 적용. layout CSS는 앱에 유지 |
| Loud callGuide/lyricPresentation/lyricText/callIcons/sidebarOrder + lucide 이름 JSON | `packages/content-core/src` 동명 파일 | 함수 구현 보존, 옛 사본 제거. query·mutation·Next 캐시는 이동하지 않음 |
| Loud catalog query 내부 linesSchema | `packages/content-core/src/catalogLyrics.ts` | 기존 엄격한 공개 타임라인 검증 그대로. Mono 관리자 폼 검증과 강제로 통합하지 않음 |
| 양 앱 lyric.d.ts | `packages/content-core/src/lyrics.ts` | 양쪽 optional 필드와 locale/콜 타입 보존. 앱별 사본 제거 |
| Mono lyricEnglish.ts, 플레이어 time.ts | `packages/content-core/src/lyricEnglish.ts`, `lyricTime.ts` | 순수 구현 그대로. 기존 activeLyric 검사 경로 갱신. 콜 roundTime과 가사 roundTime 각각 보존 |
| Mono schema.ts, drizzle/, drizzle.config.ts | `packages/database/src/schema.ts`, `drizzle/`, `drizzle.config.ts` | SQL/journal/snapshot 바이트 보존, 옛 사본 제거, config의 schema 경로만 수정 |
| 양 앱 DB client 생성 | `packages/database/src/index.ts` | 지연 연결 1개 원본. 앱 index는 기존 eager API/필수 token 검사만 보존하는 얇은 adapter |
| Loud 부분 DB mapping | 제거 후 canonical schema를 별칭 import | musicSettings/callGuides/sidebarSettings 이름만 소비자에서 alias. 테이블 재생성/DB 실행 없음 |

그대로 남긴 항목: 앱별 query/mutation/인증·cache 정책·전용 폼 schema·편집 훅·두 재생기·아이콘 선택기/검색 데이터·레이아웃 CSS. 후속 단계의 기능별 소유권 인계 전에는 제거하지 않습니다. `loudasobi-view`는 당시 미생성 상태였고, 아래 5단계에서 실제 공유 소비자와 함께 생성했습니다.

새로 작성한 연결은 DB singleton 진입점과 앱 adapter, package exports/peerDependencies, 공통 타입 검사/린트 설정입니다. `server-only`를 명시해 DB 연결의 클라이언트 import를 차단합니다. 원본 계약 확인용 작은 Node 검사 하나를 추가했고 새 테스트 프레임워크는 추가하지 않았습니다.

## 3단계 실제 인계

| 기존 위치 | 현재 소유 위치 | 연결/제거 조건 |
| --- | --- | --- |
| Loud 인증·로그인 폼·Origin 검사 | adminasobi의 auth/API/로그인 폼 | 새 cookie/audience 사용. 기존 관리자 전용 인증은 9단계 전환 후 종료 |
| Loud SongList·앨범 정렬·스크롤 복원 | ui의 song-list/sidebarScroll + content-core의 albumOrder/sidebarSongs | 기존 Loud는 locale·이미지 adapter만 유지. 새 관리자도 같은 목록 사용 |
| Loud fanlights 색상/키 | content-core/fanlights | 기존 Loud 진입점은 호환 re-export. 관리자 설정 schema가 같은 키 사용 |
| Mono musicSchema / Loud musicSettingsSchema | content-core/music, musicSettings | 기존 앱도 re-export로 연결. 공유 Zod 버전 4.6.5로 타입 경계 정렬 |
| Mono storage.ts / albumArtImage.ts / albumArt.ts | storage 패키지 + content-core/albumArt | Mono 읽기와 관리자 업로드의 실제 공용 구현. 기존 앱 진입점은 re-export |
| Mono updateMusic/음악 필드 + Loud saveMusicSettings/설정 폼 | adminasobi의 music/musicSettings mutation·개별 저장 폼 | 기존 관리자의 임시 사본은 기능별 전환 확인 후 9단계에 제거. 가사/콜 본문 소유권 유지 |
| Mono 앨범아트 body 제한·saveAlbumArt | adminasobi album-art API/mutation·미리보기 폼 | 기존 조건부 교체/실패 정리 재사용. 실제 R2 QA와 독립 주소는 4단계 |
| Mono 카탈로그 tag / Loud 공개 경로 갱신 | 각 공개 앱 internal/revalidate + 관리자 refresh | 인증된 고정 범위의 서버 간 알림. 열린 화면 갱신은 8단계 |


## 4단계 실제 이미지 소유권 인계

| 기존 구현 | 새 소유 위치 | 수정과 보존 |
| --- | --- | --- |
| M/L AlbumArtwork 및 3단계 관리자 adapter | `packages/ui/src/components/album-artwork.tsx` + 각 앱 얇은 adapter | 실패 표시/크기/비율/blob 유지, 명시적 CDN srcset을 위한 native img. 새 Next peer/이미지 서버 없음 |
| M `lib/albumArt` → 3단계 content-core | `packages/content-core/src/albumArt.ts` | 기존 소스 경로 유지, 독립 origin과 파일 키 검증·5개 크기 URL 추가 |
| M Sharp 정규화 → storage | `packages/storage/src/albumArt.ts` | 3MiB/40MP/포맷 보존, 1000px 축소 제거·픽셀 보존·출력 용량 제한 |
| 기존 R2 SDK get/put/delete 및 두 앨범아트 mutation | storage 단일 클라이언트 + 기존 mutation | 선택적 명시 버킷 인자. 사설 콘텐츠의 기본 버킷 유지. CAS/실패 정리 보존, 전환 중 이전 파일 삭제 보류 |
| 기존 static 앨범아트/공개 목록 | 원래 파일 보존 + `assets/album-art` 수집본 | 36곡 공식 배급본/출처/해시. 기존 키 유지 복사와 고해상도 새 키 교체를 분리해 검증한 뒤 운영 적용 |

공개 asset 환경변수가 없으면 기존 Mono 이미지 주소를 호환 사용합니다. 독립 도메인은 활성화·실측을 마쳤고 로컬 세 앱은 공개 CDN 읽기를 설정했습니다. 운영 배포 전환은 아직이며 이후 레거시 adapter 제거 여부를 검토합니다. 기존 관리자 자체 제거는 9단계 범위입니다. 실제 진행/검증·승인은 [migration-status.md](migration-status.md), 외부 연결/복구 절차는 [album-art-delivery.md](album-art-delivery.md)를 따릅니다.


## 5단계 실제 편집기 소유권 인계

| 재사용 원본 | 현재 소유 위치 | 수정·보존·제거 조건 |
| --- | --- | --- |
| L player 전체·CallIcon/HandSwing/FanLightBadge·volume atom·i18n messages | `packages/loudasobi-view/src` | Loud 원래 진입점은 re-export만 유지. 공개와 관리자 콜 미리보기가 같은 renderer/clock/player를 사용. 관리자에서는 공개 Space 리스너를 끄고 편집 리스너만 활성화 |
| L `CallGuideEditor/`와 최근 문구·아이콘 선택기 | `adminasobi/src/components/editors/CallGuideEditor*`, `components/ui`, `lib/recentGuideTexts.ts` | 아이콘 검색 데이터와 MIT 고지 보존. 예전 관리자 사본은 9단계 전환 QA 후 종료 |
| M 가사 타임라인·CSS·스냅·선택·resize | `adminasobi/src/components/editors/lyric-timeline` | UI만 공용 shadcn 연결. 줄 ID/EN 필드·0.01초·Cmd/Ctrl 스냅 해제 유지. 원본 관리자 사본은 9단계 종료 |
| M useLyricPlayer/useYouTubePlayback/overlay·Resizable·SRT | `adminasobi/src/components/editors/playback`, `Resizable*`, `AdminSrtExport*` | 첫 재생 전 seek·영상 크기 조절·SRT 직렬화 보존. 볼륨만 공유 atom 연결. Mono 공개 재생기는 기존 위치 유지 |
| L history·shortcut·viewport·zoom 동작 | `adminasobi/src/components/editors/shared` | 두 편집기가 실제 공유. 가사에 undo/redo·선택 줄 반복·초안 복사·확대 제스처를 연결. 서로 다른 타임라인 엔진을 합치지 않음 |
| M lyricLineSchema/lyricTrackSchema | `content-core/src/lyricTrackInput.ts` | Mono 기존 schema가 re-export하고 새 관리자도 사용. 겹침 허용과 EN 필드·ID 검증 보존 |
| M 가사 transaction / L guide query·mutation·guideSaveInput | `adminasobi/src/server/{queries,mutations}/{lyrics,guide}.ts` 및 해당 editor helper | 가사 revision 추가. 콜 sourceRevision 추가로 원문 동시 수정 시 최신 revision 자동 승격 금지. 실제 이전 API 종료는 9단계 |
| 기존 관리자 navigation guard | `adminasobi/src/components/NavigationGuard*` | 앱 이동·beforeunload 유지, popstate 처리 보강. 구형 브라우저 fallback과 화면 QA 한계는 editor-migration에 기록 |

두 편집기의 공통화는 새 관리자 내부를 대상으로 합니다. 예전 Mono 공개/관리자 전체에 새 조작을 역이식한 것은 아닙니다. 기존 관리자와 새 관리자의 임시 중복은 기능별 QA·운영 전환 후 제거합니다. 앱끼리 내부 파일을 직접 import하지 않습니다.


## 6단계 실제 콘텐츠·추천 인계

| 원본 | 실제 새 소유 위치 | 변경·제거 조건 |
| --- | --- | --- |
| M AdminDocumentPanel/editorConfigs·types·utils·adminSelectedDocument 및 Dashboard/selection | adminasobi `components/content` | 동일 필드/payload/조건부 표시·문서 탐색을 shadcn과 URL/공통 guard에 연결. 기존 관리자 사본은 9단계 전환 후 종료 |
| M novel/comic/book schema | content-core/contentInput | Mono 기존 schema는 re-export. translated/isPublished/book 관계 의미 유지 |
| M getAdminDashboard·실제 CRUD·soft delete/restoreMusic | 관리자 queries/content·mutations/content·contentRoutes | 인증·공유 DB·트랜잭션 경계 추가. 숨긴 novel의 서적 관계 보존. 파일 CRUD를 새로 만들지 않음 |
| M lyric JSON 생성/삭제·SRT·선택적 앨범아트 | 새 콘텐츠 폼 + 기존 lyrics mutation/앨범아트 API/5단계 SRT | 수정/삭제 revision, 생성 ID·업로드 재시도 보존. 실제 R2 통합 QA 남음 |
| L SidebarOrderEditor/SidebarGroupEditor·sidebar query/mutation/API | 관리자 동일 이름 경로 | 그룹명 다국어·drag/button 정렬·membership/revision 그대로, 공통 guard/공개 갱신 결과 연결 |

새 관리자에서 실제 사용하는 것만 이관했고 기존 updateMusic을 콘텐츠 mutation에 중복 추가하지 않았습니다. JSON 가사 수정은 기존 saveLyrics, UI 테마/부품은 ui, 추천 계산은 content-core 단일 구현을 사용합니다. 사용자 QA/검토사항은 별도 진행 중이며 [content-migration.md](content-migration.md)의 미검증 목록과 함께 추후 반영합니다.


## 7단계 실제 UI 인계

| 기존 구현 | 새 위치/방식 | 보존·예외 |
| --- | --- | --- |
| M 일반 UI의 Radix Text/Heading·Flex·Card·Button·입력/Popover/ScrollArea | 기존 컴포넌트 유지, HTML + ui shadcn + Tailwind | 상태/조회/URL/권한/자료는 유지. ScrollArea viewportRef/viewportProps·data-slot 연결 |
| M 공개 일반 UI 18개 CSS Modules | 컴포넌트 Tailwind 또는 정적 `.styles.ts` | 상태/반응형/가상 요소는 Tailwind 컴파일. 별도 CSS-in-JS/새 UI 엔진 없음 |
| M/L 반복 제목·설명·라벨·소형 메타 + 공용 기본 부품 | ui/styles.css의 공통 `type-*` | Mono 공개 UI·Loud 설정/곡 목록·새 관리자 실제 소비. 가사/콜 읽기 위계 별도 |
| M LyricsDisplayV2 / L LyricRow 읽기 스케일 | ui의 lyric/call 역할 + 기존 표시 컴포넌트 | Mono 13/14/16px와 Loud clamp·자간·활성 굵기 보존 |
| M/새 관리자 Resizable 동일 구현 | ui/components/resizable | 기존 Group/Panel과 18px handle. 옛 진입점은 re-export |
| 새 관리자 가사 타임라인 CSS Module | 기존 타임라인 + Tailwind 정적 변형 | drag/resize/snap/history/재생 훅 유지. 일반 면/텍스트 공통 토큰 정합화 |
| 사용자 직접 조정 NovelReader/NovelMarkdown | 기존 모듈/CSS 방식 전체 유지 | 뷰어 혼용 금지. Markdown 원래 규칙 보존, 상속색만 기존 값으로 명시. 필요한 Radix Theme/CSS legacy 레이어 유지 |

소설 외 남은 3개 모듈은 종료 예정인 옛 Mono 관리자용이며 9단계 기능 전환 확인 후 제거합니다. Radix 완전 제거를 완료했다고 보고하지 않습니다. 자세한 기준·실제 브라우저 비교·미검증은 [ui-migration.md](ui-migration.md)를 따릅니다.

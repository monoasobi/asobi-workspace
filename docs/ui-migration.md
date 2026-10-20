# 7단계 공개 UI·최소 디자인 시스템 이관

2026-10-20 기준 코드와 로컬 검증 기록입니다. 사용자가 별도로 진행 중인 QA·운영 검토는 보류하며, 모든 화면/실제 콘텐츠/모바일 QA 완료로 보고하지 않습니다.

## 확정 범위와 결과

- Mono/Loud 일반 UI의 기존 반복 패턴을 공통 타이포그래피 역할로 정리했습니다. 기존 공용 Loud 팔레트/shadcn을 Mono 공개 화면에도 연결했습니다. 역할과 위치는 [ui-design-system.md](ui-design-system.md)를 따릅니다.
- Mono 헤더·사이드바·홈·안내/특수 페이지·콘텐츠 프레임·구매 안내·번역 안내·만화·독자 로그인·로딩/오류·가사/영상 표시를 공용 shadcn/HTML/Tailwind로 전환했습니다. 기존 서버 조회·공개/독자 권한·API·콘텐츠 URL은 변경하지 않았습니다.
- 공개 일반 UI와 새 관리자에서 CSS Modules를 제거했습니다. 정적 Tailwind 조합은 관련 `.styles.ts`에 두며 상태/반응형/가상 요소도 Tailwind가 처리합니다. 별도 CSS-in-JS/컴포넌트 프레임워크를 도입하지 않았습니다.
- 새 관리자 가사 타임라인 표시만 Tailwind로 옮기고 계산/선택/resize/스냅/재생 코드는 유지했습니다. 글자/블록 면색은 공통 foreground와 투명 primary로 정리했습니다.
- 같은 패널 조절 부품을 ui로 추출해 Mono와 새 관리자의 사본을 얇은 re-export로 바꿨습니다. 18px handle과 기존 Group/Panel API를 유지합니다.
- 초기에는 소설 뷰어 전체 CSS Modules 보존을 선택했으나, 이후 사용자가 혼용 금지를 철회했습니다. 현재는 기존 문법별 CSS Modules + Themes 부품을 대체한 HTML/Tailwind·공용 shadcn입니다. 종료 예정인 옛 Mono 관리자의 3개 모듈은 9단계까지 보존하며 이번에 역이식하지 않았습니다.

## 소설의 강한 보존 계약

사용자 직접 조정 화면이므로 일반 UI 통일보다 화면 보존이 우선합니다. 후속 사용자 결정으로 Tailwind/CSS Modules 혼용을 허용합니다. CSS Modules의 사용자 지정 문법 규칙은 그대로 유지하고 Themes 부품만 대체합니다.

- `NovelReader.module.css`는 기존 `.rt-ScrollAreaViewport` 선택자를 공용 `data-slot`으로 바꾼 것 외에 기준 커밋과 동일합니다. 뷰어의 크기·viewport 여백·720px 본문 폭·모바일 조건을 보존했습니다.
- Markdown 원래 스타일 선언, 폰트 선택, remark-breaks, h1/h2/h3/h4의 태그/크기/정렬/여백, 줄바꿈/들여쓰기·인용·대사/화자·강조·목록 처리를 보존했습니다.
- 일반 카드 글자색이 본문에 상속되는 실제 차이를 확인해 Markdown CSS Module에 **기존 gray-12 읽기 색만 명시**했습니다. 이 색상 명시를 유지하며, 이후 승인에 따라 Heading/Text를 일반 HTML과 정확한 기존 수치의 Tailwind로 대체했습니다.
- NovelReader의 읽기 canvas marker와 기존 gray-1 배경을 유지합니다. Flex는 HTML/Tailwind, ScrollArea는 기존 공용 shadcn으로 대체했습니다. viewportRef/viewportProps.onScroll에 기존 위치 저장/복원 로직을 연결하고 세로 스크롤·4px 스크롤바·여백·thumb 확장 hit area·표시 애니메이션을 유지합니다.
- 소설의 `@radix-ui/themes` 부품 import는 제거했습니다. 읽기 색상 변수/애니메이션·상속 기본값과 전환 전 관리자를 위해 기존 Theme/패키지/CSS는 유지합니다. 공용 shadcn ScrollArea 내부의 Radix primitive도 그대로 재사용합니다. 사용자 보존 조건을 위해 예외를 확정한 것이며 Radix 완전 제거를 완료했다고 보고하지 않습니다.
- Radix 스타일은 `legacy` CSS 레이어, 원래 전역 reset은 `base`, Tailwind는 `utilities` 레이어로 분리했습니다. Tailwind preflight는 전역에 넣지 않았습니다. 기존 reset이 새 utility의 padding/margin을 덮는 문제도 이 경계에서 해결했습니다.
- 소설 ScrollArea도 viewportRef/viewportProps·명시적 data-slot으로 이관했습니다. 기존 소설 fetch/권한/위치 저장 키/복원 로직은 유지합니다. Sidebar의 기존 1024px 포함 경계도 보존했습니다.

기준 SHA-256은 [novel-style-baseline.json](novel-style-baseline.json), 재확인은 `npm run check:ui`입니다. 최초 원본 hash는 보존합니다. Markdown 문법 CSS 원문은 계속 검사하고, Reader 모듈의 viewport 선택자 변경만 정규화합니다. 승인된 Tailwind 렌더러 hash는 별도로 고정하며 공개 Themes import를 금지합니다. 소스 hash는 픽셀 동일성 검증을 대신하지 않습니다.

## 실제 확인과 한계

| 검증 | 실제 결과 |
| --- | --- |
| 브라우저 변경 전/후 문법 스타일 | 최초 UI 전환: 밝은 테마/바탕의 19개 속성 일치. 이후 Themes 부품 교체: **밝음/어두움 × 바탕/고딕 4조합, 각 11개 예시·47개 요소 × 25개 속성 일치**, 차이 0 |
| 후속 비교 속성 | font family/size/weight/style·line-height·letter-spacing·text-indent/align·color/background·margin 4개·padding 4개·radius·transform·list-style·white-space·display·width/height |
| 원본 계약 검사 | 기존 문법 CSS hash·승인된 렌더러 hash·공개 Themes import 제거·공개/새 관리자 모듈 잔여 경계·공통 역할 통과 |
| lint/typecheck | 최초 전환 시 모든 앱/공용 패키지 통과. 후속 소설 부품 교체 후 영향받은 Mono lint/typecheck 재검사 통과 |
| 기존 집중 검사 | core 3·editor 4·content 2·Mono fullscreen/activeLyric/snap 6개 통과 |
| 편집 HTTP 회귀 | 기존 합성 DB 가사/콜 auth·revision·EN/ID·필드 소유권 검사 통과, fixture 복원 |
| 공개 HTTP | 로컬 Mono `/`, `/guide`, `/players`, `/heartbeat`, `/onthestage`, `/private`와 Loud `/` 모두 200 |
| CSS 파싱 | 실제 브라우저 CSSOM에서 영상 전체화면의 safe-area 포함 폭 계산이 유효한 width임을 확인 |
| 설치 계획 | `npm ci --dry-run --ignore-scripts --offline` 통과. 기존 workspace 버전의 Tailwind/shadcn과 panels를 재사용 |

추가로 임시 합성 소설을 기존/변경 Reader에 나란히 넣어 뷰포트 460×648px, 본문 영역 폭 412px, 전체 스크롤 높이 7329px의 일치를 확인했습니다. 키보드 스크롤 후 새로고침 시 scrollTop 608→608 복원을 확인했습니다. 임시 route/본문/기존 렌더러 사본은 검사 후 삭제했으며 운영 DB/R2를 사용하지 않았습니다.

이 비교는 전체 실제 소설의 픽셀 비교나 모든 기기 검증이 아닙니다. 다른 뷰포트·실제 장문/폰트 로딩 조건·끝까지 읽은 뒤 위치 초기화·만화 정렬/복원·실제 영상 재생/모바일 dialog fallback·편집 드래그/좁은 화면 전환·독자 인증 UI는 사용자 QA가 남습니다. 글꼴 파일/URL과 기존 본문 렌더링은 유지했지만 조건별 전체 화면 동일성은 사용자 확인 전 완료 처리하지 않습니다.

Production build·운영 DB/R2/DNS·푸시·배포는 하지 않았습니다. 새 테스트 프레임워크/자동 브라우저 테스트 환경도 추가하지 않았습니다. 두 원본 저장소는 보존합니다.

## 후속 작업

사용자가 QA/검토사항을 정리하면 함께 반영합니다. 요청 시 8단계 앱 간 저장 반영·캐시·열린 화면/재생 유지·환경 검증으로 이어갑니다. 이미지 운영 키 교체·원격/도메인/배포·옛 관리자 종료는 별도 범위를 유지합니다. 소설 보존을 위해 남긴 Radix를 일괄 제거하지 마세요.

# 7단계 공개 UI·최소 디자인 시스템 이관

2026-10-20 기준 코드와 로컬 검증 기록입니다. 사용자가 별도로 진행 중인 QA·운영 검토는 보류하며, 모든 화면/실제 콘텐츠/모바일 QA 완료로 보고하지 않습니다.

## 확정 범위와 결과

- Mono/Loud 일반 UI의 기존 반복 패턴을 공통 타이포그래피 역할로 정리했습니다. 기존 공용 Loud 팔레트/shadcn을 Mono 공개 화면에도 연결했습니다. 역할과 위치는 [ui-design-system.md](ui-design-system.md)를 따릅니다.
- Mono 헤더·사이드바·홈·안내/특수 페이지·콘텐츠 프레임·구매 안내·번역 안내·만화·독자 로그인·로딩/오류·가사/영상 표시를 공용 shadcn/HTML/Tailwind로 전환했습니다. 기존 서버 조회·공개/독자 권한·API·콘텐츠 URL은 변경하지 않았습니다.
- 공개 일반 UI와 새 관리자에서 CSS Modules를 제거했습니다. 정적 Tailwind 조합은 관련 `.styles.ts`에 두며 상태/반응형/가상 요소도 Tailwind가 처리합니다. 별도 CSS-in-JS/컴포넌트 프레임워크를 도입하지 않았습니다.
- 새 관리자 가사 타임라인 표시만 Tailwind로 옮기고 계산/선택/resize/스냅/재생 코드는 유지했습니다. 글자/블록 면색은 공통 foreground와 투명 primary로 정리했습니다.
- 같은 패널 조절 부품을 ui로 추출해 Mono와 새 관리자의 사본을 얇은 re-export로 바꿨습니다. 18px handle과 기존 Group/Panel API를 유지합니다.
- 소설 뷰어는 **CSS Modules 방식 전체 유지**를 선택했습니다. 종료 예정인 옛 Mono 관리자의 3개 모듈은 9단계까지 보존하며 이번에 역이식하지 않았습니다.

## 소설의 강한 보존 계약

사용자 직접 조정 화면이므로 일반 UI 통일보다 화면 보존이 우선합니다. 뷰어 내부 Tailwind와 CSS Modules를 혼용하지 않습니다.

- `NovelReader.module.css`는 기준 커밋과 바이트 동일합니다. 뷰어의 크기·viewport 여백·720px 본문 폭·모바일 조건을 보존했습니다.
- Markdown 원래 스타일 선언, 폰트 선택, remark-breaks, h1/h2/h3/h4의 태그/크기/정렬/여백, 줄바꿈/들여쓰기·인용·대사/화자·강조·목록 처리를 보존했습니다.
- 일반 카드 글자색이 본문에 상속되는 실제 차이를 확인해 Markdown CSS Module에 **기존 gray-12 읽기 색만 명시**했습니다. 렌더러 변경은 이 root class 연결뿐입니다.
- NovelReader JSX에는 읽기 canvas를 구분하는 비시각적 `data-novel-viewer`만 추가했습니다. 주변 앱 canvas도 읽기 중에는 기존 gray-1을 유지합니다.
- 기존 Radix Theme/패키지/CSS를 소설과 전환 전 관리자 때문에 유지합니다. 사용자 보존 조건을 위해 예외를 확정한 것이며 Radix 완전 제거를 완료했다고 보고하지 않습니다.
- Radix 스타일은 `legacy` CSS 레이어, 원래 전역 reset은 `base`, Tailwind는 `utilities` 레이어로 분리했습니다. Tailwind preflight는 전역에 넣지 않았습니다. 기존 reset이 새 utility의 padding/margin을 덮는 문제도 이 경계에서 해결했습니다.
- 기존 소설 ScrollArea/ref/스크롤 복원과 `.rt-ScrollAreaViewport` 계약은 그대로입니다. 나머지 새 ScrollArea만 viewportRef/viewportProps·명시적 data-slot을 사용합니다. Sidebar의 기존 1024px 포함 경계도 보존했습니다.

기준 SHA-256은 [novel-style-baseline.json](novel-style-baseline.json), 재확인은 `npm run check:ui`입니다. 비시각적 marker와 기존 상속색 명시만 허용하며 Markdown 문법/사용자 스타일의 변경은 잡아냅니다.

## 실제 확인과 한계

| 검증 | 실제 결과 |
| --- | --- |
| 브라우저 변경 전/후 문법 스타일 | 로컬 `/guide`, 동일 브라우저/뷰포트의 기본 밝은 테마·바탕 글꼴에서 **11개 문법 예시·47개 요소 × 19개 computed style 속성 일치**, 차이 0 |
| 비교 속성 | font family/size/weight·line-height·letter-spacing·text-indent/align·color/background·margin 3개·padding 4개·radius·transform·list-style |
| 원본 계약 검사 | 소설 source/style hash·뷰어 혼용 금지·공개/새 관리자 모듈 잔여 경계·공통 읽기/UI 역할 통과 |
| 전체 lint/typecheck | 모든 앱/공용 패키지 통과. 마지막 Mono 제목/버튼 수정 후 Mono 재검사 통과 |
| 기존 집중 검사 | core 3·editor 4·content 2·Mono fullscreen/activeLyric/snap 6개 통과 |
| 편집 HTTP 회귀 | 기존 합성 DB 가사/콜 auth·revision·EN/ID·필드 소유권 검사 통과, fixture 복원 |
| 공개 HTTP | 로컬 Mono `/`, `/guide`, `/players`, `/heartbeat`, `/onthestage`, `/private`와 Loud `/` 모두 200 |
| CSS 파싱 | 실제 브라우저 CSSOM에서 영상 전체화면의 safe-area 포함 폭 계산이 유효한 width임을 확인 |
| 설치 계획 | `npm ci --dry-run --ignore-scripts --offline` 통과. 기존 workspace 버전의 Tailwind/shadcn과 panels를 재사용 |

이 비교는 전체 실제 소설의 픽셀 비교나 모든 기기 검증이 아닙니다. 다른 뷰포트/다크/고딕·본문 스크롤 복원·만화 정렬/복원·실제 영상 재생/모바일 dialog fallback·편집 드래그/좁은 화면 전환·독자 인증 UI는 사용자 QA가 남습니다. 글꼴 파일/URL과 기존 본문 렌더링은 유지했지만 조건별 전체 화면 동일성은 사용자 확인 전 완료 처리하지 않습니다.

Production build·운영 DB/R2/DNS·푸시·배포는 하지 않았습니다. 새 테스트 프레임워크/자동 브라우저 테스트 환경도 추가하지 않았습니다. 두 원본 저장소는 보존합니다.

## 후속 작업

사용자가 QA/검토사항을 정리하면 함께 반영합니다. 요청 시 8단계 앱 간 저장 반영·캐시·열린 화면/재생 유지·환경 검증으로 이어갑니다. 이미지 운영 키 교체·원격/도메인/배포·옛 관리자 종료는 별도 범위를 유지합니다. 소설 보존을 위해 남긴 Radix를 일괄 제거하지 마세요.

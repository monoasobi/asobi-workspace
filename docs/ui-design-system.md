# ASOBI 최소 공통 UI 규칙

사용자 확정: 두 공개 앱이 같은 팬 활동에서 나온 서비스로 인식되도록 기존 반복 패턴을 정리합니다. 이름·로고·공개 URL·콘텐츠 구조를 새로 디자인하는 단계가 아닙니다.

## 소유권

- 색상·라이트/다크·radius·motion: `packages/ui/src/brand.css`.
- Tailwind 연결과 타이포그래피 역할: `packages/ui/src/styles.css`.
- 버튼·입력·팝오버·곡 목록·패널 조절: `packages/ui/src/components`.
- 기능별 레이아웃/반응형/상태 조합: 컴포넌트의 Tailwind 클래스 또는 `.styles.ts` 정적 클래스 표. CSS Modules를 JS 스타일 엔진으로 대체한 것이 아니며, 모든 표시 규칙은 Tailwind가 컴파일합니다.

## 일반 UI 타이포그래피

| 역할 | 클래스 | 기준 |
| --- | --- | --- |
| 페이지 제목 | `type-page-title` | 24px·semibold·tight 줄간격/자간 |
| 섹션 제목 | `type-section-title` | 18px·semibold·snug |
| 카드/그룹 제목 | `type-card-title` | 16px·semibold·snug |
| 본문 | `type-body` | 14px·normal·24px 줄간격 |
| 설명 | `type-description` | 14px·normal·relaxed·muted |
| 라벨 | `type-label` | 14px·medium·짧은 줄간격 |
| 작은 메타 정보 | `type-caption` | 12px·normal·relaxed·muted |
| 작은 구분 제목 | `type-eyebrow` | 12px·semibold·넓은 자간·primary |

수치는 기존 Loud의 `text-sm/text-xs` 중심 패턴에서 정리했습니다. semantic heading 태그는 문서 구조에 맞게 선택하며 역할 클래스가 태그 이름을 대신하지 않습니다. 로고 이미지와 기존 한국어/일본어 제목은 유지합니다. 버튼/배지 내부 글자는 해당 공용 컴포넌트의 크기 variant를 우선합니다.

## 읽기는 별도 역할

- **소설:** 사용자 조정 문법 CSS Modules를 유지하고 기존 Themes 부품은 HTML/Tailwind·공용 shadcn으로 대체합니다. 사용자가 혼용 금지를 철회했습니다. 일반 UI의 제목 역할/Typography 플러그인을 일괄 적용하지 않으며 기존 28/24/18px 제목·행간·자간·색상을 보존합니다. 읽기 색상 변수/애니메이션은 아직 기존 Theme/CSS에 의존합니다.
- **Mono 가사:** `type-lyric-jp` 13px, `type-lyric-reading` 14px, `type-lyric-translation` 16px/700, 줄간격 1.2. 기존 언어별 강조를 유지합니다.
- **Loud 콜/가사:** `type-call-source`, `type-call-translation`은 기존 container-responsive clamp 크기·자간·relaxed 줄간격 그대로입니다. 활성 줄의 굵기와 pulse/박수 표시는 원래 컴포넌트가 담당합니다.
- 영상 자막과 편집 타임라인은 공간/선택 상태에 따른 기존 전용 위계를 유지합니다. 일반 본문 역할로 일괄 축소하지 않습니다.

## 공간과 부품

- 공통 버튼/입력/선택/Popover/Badge를 재사용하고 앱별 유사 사본을 만들지 않습니다.
- 일반 간격은 Tailwind 기본 spacing scale과 기존 반복값을 사용합니다. 화면 컨테이너·카드의 반응형 값은 현재 레이아웃을 보존하며 점진적으로 정리합니다. 브랜드 통일을 이유로 전체 화면 간격을 다시 설계하지 않습니다.
- 기본 면은 background/card, 텍스트는 foreground/muted-foreground, 선택/강조는 primary/secondary/accent, 구분은 border/input 토큰을 씁니다. 영상의 검은 배경·흰 자막과 소설의 보존된 읽기 색은 도메인 예외입니다.
- 실제 재생 진행률·볼륨·타임라인 좌표처럼 계산되는 값은 기존 inline style/CSS custom property로 유지합니다. 모든 수치를 고정 클래스에 억지로 넣지 않습니다.
- 공통 Resizable은 기존 라이브러리와 18px 조절 핸들 계약을 사용합니다. Mono/새 관리자 모두 같은 구현입니다.

읽기 보존·검사와 남은 QA는 [ui-migration.md](ui-migration.md)에 기록합니다.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요
- 이 프로젝트는 Expo React Native 기반의 간단한 근태관리 앱이다.
- 앱 이름은 WorkBoard이다.
- 회사 직원용 근태/연차 관리 MVP를 목표로 한다.
- 현재는 실제 Node.js + Oracle 백엔드 API와 연결되어 동작한다 (포트 3000).
- Expo Router + TypeScript 기반으로 개발한다.
- iOS, Android, Web을 지원하는 cross-platform React Native 앱이다.

## 언어 및 커뮤니케이션 규칙
- 기본 응답 언어: 한국어
- 코드 주석: 영어
- 커밋 메시지: 영어
- 문서화: 한국어
- 변수명/함수명: 영어, 코드 표준 준수

## 실행 명령어
- 개발 서버 실행: `npm start`
- Android 에뮬레이터 실행: `npm run android`
- iOS 시뮬레이터 실행: `npm run ios`
- Web 실행: `npm run web`
- ESLint 실행: `npm run lint`
- 프로젝트 초기화 참고: `npm run reset-project`

## 개발 규칙
- Expo Router 기반으로 화면을 구성한다.
- TypeScript를 사용한다.
- `app/` 폴더는 라우팅 화면용으로 사용한다.
- `app/` 안의 파일은 직접 route가 된다.
- `app/_layout.tsx`는 전체 navigation layout을 담당하며, AuthProvider로 앱 전체를 감싼다.
- `app/(tabs)/index.tsx`는 홈 화면 route로 사용한다.
- 탭 네비게이션은 `app/(tabs)/` 그룹 구조를 사용한다.
- `app/login.tsx`는 로그인 화면으로 인증 보호 라우팅(`Stack.Protected`)을 통해 관리된다.
- `src/components`에는 공통 컴포넌트를 배치한다.
- `src/services`에는 API 호출 service 함수를 작성한다.
- `src/contexts`에는 전역 상태 Context를 작성한다 (AuthContext 등).
- `src/config`에는 API 기본 설정 및 URL 유틸리티를 작성한다 (api.ts).
- `src/data`에는 테스트용 mock data를 작성한다 (현재는 attendance.ts만 남아있음).
- `src/types`에는 타입 정의를 작성한다.
- `src/utils`에는 날짜 포맷 등 공통 유틸 함수를 작성한다.
- 화면에서 직접 데이터를 fetch하지 말고 services를 통해 접근한다.
- API 호출은 반드시 `src/config/api.ts`의 `fetchAPI` 함수와 `API_CONFIG` 엔드포인트를 사용한다.
- 너무 복잡한 라이브러리는 추가하지 않고 기본 React Native 컴포넌트 위주로 작성한다.
- 새 패키지가 필요하면 설치 전에 먼저 이유와 설치 명령어를 설명한다.
- Path alias `@/*`는 project root 기준 import에 사용할 수 있다.

## 폴더 구조 기준
- `app/`
  - `_layout.tsx` — RootLayout: AuthProvider 래핑 + Stack.Protected 인증 보호 라우팅
  - `login.tsx` — 로그인 화면 (미인증 사용자 전용)
  - `(tabs)/`
    - `_layout.tsx` — 탭 레이아웃 (L4 사용자만 approve 탭 표시, Tabs.Protected 사용)
    - `index.tsx` — 홈 화면
    - `calendar.tsx` — 근태 캘린더 화면
    - `leave.tsx` — 연차 신청 화면
    - `approve.tsx` — 연차 승인 화면 (L4 전용)
    - `profile.tsx` — 내 정보 화면
- `src/`
  - `components/` — 공통 컴포넌트 (StatusBadge 등)
  - `contexts/` — 전역 상태 Context (AuthContext)
  - `config/` — API 설정 (api.ts: API_CONFIG, fetchAPI)
  - `services/` — API 호출 서비스 (authService, attendanceService, leaveService, userService)
  - `data/` — 테스트용 mock data (attendance.ts)
  - `types/` — 타입 정의 (index.ts)
  - `utils/` — 유틸 함수 (dateUtils.ts)

## MVP 범위
### 홈 화면
- 오늘 날짜 표시
- 오늘 근무 상태 표시 (미출근 시 출근 버튼 제공, StatusBadge 컴포넌트 사용)
- 이번 달 근무 요약 표시 (출근/결근/휴가 일수)
- 잔여 연차 표시

### 로그인 기능 [완료]
- 실제 Node.js + Oracle API(`/api/auth/login`)로 로그인한다.
- 로그인 로직은 `authService` 레이어로 분리되어 있다.
- 로그인 성공 시 사용자 정보를 전역 상태(AuthContext)에 저장한다.
- 로그인 성공 시 자동으로 오늘 출근 체크인(`checkInToday`)을 시도한다.
- 로그인하지 않은 사용자는 `Stack.Protected`를 통해 메인 화면에 접근할 수 없다.
- 로그인 실패 시 에러 메시지를 표시한다 (네트워크 오류 포함).
- 로그아웃 기능을 제공한다 (AuthContext의 `logout` 함수).

### 근태 캘린더 화면
- 월별 캘린더 형태
- 팀원들의 휴가 사용 여부를 날짜별로 표시 (승인된 휴가만)
- 휴가 인원이 있는 날짜에 인원 수 표시 (예: 2명)
- 날짜 탭 시 해당 날짜의 휴가 인원 목록 표시 (이름, 부서)
- 오늘 날짜 및 선택된 날짜 구분 표시
- leaveService의 `getTeamLeaveSummaryByMonth`를 통해 데이터 접근

### 연차 신청 화면
- 시작일 입력
- 종료일 입력
- 사유 입력
- 신청 버튼
- 신청 완료 시 Alert 표시
- 실제 저장은 mock 처리
- 시작일/종료일 입력 영역 오른쪽에 달력 아이콘 표시
- 달력 아이콘 탭 시 DateTimePicker 팝업으로 날짜 선택 (`@react-native-community/datetimepicker`)
  - iOS: 하단 Modal + spinner 형태 + 취소/확인 버튼
  - Android: 네이티브 캘린더 다이얼로그 팝업 (선택 후 자동 닫힘)
  - Web: TextInput 폴백 (숫자 입력 시 YYYY-MM-DD 자동 포맷)
- 날짜 유효성 검사
  - 시작일은 종료일보다 늦을 수 없음
  - 종료일은 시작일보다 빠를 수 없음
  - 종료일 picker의 최솟값은 선택된 시작일로 설정
  - 시작일 변경 시 종료일이 더 이르면 종료일 자동 초기화
  - 직접 입력(Web) 시에도 동일한 유효성 검사 적용
  - 잘못된 날짜 입력/선택 시 Alert로 안내

### 내 정보 화면
- 이름 표시
- 부서 표시
- 직급 표시
- 사번 표시
- 이메일 표시
- 잔여 연차 표시
- 사용 연차 표시
- 최근 신청 내역 표시 (없을 경우 '최근 신청 내역이 없습니다.' 문구 표시)
- 화면 전체는 ScrollView 기반으로 구성
- iOS/Android/Web 모두 깨지지 않도록 구현
- userService 및 leaveService를 통해 데이터 접근
- User 타입: `id`, `employeeNo`, `name`, `group`, `departmentId`, `department`, `position`, `email`, `totalLeaves`, `usedLeaves`

### 연차 승인 화면 (L4 전용) [완료]
- L4 position 사용자만 탭에 표시됨 (`Tabs.Protected guard={isL4}`)
- 같은 부서의 대기 중인 연차 신청 목록 표시
- 승인 / 반려 처리 가능
- leaveService의 `getPendingLeaveRequests`, `processLeave`를 통해 데이터 접근
- userService의 `getUsersByDepartment`로 신청자 정보 표시

## 아직 하지 않을 것
- 실제 DB 연결 (현재 백엔드 API를 통해 간접 연결)
- 세션 영속화 (AsyncStorage/SecureStore로 로그인 상태 유지)
- 푸시알림
- 복잡한 관리자 기능

## 작업 방식
- 먼저 현재 프로젝트 구조를 확인한다.
- 변경할 파일 목록과 설계 방향을 간단히 설명한다.
- 그다음 파일을 생성/수정한다.
- 마지막에 실행 방법과 확인 방법을 알려준다.
- 한 번에 너무 복잡하게 만들지 않고 MVP 수준으로 진행한다.
- 에러가 발생하면 원인, 수정 방법, 다시 실행할 명령어를 순서대로 설명한다.

## 코딩 스타일
- 컴포넌트명은 PascalCase를 사용한다.
- 변수명과 함수명은 camelCase를 사용한다.
- 타입명과 인터페이스명은 PascalCase를 사용한다.
- 화면 컴포넌트는 가능한 한 얇게 유지하고, 데이터 처리는 service에서 담당한다.
- 반복되는 UI는 `src/components`로 분리한다.
- 날짜/문자열 포맷 함수는 `src/utils`로 분리한다.

## 참고
- `app-example/`은 reset-project로 이동된 예제 코드이다.
- `app-example/`은 참고용으로만 사용한다.
- 실제 MVP 구현은 `app/`와 `src/` 기준으로 작성한다.
- 예제 구조를 그대로 복사해서 프로젝트를 불필요하게 복잡하게 만들지 않는다.

## MCP / Context7 사용 규칙

- Expo, React Native, Expo Router, TypeScript 관련 기능을 구현하거나 수정할 때는 최신 문서 확인을 위해 Context7 MCP를 우선 사용한다.
- 외부 라이브러리나 패키지를 설치/사용/수정할 때는 기존 지식만으로 판단하지 말고 Context7로 공식 문서 또는 최신 사용법을 확인한다.
- 특히 아래 작업에서는 반드시 Context7을 사용한다.
  - Expo Router 라우팅 구조 변경
  - React Native 컴포넌트/네이티브 패키지 사용
  - Android/iOS 플랫폼별 분기 처리
  - DateTimePicker, SecureStore, AsyncStorage, Axios 등 외부 패키지 적용
  - Expo SDK 관련 설정 변경
- Context7 확인 후, 현재 프로젝트 구조에 맞게 최소 변경으로 구현한다.
- 문서 확인이 필요한 작업을 할 때 사용자가 별도로 말하지 않아도 `use context7` 기준으로 진행한다.

## 각 기술 스텍이 공식문서의 최신 버전을 준수하고 있는지 단계별로 검토해주세요.

고려사항 :
1. 공식 문서 설치가이드 확인
2. 가이드 내용을 준수하고 있는지 확인

참고링크 :  
1.https://docs.expo.dev
2.https://context7.com/

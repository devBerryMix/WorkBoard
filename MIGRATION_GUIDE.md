# 프론트엔드 API 연동 마이그레이션 가이드

## 📅 작업 날짜
- 2026-05-07

## 🎯 목표
프론트엔드 서비스 레이어를 Mock 데이터 기반에서 **Node.js + Express 백엔드 API 기반**으로 변경

---

## 📊 변경 사항 요약

### 1️⃣ **새로운 파일 추가**

#### `src/config/api.ts` ✨ NEW
- 백엔드 API 설정 중앙화
- 모든 API 엔드포인트 URL 정의
- `fetchAPI()` 헬퍼 함수로 일관된 HTTP 요청 처리
- **참고**: 로컬 개발 시 `http://localhost:3000` 사용. 프로덕션 배포 시 환경 변수로 변경 필요

```typescript
API_CONFIG.ENDPOINTS.AUTH.LOGIN              // POST /api/auth/login
API_CONFIG.ENDPOINTS.USERS.GET_USER(userId)  // GET /api/users/:userId
API_CONFIG.ENDPOINTS.LEAVES.GET_USER_LEAVES(userId)  // GET /api/leaves/user/:userId
// ... 등 모든 엔드포인트 관리
```

---

### 2️⃣ **서비스 레이어 변경**

#### `src/services/authService.ts` 🔄 MODIFIED
| 변경 전 | 변경 후 |
|--------|--------|
| Mock 계정 데이터와 mockUsers 배열에서 검색 | `POST /api/auth/login` API 호출 |
| 동기 함수 | **비동기 함수** (async/await) |
| 에러: `INVALID_CREDENTIALS`, `USER_NOT_FOUND` | 에러: `INVALID_CREDENTIALS`, `LOGIN_FAILED` |

**함수 변경**:
```typescript
// Before: export async function login(email, password): Promise<User>
//         → Mock 데이터에서 직접 검색

// After: export async function login(email, password): Promise<User>
//        → API 호출: POST /api/auth/login
//        → 백엔드에서 사용자 정보 반환
```

**호출 예시**:
```typescript
try {
  const user = await login('jeongho.l@workboard.com', '1234');
  console.log(user); // { id, email, name, department, ... }
} catch (error) {
  // INVALID_CREDENTIALS, LOGIN_FAILED
}
```

---

#### `src/services/userService.ts` 🔄 MODIFIED
| 변경 전 | 변경 후 |
|--------|--------|
| `getUser(): User` - mockUsers[0] 반환 | `getUser(userId): Promise<User>` - API 호출 |
| 동기 함수 | **비동기 함수** (async/await) |
| 파라미터 없음 | **필수 파라미터**: `userId` |

**함수 변경**:
```typescript
// Before: export function getUser(): User
//         → 항상 첫 번째 사용자(mockUsers[0]) 반환

// After: export async function getUser(userId): Promise<User>
//        → API 호출: GET /api/users/:userId
//        → 특정 사용자 정보 반환
```

**호출 예시**:
```typescript
const user = await getUser('1'); // userId 전달 필수!
```

---

#### `src/services/leaveService.ts` 🔄 MODIFIED

| 함수명 | 변경 전 | 변경 후 | 상태 |
|--------|--------|--------|------|
| `getLeaveRequests(userId)` | 동기 (메모리 배열) | 비동기 API 호출 | ✅ |
| `submitLeave()` | 동기 (메모리 저장) | 비동기 API 호출 | ✅ |
| `getUsedLeaveDays(userId)` | 동기 (userId → 계산) | **함수 시그니처 변경** | ⚠️ |
| `getTeamLeaveSummaryByMonth()` | 동기 (메모리 계산) | 비동기 API 호출 | ✅ |
| `getPendingLeaveRequests()` | 동기 (메모리) | MVP 미지원 (stub) | ❌ |
| `processLeave()` | 동기 (메모리) | MVP 미지원 (stub) | ❌ |

**⚠️ 중요한 변경: `getUsedLeaveDays()` 함수 시그니처 변경**

```typescript
// Before: getUsedLeaveDays(userId: string): number
//         → 내부에서 leaveRequests 배열에서 검색
//         → 동기 함수

// After: getUsedLeaveDays(leaveRequests: LeaveRequest[]): number
//        → 이미 로드된 LeaveRequest[] 배열 받음
//        → 순수 계산 함수 (동기)
//        → 호출하는 곳에서 먼저 leaves를 API로 로드해야 함
```

**호출 예시**:
```typescript
// 새로운 패턴
const leaves = await getLeaveRequests(userId);  // API 호출
const usedDays = getUsedLeaveDays(leaves);      // 순수 계산
```

**전체 함수 변경 상세**:

```typescript
// getLeaveRequests(userId)
// Before: 메모리 배열 필터링 (동기)
// After: GET /api/leaves/user/:userId (비동기)
async function getLeaveRequests(userId: string): Promise<LeaveRequest[]>

// submitLeave(startDate, endDate, reason, userId)
// Before: 메모리 배열에 추가 (동기)
// After: POST /api/leaves (비동기)
async function submitLeave(...): Promise<LeaveRequest>

// getTeamLeaveSummaryByMonth(year, month)
// Before: 메모리 배열 처리 (동기, 복잡한 날짜 계산)
// After: GET /api/leaves/month/:year/:month (비동기)
//        백엔드에서 이미 처리된 결과 반환 (날짜 계산 불필요)
async function getTeamLeaveSummaryByMonth(...): Promise<Record<string, TeamLeaveMember[]>>

// getUsedLeaveDays(leaveRequests)
// Before: getUsedLeaveDays(userId: string): number
// After: getUsedLeaveDays(leaveRequests: LeaveRequest[]): number
//        순수 계산 함수, 동기 유지
function getUsedLeaveDays(leaveRequests: LeaveRequest[]): number
```

---

### 3️⃣ **컴포넌트 / 화면 변경**

#### `app/login.tsx` ✅ NO CHANGE
- 이미 `authService.login()`을 async/await로 호출 중
- 변경 없음

---

#### `app/(tabs)/profile.tsx` 🔄 MODIFIED
**변경 사항**:
- `useState()` 초기값으로 비동기 함수 호출 제거
- `useFocusEffect` 추가: 탭 포커스 시 API 데이터 새로고침
- 에러 처리 추가

**코드 비교**:
```typescript
// Before
const [usedDays, setUsedDays] = useState(() => 
  user ? getUsedLeaveDays(user.id) : 0
);
const [recentRequests, setRecentRequests] = useState<LeaveRequest[]>(() =>
  user ? getLeaveRequests(user.id).slice(-3).reverse() : []
);
useFocusEffect(
  useCallback(() => {
    if (!user) return;
    setUsedDays(getUsedLeaveDays(user.id));
    setRecentRequests(getLeaveRequests(user.id).slice(-3).reverse());
  }, [user])
);

// After
const [usedDays, setUsedDays] = useState<number>(0);
const [recentRequests, setRecentRequests] = useState<LeaveRequest[]>([]);
const [loading, setLoading] = useState(true);

useFocusEffect(
  useCallback(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    (async () => {
      try {
        const requests = await getLeaveRequests(user.id);
        const used = getUsedLeaveDays(requests);
        setUsedDays(used);
        setRecentRequests(requests.slice(-3).reverse());
      } catch (error) {
        console.error('Failed to load leave requests:', error);
        setRecentRequests([]);
        setUsedDays(0);
      } finally {
        setLoading(false);
      }
    })();
  }, [user])
);
```

---

#### `app/(tabs)/leave.tsx` 🔄 MODIFIED
**변경 사항**:
- `useState()` 초기값 제거 (비동기 함수 호출 불가)
- `useFocusEffect` 추가: 탭 포커스 시 데이터 새로고침
- `handleSubmit()` → **비동기 함수로 변경**
- Loading/submitting 상태 관리 추가

**주요 변경**:
```typescript
// Before
const [requests, setRequests] = useState<LeaveRequest[]>(() => 
  user ? getLeaveRequests(user.id) : []
);
const [usedDays, setUsedDays] = useState(() => 
  user ? getUsedLeaveDays(user.id) : 0
);

const handleSubmit = () => {
  // ... 검증
  submitLeave(...);
  setRequests(getLeaveRequests(user.id));
  setUsedDays(getUsedLeaveDays(user.id));
  // ...
};

// After
const [requests, setRequests] = useState<LeaveRequest[]>([]);
const [usedDays, setUsedDays] = useState(0);
const [loading, setLoading] = useState(true);
const [submitting, setSubmitting] = useState(false);

useFocusEffect(
  useCallback(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    (async () => {
      try {
        const reqs = await getLeaveRequests(user.id);
        const used = getUsedLeaveDays(reqs);
        setRequests(reqs);
        setUsedDays(used);
      } catch (error) {
        console.error('Failed to load leave requests:', error);
        setRequests([]);
        setUsedDays(0);
      } finally {
        setLoading(false);
      }
    })();
  }, [user])
);

const handleSubmit = async () => {
  // ... 검증
  setSubmitting(true);
  try {
    await submitLeave(...);
    const reqs = await getLeaveRequests(user.id);
    const used = getUsedLeaveDays(reqs);
    setRequests(reqs);
    setUsedDays(used);
    setStartDate('');
    setEndDate('');
    setReason('');
    Alert.alert('신청 완료', '...');
  } catch (error) {
    console.error('Failed to submit leave:', error);
    Alert.alert('신청 실패', '...');
  } finally {
    setSubmitting(false);
  }
};
```

---

#### `app/(tabs)/calendar.tsx` 🔄 MODIFIED
**변경 사항**:
- `useState()` 초기값으로 동기 함수 호출 제거
- `useEffect` 추가: 월 변경 시 API 데이터 로드
- `leaveMap` state로 관리

**코드 비교**:
```typescript
// Before
const leaveMap = getTeamLeaveSummaryByMonth(year, month);

// After
const [leaveMap, setLeaveMap] = useState<Record<string, TeamLeaveMember[]>>({});
const [loading, setLoading] = useState(true);

useEffect(() => {
  setLoading(true);
  (async () => {
    try {
      const map = await getTeamLeaveSummaryByMonth(year, month);
      setLeaveMap(map);
    } catch (error) {
      console.error('Failed to fetch team leave summary:', error);
      setLeaveMap({});
    } finally {
      setLoading(false);
    }
  })();
}, [year, month]);
```

---

#### `app/(tabs)/index.tsx` (홈 화면) 🔄 MODIFIED
**변경 사항**:
- `getUsedLeaveDays()` 함수 시그니처 변경에 따른 수정
- `useEffect` 추가: 초기 로드 시 leave 데이터 API 호출

**코드 비교**:
```typescript
// Before
const usedLeaves = getUsedLeaveDays(user.id);

// After
const [usedLeaves, setUsedLeaves] = useState(0);

useEffect(() => {
  if (!user) return;
  (async () => {
    try {
      const leaves = await getLeaveRequests(user.id);
      const used = getUsedLeaveDays(leaves);
      setUsedLeaves(used);
    } catch (error) {
      console.error('Failed to load leave data:', error);
      setUsedLeaves(0);
    }
  })();
}, [user]);
```

---

## 🔄 Mock 데이터 제거 현황

| 파일 | 제거됨? | 설명 |
|------|--------|------|
| `src/data/mockAccounts.ts` | ❌ NO | 여전히 참조 (향후 삭제 예정) |
| `src/data/user.ts` | ❌ NO | 백엔드 서버에 복사됨 |
| `src/data/leaves.ts` | ❌ NO | 백엔드 서버에 복사됨 |
| 서비스 레이어 | ✅ YES | Mock 데이터 의존성 완전 제거 |
| 컴포넌트 | ✅ YES | Mock 데이터 직접 호출 제거 |

**➡️ Mock 데이터 파일은 남겨둠** (백엔드 개발 중 참고용, 추후 정리)

---

## 🌐 API 통신 흐름

### 변경 전 (Mock)
```
Component → Service → Mock Data (메모리)
           (동기)
```

### 변경 후 (API)
```
Component → Service → API Client (fetch) → Backend (Express)
           (async/await)        (HTTP)      (Node.js)
                                              ↓
                                          Mock Data (Backend)
```

---

## ⚙️ 환경 설정

### 백엔드 서버 실행 (필수)
```bash
cd C:\ClaudeTestBackEnd\workboard-backend
npm run dev
# 또는
npm start
```

**포트**: http://localhost:3000 (기본값)

### 프론트 개발 서버 실행
```bash
cd C:\ClaudeTest\WorkBoard
npm start
```

---

## 🧪 테스트 시나리오

### 1️⃣ 로그인 테스트
```
1. 로그인 화면에서 이메일: jeongho.l@workboard.com, 비밀번호: 1234 입력
2. 네트워크 요청 확인: POST /api/auth/login
3. 홈 화면으로 이동 및 사용자 정보 표시 확인
```

### 2️⃣ 연차 신청 테스트
```
1. 연차 신청(Leave) 탭으로 이동
2. 시작일 ~ 종료일 선택, 사유 입력
3. 신청 버튼 클릭
4. 네트워크 요청 확인: POST /api/leaves
5. 신청 내역에서 새 신청 표시 확인
```

### 3️⃣ 캘린더 조회 테스트
```
1. 팀 휴가 현황(Calendar) 탭으로 이동
2. 월 이동 (이전/다음 버튼)
3. 네트워크 요청 확인: GET /api/leaves/month/:year/:month
4. 해당 월의 팀원 휴가 표시 확인
```

### 4️⃣ 프로필 조회 테스트
```
1. 내 정보(Profile) 탭으로 이동
2. 사용자 정보, 연차 현황, 최근 신청 내역 확인
3. 탭 전환 후 돌아왔을 때 최신 데이터로 새로고침되는지 확인
```

---

## ⚠️ 주의 사항

### 1. 백엔드 서버 필수
- 프론트를 실행하기 전에 **반드시 백엔드 서버를 먼저 실행**
- API 호출 시 네트워크 에러 가능성

### 2. CORS 설정
- 현재 백엔드의 CORS는 **모든 origin 허용** (개발용)
- 프로덕션 배포 시 특정 domain으로 제한 필요

### 3. 에러 처리
- API 실패 시 콘솔에 에러 로깅됨
- 사용자에게 Alert로 실패 메시지 표시
- 네트워크 재연결 로직은 MVP 범위 외

### 4. 데이터 일관성
- 백엔드는 **메모리 저장** (서버 재시작 시 초기화)
- 실제 DB 연결은 다음 페이즈

---

## 📋 향후 개선 계획

### Phase 2: 데이터베이스 (예정)
- [ ] Oracle 데이터베이스 연결
- [ ] 서버 재시작 후 데이터 유지
- [ ] Schema 설계 및 마이그레이션

### Phase 3: 보안 (예정)
- [ ] JWT 토큰 기반 인증
- [ ] 비밀번호 암호화 (bcrypt)
- [ ] CORS 정책 강화
- [ ] 입력 검증 미들웨어

### Phase 4: 추가 기능 (예정)
- [ ] 권한 관리 (Role-based)
- [ ] 로그 시스템
- [ ] API 문서화 (Swagger)

---

## 📝 변경 요약 표

| 항목 | 변경 전 | 변경 후 | 영향도 |
|------|--------|--------|--------|
| 데이터 소스 | Mock 배열 (메모리) | API (백엔드) | 🔴 High |
| 함수 특성 | 동기 | 비동기 (async/await) | 🔴 High |
| 에러 처리 | 에러 throw | try/catch + Alert | 🟡 Medium |
| 로딩 상태 | 관리 안 함 | Loading state 추가 | 🟡 Medium |
| 네트워크 | 없음 | HTTP (fetch) | 🔴 High |
| 설정 | 코드 내장 | config/api.ts | 🟢 Low |

---

**마지막 업데이트**: 2026-05-07
**작업 완료**: ✅ 모든 서비스 및 컴포넌트 수정 완료

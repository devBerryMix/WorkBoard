# Mock → Oracle API 마이그레이션 계획서

## 1. 개요

WorkBoard 앱을 mock 데이터 기반에서 실제 Oracle DB + Node.js API로 전환하기 위한 마이그레이션 계획입니다.

---

## 2. 아키텍처 변경

### 현재 구조 (Mock)
```
React Native App
  ├── app/ (화면)
  ├── src/services/ (mock 데이터 조회)
  ├── src/data/ (mock 데이터)
  └── src/contexts/ (AuthContext)
```

### 목표 구조 (Real API)
```
React Native App
  ├── app/ (화면) - 변경 없음
  ├── src/services/ (API 호출)
  │   ├── authService.ts (로그인 → API 호출)
  │   ├── leaveService.ts (연차 → API 호출)
  │   ├── attendanceService.ts (근태 → API 호출)
  │   └── apiClient.ts (공통 HTTP 클라이언트)
  ├── src/contexts/ (AuthContext) - 변경 없음
  └── src/data/ (mock 데이터 삭제)

Node.js Backend (새로 구축)
  ├── routes/
  │   ├── auth.ts
  │   ├── users.ts
  │   ├── leaves.ts
  │   └── attendance.ts
  ├── services/
  │   ├── authService.ts
  │   ├── userService.ts
  │   ├── leaveService.ts
  │   └── attendanceService.ts
  ├── models/ (ORM/SQL 쿼리)
  ├── middleware/ (인증, 에러 핸들링)
  └── database/ (Oracle 연결)

Oracle Database
  ├── TB_USERS
  ├── TB_LOGIN_ACCOUNTS
  ├── TB_LEAVE_REQUESTS
  ├── TB_ATTENDANCE_RECORDS
  └── (코드 테이블들)
```

---

## 3. 마이그레이션 단계

### Phase 1: API 서버 구축 (1-2주)
- [ ] Node.js + Express 프로젝트 초기 설정
- [ ] Oracle DB 연결 설정 (oracledb 패키지)
- [ ] 테이블 생성 (oracle_table_design.sql)
- [ ] Mock 데이터 → Oracle 마이그레이션 스크립트
- [ ] 기본 API 엔드포인트 구현
  - POST /api/auth/login
  - POST /api/auth/logout
  - GET /api/users/:userId
  - GET /api/leaves/pending
  - POST /api/leaves
  - PATCH /api/leaves/:leaveId/approve
  - PATCH /api/leaves/:leaveId/reject
  - GET /api/attendance/:userId

### Phase 2: React Native 앱 수정 (1주)
- [ ] API 클라이언트 (axios/fetch) 설정
- [ ] authService.ts 수정 (mock → API)
- [ ] leaveService.ts 수정 (mock → API)
- [ ] attendanceService.ts 추가 (근태 관련)
- [ ] 에러 핸들링 & 로딩 상태 관리
- [ ] localStorage/AsyncStorage에서 토큰 저장

### Phase 3: 테스트 & 배포 (1주)
- [ ] 통합 테스트
- [ ] 성능 테스트
- [ ] API 문서화 (Swagger/OpenAPI)
- [ ] 배포 및 모니터링

---

## 4. 서비스 계층 마이그레이션 상세

### 4.1 authService.ts

**현재 (Mock)**
```typescript
export async function login(email: string, password: string): Promise<User> {
  const account = mockAccounts.find(a => a.email === email);
  if (!account || account.password !== password) throw new Error('Invalid credentials');
  return mockUsers.find(u => u.id === account.userId)!;
}
```

**변경 후 (API)**
```typescript
export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await apiClient.post('/auth/login', { email, password });
  // 응답: { user: User, token: string, refreshToken: string }
  // AsyncStorage에 토큰 저장
  return response.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
  // AsyncStorage에서 토큰 삭제
}
```

### 4.2 leaveService.ts

**현재 (Mock)**
```typescript
export function getLeaveRequests(userId: string): LeaveRequest[] {
  return leaveRequests.filter(r => r.userId === userId);
}

export function getPendingLeaveRequests(): LeaveRequest[] {
  return leaveRequests.filter(r => r.status === 'pending');
}

export function submitLeave(startDate, endDate, reason, userId): LeaveRequest {
  const newRequest = { /* ... */ };
  leaveRequests.push(newRequest);
  return newRequest;
}
```

**변경 후 (API)**
```typescript
export async function getLeaveRequests(userId: string): Promise<LeaveRequest[]> {
  const response = await apiClient.get(`/leaves?userId=${userId}`);
  return response.data;
}

export async function getPendingLeaveRequests(): Promise<LeaveRequest[]> {
  const response = await apiClient.get('/leaves/pending');
  return response.data;
}

export async function submitLeave(
  startDate: string,
  endDate: string,
  reason: string,
  userId: string
): Promise<LeaveRequest> {
  const response = await apiClient.post('/leaves', {
    startDate,
    endDate,
    reason,
    userId
  });
  return response.data;
}

export async function processLeave(
  id: string,
  action: 'approved' | 'rejected'
): Promise<void> {
  await apiClient.patch(`/leaves/${id}/${action}`, {
    // 승인자 정보, 반려사유 등
  });
}
```

### 4.3 attendanceService.ts (새로 추가)

```typescript
export async function getAttendanceRecords(userId: string, year?: number, month?: number): Promise<AttendanceRecord[]> {
  const params = new URLSearchParams({ userId });
  if (year) params.append('year', year.toString());
  if (month) params.append('month', month.toString());
  const response = await apiClient.get(`/attendance?${params}`);
  return response.data;
}

export async function checkIn(userId: string): Promise<AttendanceRecord> {
  const response = await apiClient.post(`/attendance/${userId}/checkin`);
  return response.data;
}

export async function checkOut(userId: string): Promise<AttendanceRecord> {
  const response = await apiClient.post(`/attendance/${userId}/checkout`);
  return response.data;
}
```

---

## 5. API 엔드포인트 설계

### 5.1 인증 (Authentication)

```
POST /api/auth/login
  Request: { email: string, password: string }
  Response: {
    user: User,
    token: string,
    refreshToken: string,
    expiresIn: number (초 단위)
  }

POST /api/auth/logout
  Request: { }
  Response: { success: boolean }

POST /api/auth/refresh
  Request: { refreshToken: string }
  Response: { token: string, expiresIn: number }
```

### 5.2 사용자 (Users)

```
GET /api/users/:userId
  Response: User

GET /api/users/:userId/leaves/summary
  Response: {
    userId: string,
    totalLeaveDays: number,
    usedLeaveDays: number,
    remainingLeaveDays: number
  }
```

### 5.3 연차 (Leaves)

```
GET /api/leaves
  Query: userId (필수)
  Response: LeaveRequest[]

GET /api/leaves/pending
  Response: LeaveRequest[] (모든 대기중인 신청, L4만 접근 가능)

GET /api/leaves/:leaveId
  Response: LeaveRequest

POST /api/leaves
  Request: {
    userId: string,
    startDate: string (YYYY-MM-DD),
    endDate: string (YYYY-MM-DD),
    reason: string
  }
  Response: LeaveRequest

PATCH /api/leaves/:leaveId/approve
  Request: {
    approvalUserId: string,
    remarks?: string
  }
  Response: LeaveRequest

PATCH /api/leaves/:leaveId/reject
  Request: {
    approvalUserId: string,
    rejectionReason: string
  }
  Response: LeaveRequest
```

### 5.4 근태 (Attendance)

```
GET /api/attendance
  Query: userId, year?, month?
  Response: AttendanceRecord[]

POST /api/attendance/:userId/checkin
  Request: { }
  Response: AttendanceRecord

POST /api/attendance/:userId/checkout
  Request: { }
  Response: AttendanceRecord

GET /api/team/leaves/by-month
  Query: year, month
  Response: {
    [dateString]: TeamLeaveMember[]
  }
```

---

## 6. 데이터 타입 매핑

| React Native Type | Oracle Table | 설명 |
|---|---|---|
| User.id | TB_USERS.USER_ID | VARCHAR2(50) |
| User.employeeNo | TB_USERS.EMPLOYEE_NO | VARCHAR2(20) |
| User.name | TB_USERS.USER_NAME | VARCHAR2(100) |
| User.department | TB_USERS.DEPARTMENT_CODE | VARCHAR2(10) |
| User.position | TB_USERS.POSITION_CODE | VARCHAR2(10) |
| User.email | TB_USERS.EMAIL | VARCHAR2(100) |
| User.totalLeaves | TB_USERS.TOTAL_LEAVE_DAYS | NUMBER(3) |
| LeaveRequest.status | TB_LEAVE_REQUESTS.LEAVE_STATUS_CODE | VARCHAR2(20) |
| AttendanceRecord.date | TB_ATTENDANCE_RECORDS.ATTENDANCE_DATE | DATE |
| AttendanceRecord.checkIn | TB_ATTENDANCE_RECORDS.CHECK_IN_TIME | VARCHAR2(5) |

---

## 7. 마이그레이션 스크립트

### Mock → Oracle 데이터 이관

```javascript
// Node.js 스크립트 예시
const mockUsers = require('./src/data/user').mockUsers;
const mockLeaveRequests = require('./src/data/leaves').mockLeaveRequests;

async function migrateData(db) {
  // 1. 사용자 마이그레이션
  for (const user of mockUsers) {
    await db.execute(
      `INSERT INTO TB_USERS (USER_ID, EMPLOYEE_NO, USER_NAME, DEPARTMENT_CODE, POSITION_CODE, EMAIL, TOTAL_LEAVE_DAYS)
       VALUES (:USER_ID, :EMPLOYEE_NO, :USER_NAME, :DEPARTMENT_CODE, :POSITION_CODE, :EMAIL, :TOTAL_LEAVE_DAYS)`,
      {
        USER_ID: user.id,
        EMPLOYEE_NO: user.employeeNo,
        USER_NAME: user.name,
        DEPARTMENT_CODE: 'DEV', // 현재는 모두 개발팀
        POSITION_CODE: user.position,
        EMAIL: user.email,
        TOTAL_LEAVE_DAYS: user.totalLeaves
      }
    );
  }

  // 2. 연차 신청 마이그레이션
  for (const leave of mockLeaveRequests) {
    await db.execute(
      `INSERT INTO TB_LEAVE_REQUESTS (LEAVE_REQUEST_ID, USER_ID, START_DATE, END_DATE, LEAVE_REASON, LEAVE_STATUS_CODE, CREATED_AT)
       VALUES (:LEAVE_REQUEST_ID, :USER_ID, TO_DATE(:START_DATE, 'YYYY-MM-DD'), TO_DATE(:END_DATE, 'YYYY-MM-DD'), :LEAVE_REASON, :LEAVE_STATUS_CODE, SYSTIMESTAMP)`,
      {
        LEAVE_REQUEST_ID: leave.id,
        USER_ID: leave.userId,
        START_DATE: leave.startDate,
        END_DATE: leave.endDate,
        LEAVE_REASON: leave.reason,
        LEAVE_STATUS_CODE: leave.status.toUpperCase()
      }
    );
  }
}
```

---

## 8. 보안 고려사항

- [ ] 패스워드는 항상 해싱된 형태로 저장 (bcrypt, SHA256)
- [ ] JWT 토큰 사용 (AccessToken + RefreshToken)
- [ ] HTTPS 필수 (프로덕션)
- [ ] CORS 설정 (앱 도메인만 허용)
- [ ] SQL Injection 방지 (Prepared Statement)
- [ ] Rate Limiting (로그인 시도 제한)
- [ ] 감사 로그 (Audit Trail)

---

## 9. 성능 최적화

- [ ] 데이터베이스 인덱스 (이미 설계됨)
- [ ] API 응답 캐싱 (Redis)
- [ ] Pagination (대량 데이터 조회 시)
- [ ] 쿼리 최적화
- [ ] Connection Pooling

---

## 10. 배포 계획

### 개발 환경
- 로컬 Oracle DB 또는 Docker Oracle
- npm start (앱 + API 동시 실행)

### 테스트 환경
- 클라우드 Oracle DB (AWS RDS, GCP Cloud SQL)
- 테스트 서버에서 API 검증

### 프로덕션 환경
- 회사 Oracle DB
- 클라우드 또는 자체 서버에 Node.js API 배포

---

## 11. 롤백 계획

- Mock 데이터 유지 (조건부 사용)
- Feature Flag로 API/Mock 선택 가능하게 구현
- 문제 발생 시 빠르게 Mock으로 되돌릴 수 있도록 설계

---

## 12. 다음 단계

1. Oracle 데이터베이스 준비 (테이블 생성)
2. Node.js API 서버 개발 시작
3. API 엔드포인트 구현 및 테스트
4. React Native 앱 수정 (서비스 계층)
5. 통합 테스트
6. 배포 및 모니터링

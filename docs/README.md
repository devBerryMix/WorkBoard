# WorkBoard 데이터베이스 & API 마이그레이션 가이드

## 📚 문서 목록

### 1. **oracle_table_design.sql**
- **목적**: Mock 데이터를 Oracle 데이터베이스에 저장하기 위한 테이블 설계서
- **포함 내용**:
  - 코드 테이블 (직급, 부서, 상태 코드)
  - 마스터 테이블 (사용자, 로그인 계정)
  - 거래 테이블 (연차 신청, 근태 기록)
  - 뷰 (사용자 연차 현황, 팀원 휴가 현황)
  - 시퀀스 & 샘플 데이터
- **사용 방법**:
  ```bash
  sqlplus system/password@oracle_db < oracle_table_design.sql
  ```

### 2. **migration_plan.md**
- **목적**: Mock 데이터에서 실제 Oracle API로 전환하기 위한 마이그레이션 전략
- **포함 내용**:
  - 아키텍처 변경사항
  - 마이그레이션 3단계 계획
  - 서비스 계층 상세 변경사항
  - API 엔드포인트 설계
  - 데이터 타입 매핑
  - 마이그레이션 스크립트 예시
  - 보안 및 성능 고려사항
  - 배포 & 롤백 계획
- **주요 특징**:
  - 기존 React Native 앱 구조 유지
  - 서비스 계층만 변경 (UI 변경 없음)
  - Mock → API 단계적 마이그레이션 가능
  - Feature Flag로 조건부 사용 가능

---

## 🏗️ 현재 구조 (Mock)

```
WorkBoard 앱 (React Native)
├── src/services/
│   ├── authService.ts (mock login)
│   ├── leaveService.ts (mock leave requests)
│   └── userService.ts (mock users)
├── src/data/
│   ├── user.ts (mockUsers)
│   ├── leaves.ts (mockLeaveRequests)
│   ├── attendance.ts (mockAttendanceRecords)
│   └── mockAccounts.ts (login accounts)
└── src/contexts/
    └── AuthContext.tsx (global user state)
```

---

## 🎯 목표 구조 (Real API)

```
WorkBoard 앱 (React Native)
├── src/services/
│   ├── authService.ts (API login)
│   ├── leaveService.ts (API calls)
│   ├── attendanceService.ts (API calls)
│   └── apiClient.ts (HTTP client config)
└── src/contexts/
    └── AuthContext.tsx (global user state)

Node.js Backend API
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
└── database/
    └── Oracle 연결

Oracle Database
├── TB_USERS
├── TB_LOGIN_ACCOUNTS
├── TB_LEAVE_REQUESTS
├── TB_ATTENDANCE_RECORDS
└── (코드 테이블)
```

---

## 📋 현재 엔티티 & Oracle 테이블 매핑

### User (사용자)
```
React Native:
{
  id: string,
  employeeNo: string,
  name: string,
  department: string,
  position: string,
  email: string,
  totalLeaves: number,
  usedLeaves: number
}

↓ Maps to ↓

Oracle:
TB_USERS:
  USER_ID (PK) - VARCHAR2(50)
  EMPLOYEE_NO - VARCHAR2(20) UNIQUE
  USER_NAME - VARCHAR2(100)
  DEPARTMENT_CODE - VARCHAR2(10) FK
  POSITION_CODE - VARCHAR2(10) FK
  EMAIL - VARCHAR2(100) UNIQUE
  TOTAL_LEAVE_DAYS - NUMBER(3)
  STATUS - VARCHAR2(1) (A/I/D)
  CREATED_AT, UPDATED_AT - TIMESTAMP
```

### LeaveRequest (연차 신청)
```
React Native:
{
  id: string,
  userId: string,
  startDate: string (YYYY-MM-DD),
  endDate: string (YYYY-MM-DD),
  reason: string,
  status: 'pending' | 'approved' | 'rejected',
  createdAt: string (YYYY-MM-DD)
}

↓ Maps to ↓

Oracle:
TB_LEAVE_REQUESTS:
  LEAVE_REQUEST_ID (PK) - VARCHAR2(50)
  USER_ID (FK) - VARCHAR2(50)
  START_DATE - DATE
  END_DATE - DATE
  LEAVE_REASON - VARCHAR2(500)
  LEAVE_STATUS_CODE (FK) - VARCHAR2(20)
  APPROVAL_USER_ID (FK) - VARCHAR2(50)
  APPROVED_AT - TIMESTAMP
  REJECTION_REASON - VARCHAR2(500)
  CREATED_AT, UPDATED_AT - TIMESTAMP
```

### AttendanceRecord (근태 기록)
```
React Native:
{
  date: string (YYYY-MM-DD),
  checkIn?: string (HH:mm),
  checkOut?: string (HH:mm),
  status: 'present' | 'absent' | 'leave' | 'holiday'
}

↓ Maps to ↓

Oracle:
TB_ATTENDANCE_RECORDS:
  ATTENDANCE_RECORD_ID (PK) - VARCHAR2(50)
  USER_ID (FK) - VARCHAR2(50)
  ATTENDANCE_DATE - DATE
  CHECK_IN_TIME - VARCHAR2(5)
  CHECK_OUT_TIME - VARCHAR2(5)
  ATTENDANCE_STATUS (FK) - VARCHAR2(20)
  REMARKS - VARCHAR2(500)
  CREATED_AT, UPDATED_AT - TIMESTAMP
```

---

## 🚀 마이그레이션 로드맵

### Phase 1: 데이터베이스 준비 (1-2주)
- [ ] Oracle 데이터베이스 생성
- [ ] oracle_table_design.sql 실행
- [ ] 테이블 및 뷰 생성 확인
- [ ] Mock 데이터 마이그레이션 스크립트 작성 & 실행
- [ ] 데이터베이스 기본 쿼리 테스트

### Phase 2: Node.js API 서버 구축 (1-2주)
- [ ] Node.js + Express 프로젝트 초기화
- [ ] Oracle 데이터베이스 연결 (oracledb)
- [ ] API 엔드포인트 구현
  - 인증 (login, logout, refresh)
  - 사용자 (get user, get leave summary)
  - 연차 (list, pending, submit, approve, reject)
  - 근태 (list, checkin, checkout)
- [ ] 미들웨어 (인증, 에러 핸들링, CORS)
- [ ] API 문서화 (Swagger)

### Phase 3: React Native 앱 수정 (1주)
- [ ] API 클라이언트 설정 (axios/fetch)
- [ ] authService.ts 수정 (API 호출)
- [ ] leaveService.ts 수정 (API 호출)
- [ ] attendanceService.ts 추가
- [ ] 로컬 스토리지에 토큰 저장
- [ ] 에러 핸들링 & 로딩 상태

### Phase 4: 테스트 & 배포 (1주)
- [ ] 통합 테스트
- [ ] 성능 테스트
- [ ] 보안 검토 (SQL Injection, XSS 등)
- [ ] 스테이징 환경 배포
- [ ] 모니터링 설정

---

## 📝 주요 특징

### 1. Service Layer 분리
현재 코드는 이미 서비스 계층이 분리되어 있어 **UI 변경 없이** 데이터 소스만 변경 가능합니다.

**변경 전 (Mock)**
```typescript
// src/services/leaveService.ts
export function getLeaveRequests(userId: string): LeaveRequest[] {
  return leaveRequests.filter(r => r.userId === userId);
}
```

**변경 후 (API)**
```typescript
// src/services/leaveService.ts
export async function getLeaveRequests(userId: string): Promise<LeaveRequest[]> {
  const response = await apiClient.get(`/leaves?userId=${userId}`);
  return response.data;
}
```

UI 코드는 동일하게 유지됩니다!

### 2. 역할 기반 접근 (Role-Based Access)
- L4 직급만 연차 승인 가능 (앱에서 이미 구현)
- API 서버에서도 동일한 검증 필요

### 3. 타임스탬프 추적
모든 테이블에 CREATED_AT, UPDATED_AT이 있어 데이터 변경 추적 가능

### 4. Soft Delete 구현
STATUS 컬럼으로 논리적 삭제 구현 (물리적 삭제 없음)

---

## 🔐 보안 체크리스트

- [ ] 패스워드는 bcrypt 또는 PBKDF2로 해싱
- [ ] JWT 토큰 사용 (AccessToken: 15분, RefreshToken: 7일)
- [ ] HTTPS 필수 (프로덕션)
- [ ] CORS 설정 (앱 도메인만 허용)
- [ ] SQL Injection 방지 (Parameterized Query)
- [ ] 로그인 시도 제한 (Rate Limiting)
- [ ] API 인증 검증 (모든 엔드포인트)
- [ ] 감사 로그 (Audit Trail)

---

## 🛠️ 개발 환경 설정

### 필요한 도구
- Node.js 16+ 
- Oracle Database (또는 Docker Oracle)
- Postman (API 테스트)
- git

### Oracle Database 설치 (Docker)
```bash
docker run -d \
  -p 1521:1521 \
  -e ORACLE_PWD=password \
  -v oracle_data:/opt/oracle/oradata \
  --name oracle \
  gvenzl/oracle-xe:latest
```

### 연결 테스트
```bash
sqlplus system/password@localhost:1521/XE
```

---

## 📚 참고 자료

### Oracle Database
- [Oracle oracledb npm package](https://github.com/oracle/node-oracledb)
- [Oracle SQL Developer](https://www.oracle.com/database/sqldeveloper/)

### Node.js & Express
- [Express.js 공식 문서](https://expressjs.com/)
- [JWT 인증 가이드](https://tools.ietf.org/html/rfc7519)

### React Native
- [Axios 라이브러리](https://axios-http.com/)
- [AsyncStorage API](https://react-native-async-storage.github.io/)

---

## ❓ FAQ

### Q: Mock 데이터는 언제 삭제하나요?
A: Phase 4 (배포) 이후에 `src/data/` 디렉토리 삭제. 그 전까지는 필요시 조건부로 사용 가능.

### Q: 기존 mock 로그인 자격증명은?
A: 모든 사용자 이메일로 로그인 가능, 패스워드는 '1234'

### Q: 배포 중 문제가 발생하면?
A: Mock 데이터를 유지했다면 Feature Flag로 빠르게 롤백 가능.

### Q: 어떻게 API 테스트하나요?
A: Postman 컬렉션 생성 후 수동 테스트, 추후 자동화 테스트 스크립트 추가.

---

## 📞 문의

마이그레이션 과정에서 문제가 발생하면 위 문서들을 참고하세요.

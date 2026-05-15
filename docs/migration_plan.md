# Mock → Oracle 마이그레이션 계획서

Last Updated: 2026-05-15

---

## 1. 개요

WorkBoard 앱을 현재의 mock 데이터 기반 구조에서 실제 Oracle DB로 전환하기 위한 계획입니다.
백엔드 API 서버(`workboard-backend/`)는 이미 구축되어 있으며, 프론트엔드 서비스 계층도 API 호출 구조로 전환 완료되었습니다.
현재 남은 작업은 **Oracle DB 연결**과 **출결 API 추가**입니다.

---

## 2. 현재 구조 (2026-05-15 기준)

```
workboard/                            # React Native App
├── app/                          # 화면 (라우팅)
├── src/
│   ├── services/                 # API 호출 + mock fallback
│   │   ├── authService.ts        # POST /api/auth/login 호출
│   │   ├── leaveService.ts       # leaves API 호출
│   │   ├── userService.ts        # users API 호출
│   │   └── attendanceService.ts  # 아직 mock 전용 (API 미연결)
│   ├── config/
│   │   └── api.ts                # API 베이스 URL, 엔드포인트 상수, fetchAPI 헬퍼
│   ├── contexts/
│   │   └── AuthContext.tsx       # 전역 로그인 상태
│   └── data/                     # mock fallback 데이터 (API 실패 시 사용)
│       ├── user.ts
│       ├── leaves.ts
│       └── attendance.ts

workboard-backend/                    # Node.js Backend ← 이미 구축됨
├── src/
│   ├── index.js                  # Express 서버
│   ├── middleware/
│   │   └── requester.js          # requesterId 검증 미들웨어
│   ├── routes/
│   │   ├── auth.js               # POST /api/auth/login
│   │   ├── users.js              # GET /api/users/*
│   │   └── leaves.js             # GET/POST/PATCH /api/leaves/*
│   └── data/                     # 메모리 mock 데이터 (Oracle 전환 대상)
│       ├── users.js              # 50명
│       ├── leaves.js             # 연차 요청
│       └── departments.js        # 부서 마스터

Oracle Database (미구축)
├── TB_USERS
├── TB_LOGIN_ACCOUNTS
├── TB_LEAVE_REQUESTS
├── TB_ATTENDANCE_RECORDS
└── (코드 테이블들)
```

---

## 3. 구현 완료 항목

### 백엔드 API 엔드포인트 (모두 mock 데이터 기반)

| 메서드 | 경로 | 설명 | 접근 제어 |
|--------|------|------|---------|
| POST | `/api/auth/login` | 로그인 | 없음 |
| GET | `/api/users?requesterId={id}` | 같은 부서 사용자 목록 | 같은 부서 |
| GET | `/api/users/:userId?requesterId={id}` | 개별 사용자 조회 | 같은 부서 |
| GET | `/api/users/department/:deptId?requesterId={id}` | 부서별 사용자 목록 | requesterId 필요 |
| GET | `/api/leaves/user/:userId?requesterId={id}` | 본인 연차 조회 | 본인만 |
| GET | `/api/leaves/month/:year/:month?requesterId={id}` | 월별 팀 연차 달력 | 같은 부서 |
| GET | `/api/leaves/pending?requesterId={id}` | 승인 대기 연차 목록 | L4 + 같은 부서 |
| POST | `/api/leaves` | 연차 신청 | 본인만 |
| PATCH | `/api/leaves/:id/status` | 연차 승인/반려 | L4 + 같은 부서 |

### 프론트엔드 서비스 계층

| 서비스 | 상태 | 비고 |
|--------|------|------|
| `authService.ts` | API 연결 완료 | `POST /api/auth/login` |
| `leaveService.ts` | API 연결 완료 | API 실패 시 mock fallback |
| `userService.ts` | API 연결 완료 | API 실패 시 에러 throw |
| `attendanceService.ts` | **mock 전용** | API 엔드포인트 미구현 |

---

## 4. 남은 작업 (Oracle 전환)

### Phase 1: Oracle DB 구축 (1주)
- [ ] Oracle DB 설치 또는 Docker 환경 구성
- [ ] `oracle_table_design.sql` 실행 (테이블/뷰/시퀀스 생성)
- [ ] Mock → Oracle 데이터 마이그레이션 스크립트 실행
- [ ] SQL 쿼리 기본 동작 확인

### Phase 2: 백엔드 Oracle 연결 (1-2주)
- [ ] `node-oracledb` 패키지 설치
- [ ] DB 연결 설정 (`src/database/connection.js`)
- [ ] 기존 routes의 mock 데이터 조회를 Oracle 쿼리로 교체
  - `routes/auth.js` → `SELECT` from TB_USERS + TB_LOGIN_ACCOUNTS
  - `routes/users.js` → `SELECT` from TB_USERS
  - `routes/leaves.js` → `SELECT/INSERT/UPDATE` from TB_LEAVE_REQUESTS
- [ ] 출결 API 추가 (`routes/attendance.js`)
  - `GET /api/attendance/:userId?requesterId={id}` — 월별 출결 조회
  - `POST /api/attendance/checkin` — 출근 처리
  - `POST /api/attendance/checkout` — 퇴근 처리

### Phase 3: 프론트엔드 출결 API 연결 (3일)
- [ ] `attendanceService.ts` API 호출로 전환
- [ ] `src/config/api.ts`에 ATTENDANCE 엔드포인트 추가
- [ ] mock fallback 유지 (API 실패 시 기존 동작)

### Phase 4: 보안 강화 (선택, 1주)
- [ ] 비밀번호 bcrypt 해싱 적용
- [ ] JWT 토큰 기반 인증으로 전환 (requesterId 파라미터 제거)
- [ ] CORS 정책 도메인 제한

---

## 5. 데이터 마이그레이션 스크립트

백엔드 mock 데이터(`C:\WorkBoardBackEnd\src\data\`) → Oracle 이관

```javascript
// workboard-backend/scripts/migrate.js (작성 필요)
const oracledb = require('oracledb');
const { mockUsers } = require('../src/data/users');
const { mockLeaveRequests } = require('../src/data/leaves');

async function migrateUsers(conn) {
  for (const u of mockUsers) {
    await conn.execute(
      `INSERT INTO TB_USERS
         (USER_ID, EMPLOYEE_NO, USER_NAME, DEPARTMENT_CODE, POSITION_CODE,
          EMAIL, TOTAL_LEAVE_DAYS, STATUS)
       VALUES (:1, :2, :3, :4, :5, :6, :7, 'A')`,
      [u.id, u.employeeNo, u.name, u.departmentId, u.position,
       u.email, u.totalLeaves]
    );
  }
  await conn.commit();
}

async function migrateLeaves(conn) {
  for (const l of mockLeaveRequests) {
    await conn.execute(
      `INSERT INTO TB_LEAVE_REQUESTS
         (LEAVE_REQUEST_ID, USER_ID, START_DATE, END_DATE,
          LEAVE_REASON, LEAVE_STATUS_CODE, CREATED_AT)
       VALUES (:1, :2, TO_DATE(:3,'YYYY-MM-DD'), TO_DATE(:4,'YYYY-MM-DD'),
               :5, :6, SYSTIMESTAMP)`,
      [l.id, l.userId, l.startDate, l.endDate,
       l.reason, l.status.toUpperCase()]
    );
  }
  await conn.commit();
}
```

---

## 6. 타입 매핑

| 프론트엔드 타입 필드 | Oracle 테이블.컬럼 | 타입 |
|---|---|---|
| `User.id` | `TB_USERS.USER_ID` | VARCHAR2(50) |
| `User.employeeNo` | `TB_USERS.EMPLOYEE_NO` | VARCHAR2(20) |
| `User.name` | `TB_USERS.USER_NAME` | VARCHAR2(100) |
| `User.departmentId` | `TB_USERS.DEPARTMENT_CODE` | VARCHAR2(10) — D001~D005 |
| `User.department` | `TB_DEPARTMENT_CODE.DEPARTMENT_NAME` | VARCHAR2(100) — 조인 |
| `User.group` | `TB_DEPARTMENT_CODE.GROUP_NAME` | VARCHAR2(100) — 조인 |
| `User.position` | `TB_USERS.POSITION_CODE` | VARCHAR2(10) |
| `User.totalLeaves` | `TB_USERS.TOTAL_LEAVE_DAYS` | NUMBER(3) |
| `LeaveRequest.id` | `TB_LEAVE_REQUESTS.LEAVE_REQUEST_ID` | VARCHAR2(50) |
| `LeaveRequest.status` | `TB_LEAVE_REQUESTS.LEAVE_STATUS_CODE` | VARCHAR2(20) — 대문자 |
| `AttendanceRecord.date` | `TB_ATTENDANCE_RECORDS.ATTENDANCE_DATE` | DATE |
| `AttendanceRecord.checkIn` | `TB_ATTENDANCE_RECORDS.CHECK_IN_TIME` | VARCHAR2(5) — HH:mm |
| `AttendanceRecord.status` | `TB_ATTENDANCE_RECORDS.ATTENDANCE_STATUS` | VARCHAR2(20) |

> `User.departmentId` ('D001' 등) 는 접근 제어 비교 기준. `User.department` ('IT팀' 등) 는 표시 전용.

---

## 7. Oracle 연결 설정 예시

```javascript
// workboard-backend/src/database/connection.js
const oracledb = require('oracledb');

const dbConfig = {
  user:          process.env.DB_USER,
  password:      process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING, // e.g. 'localhost:1521/XE'
  poolMin:       2,
  poolMax:       10,
  poolIncrement: 2,
};

let pool;

async function initPool() {
  pool = await oracledb.createPool(dbConfig);
}

async function getConnection() {
  return pool.getConnection();
}

module.exports = { initPool, getConnection };
```

```bash
# .env (workboard-backend/.env)
DB_USER=workboard
DB_PASSWORD=password
DB_CONNECT_STRING=localhost:1521/XE
PORT=3000
```

---

## 8. 보안 체크리스트

- [ ] 비밀번호 bcrypt 해싱 (saltRounds: 12)
- [ ] JWT AccessToken (15분) + RefreshToken (7일)
- [ ] HTTPS 적용 (프로덕션)
- [ ] CORS 도메인 제한 (모든 origin 허용 → 앱 도메인만)
- [ ] SQL Parameterized Query (Injection 방지)
- [ ] 로그인 시도 횟수 제한 (Rate Limiting)
- [ ] 감사 로그 (연차 승인/반려 이력)

---

## 9. 롤백 전략

현재 프론트엔드 서비스는 API 실패 시 자동으로 mock 데이터로 폴백됩니다.
Oracle 전환 후 문제 발생 시 백엔드 서버만 중단하면 앱은 mock 데이터로 계속 동작합니다.

```
API 호출 성공 → Oracle 데이터 사용
API 호출 실패 → mock 데이터 자동 사용 (try-catch fallback)
```

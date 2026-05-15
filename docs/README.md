# WorkBoard 데이터베이스 & API 마이그레이션 가이드

Last Updated: 2026-05-15

---

## 문서 목록

### 1. `oracle_table_design.sql`
Oracle DB 테이블 설계서. 아래를 포함합니다.
- 코드 테이블: 직급(L1~L4), 부서(D001~D005), 연차 상태, 근태 상태
- 마스터 테이블: TB_USERS, TB_LOGIN_ACCOUNTS
- 거래 테이블: TB_LEAVE_REQUESTS, TB_ATTENDANCE_RECORDS
- 뷰: 사용자 연차 현황, 날짜별 팀원 휴가 현황
- 시퀀스 및 샘플 데이터

실행 방법:
```bash
sqlplus system/password@localhost:1521/XE < oracle_table_design.sql
```

### 2. `migration_plan.md`
mock 데이터에서 Oracle DB로 전환하기 위한 마이그레이션 계획서.
- 현재 구현 완료 항목 정리
- 남은 작업 단계별 체크리스트
- 데이터 마이그레이션 스크립트 예시
- Oracle 연결 설정 예시
- 보안 및 롤백 전략

---

## 현재 구조

```
workboard/                        # React Native App
├── src/services/
│   ├── authService.ts       → POST /api/auth/login (API 연결 완료)
│   ├── leaveService.ts      → leaves API 호출 + mock fallback
│   ├── userService.ts       → users API 호출
│   └── attendanceService.ts → mock 전용 (API 미연결)
├── src/config/
│   └── api.ts               → API URL 상수, fetchAPI 헬퍼
├── src/data/                → API 실패 시 fallback용 mock 데이터
│   ├── user.ts
│   ├── leaves.ts
│   └── attendance.ts
└── src/contexts/
    └── AuthContext.tsx      → 전역 로그인 상태

workboard-backend/                # Node.js 백엔드 ← 구축 완료
└── src/routes/
    ├── auth.js      POST /api/auth/login
    ├── users.js     GET  /api/users/*
    └── leaves.js    GET/POST/PATCH /api/leaves/*
```

---

## 현재 구현된 API 엔드포인트

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

---

## 엔티티 & Oracle 테이블 매핑

### User
```
프론트엔드 타입                Oracle
────────────────────────────────────────────────────────
id: string              → TB_USERS.USER_ID
employeeNo: string      → TB_USERS.EMPLOYEE_NO
name: string            → TB_USERS.USER_NAME
departmentId: string    → TB_USERS.DEPARTMENT_CODE  (D001~D005, 접근제어 기준)
department: string      → TB_DEPARTMENT_CODE.DEPARTMENT_NAME  (조인)
group: string           → TB_DEPARTMENT_CODE.GROUP_NAME       (조인)
position: string        → TB_USERS.POSITION_CODE    (L1~L4)
email: string           → TB_USERS.EMAIL
totalLeaves: number     → TB_USERS.TOTAL_LEAVE_DAYS
usedLeaves: number      → VW_USER_LEAVE_SUMMARY.USED_LEAVE_DAYS  (뷰 계산)
```

### LeaveRequest
```
프론트엔드 타입                Oracle
────────────────────────────────────────────────────────
id: string              → TB_LEAVE_REQUESTS.LEAVE_REQUEST_ID
userId: string          → TB_LEAVE_REQUESTS.USER_ID
startDate: string       → TB_LEAVE_REQUESTS.START_DATE  (DATE)
endDate: string         → TB_LEAVE_REQUESTS.END_DATE    (DATE)
reason: string          → TB_LEAVE_REQUESTS.LEAVE_REASON
status: string          → TB_LEAVE_REQUESTS.LEAVE_STATUS_CODE  (대문자: PENDING/APPROVED/REJECTED)
createdAt: string       → TB_LEAVE_REQUESTS.CREATED_AT
```

### AttendanceRecord
```
프론트엔드 타입                Oracle
────────────────────────────────────────────────────────
date: string            → TB_ATTENDANCE_RECORDS.ATTENDANCE_DATE
checkIn?: string        → TB_ATTENDANCE_RECORDS.CHECK_IN_TIME   (HH:mm)
checkOut?: string       → TB_ATTENDANCE_RECORDS.CHECK_OUT_TIME  (HH:mm)
status: string          → TB_ATTENDANCE_RECORDS.ATTENDANCE_STATUS
                           PRESENT / WORKING / ABSENT / LEAVE / HOLIDAY
                           (WORKING은 CHECK_IN 있고 CHECK_OUT 없는 당일 레코드)
```

---

## 조직 구조

```
경영지원그룹
└── IT팀 (D001, ID 1~10)
    └── L4 승인권자: 김봉균 (goodman@workboard.com)

카지노오퍼레이션그룹
├── 테이블게임팀 (D002, ID 11~20)
│   └── L4 승인권자: 정민하 (minha.j@workboard.com)
├── 전자게임팀 (D003, ID 21~30)
│   └── L4 승인권자: 임채원 (chaewon.lim@workboard.com)
├── 오퍼레이션지원팀 (D004, ID 31~40)
│   └── L4 승인권자: 고미래 (mirae.ko@workboard.com)
└── 카지노CS팀 (D005, ID 41~50)
    └── L4 승인권자: 탁현준 (hyunjun.tak@workboard.com)
```

Mock 계정 비밀번호: 모두 `1234`

---

## 남은 마이그레이션 단계

- [x] Express 백엔드 API 서버 구축
- [x] 프론트엔드 서비스 계층 API 호출 전환 (auth, leave, user)
- [ ] Oracle DB 설치 및 테이블 생성
- [ ] Mock → Oracle 데이터 마이그레이션
- [ ] 백엔드 Oracle 연결 (node-oracledb)
- [ ] 출결 API 구현 및 프론트 연결
- [ ] JWT 인증 도입 (선택)

---

## 개발 환경

```bash
# 백엔드 실행
cd workboard-backend
npm run dev          # nodemon (파일 변경 자동 재시작)

# 프론트엔드 실행
cd workboard
npm start            # Expo 개발 서버

# 헬스 체크
curl http://localhost:3000/health
```

Android 에뮬레이터에서 API 접근 시 `localhost` 대신 `10.0.2.2` 사용 (api.ts에서 자동 처리).

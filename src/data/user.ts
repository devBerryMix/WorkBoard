import { User } from '@/src/types';

export const mockUsers: User[] = [
  // 경영지원그룹 - IT팀 (D001)
  { id: '1',  employeeNo: '2020001', name: '이정호', group: '경영지원그룹',         departmentId: 'D001', department: 'IT팀',             position: 'L2', email: 'jeongho.l@workboard.com',       totalLeaves: 15, usedLeaves: 3  },
  { id: '2',  employeeNo: '2021002', name: '김민준', group: '경영지원그룹',         departmentId: 'D001', department: 'IT팀',             position: 'L2', email: 'minjun.kim@workboard.com',      totalLeaves: 15, usedLeaves: 5  },
  { id: '3',  employeeNo: '2023003', name: '이서준', group: '경영지원그룹',         departmentId: 'D001', department: 'IT팀',             position: 'L1', email: 'seojun.lee@workboard.com',      totalLeaves: 15, usedLeaves: 2  },
  { id: '4',  employeeNo: '2022004', name: '박지훈', group: '경영지원그룹',         departmentId: 'D001', department: 'IT팀',             position: 'L2', email: 'jihun.park@workboard.com',      totalLeaves: 15, usedLeaves: 7  },
  { id: '5',  employeeNo: '2024005', name: '최도윤', group: '경영지원그룹',         departmentId: 'D001', department: 'IT팀',             position: 'L1', email: 'doyun.choi@workboard.com',      totalLeaves: 15, usedLeaves: 4  },
  { id: '6',  employeeNo: '2018006', name: '김봉균', group: '경영지원그룹',         departmentId: 'D001', department: 'IT팀',             position: 'L4', email: 'goodman@workboard.com',         totalLeaves: 16, usedLeaves: 6  },
  { id: '7',  employeeNo: '2019007', name: '강민서', group: '경영지원그룹',         departmentId: 'D001', department: 'IT팀',             position: 'L3', email: 'minseo.kang@workboard.com',     totalLeaves: 15, usedLeaves: 1  },
  { id: '8',  employeeNo: '2021008', name: '윤서연', group: '경영지원그룹',         departmentId: 'D001', department: 'IT팀',             position: 'L2', email: 'seoyeon.yoon@workboard.com',    totalLeaves: 15, usedLeaves: 8  },
  { id: '9',  employeeNo: '2023009', name: '장예준', group: '경영지원그룹',         departmentId: 'D001', department: 'IT팀',             position: 'L1', email: 'yejun.jang@workboard.com',      totalLeaves: 17, usedLeaves: 5  },
  { id: '10', employeeNo: '2024010', name: '한지우', group: '경영지원그룹',         departmentId: 'D001', department: 'IT팀',             position: 'L1', email: 'jiwoo.han@workboard.com',       totalLeaves: 15, usedLeaves: 0  },

  // 카지노오퍼레이션그룹 - 테이블게임팀 (D002)
  { id: '11', employeeNo: '2020011', name: '김태양', group: '카지노오퍼레이션그룹', departmentId: 'D002', department: '테이블게임팀',     position: 'L3', email: 'tayang.kim@workboard.com',      totalLeaves: 15, usedLeaves: 4  },
  { id: '12', employeeNo: '2022012', name: '박소미', group: '카지노오퍼레이션그룹', departmentId: 'D002', department: '테이블게임팀',     position: 'L2', email: 'somi.park@workboard.com',       totalLeaves: 15, usedLeaves: 2  },
  { id: '13', employeeNo: '2021013', name: '이현우', group: '카지노오퍼레이션그룹', departmentId: 'D002', department: '테이블게임팀',     position: 'L2', email: 'hyunwoo.lee@workboard.com',     totalLeaves: 15, usedLeaves: 6  },
  { id: '14', employeeNo: '2024014', name: '최지원', group: '카지노오퍼레이션그룹', departmentId: 'D002', department: '테이블게임팀',     position: 'L1', email: 'jiwon.choi@workboard.com',      totalLeaves: 15, usedLeaves: 1  },
  { id: '15', employeeNo: '2017015', name: '정민하', group: '카지노오퍼레이션그룹', departmentId: 'D002', department: '테이블게임팀',     position: 'L4', email: 'minha.j@workboard.com',         totalLeaves: 16, usedLeaves: 8  },
  { id: '16', employeeNo: '2022016', name: '한수진', group: '카지노오퍼레이션그룹', departmentId: 'D002', department: '테이블게임팀',     position: 'L2', email: 'sujin.han@workboard.com',       totalLeaves: 15, usedLeaves: 3  },
  { id: '17', employeeNo: '2025017', name: '오준혁', group: '카지노오퍼레이션그룹', departmentId: 'D002', department: '테이블게임팀',     position: 'L1', email: 'junhyuk.oh@workboard.com',      totalLeaves: 15, usedLeaves: 0  },
  { id: '18', employeeNo: '2023018', name: '신예린', group: '카지노오퍼레이션그룹', departmentId: 'D002', department: '테이블게임팀',     position: 'L2', email: 'yerrin.shin@workboard.com',     totalLeaves: 15, usedLeaves: 5  },
  { id: '19', employeeNo: '2019019', name: '류성민', group: '카지노오퍼레이션그룹', departmentId: 'D002', department: '테이블게임팀',     position: 'L3', email: 'sungmin.ryu@workboard.com',     totalLeaves: 15, usedLeaves: 7  },
  { id: '20', employeeNo: '2024020', name: '윤재원', group: '카지노오퍼레이션그룹', departmentId: 'D002', department: '테이블게임팀',     position: 'L1', email: 'jaewon.yoon@workboard.com',     totalLeaves: 15, usedLeaves: 2  },

  // 카지노오퍼레이션그룹 - 전자게임팀 (D003)
  { id: '21', employeeNo: '2018021', name: '임채원', group: '카지노오퍼레이션그룹', departmentId: 'D003', department: '전자게임팀',       position: 'L4', email: 'chaewon.lim@workboard.com',     totalLeaves: 16, usedLeaves: 9  },
  { id: '22', employeeNo: '2022022', name: '홍지민', group: '카지노오퍼레이션그룹', departmentId: 'D003', department: '전자게임팀',       position: 'L2', email: 'jimin.hong@workboard.com',      totalLeaves: 15, usedLeaves: 4  },
  { id: '23', employeeNo: '2020023', name: '남궁민', group: '카지노오퍼레이션그룹', departmentId: 'D003', department: '전자게임팀',       position: 'L3', email: 'min.namgung@workboard.com',     totalLeaves: 15, usedLeaves: 6  },
  { id: '24', employeeNo: '2025024', name: '배수현', group: '카지노오퍼레이션그룹', departmentId: 'D003', department: '전자게임팀',       position: 'L1', email: 'suhyun.bae@workboard.com',      totalLeaves: 15, usedLeaves: 0  },
  { id: '25', employeeNo: '2021025', name: '서동현', group: '카지노오퍼레이션그룹', departmentId: 'D003', department: '전자게임팀',       position: 'L2', email: 'donghyun.seo@workboard.com',    totalLeaves: 15, usedLeaves: 3  },
  { id: '26', employeeNo: '2022026', name: '권나은', group: '카지노오퍼레이션그룹', departmentId: 'D003', department: '전자게임팀',       position: 'L2', email: 'naeun.kwon@workboard.com',      totalLeaves: 15, usedLeaves: 5  },
  { id: '27', employeeNo: '2024027', name: '문준서', group: '카지노오퍼레이션그룹', departmentId: 'D003', department: '전자게임팀',       position: 'L1', email: 'junseo.moon@workboard.com',     totalLeaves: 15, usedLeaves: 1  },
  { id: '28', employeeNo: '2019028', name: '노은지', group: '카지노오퍼레이션그룹', departmentId: 'D003', department: '전자게임팀',       position: 'L3', email: 'eunji.noh@workboard.com',       totalLeaves: 15, usedLeaves: 7  },
  { id: '29', employeeNo: '2021029', name: '심재훈', group: '카지노오퍼레이션그룹', departmentId: 'D003', department: '전자게임팀',       position: 'L2', email: 'jaehun.shim@workboard.com',     totalLeaves: 15, usedLeaves: 4  },
  { id: '30', employeeNo: '2025030', name: '지수아', group: '카지노오퍼레이션그룹', departmentId: 'D003', department: '전자게임팀',       position: 'L1', email: 'sua.ji@workboard.com',           totalLeaves: 15, usedLeaves: 0  },

  // 카지노오퍼레이션그룹 - 오퍼레이션지원팀 (D004)
  { id: '31', employeeNo: '2017031', name: '고미래', group: '카지노오퍼레이션그룹', departmentId: 'D004', department: '오퍼레이션지원팀', position: 'L4', email: 'mirae.ko@workboard.com',         totalLeaves: 16, usedLeaves: 10 },
  { id: '32', employeeNo: '2020032', name: '안서현', group: '카지노오퍼레이션그룹', departmentId: 'D004', department: '오퍼레이션지원팀', position: 'L3', email: 'seohyun.an@workboard.com',       totalLeaves: 15, usedLeaves: 5  },
  { id: '33', employeeNo: '2022033', name: '황진우', group: '카지노오퍼레이션그룹', departmentId: 'D004', department: '오퍼레이션지원팀', position: 'L2', email: 'jinwoo.hwang@workboard.com',     totalLeaves: 15, usedLeaves: 3  },
  { id: '34', employeeNo: '2025034', name: '유하린', group: '카지노오퍼레이션그룹', departmentId: 'D004', department: '오퍼레이션지원팀', position: 'L1', email: 'harin.yoo@workboard.com',         totalLeaves: 15, usedLeaves: 0  },
  { id: '35', employeeNo: '2021035', name: '전도현', group: '카지노오퍼레이션그룹', departmentId: 'D004', department: '오퍼레이션지원팀', position: 'L2', email: 'dohyun.jeon@workboard.com',      totalLeaves: 15, usedLeaves: 6  },
  { id: '36', employeeNo: '2022036', name: '조은혜', group: '카지노오퍼레이션그룹', departmentId: 'D004', department: '오퍼레이션지원팀', position: 'L2', email: 'eunhye.cho@workboard.com',       totalLeaves: 15, usedLeaves: 4  },
  { id: '37', employeeNo: '2024037', name: '도지호', group: '카지노오퍼레이션그룹', departmentId: 'D004', department: '오퍼레이션지원팀', position: 'L1', email: 'jiho.do@workboard.com',           totalLeaves: 15, usedLeaves: 1  },
  { id: '38', employeeNo: '2019038', name: '위성진', group: '카지노오퍼레이션그룹', departmentId: 'D004', department: '오퍼레이션지원팀', position: 'L3', email: 'sungjin.wi@workboard.com',       totalLeaves: 15, usedLeaves: 8  },
  { id: '39', employeeNo: '2022039', name: '변수아', group: '카지노오퍼레이션그룹', departmentId: 'D004', department: '오퍼레이션지원팀', position: 'L2', email: 'sua.byun@workboard.com',         totalLeaves: 15, usedLeaves: 2  },
  { id: '40', employeeNo: '2025040', name: '석민재', group: '카지노오퍼레이션그룹', departmentId: 'D004', department: '오퍼레이션지원팀', position: 'L1', email: 'minjae.seok@workboard.com',      totalLeaves: 15, usedLeaves: 0  },

  // 카지노오퍼레이션그룹 - 카지노CS팀 (D005)
  { id: '41', employeeNo: '2018041', name: '탁현준', group: '카지노오퍼레이션그룹', departmentId: 'D005', department: '카지노CS팀',       position: 'L4', email: 'hyunjun.tak@workboard.com',     totalLeaves: 16, usedLeaves: 7  },
  { id: '42', employeeNo: '2022042', name: '표지혜', group: '카지노오퍼레이션그룹', departmentId: 'D005', department: '카지노CS팀',       position: 'L2', email: 'jihye.pyo@workboard.com',       totalLeaves: 15, usedLeaves: 3  },
  { id: '43', employeeNo: '2020043', name: '연지유', group: '카지노오퍼레이션그룹', departmentId: 'D005', department: '카지노CS팀',       position: 'L3', email: 'jiyu.yeon@workboard.com',       totalLeaves: 15, usedLeaves: 5  },
  { id: '44', employeeNo: '2024044', name: '봉수현', group: '카지노오퍼레이션그룹', departmentId: 'D005', department: '카지노CS팀',       position: 'L1', email: 'suhyun.bong@workboard.com',     totalLeaves: 15, usedLeaves: 0  },
  { id: '45', employeeNo: '2021045', name: '맹도희', group: '카지노오퍼레이션그룹', departmentId: 'D005', department: '카지노CS팀',       position: 'L2', email: 'dohee.maeng@workboard.com',     totalLeaves: 15, usedLeaves: 4  },
  { id: '46', employeeNo: '2023046', name: '편준영', group: '카지노오퍼레이션그룹', departmentId: 'D005', department: '카지노CS팀',       position: 'L2', email: 'junyoung.pyeon@workboard.com',  totalLeaves: 15, usedLeaves: 6  },
  { id: '47', employeeNo: '2025047', name: '하민규', group: '카지노오퍼레이션그룹', departmentId: 'D005', department: '카지노CS팀',       position: 'L1', email: 'mingyu.ha@workboard.com',       totalLeaves: 15, usedLeaves: 1  },
  { id: '48', employeeNo: '2019048', name: '국수진', group: '카지노오퍼레이션그룹', departmentId: 'D005', department: '카지노CS팀',       position: 'L3', email: 'sujin.kook@workboard.com',      totalLeaves: 15, usedLeaves: 9  },
  { id: '49', employeeNo: '2022049', name: '어재민', group: '카지노오퍼레이션그룹', departmentId: 'D005', department: '카지노CS팀',       position: 'L2', email: 'jaemin.eo@workboard.com',       totalLeaves: 15, usedLeaves: 2  },
  { id: '50', employeeNo: '2025050', name: '소윤지', group: '카지노오퍼레이션그룹', departmentId: 'D005', department: '카지노CS팀',       position: 'L1', email: 'yunji.so@workboard.com',         totalLeaves: 15, usedLeaves: 0  },
];

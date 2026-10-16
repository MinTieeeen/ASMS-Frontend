/**
 * @file Seed data of the concept: five groups seen by the signed-in student, with dates relative to today so that
 *   overdue and due-soon flags always make sense.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { ROUTES } from '@/config/routes'

import type {
  Activity,
  AppNotification,
  Charter,
  ChecklistItem,
  Deliverable,
  EmailInvite,
  Group,
  JoinRequest,
  Label,
  MeetingNote,
  Member,
  Milestone,
  MockUser,
  Phase,
  Poll,
  ProgressUpdate,
  Resource,
  RetroItem,
  ReviewDraft,
  ReviewRound,
  Task,
  TaskComment,
  TaskEvent,
  TaskPriority,
  TaskStatus,
} from './types'

/** The signed-in student in every mock group */
export const ME_ID = 'u-me'

const DAY_MS = 86_400_000

/** ISO instant `days` from now at the given local hour (BR13: a date-only deadline means 23:59) */
export function daysFromNow(days: number, hour = 23, minute = 59): string {
  const date = new Date(Date.now() + days * DAY_MS)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

/** ISO instant `hours` before now */
export function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3_600_000).toISOString()
}

const USERS: MockUser[] = [
  {
    id: ME_ID,
    fullName: 'Minh Tiến',
    userCode: '22520001',
    email: 'minhtien@student.edu.vn',
    skills: ['React', 'Java'],
  },
  {
    id: 'u2',
    fullName: 'Trần Thị Mai',
    userCode: '22520102',
    email: 'mai.tt@student.edu.vn',
    skills: ['UI/UX', 'Figma'],
  },
  {
    id: 'u3',
    fullName: 'Lê Hoàng Nam',
    userCode: '22520215',
    email: 'nam.lh@student.edu.vn',
    skills: ['Spring Boot', 'PostgreSQL'],
  },
  {
    id: 'u4',
    fullName: 'Phạm Gia Huy',
    userCode: '22520333',
    email: 'huy.pg@student.edu.vn',
    skills: ['Testing', 'Python'],
  },
  {
    id: 'u5',
    fullName: 'Võ Ngọc Anh',
    userCode: '22520418',
    email: 'anh.vn@student.edu.vn',
    skills: ['Báo cáo', 'Thuyết trình'],
  },
  {
    id: 'u6',
    fullName: 'Bùi Thanh Tâm',
    userCode: '22520521',
    email: 'tam.bt@student.edu.vn',
    skills: ['Flutter'],
  },
  {
    id: 'u7',
    fullName: 'Hồ Khánh Linh',
    userCode: '22520634',
    email: 'linh.hk@student.edu.vn',
    skills: ['Data'],
  },
  {
    id: 'u8',
    fullName: 'Đỗ Quang Vinh',
    userCode: '22520747',
    email: 'vinh.dq@student.edu.vn',
    skills: ['DevOps'],
  },
  {
    id: 'u9',
    fullName: 'Ngô Bảo Châu',
    userCode: '22520850',
    email: 'chau.nb@student.edu.vn',
    skills: ['R', 'Tableau'],
  },
  {
    id: 'u10',
    fullName: 'Lý Thu Trang',
    userCode: '22520963',
    email: 'trang.lt@student.edu.vn',
    skills: ['Kinh tế lượng'],
  },
]

const SEMESTER_NOW = 'HK1 2026–2027'
const SEMESTER_PAST = 'HK2 2025–2026'

function group(partial: Partial<Group> & Pick<Group, 'id' | 'name' | 'joinCode'>): Group {
  return {
    topic: '',
    description: '',
    subjectCode: null,
    subjectName: null,
    semester: null,
    isSemesterEnded: false,
    lecturerName: null,
    maxMembers: 5,
    inviteExpiresAt: null,
    requireApproval: true,
    reviewEnabled: true,
    requireResultOnReview: false,
    status: 'active',
    createdAt: daysFromNow(-45, 9, 0),
    lastActivityAt: hoursAgo(2),
    githubRepo: null,
    ...partial,
  }
}

const GROUPS: Group[] = [
  group({
    id: 'g1',
    name: 'Nhóm 3 – Phòng trọ thông minh',
    topic: 'Ứng dụng quản lý phòng trọ cho chủ nhà và người thuê',
    description:
      'Web app giúp chủ nhà quản lý phòng, hợp đồng, hóa đơn điện nước; người thuê báo sự cố và thanh toán trực tuyến.',
    subjectCode: 'SE104',
    subjectName: 'Nhập môn Công nghệ phần mềm',
    semester: SEMESTER_NOW,
    lecturerName: 'ThS. Nguyễn Văn Hải',
    maxMembers: 6,
    joinCode: 'K7Q2MX',
    inviteExpiresAt: daysFromNow(7),
    requireResultOnReview: true,
    githubRepo: 'se104-nhom3/smart-rental',
    lastActivityAt: hoursAgo(1),
  }),
  group({
    id: 'g2',
    name: 'DataViz Squad',
    topic: 'Dashboard chất lượng không khí TP.HCM',
    subjectCode: 'DS201',
    subjectName: 'Trực quan hóa dữ liệu',
    semester: SEMESTER_NOW,
    lecturerName: 'TS. Trần Minh Quân',
    maxMembers: 4,
    joinCode: 'D4TV1Z',
    requireApproval: false,
    lastActivityAt: hoursAgo(20),
  }),
  group({
    id: 'g3',
    name: 'Kinh tế vĩ mô – Nhóm 7',
    topic: 'Tác động của lãi suất đến lạm phát Việt Nam 2020–2025',
    subjectCode: 'ECO102',
    subjectName: 'Kinh tế vĩ mô',
    semester: SEMESTER_NOW,
    lecturerName: 'TS. Phạm Thu Hà',
    joinCode: 'EC7M02',
    reviewEnabled: false,
    lastActivityAt: hoursAgo(50),
  }),
  group({
    id: 'g4',
    name: 'Hackathon UIT 2026',
    topic: 'Ứng dụng chia sẻ đồ dùng trong ký túc xá',
    joinCode: 'HK26UT',
    maxMembers: 4,
    lastActivityAt: hoursAgo(120),
  }),
  group({
    id: 'g5',
    name: 'Mạng máy tính – Lab nhóm 2',
    topic: 'Mô phỏng mạng doanh nghiệp bằng Packet Tracer',
    subjectCode: 'NT106',
    subjectName: 'Mạng máy tính',
    semester: SEMESTER_PAST,
    isSemesterEnded: true,
    lecturerName: 'ThS. Lê Quốc Bảo',
    joinCode: 'NT1062',
    status: 'archived',
    createdAt: daysFromNow(-230, 9, 0),
    lastActivityAt: daysFromNow(-110, 18, 0),
  }),
]

let memberSeq = 0
function member(groupId: string, userId: string, role: Member['role'], joinedDays = -44): Member {
  memberSeq += 1
  return {
    id: `m${memberSeq}`,
    groupId,
    userId,
    role,
    status: 'active',
    joinedAt: daysFromNow(joinedDays, 10, 0),
    leftAt: null,
  }
}

const MEMBERS: Member[] = [
  member('g1', ME_ID, 'leader', -45),
  member('g1', 'u2', 'deputy'),
  member('g1', 'u3', 'member'),
  member('g1', 'u4', 'member', -40),
  member('g1', 'u5', 'member', -38),
  { ...member('g1', 'u8', 'member', -44), status: 'left', leftAt: daysFromNow(-9, 15, 0) },
  member('g2', 'u9', 'leader'),
  member('g2', ME_ID, 'deputy'),
  member('g2', 'u7', 'member'),
  member('g3', 'u10', 'leader'),
  member('g3', ME_ID, 'member'),
  member('g3', 'u5', 'member'),
  member('g3', 'u6', 'deputy'),
  member('g4', 'u6', 'leader'),
  member('g4', ME_ID, 'member'),
  member('g4', 'u3', 'member'),
  member('g5', ME_ID, 'leader', -230),
  member('g5', 'u4', 'member', -230),
  member('g5', 'u8', 'member', -229),
]

const LABELS: Label[] = [
  { id: 'l1', groupId: 'g1', name: 'Frontend', tone: 'chart3' },
  { id: 'l2', groupId: 'g1', name: 'Backend', tone: 'chart1' },
  { id: 'l3', groupId: 'g1', name: 'Tài liệu', tone: 'chart2' },
  { id: 'l4', groupId: 'g1', name: 'Thiết kế', tone: 'chart4' },
  { id: 'l5', groupId: 'g1', name: 'Bug', tone: 'chart5' },
  { id: 'l6', groupId: 'g2', name: 'Dữ liệu', tone: 'chart1' },
  { id: 'l7', groupId: 'g2', name: 'Biểu đồ', tone: 'chart3' },
]

function phase(
  partial: Omit<Phase, 'closedAt' | 'snapshot' | 'milestoneId'> & Partial<Phase>,
): Phase {
  return { closedAt: null, snapshot: null, milestoneId: null, ...partial }
}

const PHASES: Phase[] = [
  phase({
    id: 'g1-p1',
    groupId: 'g1',
    name: 'Phân tích yêu cầu',
    position: 1,
    status: 'closed',
    goal: 'Thu thập yêu cầu từ 3 chủ trọ, hoàn thiện đặc tả SRS và use case.',
    startDate: daysFromNow(-42),
    endDate: daysFromNow(-21),
    closedAt: daysFromNow(-20, 20, 0),
    milestoneId: 'g1-m1',
    snapshot: { done: 6, unfinished: 1, overdue: 1 },
  }),
  phase({
    id: 'g1-p2',
    groupId: 'g1',
    name: 'Thiết kế',
    position: 2,
    status: 'active',
    goal: 'Thiết kế CSDL, kiến trúc, giao diện Figma cho 12 màn hình chính.',
    startDate: daysFromNow(-20),
    endDate: daysFromNow(3),
    milestoneId: 'g1-m2',
  }),
  phase({
    id: 'g1-p3',
    groupId: 'g1',
    name: 'Lập trình',
    position: 3,
    status: 'upcoming',
    goal: 'Hoàn thành chức năng quản lý phòng, hợp đồng, hóa đơn; demo giữa kỳ.',
    startDate: daysFromNow(4),
    endDate: daysFromNow(40),
    milestoneId: 'g1-m3',
  }),
  phase({
    id: 'g1-p4',
    groupId: 'g1',
    name: 'Kiểm thử',
    position: 4,
    status: 'upcoming',
    goal: 'Viết test case, kiểm thử tích hợp, sửa lỗi.',
    startDate: daysFromNow(36),
    endDate: daysFromNow(55),
  }),
  phase({
    id: 'g1-p5',
    groupId: 'g1',
    name: 'Báo cáo',
    position: 5,
    status: 'upcoming',
    goal: 'Hoàn thiện báo cáo cuối kỳ và slide thuyết trình.',
    startDate: daysFromNow(56),
    endDate: daysFromNow(70),
    milestoneId: 'g1-m4',
  }),
  phase({
    id: 'g2-p1',
    groupId: 'g2',
    name: 'Thu thập dữ liệu',
    position: 1,
    status: 'closed',
    goal: 'Crawl dữ liệu AQI 2020–2026.',
    startDate: daysFromNow(-35),
    endDate: daysFromNow(-15),
    closedAt: daysFromNow(-14),
    snapshot: { done: 4, unfinished: 0, overdue: 0 },
  }),
  phase({
    id: 'g2-p2',
    groupId: 'g2',
    name: 'Phân tích & trực quan',
    position: 2,
    status: 'active',
    goal: 'Dựng 6 biểu đồ chính.',
    startDate: daysFromNow(-14),
    endDate: daysFromNow(10),
  }),
  phase({
    id: 'g3-p1',
    groupId: 'g3',
    name: 'Tìm tài liệu',
    position: 1,
    status: 'active',
    goal: 'Tổng hợp 15 nguồn tham khảo.',
    startDate: daysFromNow(-10),
    endDate: daysFromNow(5),
  }),
  phase({
    id: 'g3-p2',
    groupId: 'g3',
    name: 'Viết',
    position: 2,
    status: 'upcoming',
    goal: 'Viết bản thảo 20 trang.',
    startDate: daysFromNow(6),
    endDate: daysFromNow(25),
  }),
  phase({
    id: 'g4-p1',
    groupId: 'g4',
    name: 'Ý tưởng & prototype',
    position: 1,
    status: 'active',
    goal: 'Prototype trên Figma trước vòng sơ loại.',
    startDate: daysFromNow(-5),
    endDate: daysFromNow(9),
  }),
  phase({
    id: 'g5-p1',
    groupId: 'g5',
    name: 'Lab 1–4',
    position: 1,
    status: 'closed',
    goal: 'Hoàn thành 4 bài lab.',
    startDate: daysFromNow(-220),
    endDate: daysFromNow(-130),
    closedAt: daysFromNow(-128),
    snapshot: { done: 8, unfinished: 0, overdue: 1 },
  }),
]

let taskSeq = 0
const codeByGroup: Record<string, number> = {}
interface TaskInput {
  groupId: string
  phaseId: string | null
  title: string
  status: TaskStatus
  priority?: TaskPriority
  assigneeId?: string | null
  due?: number | null
  estimate?: number | null
  labels?: string[]
  parent?: string
  checklist?: [string, boolean][]
  supporters?: string[]
  description?: string
  createdBy?: string
  blockedBy?: string[]
}

function task(input: TaskInput): Task {
  taskSeq += 1
  codeByGroup[input.groupId] = (codeByGroup[input.groupId] ?? 0) + 1
  const isDone = input.status === 'done'
  return {
    id: `t${taskSeq}`,
    groupId: input.groupId,
    phaseId: input.phaseId,
    parentTaskId: input.parent ?? null,
    code: codeByGroup[input.groupId] ?? taskSeq,
    title: input.title,
    description: input.description ?? '',
    status: input.status,
    priority: input.priority ?? 'medium',
    assigneeId: input.assigneeId === undefined ? ME_ID : input.assigneeId,
    supporterIds: input.supporters ?? [],
    dueAt: input.due === null || input.due === undefined ? null : daysFromNow(input.due),
    estimateHours: input.estimate ?? null,
    labelIds: input.labels ?? [],
    checklist: (input.checklist ?? []).map(([text, isDone], index): ChecklistItem => ({
      id: `c${taskSeq}-${index}`,
      text,
      isDone,
    })),
    attachments: [],
    blockedBy: input.blockedBy ?? [],
    createdBy: input.createdBy ?? ME_ID,
    createdAt: daysFromNow(-25, 9, 30),
    completedAt: isDone ? daysFromNow((input.due ?? 0) - 1, 17, 0) : null,
    position: taskSeq,
  }
}

const TASKS: Task[] = [
  // g1 · phase 1 (closed)
  task({
    groupId: 'g1',
    phaseId: 'g1-p1',
    title: 'Phỏng vấn 3 chủ trọ khu Linh Trung',
    status: 'done',
    assigneeId: 'u2',
    due: -35,
    estimate: 6,
    labels: ['l3'],
  }),
  task({
    groupId: 'g1',
    phaseId: 'g1-p1',
    title: 'Viết đặc tả use case',
    status: 'done',
    assigneeId: ME_ID,
    due: -25,
    estimate: 10,
    labels: ['l3'],
  }),
  task({
    groupId: 'g1',
    phaseId: 'g1-p1',
    title: 'Vẽ sơ đồ BPMN quy trình thuê phòng',
    status: 'done',
    assigneeId: 'u3',
    due: -24,
    estimate: 4,
    labels: ['l3'],
  }),
  task({
    groupId: 'g1',
    phaseId: 'g1-p1',
    title: 'Tổng hợp SRS bản nộp',
    status: 'done',
    assigneeId: 'u5',
    due: -21,
    estimate: 5,
    labels: ['l3'],
  }),
  // g1 · phase 2 (active)
  task({
    groupId: 'g1',
    phaseId: 'g1-p2',
    title: 'Thiết kế lược đồ CSDL',
    status: 'in_review',
    priority: 'high',
    assigneeId: 'u3',
    due: 1,
    estimate: 8,
    labels: ['l2', 'l4'],
    description:
      'ERD cho phòng, hợp đồng, hóa đơn, sự cố. Chuẩn hóa 3NF, kèm giải thích khóa ngoại.',
    checklist: [
      ['Danh sách thực thể', true],
      ['Quan hệ và khóa', true],
      ['Ràng buộc nghiệp vụ', false],
    ],
    supporters: [ME_ID],
  }),
  task({
    groupId: 'g1',
    phaseId: 'g1-p2',
    title: 'Wireframe 12 màn hình chính',
    status: 'done',
    priority: 'high',
    assigneeId: 'u2',
    due: -3,
    estimate: 12,
    labels: ['l1', 'l4'],
  }),
  task({
    groupId: 'g1',
    phaseId: 'g1-p2',
    title: 'Thiết kế kiến trúc hệ thống',
    status: 'in_progress',
    priority: 'urgent',
    assigneeId: ME_ID,
    due: 0,
    estimate: 6,
    labels: ['l2', 'l3'],
    description: 'Sơ đồ C4 mức Container và Component; chọn công nghệ cho thanh toán trực tuyến.',
    checklist: [
      ['Sơ đồ Context', true],
      ['Sơ đồ Container', true],
      ['Sơ đồ Component', false],
      ['Giải thích lựa chọn công nghệ', false],
    ],
  }),
  task({
    groupId: 'g1',
    phaseId: 'g1-p2',
    title: 'Prototype Figma luồng thanh toán',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'u2',
    due: 2,
    estimate: 8,
    labels: ['l1', 'l4'],
  }),
  task({
    groupId: 'g1',
    phaseId: 'g1-p2',
    title: 'Đặc tả API cho module hóa đơn',
    status: 'todo',
    priority: 'medium',
    assigneeId: 'u4',
    due: -2,
    estimate: 5,
    labels: ['l2', 'l3'],
  }),
  task({
    groupId: 'g1',
    phaseId: 'g1-p2',
    title: 'Viết tài liệu thiết kế (SDD) bản nộp',
    status: 'todo',
    priority: 'urgent',
    assigneeId: 'u5',
    due: 3,
    estimate: 8,
    labels: ['l3'],
    blockedBy: ['t5', 't7'],
  }),
  task({
    groupId: 'g1',
    phaseId: 'g1-p2',
    title: 'Chọn bảng màu & typography',
    status: 'cancelled',
    priority: 'low',
    assigneeId: 'u2',
    due: -6,
    labels: ['l4'],
  }),
  task({
    groupId: 'g1',
    phaseId: 'g1-p2',
    title: 'Rà soát ERD với yêu cầu báo cáo doanh thu',
    status: 'todo',
    priority: 'medium',
    assigneeId: null,
    due: 2,
    estimate: 2,
    labels: ['l2'],
    createdBy: 'u4',
  }),
  // g1 · phase 3 (upcoming)
  task({
    groupId: 'g1',
    phaseId: 'g1-p3',
    title: 'Khởi tạo dự án Spring Boot + CI',
    status: 'todo',
    priority: 'high',
    assigneeId: 'u3',
    due: 7,
    estimate: 4,
    labels: ['l2'],
  }),
  task({
    groupId: 'g1',
    phaseId: 'g1-p3',
    title: 'Màn hình danh sách phòng',
    status: 'todo',
    priority: 'medium',
    assigneeId: ME_ID,
    due: 12,
    estimate: 8,
    labels: ['l1'],
  }),
  task({
    groupId: 'g1',
    phaseId: 'g1-p3',
    title: 'API quản lý hợp đồng',
    status: 'todo',
    priority: 'medium',
    assigneeId: 'u4',
    due: 15,
    estimate: 10,
    labels: ['l2'],
  }),
  task({
    groupId: 'g1',
    phaseId: 'g1-p3',
    title: 'Tích hợp cổng thanh toán (sandbox)',
    status: 'todo',
    priority: 'high',
    assigneeId: null,
    due: 25,
    estimate: 12,
    labels: ['l2'],
  }),
  task({
    groupId: 'g1',
    phaseId: null,
    title: 'Đặt phòng họp nhóm cho buổi demo',
    status: 'todo',
    priority: 'low',
    assigneeId: 'u5',
    due: 26,
    labels: [],
  }),
  // g1 · sub-tasks of "Thiết kế kiến trúc hệ thống" (t7)
  task({
    groupId: 'g1',
    phaseId: 'g1-p2',
    title: 'So sánh VNPay và MoMo sandbox',
    status: 'done',
    assigneeId: ME_ID,
    due: -1,
    estimate: 2,
    parent: 't7',
  }),
  task({
    groupId: 'g1',
    phaseId: 'g1-p2',
    title: 'Vẽ sơ đồ Component',
    status: 'in_progress',
    assigneeId: ME_ID,
    due: 0,
    estimate: 2,
    parent: 't7',
  }),
  // g2
  task({
    groupId: 'g2',
    phaseId: 'g2-p1',
    title: 'Crawl dữ liệu AQI từ API mở',
    status: 'done',
    assigneeId: 'u7',
    due: -20,
    estimate: 6,
    labels: ['l6'],
  }),
  task({
    groupId: 'g2',
    phaseId: 'g2-p2',
    title: 'Biểu đồ nhiệt AQI theo quận',
    status: 'in_progress',
    priority: 'high',
    assigneeId: ME_ID,
    due: 1,
    estimate: 5,
    labels: ['l7'],
    createdBy: 'u9',
  }),
  task({
    groupId: 'g2',
    phaseId: 'g2-p2',
    title: 'Làm sạch dữ liệu thiếu',
    status: 'in_review',
    priority: 'medium',
    assigneeId: 'u7',
    due: -1,
    estimate: 4,
    labels: ['l6'],
    createdBy: 'u9',
  }),
  task({
    groupId: 'g2',
    phaseId: 'g2-p2',
    title: 'Viết phần nhận xét xu hướng',
    status: 'todo',
    priority: 'medium',
    assigneeId: ME_ID,
    due: 6,
    estimate: 3,
    createdBy: 'u9',
  }),
  // g3
  task({
    groupId: 'g3',
    phaseId: 'g3-p1',
    title: 'Tóm tắt 5 bài báo về lãi suất điều hành',
    status: 'in_progress',
    priority: 'high',
    assigneeId: ME_ID,
    due: -1,
    estimate: 4,
    createdBy: 'u10',
  }),
  task({
    groupId: 'g3',
    phaseId: 'g3-p1',
    title: 'Lấy số liệu CPI từ GSO',
    status: 'done',
    assigneeId: 'u5',
    due: -3,
    estimate: 2,
    createdBy: 'u10',
  }),
  task({
    groupId: 'g3',
    phaseId: 'g3-p2',
    title: 'Viết chương 2 – Cơ sở lý thuyết',
    status: 'todo',
    priority: 'medium',
    assigneeId: ME_ID,
    due: 14,
    estimate: 6,
    createdBy: 'u10',
  }),
  // g4
  task({
    groupId: 'g4',
    phaseId: 'g4-p1',
    title: 'Phác thảo luồng mượn – trả đồ',
    status: 'todo',
    priority: 'urgent',
    assigneeId: ME_ID,
    due: 0,
    estimate: 3,
    createdBy: 'u6',
  }),
  task({
    groupId: 'g4',
    phaseId: 'g4-p1',
    title: 'Khảo sát 30 bạn ở KTX',
    status: 'in_progress',
    priority: 'medium',
    assigneeId: 'u3',
    due: 4,
    estimate: 4,
    createdBy: 'u6',
  }),
  // g5 (archived)
  task({
    groupId: 'g5',
    phaseId: 'g5-p1',
    title: 'Lab 4 – VLAN và định tuyến',
    status: 'done',
    assigneeId: ME_ID,
    due: -135,
    estimate: 5,
  }),
]

// Attachments and sub-tasks make the detail sheet realistic
const archTask = TASKS.find((item) => item.id === 't7')
if (archTask) {
  archTask.attachments = [
    {
      id: 'a1',
      kind: 'file',
      name: 'c4-container.png',
      url: '#',
      size: 482_000,
      uploadedBy: ME_ID,
      createdAt: hoursAgo(30),
    },
    {
      id: 'a2',
      kind: 'link',
      name: 'Bản nháp trên Google Docs',
      url: 'https://docs.google.com',
      size: null,
      uploadedBy: 'u3',
      createdAt: hoursAgo(26),
    },
  ]
}
const erdTask = TASKS.find((item) => item.id === 't5')
if (erdTask) {
  erdTask.attachments = [
    {
      id: 'a3',
      kind: 'file',
      name: 'erd-v3.pdf',
      url: '#',
      size: 1_240_000,
      uploadedBy: 'u3',
      createdAt: hoursAgo(5),
    },
  ]
}

const COMMENTS: TaskComment[] = [
  {
    id: 'cm1',
    taskId: 't7',
    authorId: 'u3',
    body: '@Minh Tiến phần thanh toán nên tách thành service riêng không?',
    createdAt: hoursAgo(28),
  },
  {
    id: 'cm2',
    taskId: 't7',
    authorId: ME_ID,
    body: 'Ừ, mình tách payment-service, giao tiếp qua webhook. Đang vẽ lại sơ đồ.',
    createdAt: hoursAgo(27),
  },
  {
    id: 'cm3',
    taskId: 't5',
    authorId: 'u3',
    body: 'Mình gửi duyệt ERD v3, đã thêm bảng incident_reports.',
    createdAt: hoursAgo(5),
  },
  {
    id: 'cm4',
    taskId: 't5',
    authorId: 'u2',
    body: 'Bảng invoices thiếu cột due_date nhé.',
    createdAt: hoursAgo(3),
  },
]

const TASK_EVENTS: TaskEvent[] = [
  { id: 'e1', taskId: 't5', actorId: ME_ID, kind: 'created', createdAt: daysFromNow(-18, 9, 0) },
  {
    id: 'e2',
    taskId: 't5',
    actorId: ME_ID,
    kind: 'assigned',
    note: 'Lê Hoàng Nam',
    createdAt: daysFromNow(-18, 9, 1),
  },
  {
    id: 'e3',
    taskId: 't5',
    actorId: 'u3',
    kind: 'statusChanged',
    from: 'todo',
    to: 'in_progress',
    createdAt: daysFromNow(-10, 14, 0),
  },
  {
    id: 'e4',
    taskId: 't5',
    actorId: 'u2',
    kind: 'returned',
    note: 'Thiếu bảng sự cố',
    createdAt: daysFromNow(-3, 16, 0),
  },
  {
    id: 'e5',
    taskId: 't5',
    actorId: 'u3',
    kind: 'statusChanged',
    from: 'in_progress',
    to: 'in_review',
    createdAt: hoursAgo(5),
  },
  { id: 'e6', taskId: 't7', actorId: ME_ID, kind: 'created', createdAt: daysFromNow(-15, 9, 0) },
  {
    id: 'e7',
    taskId: 't7',
    actorId: ME_ID,
    kind: 'statusChanged',
    from: 'todo',
    to: 'in_progress',
    createdAt: daysFromNow(-6, 9, 0),
  },
]

function checklist(...items: [string, boolean][]): ChecklistItem[] {
  return items.map(([text, isDone], index) => ({ id: `mc-${text.length}-${index}`, text, isDone }))
}

const MILESTONES: Milestone[] = [
  {
    id: 'g1-m1',
    groupId: 'g1',
    name: 'Nộp đặc tả yêu cầu (SRS)',
    dueAt: daysFromNow(-20),
    weight: 15,
    description: 'Nộp file PDF theo mẫu IEEE 830, tối đa 25 trang, kèm sơ đồ use case tổng quát.',
    status: 'graded',
    score: 8.5,
    feedback: 'Use case rõ ràng. Cần bổ sung yêu cầu phi chức năng về bảo mật thanh toán.',
    checklist: checklist(['Đúng mẫu IEEE 830', true], ['Có mục lục và đánh số trang', true]),
  },
  {
    id: 'g1-m2',
    groupId: 'g1',
    name: 'Nộp tài liệu thiết kế (SDD)',
    dueAt: daysFromNow(3, 23, 59),
    weight: 20,
    description:
      'Tài liệu thiết kế gồm kiến trúc, CSDL, giao diện; link Figma để chế độ xem công khai.',
    status: 'open',
    score: null,
    feedback: null,
    checklist: checklist(
      ['Kiến trúc C4 đủ 3 mức', false],
      ['ERD khớp với SRS', true],
      ['Link Figma mở công khai', true],
      ['Đặt tên file Nhom3_SDD.pdf', false],
    ),
  },
  {
    id: 'g1-m3',
    groupId: 'g1',
    name: 'Demo giữa kỳ',
    dueAt: daysFromNow(28, 13, 0),
    weight: 25,
    description: 'Demo trực tiếp 10 phút trên lớp: quản lý phòng và hợp đồng chạy được.',
    status: 'open',
    score: null,
    feedback: null,
    checklist: [],
  },
  {
    id: 'g1-m4',
    groupId: 'g1',
    name: 'Báo cáo và sản phẩm cuối kỳ',
    dueAt: daysFromNow(70),
    weight: 40,
    description: 'Báo cáo hoàn chỉnh, mã nguồn trên GitHub, video demo 5 phút.',
    status: 'open',
    score: null,
    feedback: null,
    checklist: [],
  },
  {
    id: 'g2-m1',
    groupId: 'g2',
    name: 'Nộp notebook phân tích',
    dueAt: daysFromNow(5),
    weight: 30,
    description: 'File .ipynb chạy được từ đầu đến cuối.',
    status: 'open',
    score: null,
    feedback: null,
    checklist: [],
  },
  {
    id: 'g3-m1',
    groupId: 'g3',
    name: 'Nộp đề cương',
    dueAt: daysFromNow(2, 17, 0),
    weight: 10,
    description: 'Đề cương 3 trang, có danh mục tài liệu.',
    status: 'open',
    score: null,
    feedback: null,
    checklist: [],
  },
  {
    id: 'g5-m1',
    groupId: 'g5',
    name: 'Báo cáo lab cuối kỳ',
    dueAt: daysFromNow(-125),
    weight: 50,
    description: 'Báo cáo 4 bài lab.',
    status: 'graded',
    score: 9,
    feedback: 'Tốt.',
    checklist: [],
  },
]

const DELIVERABLES: Deliverable[] = [
  {
    id: 'd1',
    milestoneId: 'g1-m1',
    version: 1,
    kind: 'file',
    url: '#',
    fileName: 'Nhom3_SRS_v1.pdf',
    fileSize: 2_100_000,
    note: 'Bản nháp gửi nhóm góp ý',
    isPrimary: false,
    isLate: false,
    uploadedBy: 'u5',
    createdAt: daysFromNow(-23, 21, 0),
  },
  {
    id: 'd2',
    milestoneId: 'g1-m1',
    version: 2,
    kind: 'file',
    url: '#',
    fileName: 'Nhom3_SRS_final.pdf',
    fileSize: 2_450_000,
    note: 'Bản nộp chính thức',
    isPrimary: true,
    isLate: false,
    uploadedBy: ME_ID,
    createdAt: daysFromNow(-20, 22, 10),
  },
  {
    id: 'd3',
    milestoneId: 'g1-m2',
    version: 1,
    kind: 'link',
    url: 'https://www.figma.com',
    fileName: null,
    fileSize: null,
    note: 'Prototype Figma bản đầu',
    isPrimary: false,
    isLate: false,
    uploadedBy: 'u2',
    createdAt: hoursAgo(40),
  },
  {
    id: 'd4',
    milestoneId: 'g1-m2',
    version: 2,
    kind: 'file',
    url: '#',
    fileName: 'Nhom3_SDD_draft.pdf',
    fileSize: 3_800_000,
    note: 'Bản nháp, còn thiếu sơ đồ Component',
    isPrimary: true,
    isLate: false,
    uploadedBy: ME_ID,
    createdAt: hoursAgo(6),
  },
]

const PROGRESS_UPDATES: ProgressUpdate[] = [
  {
    id: 'pu1',
    groupId: 'g1',
    userId: 'u3',
    done: 'Hoàn thành ERD v3, thêm bảng sự cố.',
    next: 'Sửa theo góp ý, viết script tạo bảng.',
    blockers: '',
    createdAt: hoursAgo(4),
  },
  {
    id: 'pu2',
    groupId: 'g1',
    userId: 'u2',
    done: 'Xong wireframe 12 màn hình.',
    next: 'Prototype luồng thanh toán.',
    blockers: 'Chờ chốt cổng thanh toán để vẽ màn hình xác nhận.',
    createdAt: hoursAgo(22),
  },
  {
    id: 'pu3',
    groupId: 'g1',
    userId: ME_ID,
    done: 'Sơ đồ Context, Container.',
    next: 'Sơ đồ Component, chọn cổng thanh toán.',
    blockers: '',
    createdAt: hoursAgo(26),
  },
  {
    id: 'pu4',
    groupId: 'g1',
    userId: 'u4',
    done: '',
    next: 'Bắt đầu đặc tả API hóa đơn.',
    blockers: 'Bận thi giữa kỳ môn khác đến thứ 6.',
    createdAt: daysFromNow(-4, 20, 0),
  },
]

const RETRO_ITEMS: RetroItem[] = [
  {
    id: 'r1',
    phaseId: 'g1-p1',
    kind: 'good',
    text: 'Phỏng vấn chủ trọ sớm nên yêu cầu rõ.',
    authorId: 'u2',
    votes: 4,
  },
  {
    id: 'r2',
    phaseId: 'g1-p1',
    kind: 'good',
    text: 'Họp nhanh 15 phút mỗi tối thứ 3 hiệu quả.',
    authorId: null,
    votes: 3,
  },
  {
    id: 'r3',
    phaseId: 'g1-p1',
    kind: 'bad',
    text: 'Dồn việc tổng hợp SRS vào 2 ngày cuối.',
    authorId: null,
    votes: 5,
  },
  {
    id: 'r4',
    phaseId: 'g1-p1',
    kind: 'improve',
    text: 'Chốt bản nháp trước hạn nộp 3 ngày.',
    authorId: ME_ID,
    votes: 4,
  },
  {
    id: 'r5',
    phaseId: 'g1-p1',
    kind: 'improve',
    text: 'Ghi biên bản mỗi buổi họp.',
    authorId: null,
    votes: 2,
  },
]

const CRITERIA = [
  { id: 'k1', name: 'Mức độ hoàn thành công việc' },
  { id: 'k2', name: 'Đúng hạn' },
  { id: 'k3', name: 'Phối hợp, giao tiếp' },
  { id: 'k4', name: 'Chất lượng sản phẩm' },
]

const REVIEW_ROUNDS: ReviewRound[] = [
  {
    id: 'rv2',
    groupId: 'g1',
    name: 'Đánh giá giữa kỳ',
    deadline: daysFromNow(5),
    criteria: CRITERIA,
    allowSelfReview: false,
    status: 'open',
    submittedBy: ['u2', 'u3'],
    results: null,
  },
  {
    id: 'rv1',
    groupId: 'g1',
    name: 'Đánh giá giai đoạn Phân tích',
    deadline: daysFromNow(-18),
    criteria: CRITERIA,
    allowSelfReview: false,
    status: 'closed',
    submittedBy: [ME_ID, 'u2', 'u3', 'u4', 'u5'],
    results: [
      {
        userId: ME_ID,
        reviewCount: 4,
        scores: { k1: 4.5, k2: 4.25, k3: 4.75, k4: 4.5 },
        comments: ['Điều phối tốt, phản hồi nhanh.', 'Nên giao việc sớm hơn.'],
      },
      {
        userId: 'u2',
        reviewCount: 4,
        scores: { k1: 4.75, k2: 5, k3: 4.5, k4: 4.75 },
        comments: ['Wireframe rất kỹ.', 'Luôn đúng hạn.'],
      },
      {
        userId: 'u3',
        reviewCount: 4,
        scores: { k1: 4, k2: 3.75, k3: 4, k4: 4.25 },
        comments: ['ERD tốt nhưng hay sát hạn.'],
      },
      {
        userId: 'u4',
        reviewCount: 4,
        scores: { k1: 3.25, k2: 3, k3: 3.5, k4: 3.5 },
        comments: ['Cần cập nhật tiến độ thường xuyên hơn.'],
      },
      // BR12 / UC12-4a: fewer than 2 reviews, nothing is published for this member
      { userId: 'u5', reviewCount: 1, scores: {}, comments: [] },
    ],
  },
]

const RESOURCES: Resource[] = [
  {
    id: 'rs1',
    groupId: 'g1',
    kind: 'link',
    title: 'Repo GitHub',
    url: 'https://github.com',
    folder: 'Mã nguồn',
    size: null,
    addedBy: 'u3',
    createdAt: daysFromNow(-30),
  },
  {
    id: 'rs2',
    groupId: 'g1',
    kind: 'link',
    title: 'Figma – Smart Rental',
    url: 'https://www.figma.com',
    folder: 'Thiết kế',
    size: null,
    addedBy: 'u2',
    createdAt: daysFromNow(-15),
  },
  {
    id: 'rs3',
    groupId: 'g1',
    kind: 'file',
    title: 'Đề bài SE104.pdf',
    url: '#',
    folder: 'Đề bài',
    size: 820_000,
    addedBy: ME_ID,
    createdAt: daysFromNow(-44),
  },
  {
    id: 'rs4',
    groupId: 'g1',
    kind: 'file',
    title: 'Mẫu báo cáo IEEE 830.docx',
    url: '#',
    folder: 'Đề bài',
    size: 145_000,
    addedBy: ME_ID,
    createdAt: daysFromNow(-44),
  },
  {
    id: 'rs5',
    groupId: 'g1',
    kind: 'link',
    title: 'Tài liệu VNPay sandbox',
    url: 'https://sandbox.vnpayment.vn',
    folder: 'Tham khảo',
    size: null,
    addedBy: ME_ID,
    createdAt: daysFromNow(-2),
  },
]

const MEETING_NOTES: MeetingNote[] = [
  {
    id: 'mn1',
    groupId: 'g1',
    title: 'Họp chốt kiến trúc',
    heldAt: daysFromNow(-2, 20, 0),
    attendeeIds: [ME_ID, 'u2', 'u3', 'u5'],
    summary: 'Thống nhất tách payment-service, dùng PostgreSQL. Figma ưu tiên luồng thanh toán.',
    actionItems: [
      {
        id: 'ai1',
        text: 'Vẽ sơ đồ Component cho payment-service',
        assigneeId: ME_ID,
        taskId: 't19',
      },
      { id: 'ai2', text: 'Bổ sung cột due_date cho bảng invoices', assigneeId: 'u3', taskId: null },
      {
        id: 'ai3',
        text: 'Hỏi thầy về yêu cầu demo thanh toán thật hay giả lập',
        assigneeId: 'u5',
        taskId: null,
      },
    ],
  },
  {
    id: 'mn2',
    groupId: 'g1',
    title: 'Kickoff giai đoạn Thiết kế',
    heldAt: daysFromNow(-19, 20, 0),
    attendeeIds: [ME_ID, 'u2', 'u3', 'u4', 'u5'],
    summary: 'Chia việc thiết kế; mỗi tối thứ 3 họp 15 phút.',
    actionItems: [{ id: 'ai4', text: 'Lập lịch họp cố định', assigneeId: ME_ID, taskId: null }],
  },
]

const POLLS: Poll[] = [
  {
    id: 'pl1',
    groupId: 'g1',
    question: 'Chọn cổng thanh toán cho bản demo?',
    closesAt: daysFromNow(1),
    createdBy: ME_ID,
    options: [
      { id: 'o1', text: 'VNPay sandbox', voterIds: [ME_ID, 'u3'] },
      { id: 'o2', text: 'MoMo test', voterIds: ['u2'] },
      { id: 'o3', text: 'Giả lập, không tích hợp', voterIds: [] },
    ],
  },
]

const ACTIVITIES: Activity[] = [
  {
    id: 'ac1',
    groupId: 'g1',
    actorId: 'u3',
    kind: 'taskStatusChanged',
    params: { task: '#5 Thiết kế lược đồ CSDL', status: 'in_review' },
    createdAt: hoursAgo(5),
  },
  {
    id: 'ac2',
    groupId: 'g1',
    actorId: ME_ID,
    kind: 'deliverableUploaded',
    params: { milestone: 'Nộp tài liệu thiết kế (SDD)', version: 'v2' },
    createdAt: hoursAgo(6),
  },
  {
    id: 'ac3',
    groupId: 'g1',
    actorId: 'u2',
    kind: 'taskApproved',
    params: { task: '#6 Wireframe 12 màn hình chính' },
    createdAt: hoursAgo(30),
  },
  {
    id: 'ac4',
    groupId: 'g1',
    actorId: ME_ID,
    kind: 'reviewOpened',
    params: { round: 'Đánh giá giữa kỳ' },
    createdAt: hoursAgo(48),
  },
  {
    id: 'ac5',
    groupId: 'g1',
    actorId: 'u8',
    kind: 'memberLeft',
    params: {},
    createdAt: daysFromNow(-9, 15, 0),
  },
  {
    id: 'ac6',
    groupId: 'g1',
    actorId: 'u2',
    kind: 'taskReturned',
    params: { task: '#5 Thiết kế lược đồ CSDL', reason: 'Thiếu bảng sự cố' },
    createdAt: daysFromNow(-3, 16, 0),
  },
  {
    id: 'ac7',
    groupId: 'g1',
    actorId: ME_ID,
    kind: 'phaseClosed',
    params: { phase: 'Phân tích yêu cầu' },
    createdAt: daysFromNow(-20, 20, 0),
  },
  {
    id: 'ac8',
    groupId: 'g1',
    actorId: ME_ID,
    kind: 'milestoneGraded',
    params: { milestone: 'Nộp đặc tả yêu cầu (SRS)', score: '8.5' },
    createdAt: daysFromNow(-12, 10, 0),
  },
  {
    id: 'ac9',
    groupId: 'g1',
    actorId: 'u5',
    kind: 'charterConfirmed',
    params: {},
    createdAt: daysFromNow(-40, 10, 0),
  },
  {
    id: 'ac10',
    groupId: 'g1',
    actorId: 'u5',
    kind: 'memberJoined',
    params: {},
    createdAt: daysFromNow(-38, 10, 0),
  },
  {
    id: 'ac11',
    groupId: 'g1',
    actorId: ME_ID,
    kind: 'roleChanged',
    params: { member: 'Trần Thị Mai', role: 'deputy' },
    createdAt: daysFromNow(-41, 9, 0),
  },
  {
    id: 'ac12',
    groupId: 'g1',
    actorId: ME_ID,
    kind: 'phaseCreated',
    params: { phase: 'Kiểm thử' },
    createdAt: daysFromNow(-44, 9, 0),
  },
]

const NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    kind: 'taskReviewRequested',
    groupId: 'g1',
    actorId: 'u3',
    params: { task: '#5 Thiết kế lược đồ CSDL' },
    link: ROUTES.groupTask('g1', 't5'),
    createdAt: hoursAgo(5),
    readAt: null,
  },
  {
    id: 'n2',
    kind: 'joinRequest',
    groupId: 'g1',
    actorId: 'u6',
    params: {},
    link: ROUTES.groupMembers('g1'),
    createdAt: hoursAgo(9),
    readAt: null,
  },
  {
    id: 'n3',
    kind: 'taskDueSoon',
    groupId: 'g1',
    actorId: null,
    params: { task: '#7 Thiết kế kiến trúc hệ thống' },
    link: ROUTES.groupTask('g1', 't7'),
    createdAt: hoursAgo(12),
    readAt: null,
  },
  {
    id: 'n4',
    kind: 'mentioned',
    groupId: 'g1',
    actorId: 'u3',
    params: { task: '#7 Thiết kế kiến trúc hệ thống' },
    link: ROUTES.groupTask('g1', 't7'),
    createdAt: hoursAgo(28),
    readAt: null,
  },
  {
    id: 'n5',
    kind: 'taskOverdue',
    groupId: 'g3',
    actorId: null,
    params: { task: '#1 Tóm tắt 5 bài báo về lãi suất điều hành' },
    link: ROUTES.groupTask('g3', 't24'),
    createdAt: hoursAgo(14),
    readAt: null,
  },
  {
    id: 'n6',
    kind: 'milestoneDueSoon',
    groupId: 'g3',
    actorId: null,
    params: { milestone: 'Nộp đề cương' },
    link: ROUTES.groupMilestoneDetail('g3', 'g3-m1'),
    createdAt: hoursAgo(20),
    readAt: hoursAgo(18),
  },
  {
    id: 'n7',
    kind: 'taskAssigned',
    groupId: 'g2',
    actorId: 'u9',
    params: { task: '#4 Viết phần nhận xét xu hướng' },
    link: ROUTES.groupTask('g2', 't23'),
    createdAt: hoursAgo(30),
    readAt: hoursAgo(29),
  },
  {
    id: 'n8',
    kind: 'reviewOpened',
    groupId: 'g1',
    actorId: ME_ID,
    params: { round: 'Đánh giá giữa kỳ' },
    link: ROUTES.groupReviews('g1'),
    createdAt: hoursAgo(48),
    readAt: hoursAgo(47),
  },
  {
    id: 'n9',
    kind: 'groupInvite',
    groupId: 'g4',
    actorId: 'u6',
    params: { group: 'Hackathon UIT 2026' },
    link: ROUTES.groupDetail('g4'),
    createdAt: hoursAgo(130),
    readAt: hoursAgo(125),
  },
  {
    id: 'n10',
    kind: 'memberLeft',
    groupId: 'g1',
    actorId: 'u8',
    params: { count: '2' },
    link: ROUTES.groupMembers('g1'),
    createdAt: daysFromNow(-9, 15, 0),
    readAt: daysFromNow(-9, 16, 0),
  },
]

const CHARTERS: Charter[] = [
  {
    groupId: 'g1',
    version: 2,
    updatedAt: daysFromNow(-41, 9, 0),
    content: [
      'Họp nhóm 15 phút mỗi tối thứ 3 qua Google Meet; vắng phải báo trước 3 giờ.',
      'Cập nhật trạng thái công việc trên ASMS trước 22:00 mỗi ngày làm việc.',
      'Gửi duyệt ít nhất 24 giờ trước hạn chót để còn thời gian sửa.',
      'Trễ hạn 2 lần liên tiếp sẽ bị nhắc trong buổi họp và ghi nhận khi đánh giá chéo.',
      'Bất đồng được giải quyết bằng bình chọn; trưởng nhóm quyết định khi hòa phiếu.',
    ],
    confirmedBy: [ME_ID, 'u2', 'u3', 'u5'],
  },
]

const EMAIL_INVITES: EmailInvite[] = [
  {
    id: 'iv1',
    groupId: 'g1',
    email: 'khoa.nm@student.edu.vn',
    invitedBy: ME_ID,
    createdAt: hoursAgo(26),
  },
]

const JOIN_REQUESTS: JoinRequest[] = [
  {
    id: 'jr1',
    groupId: 'g1',
    userId: 'u6',
    message: 'Mình biết Flutter, muốn làm app mobile cho người thuê.',
    createdAt: hoursAgo(9),
  },
  { id: 'jr2', groupId: 'g1', userId: 'u7', message: '', createdAt: hoursAgo(31) },
]

export interface MockDb {
  users: MockUser[]
  groups: Group[]
  members: Member[]
  labels: Label[]
  phases: Phase[]
  tasks: Task[]
  comments: TaskComment[]
  taskEvents: TaskEvent[]
  milestones: Milestone[]
  deliverables: Deliverable[]
  progressUpdates: ProgressUpdate[]
  retroItems: RetroItem[]
  reviewRounds: ReviewRound[]
  /** The signed-in student's own drafts per round, editable until the deadline (UC12-3) */
  reviewDrafts: Record<string, Record<string, ReviewDraft>>
  resources: Resource[]
  meetingNotes: MeetingNote[]
  polls: Poll[]
  activities: Activity[]
  notifications: AppNotification[]
  charters: Charter[]
  emailInvites: EmailInvite[]
  joinRequests: JoinRequest[]
  /** Requests the signed-in student sent to other groups, by join code */
  myPendingRequests: string[]
  /** UC04-1a: e-mail invitations received by the signed-in student; accepting joins without approval */
  invitationsToMe: { id: string; joinCode: string; invitedBy: string; createdAt: string }[]
}

/** A fresh deep copy, so that "reset demo data" restores the original state */
export function createSeed(): MockDb {
  return structuredClone({
    users: USERS,
    groups: GROUPS,
    members: MEMBERS,
    labels: LABELS,
    phases: PHASES,
    tasks: TASKS,
    comments: COMMENTS,
    taskEvents: TASK_EVENTS,
    milestones: MILESTONES,
    deliverables: DELIVERABLES,
    progressUpdates: PROGRESS_UPDATES,
    retroItems: RETRO_ITEMS,
    reviewRounds: REVIEW_ROUNDS,
    reviewDrafts: {},
    resources: RESOURCES,
    meetingNotes: MEETING_NOTES,
    polls: POLLS,
    activities: ACTIVITIES,
    notifications: NOTIFICATIONS,
    charters: CHARTERS,
    emailInvites: EMAIL_INVITES,
    joinRequests: JOIN_REQUESTS,
    myPendingRequests: [],
    invitationsToMe: [{ id: 'inv-me-1', joinCode: 'AICLB9', invitedBy: 'u7', createdAt: hoursAgo(16) }],
  })
}

/**
 * Groups that exist only behind a join code, to try the join flow (UC04): one open, one needing approval, one full.
 */
export const JOINABLE_GROUPS: Group[] = [
  group({
    id: 'g-open',
    name: 'OOP – Nhóm 12',
    topic: 'Game cờ caro Java Swing',
    subjectCode: 'IT002',
    subjectName: 'Lập trình hướng đối tượng',
    semester: SEMESTER_NOW,
    joinCode: 'OOP12A',
    requireApproval: false,
    maxMembers: 5,
  }),
  group({
    id: 'g-approve',
    name: 'AI Club – Chatbot tuyển sinh',
    topic: 'Chatbot RAG trả lời câu hỏi tuyển sinh',
    joinCode: 'AICLB9',
    requireApproval: true,
    maxMembers: 6,
  }),
  group({
    id: 'g-full',
    name: 'CTDL – Nhóm 1',
    topic: 'Cài đặt B-Tree',
    subjectCode: 'IT003',
    subjectName: 'Cấu trúc dữ liệu và giải thuật',
    semester: SEMESTER_NOW,
    joinCode: 'FULL01',
    maxMembers: 3,
  }),
]

/** Member count shown on the join preview of the code-only groups */
export const JOINABLE_MEMBER_COUNT: Record<string, number> = {
  'g-open': 3,
  'g-approve': 4,
  'g-full': 3,
}

/** UC02 step 2: suggestions from the Admin catalogs (semesters, subjects); every field can still be typed freely */
export const SEMESTER_OPTIONS = [SEMESTER_NOW, 'Hè 2026', SEMESTER_PAST]

export const SUBJECT_SUGGESTIONS: { code: string; name: string }[] = [
  { code: 'SE104', name: 'Nhập môn Công nghệ phần mềm' },
  { code: 'DS201', name: 'Trực quan hóa dữ liệu' },
  { code: 'ECO102', name: 'Kinh tế vĩ mô' },
  { code: 'IT002', name: 'Lập trình hướng đối tượng' },
  { code: 'IT003', name: 'Cấu trúc dữ liệu và giải thuật' },
  { code: 'NT106', name: 'Mạng máy tính' },
]

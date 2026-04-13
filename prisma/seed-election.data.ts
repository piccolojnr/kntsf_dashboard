export const DEMO_ELECTION_IDS = {
  draft: 9001,
  // pendingApproval: 9002,
  // approved: 9003,
  // active: 9004,
  // closed: 9005,
  // resultsPublished: 9006,
  // archived: 9007,
} as const;

export const demoStudents = [
  {
    studentId: 'KUC/EL/001',
    name: 'Ama Owusu',
    email: 'ama.owusu.election@example.com',
    course: 'Business Administration',
    level: '300',
    number: '0201000001',
  },
  {
    studentId: 'KUC/EL/002',
    name: 'Kojo Mensah',
    email: 'kojo.mensah.election@example.com',
    course: 'Computer Science',
    level: '300',
    number: '0201000002',
  },
  {
    studentId: 'KUC/EL/003',
    name: 'Efua Addo',
    email: 'efua.addo.election@example.com',
    course: 'Accounting',
    level: '200',
    number: '0201000003',
  },
  {
    studentId: 'KUC/EL/004',
    name: 'Yaw Boateng',
    email: 'yaw.boateng.election@example.com',
    course: 'Marketing',
    level: '200',
    number: '0201000004',
  },
  {
    studentId: 'KUC/EL/005',
    name: 'Akosua Asare',
    email: 'akosua.asare.election@example.com',
    course: 'Human Resource Management',
    level: '400',
    number: '0201000005',
  },
  {
    studentId: 'KUC/EL/006',
    name: 'Daniel Tetteh',
    email: 'daniel.tetteh.election@example.com',
    course: 'Computer Science',
    level: '400',
    number: '0201000006',
  },
] as const;

export const demoElectionIdList = Object.values(DEMO_ELECTION_IDS);

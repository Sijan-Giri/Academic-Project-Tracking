import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin@123', 12);
  const passwordCoord = await bcrypt.hash('Coord@123', 12);
  const passwordFaculty = await bcrypt.hash('Faculty@123', 12);
  const passwordStudent = await bcrypt.hash('Student@123', 12);

  // Super Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@apts.edu' },
    update: {},
    create: { email: 'admin@apts.edu', password: hashedPassword, name: 'Super Admin', role: Role.ADMIN },
  });

  // Departments
  const cseDept = await prisma.department.upsert({
    where: { code: 'CSE' },
    update: {},
    create: { code: 'CSE', name: 'Computer Science and Engineering', description: 'CSE Department' },
  });

  await prisma.department.upsert({ where: { code: 'ECE' }, update: {}, create: { code: 'ECE', name: 'Electronics and Communication Engineering' } });
  await prisma.department.upsert({ where: { code: 'ME' }, update: {}, create: { code: 'ME', name: 'Mechanical Engineering' } });
  await prisma.department.upsert({ where: { code: 'CE' }, update: {}, create: { code: 'CE', name: 'Civil Engineering' } });
  await prisma.department.upsert({ where: { code: 'EI' }, update: {}, create: { code: 'EI', name: 'Electronics and Instrumentation' } });

  // Academic Year
  const ay = await prisma.academicYear.upsert({
    where: { label: '2023-2027' },
    update: {},
    create: { startYear: 2023, endYear: 2027, label: '2023-2027' },
  });

  // Coordinator
  const coordUser = await prisma.user.upsert({
    where: { email: 'coordinator.cse@apts.edu' },
    update: {},
    create: { email: 'coordinator.cse@apts.edu', password: passwordCoord, name: 'Dr. Coordinator CSE', role: Role.COORDINATOR },
  });

  // Faculty
  const f1 = await prisma.user.upsert({ where: { email: 'faculty1.cse@apts.edu' }, update: {}, create: { email: 'faculty1.cse@apts.edu', password: passwordFaculty, name: 'Faculty One', role: Role.FACULTY } });
  const f2 = await prisma.user.upsert({ where: { email: 'faculty2.cse@apts.edu' }, update: {}, create: { email: 'faculty2.cse@apts.edu', password: passwordFaculty, name: 'Faculty Two', role: Role.FACULTY } });
  const f3 = await prisma.user.upsert({ where: { email: 'faculty3.cse@apts.edu' }, update: {}, create: { email: 'faculty3.cse@apts.edu', password: passwordFaculty, name: 'Faculty Three', role: Role.FACULTY } });

  await prisma.facultyProfile.upsert({ where: { userId: f1.id }, update: {}, create: { userId: f1.id, facultyId: 'FAC001', departmentId: cseDept.id, designation: 'Assistant Professor' } });
  await prisma.facultyProfile.upsert({ where: { userId: f2.id }, update: {}, create: { userId: f2.id, facultyId: 'FAC002', departmentId: cseDept.id, designation: 'Assistant Professor' } });
  await prisma.facultyProfile.upsert({ where: { userId: f3.id }, update: {}, create: { userId: f3.id, facultyId: 'FAC003', departmentId: cseDept.id, designation: 'Assistant Professor' } });

  // Batch
  const batch = await prisma.batch.upsert({
    where: { id: 'seed-batch-cse' },
    update: {},
    create: { id: 'seed-batch-cse', departmentId: cseDept.id, academicYearId: ay.id, name: 'CSE 2023-2027' },
  });

  // Semester
  const sem5 = await prisma.semester.upsert({
    where: { id: 'seed-sem-5' },
    update: {},
    create: { id: 'seed-sem-5', batchId: batch.id, number: 5, name: '5th Semester', startDate: new Date('2025-07-01'), endDate: new Date('2025-12-31'), isCurrent: true },
  });

  // Students
  const s1 = await prisma.user.upsert({ where: { email: 'student1@apts.edu' }, update: {}, create: { email: 'student1@apts.edu', password: passwordStudent, name: 'Student One', role: Role.STUDENT } });
  const s2 = await prisma.user.upsert({ where: { email: 'student2@apts.edu' }, update: {}, create: { email: 'student2@apts.edu', password: passwordStudent, name: 'Student Two', role: Role.STUDENT } });
  const s3 = await prisma.user.upsert({ where: { email: 'student3@apts.edu' }, update: {}, create: { email: 'student3@apts.edu', password: passwordStudent, name: 'Student Three', role: Role.STUDENT } });

  await prisma.studentProfile.upsert({ where: { userId: s1.id }, update: {}, create: { userId: s1.id, studentId: 'CS2023001', batchId: batch.id, currentSemesterId: sem5.id } });
  await prisma.studentProfile.upsert({ where: { userId: s2.id }, update: {}, create: { userId: s2.id, studentId: 'CS2023002', batchId: batch.id, currentSemesterId: sem5.id } });
  await prisma.studentProfile.upsert({ where: { userId: s3.id }, update: {}, create: { userId: s3.id, studentId: 'CS2023003', batchId: batch.id, currentSemesterId: sem5.id } });

  // Settings
  await prisma.setting.upsert({ where: { key: 'max_team_size' }, update: {}, create: { key: 'max_team_size', value: '4' } });
  await prisma.setting.upsert({ where: { key: 'min_team_size' }, update: {}, create: { key: 'min_team_size', value: '1' } });
  await prisma.setting.upsert({ where: { key: 'abstract_max_words' }, update: {}, create: { key: 'abstract_max_words', value: '500' } });
  await prisma.setting.upsert({ where: { key: 'plagiarism_threshold' }, update: {}, create: { key: 'plagiarism_threshold', value: '30' } });

  console.log('Seed data inserted successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

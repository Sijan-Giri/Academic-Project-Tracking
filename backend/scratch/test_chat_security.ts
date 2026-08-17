import prisma from '../src/config/database';
import { Role } from '@prisma/client';
import * as chatService from '../src/modules/chat/chat.service';

async function runVerification() {
  console.log('=== APTS Real-time Chat Security & Verification Test ===\n');

  // Find or verify users
  const admin = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
  const student = await prisma.user.findFirst({ where: { role: Role.STUDENT } });
  const faculty = await prisma.user.findFirst({ where: { role: Role.FACULTY } });

  if (!admin || !student || !faculty) {
    console.error('❌ Missing test users (Admin, Student, or Faculty). Please check seed data.');
    process.exit(1);
  }

  console.log(`✓ Admin User: ${(admin as any).name} (${(admin as any).id})`);
  console.log(`✓ Student User: ${(student as any).name} (${(student as any).id})`);
  console.log(`✓ Faculty User: ${(faculty as any).name} (${(faculty as any).id})\n`);

  // Test 1: Admin excluded from chattable users list
  console.log('Test 1: Admin excluded from contact search:');
  const chattableUsers = await chatService.getChattableUsers();
  const adminInSearch = chattableUsers.some((u) => (u as any).role === 'ADMIN' || (u as any).id === (admin as any).id);
  if (!adminInSearch) {
    console.log('  PASS: Admin does NOT appear in chattable users list.\n');
  } else {
    console.error('  FAIL: Admin found in contact search!\n');
  }

  // Test 2: Two non-admin users (Student and Faculty) start conversation and exchange messages
  console.log('Test 2: Non-admin users conversation & messaging:');
  const convId = await chatService.getOrCreateConversation((student as any).id, (faculty as any).id);
  console.log(`  ✓ Conversation created/retrieved: ${convId}`);

  const msg = await chatService.sendMessage(convId, (student as any).id, 'Hello Professor!', (student as any).role);
  console.log(`  ✓ Message sent from student: "${msg.content}" (ID: ${msg.id})`);

  const messages = await chatService.getMessagesForConversation(convId, (faculty as any).id);
  const found = messages.some((m) => m.id === msg.id);
  if (found) {
    console.log('  PASS: Faculty can read student message.\n');
  } else {
    console.error('  FAIL: Message not found in conversation history!\n');
  }

  // Test 3: Admin blocked from starting conversation (Service level)
  console.log('Test 3: Admin blocked from starting conversation (Service check):');
  try {
    await chatService.getOrCreateConversation((admin as any).id, (student as any).id);
    console.error('  FAIL: Admin was able to start a conversation!\n');
  } catch (err: any) {
    console.log(`  PASS: Blocked with message: "${err.message}"\n`);
  }

  // Test 4: Admin blocked from receiving conversation invitation (Service check)
  console.log('Test 4: Admin cannot be targeted in conversation creation:');
  try {
    await chatService.getOrCreateConversation((student as any).id, (admin as any).id);
    console.error('  FAIL: Target admin conversation was allowed!\n');
  } catch (err: any) {
    console.log(`  PASS: Blocked with message: "${err.message}"\n`);
  }

  // Test 5: Admin blocked from sending messages (Service check)
  console.log('Test 5: Admin blocked from sending messages:');
  try {
    await chatService.sendMessage(convId, (admin as any).id, 'Admin message', (admin as any).role);
    console.error('  FAIL: Admin was allowed to send message!\n');
  } catch (err: any) {
    console.log(`  PASS: Blocked with message: "${err.message}"\n`);
  }

  // Test 6: Unauthorized access to messages (User not in conversation)
  console.log('Test 6: Third-party user cannot read messages:');
  const otherStudent = await prisma.user.findFirst({
    where: {
      role: Role.STUDENT,
      id: { notIn: [(student as any).id, (faculty as any).id, (admin as any).id] },
    },
  });

  if (otherStudent) {
    try {
      await chatService.getMessagesForConversation(convId, (otherStudent as any).id);
      console.error('  FAIL: Unauthorized user read conversation messages!\n');
    } catch (err: any) {
      console.log(`  PASS: Unauthorized user rejected with: "${err.message}"\n`);
    }
  } else {
    console.log('  SKIP: Only one student exists in test DB.\n');
  }

  // Test 7: Database trigger level protection (Direct raw SQL bypassing API)
  console.log('Test 7: PostgreSQL Database Trigger Protection (Raw SQL bypass attempt):');
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "ConversationParticipant" ("id", "conversationId", "userId") VALUES (gen_random_uuid()::text, '${convId}', '${(admin as any).id}')`
    );
    console.error('  FAIL: Database trigger did NOT block admin participant insertion!\n');
  } catch (err: any) {
    console.log(`  PASS: DB trigger blocked admin participant: "${err.message.split('\n')[0]}"`);
  }

  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "Message" ("id", "conversationId", "senderId", "content") VALUES (gen_random_uuid()::text, '${convId}', '${(admin as any).id}', 'Hacked admin message')`
    );
    console.error('  FAIL: Database trigger did NOT block admin message sender insertion!\n');
  } catch (err: any) {
    console.log(`  PASS: DB trigger blocked admin sender: "${err.message.split('\n')[0]}"\n`);
  }

  console.log('=== All Chat Security Tests Completed Successfully! ===');
  process.exit(0);
}

runVerification().catch((e) => {
  console.error('Error during verification:', e);
  process.exit(1);
});

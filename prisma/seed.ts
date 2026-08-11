import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean database
  await prisma.session.deleteMany()
  await prisma.settings.deleteMany()
  await prisma.savedPrompt.deleteMany()
  await prisma.optimizerHistory.deleteMany()
  await prisma.rewardHistory.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.creditCard.deleteMany()
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.user.deleteMany()

  // 1. Create Demo User
  const passwordHash = await bcrypt.hash('password123', 10)
  const user = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      passwordHash,
      name: 'Demo User',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    },
  })

  // 2. Create User Settings
  await prisma.settings.create({
    data: {
      theme: 'dark',
      notificationsEnabled: true,
      userId: user.id,
    },
  })

  // 3. Create Seeded Credit Cards (Gold, Platinum, Blue Cash, Everyday)
  const platinum = await prisma.creditCard.create({
    data: {
      holderName: 'Demo User',
      cardNumber: '3712 345678 90123',
      expiry: '12/30',
      cvv: '1234',
      limit: 10000.00,
      cardType: 'Platinum',
      userId: user.id,
    },
  })

  const gold = await prisma.creditCard.create({
    data: {
      holderName: 'Demo User',
      cardNumber: '3787 987654 32109',
      expiry: '10/29',
      cvv: '5678',
      limit: 8000.00,
      cardType: 'Gold',
      userId: user.id,
    },
  })

  const blueCash = await prisma.creditCard.create({
    data: {
      holderName: 'Demo User',
      cardNumber: '3728 555555 44444',
      expiry: '05/28',
      cvv: '9012',
      limit: 5000.00,
      cardType: 'Blue Cash',
      userId: user.id,
    },
  })

  // 4. Create Initial Conversations
  const conv = await prisma.conversation.create({
    data: {
      title: 'Centurion lounge entry requirements',
      userId: user.id,
      isPinned: true,
      messages: {
        create: [
          {
            sender: 'user',
            text: 'How can I access the Centurion lounge?',
          },
          {
            sender: 'assistant',
            text: 'As an American Express Platinum cardholder, you receive complimentary access to the Centurion Lounge collection. You will need to present your valid Platinum Card, a boarding pass showing a confirmed same-day travel reservation, and a government-issued ID.',
            sources: [
              {
                text: 'AmEx Platinum Cardmembers receive complimentary access to over 1,400 airport lounges globally through the Global Lounge Collection. This includes all Centurion Lounges.',
                title: 'AmEx Centurion Lounge access criteria',
                url: 'https://www.americanexpress.com/travel-benefits/lounge-access',
                score: 0.112,
                confidence: 96,
                page: 1,
                citation: '[1]',
              },
            ],
          },
        ],
      },
    },
  })

  // 5. Create Seeded Expenses
  await prisma.expense.createMany({
    data: [
      {
        description: 'Starbucks Coffee',
        amount: 8.50,
        category: 'Food',
        date: '2026-07-15',
        paymentMethod: 'Gold',
        userId: user.id,
      },
      {
        description: 'Uber Ride to Airport',
        amount: 45.00,
        category: 'Travel',
        date: '2026-07-14',
        paymentMethod: 'Platinum',
        userId: user.id,
      },
      {
        description: 'Netflix Premium',
        amount: 15.99,
        category: 'Entertainment',
        date: '2026-07-12',
        paymentMethod: 'Blue Cash',
        userId: user.id,
      },
      {
        description: 'Amazon Store purchase',
        amount: 120.00,
        category: 'Shopping',
        date: '2026-07-10',
        paymentMethod: 'Platinum',
        userId: user.id,
      },
    ],
  })

  // 6. Create Seeded Reward History
  await prisma.rewardHistory.createMany({
    data: [
      {
        points: 34, // 8.50 * 4x (Gold)
        description: 'Starbucks Coffee - 4X Dining Multiplier',
        date: '2026-07-15',
        userId: user.id,
        creditCardId: gold.id,
      },
      {
        points: 225, // 45.00 * 5x (Platinum)
        description: 'Uber Ride - 5X Travel Multiplier',
        date: '2026-07-14',
        userId: user.id,
        creditCardId: platinum.id,
      },
    ],
  })

  // 7. Create Saved Prompts
  await prisma.savedPrompt.createMany({
    data: [
      {
        label: 'Centurion Guest Policy',
        text: 'What is the guest entry policy for the Centurion lounge with Amex Platinum?',
        category: 'Lounge',
        userId: user.id,
      },
      {
        label: 'Gold Dining Multipliers',
        text: 'Explain the 4x dining points cap on the Amex Gold card.',
        category: 'Rewards',
        userId: user.id,
      },
    ],
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

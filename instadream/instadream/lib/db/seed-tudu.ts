import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Load environment variables from .env.local
config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

// Get IST time helper for todos
const getISTDate = (daysFromNow: number, hour: number = 9) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, 0, 0, 0);
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(date.getTime() + istOffset);
};

interface TodoWithChecklist {
  title: string;
  description?: string;
  dueDate?: Date;
  priority: "high" | "medium" | "low" | "none";
  category?: string;
  tags?: string[];
  isCompleted: boolean;
  completedAt?: Date;
  checklistItems?: string[];
}

async function seedTudu() {
  console.log('🌱 Seeding Tudu todos...\n');

  const sampleTodos: TodoWithChecklist[] = [
    {
      title: "Prepare quarterly presentation for stakeholders",
      description: "Need to compile Q4 results and create slides for the board meeting",
      dueDate: getISTDate(2, 14),
      priority: "high",
      category: "work",
      tags: ["presentation", "quarterly", "board-meeting"],
      isCompleted: false,
      checklistItems: [
        "Gather Q4 financial data",
        "Create PowerPoint slides",
        "Prepare speaker notes",
        "Practice presentation"
      ]
    },
    {
      title: "Buy groceries for the week",
      description: "Vegetables, fruits, milk, bread, and snacks",
      dueDate: getISTDate(0, 18),
      priority: "medium",
      category: "shopping",
      tags: ["groceries", "weekly"],
      isCompleted: false,
    },
    {
      title: "Call mom for her birthday",
      dueDate: getISTDate(1, 10),
      priority: "high",
      category: "social",
      tags: ["family", "birthday"],
      isCompleted: false,
    },
    {
      title: "Gym session - leg day",
      dueDate: getISTDate(0, 7),
      priority: "medium",
      category: "health",
      tags: ["fitness", "workout"],
      isCompleted: true,
      completedAt: new Date(),
    },
    {
      title: "Review and merge pull requests",
      description: "3 PRs pending review from the team",
      dueDate: getISTDate(0, 16),
      priority: "high",
      category: "work",
      tags: ["code-review", "github"],
      isCompleted: false,
    },
    {
      title: "Read 'Atomic Habits' chapter 5-7",
      priority: "low",
      category: "education",
      tags: ["reading", "self-improvement"],
      isCompleted: false,
    },
    {
      title: "Pay electricity bill",
      dueDate: getISTDate(3, 23),
      priority: "high",
      category: "finance",
      tags: ["bills", "utilities"],
      isCompleted: false,
    },
    {
      title: "Fix leaking kitchen tap",
      description: "Water is dripping from the tap, need to tighten or replace washer",
      dueDate: getISTDate(5, 10),
      priority: "medium",
      category: "home",
      tags: ["repair", "plumbing"],
      isCompleted: false,
    },
    {
      title: "Team lunch this Friday",
      description: "Booked at Copper Chimney, 1 PM",
      dueDate: getISTDate(4, 13),
      priority: "none",
      category: "social",
      tags: ["team", "lunch"],
      isCompleted: false,
    },
    {
      title: "Order new running shoes",
      description: "Current ones are worn out after 6 months",
      priority: "medium",
      category: "shopping",
      tags: ["fitness", "shopping"],
      isCompleted: false,
    },
    {
      title: "Update resume with recent projects",
      priority: "low",
      category: "work",
      tags: ["career", "resume"],
      isCompleted: false,
      checklistItems: [
        "Add Tudu project details",
        "Update skills section",
        "Add new certifications"
      ]
    },
    {
      title: "Doctor appointment - annual checkup",
      dueDate: getISTDate(7, 11),
      priority: "medium",
      category: "health",
      tags: ["doctor", "checkup"],
      isCompleted: false,
    },
    {
      title: "Clean and organize study room",
      description: "Books are scattered, desk needs organizing",
      priority: "low",
      category: "home",
      tags: ["cleaning", "organization"],
      isCompleted: false,
    },
    {
      title: "Backup laptop data to cloud",
      dueDate: getISTDate(1, 20),
      priority: "medium",
      category: "personal",
      tags: ["backup", "tech"],
      isCompleted: false,
    },
    {
      title: "Morning jog completed",
      description: "5K run at the park",
      priority: "none",
      category: "health",
      tags: ["exercise", "running"],
      isCompleted: true,
      completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  ];

  for (const todo of sampleTodos) {
    const checklistItems = todo.checklistItems;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { checklistItems: _, ...todoData } = todo;

    const [insertedTodo] = await db
      .insert(schema.todos)
      .values({
        ...todoData,
        tags: todoData.tags || [],
        isRecurring: false,
      })
      .returning();

    console.log(`✓ Created: ${insertedTodo.title}`);

    // Insert checklist items if any
    if (checklistItems && checklistItems.length > 0) {
      for (let i = 0; i < checklistItems.length; i++) {
        await db.insert(schema.todoChecklistItems).values({
          todoId: insertedTodo.id,
          title: checklistItems[i],
          isCompleted: false,
          order: i,
        });
      }
      console.log(`  └─ Added ${checklistItems.length} checklist items`);
    }
  }

  console.log('\n✨ Tudu seeding completed!');
  process.exit(0);
}

seedTudu().catch((error) => {
  console.error('❌ Error seeding Tudu:', error);
  process.exit(1);
});

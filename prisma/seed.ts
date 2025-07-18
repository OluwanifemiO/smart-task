import {PrismaClient} from '@prisma/client';
import {withAccelerate} from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

async function main() {
    const nifemi = await prisma.user.upsert({
        where: {email: 'emailexample@gmail.com'},
        update: {},
        create: {
            name: 'Nifemi Ogidama',
            email: 'emailexample@gmail.com',
            password: 'shjkjn',
            createdAt: new Date(),
            tasks: {
                create: [
                    {
                        title: 'Review quarterly budgets',
                        description: '',
                        priorityLevel: 'medium',
                        dueDate: '2026-06-12T03:35:00+00:00',
                        createdAt: new Date(),
                        isCompleted: false,
                    },
                    {
                        title: 'Complete project presentation for client meeting',
                        description: '',
                        priorityLevel: 'high',
                        dueDate: '2026-06-20T03:35:00+00:00',
                        createdAt: new Date(),
                        isCompleted: false,
                    },
                    {
                        title: 'Prepare for standup meeting',
                        description: '',
                        priorityLevel: 'high',
                        dueDate: '2025-07-20T03:35:00+00:00',
                        createdAt: new Date(),
                        isCompleted: false,
                    },
                    {
                        title: 'Update personal portfolio website',
                        description: 'Include all current side projects.',
                        priorityLevel: 'low',
                        dueDate: '2025-07-30T03:35:00+00:00',
                        createdAt: new Date(),
                        isCompleted: false,
                    },
                    {
                        title: 'Plan team meeting',
                        description: 'Plan team meeting for next tuesday afternoon.',
                        priorityLevel: 'medium',
                        dueDate: '2025-07-18T03:35:00+00:00',
                        createdAt: new Date(),
                        isCompleted: false,
                    },
                ],
            },
        },
    })
    console.log({ nifemi })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
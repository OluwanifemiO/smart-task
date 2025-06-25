import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    //take the formData and persist to the db
    try {
        const formData = await req.formData();

        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const convertedPL = formData.get('priorityLevel') as string;
        const priorityLevel = convertedPL.toLowerCase();
        const dueDateRaw = formData.get('dueDate') as string;
        const dueDate = new Date(dueDateRaw);
        console.log('raw date' + dueDateRaw, 'converted' + dueDate);
        const userId = 1;

        const newTask = await prisma.task.create({
            data:{
                title,
                description,
                priorityLevel,
                dueDate,
                userId
            },
        });

        return NextResponse.json(newTask);
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}

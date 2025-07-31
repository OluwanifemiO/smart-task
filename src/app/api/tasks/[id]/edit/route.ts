import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {withAccelerate} from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());


export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const taskId = parseInt(id);
    console.log(taskId);

    if (isNaN(taskId)) {
        return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    try {
        const formData = await req.formData();

        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const priorityLevel = formData.get('priorityLevel') as string;
        const dueDateRaw = formData.get('dueDate') as string;

        const dueDate = new Date(dueDateRaw);

        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                title,
                description,
                priorityLevel: priorityLevel.toLowerCase(),
                dueDate,
            },
        });

        return NextResponse.json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {withAccelerate} from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const taskId = parseInt(id);
    console.log(taskId);

    if (isNaN(taskId)) {
        return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    try {
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: { isCompleted: true },
        });

        return NextResponse.json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}

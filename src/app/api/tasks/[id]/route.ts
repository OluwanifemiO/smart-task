// /app/api/tasks/[id]/route.ts
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import {withAccelerate} from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function GET(req: NextRequest, context: { params: { id: string } }) {
    const { id } = context.params;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
        return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    try {
        const task = await prisma.task.findUnique({
            where: { id: taskId }
        });

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        return NextResponse.json(task);
    } catch (error) {
        console.error('Error fetching task:', error);
        return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
    }
}

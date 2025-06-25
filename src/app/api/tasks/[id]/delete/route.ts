import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
    const { id } = context.params;
    const taskId = parseInt(id);
    console.log(taskId);

    if (isNaN(taskId)) {
        return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    try {
        const deletedTask = await prisma.task.delete({
            where: { id: taskId }
        });

        return NextResponse.json(deletedTask);
    } catch (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}

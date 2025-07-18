// /app/api/tasks/[id]/route.ts
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import {withAccelerate} from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function GET(req: NextRequest) {
    try {
        const tasks = await prisma.task.findMany();

        if (!tasks) {
            return NextResponse.json({ error: 'Tasks not found' }, { status: 404 });
        }

        return NextResponse.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

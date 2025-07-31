import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {withAccelerate} from "@prisma/extension-accelerate";
import {getServerSession} from "next-auth";
import {authConfig} from "@/lib/auth";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function POST(req: NextRequest) {
    //take the formData and persist to the db
    try {
        const session = await getServerSession(authConfig);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();

        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const convertedPL = formData.get('priorityLevel') as string;
        const priorityLevel = convertedPL.toLowerCase();
        const dueDateRaw = formData.get('dueDate') as string;
        const dueDate = new Date(dueDateRaw);
        const userId = session?.user.id;

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

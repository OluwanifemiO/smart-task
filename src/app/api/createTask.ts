'use server'
import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient();

export async function createTask(formData: FormData){
 //receives formdata carrying user-entered data for title, description, priority level and duedate
 //not including the createdAt date as the user doesn't enter that
 if(formData){
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const convertedPL = formData.get('priorityLevel') as string;
  const priorityLevel = convertedPL.toLowerCase();
  const dueDateRaw = formData.get('dueDate') as string;
  const dueDate = new Date(dueDateRaw);
  console.log('raw date' + dueDateRaw, 'converted' + dueDate);
  const userId = 1;

 await prisma.task.create({
   data:{
    title,
    description,
    priorityLevel,
    dueDate,
    userId
   },
  });
 }
}
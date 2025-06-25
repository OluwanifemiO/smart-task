import './styles.css';
import { PrismaClient } from '@prisma/client';
import FilterTabs from "@/components/FilterTabs";

const prisma = new PrismaClient();
//retrieve tasks from the db
const tasks = await prisma.task.findMany({
    orderBy: { dueDate: 'desc' },
    include: { user: true }
});

export default function Home() {
    return (
        <div className="app-container">
            <header className="header">
                <h1 className="logo">Smart Task</h1>
                <p className="subtitle">Intelligent task management for productive minds</p>
            </header>

            <main>
                <FilterTabs initialTasks={tasks}/>
            </main>
            <footer>
                <p>&copy; Oluwanifemi Ogidama</p>
            </footer>
        </div>
    )};

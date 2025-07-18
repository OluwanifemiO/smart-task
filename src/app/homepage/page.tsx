import '../styles.css';
import {PrismaClient} from '@prisma/client';
import FilterTabs from "@/components/FilterTabs";
import {withAccelerate} from "@prisma/extension-accelerate";
import {loginIsRequiredServer} from "@/lib/auth";
import {SignOutButton} from "@/components/authButtons";

const wait = (ms: number) => new Promise((rs) => setTimeout(rs, ms));

export default async function page() {
    const prisma = new PrismaClient().$extends(withAccelerate());

    await loginIsRequiredServer();

    //retrieve tasks from the db
    const tasks = await prisma.task.findMany({
        orderBy: {dueDate: 'desc'},
        include: {user: true}
    });

    await wait(1000);

    return (
        <>
            {/* Logout button top-right */}
            <SignOutButton />

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
        </>

    )
};

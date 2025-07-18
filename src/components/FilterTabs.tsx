'use client'
import {useState} from "react";
import {Task} from "@prisma/client";
import SmartTaskInput from "@/components/SmartTaskInput";
import TaskModal from "@/components/TaskModal";

type FilterTabsProps = {
    initialTasks: Task[];
};


type FilterType = 'all' | 'pending' | 'completed' | 'high';

export default function FilterTabs({initialTasks}: FilterTabsProps) {

    const [tasks, setTasks] = useState<Task[]>(initialTasks);

    const handleTaskCreated = (newTask: Task) => {
        // Add the new task to the top of the list for immediate feedback
        setTasks(prevTasks => [
            {
                ...newTask,
                dueDate: new Date(newTask.dueDate) // ✅ Convert string to Date
            },
            ...prevTasks
        ]);

    };

    const handleTaskCompleted = async (taskId: number) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}/complete`, {
                method: 'PATCH',
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            const updatedTaskFromServer = await response.json();

            const updatedTask = {
                ...updatedTaskFromServer,
                dueDate: new Date(updatedTaskFromServer.dueDate), // ✅ Ensure it's a Date
            };

            const updatedTasks = tasks.map(task =>
                task.id === taskId ? updatedTask : task
            );

            setTasks(updatedTasks);
        } catch (error) {
            console.error('Error completing task:', error);
            alert('There was an error completing the task. Please try again.');
        }
    };

    //stats calculations
    const totalTasks = tasks.length;
    const numOfCompletedTasks = tasks.filter(task => task.isCompleted).length;
    const pendingTasks: number = totalTasks - numOfCompletedTasks;
    const productivityScore: number = totalTasks === 0 ? 0 : (numOfCompletedTasks / totalTasks) * 100;

    const [currentFilter, setCurrentFilter] = useState<FilterType>('all');

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        switch (currentFilter) {
            case 'pending':
                return !task.isCompleted;
            case 'completed':
                return task.isCompleted;
            case 'high':
                return task.priorityLevel === 'high';
            default:
                return true;
        }
    });

    function formatDueDate(date: Date): string {
        const now = new Date();

        const isToday =
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);

        const isTomorrow =
            date.getDate() === tomorrow.getDate() &&
            date.getMonth() === tomorrow.getMonth() &&
            date.getFullYear() === tomorrow.getFullYear();

        // If it's due in a different year
        const isDifferentYear = date.getFullYear() !== now.getFullYear();

        if (isToday) {
            const timeString = date.toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
            return `Today, ${timeString}`;
        } else if (isTomorrow) {
            const timeString = date.toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
            return `Tomorrow, ${timeString}`;
        } else if (isDifferentYear) {
            return date.toLocaleString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
        } else {
            const weekday = date.toLocaleDateString(undefined, {
                weekday: 'long',
            });
            const timeString = date.toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
            return `${weekday}, ${timeString}`;
        }
    }


    function isPastDue(date: Date): boolean {
        const today = new Date();

        const dueDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
        const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds());

        return dueDate < currentDate;
    }

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentTask, setCurrentTask] = useState<Task | null>(null);


    const handleEdit = async (taskId: number) => {
        const response = await fetch(`/api/tasks/${taskId}`);
        const task = await response.json();

        console.log(task);
        setCurrentTask(task);
        setModalMode('edit');
        setIsModalOpen(true);

    };

    const confirmDelete = async (taskId: number) => {
        const isConfirmed = confirm('Are you sure you want to delete this task?');
        if (isConfirmed) {
            await handleDelete(taskId);
        }
    };

    const handleDelete = async (taskId: number) => {
        try{
            const response = await fetch(`/api/tasks/${taskId}/delete`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete the task');
            }

            // Remove task from local list
            setTasks(prev => prev.filter(task => task.id !== taskId));
            alert('Task deleted successfully');
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('There was an error deleting the task. Please try again.');
        }

    }

    return (
        <>
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-number" id="totalTasks">{totalTasks.toString()}</div>
                    <div className="stat-label">Total Tasks</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number" id="completedTasks">{numOfCompletedTasks.toString()}</div>
                    <div className="stat-label">Completed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number" id="pendingTasks">{pendingTasks.toString()}</div>
                    <div className="stat-label">Pending</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number" id="productivityScore">{productivityScore.toFixed(1).toString()}%</div>
                    <div className="stat-label">Productivity</div>
                </div>
            </div>

            <SmartTaskInput onTaskCreated={handleTaskCreated}/>

            <div className="filter-tabs">
                <button className={`filter-tab ${currentFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setCurrentFilter('all')}>All Tasks
                </button>
                <button className={`filter-tab ${currentFilter === 'pending' ? 'active' : ''}`}
                        onClick={() => setCurrentFilter('pending')}>Pending
                </button>
                <button className={`filter-tab ${currentFilter === 'completed' ? 'active' : ''}`}
                        onClick={() => setCurrentFilter('completed')}>Completed
                </button>
                <button className={`filter-tab ${currentFilter === 'high' ? 'active' : ''}`}
                        onClick={() => setCurrentFilter('high')}>High Priority
                </button>
            </div>

            <div className="tasks-container" id="tasksContainer">
                {
                    filteredTasks.length == 0 ? (
                            <p>There has been an error retrieving the tasks from the database. Try reloading the Prisma
                                database.</p>) :
                        filteredTasks.map(task => (
                            task.isCompleted ?
                                (
                                    <div key={task.id} className="task-item" data-priority={`${task.priorityLevel}`}
                                         data-status="completed">
                                        <div className="task-header">
                                            <div className="task-checkbox checked"></div>
                                            <div className="task-title completed">{task.title}</div>
                                            <div
                                                className={`priority-badge priority-${task.priorityLevel}`}>{task.priorityLevel}</div>
                                        </div>
                                        <div className="task-meta">
                                            <span>Completed</span>
                                            <div className="task-actions">
                                                <button className="action-btn edit-btn" onClick={() => handleEdit(task.id)}>✏️</button>
                                                <button className="action-btn delete-btn" onClick={() => confirmDelete(task.id)}>🗑️</button>
                                            </div>
                                        </div>
                                    </div>
                                ) :
                                (<div key={task.id} className="task-item" data-priority={`${task.priorityLevel}`}
                                      data-status="pending">
                                        <div className="task-header">
                                            <div className="task-checkbox"
                                                 onClick={() => handleTaskCompleted(task.id)}></div>
                                            <div className="task-title">{task.title}</div>
                                            <div
                                                className={`priority-badge priority-${task.priorityLevel}`}>{task.priorityLevel}</div>
                                        </div>
                                        <div className="task-meta">
                                            {
                                                isPastDue(task.dueDate) ?
                                                    (<span
                                                        className="text-red-500">Due: {formatDueDate(task.dueDate)}</span>)
                                                    : (<span>Due: {formatDueDate(task.dueDate)}</span>)
                                            }
                                            <div className="task-actions">
                                                <button className="action-btn edit-btn"
                                                        onClick={() => handleEdit(task.id)}>✏️
                                                </button>
                                                <button className="action-btn delete-btn" onClick={() => confirmDelete(task.id)}>🗑️</button>
                                            </div>
                                        </div>
                                    </div>
                                )
                        ))
                }
            </div>

            <button className="floating-add" onClick={() => {
                setModalMode('create');
                setCurrentTask(null);
                setIsModalOpen(true);
            }}>+</button>

            <TaskModal isTaskModalOpen={isModalOpen}
                       mode={modalMode}
                       task={currentTask}
                       onClose={() => setIsModalOpen(false)}
                       onTaskUpdated={(updatedTask) => {
                           setTasks((prevTasks) => {
                               const exists = prevTasks.find(task => task.id === updatedTask.id);

                               if (exists) {
                                   // ✏️ If the task exists, it means you're editing an existing task
                                   return prevTasks.map(task =>
                                       task.id === updatedTask.id
                                           ? {
                                               ...updatedTask,
                                               dueDate: new Date(updatedTask.dueDate), // ensure correct Date type
                                           }
                                           : task
                                   );
                               } else {
                                   // ➕ If it doesn't exist, it's a new task
                                   return [
                                       {
                                           ...updatedTask,
                                           dueDate: new Date(updatedTask.dueDate), // same here
                                       },
                                       ...prevTasks,
                                   ];
                               }
                           });
                       }}/>
        </>
    )
}
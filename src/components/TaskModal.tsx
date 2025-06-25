'use client'
import {useEffect, useRef, useState} from "react";
import {Task} from "@prisma/client";

export default function TaskModal({ isTaskModalOpen, mode, task, onClose, onTaskUpdated }: {
    isTaskModalOpen: boolean,
    mode: 'create' | 'edit',
    task: Task | null,
    onClose: () => void,
    onTaskUpdated: (task: Task) => void,
}) {
    const formRef = useRef<HTMLFormElement>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priorityLevel, setPriorityLevel] = useState('medium');
    const [dueDate, setDueDate] = useState('');

    useEffect(() => {
        if (mode === 'edit' && task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setPriorityLevel(task.priorityLevel);
            const parsedDate = new Date(task.dueDate);
            setDueDate(parsedDate.toISOString().slice(0, 16));
        } else {
            setTitle('');
            setDescription('');
            setPriorityLevel('medium');
            setDueDate('');
        }
    }, [mode, task]);

    const handleSubmit = async (formData: FormData) => {
        if(mode === 'create') {
            //handleCreate logic goes here. Not using the createTask logic anymore, now using api
            //await createTask(formData);
            await handleCreate(formData);

        }else{
           await handleEdit(formData);
        }
        formRef.current?.reset();
        onClose();
    };

    if (!isTaskModalOpen) return null;

    const handleCreate = async (formData: FormData) => {
        try{
            const response = await fetch(`/api/tasks/create`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to create task');
            }

            const newTask = await response.json();
            onTaskUpdated({
                ...newTask,
                dueDate: new Date(newTask.dueDate)
            });

            alert('Task created successfully');
        }
        catch(error){
            console.error('Error creating task:', error);
            alert('There was an error creating the task. Please try again.');
        }
    }
    
    const handleEdit = async (formData: FormData) => {
        try {
            if (!task) throw new Error("No task selected for editing");

            const response = await fetch(`/api/tasks/${task.id}/edit`, {
                method: 'PUT',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }
            
            const updatedTask = await response.json();
            onTaskUpdated({
                ...updatedTask,
                dueDate: new Date(updatedTask.dueDate)
            });

            alert('Task edited successfully');
        } catch (error) {
            console.error('Error updating task:', error);
            alert('There was an error updating the task. Please try again.');
        }
    };

    return (
        <>
            {/*//Task Modal*/}
            <div className="modal-overlay active scroll" id="taskModal">
                <div className="modal-content">
                    <div className="modal-header">
                        <h2 className="modal-title">{mode === 'create' ? 'Create New Task' : 'Edit Task'}</h2>
                        <button className="close-btn" onClick={onClose}>&times;</button>
                    </div>

                    <form ref={formRef} id="taskForm" action={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="taskTitle">Task Title *</label>
                            <input
                                type="text"
                                id="taskTitle"
                                name="title"
                                className="form-input"
                                placeholder="Enter task title..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="taskDescription">Description</label>
                            <textarea
                                id="taskDescription"
                                name="description"
                                className="form-input form-textarea"
                                placeholder="Add task description (optional)..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="taskPriority">Priority Level *</label>
                            {
                                mode === 'create' ?
                                    (<select id="taskPriority" name="priorityLevel" defaultValue="medium"
                                             className="form-select">
                                        <option value="low">🟢 Low Priority</option>
                                        <option value="medium">🟡 Medium Priority</option>
                                        <option value="high">🔴 High Priority</option>
                                    </select>) :
                                    (<select id="taskPriority" name="priorityLevel" value={priorityLevel}
                                             onChange={(e) => setPriorityLevel(e.target.value)}
                                             className="form-select">
                                        <option value="low">🟢 Low Priority</option>
                                        <option value="medium">🟡 Medium Priority</option>
                                        <option value="high">🔴 High Priority</option>
                                    </select>)
                            }
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="taskDueDate">Due Date & Time *</label>
                            <input
                                type="datetime-local"
                                id="taskDueDate"
                                name="dueDate"
                                className="form-input datetime-input"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="createdTime">Created</label>
                            <input
                                type="text"
                                id="createdTime"
                                name="createdAt"
                                className="form-input created-time-display"
                                disabled
                                value={mode === 'edit' && task ? new Date(task.createdAt).toLocaleString() : 'Auto-generated when task is created'}
                            />
                        </div>

                        <div className="form-buttons">
                            <button type="button" className="btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary">
                                {mode === 'create' ? 'Create Task' : 'Update Task'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

        </>
    )
}
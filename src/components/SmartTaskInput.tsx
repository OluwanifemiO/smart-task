'use client'; // This component will interact with the user, so it's a client component

import {useState, FormEvent} from 'react';
import type {Task} from '@prisma/client'; // Import the generated Task type

// This component expects a function to be passed in to handle the newly created task
interface SmartTaskInputProps {
    onTaskCreated: (newTask: Task) => void;
}

export default function SmartTaskInput({onTaskCreated}: SmartTaskInputProps) {
    const [userInput, setUserInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!userInput.trim()) return;
        console.log('this is what the user entered: ' + userInput);
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/tasks/create-smart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({prompt: userInput}),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Something went wrong');
            }

            const newTask: Task = await response.json();

            // Call the parent component's function to update the UI
            onTaskCreated(newTask);

            // Reset the form
            setUserInput('');

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="input-section">
            <form onSubmit={handleSubmit}>
                <div className="input-container">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="e.g., Plan team meeting for next Tuesday afternoon..."
                        className="task-input"
                        id="taskInput"
                        disabled={isSubmitting}
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting || !userInput.trim()}
                        className="add-btn"
                    >
                        {isSubmitting ? (
                            <div
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            'Add Task'
                        )}
                    </button>
                    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                </div>
            </form>

            <div className="smart-features">
                <div className="feature-chip">🧠 AI Priority Detection</div>
                <div className="feature-chip">📅 Smart Scheduling</div>
                <div className="feature-chip">⚡ Quick Actions</div>
                <div className="feature-chip">📊 Progress Analytics</div>
            </div>
        </div>
    );
}
import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext'; // Using the real context import
import {
    DndContext, closestCorners,
    KeyboardSensor, PointerSensor, useSensor,
    useSensors, DragOverlay
} from '@dnd-kit/core';
import {
    SortableContext, sortableKeyboardCoordinates,
    verticalListSortingStrategy, useSortable, arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- REMOVED MOCK AUTH LOGIC ---


// --- Components ---
const Spinner = ({ small }) => ( // Modified to accept 'small' prop
    <div className={`flex justify-center items-center py-10 ${small ? 'py-0' : ''}`}>
        <div className={`animate-spin rounded-full border-b-2 border-indigo-400 ${small ? 'w-4 h-4 border-2' : 'h-12 w-12'}`}></div>
    </div>
);
const PlusIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg> );
// Modified to accept 'small' prop
const TrashIcon = ({ small }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={small ? "w-4 h-4" : "w-4 h-4"}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg> );
const FilterIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.572a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" /></svg> );
const SearchIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg> );
const PencilIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>);
const CalendarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 inline"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" /></svg>);
const CloseIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const SaveIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>);


// --- Edit Task Modal ---
const EditTaskModal = ({ task, onTaskUpdated, onCancel }) => {
    const [title, setTitle] = useState(task.title || '');
    const [description, setDescription] = useState(task.description || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    // Safely get context value, provide default if null
    const { currentUser } = useContext(AuthContext) || { currentUser: null }; 

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) { setError('Title is required.'); return; }
        setLoading(true); setError('');
        try {
            if (!currentUser || !currentUser.token) {
                setError('Authentication error. Please log in again.');
                setLoading(false);
                return;
            }
            const config = { headers: { Authorization: `Bearer ${currentUser.token}`, 'Content-Type': 'application/json' } };
            const payload = { title, description };
            const response = await axios.patch(`http://localhost:5000/api/tasks/${task._id}`, payload, config);
            
            // --- Pass the *full* updated task from the response ---
            onTaskUpdated(response.data); // This now includes column/status updates
            onCancel();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update task.');
            console.error("Update task error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
            <div className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Edit Task</h3>
                    <button onClick={onCancel} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700"><CloseIcon /></button>
                </div>
                {error && <p className="text-red-500 text-sm mb-3 bg-red-900/30 p-2 rounded">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="editTaskTitle" className="block text-sm font-medium text-slate-300 mb-1">Task Title *</label>
                            <input
                                type="text"
                                id="editTaskTitle"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                                className="w-full bg-slate-700 rounded p-2 border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white"
                           />
                        </div>
                        <div>
                            <label htmlFor="editTaskDesc" className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                            <textarea
                                id="editTaskDesc"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows="3"
                                className="w-full bg-slate-700 rounded p-2 border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white resize-none"
                               ></textarea>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                             <button type="button" onClick={onCancel} className="bg-slate-600 hover:bg-slate-500 text-white font-medium py-2 px-4 rounded-lg transition-colors">Cancel</button>
                             <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
                                 {loading ? 'Saving...' : 'Save Changes'}
                             </button>
                        </div>
                </form>
            </div>
        </div>
    );
};

// --- Add Task Form (Actual) ---
const AddTaskForm = ({ columnId, boardId, workspaceId, onTaskAdded, onCancel }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
     // Safely get context value, provide default if null
    const { currentUser } = useContext(AuthContext) || { currentUser: null };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) { setError('Title is required.'); return; }
        setLoading(true); setError('');
        try {
            if (!currentUser || !currentUser.token) {
                setError('Authentication error. Please log in again.');
                setLoading(false);
                return;
            }
            const config = { headers: { Authorization: `Bearer ${currentUser.token}`, 'Content-Type': 'application/json' } };
            // Send all required IDs to the backend
            const payload = { title, description, columnId, boardId, workspaceId, startDate: new Date() }; 
            
            // --- Ensure this route matches your backend (POST /api/tasks) ---
            const response = await axios.post(`http://localhost:5000/api/tasks`, payload, config);
            
            onTaskAdded(response.data); // Pass the new task back
            onCancel();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create task.');
            console.error("Create task error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
            <div className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Add New Task</h3>
                    <button onClick={onCancel} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700"><CloseIcon /></button>
                </div>
                {error && <p className="text-red-500 text-sm mb-3 bg-red-900/30 p-2 rounded">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="addTaskTitle" className="block text-sm font-medium text-slate-300 mb-1">Task Title *</label>
                        <input
                            type="text"
                            id="addTaskTitle"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            placeholder="e.g., Design homepage mockups"
                            className="w-full bg-slate-700 rounded p-2 border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white"
                       />
                    </div>
                    <div>
                        <label htmlFor="addTaskDesc" className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                        <textarea
                            id="addTaskDesc"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows="3"
                            placeholder="Add more details..."
                            className="w-full bg-slate-700 rounded p-2 border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white resize-none"
                           ></textarea>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                         <button type="button" onClick={onCancel} className="bg-slate-600 hover:bg-slate-500 text-white font-medium py-2 px-4 rounded-lg transition-colors">Cancel</button>
                         <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
                             {loading ? 'Adding...' : 'Add Task'}
                         </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Task Detail Modal ---
const TaskDetailModal = ({ task, workspace, onClose, onUpdateTask, onConfirmDelete, onStartTask, onOpenEdit }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDeleteClick = () => { onConfirmDelete(task); onClose(); };
    const placeholderReopenHandler = () => alert('Reopen task functionality not implemented');

    const handleStartClick = () => { if(onStartTask) { onStartTask(task); onClose(); }};

    const handleEditClick = () => {
        if (onOpenEdit) {
            onOpenEdit(task); // Pass the task to the parent
        } else {
             console.error("onOpenEdit prop is missing");
             alert("Cannot open edit form.");
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg border border-slate-700 relative max-h-[90vh] flex flex-col">
                <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-white"><CloseIcon /></button>
                {loading && <Spinner />}
                {error && <p className="text-red-500 text-center">{error}</p>}
                {task && !loading && (
                    <>
                        <h2 className="text-2xl font-bold text-white mb-4 pr-8">{task.title}</h2>
                        <div className="flex-grow overflow-y-auto pr-2 space-y-5 mb-5">
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
                                {task.startDate && <span><CalendarIcon /> Start: {new Date(task.startDate).toLocaleDateString()}</span>}
                                {task.endDate && <span><CalendarIcon /> End: {new Date(task.endDate).toLocaleDateString()}</span>}
                                <span>Status: <span className="font-medium text-slate-300 capitalize">{task.status || 'todo'}</span></span>
                            </div>
                            {task.description && (
                                <div>
                                    <h4 className="font-semibold text-slate-300 mb-1">Details:</h4>
                                    <p className="text-slate-300 whitespace-pre-wrap">{task.description}</p>
                                </div>
                            )}
                            <div>
                                <h4 className="font-semibold text-slate-300 mb-2">Members:</h4>
                                <div className="space-y-1 text-sm">
                                    <p><strong>Owner:</strong> {workspace?.owner?.username || 'N/A'}</p>
                                    <p><strong>Assigned To:</strong> {task.assignedTo?.username || <span className="italic text-slate-500">Unassigned</span>}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex-shrink-0 pt-4 border-t border-slate-700 flex flex-wrap justify-end gap-3">
                            {(!task.status || task.status === 'todo') && <button onClick={handleStartClick} className="bg-green-600 hover:bg-green-700 text-white font-medium py-1.5 px-4 rounded text-sm">Start Task</button>}
                            
                            <button onClick={handleEditClick} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-4 rounded text-sm">Edit Task</button>
                            
                            {task.status === 'done' && <button onClick={placeholderReopenHandler} className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-1.5 px-4 rounded text-sm">Reopen Task</button>}
                            {task.status === 'done' && <button className="bg-slate-600 hover:bg-slate-500 text-white font-medium py-1.5 px-4 rounded text-sm disabled:opacity-50" disabled>Download Files</button>}
                            
                            <button onClick={handleDeleteClick} className="bg-red-600 hover:bg-red-700 text-white font-medium py-1.5 px-4 rounded text-sm">Delete Task</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// --- Confirm Delete Modal ---
const ConfirmDeleteModal = ({ taskTitle, onCancel, onConfirm, isDeleting }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-sm border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Task?</h3>
            <p className="text-slate-300 mb-6">
                Are you sure you want to delete the task: <strong className="font-medium text-white">{taskTitle}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
                <button type="button" onClick={onCancel} disabled={isDeleting} className="bg-slate-600 hover:bg-slate-500 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
                    Cancel
                </button>
                <button type="button" onClick={onConfirm} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </div>
    </div>
);

// --- NEW: Confirm Delete WORKSPACE Modal ---
const ConfirmDeleteWorkspaceModal = ({ workspaceName, onCancel, onConfirm, isDeleting }) => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[80] p-4 backdrop-blur-md"> {/* Increased z-index */}
        <div className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-slate-600">
            <h3 className="text-xl font-semibold text-red-400 mb-3">Delete Workspace?</h3> {/* Warning color */}
            <p className="text-slate-300 mb-6">
                Are you absolutely sure you want to delete the workspace: <strong className="font-medium text-white">{workspaceName}</strong>?
            </p>
            <p className="text-sm text-amber-400 mb-6 bg-amber-900/30 p-3 rounded border border-amber-700"> {/* Warning box */}
                <strong>Warning:</strong> This action cannot be undone. All boards, columns, and tasks within this workspace will be permanently deleted.
            </p>
            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isDeleting}
                    className="bg-slate-600 hover:bg-slate-500 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 w-36" // Added fixed width for consistency
                >
                    {isDeleting ? (
                         <> <Spinner small={true} /> Deleting... </> // Use small spinner
                    ) : (
                         <> <TrashIcon small={true} /> Confirm Delete </>
                    )}
                </button>
            </div>
        </div>
        {/* Add small spinner variation */}
        <style>{`.spinner-small { width: 1rem; height: 1rem; border-width: 2px; }`}</style>
    </div>
);
// --- END NEW MODAL ---


// --- Enhanced Kanban Components ---
const KanbanTask = ({ task, onTaskClick, onConfirmDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
    const style = { 
        transform: CSS.Transform.toString(transform), 
        transition, 
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 100 : 'auto', 
        boxShadow: isDragging ? '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.08)' : '',
        cursor: 'grab'
    };

    const handleDeleteClick = (e) => {
        e.preventDefault();
        e.stopPropagation(); 
        onConfirmDelete(task); 
    };

    return (
        <div
            ref={setNodeRef} style={style} {...attributes} {...listeners}
            onClick={() => onTaskClick(task)}
            className={`bg-slate-700 p-3 rounded shadow text-sm text-slate-200 hover:bg-slate-600 border border-slate-600 mb-3 touch-none relative`} 
        >
            
            <button
                onClick={handleDeleteClick}
                onMouseDownCapture={(e) => e.stopPropagation()} 
                onTouchStartCapture={(e) => e.stopPropagation()} 
                className="absolute top-2 right-2 p-1 text-slate-500 hover:text-red-400 rounded-full hover:bg-slate-600 transition-colors z-10"
                aria-label="Delete task"
            >
                <TrashIcon small={true} />
            </button>

            <h5 className="font-medium mb-1 pr-6">{task.title}</h5> 
            {task.description && <p className="text-xs text-slate-400 mb-2 line-clamp-2">{task.description}</p>}
             {task.startDate && <p className="text-xs text-slate-500 mt-1"><CalendarIcon /> {new Date(task.startDate).toLocaleDateString()}</p>}
            {task.assignedTo && ( <div className="flex items-center mt-2"><span className="text-xs text-slate-400">Assigned: {task.assignedTo.username}</span></div> )}
        </div>
    );
};

const KanbanColumn = ({ column, tasks, onAddTaskClick, onTaskClick, onConfirmDeleteTask, isOver }) => {
    const taskIds = tasks.map(task => task._id);

    return (
        <div className={`bg-slate-800 p-3 rounded-md w-72 flex-shrink-0 border border-slate-700 flex flex-col transition-colors duration-200 ease-in-out ${isOver ? 'bg-indigo-900/40 border-indigo-600 ring-1 ring-indigo-600' : ''}`}>
            <h4 className="font-semibold text-slate-300 mb-4 px-1 flex-shrink-0">{column.name} ({tasks.length})</h4>

            {column.name.toLowerCase().includes('to do') && (
                 <button
                    onClick={() => onAddTaskClick(column._id)}
                    className="mb-3 w-full flex items-center justify-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 p-2 rounded border border-dashed border-slate-600 hover:border-indigo-500 transition-colors"
                >
                    <PlusIcon /> Add Task
                 </button>
            )}

            <SortableContext id={column._id} items={taskIds} strategy={verticalListSortingStrategy}>
                <div className={`min-h-[100px] flex-grow overflow-y-auto max-h-[60vh] pr-1 rounded`}>
                    {tasks.map((task) => (
                        <KanbanTask
                            key={task._id}
                            task={task}
                            onTaskClick={onTaskClick}
                            onConfirmDelete={onConfirmDeleteTask} 
                        />
                    ))}
                    {tasks.length === 0 && <div className="text-center text-xs text-slate-500 py-4">Drag tasks here</div>}
                </div>
            </SortableContext>
        </div>
    );
};

const KanbanBoard = ({ board, tasks, onAddTaskClick, onTaskClick, onConfirmDeleteTask, searchQuery, setSearchQuery, overColumnId }) => {
    if (!board || !Array.isArray(board.columns)) return <p>Invalid board data.</p>;
    if (!Array.isArray(tasks)) return <p>Invalid tasks data.</p>

    const filteredTasks = useMemo(() => tasks.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
    ), [tasks, searchQuery]);

    const tasksByColumn = useMemo(() => board.columns.reduce((acc, column) => {
        if (!column || !column._id) { return acc; }
        const taskMap = filteredTasks.reduce((map, task) => { 
            map[task._id] = task; 
            return map; 
        }, {});
        
        acc[column._id] = (column.tasks || [])
            .map(taskId => taskMap[taskId]) 
            .filter(Boolean); 

        return acc;
    }, {}), [board.columns, filteredTasks]);


    return (
        <div className="bg-slate-700/50 p-4 rounded-lg shadow mb-6 border border-slate-600">
            <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-xl font-semibold text-white">{board.title}</h3>
            </div>
            
             <div className="px-2 mb-4">
                 <div className="relative">
                     <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                         <SearchIcon />
                     </span>
                     <input 
                         type="text" 
                         placeholder="Search tasks by title or description..." 
                         className="w-full bg-slate-600 text-sm rounded-lg p-2 pl-10 border border-slate-500 focus:border-indigo-500 focus:ring-indigo-500 outline-none text-white placeholder-slate-400"
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                     />
                 </div>
             </div>
            
            <div className="flex space-x-4 overflow-x-auto pb-4 px-2 min-h-[200px]">
                 {board.columns.map(column => (
                    <KanbanColumn
                        key={column._id}
                        column={column}
                        tasks={tasksByColumn[column._id] || []} // Use the correctly ordered tasks
                        onAddTaskClick={onAddTaskClick} 
                        onTaskClick={onTaskClick}
                        onConfirmDeleteTask={onConfirmDeleteTask} 
                        isOver={column._id === overColumnId} 
                    />
                 ))}
            </div>
        </div>
    );
};

// --- NEW: TinyMCE Document Editor Modal ---
const DocumentEditorModal = ({ taskId, taskTitle, onClose }) => {
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-editor-app';
    const docPath = `/artifacts/${appId}/public/data/taskDocuments/${taskId}`;

    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [firebaseReady, setFirebaseReady] = useState(false);
    const [isLoadingContent, setIsLoadingContent] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('Initializing...');
    
    const editorRef = useRef(null); 
    const saveTimeoutRef = useRef(null); 
    const localUpdateRef = useRef(false); 
    const [isTinymceLoaded, setIsTinymceLoaded] = useState(false);
     const firestoreUnsubscribeRef = useRef(null); // Ref to hold unsubscribe function

    // 1. Load TinyMCE script from CDN
    useEffect(() => {
        if (window.tinymce) { setIsTinymceLoaded(true); return; }
        const script = document.createElement('script');
        script.src = "https://cdn.tiny.cloud/1/dczhaw49yryt06og1bijatd6zpx8lw2eu1dtnhckxh5j7wqh/tinymce/8/tinymce.min.js";
        script.referrerPolicy = "origin";
        script.onload = () => setIsTinymceLoaded(true);
        script.onerror = () => setSaveStatus("Error: Failed to load editor");
        document.head.appendChild(script);
        return () => {
            if (script.parentNode) document.head.removeChild(script);
            // Don't remove window.tinymce here, let TinyMCE's internal cleanup handle it
        };
    }, []);

    // 2. Initialize Firebase (Simplified Check)
    useEffect(() => {
        function initializeFirebase() {
             if (!window.firebase || !window.firebase.app || !window.firebase.auth || !window.firebase.firestore) {
                 console.error("Firebase scripts not loaded when trying to initialize.");
                 setSaveStatus("Error: Firebase Missing");
                 setFirebaseReady(false); 
                 return;
             }

            const { initializeApp } = window.firebase.app;
            const { getFirestore } = window.firebase.firestore;
            const { getAuth, signInAnonymously, signInWithCustomToken } = window.firebase.auth;

            if (!initializeApp || !getFirestore || !getAuth || !signInAnonymously || !signInWithCustomToken) {
                console.error("Firebase functions missing.");
                setSaveStatus("Error: Firebase Init Failed");
                 setFirebaseReady(false);
                return;
            }
            setSaveStatus('Initializing Firebase...');
            try {
                const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
                if (!firebaseConfig.apiKey || !firebaseConfig.projectId) { 
                    throw new Error("Firebase config invalid (missing apiKey or projectId)."); 
                }
                const appName = `doc-editor-${taskId}-${Date.now()}`;
                const apps = window.firebase.app.getApps();
                const app = apps.find(a => a.name === appName) || initializeApp(firebaseConfig, appName);
                const firestoreDb = getFirestore(app);
                const firestoreAuth = getAuth(app);
                setDb(firestoreDb); setAuth(firestoreAuth);

                const signIn = async () => {
                    setSaveStatus('Authenticating...');
                    try {
                        const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
                        if (token && firestoreAuth.currentUser?.uid !== token) {
                            await signInWithCustomToken(firestoreAuth, token);
                        } else if (!firestoreAuth.currentUser) {
                            await signInAnonymously(firestoreAuth);
                        }
                        setUserId(firestoreAuth.currentUser?.uid || `anon_${Date.now()}`);
                        setFirebaseReady(true); 
                        setSaveStatus('Loading Document...');
                    } catch (error) {
                        console.error("Firebase sign-in error:", error);
                        setSaveStatus('Error: Auth failed');
                        setFirebaseReady(false);
                    }
                };
                signIn();
            } catch (error) {
                console.error("Error initializing Firebase:", error);
                setSaveStatus(`Error: ${error.message || 'FB Init'}`);
                setFirebaseReady(false);
            }
        }
        
        if (window.firebase) {
            initializeFirebase();
        } else {
             console.warn("Firebase object not found on window immediately.");
             setSaveStatus("Error: Firebase Missing");
        }

    }, [taskId]); 

    // 3. Initialize TinyMCE Editor and Firestore Listener
    useEffect(() => {
        if (!firebaseReady || !isTinymceLoaded || !db || !userId) { return; } 

        if (!window.firebase || !window.firebase.firestore) {
             console.error("Firestore functions missing for listener.");
             setSaveStatus("Error: FB Func Missing");
             return;
        }
        const { doc, onSnapshot, setDoc, serverTimestamp } = window.firebase.firestore;
        if (!doc || !onSnapshot || !setDoc || !serverTimestamp) {
             console.error("Specific Firestore functions missing for listener.");
             setSaveStatus("Error: FB Func Missing");
             return;
        }
        
        // Target ID for the textarea
        const editorId = `tinymce-editor-${taskId}`;

        window.tinymce.init({
            selector: `#${editorId}`, // Use the ID
            skin: "oxide-dark",
            content_css: "dark",
            plugins: 'autoresize lists link image table code help wordcount',
            toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link image | code | help',
            menubar: false,
            statusbar: false,
            autoresize_bottom_margin: 20,
            height: "100%",
            readonly: false, // Explicitly set readonly to false
             init_instance_callback: (editor) => { 
                 console.log("TinyMCE initialized. Setting up listener.");
                 editorRef.current = editor; 
                 setIsLoadingContent(true);
                 setSaveStatus('Loading Document...');
                 
                 const docRef = doc(db, docPath); 

                 // Store the unsubscribe function in the ref
                 firestoreUnsubscribeRef.current = onSnapshot(docRef, (docSnap) => {
                     setIsLoadingContent(false);
                     // Check if editor still exists before interacting
                     if (!editorRef.current) return; 

                     if (docSnap.exists()) {
                         const data = docSnap.data();
                         const firestoreContent = data.content || '';
                         
                         if (!localUpdateRef.current && editorRef.current.getContent() !== firestoreContent) {
                             console.log("Loading content from Firestore...");
                             editorRef.current.setContent(firestoreContent);
                         }
                         localUpdateRef.current = false; 
                         setSaveStatus('Saved');
                     } else {
                         console.log("Document does not exist, initializing...");
                         const initialContent = `<h1>${taskTitle}</h1><p>Start editing...</p>`;
                         if(editorRef.current) { editorRef.current.setContent(initialContent); }
                         
                         if(serverTimestamp) { 
                             setDoc(docRef, {
                                 content: initialContent, 
                                 createdAt: serverTimestamp(),
                                 lastUpdated: serverTimestamp(),
                                 taskId: taskId,
                             }).then(() => setSaveStatus('Saved'))
                               .catch(error => { console.error("Error initializing doc:", error); setSaveStatus('Error: Init failed'); });
                         } else {
                             console.error("serverTimestamp function missing!");
                             setSaveStatus('Error: FB Func Missing');
                         }
                     }
                 }, (error) => {
                     console.error("Firestore snapshot error:", error);
                     setSaveStatus('Error: Sync failed');
                     setIsLoadingContent(false);
                 });


                 // Setup change listener
                 editor.on('change keyup', () => {
                     if (!editorRef.current) return; 
                     localUpdateRef.current = true; 
                     const newContent = editorRef.current.getContent();
                     
                     setIsSaving(true);
                     setSaveStatus('Saving...');
                     if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
                     
                     saveTimeoutRef.current = setTimeout(() => {
                         saveDocumentContent(newContent);
                     }, 1000); 
                 });

             },
            setup: (editor) => {
                // Remove the 'remove' event listener from setup, handle in cleanup
            }
        });

        // Cleanup function for this effect
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            
             // Call unsubscribe if it exists in the ref
            if (firestoreUnsubscribeRef.current) {
                console.log("Unsubscribing from Firestore listener during cleanup.");
                firestoreUnsubscribeRef.current();
                firestoreUnsubscribeRef.current = null; // Clear the ref
            }

            // Remove the specific TinyMCE editor instance
            const editorInstance = window.tinymce?.get(editorId);
            if (editorInstance) {
                console.log("Removing TinyMCE editor instance:", editorId);
                editorInstance.remove(); // Use instance remove
            }
            editorRef.current = null; // Clear the ref
        };
    // Re-run ONLY if these core dependencies change
    }, [firebaseReady, isTinymceLoaded, db, userId, taskId, docPath, taskTitle]); 

    // 4. Save Function (remains the same)
    const saveDocumentContent = async (newContent) => {
        if (!db || !userId) return;

        if (!window.firebase || !window.firebase.firestore) {
            console.error("Firestore functions not available for saving.");
            setSaveStatus('Error: FB Func Missing'); return;
        }
        const { setDoc, serverTimestamp, doc } = window.firebase.firestore;
        if (!setDoc || !serverTimestamp || !doc) {
            console.error("Firestore save functions missing.");
            setSaveStatus('Error: FB Func Missing'); return;
        }

        setIsSaving(true);
        setSaveStatus('Saving...');
        const docRef = doc(db, docPath); 
        try {
            await setDoc(docRef, {
                content: newContent, 
                lastUpdated: serverTimestamp(),
                updatedBy: userId
            }, { merge: true });
            setSaveStatus('Saved');
            console.log("Document content saved.");
        } catch (error) {
            console.error("Error saving document content:", error);
            setSaveStatus('Error: Save failed');
        } finally {
            setIsSaving(false);
            if(saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl h-[85vh] flex flex-col border border-slate-700 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-white truncate pr-4">{taskTitle || 'Document Editor'}</h2>
                    <div className='flex items-center space-x-2'>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${ saveStatus === 'Saved' ? 'bg-green-700 text-green-100' : saveStatus.startsWith('Saving') ? 'bg-yellow-700 text-yellow-100 animate-pulse' : saveStatus.startsWith('Error') ? 'bg-red-700 text-red-100' : 'bg-slate-600 text-slate-200' }`}>
                           {saveStatus}
                        </span>
                        <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700"><CloseIcon /></button>
                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex-grow overflow-hidden relative">
                    {(!firebaseReady || !isTinymceLoaded || isLoadingContent) && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-800">
                            <Spinner />
                            <span className="ml-2 text-slate-400">{saveStatus}</span>
                        </div>
                    )}
                    {/* Unique ID for the textarea */}
                    <textarea 
                        id={`tinymce-editor-${taskId}`} 
                        // Start hidden, let TinyMCE reveal it
                        className={`w-full h-full opacity-0`} 
                    /> 
                </div>
            </div>
        </div>
    );
};




// --- Main Workspace Page ---
const WorkspacePage = () => {
    // --- USING REAL CONTEXT AND HOOKS ---
    const { workspaceId } = useParams(); 
    const { currentUser, logout } = useContext(AuthContext) || {}; // Add fallback for preview
    const navigate = useNavigate(); 
    
    // --- END CONTEXT HANDLING ---


    // State variables remain the same...
    const [workspace, setWorkspace] = useState(null);
    const [boards, setBoards] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTask, setActiveTask] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [selectedColumnIdForNewTask, setSelectedColumnIdForNewTask] = useState(null);
    const [newBoardName, setNewBoardName] = useState("");
    const [isCreatingBoard, setIsCreatingBoard] = useState(false);
    const [createBoardError, setCreateBoardError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [overColumnId, setOverColumnId] = useState(null);
    const [editingTask, setEditingTask] = useState(null); // Task object for the DOC EDITOR
    const [taskToEdit, setTaskToEdit] = useState(null); // Task object for the EDIT MODAL
    const [showDeleteWorkspaceConfirm, setShowDeleteWorkspaceConfirm] = useState(false); // NEW: Workspace delete confirm state
    const [isDeletingWorkspace, setIsDeletingWorkspace] = useState(false); // NEW: Workspace deleting state


    // --- Fetching Logic (Updated for Preview Handling) ---
    useEffect(() => {
        let isMounted = true; 
        const fetchWorkspaceData = async () => {
             // Check for currentUser existence before accessing token
             if (!currentUser || !currentUser.token ) { 
                 console.warn("No valid auth token. Redirecting.");
                 if (isMounted) { 
                     setError('Authentication error. Please log in.'); 
                     setLoading(false); 
                     if (logout) {
                         logout(); 
                     } else if(navigate) { 
                         navigate('/login'); 
                     } else { 
                         window.location.href = '/login'; 
                     }
                 } 
                 return; // Stop fetching
             }

             // Proceed with fetch only if we have a real token
             if (isMounted) { setLoading(true); setError(''); }
             try {
                 const config = { headers: { Authorization: `Bearer ${currentUser.token}` } }; 
                 const wsResponse = await axios.get(`http://localhost:5000/api/workspaces/${workspaceId}`, config);
                 if (!isMounted) return; 
                 setWorkspace(wsResponse.data); 
                 const boardsResponse = await axios.get(`http://localhost:5000/api/workspaces/${workspaceId}/boards`, config);
                 if (!isMounted) return; 
                 const fetchedBoards = boardsResponse.data;
                 setBoards(fetchedBoards);
                 if (fetchedBoards.length > 0) {
                     const taskPromises = fetchedBoards.map(board =>
                         axios.get(`http://localhost:5000/api/workspaces/${workspaceId}/boards/${board._id}/tasks`, config)
                              .catch(err => { console.error(`Task fetch failed for ${board._id}:`, err); return { data: [] }; })
                     );
                     const taskResults = await Promise.all(taskPromises);
                     if (!isMounted) return; 
                     const allTasks = taskResults.flatMap(result => result.data);
                     setTasks(allTasks); 
                 } else {
                     if (isMounted) setTasks([]);
                 }
             } catch (err) {
                 if (!isMounted) return;
                 console.error("Fetch error object:", err);
                 if ((err.response?.status === 401 || err.response?.status === 403) && logout) {
                     console.error("Auth error:", err.response?.data?.message); 
                     logout(); 
                     setError('Session expired or invalid. Please log in.');
                 } else if (err.response?.status === 401 || err.response?.status === 403) {
                     console.error("Auth error - logout fn missing:", err.response?.data?.message);
                     setError('Authentication error.'); 
                     if(navigate) navigate('/login'); else window.location.href = '/login'; 
                 } else {
                    setError(err.response?.data?.message || 'Failed to fetch workspace data.'); 
                 }
             } finally {
                 if (isMounted) setLoading(false);
             }
        };
        fetchWorkspaceData();
        return () => { isMounted = false; };
    }, [workspaceId, currentUser, logout, navigate]); 


    // --- DND Handlers ---
    const sensors = useSensors( 
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), 
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }) 
    );

    function handleDragStart(event) { 
        const { active } = event; 
        const task = tasks.find(t => t._id === active.id); 
        setActiveTask(task); 
        setOverColumnId(null); 
    }

    function handleDragOver(event) {
        const { active, over } = event;
        if (!over) { setOverColumnId(null); return; }
        if (active.id === over.id) { setOverColumnId(null); return; }

        let currentOverColumnId = null;
        const overIsColumn = boards.flatMap(b => b.columns).some(c => c._id === over.id);
        const overIsTask = tasks.some(t => t._id === over.id);

        if (overIsColumn) {
            currentOverColumnId = over.id;
        } else if (overIsTask) {
            const task = tasks.find(t => t._id === over.id);
            currentOverColumnId = task?.column;
        }
        
        if (overColumnId !== currentOverColumnId) {
             setOverColumnId(currentOverColumnId);
        }
    }


    function handleDragCancel() {
        setActiveTask(null);
        setOverColumnId(null);
    }
    
    // --- NEW HELPER: Find column by name (case-insensitive) ---
    const findColumnByName = (board, name) => {
         if (!board || !board.columns) return null;
         const lowerName = name.toLowerCase();
         return board.columns.find(col => col.name.toLowerCase().includes(lowerName));
    };

    // --- NEW HELPER: Reusable Task Move Function (for DND and Auto-Move) ---
    const moveTaskAndUpdateState = async (taskToMove, newColumnId, newIndex) => {
        if (!taskToMove || !newColumnId) return;

        const sourceColumnId = taskToMove.column;
        const sourceBoard = boards.find(b => b._id === taskToMove.board);
        
        if (!sourceBoard) {
             console.error("Could not find source board for task move.");
             return;
        }
         // Prevent unnecessary moves if already in the correct column
         if (sourceColumnId.toString() === newColumnId.toString()) {
             console.log("Task is already in the destination column.");
             // If it's an auto-move (indicated by newIndex 0), just update status
             if (newIndex === 0) {
                 const taskInState = tasks.find(t => t._id === taskToMove._id);
                 if (taskInState && taskInState.status !== 'inprogress') {
                      // Optimistically update status if it's 'todo'
                     setTasks(currentTasks => currentTasks.map(t =>
                         t._id === taskToMove._id ? { ...t, status: 'inprogress' } : t
                     ));
                     // Note: We might still want to hit the backend just to update status
                     // For now, we just return if column is same
                 }
             }
             return; 
        }

        const oldIndex = sourceBoard.columns.find(c => c._id.toString() === sourceColumnId.toString())?.tasks.indexOf(taskToMove._id);
        if (oldIndex === -1 || oldIndex === undefined) {
             console.error("Could not find task in source column's task list.");
             // Don't return, allow backend to try and fix, but log
        }

        // --- Store Previous State for Revert ---
        const previousBoards = boards;
        const previousTasks = tasks;

        // --- Optimistic UI Updates ---
        // 1. Update 'tasks' state (changes column ID and status)
        let newStatus = 'todo'; // Default
        const destColForStatus = sourceBoard.columns.find(c => c._id.toString() === newColumnId.toString());
         if (destColForStatus) {
             const colName = destColForStatus.name.toLowerCase();
             if (colName.includes('in progress')) newStatus = 'inprogress';
             else if (colName.includes('done')) newStatus = 'done';
             else if (colName.includes('to do')) newStatus = 'todo';
         }

        setTasks(currentTasks => currentTasks.map(t =>
            t._id === taskToMove._id ? { ...t, column: newColumnId, status: newStatus } : t
        ));

        // 2. Update 'boards' state (removes from old col, adds to new col)
        setBoards(currentBoards => {
            return currentBoards.map(board => {
                if (board._id !== sourceBoard._id) return board;

                const newColumns = board.columns.map(col => {
                    let newTasks = [...(col.tasks || [])]; 

                    // Remove from old column
                    if (col._id.toString() === sourceColumnId.toString()) {
                        newTasks = newTasks.filter(id => id.toString() !== taskToMove._id.toString());
                    }
                    
                    // Add to new column
                    if (col._id.toString() === newColumnId.toString()) {
                         // Ensure it's not already there
                         if (!newTasks.some(id => id.toString() === taskToMove._id.toString())) {
                            const finalIndex = Math.min(newIndex, newTasks.length);
                            newTasks.splice(finalIndex, 0, taskToMove._id); 
                         }
                    }
                    return { ...col, tasks: newTasks }; 
                });
                return { ...board, columns: newColumns }; 
            });
        });

        // --- Backend API Call ---
        if (!currentUser || !currentUser.token) {
             console.error("Cannot move task: Authentication error.");
             setTasks(previousTasks); // Revert
             setBoards(previousBoards); // Revert
             return;
         }
         const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
         try {
             const response = await axios.patch(`http://localhost:5000/api/tasks/${taskToMove._id}/move`, {
                 newColumnId: newColumnId,
                 newIndex: newIndex,
                 sourceColumnId: sourceColumnId
             }, config);
             
             // --- FIX 2: Call handleUpdateTaskState with the authoritative response ---
             // This ensures both tasks and boards state are updated correctly based on server
             console.log("Move successful, updating state from server response.");
             handleUpdateTaskState(response.data.task); 
             
         } catch (err) {
             console.error("Failed to save task move, reverting UI:", err);
             // Revert UI on Error
             setTasks(previousTasks);
             setBoards(previousBoards);
             // Optionally show an error message to the user
             alert("Failed to move task. Please try again.");
         }
    };
    
    // --- DRAG AND DROP FIX (Req 2) ---
    function handleDragEnd(event) {
        const { active, over } = event;
        setActiveTask(null);
        setOverColumnId(null); 

        if (!over || active.id === over.id) return; 

        // --- 1. Find Task, Board, and Columns ---
        const sourceTask = tasks.find(t => t._id === active.id);
        if (!sourceTask) return;
        const sourceColumnId = sourceTask.column;
        const sourceBoard = boards.find(b => b.columns.some(c => c._id.toString() === sourceColumnId.toString()));
        if (!sourceBoard) {
             console.error("DND Error: Could not find source board.");
             return;
        }


        const overId = over.id;
        let destinationColumnId = null;
        let newIndex = 0; 
        
        // Find destination column and calculate index
        const overTask = tasks.find(t => t._id === overId);
        const overColumn = sourceBoard.columns.find(c => c._id === overId); // Check if over.id is a column

        if (overTask) { // Dropped ON a TASK
            destinationColumnId = overTask.column;
            const destColState = sourceBoard.columns.find(c => c._id.toString() === destinationColumnId.toString());
            if (!destColState) { console.error("DND Error: Could not find dest col state (dropped on task)."); return; }
            newIndex = destColState.tasks.indexOf(overId);
            if (newIndex === -1) newIndex = destColState.tasks.length; 
        } else if (overColumn) { // Dropped ON a COLUMN 
            destinationColumnId = overColumn._id;
            newIndex = overColumn.tasks.length; 
        } else {
             console.warn("DND Warning: Dropped on invalid area.");
            return; // Dropped somewhere invalid
        }

        if (!destinationColumnId) {
             console.error("DND Error: Could not determine destination column ID.");
             return;
        }

        // --- Use the reusable move function ---
        // moveTaskAndUpdateState handles optimistic updates, API call, and state sync on response
        moveTaskAndUpdateState(sourceTask, destinationColumnId, newIndex);
    }



    // --- Modal Handlers ---
    const getTasksForBoard = (boardId) => tasks.filter(task => task.board === boardId);
    const handleOpenTaskModal = (task) => setSelectedTask(task);
    const handleCloseTaskModal = () => setSelectedTask(null);
    const handleOpenAddTaskModal = (columnId) => { setSelectedColumnIdForNewTask(columnId); setIsAddTaskModalOpen(true); };
    const handleCloseAddTaskModal = () => { setSelectedColumnIdForNewTask(null); setIsAddTaskModalOpen(false); };


    // --- Task State Update Handlers ---
    // --- FIX 2 (Drag and Drop / State Sync) ---
    // This function now correctly updates BOTH tasks and boards state
     const handleUpdateTaskState = (updatedTask) => {
         let sourceColumnId = null;
         const oldTask = tasks.find(t => t._id === updatedTask._id);
         if (oldTask) {
             sourceColumnId = oldTask.column;
         } else {
             // This might be a new task update (e.g. from create), find its board/col info
             sourceColumnId = updatedTask.column; // Assume it hasn't moved *yet*
         }


         // 1. Update the main 'tasks' array (or add if new)
         setTasks(prev => {
             const taskExists = prev.some(t => t._id === updatedTask._id);
             if (taskExists) {
                 return prev.map(t => t._id === updatedTask._id ? updatedTask : t);
             } else {
                 return [...prev, updatedTask]; // Add if not found
             }
         });


         // 2. If the column changed, update the 'boards' array
         if (sourceColumnId && updatedTask.column && updatedTask.board &&
             sourceColumnId.toString() !== updatedTask.column.toString()) {
             
             console.log(`Task ${updatedTask._id} moved columns. Updating boards state.`);
             
             setBoards(prevBoards => prevBoards.map(board => {
                 // Find the board this task belongs to
                 if (board._id.toString() !== updatedTask.board.toString()) {
                     return board; 
                 }

                 const newColumns = board.columns.map(col => {
                     let newTasks = [...(col.tasks || [])]; 

                     // Remove from old column
                     if (col._id.toString() === sourceColumnId.toString()) {
                         newTasks = newTasks.filter(id => id.toString() !== updatedTask._id.toString());
                     }
                     
                     // Add to new column (at the top/index 0 for simplicity, DND handles specific index)
                     if (col._id.toString() === updatedTask.column.toString()) {
                         // Only add if it's not already there
                         if (!newTasks.some(id => id.toString() === updatedTask._id.toString())) {
                             newTasks.unshift(updatedTask._id); // Add to top
                         }
                     }
                     return { ...col, tasks: newTasks };
                 });
                 return { ...board, columns: newColumns };
             }));
         }
         // --- FIX for tasks added, but not yet in board state ---
         else if (updatedTask.column && updatedTask.board) {
             setBoards(prevBoards => prevBoards.map(board => {
                 if (board._id.toString() !== updatedTask.board.toString()) {
                     return board;
                 }
                 const newColumns = board.columns.map(col => {
                     if (col._id.toString() === updatedTask.column.toString()) {
                         const newTasks = [...(col.tasks || [])];
                         if (!newTasks.some(id => id.toString() === updatedTask._id.toString())) {
                             console.log(`Adding new task ${updatedTask._id} to board state.`);
                             newTasks.unshift(updatedTask._id);
                         }
                         return { ...col, tasks: newTasks };
                     }
                     return col;
                 });
                 return { ...board, columns: newColumns };
             }));
         }


         // 3. Update detail modal if it's open
         if (selectedTask?._id === updatedTask._id) {
             setSelectedTask(updatedTask); 
         }
     };

     const handleDeleteTaskState = (deletedTaskId, columnId) => {
         setTasks(prev => prev.filter(t => t._id !== deletedTaskId));
         setBoards(prevBoards => {
             return prevBoards.map(board => {
                 if (!board.columns) return board; 
                 
                 const colIndex = board.columns.findIndex(c => c && c._id === columnId);
                 if (colIndex === -1) return board; 

                 const newBoard = { ...board, columns: [...board.columns] }; 
                 const newCol = { ...newBoard.columns[colIndex] }; 
                 newCol.tasks = (newCol.tasks || []).filter(id => id !== deletedTaskId); 
                 newBoard.columns[colIndex] = newCol; 
                 
                 return newBoard; 
             });
         });
     };
    
    // --- Board Creation Handler ---
    const handleCreateBoard = async (e) => {
        e.preventDefault();
        setCreateBoardError(""); 
        if (!newBoardName.trim()) {
            setCreateBoardError("Board name is required.");
            return;
        }
        setIsCreatingBoard(true);
        try {
             // Ensure currentUser and token are valid
            if (!currentUser || !currentUser.token) {
                setCreateBoardError('Authentication error. Please log in again.');
                setIsCreatingBoard(false);
                return;
            }
            const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
            const response = await axios.post(
                `http://localhost:5000/api/workspaces/${workspaceId}/boards`,
                { title: newBoardName },
                config
            );
            
            setBoards(prevBoards => [...prevBoards, response.data]);
            setNewBoardName(""); 

        } catch (err) {
            setCreateBoardError(err.response?.data?.message || 'Failed to create board.');
            console.error("Create board error:", err);
        } finally {
            setIsCreatingBoard(false);
        }
    };

    // --- Delete Task Handlers ---
     const handleOpenDeleteConfirm = (task) => {
        setTaskToDelete(task);
    };

    const handleCloseDeleteConfirm = () => {
        setTaskToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!taskToDelete) return;
        
        setIsDeleting(true);

        const taskInState = tasks.find(t => t._id === taskToDelete._id);
        const columnId = taskInState ? taskInState.column : taskToDelete.column;
        
        if (!columnId) {
            alert("Error: Could not find task column. Please refresh.");
            setIsDeleting(false);
            handleCloseDeleteConfirm();
            return;
        }

        try {
             // Ensure currentUser and token are valid
            if (!currentUser || !currentUser.token) {
                alert('Authentication error. Please log in again.');
                setIsDeleting(false);
                handleCloseDeleteConfirm();
                return;
            }
            const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
            await axios.delete(`http://localhost:5000/api/tasks/${taskToDelete._id}`, config);
            
            handleDeleteTaskState(taskToDelete._id, columnId); 
            handleCloseDeleteConfirm();
        } catch (err) {
            console.error('Failed to delete task:', err);
            alert(err.response?.data?.message || "Failed to delete task.");
            handleCloseDeleteConfirm();
        } finally {
            setIsDeleting(false);
        }
    };

    // --- Editor Modal Handlers ---
    // --- FIX 3 (Auto-move on Edit) ---
    const handleOpenEditor = (task) => {
        if (!task || !task._id) {
            console.error("Task data is missing for editor.");
            return;
        }

        // --- NEW LOGIC ---
        // Find the task's current board and column
        const sourceBoard = boards.find(b => b._id === task.board);
        if (!sourceBoard) {
             console.error("Cannot find board for this task. Opening editor without move.");
             setEditingTask(task); // Open editor anyway
             return;
        }
        const sourceColumn = sourceBoard.columns.find(c => c._id.toString() === task.column.toString());
        if (!sourceColumn) {
             console.error("Cannot find source column for this task. Opening editor without move.");
             setEditingTask(task); // Open editor anyway
             return;
        }

        // Check if the task is in a "To Do" column
        if (sourceColumn.name.toLowerCase().includes('to do')) {
             // Find the first "In Progress" column on the same board
            const destColumn = findColumnByName(sourceBoard, 'in progress');
            
            if (destColumn && destColumn._id.toString() !== sourceColumn._id.toString()) {
                 console.log(`Task '${task.title}' is in 'To Do'. Moving to 'In Progress'...`);
                 // Move task to the top (index 0) of the "In Progress" column
                 moveTaskAndUpdateState(task, destColumn._id, 0);
                 
                 // Update the task object in memory *before* passing to modal
                 // (This is optimistic, moveTaskAndUpdateState will handle the real update)
                 const updatedTaskForModal = { ...task, column: destColumn._id, status: 'inprogress' };
                 setEditingTask(updatedTaskForModal); // Open modal with the updated task object
                 return; // Exit
            } else if (!destColumn) {
                 console.warn("Could not find an 'In Progress' column to move task to.");
            } else if (destColumn && destColumn._id.toString() === sourceColumn._id.toString()) {
                 // Task is already in 'In Progress', but status might be 'todo'
                 // Let's just update the status optimistically and in the backend
                 console.log("Task already in 'In Progress', updating status.");
                 moveTaskAndUpdateState(task, destColumn._id, 0); // This will handle status update
                 const updatedTaskForModal = { ...task, status: 'inprogress' };
                 setEditingTask(updatedTaskForModal);
                 return;
            }
        }
        // --- END NEW LOGIC ---

        // If not in "To Do" or no "In Progress" column found, just open the editor
        setEditingTask(task);
    };
    const handleCloseEditor = () => { setEditingTask(null); };

    // --- Edit Modal Handlers ---
     const handleOpenEditModal = (task) => {
        setTaskToEdit(task);
        setSelectedTask(null); // Close detail modal when opening edit modal
    };
    const handleCloseEditModal = () => {
        setTaskToEdit(null);
    };


    // --- NEW: Workspace Delete Handlers ---
    const handleOpenDeleteWorkspaceConfirm = () => {
        setShowDeleteWorkspaceConfirm(true);
    };
    const handleCloseDeleteWorkspaceConfirm = () => {
        setShowDeleteWorkspaceConfirm(false);
    };
    const handleConfirmDeleteWorkspace = async () => {
        if (!workspace || !workspace._id) {
            console.error("Workspace data not loaded, cannot delete.");
            return;
        }
        
        setIsDeletingWorkspace(true);
        try {
            // Ensure currentUser and token are valid
            if (!currentUser || !currentUser.token ) {
                alert('Authentication error. Please log in again.');
                setIsDeletingWorkspace(false);
                handleCloseDeleteWorkspaceConfirm();
                return;
            }
            const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
            // IMPORTANT: Ensure your backend has this route: DELETE /api/workspaces/:workspaceId
            await axios.delete(`http://localhost:5000/api/workspaces/${workspaceId}`, config);
            
            // Use a simple alert for now. Replace with a modal/toast if you prefer.
            alert('Workspace deleted successfully.'); 
            
            handleCloseDeleteWorkspaceConfirm();
            navigate('/dashboard'); // Redirect to dashboard after deletion
        } catch (err) {
            console.error('Failed to delete workspace:', err);
            // Use alert for errors too (replace with better UI later)
            alert(err.response?.data?.message || "Failed to delete workspace.");
            handleCloseDeleteWorkspaceConfirm();
        } finally {
            setIsDeletingWorkspace(false);
        }
    };
    // --- END NEW HANDLERS ---

    // --- Render Logic ---
    return (
        <div className="min-h-screen bg-slate-900 text-white p-8 font-inter">
             <header className="mb-8 flex flex-wrap justify-between items-start gap-y-4">
                 <div className="flex flex-col gap-1">
                     <Link to="/dashboard" className="text-indigo-400 hover:underline text-sm mb-1">&larr; Back to Workspaces</Link>
                     <h1 className="text-3xl font-bold text-white">
                         {/* Show loading state or workspace name */}
                         {loading ? 'Loading...' : (workspace ? workspace.name : 'Workspace')}
                     </h1>
                     {/* Conditionally render owner only if workspace exists */}
                     {workspace?.owner?.username && ( <p className="text-xs text-slate-400"> Owner: {workspace.owner.username} </p> )}
                 </div>
                 <div className="flex items-center space-x-4">
                     {/* Use optional chaining for username */}
                     <span className="text-slate-300 text-sm">Hi, {currentUser?.user?.username || 'User'}!</span>
                     {/* Ensure logout function exists */}
                     {logout && <button onClick={logout} className="text-indigo-400 hover:underline text-sm">Logout</button>}
                     
                     {/* --- NEW DELETE WORKSPACE BUTTON --- */}
                     {/* Show only if workspace is loaded and user is owner */}
                     {!loading && workspace && currentUser && workspace.owner._id === currentUser.user._id && ( 
                         <button
                             onClick={handleOpenDeleteWorkspaceConfirm}
                             className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1.5 px-3 rounded-md flex items-center gap-1 transition-colors"
                             title="Delete Workspace"
                         >
                            <TrashIcon small={true} /> Delete Workspace
                         </button>
                     )}
                     {/* --- END DELETE BUTTON --- */}
                 </div>
             </header>

            {loading && <Spinner />}
            {/* Display error message only if not loading */}
            {error && !loading && <p className="text-red-500 text-center py-6">{error}</p>} 

             {/* Render Kanban board structure even if not loading and no critical error */}
            {!loading && !error && ( 
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onDragCancel={handleDragCancel}
                 >
                    <div>
                        {/* Check if boards data exists before mapping */}
                        {/* Use optional chaining on boards as well for safety */}
                        {boards?.length > 0 ? (
                            boards.map(board => (
                                <KanbanBoard
                                    key={board._id}
                                    board={board}
                                    tasks={tasks.filter(t => t.board === board._id)}
                                    onAddTaskClick={handleOpenAddTaskModal}
                                    onTaskClick={handleOpenTaskModal}
                                    onConfirmDeleteTask={handleOpenDeleteConfirm}
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    overColumnId={overColumnId}
                                />
                            ))
                        ) : ( 
                            // Show create board form only if not loading and no critical error
                           !loading && !error && ( // Keep this condition simple
                             <div className="text-center py-10 px-6 bg-slate-800 rounded-lg max-w-md mx-auto border border-slate-700">
                                <h3 className="text-lg font-semibold text-white mb-4">No boards yet</h3>
                                <p className="text-slate-400 mb-6">Create your first board to start organizing tasks.</p>
                                <form onSubmit={handleCreateBoard} className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={newBoardName}
                                        onChange={(e) => setNewBoardName(e.target.value)}
                                        placeholder="e.g., 'Project Phoenix'"
                                        className="flex-grow bg-slate-700 rounded p-2 border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white"
                                    />
                                    <button type="submit" disabled={isCreatingBoard} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
                                        {isCreatingBoard ? 'Creating...' : 'Create'}
                                    </button>
                                </form>
                                {createBoardError && <p className="text-red-500 text-sm mt-2">{createBoardError}</p>}
                             </div>
                           )
                        )}
                    </div>
                    <DragOverlay>{ activeTask ? ( <KanbanTask task={activeTask} onTaskClick={()=>{}} onConfirmDelete={()=>{}} /> ) : null }</DragOverlay>
                </DndContext>
            )}

            {/* Modals remain the same */}
            {isAddTaskModalOpen && selectedColumnIdForNewTask && boards && boards.length > 0 && (
                <AddTaskForm
                    columnId={selectedColumnIdForNewTask}
                    boardId={boards[0]._id} // Assumes first board
                    workspaceId={workspaceId} 
                    onTaskAdded={handleUpdateTaskState} // --- FIX: Use handleUpdateTaskState to add new tasks
                    onCancel={handleCloseAddTaskModal}
                />
            )}

            {selectedTask && workspace && (
                <TaskDetailModal
                    task={selectedTask}
                    workspace={workspace}
                    onClose={handleCloseTaskModal}
                    onUpdateTask={handleUpdateTaskState}
                    onConfirmDelete={handleOpenDeleteConfirm}
                    onStartTask={handleOpenEditor} 
                    onOpenEdit={handleOpenEditModal} 
                />
            )}

            {taskToDelete && (
                <ConfirmDeleteModal
                    taskTitle={taskToDelete.title}
                    onCancel={handleCloseDeleteConfirm}
                    onConfirm={handleConfirmDelete}
                    isDeleting={isDeleting}
                />
            )}

            {/* --- NEW WORKSPACE DELETE CONFIRM MODAL --- */}
            {showDeleteWorkspaceConfirm && workspace && (
                <ConfirmDeleteWorkspaceModal
                    workspaceName={workspace.name}
                    onCancel={handleCloseDeleteWorkspaceConfirm}
                    onConfirm={handleConfirmDeleteWorkspace}
                    isDeleting={isDeletingWorkspace}
                />
            )}
            {/* --- END NEW MODAL --- */}


            {editingTask && (
                 <DocumentEditorModal 
                    taskId={editingTask._id}
                    taskTitle={editingTask.title}
                    onClose={handleCloseEditor}
                 />
            )}
            
            {taskToEdit && (
                <EditTaskModal
                    task={taskToEdit}
                    onTaskUpdated={handleUpdateTaskState} 
                    onCancel={handleCloseEditModal}
                />
            )}

        </div>
    );
};

export default WorkspacePage;


import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
    DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor,
    useSensors, DragOverlay
} from '@dnd-kit/core';
import {
    SortableContext, sortableKeyboardCoordinates,
    verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Components ---
const Spinner = () => (
    <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
    </div>
);
const KanbanTask = ({ task }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 10 : 'auto' };
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`bg-slate-700 p-3 rounded shadow text-sm text-slate-200 cursor-grab active:cursor-grabbing border border-slate-600 mb-3 touch-none`}>
            <h5 className="font-medium mb-1">{task.title}</h5>
            {task.description && <p className="text-xs text-slate-400 mb-2">{task.description}</p>}
            {task.assignedTo && (<div className="flex items-center mt-2"><span className="text-xs text-slate-400">Assigned: {task.assignedTo.username}</span></div>)}
        </div>
    );
};
const KanbanColumn = ({ column, tasks }) => {
    const taskIds = tasks.map(task => task._id);
    return (
        <div className="bg-slate-800 p-3 rounded-md w-72 flex-shrink-0 border border-slate-700 flex flex-col">
            <h4 className="font-semibold text-slate-300 mb-4 px-1 flex-shrink-0">{column.name}</h4>
            <SortableContext id={column._id} items={taskIds} strategy={verticalListSortingStrategy}>
                <div className={`min-h-[100px] flex-grow overflow-y-auto max-h-96 pr-1 rounded space-y-3`}>
                    {tasks.map((task) => (<KanbanTask key={task._id} task={task} />))}
                    {tasks.length === 0 && <div className="text-center text-xs text-slate-500 py-4">Drag tasks here or add new</div>}
                </div>
            </SortableContext>
        </div>
    );
};
const KanbanBoard = ({ board, tasks }) => {
    // --- Added Checks ---
    if (!board) return <p className="text-red-400">Error: Board data is null.</p>;
    if (!Array.isArray(board.columns)) { console.error("Board columns is not an array:", board.columns); return <p className="text-red-400">Error: Invalid board columns structure.</p>; }
    if (!Array.isArray(tasks)) { console.error("Tasks prop is not an array:", tasks); return <p className="text-red-400">Error: Invalid tasks structure.</p>; }
    // --- END CHECKS ---
    const tasksByColumn = board.columns.reduce((acc, column) => {
        if (!column || !column._id) { console.error("Invalid column found:", column); return acc; }
        const orderedTaskIds = column.tasks || [];
        acc[column._id] = tasks
            .filter(task => task && task.column === column._id)
            .sort((a, b) => {
                const indexA = orderedTaskIds.indexOf(a._id); const indexB = orderedTaskIds.indexOf(b._id);
                if (indexA === -1 && indexB === -1) return 0; if (indexA === -1) return 1; if (indexB === -1) return -1;
                return indexA - indexB;
            });
        return acc;
    }, {});
    return (
        <div className="bg-slate-700/50 p-4 rounded-lg shadow mb-6 border border-slate-600">
            <h3 className="text-xl font-semibold mb-4 text-white px-2">{board.title}</h3>
            <div className="flex space-x-4 overflow-x-auto p-2 min-h-[200px]">
                 {board.columns.map(column => (<KanbanColumn key={column._id} column={column} tasks={tasksByColumn[column._id] || []} />))}
            </div>
        </div>
    );
};
// --- END Components ---

const WorkspacePage = () => {
    const { workspaceId } = useParams();
    const { currentUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [workspace, setWorkspace] = useState(null);
    const [boards, setBoards] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTask, setActiveTask] = useState(null);

    // --- Fetching Logic ---
    useEffect(() => {
        let isMounted = true; // Flag to prevent state update on unmounted component
        const fetchWorkspaceData = async () => {
             if (!currentUser || !currentUser.token) { if (isMounted) { setError('Authentication error.'); setLoading(false); } return; }
             if (isMounted) { setLoading(true); setError(''); }
             const originalBoards = boards; const originalTasks = tasks;
             try {
                const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
                const [wsResponse, boardsResponse] = await Promise.all([
                    axios.get(`http://localhost:5000/api/workspaces/${workspaceId}`, config),
                    axios.get(`http://localhost:5000/api/workspaces/${workspaceId}/boards`, config),
                ]);

                if (!isMounted) return; // Don't update state if component unmounted

                console.log("Fetched Workspace:", wsResponse.data); // LOG
                setWorkspace(wsResponse.data);

                const fetchedBoards = boardsResponse.data;
                console.log("Fetched Boards:", fetchedBoards); // LOG
                setBoards(fetchedBoards);

                if (fetchedBoards.length > 0) {
                    const taskPromises = fetchedBoards.map(board =>
                        axios.get(`http://localhost:5000/api/boards/${board._id}/tasks`, config)
                            .catch(err => { console.error(`Failed task fetch board ${board._id}:`, err); return { data: [] }; })
                    );
                    const taskResults = await Promise.all(taskPromises);
                    if (!isMounted) return; // Check again after async task fetch
                    const allTasks = taskResults.flatMap(result => result.data);
                    console.log("Fetched Tasks:", allTasks); // LOG
                    setTasks(allTasks);
                } else {
                    if (isMounted) setTasks([]);
                     console.log("No boards found, setting tasks to empty."); // LOG
                }

            } catch (err) {
                 if (!isMounted) return;
                 console.error("Fetch error object:", err); // Log the full error
                 setBoards(originalBoards); setTasks(originalTasks);
                 if (err.response?.status === 401 || err.response?.status === 403) {
                     console.error("Auth error:", err.response?.data?.message); logout(); navigate('/login'); setError('Session expired. Please log in.');
                 } else {
                    setError(err.response?.data?.message || 'Failed to fetch workspace data.'); console.error("Fetch error:", err);
                 }
            } finally {
                if (isMounted) setLoading(false);
                console.log("Fetching finished, loading set to false"); // LOG
            }
        };
        fetchWorkspaceData();

        return () => { isMounted = false; }; // Cleanup function to set flag on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workspaceId, currentUser]); // Keep dependencies minimal

    // --- DND Setup & Handlers ---
    const sensors = useSensors( useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates, }) );
    function handleDragStart(event) { const { active } = event; const task = tasks.find(t => t._id === active.id); setActiveTask(task); }
    function handleDragEnd(event) {
        const { active, over } = event;
        setActiveTask(null);

        if (over && active.id !== over.id) {
            const sourceTask = tasks.find(t => t._id === active.id);
            if (!sourceTask) return;
            const sourceColumnId = sourceTask.column;
            const destinationColumnId = over.id; // Correct for @dnd-kit SortableContext ID

             const sourceBoard = boards.find(b => b.columns.some(c => c._id === sourceColumnId));
             const destBoard = boards.find(b => b.columns.some(c => c._id === destinationColumnId));

            if (!sourceBoard || !destBoard || sourceBoard._id !== destBoard._id) { return; }
            const sourceColumn = sourceBoard.columns.find(c => c._id === sourceColumnId);
            const destColumn = destBoard.columns.find(c => c._id === destinationColumnId);
            if (!sourceColumn || !destColumn) { return; }

             // Store previous state for potential revert
             const previousBoards = JSON.parse(JSON.stringify(boards)); // Deep copy
             const previousTasks = JSON.parse(JSON.stringify(tasks));   // Deep copy

             let newIndex = 0; // Initialize newIndex

            // --- Optimistic UI Update ---
            setBoards(prevBoards => {
                /* ... existing optimistic board update logic ... */
                const activeBoardIndex = prevBoards.findIndex(b => b._id === sourceBoard._id);
                if (activeBoardIndex === -1) return prevBoards;
                const activeBoard = prevBoards[activeBoardIndex];
                const sourceColIndex = activeBoard.columns.findIndex(c => c._id === sourceColumnId);
                const destColIndex = activeBoard.columns.findIndex(c => c._id === destinationColumnId);
                if (sourceColIndex === -1 || destColIndex === -1) return prevBoards;

                const sourceItems = [...activeBoard.columns[sourceColIndex].tasks];
                const destItems = sourceColumnId === destinationColumnId ? sourceItems : [...activeBoard.columns[destColIndex].tasks];
                const activeIndex = sourceItems.indexOf(active.id);
                if (activeIndex === -1) return prevBoards;

                sourceItems.splice(activeIndex, 1); // Remove from source

                // Calculate insertion index in destination
                const overItemId = over.id;
                let overItemIndex = destItems.indexOf(overItemId);
                // Adjust index calculation based on @dnd-kit's 'over' object properties if needed
                // This logic might need refinement depending on where 'over.id' comes from (task vs column)
                // Assuming over.id is the ID of the item *being hovered over* or the column ID
                const isOverTask = tasks.some(t=> t._id === overItemId);
                if (isOverTask) {
                    // Find index of the task being hovered over
                    overItemIndex = destItems.indexOf(overItemId);
                } else if (overItemId === destinationColumnId) {
                     // Dropped directly onto the column (e.g., empty list)
                     overItemIndex = destItems.length; // Add to end
                } else {
                     // Fallback, might need better logic
                     overItemIndex = destItems.length;
                }

                destItems.splice(overItemIndex, 0, active.id); // Insert at correct index
                newIndex = overItemIndex; // Store calculated index for backend

                const newBoards = [...prevBoards];
                newBoards[activeBoardIndex] = {
                    ...activeBoard,
                    columns: activeBoard.columns.map((col, index) => {
                        if (index === sourceColIndex) return { ...col, tasks: sourceItems };
                        if (index === destColIndex) return { ...col, tasks: destItems };
                        return col;
                    }),
                };
                return newBoards;
            });
            setTasks(prevTasks => prevTasks.map(t =>
                t._id === active.id ? { ...t, column: destinationColumnId } : t
            ));

            // --- Backend API Call ---
            // Now make the actual API call
            const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
            axios.patch(`http://localhost:5000/api/tasks/${active.id}/move`, {
                newColumnId: destinationColumnId,
                newIndex: newIndex, // Send the calculated index
                sourceColumnId: sourceColumnId
            }, config)
            .then(response => {
                console.log("Task move saved:", response.data.message);
                // Update task state with potentially updated data from backend (like updatedAt)
                setTasks(prev => prev.map(t => t._id === response.data.task._id ? response.data.task : t));
            })
            .catch(err => {
                console.error("Failed to save task move:", err);
                alert("Error saving task position. Reverting changes.");
                // --- Revert UI on Error ---
                setBoards(previousBoards);
                setTasks(previousTasks);
            });
        }
    }
    const getTasksForBoard = (boardId) => tasks.filter(task => task.board === boardId);

    // --- NEW: Console Logs for Rendering ---
    console.log("Rendering WorkspacePage:", { loading, error, workspace: workspace !== null, boardsLength: boards.length });

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8 font-inter">
             <header className="mb-8 flex justify-between items-center">
                 <div>
                    <Link to="/dashboard" className="text-indigo-400 hover:underline mb-2 block">&larr; Back to Workspaces</Link>
                    <h1 className="text-3xl font-bold text-white">{workspace ? workspace.name : (loading? 'Loading...' : 'Workspace')}</h1>
                 </div>
                 <div>
                      <span className="mr-4 text-slate-300">Hi, {currentUser?.user?.username || 'User'}!</span>
                      <button onClick={logout} className="text-red-500 hover:underline">Logout</button>
                 </div>
             </header>

            {/* --- Log values right before conditional rendering --- */}
            {console.log("Checking conditions:", { loading, error, hasWorkspace: !!workspace })}

            {loading && <Spinner />}
            {error && <p className="text-red-500 text-center py-6">{error}</p>}

            {!loading && !error && workspace && (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div>
                        {boards.length > 0 ? (
                            boards.map(board => (
                                <KanbanBoard key={board._id} board={board} tasks={getTasksForBoard(board._id)} />
                            ))
                        ) : (
                            <p className="text-slate-400 text-center py-6">No boards found in this workspace yet. Create one!</p>
                            // TODO: Add button/form to create first board
                        )}
                    </div>
                    <DragOverlay>{activeTask ? <KanbanTask task={activeTask} /> : null}</DragOverlay>
                </DndContext>
            )}

            {/* NEW: Added a fallback message if content doesn't render */}
            {!loading && !error && !workspace && (
                 <p className="text-yellow-500 text-center py-6">Workspace data finished loading but is unavailable.</p>
            )}
        </div>
    );
};

export default WorkspacePage;


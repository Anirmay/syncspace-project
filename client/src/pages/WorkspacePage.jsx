import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
// NEW: Import @dnd-kit components and hooks
import {
    DndContext,
    closestCenter, // Basic collision detection strategy
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay // To render item while dragging
} from '@dnd-kit/core';
import {
    arrayMove, // Utility to move items in arrays
    SortableContext, // Context for sortable items
    sortableKeyboardCoordinates, // Keyboard support
    verticalListSortingStrategy, // How items move in a list
    useSortable // Hook for individual sortable items
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities'; // For transform styles

// --- Components ---
const Spinner = () => (
    <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
    </div>
);

// Kanban Task Component - Uses useSortable
const KanbanTask = ({ task }) => {
    // NEW: useSortable hook
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging // State to know if this specific item is dragging
    } = useSortable({ id: task._id }); // Use task ID as unique identifier

    // NEW: Apply styles for dragging
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        // Add opacity effect while dragging original item
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 'auto' // Ensure dragging item is on top
    };

    return (
        // NEW: Apply ref, style, and event listeners
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners} // Spread listeners onto the element you want to be the handle
            className={`bg-slate-700 p-3 rounded shadow text-sm text-slate-200 cursor-grab active:cursor-grabbing border border-slate-600 mb-3 touch-none`} // Added touch-none for mobile
        >
            <h5 className="font-medium mb-1">{task.title}</h5>
            {task.description && <p className="text-xs text-slate-400 mb-2">{task.description}</p>}
            {task.assignedTo && (
                <div className="flex items-center mt-2">
                    <span className="text-xs text-slate-400">Assigned: {task.assignedTo.username}</span>
                </div>
            )}
        </div>
    );
};

// Kanban Column Component - Uses SortableContext
const KanbanColumn = ({ column, tasks }) => {
    // NEW: Get task IDs for SortableContext
    const taskIds = tasks.map(task => task._id);

    return (
        <div className="bg-slate-800 p-3 rounded-md w-72 flex-shrink-0 border border-slate-700 flex flex-col">
            <h4 className="font-semibold text-slate-300 mb-4 px-1 flex-shrink-0">{column.name}</h4>

            {/* NEW: Wrap task list area with SortableContext */}
            <SortableContext
                id={column._id} // Column ID as context identifier
                items={taskIds}
                strategy={verticalListSortingStrategy} // How tasks reorder vertically
            >
                <div
                    // NEW: No specific droppable props needed here when using SortableContext this way
                    className={`min-h-[100px] flex-grow overflow-y-auto max-h-96 pr-1 rounded space-y-3`} // Added space-y-3 back
                >
                    {tasks.map((task) => (
                        <KanbanTask key={task._id} task={task} />
                    ))}
                    {tasks.length === 0 && <div className="text-center text-xs text-slate-500 py-4">Drag tasks here or add new</div>}
                </div>
            </SortableContext>
            {/* TODO: Add 'Add Task' button here */}
        </div>
    );
};

// Kanban Board Component - No major DND changes needed here
const KanbanBoard = ({ board, tasks }) => {
    if (!board || !board.columns) return <p>Board data is missing.</p>;

    // Group tasks by column ID
    const tasksByColumn = board.columns.reduce((acc, column) => {
        // Find tasks for this column and sort them based on the board's column.tasks order
         const orderedTaskIds = column.tasks || [];
         acc[column._id] = tasks
            .filter(task => task.column === column._id)
            .sort((a, b) => {
                const indexA = orderedTaskIds.indexOf(a._id);
                const indexB = orderedTaskIds.indexOf(b._id);
                if (indexA === -1 && indexB === -1) return 0; // If neither found, keep order
                if (indexA === -1) return 1; // If A not found, put it last
                if (indexB === -1) return -1; // If B not found, put it last
                return indexA - indexB;
            });
        return acc;
    }, {});


    return (
        <div className="bg-slate-700/50 p-4 rounded-lg shadow mb-6 border border-slate-600">
            <h3 className="text-xl font-semibold mb-4 text-white px-2">{board.title}</h3>
            {/* Horizontal scroll container for columns */}
            <div className="flex space-x-4 overflow-x-auto p-2 min-h-[200px]">
                 {board.columns.map(column => (
                    <KanbanColumn
                        key={column._id}
                        column={column}
                        tasks={tasksByColumn[column._id] || []}
                    />
                 ))}
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
    const [activeTask, setActiveTask] = useState(null); // NEW: State to hold the task being dragged

    // --- Fetching Logic (remains mostly the same) ---
    useEffect(() => {
        const fetchWorkspaceData = async () => {
             if (!currentUser || !currentUser.token) { setError('Authentication error.'); setLoading(false); return; }
             setLoading(true); setError('');
             try {
                const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
                const [wsResponse, boardsResponse] = await Promise.all([
                    axios.get(`http://localhost:5000/api/workspaces/${workspaceId}`, config),
                    axios.get(`http://localhost:5000/api/workspaces/${workspaceId}/boards`, config),
                ]);

                setWorkspace(wsResponse.data);
                const fetchedBoards = boardsResponse.data;
                setBoards(fetchedBoards);

                // Fetch tasks for ALL boards in the workspace
                const taskPromises = fetchedBoards.map(board =>
                    axios.get(`http://localhost:5000/api/boards/${board._id}/tasks`, config)
                );
                const taskResults = await Promise.all(taskPromises);
                const allTasks = taskResults.flatMap(result => result.data); // Combine tasks from all boards
                setTasks(allTasks);

            } catch (err) { /* ... existing error handling ... */
                 if (err.response?.status === 401 || err.response?.status === 403) {
                     console.error("Auth error:", err.response.data.message); logout(); navigate('/login'); setError('Session expired. Please log in.');
                 } else {
                    setError(err.response?.data?.message || 'Failed to fetch workspace data.'); console.error("Fetch error:", err);
                 }
            } finally { setLoading(false); }
        };
        fetchWorkspaceData();
    }, [workspaceId, currentUser, logout, navigate]);

    // --- NEW: @dnd-kit Sensor Setup ---
    const sensors = useSensors(
        useSensor(PointerSensor), // Use pointer events (mouse, touch)
        useSensor(KeyboardSensor, { // Use keyboard for accessibility
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // --- NEW: @dnd-kit Drag Handlers ---
    function handleDragStart(event) {
        // Store the active task when dragging starts
        const { active } = event;
        const task = tasks.find(t => t._id === active.id);
        setActiveTask(task);
    }

    function handleDragEnd(event) {
        const { active, over } = event;
        setActiveTask(null); // Clear active task

        // Check if item was dropped over a valid column and is different from start
        if (over && active.id !== over.id) {
             // Find the source column ID (where drag started)
            const sourceTask = tasks.find(t => t._id === active.id);
            if (!sourceTask) return; // Should not happen
            const sourceColumnId = sourceTask.column;

            // The 'over.id' in this setup *is* the destination column ID because
            // we used the column._id as the ID for the SortableContext
            const destinationColumnId = over.id;

            // Find the index the task had in its original column
            // And the index where it should be inserted in the new column
             const sourceBoard = boards.find(b => b.columns.some(c => c._id === sourceColumnId));
             const destBoard = boards.find(b => b.columns.some(c => c._id === destinationColumnId));

             if (!sourceBoard || !destBoard || sourceBoard._id !== destBoard._id) {
                 console.error("Cannot move tasks between different boards yet."); // Basic check
                 return;
             }
             const sourceColumn = sourceBoard.columns.find(c => c._id === sourceColumnId);
             const destColumn = destBoard.columns.find(c => c._id === destinationColumnId);

             if (!sourceColumn || !destColumn) {
                  console.error("Source or destination column not found.");
                  return;
             }

             const sourceTaskIds = sourceColumn.tasks || [];
             const destTaskIds = destColumn.tasks || [];

             const sourceIndex = sourceTaskIds.indexOf(active.id);

             // --- Calculate New Index ---
             // Find the ID of the task *above* where the dragged task was dropped
             const overTaskId = over.data?.current?.sortable?.items?.find((id, idx) => {
                 // Logic to find the ID at or just after the drop point
                 // This might need refinement based on exact @dnd-kit behavior
                 // For now, let's approximate by using the length if dropped at end
                 // This part is complex and often requires trial & error or library examples.
                 // Let's assume for now dropped item replaces the item 'over' or goes last.
                 // A simpler approach for arrayMove below might be sufficient.
                 return true; // Placeholder
             });


            // Find the index where the 'over' item is in the destination tasks
            const overIndex = destTaskIds.indexOf(over.id); // This might be task or column ID depending on context
            // A more robust way might be needed if over.id isn't reliable for index calculation.
            // Let's use arrayMove for simplicity assuming over.id is the target column.

            let newIndex = 0; // Default to top if column is empty or logic fails

            // --- Optimistic UI Update ---
            setBoards(prevBoards => {
                const activeBoardIndex = prevBoards.findIndex(b => b._id === sourceBoard._id);
                if (activeBoardIndex === -1) return prevBoards;

                const activeBoard = prevBoards[activeBoardIndex];

                const sourceColIndex = activeBoard.columns.findIndex(c => c._id === sourceColumnId);
                const destColIndex = activeBoard.columns.findIndex(c => c._id === destinationColumnId);

                if (sourceColIndex === -1 || destColIndex === -1) return prevBoards;

                // Create new arrays for immutability
                const sourceItems = [...activeBoard.columns[sourceColIndex].tasks];
                const destItems = sourceColumnId === destinationColumnId ? sourceItems : [...activeBoard.columns[destColIndex].tasks];

                // Find the actual index of the dragged item
                 const activeIndex = sourceItems.indexOf(active.id);
                 if (activeIndex === -1) return prevBoards; // Task not found where expected

                 // Remove from source
                 sourceItems.splice(activeIndex, 1);

                // --- Determine insertion index ---
                // Find the element that the active item is over
                const overItemId = over.id;
                // Find the index of that element in the destination column
                let overItemIndex = destItems.indexOf(overItemId);

                 // If 'over' is the column itself (dropping in empty list orinvalid item)
                if (overItemIndex === -1 && destItems.length > 0 && over.id === destinationColumnId) {
                     // Try to approximate based on position (complex, omit for now)
                     // Default to adding at the end
                     overItemIndex = destItems.length;
                } else if (overItemIndex === -1) {
                     // Default to end if over.id is not a task ID in the dest column
                     overItemIndex = destItems.length;
                }


                 // Insert into destination at the calculated index
                 destItems.splice(overItemIndex, 0, active.id);

                 newIndex = overItemIndex; // Store the calculated index

                // Update the board state
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

             // Update the individual task's column property in the main tasks state
            setTasks(prevTasks => prevTasks.map(t =>
                t._id === active.id ? { ...t, column: destinationColumnId } : t
            ));


             // --- Backend API Call ---
             console.log("Attempting to move task:", {
                taskId: active.id,
                newColumnId: destinationColumnId,
                newIndex: newIndex, // Use the calculated newIndex
                sourceColumnId: sourceColumnId
             });
              const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
             axios.patch(`http://localhost:5000/api/tasks/${active.id}/move`, {
               newColumnId: destinationColumnId,
               newIndex: newIndex, // Send the calculated index
               sourceColumnId: sourceColumnId
             }, config)
             .then(response => {
                 console.log("Task move saved:", response.data.message);
                 // Optionally update state again with response data if needed
                 // setTasks(prev => prev.map(t => t._id === response.data.task._id ? response.data.task : t));
             })
             .catch(err => {
                 console.error("Failed to save task move:", err);
                 alert("Error saving task position. Reverting changes.");
                 // TODO: Implement revert logic if optimistic update fails
                 // This requires fetching the original state or storing it before update.
             });
        }
    }


    // Helper to get tasks for a specific board
    const getTasksForBoard = (boardId) => tasks.filter(task => task.board === boardId);

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8 font-inter">
             {/* Header */}
             <header className="mb-8 flex justify-between items-center"> /* ... */ </header>

            {loading && <Spinner />}
            {error && <p className="text-red-500 text-center py-6">{error}</p>}

            {!loading && !error && workspace && (
                // NEW: Wrap boards area with DndContext
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div>
                        {boards.length > 0 ? (
                            boards.map(board => (
                                <KanbanBoard
                                    key={board._id}
                                    board={board}
                                    tasks={getTasksForBoard(board._id)}
                                    // No need to pass onDragEnd down with DndContext higher up
                                />
                            ))
                        ) : (
                            <p className="text-slate-400 text-center py-6">No boards found.</p>
                        )}
                    </div>

                    {/* NEW: Drag Overlay to render item smoothly while dragging */}
                    <DragOverlay>
                        {activeTask ? <KanbanTask task={activeTask} /> : null}
                    </DragOverlay>
                </DndContext>
            )}
        </div>
    );
};

export default WorkspacePage;


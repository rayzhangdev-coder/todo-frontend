import React, { useState, useEffect, useRef } from 'react';
import { generateKeyBetween } from 'fractional-indexing';
import { v4 as uuidv4 } from 'uuid'; // Ensure you've run: npm install uuid
import styles from './TodoDashboard.module.css';

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>
);

const base_url = "https://ray-todo-api.onrender.com/todos";

export default function TodoY() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [isHovering, setIsHovering] = useState(false);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);
  
  // State for the UUID session
  const [sessionId, setSessionId] = useState("");

  const containerRef = useRef(null); 
  const textareaRef = useRef(null); 
  const isFirstLoadRef = useRef(true); 
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [overIndex, setOverIndex] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragWidth, setDragWidth] = useState(0);
  const scrollRef = useRef(null);
  const lastClickTime = useRef(0); 
  const mouseDownTimeRef = useRef(0);

  // Helper to get common headers
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sessionId}` // Matches your backend's authenticateSession middleware
  });

  const stopAllInteractions = () => {
    setEditingId(null);
    setDraggedItem(null);
    setDraggedIndex(null);
    setOverIndex(null);
  };

  // --- Session Initialization ---
  useEffect(() => {
    let currentSessionId = localStorage.getItem("my-todo-session-id");
    if (!currentSessionId) {
      currentSessionId = uuidv4();
      localStorage.setItem("my-todo-session-id", currentSessionId);
    }
    setSessionId(currentSessionId);
  }, []);

  // --- API Calls ---
  const fetchTodos = async (sid) => {
    try {
      const res = await fetch(`${base_url}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${sid}` }
      });

      if (res.status === 401) {
        console.error("Session unauthorized. Try clearing localStorage.");
        return;
      }

      if (!res.ok) throw new Error(`HTTP ERROR! Status: ${res.status}`);
      const JSONdata = await res.json();
      setTasks(JSONdata);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) fetchTodos(sessionId);
  }, [sessionId]);

  // --- Operations (Create, Update, Delete) ---
  async function addTask(e) {
    if (e.key === 'Enter' && newTask.trim() !== "") {
      const taskText = newTask;
      const tempId = `temp-${Date.now()}`; 
      
      const optimisticTask = {
        id: tempId,
        task: taskText,
        completed: false,
        orderString: tasks[0]?.orderString ? generateKeyBetween(null, tasks[0].orderString) : 'a0', 
        isPending: true 
      };

      setTasks(prev => [optimisticTask, ...prev]);
      setNewTask("");

      try {
        const res = await fetch(base_url, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ task: taskText })
        });
        if (!res.ok) throw new Error();
        const savedTask = await res.json();
        setTasks(prev => prev.map(t => t.id === tempId ? savedTask : t));
      } catch (err) {
        setTasks(prev => prev.filter(t => t.id !== tempId));
        setNewTask(taskText);
        alert("Couldn't add task.");
      }
    }
  }

  async function toggleTask(todo) {
    const originalTasks = [...tasks];
    setTasks(prev => prev.map(t => t.id === todo.id ? { ...t, completed: !t.completed } : t));

    try {
      const res = await fetch(`${base_url}/${todo.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          task: todo.task,
          completed: !todo.completed,
          orderString: todo.orderString
        })
      });
      if (!res.ok) throw new Error();
    } catch (err) {
      setTasks(originalTasks);
    }
}

  const saveEdit = async (todo) => {
    if (!editingId) return;
    const currentText = editText.trim();
    stopAllInteractions();

    if (currentText === "") {
      deleteTask(todo.id);
    } else {
      const originalTasks = [...tasks];
      setTasks(prev => prev.map(t => t.id === todo.id ? { ...t, task: editText } : t));
      try {
        const res = await fetch(`${base_url}/${todo.id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({
            task: editText,
            completed: todo.completed,
            orderString: todo.orderString
          })
        });
        if (!res.ok) throw new Error();
      } catch (err) {
        setTasks(originalTasks);
      }
    }
  };

  const deleteTask = async (id) => {
    const originalTasks = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      const res = await fetch(`${base_url}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${sessionId}` }
      });
      if (!res.ok) throw new Error();
    } catch (err) {
      setTasks(originalTasks);
    }
  };

  const moveTask = async (from, to) => {
    if (from === to || (from < to && from === to - 1)) return;
    const oldTasks = [...tasks]; 
    const newTasks = [...tasks];
    const [movedItem] = newTasks.splice(from, 1);
    const adjustedTo = from < to ? to - 1 : to;
    const prevItem = newTasks[adjustedTo - 1];
    const nextItem = newTasks[adjustedTo]; 

    const newOrderString = generateKeyBetween(
      prevItem ? prevItem.orderString : null,
      nextItem ? nextItem.orderString : null
    );

    const updatedItem = { ...movedItem, orderString: newOrderString };
    newTasks.splice(adjustedTo, 0, updatedItem);
    setTasks(newTasks);

    try {
      const response = await fetch(`${base_url}/${movedItem.id}/position`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ newOrderString }),
      });
      if (!response.ok) throw new Error();
    } catch (err) {
      setTasks(oldTasks);
      fetchTodos(sessionId);
    }
  };

  // --- Scroll & Double Click Logic (Unchanged) ---
  const handleSmoothDoubleClick = (task) => {
    const pressDuration = Date.now() - mouseDownTimeRef.current;
    if (pressDuration > 200) { lastClickTime.current = 0; return; }
    const currentTime = Date.now();
    const timeSinceLastClick = currentTime - lastClickTime.current;
    if (timeSinceLastClick < 800 && timeSinceLastClick > 0) {
      startEditing(task);
      lastClickTime.current = 0;
    } else { lastClickTime.current = currentTime; }
  };

  const startEditing = (task) => {
    isFirstLoadRef.current = true;
    setEditingId(task.id);
    setEditText(task.task); 
  };

  const handleKeyDown = (e, task) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(task); }
    if (e.key === 'Escape') setEditingId(null);
  };

  useEffect(() => {
    if (editingId && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      if (isFirstLoadRef.current) {
        const length = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(length, length);
        isFirstLoadRef.current = false;
      }
    }
  }, [editText, editingId]);

  useEffect(() => {
    const updateThumb = () => {
      if (!containerRef.current) return;
      const { scrollHeight, clientHeight } = containerRef.current;
      setThumbHeight(scrollHeight > clientHeight ? (clientHeight / scrollHeight) * clientHeight : 0);
    };
    updateThumb();
    window.addEventListener('resize', updateThumb);
    return () => window.removeEventListener('resize', updateThumb);
  }, [tasks]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    setThumbTop((scrollTop / scrollHeight) * clientHeight);
  };

  const onMouseDown = (e, index) => {
    if (editingId || e.target.tagName === 'INPUT' || e.target.closest('button')) return;
    mouseDownTimeRef.current = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    setDraggedItem(tasks[index]);
    setDraggedIndex(index);
    setOverIndex(index);
    setDragWidth(rect.width);
    setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // --- Drag Effects (Unchanged Logic) ---
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (draggedIndex === null) return;
      setMousePos({ x: e.clientX, y: e.clientY });
      const items = containerRef.current.querySelectorAll('[data-drag-item="true"]');
      let newOverIndex = tasks.length;
      for (let i = 0; i < items.length; i++) {
        const itemRect = items[i].getBoundingClientRect();
        if (e.clientY < itemRect.top + itemRect.height / 2) { newOverIndex = i; break; }
      }
      setOverIndex(newOverIndex);
    };
    const handleMouseUp = () => {
      if (draggedIndex !== null && overIndex !== null) moveTask(draggedIndex, overIndex);
      setDraggedIndex(null); setDraggedItem(null); setOverIndex(null);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [draggedIndex, overIndex, tasks]);

  // --- Render ---
  return (
    <div className={styles.homepage}>
      <div className={styles['header-container']}>
        <h1>To-do List</h1>
        <span className={styles['v2-tag']}>v2.0</span>
      </div>

      <span id={styles.author}>by Ray Zhang</span>

      <div className={styles['input-section']}>
        <input 
          type="text" 
          placeholder="Enter task here..." 
          disabled={isLoading}
          style={{ cursor: isLoading ? 'not-allowed' : 'text' }}
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={addTask} 
        />
      </div>

      {draggedItem && (
        <div 
          className={styles['drag-layer']} 
          style={{ left: mousePos.x - offset.x + 20, top: mousePos.y - offset.y, width: dragWidth }}
        >
          <div className={styles['todo-item']} style={{ background: '#2a2a2a', border: '1.6px solid #1a73e8' }}>
            <input type="checkbox" className={styles['todo-checkbox']} checked={draggedItem.completed} readOnly />
            <span className={styles['todo-text']}>{draggedItem.task}</span>
          </div>
        </div>
      )}

      <div 
        className={styles['todos-wrapper']} 
        onMouseEnter={() => setIsHovering(true)} 
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className={styles.todos} ref={containerRef} onScroll={handleScroll}>
          {isLoading ? <div style={{color: 'white', padding: '20px'}}>
            Loading, please wait... <br/>
            <br/>
            -Press Enter to ADD task <br/>
            <br/>
            -Double click to EDIT task <br/>
            <br/>
            -Checkbox to mark task as DONE <br/>
            <br/>
            -Delete button to DELETE task <br/>
            <br/>
            Note: Render server takes ~30 seconds to load... <br/>
            
          </div> : 
           tasks.map((task, index) => (
            <div key={task.id} className={styles['todo-container']} data-drag-item="true"> 
              {overIndex === index && draggedIndex !== null && <div className={styles.indicator} />}
              
              <div 
                className={styles['todo-item']}
                onMouseDown={(e) => onMouseDown(e, index)}
                onClick={() => handleSmoothDoubleClick(task)}
                style={{ opacity: draggedIndex === index ? 0.3 : 1 }}
              >
                <input 
                  type="checkbox" 
                  className={styles['todo-checkbox']}
                  checked={task.completed}
                  onChange={() => toggleTask(task)}
                  onMouseDown={(e) => e.stopPropagation()} 
                />
                
                {editingId === task.id ? (
                  <textarea 
                    ref={textareaRef}
                    className={styles['edit-input']}
                    value={editText}
                    rows={1}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={() => saveEdit(task)}
                    onKeyDown={(e) => handleKeyDown(e, task)}
                    onMouseDown={(e) => e.stopPropagation()}
                    autoFocus
                  />
                ) : (
                  <span className={`${styles['todo-text']} ${task.completed ? styles.completed : ''}`}>
                    {task.task}
                  </span>
                )}
                
                <button className={styles['delete-btn']} onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} onMouseDown={(e) => e.stopPropagation()}>
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles['custom-scrollbar-track']}>
          <div 
            className={styles['custom-scrollbar-thumb']} 
            style={{ 
              height: thumbHeight, 
              top: thumbTop, 
              opacity: isHovering && thumbHeight > 0 && thumbHeight < (containerRef.current?.clientHeight || 0) ? 1 : 0 
            }} 
          />
        </div>
      </div>
    </div>
  );
}
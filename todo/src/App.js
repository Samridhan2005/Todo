import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { PencilSquare, TrashFill, CheckLg, XLg } from 'react-bootstrap-icons';

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [priority, setPriority] = useState('Low');aaabbccdd
  const [dueDate, setDueDate] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('');
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editPriority, setEditPriority] = useState('Low');
  const [editDueDate, setEditDueDate] = useState('');

  const API_URL = 'http://localhost:5000/api/todos';

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error('Error fetching tasks:', err));
  }, []);

  const addTask = () => {
    if (!taskInput.trim()) return;

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: taskInput, priority, dueDate }),
    })
      .then((res) => res.json())
      .then((newTask) => {
        setTasks([newTask, ...tasks]);
        setTaskInput('');
        setPriority('Low');
        setDueDate('');
      });
  };

  const toggleComplete = (id) => {
    fetch(`${API_URL}/${id}/toggle`, {
      method: 'PUT',
    }).then(() => {
      setTasks((prev) =>
        prev.map((task) =>
          task._id === id ? { ...task, completed: !task.completed } : task
        )
      );
    });
  };

  const deleteTask = (id) => {
    fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    }).then(() => {
      setTasks((prev) => prev.filter((task) => task._id !== id));
    });
  };

  const startEdit = (task) => {
    setEditId(task._id);
    setEditText(task.text);
    setEditPriority(task.priority || 'Low');
    setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
  };

  const saveEdit = () => {
    fetch(`${API_URL}/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: editText,
        priority: editPriority,
        dueDate: editDueDate,
      }),
    }).then(() => {
      setTasks((prev) =>
        prev.map((task) =>
          task._id === editId
            ? { ...task, text: editText, priority: editPriority, dueDate: editDueDate }
            : task
        )
      );
      setEditId(null);
      setEditText('');
    });
  };

  const clearAll = () => {
    Promise.all(
      tasks.map((task) =>
        fetch(`${API_URL}/${task._id}`, { method: 'DELETE' })
      )
    ).then(() => setTasks([]));
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sort === 'priority') {
      const order = { High: 3, Medium: 2, Low: 1 };
      return order[b.priority] - order[a.priority];
    }
    if (sort === 'dueDate') {
      return new Date(a.dueDate || '') - new Date(b.dueDate || '');
    }
    return 0;
  });

  return (
    <div className="container py-5" style={{ maxWidth: '700px' }}>
      <div className="bg-light rounded p-4 shadow border">
        <h3 className="text-center mb-4">📋 To-Do List</h3>

        <div className="row g-2 mb-3">
          <div className="col-md-5">
            <input
              type="text"
              className="form-control"
              placeholder="Task"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div className="col-md-3">
            <input
              type="date"
              className="form-control"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="col-md-1 d-grid">
            <button className="btn btn-success" onClick={addTask}>
              Add
            </button>
          </div>
        </div>

        <div className="d-flex justify-content-between mb-3">
          <div>
            <select
              className="form-select"
              style={{ width: '150px', display: 'inline-block' }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="d-flex gap-2">
            <select
              className="form-select"
              value={sort}
              style={{ width: '150px' }}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="">Sort</option>
              <option value="priority">By Priority</option>
              <option value="dueDate">By Due Date</option>
            </select>
            <button className="btn btn-outline-danger btn-sm" onClick={clearAll}>
              Clear All
            </button>
          </div>
        </div>

        <ul className="list-group">
          {sortedTasks.map((task) => (
            <li
              key={task._id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              {editId === task._id ? (
                <div className="d-flex flex-grow-1 gap-2">
                  <input
                    className="form-control"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <select
                    className="form-select"
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                  <input
                    type="date"
                    className="form-control"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                  />
                  <button className="btn btn-success btn-sm" onClick={saveEdit}>
                    <CheckLg />
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditId(null)}
                  >
                    <XLg />
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className="flex-grow-1"
                    onClick={() => toggleComplete(task._id)}
                    style={{
                      textDecoration: task.completed ? 'line-through' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <div>{task.text}</div>
                    <small className="text-muted">
                      Priority: {task.priority} | Due: {task.dueDate ? task.dueDate.split('T')[0] : 'N/A'}
                    </small>
                  </div>
                  <div className="btn-group">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => startEdit(task)}
                    >
                      <PencilSquare />
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => deleteTask(task._id)}
                    >
                      <TrashFill />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;

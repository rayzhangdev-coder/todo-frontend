import { useState, useEffect } from 'react';
import './App.css';
import TodoForm from './components/TodoForm';
import TodoItem from './components/TodoItem';
//im using pessimistic ui
//npm run dev

const base_url = "http://localhost:3000/todos";
function App() {
  //for todos array, caching as a local array
  const [todos, setTodos] = useState([]);
  //you can't modify the stuff inside todos[] directly, you can only SET the entire STATE to something else using setTodos
  
  useEffect(() => {
    const getTodos = async() => {
      try{
        const res = await fetch(base_url);
        //res.ok is status code in the 200s
        if(!res.ok){
          throw new Error(`HTTP ERROR! Status: ${res.status}`)
        }
        //RES = AWAIT FETCH GETS A DATA STREAM THEN 
        const JSONdata = await res.json(); //RES.JSON PARSES THE STREAM (takes time to parse)
        setTodos(JSONdata);
      }catch(err){
        console.log(err);
      }
    }
    getTodos();
  }, []);

  async function addNewTodo(text){
    try{
      const res = await fetch(base_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          task: text,
          completed: false
        })
      });
      if(!res.ok){
        throw new Error("HTTP ERROR! status: " + res.status);
      }
      const body = await res.json();
      setTodos([...todos, body])
    }catch(err){
      console.log(err);
    }
  }

  async function updateCompletionStatus(todo){
    try{
      const res = await fetch(`${base_url}/${todo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        //json.stringify turns evertyhing into a string, but the key's become strings inside strings
        body: JSON.stringify({
          task: todo.task,
          completed: !todo.completed
        })
      });
      if(!res.ok){
        throw new Error("http response error, status: " + res.status);
      }
      const updatedTodos = todos.map(elem => {
        if(elem.id === todo.id){
          return {
            ...elem,
            completed: !elem.completed
          }
        }
        return elem;
      });
      setTodos(updatedTodos);
    }catch(err){
      console.log(err);
    }
  }

  async function deleteTodoFromList(id){
    try{
      const res = await fetch(`${base_url}/${id}`, {
        method: 'DELETE'
      });
      if(!res.ok){
        throw new Error("http error, status: " + res.status);
      }
      const updatedTodos = todos.filter(todo => todo.id!=id);
      setTodos(updatedTodos);
    }catch(err){
      console.log(err);
    }
  }

  //inside return is html
  //its also called JSX
  return (<div className="homepage">
    <h1>To-do List</h1>
    <TodoForm
    handleNewTodo = {addNewTodo}
    />
    <div className="todos">
      {/* inside {} is JAVASCRIPT LAND, EVERYTHING IS JS */}
      {/* key's are for repeaters */}
      {todos.map(todo => (
        <TodoItem
        key = {todo.id} 
        todo = {todo}
        onToggle = {updateCompletionStatus}
        onDelete = {deleteTodoFromList}
        />
      ))}
    </div>
  </div>
  ) 
}

export default App

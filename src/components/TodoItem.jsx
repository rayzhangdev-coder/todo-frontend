//stateless component, only used for displaying html items
function TodoItem( {todo, onToggle, onDelete} ){
    // only has things to display, nothing to change so no useState
    // things that the user can directly change does not count
    return(
        <div className="todo-item"> 
          <input type="checkbox" 
          checked = {todo.completed}
          onChange={() => onToggle(todo)}
          />
          <span style={{ textDecoration: todo.completed ? 'line-through' : 'none'} }>{todo.task}</span>
          <button onClick={ () => onDelete(todo.id)} style={{ marginLeft: '10px', color: 'red' }}>delete</button>
        </div>
    );
}

export default TodoItem
import { useState } from 'react';

//stateful component
function TodoForm( { handleNewTodo }){
    //has something to change -> the text bar
    const [inputText, setInputText] = useState("");

    const handleSubmit = () => {
        if(inputText.trim() === ""){
            return;
        }
        handleNewTodo(inputText); 
        setInputText(""); //handles state on 'Enter' key
    }

    return(
        <div className="search-bar">
            <input type="text" placeholder="Enter task here" id="search"
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)}
            onKeyUp={(e) => {if(e.key === 'Enter') handleSubmit()}}/>
        </div>
    );
}

export default TodoForm
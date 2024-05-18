document.addEventListener('DOMContentLoaded', function() {
    const todoList = document.querySelector('.todo-list');
    const addTodoButton = document.getElementById('add-todo');
    const newTodoInput = document.getElementById('new-todo');

    addTodoButton.addEventListener('click', function() {
        const newTodoText = newTodoInput.value.trim();
        if (newTodoText !== '') {
            const newTodoItem = document.createElement('li');
            newTodoItem.classList.add('not-completed');
            newTodoItem.innerHTML = `<p>${newTodoText}</p><i class='bx bx-dots-vertical-rounded'></i>`;
            todoList.appendChild(newTodoItem);
            newTodoInput.value = '';
            addTodoListeners(newTodoItem);
        }
    });

    function toggleTodoStatus(event) {
        const todoItem = event.target.closest('li');
        if (todoItem.classList.contains('completed')) {
            todoItem.classList.remove('completed');
            todoItem.classList.add('not-completed');
        } else {
            todoItem.classList.remove('not-completed');
            todoItem.classList.add('completed');
        }
    }

    function removeTodoItem(event) {
        const todoItem = event.target.closest('li');
        todoList.removeChild(todoItem);
    }

    function addTodoListeners(todoItem) {
        todoItem.querySelector('p').addEventListener('click', toggleTodoStatus);
        todoItem.querySelector('.bx-dots-vertical-rounded').addEventListener('click', removeTodoItem);
    }

    const initialTodoItems = document.querySelectorAll('.todo-list li');
    initialTodoItems.forEach(addTodoListeners);
});

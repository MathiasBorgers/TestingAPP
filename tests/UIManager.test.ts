/**
 * UIManager Tests
 * 
 * Deze tests gebruiken mocks omdat UIManager afhankelijk is van DOM elementen.
 * In een echte omgeving zou je een tool zoals Testing Library kunnen gebruiken.
 */

import { UIManager } from '../src/UIManager';
import { TodoManager } from '../src/TodoManager';

describe('UIManager', () => {
  let todoManager: TodoManager;
  let container: HTMLElement;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <form id="todoForm">
        <input type="text" id="todoInput" />
        <button type="submit">Add</button>
      </form>
      <div id="todoList"></div>
      <div id="emptyState"></div>
      <div id="errorMessage" class="hidden"></div>
      <button class="filter-btn active" data-filter="all">All <span id="countAll">0</span></button>
      <button class="filter-btn" data-filter="active">Active <span id="countActive">0</span></button>
      <button class="filter-btn" data-filter="completed">Completed <span id="countCompleted">0</span></button>
      <button id="clearCompleted">Clear Completed</button>
      <span id="totalTasks">0</span>
    `;

    localStorage.clear();
    todoManager = new TodoManager();
  });

  afterEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
  });

  describe('initialization', () => {
    it('should initialize without errors', () => {
      expect(() => new UIManager(todoManager)).not.toThrow();
    });

    it('should render initial empty state', () => {
      const uiManager = new UIManager(todoManager);
      
      const emptyState = document.getElementById('emptyState');
      expect(emptyState?.classList.contains('hidden')).toBe(false);
    });

    it('should render existing todos on initialization', () => {
      todoManager.addTodo('Existing todo');
      
      const uiManager = new UIManager(todoManager);
      
      const todoList = document.getElementById('todoList');
      expect(todoList?.children.length).toBe(1);
    });
  });

  describe('counter updates', () => {
    it('should update counters when todo is added', () => {
      const uiManager = new UIManager(todoManager);
      
      todoManager.addTodo('New todo');
      uiManager.render();
      
      const countAll = document.getElementById('countAll');
      const countActive = document.getElementById('countActive');
      const totalTasks = document.getElementById('totalTasks');
      
      expect(countAll?.textContent).toBe('1');
      expect(countActive?.textContent).toBe('1');
      expect(totalTasks?.textContent).toBe('1');
    });

    it('should update counters when todo is completed', () => {
      const uiManager = new UIManager(todoManager);
      const todo = todoManager.addTodo('Test todo');
      
      todoManager.toggleTodo(todo!.id);
      uiManager.render();
      
      const countActive = document.getElementById('countActive');
      const countCompleted = document.getElementById('countCompleted');
      
      expect(countActive?.textContent).toBe('0');
      expect(countCompleted?.textContent).toBe('1');
    });

    it('should update counters when todo is deleted', () => {
      const uiManager = new UIManager(todoManager);
      const todo = todoManager.addTodo('Test todo');
      uiManager.render();
      
      todoManager.deleteTodo(todo!.id);
      uiManager.render();
      
      const countAll = document.getElementById('countAll');
      expect(countAll?.textContent).toBe('0');
    });
  });

  describe('form submission', () => {
    it('should add todo when form is submitted', () => {
      const uiManager = new UIManager(todoManager);
      const form = document.getElementById('todoForm') as HTMLFormElement;
      const input = document.getElementById('todoInput') as HTMLInputElement;
      
      input.value = 'New todo from form';
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      
      const todos = todoManager.getTodos();
      expect(todos.length).toBe(1);
      expect(todos[0].text).toBe('New todo from form');
    });

    it('should clear input after successful submission', () => {
      const uiManager = new UIManager(todoManager);
      const form = document.getElementById('todoForm') as HTMLFormElement;
      const input = document.getElementById('todoInput') as HTMLInputElement;
      
      input.value = 'Test';
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      
      expect(input.value).toBe('');
    });

    it('should show error for empty input', () => {
      const uiManager = new UIManager(todoManager);
      const form = document.getElementById('todoForm') as HTMLFormElement;
      const input = document.getElementById('todoInput') as HTMLInputElement;
      const errorMessage = document.getElementById('errorMessage') as HTMLElement;
      
      input.value = '';
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      
      expect(errorMessage.classList.contains('hidden')).toBe(false);
      expect(errorMessage.textContent).toContain('leeg');
    });

    it('should show error for too long input', () => {
      const uiManager = new UIManager(todoManager);
      const form = document.getElementById('todoForm') as HTMLFormElement;
      const input = document.getElementById('todoInput') as HTMLInputElement;
      const errorMessage = document.getElementById('errorMessage') as HTMLElement;
      
      input.value = 'a'.repeat(201);
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      
      expect(errorMessage.classList.contains('hidden')).toBe(false);
      expect(errorMessage.textContent).toContain('200');
    });
  });

  describe('rendering', () => {
    it('should show empty state when no todos', () => {
      const uiManager = new UIManager(todoManager);
      uiManager.render();
      
      const emptyState = document.getElementById('emptyState');
      const todoList = document.getElementById('todoList');
      
      expect(emptyState?.classList.contains('hidden')).toBe(false);
      expect(todoList?.classList.contains('hidden')).toBe(true);
    });

    it('should hide empty state when todos exist', () => {
      const uiManager = new UIManager(todoManager);
      todoManager.addTodo('Test');
      uiManager.render();
      
      const emptyState = document.getElementById('emptyState');
      const todoList = document.getElementById('todoList');
      
      expect(emptyState?.classList.contains('hidden')).toBe(true);
      expect(todoList?.classList.contains('hidden')).toBe(false);
    });

    it('should render correct number of todos', () => {
      const uiManager = new UIManager(todoManager);
      todoManager.addTodo('Todo 1');
      todoManager.addTodo('Todo 2');
      todoManager.addTodo('Todo 3');
      uiManager.render();
      
      const todoList = document.getElementById('todoList');
      expect(todoList?.children.length).toBe(3);
    });

    it('should render completed todos with completed class', () => {
      const uiManager = new UIManager(todoManager);
      const todo = todoManager.addTodo('Completed todo');
      todoManager.toggleTodo(todo!.id);
      uiManager.render();
      
      const todoList = document.getElementById('todoList');
      const todoElement = todoList?.firstChild as HTMLElement;
      
      expect(todoElement.classList.contains('completed')).toBe(true);
    });

    it('should escape HTML in todo text', () => {
      const uiManager = new UIManager(todoManager);
      todoManager.addTodo('<script>alert("xss")</script>');
      uiManager.render();
      
      const todoList = document.getElementById('todoList');
      const todoText = todoList?.querySelector('.todo-text');
      
      // Should be escaped, not executed
      expect(todoText?.innerHTML).toContain('&lt;script&gt;');
    });
  });

  describe('filter functionality', () => {
    it('should filter active todos', () => {
      const uiManager = new UIManager(todoManager);
      const todo1 = todoManager.addTodo('Active');
      const todo2 = todoManager.addTodo('Completed');
      todoManager.toggleTodo(todo2!.id);
      
      const activeButton = document.querySelector('[data-filter="active"]') as HTMLButtonElement;
      activeButton.click();
      
      const todoList = document.getElementById('todoList');
      expect(todoList?.children.length).toBe(1);
    });

    it('should filter completed todos', () => {
      const uiManager = new UIManager(todoManager);
      const todo1 = todoManager.addTodo('Active');
      const todo2 = todoManager.addTodo('Completed');
      todoManager.toggleTodo(todo2!.id);
      
      const completedButton = document.querySelector('[data-filter="completed"]') as HTMLButtonElement;
      completedButton.click();
      
      const todoList = document.getElementById('todoList');
      expect(todoList?.children.length).toBe(1);
    });

    it('should update active button class on filter change', () => {
      const uiManager = new UIManager(todoManager);
      
      const activeButton = document.querySelector('[data-filter="active"]') as HTMLButtonElement;
      activeButton.click();
      
      expect(activeButton.classList.contains('active')).toBe(true);
      
      const allButton = document.querySelector('[data-filter="all"]') as HTMLButtonElement;
      expect(allButton.classList.contains('active')).toBe(false);
    });
  });

  describe('clear completed', () => {
    it('should remove completed todos when clicked', () => {
      const uiManager = new UIManager(todoManager);
      const todo1 = todoManager.addTodo('Active');
      const todo2 = todoManager.addTodo('Completed');
      todoManager.toggleTodo(todo2!.id);
      uiManager.render();
      
      const clearButton = document.getElementById('clearCompleted') as HTMLButtonElement;
      clearButton.click();
      
      expect(todoManager.getTodos().length).toBe(1);
    });
  });

  describe('todo interactions', () => {
    it('should toggle todo when checkbox is clicked', () => {
      const uiManager = new UIManager(todoManager);
      const todo = todoManager.addTodo('Test');
      uiManager.render();
      
      const checkbox = document.querySelector('.todo-checkbox') as HTMLInputElement;
      checkbox.click();
      
      const updated = todoManager.getTodoById(todo!.id);
      expect(updated?.completed).toBe(true);
    });

    it('should delete todo when delete button is clicked', () => {
      const uiManager = new UIManager(todoManager);
      const todo = todoManager.addTodo('Test');
      uiManager.render();
      
      const deleteButton = document.querySelector('.delete-btn') as HTMLButtonElement;
      deleteButton.click();
      
      expect(todoManager.getTodos().length).toBe(0);
    });

    it('should re-render after checkbox click', () => {
      const uiManager = new UIManager(todoManager);
      todoManager.addTodo('Test');
      uiManager.render();
      
      const renderSpy = jest.spyOn(uiManager, 'render');
      
      const checkbox = document.querySelector('.todo-checkbox') as HTMLInputElement;
      checkbox.click();
      
      expect(renderSpy).toHaveBeenCalled();
    });

    it('should re-render after delete click', () => {
      const uiManager = new UIManager(todoManager);
      todoManager.addTodo('Test');
      uiManager.render();
      
      const renderSpy = jest.spyOn(uiManager, 'render');
      
      const deleteButton = document.querySelector('.delete-btn') as HTMLButtonElement;
      deleteButton.click();
      
      expect(renderSpy).toHaveBeenCalled();
    });
  });
});

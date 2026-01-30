import { TodoManager } from './TodoManager';
import { FilterType } from './types';

export class UIManager {
  private todoManager: TodoManager;
  private todoForm: HTMLFormElement;
  private todoInput: HTMLInputElement;
  private todoList: HTMLElement;
  private emptyState: HTMLElement;
  private errorMessage: HTMLElement;
  private filterButtons: NodeListOf<HTMLButtonElement>;

  constructor(todoManager: TodoManager) {
    this.todoManager = todoManager;
    
    // Get DOM elements
    this.todoForm = document.getElementById('todoForm') as HTMLFormElement;
    this.todoInput = document.getElementById('todoInput') as HTMLInputElement;
    this.todoList = document.getElementById('todoList') as HTMLElement;
    this.emptyState = document.getElementById('emptyState') as HTMLElement;
    this.errorMessage = document.getElementById('errorMessage') as HTMLElement;
    this.filterButtons = document.querySelectorAll('.filter-btn');

    this.setupEventListeners();
    this.render();
  }

  private setupEventListeners(): void {
    // Form submit
    this.todoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddTodo();
    });

    // Filter buttons
    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter') as FilterType;
        this.handleFilterChange(filter);
      });
    });

    // Clear completed
    const clearBtn = document.getElementById('clearCompleted');
    clearBtn?.addEventListener('click', () => {
      this.handleClearCompleted();
    });
  }

  private handleAddTodo(): void {
    const text = this.todoInput.value;
    const todo = this.todoManager.addTodo(text);

    if (todo) {
      this.todoInput.value = '';
      this.hideError();
      this.render();
    } else {
      if (text.trim().length === 0) {
        this.showError('Taak mag niet leeg zijn');
      } else if (text.trim().length > 200) {
        this.showError('Taak mag niet langer zijn dan 200 karakters');
      }
    }
  }

  private handleFilterChange(filter: FilterType): void {
    this.todoManager.setFilter(filter);
    
    // Update active button
    this.filterButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-filter') === filter) {
        btn.classList.add('active');
      }
    });

    this.render();
  }

  private handleClearCompleted(): void {
    const count = this.todoManager.clearCompleted();
    if (count > 0) {
      this.render();
    }
  }

  private showError(message: string): void {
    this.errorMessage.textContent = message;
    this.errorMessage.classList.remove('hidden');
  }

  private hideError(): void {
    this.errorMessage.classList.add('hidden');
  }

  public render(): void {
    const todos = this.todoManager.getTodos();
    const stats = this.todoManager.getStats();

    // Update counters
    this.updateCounter('countAll', stats.total);
    this.updateCounter('countActive', stats.active);
    this.updateCounter('countCompleted', stats.completed);
    this.updateCounter('totalTasks', stats.total);

    // Clear list
    this.todoList.innerHTML = '';

    // Show/hide empty state
    if (todos.length === 0) {
      this.emptyState.classList.remove('hidden');
      this.todoList.classList.add('hidden');
    } else {
      this.emptyState.classList.add('hidden');
      this.todoList.classList.remove('hidden');

      // Render todos
      todos.forEach(todo => {
        this.todoList.appendChild(this.createTodoElement(todo));
      });
    }
  }

  private createTodoElement(todo: any): HTMLElement {
    const div = document.createElement('div');
    div.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    div.setAttribute('data-id', todo.id);

    div.innerHTML = `
      <input 
        type="checkbox" 
        class="todo-checkbox" 
        ${todo.completed ? 'checked' : ''}
        data-id="${todo.id}"
      >
      <span class="todo-text">${this.escapeHtml(todo.text)}</span>
      <button class="delete-btn" data-id="${todo.id}">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </button>
    `;

    // Checkbox event
    const checkbox = div.querySelector('.todo-checkbox') as HTMLInputElement;
    checkbox.addEventListener('change', () => {
      this.todoManager.toggleTodo(todo.id);
      this.render();
    });

    // Delete button event
    const deleteBtn = div.querySelector('.delete-btn') as HTMLButtonElement;
    deleteBtn.addEventListener('click', () => {
      this.todoManager.deleteTodo(todo.id);
      this.render();
    });

    return div;
  }

  private updateCounter(elementId: string, value: number): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value.toString();
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

import { TodoManager } from './TodoManager';
import { UIManager } from './UIManager';
import './style.css';

// Initialize the application
const todoManager = new TodoManager();
const uiManager = new UIManager(todoManager);

// Export for testing purposes
if (typeof window !== 'undefined') {
  (window as any).todoManager = todoManager;
  (window as any).uiManager = uiManager;
}

console.log('Todo App initialized!');

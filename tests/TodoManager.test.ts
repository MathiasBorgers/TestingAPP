import { TodoManager } from '../src/TodoManager';
import { Todo } from '../src/types';

describe('TodoManager', () => {
  let todoManager: TodoManager;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    todoManager = new TodoManager();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('addTodo', () => {
    it('should add a valid todo', () => {
      const todo = todoManager.addTodo('Test taak');
      
      expect(todo).not.toBeNull();
      expect(todo?.text).toBe('Test taak');
      expect(todo?.completed).toBe(false);
      expect(todo?.id).toBeDefined();
      expect(todo?.createdAt).toBeInstanceOf(Date);
    });

    it('should trim whitespace from todo text', () => {
      const todo = todoManager.addTodo('  Spaties voor en na  ');
      
      expect(todo?.text).toBe('Spaties voor en na');
    });

    it('should reject empty string', () => {
      const todo = todoManager.addTodo('');
      
      expect(todo).toBeNull();
    });

    it('should reject string with only spaces', () => {
      const todo = todoManager.addTodo('     ');
      
      expect(todo).toBeNull();
    });

    it('should reject todo longer than 200 characters', () => {
      const longText = 'a'.repeat(201);
      const todo = todoManager.addTodo(longText);
      
      expect(todo).toBeNull();
    });

    it('should accept todo with exactly 200 characters', () => {
      const text200 = 'a'.repeat(200);
      const todo = todoManager.addTodo(text200);
      
      expect(todo).not.toBeNull();
      expect(todo?.text).toBe(text200);
    });

    it('should handle special characters', () => {
      const specialText = '<script>alert("xss")</script>';
      const todo = todoManager.addTodo(specialText);
      
      expect(todo?.text).toBe(specialText);
    });

    it('should save to localStorage', () => {
      todoManager.addTodo('Test');
      
      const stored = localStorage.getItem('todos');
      expect(stored).not.toBeNull();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.length).toBe(1);
      expect(parsed[0].text).toBe('Test');
    });
  });

  describe('deleteTodo', () => {
    it('should delete existing todo', () => {
      const todo = todoManager.addTodo('Te verwijderen');
      const result = todoManager.deleteTodo(todo!.id);
      
      expect(result).toBe(true);
      expect(todoManager.getTodos().length).toBe(0);
    });

    it('should return false for non-existing todo', () => {
      const result = todoManager.deleteTodo('non-existing-id');
      
      expect(result).toBe(false);
    });

    it('should not affect other todos when deleting', () => {
      const todo1 = todoManager.addTodo('Taak 1');
      const todo2 = todoManager.addTodo('Taak 2');
      const todo3 = todoManager.addTodo('Taak 3');
      
      todoManager.deleteTodo(todo2!.id);
      
      const todos = todoManager.getTodos();
      expect(todos.length).toBe(2);
      expect(todos[0].text).toBe('Taak 1');
      expect(todos[1].text).toBe('Taak 3');
    });

    it('should update localStorage after deletion', () => {
      const todo = todoManager.addTodo('Test');
      todoManager.deleteTodo(todo!.id);
      
      const stored = localStorage.getItem('todos');
      const parsed = JSON.parse(stored!);
      expect(parsed.length).toBe(0);
    });
  });

  describe('toggleTodo', () => {
    it('should toggle todo from active to completed', () => {
      const todo = todoManager.addTodo('Toggle test');
      const result = todoManager.toggleTodo(todo!.id);
      
      expect(result).toBe(true);
      
      const updated = todoManager.getTodoById(todo!.id);
      expect(updated?.completed).toBe(true);
    });

    it('should toggle todo from completed to active', () => {
      const todo = todoManager.addTodo('Toggle test');
      
      // Toggle to completed
      todoManager.toggleTodo(todo!.id);
      // Toggle back to active
      todoManager.toggleTodo(todo!.id);
      
      const updated = todoManager.getTodoById(todo!.id);
      expect(updated?.completed).toBe(false);
    });

    it('should return false for non-existing todo', () => {
      const result = todoManager.toggleTodo('non-existing-id');
      
      expect(result).toBe(false);
    });

    it('should update localStorage after toggle', () => {
      const todo = todoManager.addTodo('Test');
      todoManager.toggleTodo(todo!.id);
      
      const stored = localStorage.getItem('todos');
      const parsed = JSON.parse(stored!);
      expect(parsed[0].completed).toBe(true);
    });
  });

  describe('getTodos', () => {
    beforeEach(() => {
      // Add test data
      const todo1 = todoManager.addTodo('Actieve taak 1');
      const todo2 = todoManager.addTodo('Actieve taak 2');
      const todo3 = todoManager.addTodo('Voltooide taak 1');
      
      todoManager.toggleTodo(todo3!.id);
    });

    it('should return all todos with "all" filter', () => {
      const todos = todoManager.getTodos('all');
      
      expect(todos.length).toBe(3);
    });

    it('should return only active todos with "active" filter', () => {
      const todos = todoManager.getTodos('active');
      
      expect(todos.length).toBe(2);
      expect(todos.every(t => !t.completed)).toBe(true);
    });

    it('should return only completed todos with "completed" filter', () => {
      const todos = todoManager.getTodos('completed');
      
      expect(todos.length).toBe(1);
      expect(todos.every(t => t.completed)).toBe(true);
    });

    it('should use current filter when no filter specified', () => {
      todoManager.setFilter('active');
      const todos = todoManager.getTodos();
      
      expect(todos.length).toBe(2);
    });

    it('should return a copy of the array', () => {
      const todos1 = todoManager.getTodos();
      const todos2 = todoManager.getTodos();
      
      expect(todos1).not.toBe(todos2);
    });
  });

  describe('getTodoById', () => {
    it('should return todo with matching id', () => {
      const todo = todoManager.addTodo('Find me');
      const found = todoManager.getTodoById(todo!.id);
      
      expect(found).toBeDefined();
      expect(found?.text).toBe('Find me');
    });

    it('should return undefined for non-existing id', () => {
      const found = todoManager.getTodoById('non-existing');
      
      expect(found).toBeUndefined();
    });
  });

  describe('clearCompleted', () => {
    it('should remove all completed todos', () => {
      const todo1 = todoManager.addTodo('Actief');
      const todo2 = todoManager.addTodo('Voltooid 1');
      const todo3 = todoManager.addTodo('Voltooid 2');
      
      todoManager.toggleTodo(todo2!.id);
      todoManager.toggleTodo(todo3!.id);
      
      const deleted = todoManager.clearCompleted();
      
      expect(deleted).toBe(2);
      expect(todoManager.getTodos().length).toBe(1);
      expect(todoManager.getTodos()[0].text).toBe('Actief');
    });

    it('should return 0 when no completed todos exist', () => {
      todoManager.addTodo('Actief 1');
      todoManager.addTodo('Actief 2');
      
      const deleted = todoManager.clearCompleted();
      
      expect(deleted).toBe(0);
      expect(todoManager.getTodos().length).toBe(2);
    });

    it('should not affect localStorage when nothing deleted', () => {
      todoManager.addTodo('Test');
      const storedBefore = localStorage.getItem('todos');
      
      todoManager.clearCompleted();
      const storedAfter = localStorage.getItem('todos');
      
      expect(storedBefore).toBe(storedAfter);
    });
  });

  describe('getStats', () => {
    it('should return correct stats', () => {
      todoManager.addTodo('Actief 1');
      todoManager.addTodo('Actief 2');
      const completed1 = todoManager.addTodo('Voltooid 1');
      
      todoManager.toggleTodo(completed1!.id);
      
      const stats = todoManager.getStats();
      
      expect(stats.total).toBe(3);
      expect(stats.active).toBe(2);
      expect(stats.completed).toBe(1);
    });

    it('should return zeros for empty list', () => {
      const stats = todoManager.getStats();
      
      expect(stats.total).toBe(0);
      expect(stats.active).toBe(0);
      expect(stats.completed).toBe(0);
    });
  });

  describe('filter management', () => {
    it('should set and get current filter', () => {
      todoManager.setFilter('active');
      expect(todoManager.getCurrentFilter()).toBe('active');
      
      todoManager.setFilter('completed');
      expect(todoManager.getCurrentFilter()).toBe('completed');
    });

    it('should default to "all" filter', () => {
      expect(todoManager.getCurrentFilter()).toBe('all');
    });
  });

  describe('clearAll', () => {
    it('should remove all todos', () => {
      todoManager.addTodo('Taak 1');
      todoManager.addTodo('Taak 2');
      todoManager.addTodo('Taak 3');
      
      todoManager.clearAll();
      
      expect(todoManager.getTodos().length).toBe(0);
    });

    it('should clear localStorage', () => {
      todoManager.addTodo('Test');
      todoManager.clearAll();
      
      const stored = localStorage.getItem('todos');
      const parsed = JSON.parse(stored!);
      expect(parsed.length).toBe(0);
    });
  });

  describe('localStorage persistence', () => {
    it('should load todos from localStorage on initialization', () => {
      // Add todos and save
      todoManager.addTodo('Persistent taak');
      
      // Create new instance (simulates page reload)
      const newManager = new TodoManager();
      
      const todos = newManager.getTodos();
      expect(todos.length).toBe(1);
      expect(todos[0].text).toBe('Persistent taak');
    });

    it('should restore completed status', () => {
      const todo = todoManager.addTodo('Test');
      todoManager.toggleTodo(todo!.id);
      
      // Create new instance
      const newManager = new TodoManager();
      
      const todos = newManager.getTodos();
      expect(todos[0].completed).toBe(true);
    });

    it('should restore createdAt as Date object', () => {
      todoManager.addTodo('Test');
      
      // Create new instance
      const newManager = new TodoManager();
      
      const todos = newManager.getTodos();
      expect(todos[0].createdAt).toBeInstanceOf(Date);
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem('todos', 'invalid json');
      
      // Should not throw error
      const newManager = new TodoManager();
      expect(newManager.getTodos().length).toBe(0);
    });

    it('should handle missing localStorage gracefully', () => {
      // Should work with empty localStorage
      const newManager = new TodoManager();
      expect(newManager.getTodos().length).toBe(0);
    });
  });

  describe('ID generation', () => {
    it('should generate unique IDs', () => {
      const todo1 = todoManager.addTodo('Taak 1');
      const todo2 = todoManager.addTodo('Taak 2');
      const todo3 = todoManager.addTodo('Taak 3');
      
      const ids = [todo1!.id, todo2!.id, todo3!.id];
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(3);
    });

    it('should include timestamp in ID', () => {
      const todo = todoManager.addTodo('Test');
      
      expect(todo!.id).toMatch(/^\d+-/);
    });
  });

  describe('edge cases', () => {
    it('should handle many todos (stress test)', () => {
      // Add 100 todos
      for (let i = 0; i < 100; i++) {
        todoManager.addTodo(`Taak ${i}`);
      }
      
      expect(todoManager.getTodos().length).toBe(100);
      
      // Toggle half of them
      const todos = todoManager.getTodos();
      for (let i = 0; i < 50; i++) {
        todoManager.toggleTodo(todos[i].id);
      }
      
      const stats = todoManager.getStats();
      expect(stats.completed).toBe(50);
      expect(stats.active).toBe(50);
    });

    it('should handle rapid operations', () => {
      const todo1 = todoManager.addTodo('Rapid 1');
      const todo2 = todoManager.addTodo('Rapid 2');
      
      todoManager.toggleTodo(todo1!.id);
      todoManager.deleteTodo(todo2!.id);
      todoManager.toggleTodo(todo1!.id);
      
      const todos = todoManager.getTodos();
      expect(todos.length).toBe(1);
      expect(todos[0].completed).toBe(false);
    });

    it('should handle unicode and emoji', () => {
      const todo = todoManager.addTodo('Taak met emoji 🎉✨ en unicode ñ');
      
      expect(todo?.text).toBe('Taak met emoji 🎉✨ en unicode ñ');
    });
  });
});

import { Todo, FilterType, TodoStats } from './types';

export class TodoManager {
  private todos: Todo[] = [];
  private currentFilter: FilterType = 'all';

  constructor() {
    this.loadFromLocalStorage();
  }

  /**
   * Voegt een nieuwe todo toe
   * @param text De tekst van de todo
   * @returns De nieuwe todo of null als de tekst invalid is
   */
  addTodo(text: string): Todo | null {
    const trimmedText = text.trim();
    
    // Validatie: tekst mag niet leeg zijn
    if (trimmedText.length === 0) {
      return null;
    }

    // Validatie: maximale lengte van 200 karakters
    if (trimmedText.length > 200) {
      return null;
    }

    const newTodo: Todo = {
      id: this.generateId(),
      text: trimmedText,
      completed: false,
      createdAt: new Date()
    };

    this.todos.push(newTodo);
    this.saveToLocalStorage();
    return newTodo;
  }

  /**
   * Verwijdert een todo op basis van ID
   * @param id Het ID van de todo
   * @returns True als de todo is verwijderd, anders false
   */
  deleteTodo(id: string): boolean {
    const initialLength = this.todos.length;
    this.todos = this.todos.filter(todo => todo.id !== id);
    
    if (this.todos.length < initialLength) {
      this.saveToLocalStorage();
      return true;
    }
    return false;
  }

  /**
   * Togglet de completed status van een todo
   * @param id Het ID van de todo
   * @returns True als de todo is gewijzigd, anders false
   */
  toggleTodo(id: string): boolean {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.saveToLocalStorage();
      return true;
    }
    return false;
  }

  /**
   * Haalt alle todos op, optioneel gefilterd
   * @param filter Het type filter
   * @returns Array van todos
   */
  getTodos(filter?: FilterType): Todo[] {
    const filterType = filter || this.currentFilter;

    switch (filterType) {
      case 'active':
        return this.todos.filter(todo => !todo.completed);
      case 'completed':
        return this.todos.filter(todo => todo.completed);
      default:
        return [...this.todos];
    }
  }

  /**
   * Haalt een specifieke todo op basis van ID
   * @param id Het ID van de todo
   * @returns De todo of undefined
   */
  getTodoById(id: string): Todo | undefined {
    return this.todos.find(todo => todo.id === id);
  }

  /**
   * Verwijdert alle voltooide todos
   * @returns Het aantal verwijderde todos
   */
  clearCompleted(): number {
    const initialLength = this.todos.length;
    this.todos = this.todos.filter(todo => !todo.completed);
    const deletedCount = initialLength - this.todos.length;
    
    if (deletedCount > 0) {
      this.saveToLocalStorage();
    }
    return deletedCount;
  }

  /**
   * Haalt statistieken op over de todos
   * @returns TodoStats object met counts
   */
  getStats(): TodoStats {
    return {
      total: this.todos.length,
      active: this.todos.filter(t => !t.completed).length,
      completed: this.todos.filter(t => t.completed).length
    };
  }

  /**
   * Zet het huidige filter
   * @param filter Het nieuwe filter
   */
  setFilter(filter: FilterType): void {
    this.currentFilter = filter;
  }

  /**
   * Haalt het huidige filter op
   * @returns Het huidige filter
   */
  getCurrentFilter(): FilterType {
    return this.currentFilter;
  }

  /**
   * Genereert een unieke ID
   * @returns Een unieke string ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Slaat de todos op in localStorage
   */
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('todos', JSON.stringify(this.todos));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
   * Laadt de todos uit localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('todos');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.todos = parsed.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt)
        }));
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      this.todos = [];
    }
  }

  /**
   * Verwijdert alle todos (voor testing)
   */
  clearAll(): void {
    this.todos = [];
    this.saveToLocalStorage();
  }
}

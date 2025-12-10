

export interface StorageItem {
  key: string;
  value: any;
  timestamp: number;
  expiresAt?: number;
}

export class StorageService {
  private storage: Storage;
  private prefix: string;

  constructor(type: 'localStorage' | 'sessionStorage' = 'localStorage', prefix = 'coder-app') {
    this.storage = type === 'localStorage' ? window.localStorage : window.sessionStorage;
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  set<T>(key: string, value: T, expiresInMinutes?: number): void {
    try {
      const item: StorageItem = {
        key,
        value,
        timestamp: Date.now(),
        ...(expiresInMinutes && { expiresAt: Date.now() + expiresInMinutes * 60 * 1000 }),
      };

      this.storage.setItem(this.getKey(key), JSON.stringify(item));
    } catch (error) {
      console.error('Error setting storage item:', error);
    }
  }

  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const itemString = this.storage.getItem(this.getKey(key));

      if (!itemString) {
        return defaultValue;
      }

      const item: StorageItem = JSON.parse(itemString);


      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.remove(key);
        return defaultValue;
      }

      return item.value as T;
    } catch (error) {
      console.error('Error getting storage item:', error);
      return defaultValue;
    }
  }

  remove(key: string): void {
    try {
      this.storage.removeItem(this.getKey(key));
    } catch (error) {
      console.error('Error removing storage item:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(this.storage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          this.storage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  getAllKeys(): string[] {
    try {
      const keys = Object.keys(this.storage);
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(`${this.prefix}:`, ''));
    } catch (error) {
      console.error('Error getting storage keys:', error);
      return [];
    }
  }

  size(): number {
    return this.getAllKeys().length;
  }


  setUserPreferences(preferences: any): void {
    this.set('user-preferences', preferences);
  }

  getUserPreferences<T>(defaultPreferences: T): T {
    return this.get('user-preferences', defaultPreferences) as T;
  }

  setRecentProjects(projects: any[]): void {
    this.set('recent-projects', projects);
  }

  getRecentProjects(): any[] {
    return this.get('recent-projects', []) as any[];
  }

  addRecentProject(project: any): void {
    const recentProjects = this.getRecentProjects();
    const filteredProjects = recentProjects.filter(p => p.id !== project.id);
    const updatedProjects = [project, ...filteredProjects].slice(0, 10);
    this.setRecentProjects(updatedProjects);
  }

  setTheme(theme: string): void {
    this.set('theme', theme);
  }

  getTheme(defaultTheme = 'auto'): string {
    return this.get('theme', defaultTheme) as string;
  }
}


export class FileSystemService {
  private storageService: StorageService;

  constructor() {
    this.storageService = new StorageService('localStorage', 'coder-fs');
  }

  async createFile(path: string, content: string = ''): Promise<void> {
    const file = {
      path,
      content,
      type: 'file',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.storageService.set(path, file);
  }
  async readFile(path: string): Promise<string> {
    const file = this.storageService.get(path) as any;
    return file?.content || '';
  }

  async writeFile(path: string, content: string): Promise<void> {
    const existingFile = this.storageService.get(path) as any;
    const file = {
      ...(existingFile || {}),
      content,
      updatedAt: new Date().toISOString(),
    };

    this.storageService.set(path, file);
  }

  async deleteFile(path: string): Promise<void> {
    this.storageService.remove(path);
  }

  async createDirectory(path: string): Promise<void> {
    const directory = {
      path,
      type: 'directory',
      createdAt: new Date().toISOString(),
    };

    this.storageService.set(path, directory);
  }

  async listDirectory(path: string): Promise<string[]> {
    const allKeys = this.storageService.getAllKeys();
    return allKeys.filter(key => key.startsWith(path) && key !== path);
  }

  async exists(path: string): Promise<boolean> {
    const item = this.storageService.get(path);
    return !!item;
  }

  async getFileInfo(path: string): Promise<any> {
    return this.storageService.get(path);
  }
}


export const storage = new StorageService();
export const fileSystem = new FileSystemService();

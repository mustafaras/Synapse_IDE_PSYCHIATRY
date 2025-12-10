

export class ApiService {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl = '/api', timeout = 10000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }


  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const config: RequestInit = {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
      },
    };

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }


      const text = await response.text();
      if (!text) return {} as T;

      try {
        return JSON.parse(text) as T;
      } catch {
        return text as unknown as T;
      }
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${this.timeout}ms`);
        }
        throw error;
      }
      throw new Error('An unknown error occurred');
    }
  }


  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const searchParams = params ? new URLSearchParams(params) : '';
    const url = searchParams ? `${endpoint}?${searchParams}` : endpoint;

    return this.request<T>(url, {
      method: 'GET',
    });
  }


  async post<T>(endpoint: string, data?: any): Promise<T> {
    const config: RequestInit = {
      method: 'POST',
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    return this.request<T>(endpoint, config);
  }


  async put<T>(endpoint: string, data?: any): Promise<T> {
    const config: RequestInit = {
      method: 'PUT',
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    return this.request<T>(endpoint, config);
  }


  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const config: RequestInit = {
      method: 'PATCH',
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    return this.request<T>(endpoint, config);
  }


  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }


  async upload<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }


  private authToken?: string;

  setAuthToken(token: string): void {
    this.authToken = token;
  }


  clearAuthToken(): void {
    delete this.authToken;
  }
}


export class ProjectApiService extends ApiService {

  async getProjects() {
    return this.get('/projects');
  }

  async getProject(id: string) {
    return this.get(`/projects/${id}`);
  }

  async createProject(projectData: { name: string; template: string; description?: string }) {
    return this.post('/projects', projectData);
  }

  async updateProject(
    id: string,
    updates: Partial<{
      name: string;
      description: string;
      settings: Record<string, any>;
    }>
  ) {
    return this.patch(`/projects/${id}`, updates);
  }

  async deleteProject(id: string) {
    return this.delete(`/projects/${id}`);
  }


  async getFiles(projectId: string) {
    return this.get(`/projects/${projectId}/files`);
  }

  async getFile(projectId: string, filePath: string) {
    return this.get(`/projects/${projectId}/files`, { path: filePath });
  }

  async saveFile(projectId: string, filePath: string, content: string) {
    return this.post(`/projects/${projectId}/files`, {
      path: filePath,
      content,
    });
  }

  async deleteFile(projectId: string, filePath: string) {
    return this.delete(`/projects/${projectId}/files?path=${encodeURIComponent(filePath)}`);
  }


  async getAiCompletion(prompt: string, context?: string) {
    return this.post('/ai/completion', {
      prompt,
      context,
    });
  }

  async getAiCodeReview(code: string, language: string) {
    return this.post('/ai/review', {
      code,
      language,
    });
  }


  async joinRoom(roomId: string) {
    return this.post(`/collaboration/rooms/${roomId}/join`);
  }

  async leaveRoom(roomId: string) {
    return this.post(`/collaboration/rooms/${roomId}/leave`);
  }


  async gitStatus(projectId: string) {
    return this.get(`/projects/${projectId}/git/status`);
  }

  async gitCommit(projectId: string, message: string, files: string[]) {
    return this.post(`/projects/${projectId}/git/commit`, {
      message,
      files,
    });
  }
}


export const api = new ApiService();
export const projectApi = new ProjectApiService();


export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ProjectResponse {
  id: string;
  name: string;
  description?: string;
  template: string;
  createdAt: string;
  updatedAt: string;
  settings: Record<string, any>;
}

export interface FileResponse {
  path: string;
  name: string;
  content: string;
  language: string;
  size: number;
  lastModified: string;
}

export interface AiResponse {
  completion: string;
  suggestions?: string[];
  confidence: number;
}


export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;


export default api;

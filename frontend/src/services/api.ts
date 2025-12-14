import axios, { type AxiosInstance, type AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import { env } from '../config/env';
import type { Task, CreateTaskDto, UpdateTaskDto, PaginationQuery, PaginatedResponse } from '../types/task';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.VITE_API_URL,
      timeout: env.VITE_API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error: AxiosError) => {
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          (error.response?.status ?? 0) >= 500
        );
      },
      onRetry: (retryCount, error) => {
        console.warn(`Retry attempt ${retryCount} for ${error.config?.url}`);
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.code === 'ECONNABORTED') {
          throw new ApiError(408, 'Request timeout', 'TIMEOUT');
        }

        if (!error.response) {
          throw new ApiError(
            503,
            'Service unavailable. Please check your connection.',
            'NETWORK_ERROR'
          );
        }

        const status = error.response.status;
        const data = error.response.data as { message?: string };

        throw new ApiError(
          status,
          data?.message || error.message || 'An error occurred',
          error.code
        );
      }
    );
  }

  async get<T>(url: string, signal?: AbortSignal): Promise<T> {
    const response = await this.client.get<T>(url, { signal });
    return response.data;
  }

  async post<T>(url: string, data: unknown, signal?: AbortSignal): Promise<T> {
    const response = await this.client.post<T>(url, data, { signal });
    return response.data;
  }

  async put<T>(url: string, data: unknown, signal?: AbortSignal): Promise<T> {
    const response = await this.client.put<T>(url, data, { signal });
    return response.data;
  }

  async delete<T>(url: string, signal?: AbortSignal): Promise<T> {
    const response = await this.client.delete<T>(url, { signal });
    return response.data;
  }
}

const apiClient = new ApiClient();

export const taskApi = {
  /**
   * Get all tasks without pagination
   */
  async getAllTasks(signal?: AbortSignal): Promise<Task[]> {
    return apiClient.get<Task[]>('/tasks', signal);
  },

  /**
   * Get tasks with pagination
   */
  async getTasksPaginated(
    pagination: PaginationQuery,
    signal?: AbortSignal
  ): Promise<PaginatedResponse<Task>> {
    const params = new URLSearchParams();
    if (pagination.page) params.append('page', pagination.page.toString());
    if (pagination.pageSize) params.append('pageSize', pagination.pageSize.toString());

    const url = `/tasks?${params.toString()}`;
    return apiClient.get<PaginatedResponse<Task>>(url, signal);
  },

  async getTaskById(id: string, signal?: AbortSignal): Promise<Task> {
    return apiClient.get<Task>(`/tasks/${id}`, signal);
  },

  async createTask(data: CreateTaskDto, signal?: AbortSignal): Promise<Task> {
    return apiClient.post<Task>('/tasks', data, signal);
  },

  async updateTask(id: string, data: UpdateTaskDto, signal?: AbortSignal): Promise<Task> {
    return apiClient.put<Task>(`/tasks/${id}`, data, signal);
  },

  async deleteTask(id: string, signal?: AbortSignal): Promise<void> {
    return apiClient.delete<void>(`/tasks/${id}`, signal);
  },
};

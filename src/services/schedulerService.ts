// 스케쥴러 관리 서비스 (Scheduler API 연동)
/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  Schedule,
  CreateScheduleRequest,
  UpdateScheduleRequest,
} from '../types/scheduler';

import { getAuthHeaders } from '../utils/authUtils';

// API 기본 설정
const SCHEDULER_BASE_URL = import.meta.env.VITE_SCHEDULER_URL || 'https://api.cadiacinsight.com';

class SchedulerService {
  private getAuthHeaders() {
    return getAuthHeaders();
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${SCHEDULER_BASE_URL}${endpoint}`;

    const headers = new Headers(options.headers);
    const authHeaders = this.getAuthHeaders();

    console.log('📤 Scheduler API Request:', {
      url,
      method: options.method || 'GET',
      hasAuthHeader: !!authHeaders['Authorization'],
    });

    for (const [key, value] of Object.entries(authHeaders)) {
      headers.set(key, value);
    }

    // Content-Type 설정
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json;charset=UTF-8');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('📥 Scheduler API Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Scheduler API Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      // 204 No Content 또는 빈 응답 처리
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T;
      }

      const text = await response.text();
      if (!text) {
        return {} as T;
      }

      return JSON.parse(text);
    } catch (error) {
      console.error(`❌ Scheduler API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // ==================== Task API ====================

  /**
   * 전체 작업 클래스 목록 조회
   * GET /v1/scheduler/tasks
   */
  async getTasks(): Promise<Task[]> {
    return this.request<Task[]>('/v1/scheduler/tasks');
  }

  /**
   * 작업 클래스 단건 조회
   * GET /v1/scheduler/tasks/{task_id}
   */
  async getTask(taskId: string): Promise<Task> {
    return this.request<Task>(`/v1/scheduler/tasks/${taskId}`);
  }

  /**
   * 작업 클래스 생성
   * POST /v1/scheduler/tasks
   */
  async createTask(data: CreateTaskRequest): Promise<Task> {
    return this.request<Task>('/v1/scheduler/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * 작업 클래스 수정
   * PUT /v1/scheduler/tasks/{task_id}
   */
  async updateTask(taskId: string, data: UpdateTaskRequest): Promise<void> {
    return this.request<void>(`/v1/scheduler/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * 작업 클래스 삭제
   * DELETE /v1/scheduler/tasks/{task_id}
   */
  async deleteTask(taskId: string): Promise<void> {
    return this.request<void>(`/v1/scheduler/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // ==================== Schedule API ====================

  /**
   * 전체 스케쥴 목록 조회
   * GET /v1/scheduler/schedules
   */
  async getSchedules(): Promise<Schedule[]> {
    return this.request<Schedule[]>('/v1/scheduler/schedules');
  }

  /**
   * 스케쥴 단건 조회
   * GET /v1/scheduler/schedules/{schedule_id}
   */
  async getSchedule(scheduleId: string): Promise<Schedule> {
    return this.request<Schedule>(`/v1/scheduler/schedules/${scheduleId}`);
  }

  /**
   * 스케쥴 생성
   * POST /v1/scheduler/schedules
   */
  async createSchedule(data: CreateScheduleRequest): Promise<Schedule> {
    return this.request<Schedule>('/v1/scheduler/schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * 스케쥴 수정
   * PUT /v1/scheduler/schedules/{schedule_id}
   */
  async updateSchedule(scheduleId: string, data: UpdateScheduleRequest): Promise<void> {
    return this.request<void>(`/v1/scheduler/schedules/${scheduleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * 스케쥴 삭제
   * DELETE /v1/scheduler/schedules/{schedule_id}
   */
  async deleteSchedule(scheduleId: string): Promise<void> {
    return this.request<void>(`/v1/scheduler/schedules/${scheduleId}`, {
      method: 'DELETE',
    });
  }
}

export const schedulerService = new SchedulerService();

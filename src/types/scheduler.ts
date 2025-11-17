// 스케쥴러 관리 관련 타입 정의

/**
 * 스케쥴 타입 (ENUM)
 */
export type ScheduleType = 'EVENT' | 'CRON';

/**
 * 배치 작업 클래스 정의 (Task)
 * API Response: GET /v1/scheduler/tasks
 */
export interface Task {
  id: string;                           // Primary Key (UUID)
  name: string;                         // 작업명
  description?: string;                 // 설명
  task_class_name: string;              // 작업 클래스명 (실행될 Java 클래스)
  creator_id: string;                   // 생성자 ID
  created_at: string;                   // 생성일시
  updated_at?: string;                  // 수정일시
  deleted_at?: string | null;           // 삭제일시 (소프트 삭제)
}

/**
 * 작업 생성 요청
 * API Request: POST /v1/scheduler/tasks
 */
export interface CreateTaskRequest {
  name: string;
  description?: string;
  task_class_name: string;
  creator_id: string;
}

/**
 * 작업 수정 요청
 * API Request: PUT /v1/scheduler/tasks/{task_id}
 */
export interface UpdateTaskRequest {
  name: string;
  description?: string;
  task_class_name: string;
}

/**
 * 스케쥴 정의 (Schedule)
 * API Response: GET /v1/scheduler/schedules
 */
export interface Schedule {
  id: string;                           // Primary Key (UUID)
  task_id: string;                      // 연결된 Task ID (Foreign Key)
  name: string;                         // 스케쥴명
  description?: string;                 // 설명
  schedule_group?: string;              // 스케쥴 그룹
  schedule_type: ScheduleType;          // 스케쥴 타입 (EVENT, CRON)
  schedule?: string;                    // 스케쥴 표현식 (Cron 표현식 또는 Event ID)
  additional_data?: Record<string, string>; // 추가 데이터
  retry_count?: number;                 // 재시도 횟수
  start_at: string;                     // 시작일시 (ISO 8601)
  end_at: string;                       // 종료일시 (ISO 8601)
  timezone?: string;                    // 타임존 (예: Asia/Seoul)
  created_at?: string;                  // 생성일시
  updated_at?: string;                  // 수정일시
  deleted_at?: string | null;           // 삭제일시 (소프트 삭제)

  // UI에서 사용할 Task 정보 (조인 결과)
  task?: Task;
}

/**
 * 스케쥴 생성 요청
 * API Request: POST /v1/scheduler/schedules
 */
export interface CreateScheduleRequest {
  task_id: string;                      // 연결할 Task ID (UUID)
  name: string;                         // 스케쥴명
  description?: string;                 // 설명
  schedule_group?: string;              // 스케쥴 그룹
  schedule_type: ScheduleType;          // 스케쥴 타입
  schedule?: string;                    // 스케쥴 표현식
  additional_data?: Record<string, string>; // 추가 데이터
  retry_count?: number;                 // 재시도 횟수
  start_at: string;                     // 시작일시 (ISO 8601)
  end_at: string;                       // 종료일시 (ISO 8601)
  timezone?: string;                    // 타임존
}

/**
 * 스케쥴 수정 요청
 * API Request: PUT /v1/scheduler/schedules/{schedule_id}
 */
export interface UpdateScheduleRequest {
  name?: string;
  description?: string;
  schedule_type?: ScheduleType;
  schedule?: string;
  retry_count?: number;
  start_at?: string;
  end_at?: string;
  timezone?: string;
}

/**
 * 스케쥴러 검색 필터
 */
export interface SchedulerSearchFilter {
  keyword?: string;                     // 이름, 설명 검색
  schedule_type?: ScheduleType;         // 스케쥴 타입 필터
  task_id?: string;                     // 특정 Task 필터
}

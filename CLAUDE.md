# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
이 파일은 Claude Code가 이 저장소에서 작업할 때 지침을 제공합니다.

## 🔄 Communication Guidelines / 의사소통 가이드라인

**IMPORTANT FOR CLAUDE CODE INSTANCES:** All communication with the user must be conducted in Korean.
**Claude Code 인스턴스를 위한 중요 사항:** 사용자와의 모든 의사소통은 한국어로 수행해야 합니다.

- When providing explanations or updates, use Korean language
- 설명이나 업데이트를 제공할 때는 한국어를 사용하세요
- Technical terms may be kept in English when commonly used in Korean development context
- 한국 개발 환경에서 일반적으로 사용되는 기술 용어는 영어로 유지할 수 있습니다
- Code comments and documentation should follow bilingual approach (English/Korean) when beneficial
- 코드 주석과 문서는 유익한 경우 이중 언어 접근법(영어/한국어)을 따라야 합니다

## Project Status / 프로젝트 상태

**React-based Platform Management UI / React 기반 플랫폼 관리 UI**
This project is a React TypeScript application built with Vite for managing platform services including authentication, scheduling, notifications, and API gateway.
이 프로젝트는 인증, 스케줄링, 알림, API 게이트웨이 등의 플랫폼 서비스를 관리하기 위한 Vite 기반 React TypeScript 애플리케이션입니다.

**Current Implementation Status / 현재 구현 상태:**
- ✅ Vite + React + TypeScript project setup / Vite + React + TypeScript 프로젝트 설정 완료
- ✅ Core dependencies installed (Ant Design, Redux Toolkit, React Router) / 핵심 의존성 설치 완료
- ✅ Project structure configured / 프로젝트 구조 구성 완료
- ✅ Basic UI components implemented / 기본 UI 컴포넌트 구현 완료
- ✅ Development tools configured (ESLint, Prettier) / 개발 도구 구성 완료
- ✅ S3 + CloudFront deployment environment ready / S3 + CloudFront 배포 환경 준비 완료

## Project Structure / 프로젝트 구조

```
dreamtech-platform-admin-tools/
├── .idea/                     # IntelliJ IDEA configuration / IntelliJ IDEA 구성
├── public/                    # Static assets / 정적 자원
├── src/                       # Source code / 소스 코드
│   ├── components/            # Reusable components / 재사용 가능한 컴포넌트
│   │   ├── layout/           # Layout components / 레이아웃 컴포넌트
│   │   └── common/           # Common UI components / 공통 UI 컴포넌트
│   ├── pages/                # Page components / 페이지 컴포넌트
│   │   ├── dashboard/        # Dashboard pages / 대시보드 페이지
│   │   ├── auth/             # Authentication pages / 인증 페이지
│   │   ├── settings/         # Settings pages / 설정 페이지
│   │   └── monitoring/       # Monitoring pages / 모니터링 페이지
│   ├── store/                # Redux store / Redux 스토어
│   ├── hooks/                # Custom React hooks / 커스텀 React 훅
│   ├── utils/                # Utility functions / 유틸리티 함수
│   ├── types/                # TypeScript type definitions / TypeScript 타입 정의
│   ├── services/             # API service layer / API 서비스 레이어
│   └── constants/            # Application constants / 애플리케이션 상수
├── package.json              # Dependencies and scripts / 의존성 및 스크립트
├── vite.config.ts           # Vite configuration / Vite 구성
└── CLAUDE.md                # This documentation / 이 문서
```

## Development Setup / 개발 환경 설정

**Technology Stack / 기술 스택:**
- **Frontend Framework**: React 18 + TypeScript / React 18 + TypeScript
- **Build Tool**: Vite / 빌드 도구: Vite
- **UI Library**: Ant Design / UI 라이브러리: Ant Design
- **State Management**: Redux Toolkit + RTK Query / 상태 관리: Redux Toolkit + RTK Query
- **Routing**: React Router v6 / 라우팅: React Router v6
- **Code Quality**: ESLint + Prettier / 코드 품질: ESLint + Prettier

**Development Commands / 개발 명령어:**
```bash
npm install          # Install dependencies / 의존성 설치
npm run dev         # Start development server / 개발 서버 시작
npm run build       # Build for production / 프로덕션 빌드
npm run preview     # Preview production build / 프로덕션 빌드 미리보기
npm run lint        # Run ESLint / ESLint 실행
```

**Deployment / 배포:**
- **Hosting**: AWS S3 + CloudFront / AWS S3 + CloudFront 호스팅
- **CI/CD**: GitHub Actions / GitHub Actions
- **Manual Deployment**: `./deploy.sh` script / `./deploy.sh` 스크립트
- **Infrastructure**: CloudFormation template / CloudFormation 템플릿

```bash
# Manual deployment / 수동 배포
export S3_BUCKET_NAME=dreamtech-admin-ui
export CLOUDFRONT_DISTRIBUTION_ID=your-distribution-id
./deploy.sh

# CloudFormation deployment / CloudFormation 배포
aws cloudformation deploy \
  --template-file cloudformation/s3-cloudfront.yaml \
  --stack-name dreamtech-admin-ui \
  --parameter-overrides BucketName=dreamtech-admin-ui
```

**Backend Integration / 백엔드 통합:**
- **API Gateway**: Spring Cloud Gateway on EKS / EKS 환경의 Spring Cloud Gateway
- **Authentication Server**: Spring Cloud + OAuth2/OpenID / Spring Cloud + OAuth2/OpenID
- **Microservices**: Spring Cloud (Authentication, Scheduling, Notifications) / Spring Cloud 마이크로서비스
- **Additional Services**: FastAPI services / 추가 서비스: FastAPI

## 📋 완료된 개발 항목 (Completed Development Items)

### Phase 1: User Type Definitions 관리 ✅
- **목표**: `user_type_definitions` 테이블 기반 사용자 유형 관리
- **구현 내용**:
  - UserTypeDefinition 타입 정의 (`src/types/user-management.ts`)
  - API 메소드 구현: CRUD + activation toggle (`src/services/userManagementService.ts`)
  - UserTypes 페이지 (`src/pages/settings/UserTypes.tsx`)
  - UserTypeFormModal 컴포넌트 (`src/components/settings/UserTypeFormModal.tsx`)
  - 라우팅: `/settings/user-types`

### Phase 2: Service Scopes 관리 ✅
- **목표**: `service_scopes` 테이블 기반 서비스 스코프 관리
- **구현 내용**:
  - ServiceScope 타입 정의
  - API 메소드: 생성, 조회, 수정 (**삭제 API 없음**)
  - PlatformServices 페이지 (`src/pages/settings/PlatformServices.tsx`)
  - ServiceFormModal 컴포넌트 (`src/components/settings/ServiceFormModal.tsx`)
  - 라우팅: `/settings/services`
- **중요**: bit_position은 서버 자동 할당, 삭제 불가 (비트마스크 gaps 방지)

### Phase 3: OAuth Client Authority Types 관리 ✅
- **목표**: OAuth 클라이언트가 생성 가능한 User Type 관리
- **구현 내용**:
  - ClientAuthorityType 타입 정의
  - ClientAuthorityTypesManager 컴포넌트 (`src/components/oauth/ClientAuthorityTypesManager.tsx`)
  - OAuthClients 페이지에 통합 (`src/pages/user-management/OAuthClients.tsx`)

### Phase 4: Role Management (Global + Service Roles) ✅
- **목표**: 글로벌 역할과 서비스 역할 통합 관리
- **구현 내용**:
  - GlobalRole, ServiceRoleDefinition 타입 정의
  - API 메소드: CRUD + activation toggle (각각)
  - RoleManagement 메인 페이지 (Tabs 구조, `src/pages/settings/RoleManagement.tsx`)
  - GlobalRolesTab (`src/components/settings/GlobalRolesTab.tsx`)
  - ServiceRolesTab (`src/components/settings/ServiceRolesTab.tsx`)
  - GlobalRoleFormModal, ServiceRoleFormModal 컴포넌트
  - 라우팅: `/settings/roles`

---

## 🔧 핵심 개발 가이드라인 (Development Guidelines)

### 1. API 연동 규칙 (API Integration Rules)

#### 1.1 필드 네이밍
- **API 필드**: `snake_case` (예: `user_type`, `is_active`, `created_at`)
- **TypeScript 인터페이스**: `snake_case` (API 응답과 동일하게 유지)
- **중요**: camelCase 변환하지 않음

#### 1.2 API 메소드 패턴
```typescript
// 목록 조회
async getItems(): Promise<ItemType[]> {
  return this.request<ItemType[]>('/v1/management/items');
}

// 생성
async createItem(data: CreateData): Promise<ItemType> {
  return this.request<ItemType>('/v1/management/items', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 수정
async updateItem(id: string, data: UpdateData): Promise<ItemType> {
  return this.request<ItemType>(`/v1/management/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ⚠️ 활성화/비활성화는 별도 PATCH 엔드포인트
async toggleItemActivation(id: string, isActive: boolean): Promise<ItemType> {
  return this.request<ItemType>(`/v1/management/items/${id}/activation`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: isActive }),
  });
}

// 삭제
async deleteItem(id: string): Promise<void> {
  return this.request<void>(`/v1/management/items/${id}`, {
    method: 'DELETE',
  });
}
```

### 2. 중요 개발 규칙 (Critical Rules)

#### ⚠️ 규칙 1: is_active는 항상 별도 PATCH API 사용
```typescript
// ❌ 잘못된 방법
await service.update(id, {
  field1: value1,
  is_active: true  // 절대 PUT에 포함하지 마세요!
});

// ✅ 올바른 방법
await service.toggleActivation(id, true);
```

**예외**: Service Scope는 PUT API에 is_active 포함 (별도 PATCH 엔드포인트 없음)

#### ⚠️ 규칙 2: ID 필드는 수정 불가
```typescript
<Form.Item name="id">
  <Input disabled={isEditing} />  // 수정 모드에서는 반드시 비활성화
</Form.Item>
```

#### ⚠️ 규칙 3: 시스템 리소스는 삭제/수정 불가
```typescript
// is_system_role 또는 is_system_type이 true면 삭제 버튼 비활성화
<Button
  danger
  disabled={record.is_system_role}
  onClick={() => handleDelete(record.id)}
>
  삭제
</Button>
```

#### ⚠️ 규칙 4: 변경 감지 및 저장 버튼 제어
```typescript
// 폼 변경 감지 (is_active 제외)
const handleFormChange = () => {
  if (!isEditing) {
    setHasChanges(true);
    return;
  }

  // 수정 모드: is_active 제외한 필드만 체크
  const fieldsToCheck = ['display_name', 'description', ...];
  const touched = form.isFieldsTouched(fieldsToCheck);
  setHasChanges(touched);
};

// 저장 버튼 비활성화 조건
const isSaveButtonDisabled = isEditing && !hasChanges && !activationChanged;
```

### 3. 폼 모달 컴포넌트 구조 (Form Modal Pattern)

```typescript
export function ItemFormModal({ open, onCancel, onSave, item }: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activationChanged, setActivationChanged] = useState(false);
  const [newActivationState, setNewActivationState] = useState<boolean | undefined>();

  const isEditing = !!item;

  useEffect(() => {
    if (open) {
      setHasChanges(false);
      setActivationChanged(false);
      setNewActivationState(undefined);

      if (item) {
        form.setFieldsValue(item);
      } else {
        form.resetFields();
      }
    }
  }, [open, item, form]);

  const handleSave = async () => {
    const values = await form.validateFields();
    setLoading(true);

    if (isEditing && item) {
      // 1. 활성 상태 변경 처리 (별도 API)
      if (activationChanged && newActivationState !== undefined) {
        await service.toggleActivation(item.id, newActivationState);
        message.success(`${newActivationState ? '활성화' : '비활성화'}되었습니다`);
      }

      // 2. 일반 필드 수정 (is_active 제외)
      if (hasChanges) {
        await service.update(item.id, values);
        message.success('수정되었습니다');
      }

      onSave({ ...item, ...values });
    } else {
      onSave(values);
    }

    form.resetFields();
    setLoading(false);
  };

  return (
    <Modal
      okButtonProps={{ disabled: isSaveButtonDisabled }}
      onOk={handleSave}
    >
      <Form form={form} onValuesChange={handleFormChange}>
        {/* 폼 필드 */}
      </Form>
    </Modal>
  );
}
```

### 4. 데이터 구조별 특이사항

#### User Type Definitions
- **PK**: `type_id` (수정 불가)
- **활성화**: PATCH `/v1/management/user-types/{typeId}/activation`
- **시스템 타입**: `is_system_type = true`이면 삭제 불가

#### Service Scopes
- **PK**: `service_id` (수정 불가)
- **특이사항**:
  - `bit_position`은 서버 자동 할당 (read-only)
  - **삭제 API 없음** (비트 위치 gaps 방지)
  - `is_active`는 PUT API로 관리 (별도 PATCH 없음!)

#### Global Roles
- **PK**: `role_id` (수정 불가)
- **권한 레벨**: `authority_level` (1-100, 낮을수록 높은 권한)
- **계층 구조**: `parent_role_id`로 부모 역할 참조
- **권한 형식**: `resource:action` (예: `user:manage`, `*:*`)
- **활성화**: PATCH `/v1/management/roles/global/{roleId}/activation`

#### Service Roles
- **Composite Key**: `(service_id, role_name)` 조합
- **rowKey**: `${record.service_id}:${record.role_name}`
- **권한 형식**: `resource:action` (예: `analysis:read`, `report:write`)
- **활성화**: PATCH `/v1/management/roles/services/{serviceId}/{roleName}/activation`

### 5. 권한(Permissions) 관리 UI

```typescript
// 권한 형식 검증 정규식
const permissionPattern = /^[a-z*][a-z0-9_*]*:[a-z*][a-z0-9_*:]*$/;

// Tag 기반 권한 추가
const handleAddPermission = () => {
  const trimmed = permissionInput.trim();

  if (!permissionPattern.test(trimmed)) {
    message.warning('권한 형식이 올바르지 않습니다. (예: user:manage, *:*)');
    return;
  }

  if (permissions.includes(trimmed)) {
    message.warning('이미 추가된 권한입니다');
    return;
  }

  setPermissions([...permissions, trimmed]);
  setPermissionInput('');
};

// UI 렌더링
<Input
  value={permissionInput}
  onPressEnter={handleAddPermission}
  suffix={<PlusOutlined onClick={handleAddPermission} />}
/>
<Space wrap>
  {permissions.map(permission => (
    <Tag closable onClose={() => handleRemovePermission(permission)}>
      {permission}
    </Tag>
  ))}
</Space>
```

### 6. 라우팅 구조

```typescript
// AppContent.tsx
<Route path="settings/user-types" element={<UserTypes />} />
<Route path="settings/services" element={<PlatformServices />} />
<Route path="settings/roles" element={<RoleManagement />} />
<Route path="users/oauth-clients" element={<OAuthClients />} />
```

---

## 🚀 작업 재개 프로세스 (Resume Development Process)

### 1. 개발 환경 준비
```bash
cd /home/snk81/IdeaProjects/dreamtech-platform-admin-tools
npm run dev
```

### 2. 현재 완료 상태 확인
- ✅ User Types 관리 (`/settings/user-types`)
- ✅ Service Scopes 관리 (`/settings/services`)
- ✅ OAuth Client Authority Types
- ✅ Role Management - Global & Service (`/settings/roles`)

### 3. 브라우저 테스트
- http://localhost:5173
- 각 관리 페이지 동작 확인
- API 연동 상태 확인 (개발자 도구 콘솔)

### 4. 다음 작업 (미완성)
- Authority Templates 구현 (`/settings/templates`)
- 실제 백엔드 API 테스트 및 디버깅
- 추가 권한 관리 기능

---

## 📁 주요 파일 위치 (Key File Locations)

```
src/
├── types/
│   └── user-management.ts              # 모든 타입 정의
├── services/
│   └── userManagementService.ts        # 모든 API 메소드 (1000줄+)
├── pages/
│   ├── settings/
│   │   ├── UserTypes.tsx
│   │   ├── PlatformServices.tsx
│   │   └── RoleManagement.tsx          # Global + Service Roles (Tabs)
│   └── user-management/
│       └── OAuthClients.tsx
├── components/
│   ├── settings/
│   │   ├── UserTypeFormModal.tsx
│   │   ├── ServiceFormModal.tsx
│   │   ├── GlobalRolesTab.tsx
│   │   ├── ServiceRolesTab.tsx
│   │   ├── GlobalRoleFormModal.tsx
│   │   └── ServiceRoleFormModal.tsx
│   └── oauth/
│       └── ClientAuthorityTypesManager.tsx
└── AppContent.tsx                       # 라우팅 설정
```

---

## 💡 개발 원칙 (Development Principles)

1. **일관성 (Consistency)**: 모든 관리 페이지는 동일한 패턴 적용
2. **분리 (Separation)**: `is_active`는 항상 별도 API로 처리 (Service Scope 제외)
3. **검증 (Validation)**: 폼 입력 시 정규식으로 패턴 검증
4. **안전 (Safety)**: 시스템 리소스는 삭제/수정 불가 처리
5. **사용성 (Usability)**: 변경사항 없을 시 저장 버튼 비활성화
6. **피드백 (Feedback)**: 모든 작업 후 `message`로 결과 알림

---

## ⚠️ 주의사항 (Important Notes)

1. **커밋 메시지**: 한국어로 작성, "Generated with Claude" 문구 제거
2. **API 응답 필드**: snake_case 그대로 사용 (camelCase 변환 금지)
3. **Service Scope 삭제**: 삭제 API 없음, UI에서 삭제 버튼 제거됨
4. **시스템 리소스**: `is_system_role`, `is_system_type` 확인 후 UI 제어
5. **복합키**: Service Role은 `(service_id, role_name)` 조합이 PK

---

이 문서를 참고하여 작업을 이어갈 수 있습니다. 궁금한 사항은 언제든지 문의하세요!
- 커밋 메시지 작성 요청 시 클로드가 작성했다는 내용을 생략해
- 커밋 메시지는 명료하고 간결하게 작성할 것
- 커밋 요청 시 직접 커밋은 금지하고 메시지만 작성할 것
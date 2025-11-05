// 사용자 기본 정보 폼 필드 (재사용 컴포넌트)

import { Form, Input, Select } from 'antd';
import { USER_TYPES, USER_STATUS_OPTIONS } from '../../constants/user-management';

interface UserFormFieldsProps {
  isEditing?: boolean; // 편집 모드 여부
}

export function UserFormFields({ isEditing = false }: UserFormFieldsProps) {
  return (
    <>
      <Form.Item
        label="이메일"
        name="email"
        rules={[
          { required: true, message: '이메일을 입력하세요' },
          { type: 'email', message: '올바른 이메일 형식이 아닙니다' },
        ]}
      >
        <Input
          placeholder="user@example.com"
          disabled={isEditing} // 수정 시에는 이메일 변경 불가
        />
      </Form.Item>

      {!isEditing && (
        <Form.Item
          label="비밀번호"
          name="password"
          rules={[
            { required: true, message: '비밀번호를 입력하세요' },
            { min: 8, message: '비밀번호는 최소 8자 이상이어야 합니다' },
          ]}
        >
          <Input.Password placeholder="비밀번호 (최소 8자)" />
        </Form.Item>
      )}

      <Form.Item
        label="이름"
        name="name"
        rules={[{ required: true, message: '이름을 입력하세요' }]}
      >
        <Input placeholder="홍길동" />
      </Form.Item>

      <Form.Item
        label="전화번호"
        name="phoneNumber"
        rules={[
          { pattern: /^[+\d\s()-]+$/, message: '올바른 전화번호 형식이 아닙니다' },
        ]}
      >
        <Input placeholder="+82-10-1234-5678" />
      </Form.Item>

      {!isEditing && (
        <Form.Item
          label="사용자 유형"
          name="userType"
          rules={[{ required: true, message: '사용자 유형을 선택하세요' }]}
          tooltip="사용자 유형은 회원가입 시 결정되며, 기본 플랫폼 역할이 자동으로 부여됩니다"
        >
          <Select
            placeholder="사용자 유형 선택"
            options={USER_TYPES.map(type => ({
              label: `${type.label} (${type.description})`,
              value: type.value,
            }))}
          />
        </Form.Item>
      )}

      <Form.Item label="부서" name="department">
        <Input placeholder="개발팀" />
      </Form.Item>

      <Form.Item label="직책" name="position">
        <Input placeholder="팀장" />
      </Form.Item>

      <Form.Item
        label="상태"
        name="status"
        rules={[{ required: true, message: '상태를 선택하세요' }]}
      >
        <Select
          placeholder="상태 선택"
          options={USER_STATUS_OPTIONS.map(status => ({
            label: status.label,
            value: status.value,
          }))}
        />
      </Form.Item>
    </>
  );
}
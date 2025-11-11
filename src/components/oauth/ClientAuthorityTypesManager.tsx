// OAuth 클라이언트 권한 유형 관리 컴포넌트

import { Card, Checkbox, Radio, Space, Typography, Alert } from 'antd';
import type { UserType, ClientAuthorityType, UserTypeDefinition } from '../../types/user-management';

const { Text } = Typography;

interface ClientAuthorityTypesManagerProps {
  value?: ClientAuthorityType[];
  onChange?: (value: ClientAuthorityType[]) => void;
  userTypeDefinitions: UserTypeDefinition[];  // 동적 User Type 목록
}

export function ClientAuthorityTypesManager({ value = [], onChange, userTypeDefinitions }: ClientAuthorityTypesManagerProps) {
  // 선택된 User Type 목록
  const selectedUserTypes = value.map(at => at.user_type);

  // 기본 User Type
  const defaultUserType = value.find(at => at.is_default)?.userType;

  // displayOrder 순으로 정렬된 User Type 목록
  const sortedUserTypes = [...userTypeDefinitions].sort((a, b) => a.display_order - b.display_order);

  // User Type 선택/해제
  const handleUserTypeChange = (user_type: UserType, checked: boolean) => {
    if (checked) {
      // 추가
      const newValue = [
        ...value,
        {
          user_type,
          is_default: value.length === 0, // 첫 번째 항목은 자동으로 기본값
        },
      ];
      onChange?.(newValue);
    } else {
      // 제거
      const newValue = value.filter(at => at.user_type !== user_type);
      // 기본값이 제거된 경우, 첫 번째 항목을 기본값으로 설정
      if (defaultUserType === user_type && newValue.length > 0) {
        newValue[0].is_default = true;
      }
      onChange?.(newValue);
    }
  };

  // 기본 User Type 변경
  const handleDefaultChange = (user_type: UserType) => {
    const newValue = value.map(at => ({
      ...at,
      is_default: at.user_type === user_type,
    }));
    onChange?.(newValue);
  };

  return (
    <Card size="small" style={{ backgroundColor: '#fafafa' }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Alert
          message="클라이언트 권한 유형 (Client Authority Types)"
          description={
            <div>
              <p>이 클라이언트를 통해 생성 가능한 User Type을 선택합니다.</p>
              <ul style={{ marginLeft: -16, marginBottom: 0 }}>
                <li><strong>Service 클라이언트</strong>: 사용자 생성 불가 (client_credentials만 사용)</li>
                <li><strong>Application/Web/Mobile 클라이언트</strong>: 선택한 User Type의 사용자만 회원가입 가능</li>
                <li><strong>기본 User Type</strong>: 회원가입 시 자동으로 선택되는 유형 (하나만 지정 가능)</li>
              </ul>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 8 }}
        />

        <div>
          <Text strong>생성 가능한 User Type 선택</Text>
          <div style={{ marginTop: 8 }}>
            <Space direction="vertical">
              {sortedUserTypes.map(userTypeDef => (
                <Checkbox
                  key={userTypeDef.type_id}
                  checked={selectedUserTypes.includes(userTypeDef.type_id)}
                  onChange={e => handleUserTypeChange(userTypeDef.type_id, e.target.checked)}
                >
                  <Space direction="vertical" size={0}>
                    <Space>
                      <Text>{userTypeDef.display_name}</Text>
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        ({userTypeDef.type_id})
                      </Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      {userTypeDef.description}
                    </Text>
                  </Space>
                </Checkbox>
              ))}
            </Space>
          </div>
        </div>

        {value.length > 0 && (
          <div>
            <Text strong>기본 User Type</Text>
            <div style={{ marginTop: 8 }}>
              <Radio.Group value={defaultUserType} onChange={e => handleDefaultChange(e.target.value)}>
                <Space direction="vertical">
                  {value.map(at => {
                    const userTypeInfo = userTypeDefinitions.find(ut => ut.type_id === at.user_type);
                    return (
                      <Radio key={at.user_type} value={at.user_type}>
                        <Space>
                          <Text>{userTypeInfo?.display_name || at.user_type}</Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            (회원가입 시 기본 선택)
                          </Text>
                        </Space>
                      </Radio>
                    );
                  })}
                </Space>
              </Radio.Group>
            </div>
          </div>
        )}

        {value.length === 0 && (
          <Alert
            message="선택된 User Type이 없습니다"
            description="이 클라이언트를 통해 사용자를 생성할 수 없습니다 (Service 클라이언트에 적합)."
            type="warning"
            showIcon
          />
        )}
      </Space>
    </Card>
  );
}
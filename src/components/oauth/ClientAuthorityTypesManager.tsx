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
  const selectedUserTypes = value.map(at => at.userType);

  // 기본 User Type
  const defaultUserType = value.find(at => at.isDefault)?.userType;

  // displayOrder 순으로 정렬된 User Type 목록
  const sortedUserTypes = [...userTypeDefinitions].sort((a, b) => a.displayOrder - b.displayOrder);

  // User Type 선택/해제
  const handleUserTypeChange = (userType: UserType, checked: boolean) => {
    if (checked) {
      // 추가
      const newValue = [
        ...value,
        {
          userType,
          isDefault: value.length === 0, // 첫 번째 항목은 자동으로 기본값
        },
      ];
      onChange?.(newValue);
    } else {
      // 제거
      const newValue = value.filter(at => at.userType !== userType);
      // 기본값이 제거된 경우, 첫 번째 항목을 기본값으로 설정
      if (defaultUserType === userType && newValue.length > 0) {
        newValue[0].isDefault = true;
      }
      onChange?.(newValue);
    }
  };

  // 기본 User Type 변경
  const handleDefaultChange = (userType: UserType) => {
    const newValue = value.map(at => ({
      ...at,
      isDefault: at.userType === userType,
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
                  key={userTypeDef.typeId}
                  checked={selectedUserTypes.includes(userTypeDef.typeId)}
                  onChange={e => handleUserTypeChange(userTypeDef.typeId, e.target.checked)}
                >
                  <Space direction="vertical" size={0}>
                    <Space>
                      <Text>{userTypeDef.displayName}</Text>
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        ({userTypeDef.typeId})
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
                    const userTypeInfo = userTypeDefinitions.find(ut => ut.typeId === at.userType);
                    return (
                      <Radio key={at.userType} value={at.userType}>
                        <Space>
                          <Text>{userTypeInfo?.displayName || at.userType}</Text>
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
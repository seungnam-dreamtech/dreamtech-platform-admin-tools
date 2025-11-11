// 서비스 가입 관리 컴포넌트 (Transfer 스타일)

import { useState, useEffect } from 'react';
import { Transfer, Tag, Space, Typography } from 'antd';
import type { TransferProps } from 'antd';
import { MOCK_SERVICES } from '../../constants/user-management';
import type { ServiceSubscription } from '../../types/user-management';

const { Text } = Typography;

interface ServiceSubscriptionManagerProps {
  value?: ServiceSubscription[];
  onChange?: (subscriptions: ServiceSubscription[]) => void;
  preSelectedServiceId?: string; // 특정 서비스에서 사용자 추가 시 자동 선택
}

interface TransferItem {
  key: string;
  title: string;
  description: string;
  icon: string;
  defaultRole: string;
  disabled?: boolean;
}

export function ServiceSubscriptionManager({
  value = [],
  onChange,
  preSelectedServiceId,
}: ServiceSubscriptionManagerProps) {
  const [targetKeys, setTargetKeys] = useState<string[]>([]);

  // value prop이 변경되면 targetKeys 업데이트
  useEffect(() => {
    const keys = value.map(sub => sub.serviceId);
    setTargetKeys(keys);
  }, [value]);

  // preSelectedServiceId가 있으면 자동 선택
  useEffect(() => {
    if (preSelectedServiceId && !targetKeys.includes(preSelectedServiceId) && handleChange) {
      handleChange([...targetKeys, preSelectedServiceId], 'right', [preSelectedServiceId]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preSelectedServiceId]);

  // Transfer 데이터 소스 생성
  const dataSource: TransferItem[] = MOCK_SERVICES.map(service => ({
    key: service.id,
    title: service.displayName,
    description: service.description,
    icon: service.icon || '',
    defaultRole: service.defaultRole,
  }));

  const handleChange: TransferProps['onChange'] = (newTargetKeys) => {
    setTargetKeys(newTargetKeys as string[]);

    // onChange 콜백 호출
    if (onChange) {
      const newSubscriptions: ServiceSubscription[] = (newTargetKeys as string[]).map(serviceId => {
        // 기존 구독 정보가 있으면 유지
        const existing = value.find(sub => sub.serviceId === serviceId);
        if (existing) {
          return existing;
        }

        // 새로 추가된 서비스는 기본 역할로 초기화
        const service = MOCK_SERVICES.find(s => s.id === serviceId);
        return {
          serviceId: serviceId,
          serviceName: service?.displayName || serviceId,
          subscribedAt: new Date().toISOString(),
          status: 'active' as const,
          roles: service ? [service.defaultRole] : [],
        };
      });

      onChange(newSubscriptions);
    }
  };

  // Transfer 아이템 렌더링
  const renderItem: TransferProps['render'] = item => {
    const service = MOCK_SERVICES.find(s => s.id === item.key);
    const isSubscribed = targetKeys.includes(item.key);

    return {
      label: (
        <Space direction="vertical" size={0} style={{ width: '100%' }}>
          <Space>
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            <Text strong>{item.title}</Text>
            {isSubscribed && <Tag color="green">가입됨</Tag>}
          </Space>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {item.description}
          </Text>
          {service && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              기본 역할: <Tag color="blue" style={{ fontSize: '10px' }}>{service.defaultRole}</Tag>
            </Text>
          )}
        </Space>
      ),
      value: item.title,
    };
  };

  return (
    <div>
      <Transfer
        dataSource={dataSource}
        targetKeys={targetKeys}
        onChange={handleChange}
        render={renderItem}
        titles={['가입 가능한 서비스', '가입된 서비스']}
        listStyle={{
          width: 350,
          height: 400,
        }}
        showSearch
        filterOption={(inputValue, item) =>
          item.title.toLowerCase().includes(inputValue.toLowerCase()) ||
          item.description.toLowerCase().includes(inputValue.toLowerCase())
        }
        locale={{
          itemUnit: '개',
          itemsUnit: '개',
          searchPlaceholder: '서비스 검색',
          notFoundContent: '서비스 없음',
        }}
      />
    </div>
  );
}
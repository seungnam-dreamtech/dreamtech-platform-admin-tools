// CloudFoundryRouteService Predicate 폼 컴포넌트
import React from 'react';
import { Alert, Tag } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import type { ActuatorCloudFoundryRouteServicePredicateArgs } from '../../../../types/gateway';

interface CloudFoundryRouteServicePredicateFormProps {
  value: ActuatorCloudFoundryRouteServicePredicateArgs;
  onChange: (value: ActuatorCloudFoundryRouteServicePredicateArgs) => void;
}

export const CloudFoundryRouteServicePredicateForm: React.FC<CloudFoundryRouteServicePredicateFormProps> = () => {
  return (
    <div>
      <Alert
        message="CloudFoundry Route Service Predicate"
        description={
          <div>
            <p style={{ marginBottom: '8px' }}>
              이 Predicate는 CloudFoundry 환경에서 Route Service 요청을 감지합니다.
            </p>
            <p style={{ marginBottom: '8px' }}>
              별도의 설정 파라미터가 필요하지 않으며, CloudFoundry의 <code>X-CF-Forwarded-Url</code> 헤더를 기반으로 동작합니다.
            </p>
          </div>
        }
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
      />

      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
        <strong>CloudFoundry Route Service 동작:</strong>
        <div style={{ marginTop: '8px' }}>
          <div style={{ marginBottom: '8px' }}>
            <Tag color="blue" style={{ fontSize: '11px' }}>헤더 감지</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              요청에 <code>X-CF-Forwarded-Url</code> 헤더가 있으면 매칭
            </div>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <Tag color="green" style={{ fontSize: '11px' }}>자동 처리</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              CloudFoundry가 자동으로 추가하는 헤더를 감지하여 라우팅
            </div>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <Tag color="orange" style={{ fontSize: '11px' }}>사용 사례</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              CloudFoundry 플랫폼에서 Route Service 패턴 구현 시 사용
            </div>
          </div>
        </div>
        <div style={{ marginTop: '8px', color: '#fa8c16' }}>
          💡 CloudFoundry 환경이 아닌 경우 이 Predicate는 매칭되지 않습니다
        </div>
      </div>
    </div>
  );
};
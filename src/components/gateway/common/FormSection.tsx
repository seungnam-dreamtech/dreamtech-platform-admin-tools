// 폼 섹션 공통 컴포넌트
import React from 'react';
import { Card } from 'antd';

interface FormSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  extra?: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  icon,
  children,
  extra
}) => {
  return (
    <Card
      size="small"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {icon}
          <div>
            <div style={{ fontWeight: 'bold' }}>{title}</div>
            {description && (
              <div style={{ fontSize: '12px', fontWeight: 'normal', color: '#8c8c8c', marginTop: '4px' }}>
                {description}
              </div>
            )}
          </div>
        </div>
      }
      extra={extra}
      style={{ marginBottom: '16px' }}
    >
      {children}
    </Card>
  );
};
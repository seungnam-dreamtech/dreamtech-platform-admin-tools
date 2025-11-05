// 사용자 상세/편집 모달 (공통 재사용 컴포넌트)

import { useState, useEffect } from 'react';
import { Modal, Form, Tabs, message } from 'antd';
import type { TabsProps } from 'antd';
import { UserFormFields } from './UserFormFields';
import { ServiceSubscriptionManager } from './ServiceSubscriptionManager';
import { RoleManager } from './RoleManager';
import { userManagementService } from '../../services/userManagementService';
import type { PlatformUser, ServiceSubscription } from '../../types/user-management';

interface UserDetailModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  user?: PlatformUser | null; // null이면 신규 추가, 값이 있으면 편집
  preSelectedServiceId?: string; // 특정 서비스에서 사용자 추가 시 자동 선택
}

export function UserDetailModal({
  open,
  onCancel,
  onSuccess,
  user,
  preSelectedServiceId,
}: UserDetailModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // 서비스 가입 정보 (탭 간 공유 상태)
  const [serviceSubscriptions, setServiceSubscriptions] = useState<ServiceSubscription[]>([]);
  const [platformRoles, setPlatformRoles] = useState<string[]>([]);

  const isEditing = !!user;

  // 모달이 열릴 때 폼 초기화
  useEffect(() => {
    if (open) {
      if (user) {
        // 편집 모드: 기존 사용자 정보로 폼 초기화
        form.setFieldsValue({
          email: user.email,
          name: user.name,
          phoneNumber: user.phoneNumber,
          department: user.department,
          position: user.position,
          status: user.status,
          userType: user.userType,
        });
        setServiceSubscriptions(user.serviceSubscriptions || []);
        setPlatformRoles(user.platformRoles || []);
      } else {
        // 추가 모드: 폼 초기화
        form.resetFields();
        form.setFieldsValue({
          status: 'active',
        });
        setServiceSubscriptions([]);
        setPlatformRoles([]);
      }
      setActiveTab('basic'); // 항상 기본 정보 탭부터 시작
    }
  }, [open, user, form]);

  // 저장 핸들러
  const handleSave = async () => {
    try {
      // 1단계: 기본 정보 폼 검증
      const basicValues = await form.validateFields();

      setLoading(true);

      // 2단계: 전체 데이터 병합
      const userData = {
        ...basicValues,
        platformRoles,
        serviceSubscriptions: serviceSubscriptions.map(sub => ({
          serviceId: sub.serviceId,
          roles: sub.roles,
        })),
      };

      // 3단계: API 호출
      if (isEditing && user) {
        // 수정
        await userManagementService.updateUser(user.id, userData);
        message.success('사용자 정보가 수정되었습니다');
      } else {
        // 신규 추가
        await userManagementService.createUser(userData);
        message.success('새 사용자가 추가되었습니다');
      }

      onSuccess();
      handleClose();

    } catch (error) {
      console.error('사용자 저장 실패:', error);
      if (error instanceof Error && error.message.includes('validateFields')) {
        message.error('필수 입력 항목을 확인하세요');
      } else {
        message.error('사용자 저장에 실패했습니다');
      }
    } finally {
      setLoading(false);
    }
  };

  // 모달 닫기
  const handleClose = () => {
    form.resetFields();
    setServiceSubscriptions([]);
    setPlatformRoles([]);
    setActiveTab('basic');
    onCancel();
  };

  // 탭 아이템 정의
  const tabItems: TabsProps['items'] = [
    {
      key: 'basic',
      label: '기본 정보',
      children: (
        <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: 16 }}>
          <Form form={form} layout="vertical">
            <UserFormFields isEditing={isEditing} />
          </Form>
        </div>
      ),
    },
    {
      key: 'services',
      label: `서비스 가입 (${serviceSubscriptions.length})`,
      children: (
        <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: 16 }}>
          <ServiceSubscriptionManager
            value={serviceSubscriptions}
            onChange={setServiceSubscriptions}
            preSelectedServiceId={preSelectedServiceId}
          />
        </div>
      ),
    },
    {
      key: 'roles',
      label: '역할 및 권한',
      children: (
        <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: 16 }}>
          <RoleManager
            platformRoles={platformRoles}
            onPlatformRolesChange={setPlatformRoles}
            serviceSubscriptions={serviceSubscriptions}
            onServiceSubscriptionsChange={setServiceSubscriptions}
            userType={user?.userType || form.getFieldValue('userType')}
          />
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={isEditing ? '사용자 정보 수정' : '새 사용자 추가'}
      open={open}
      onCancel={handleClose}
      onOk={handleSave}
      okText={isEditing ? '수정' : '추가'}
      cancelText="취소"
      confirmLoading={loading}
      width={900}
      destroyOnClose
      maskClosable={false}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        style={{ marginTop: 16 }}
      />
    </Modal>
  );
}
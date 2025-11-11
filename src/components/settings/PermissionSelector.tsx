// 권한 선택 컴포넌트 (Tree 구조)
import { useState, useEffect } from 'react';
import { Tree, Input, Space, Tag, Alert, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { TreeDataNode } from 'antd';
import { userManagementService } from '../../services/userManagementService';
import type { GroupedPermissions } from '../../types/user-management';

const { Search } = Input;

interface PermissionSelectorProps {
  value?: string[]; // 선택된 권한 문자열 배열 (예: ["user:manage", "hospital:read"])
  onChange?: (selectedPermissions: string[]) => void;
  serviceFilter?: string; // 특정 서비스만 필터링 (Service Role용)
  disabled?: boolean;
}

export default function PermissionSelector({
  value = [],
  onChange,
  serviceFilter,
  disabled = false,
}: PermissionSelectorProps) {
  const [loading, setLoading] = useState(false);
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermissions[]>([]);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>(value);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 그룹화된 권한 데이터 로드
  useEffect(() => {
    loadGroupedPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 체크된 키가 변경될 때 부모 컴포넌트에 알림
  useEffect(() => {
    if (onChange) {
      onChange(checkedKeys as string[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedKeys]);

  // value prop이 변경되면 체크 상태 업데이트
  useEffect(() => {
    setCheckedKeys(value);
  }, [value]);

  const loadGroupedPermissions = async () => {
    setLoading(true);
    try {
      const data = await userManagementService.getGroupedPermissions();
      console.log('📦 Grouped permissions loaded:', data);

      // serviceFilter가 있으면 해당 서비스만 필터링
      const filteredData = serviceFilter
        ? data.filter((group) => group.service_id === serviceFilter)
        : data;

      setGroupedPermissions(filteredData);
      buildTreeData(filteredData, searchKeyword);

      // 기본적으로 모든 서비스 노드를 펼침
      const serviceKeys = filteredData.map((group) => `service-${group.service_id}`);
      setExpandedKeys(serviceKeys);
    } catch (error) {
      console.error('Failed to load grouped permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tree 데이터 구조 생성
  const buildTreeData = (data: GroupedPermissions[], keyword: string) => {
    const lowerKeyword = keyword.toLowerCase();

    const tree: (TreeDataNode | null)[] = data.map((serviceGroup) => {
      // 카테고리별 하위 노드 생성
      const categoryNodes: (TreeDataNode | null)[] = Object.entries(serviceGroup.categories).map(
        ([categoryName, permissions]) => {
          // 권한 필터링 (검색어가 있는 경우)
          const filteredPermissions = keyword
            ? permissions.filter(
                (perm) =>
                  perm.permission_string.toLowerCase().includes(lowerKeyword) ||
                  perm.display_name.toLowerCase().includes(lowerKeyword) ||
                  (perm.description?.toLowerCase().includes(lowerKeyword) ?? false)
              )
            : permissions;

          // 필터링된 권한이 없으면 이 카테고리는 제외
          if (filteredPermissions.length === 0) {
            return null;
          }

          // 권한 노드들
          const permissionNodes: TreeDataNode[] = filteredPermissions.map((perm) => ({
            title: (
              <Space size={4}>
                <code
                  style={{
                    fontSize: '11px',
                    background: '#f0f0f0',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    color: '#52c41a',
                    fontWeight: 500,
                  }}
                >
                  {perm.permission_string}
                </code>
                <span style={{ fontSize: '12px' }}>{perm.display_name}</span>
                {perm.is_system_permission && (
                  <Tag color="red" style={{ fontSize: '9px', margin: 0, padding: '0 4px' }}>
                    SYSTEM
                  </Tag>
                )}
                {!perm.is_active && (
                  <Tag color="default" style={{ fontSize: '9px', margin: 0, padding: '0 4px' }}>
                    비활성
                  </Tag>
                )}
              </Space>
            ),
            key: perm.permission_string,
            isLeaf: true,
            disabled: !perm.is_active || disabled, // 비활성화된 권한은 선택 불가
          }));

          return {
            title: (
              <Space size={4}>
                <Tag color="purple" style={{ fontSize: '11px', margin: 0 }}>
                  {categoryName}
                </Tag>
                <span style={{ fontSize: '11px', color: '#999' }}>
                  ({filteredPermissions.length}개)
                </span>
              </Space>
            ),
            key: `category-${serviceGroup.service_id}-${categoryName}`,
            children: permissionNodes,
            selectable: false,
          };
        }
      );

      // null 제거 (필터링으로 빈 카테고리)
      const validCategoryNodes = categoryNodes.filter((node) => node !== null) as TreeDataNode[];

      // 서비스 노드가 빈 경우 null 반환
      if (validCategoryNodes.length === 0) {
        return null;
      }

      return {
        title: (
          <Space size={4}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1890ff' }}>
              {serviceGroup.service_name}
            </span>
            <span style={{ fontSize: '11px', color: '#999' }}>
              ({serviceGroup.permission_count}개 권한)
            </span>
          </Space>
        ),
        key: `service-${serviceGroup.service_id}`,
        children: validCategoryNodes,
        selectable: false,
      };
    });

    // null 제거
    const validTree = tree.filter((node) => node !== null) as TreeDataNode[];

    setTreeData(validTree);
  };

  // 검색어 변경 시 트리 재구성
  useEffect(() => {
    if (groupedPermissions.length > 0) {
      buildTreeData(groupedPermissions, searchKeyword);

      // 검색 시 모든 노드 펼치기
      if (searchKeyword) {
        const allKeys: React.Key[] = [];
        groupedPermissions.forEach((serviceGroup) => {
          allKeys.push(`service-${serviceGroup.service_id}`);
          Object.keys(serviceGroup.categories).forEach((categoryName) => {
            allKeys.push(`category-${serviceGroup.service_id}-${categoryName}`);
          });
        });
        setExpandedKeys(allKeys);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKeyword, groupedPermissions]);

  const handleCheck = (
    checkedKeysValue: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] }
  ) => {
    // checkedKeysValue가 객체인 경우 checked 배열만 추출
    const keys = Array.isArray(checkedKeysValue) ? checkedKeysValue : checkedKeysValue.checked;

    // 권한 문자열만 필터링 (service-, category- 접두사가 없는 것)
    const permissionKeys = keys.filter(
      (key) => !String(key).startsWith('service-') && !String(key).startsWith('category-')
    );

    setCheckedKeys(permissionKeys);
  };

  const handleExpand = (expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin tip="권한 목록을 불러오는 중..." />
      </div>
    );
  }

  return (
    <div>
      {/* 안내 메시지 */}
      <Alert
        message="권한 선택"
        description={
          serviceFilter
            ? `${serviceFilter} 서비스의 권한을 선택하세요. 체크박스를 클릭하여 권한을 추가/제거할 수 있습니다.`
            : '모든 서비스의 권한을 선택할 수 있습니다. 서비스별, 카테고리별로 구분되어 있습니다.'
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* 검색 */}
      <Search
        placeholder="권한 문자열, 표시명, 설명으로 검색"
        allowClear
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        prefix={<SearchOutlined />}
        style={{ marginBottom: 16 }}
      />

      {/* 선택된 권한 개수 표시 */}
      <div style={{ marginBottom: 12, fontSize: '13px', color: '#666' }}>
        선택된 권한: <strong>{checkedKeys.length}개</strong>
      </div>

      {/* Tree */}
      {treeData.length > 0 ? (
        <Tree
          checkable
          selectable={false}
          expandedKeys={expandedKeys}
          onExpand={handleExpand}
          checkedKeys={checkedKeys}
          onCheck={handleCheck}
          treeData={treeData}
          height={400}
          style={{
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            padding: '8px',
            background: '#fafafa',
          }}
        />
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          {searchKeyword ? '검색 결과가 없습니다' : '권한이 없습니다'}
        </div>
      )}
    </div>
  );
}
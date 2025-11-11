// 권한 선택 컴포넌트 (Tree 구조)
import { useState, useEffect } from 'react';
import {
  TextField,
  Alert,
  CircularProgress,
  Box,
  Typography,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import type { TreeViewBaseItem } from '@mui/x-tree-view/models';
import { userManagementService } from '../../services/userManagementService';
import type { GroupedPermissions } from '../../types/user-management';

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
  const [treeItems, setTreeItems] = useState<TreeViewBaseItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>(value);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 그룹화된 권한 데이터 로드
  useEffect(() => {
    loadGroupedPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 선택된 아이템이 변경될 때 부모 컴포넌트에 알림
  useEffect(() => {
    if (onChange) {
      // 권한 문자열만 필터링 (service-, category- 접두사가 없는 것)
      const permissionKeys = selectedItems.filter(
        (key) => !key.startsWith('service-') && !key.startsWith('category-')
      );
      onChange(permissionKeys);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItems]);

  // value prop이 변경되면 선택 상태 업데이트
  useEffect(() => {
    setSelectedItems(value);
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
      buildTreeItems(filteredData, searchKeyword);

      // 기본적으로 모든 서비스 노드를 펼침
      const serviceKeys = filteredData.map((group) => `service-${group.service_id}`);
      setExpandedItems(serviceKeys);
    } catch (error) {
      console.error('Failed to load grouped permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tree 아이템 생성
  const buildTreeItems = (data: GroupedPermissions[], keyword: string) => {
    const lowerKeyword = keyword.toLowerCase();

    const items: TreeViewBaseItem[] = [];

    data.forEach((serviceGroup) => {
      // 카테고리별 하위 노드 생성
      const categoryItems: TreeViewBaseItem[] = [];

      Object.entries(serviceGroup.categories).forEach(([categoryName, permissions]) => {
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
          return;
        }

        // 권한 노드들
        const permissionItems: TreeViewBaseItem[] = filteredPermissions.map((perm) => ({
          id: perm.permission_string,
          label: `${perm.permission_string} - ${perm.display_name}${
            perm.is_system_permission ? ' [SYSTEM]' : ''
          }${!perm.is_active ? ' [비활성]' : ''}`,
          disabled: !perm.is_active || disabled,
        }));

        categoryItems.push({
          id: `category-${serviceGroup.service_id}-${categoryName}`,
          label: `${categoryName} (${filteredPermissions.length}개)`,
          children: permissionItems,
        });
      });

      // 서비스 노드가 빈 경우 제외
      if (categoryItems.length > 0) {
        items.push({
          id: `service-${serviceGroup.service_id}`,
          label: `${serviceGroup.service_name} (${serviceGroup.permission_count}개 권한)`,
          children: categoryItems,
        });
      }
    });

    setTreeItems(items);
  };

  // 검색어 변경 시 트리 재구성
  useEffect(() => {
    if (groupedPermissions.length > 0) {
      buildTreeItems(groupedPermissions, searchKeyword);

      // 검색 시 모든 노드 펼치기
      if (searchKeyword) {
        const allKeys: string[] = [];
        groupedPermissions.forEach((serviceGroup) => {
          allKeys.push(`service-${serviceGroup.service_id}`);
          Object.keys(serviceGroup.categories).forEach((categoryName) => {
            allKeys.push(`category-${serviceGroup.service_id}-${categoryName}`);
          });
        });
        setExpandedItems(allKeys);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKeyword, groupedPermissions]);

  const handleSelectedItemsChange = (_event: React.SyntheticEvent | null, itemIds: string[]) => {
    setSelectedItems(itemIds);
  };

  const handleExpandedItemsChange = (_event: React.SyntheticEvent | null, itemIds: string[]) => {
    setExpandedItems(itemIds);
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          권한 목록을 불러오는 중...
        </Typography>
      </Box>
    );
  }

  // 권한 문자열만 필터링 (service-, category- 접두사가 없는 것)
  const permissionCount = selectedItems.filter(
    (key) => !key.startsWith('service-') && !key.startsWith('category-')
  ).length;

  return (
    <Box>
      {/* 안내 메시지 */}
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          권한 선택
        </Typography>
        <Typography variant="body2">
          {serviceFilter
            ? `${serviceFilter} 서비스의 권한을 선택하세요. 체크박스를 클릭하여 권한을 추가/제거할 수 있습니다.`
            : '모든 서비스의 권한을 선택할 수 있습니다. 서비스별, 카테고리별로 구분되어 있습니다.'}
        </Typography>
      </Alert>

      {/* 검색 */}
      <TextField
        placeholder="권한 문자열, 표시명, 설명으로 검색"
        fullWidth
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        sx={{ mb: 2 }}
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* 선택된 권한 개수 표시 */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        선택된 권한: <strong>{permissionCount}개</strong>
      </Typography>

      {/* Tree */}
      {treeItems.length > 0 ? (
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 1,
            bgcolor: 'background.default',
            maxHeight: 400,
            overflow: 'auto',
          }}
        >
          <RichTreeView
            items={treeItems}
            expandedItems={expandedItems}
            selectedItems={selectedItems}
            onExpandedItemsChange={handleExpandedItemsChange}
            onSelectedItemsChange={handleSelectedItemsChange}
            multiSelect
            checkboxSelection
          />
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>
          {searchKeyword ? '검색 결과가 없습니다' : '권한이 없습니다'}
        </Box>
      )}
    </Box>
  );
}

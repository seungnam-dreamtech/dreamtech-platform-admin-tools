// 역할 계층 구조 그래프 시각화 컴포넌트 (Neo4J 스타일)

import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MarkerType,
  Position,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
  Panel,
} from 'reactflow';
import type { Node, Edge } from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import { Typography, Tooltip } from 'antd';
import type { GlobalRole } from '../../types/user-management';

const { Text } = Typography;

interface RoleHierarchyGraphProps {
  allRoles: GlobalRole[];
  currentRoleId: string;
}

// dagre 레이아웃 계산
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, ranksep: 120, nodesep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 160, height: 60 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 80,
        y: nodeWithPosition.y - 30,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// 현재 역할의 조상과 자손 찾기
const findRelatedRoles = (roleId: string, allRoles: GlobalRole[]) => {
  const ancestors = new Set<string>();
  const descendants = new Set<string>();

  // 조상 찾기 (부모 방향)
  const findAncestors = (currentId: string) => {
    const role = allRoles.find(r => r.role_id === currentId);
    const parentId = role?.parent_role_id || role?.parent_role?.role_id;
    if (parentId) {
      ancestors.add(parentId);
      findAncestors(parentId);
    }
  };

  // 자손 찾기 (자식 방향)
  const findDescendants = (currentId: string) => {
    allRoles.forEach(role => {
      const parentId = role.parent_role_id || role.parent_role?.role_id;
      if (parentId === currentId) {
        descendants.add(role.role_id);
        findDescendants(role.role_id);
      }
    });
  };

  findAncestors(roleId);
  findDescendants(roleId);

  return { ancestors, descendants };
};

// 커스텀 노드 컴포넌트 (Neo4J 스타일 - 간단하게)
function RoleNode({ data }: { data: any }) {
  const { isCurrentRole, isAncestor, isDescendant, role } = data;

  let borderColor = '#d9d9d9';
  let backgroundColor = '#fff';
  let textColor = '#000';

  if (isCurrentRole) {
    borderColor = '#1890ff';
    backgroundColor = '#1890ff';
    textColor = '#fff';
  } else if (isAncestor) {
    borderColor = '#52c41a';
    backgroundColor = '#52c41a';
    textColor = '#fff';
  } else if (isDescendant) {
    borderColor = '#faad14';
    backgroundColor = '#faad14';
    textColor = '#fff';
  }

  const tooltipContent = (
    <div>
      <div><strong>{role.display_name}</strong></div>
      <div style={{ fontSize: '11px', marginTop: 4 }}>권한 레벨: {role.authority_level}</div>
      <div style={{ fontSize: '11px' }}>권한 수: {role.permissions?.length || 0}개</div>
      {role.description && (
        <div style={{ fontSize: '11px', marginTop: 4, color: '#ccc' }}>{role.description}</div>
      )}
    </div>
  );

  return (
    <Tooltip title={tooltipContent} placement="top">
      <div
        style={{
          padding: '8px 16px',
          borderRadius: '20px',
          border: `2px solid ${borderColor}`,
          background: backgroundColor,
          color: textColor,
          minWidth: '120px',
          textAlign: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        }}
      >
        <Text
          strong
          style={{
            fontSize: '13px',
            color: textColor,
            userSelect: 'none',
          }}
        >
          {role.role_id}
        </Text>
      </div>
    </Tooltip>
  );
}

const nodeTypes = {
  roleNode: RoleNode,
};

export function RoleHierarchyGraph({ allRoles, currentRoleId }: RoleHierarchyGraphProps) {
  const { ancestors, descendants } = useMemo(
    () => findRelatedRoles(currentRoleId, allRoles),
    [currentRoleId, allRoles]
  );

  // 노드와 엣지 생성
  const layoutedElements = useMemo(() => {
    if (allRoles.length === 0) {
      return { nodes: [], edges: [] };
    }

    // 선택된 역할과 관련된 역할들만 필터링 (조상 + 현재 + 자손)
    const relatedRoleIds = new Set([currentRoleId, ...ancestors, ...descendants]);
    const relatedRoles = allRoles.filter(role => relatedRoleIds.has(role.role_id));

    console.log('🔍 그래프 디버깅:', {
      currentRoleId,
      ancestors: Array.from(ancestors),
      descendants: Array.from(descendants),
      relatedRoleIds: Array.from(relatedRoleIds),
      allRoles: allRoles.map(r => ({
        id: r.role_id,
        parent_role_id: r.parent_role_id,
        parent_role: r.parent_role,
        computed_parent_id: r.parent_role_id || r.parent_role?.role_id,
      })),
      relatedRoles: relatedRoles.map(r => ({
        id: r.role_id,
        parent_role_id: r.parent_role_id,
        parent_role: r.parent_role,
        computed_parent_id: r.parent_role_id || r.parent_role?.role_id,
      })),
    });

    // 관련된 역할만 노드로 생성
    const nodes: Node[] = relatedRoles.map((role) => ({
      id: role.role_id,
      type: 'roleNode',
      position: { x: 0, y: 0 }, // dagre가 자동 계산
      data: {
        role,
        isCurrentRole: role.role_id === currentRoleId,
        isAncestor: ancestors.has(role.role_id),
        isDescendant: descendants.has(role.role_id),
      },
      sourcePosition: 'bottom' as const,
      targetPosition: 'top' as const,
    }));

    // 관련된 역할들 사이의 부모-자식 관계만 엣지로 생성
    const edges: Edge[] = [];
    console.log('🔗 엣지 생성 시작...');
    relatedRoles.forEach((role) => {
      const parentId = role.parent_role_id || role.parent_role?.role_id;
      console.log(`  역할 ${role.role_id}의 부모 ID:`, parentId, '/ 관련 ID에 포함:', relatedRoleIds.has(parentId || ''));

      if (parentId && relatedRoleIds.has(parentId)) {
        console.log(`    ✅ 엣지 생성: ${parentId} → ${role.role_id}`);
        edges.push({
          id: `${parentId}-${role.role_id}`,
          source: parentId,
          target: role.role_id,
          type: 'smoothstep',
          animated: role.role_id === currentRoleId || descendants.has(role.role_id),
          style: {
            stroke: '#1890ff',
            strokeWidth: 3,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#1890ff',
            width: 25,
            height: 25,
          },
          label: '상속',
          labelStyle: {
            fill: '#1890ff',
            fontWeight: 600,
            fontSize: 12,
          },
          labelBgStyle: {
            fill: '#fff',
          },
        });
      } else {
        console.log(`    ❌ 엣지 생성 안됨 - parentId: ${parentId}, 존재 여부: ${parentId && relatedRoleIds.has(parentId)}`);
      }
    });
    console.log('🔗 생성된 엣지 총 개수:', edges.length);
    console.log('🔗 엣지 상세:', edges);
    console.log('🔗 노드 상세:', nodes);

    // dagre 레이아웃 적용
    const layouted = getLayoutedElements(nodes, edges, 'TB');
    console.log('📐 레이아웃 적용 후 노드 위치:', layouted.nodes.map(n => ({
      id: n.id,
      position: n.position,
    })));
    console.log('📐 레이아웃 적용 후 엣지:', layouted.edges);

    return layouted;
  }, [allRoles, currentRoleId, ancestors, descendants]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedElements.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedElements.edges);

  console.log('⚛️ React State - 노드 개수:', nodes.length, '엣지 개수:', edges.length);
  console.log('⚛️ React State - 노드:', nodes);
  console.log('⚛️ React State - 엣지:', edges);

  const onInit = useCallback((reactFlowInstance: any) => {
    // 초기 뷰를 중앙에 맞춤
    setTimeout(() => {
      reactFlowInstance.fitView({
        padding: 0.2,
        duration: 400,
      });
    }, 50);
  }, []);

  if (allRoles.length === 0) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '12px',
        }}
      >
        역할 데이터가 없습니다
      </div>
    );
  }

  const relatedRolesCount = 1 + ancestors.size + descendants.size;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        minZoom={0.4}
        maxZoom={2}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        zoomOnScroll={true}
        panOnScroll={false}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
        }}
      >
        <Background color="#f0f0f0" gap={20} size={1} />
        <Controls
          showInteractive={false}
          style={{
            button: {
              backgroundColor: '#fff',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
            },
          }}
        />
        <Panel
          position="top-left"
          style={{
            background: 'rgba(255,255,255,0.95)',
            padding: '6px 10px',
            borderRadius: '4px',
            border: '1px solid #e8e8e8',
            fontSize: '11px',
            color: '#666',
          }}
        >
          계층 구조: {relatedRolesCount}개 역할
        </Panel>
      </ReactFlow>
    </div>
  );
}

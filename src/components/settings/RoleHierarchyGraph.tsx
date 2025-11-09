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
import { Tag, Space, Typography, Badge } from 'antd';
import { SafetyOutlined, CrownOutlined } from '@ant-design/icons';
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
  dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 80 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 220, height: 120 });
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
        x: nodeWithPosition.x - 110,
        y: nodeWithPosition.y - 60,
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
    if (role?.parent_role_id) {
      ancestors.add(role.parent_role_id);
      findAncestors(role.parent_role_id);
    }
  };

  // 자손 찾기 (자식 방향)
  const findDescendants = (currentId: string) => {
    allRoles.forEach(role => {
      if (role.parent_role_id === currentId) {
        descendants.add(role.role_id);
        findDescendants(role.role_id);
      }
    });
  };

  findAncestors(roleId);
  findDescendants(roleId);

  return { ancestors, descendants };
};

// 커스텀 노드 컴포넌트
function RoleNode({ data }: { data: any }) {
  const { isCurrentRole, isAncestor, isDescendant, role } = data;

  const isHighlighted = isCurrentRole || isAncestor || isDescendant;

  let borderColor = '#d9d9d9';
  let backgroundColor = '#fff';
  let shadowColor = 'rgba(0,0,0,0.1)';

  if (isCurrentRole) {
    borderColor = '#1890ff';
    backgroundColor = '#e6f7ff';
    shadowColor = 'rgba(24, 144, 255, 0.4)';
  } else if (isAncestor) {
    borderColor = '#52c41a';
    backgroundColor = '#f6ffed';
    shadowColor = 'rgba(82, 196, 26, 0.3)';
  } else if (isDescendant) {
    borderColor = '#faad14';
    backgroundColor = '#fffbe6';
    shadowColor = 'rgba(250, 173, 20, 0.3)';
  }

  return (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: '8px',
        border: `2px solid ${borderColor}`,
        background: backgroundColor,
        minWidth: '200px',
        boxShadow: isHighlighted
          ? `0 4px 12px ${shadowColor}`
          : '0 2px 6px rgba(0,0,0,0.08)',
        opacity: isHighlighted ? 1 : 0.6,
        transition: 'all 0.3s ease',
      }}
    >
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong style={{ fontSize: '12px' }}>
            {role.role_id}
          </Text>
          {role.is_system_role && (
            <Tag color="red" style={{ fontSize: '8px', padding: '0 4px', margin: 0, lineHeight: '16px' }}>
              SYS
            </Tag>
          )}
        </div>

        <Text style={{ fontSize: '10px', color: '#666', lineHeight: '1.3' }}>
          {role.display_name}
        </Text>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <Tag
            color={role.authority_level <= 10 ? 'red' : role.authority_level <= 50 ? 'orange' : 'green'}
            style={{ fontSize: '9px', padding: '1px 5px', margin: 0, lineHeight: '16px' }}
          >
            Lv {role.authority_level}
          </Tag>

          <Space size={2}>
            <SafetyOutlined style={{ fontSize: '9px', color: '#1890ff' }} />
            <Text style={{ fontSize: '9px', color: '#666' }}>
              {role.permissions?.length || 0}
            </Text>
          </Space>
        </div>

        {isCurrentRole && (
          <div style={{ marginTop: 4, textAlign: 'center' }}>
            <Tag color="blue" style={{ fontSize: '9px', padding: '1px 6px', margin: 0, lineHeight: '16px' }}>
              <CrownOutlined style={{ fontSize: '8px', marginRight: 2 }} />
              선택됨
            </Tag>
          </div>
        )}
        {isAncestor && (
          <div style={{ marginTop: 4, textAlign: 'center' }}>
            <Tag color="green" style={{ fontSize: '9px', padding: '1px 6px', margin: 0, lineHeight: '16px' }}>
              상위 역할
            </Tag>
          </div>
        )}
        {isDescendant && (
          <div style={{ marginTop: 4, textAlign: 'center' }}>
            <Tag color="orange" style={{ fontSize: '9px', padding: '1px 6px', margin: 0, lineHeight: '16px' }}>
              하위 역할
            </Tag>
          </div>
        )}
      </Space>
    </div>
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
  const { initialNodes, initialEdges } = useMemo(() => {
    if (allRoles.length === 0) {
      return { initialNodes: [], initialEdges: [] };
    }

    // 모든 역할을 노드로 생성
    const nodes: Node[] = allRoles.map((role) => ({
      id: role.role_id,
      type: 'roleNode',
      position: { x: 0, y: 0 }, // dagre가 자동 계산
      data: {
        role,
        isCurrentRole: role.role_id === currentRoleId,
        isAncestor: ancestors.has(role.role_id),
        isDescendant: descendants.has(role.role_id),
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    }));

    // 모든 부모-자식 관계를 엣지로 생성
    const edges: Edge[] = [];
    allRoles.forEach((role) => {
      if (role.parent_role_id) {
        const isHighlightedEdge =
          (role.role_id === currentRoleId && ancestors.has(role.parent_role_id)) ||
          (descendants.has(role.role_id) && role.parent_role_id === currentRoleId) ||
          (ancestors.has(role.parent_role_id) && descendants.has(role.role_id));

        edges.push({
          id: `${role.parent_role_id}-${role.role_id}`,
          source: role.parent_role_id,
          target: role.role_id,
          type: ConnectionLineType.SmoothStep,
          animated: isHighlightedEdge,
          style: {
            stroke: isHighlightedEdge ? '#1890ff' : '#d9d9d9',
            strokeWidth: isHighlightedEdge ? 2.5 : 1.5,
            opacity: isHighlightedEdge ? 1 : 0.4,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isHighlightedEdge ? '#1890ff' : '#d9d9d9',
            width: 18,
            height: 18,
          },
        });
      }
    });

    // dagre 레이아웃 적용
    return getLayoutedElements(nodes, edges, 'TB');
  }, [allRoles, currentRoleId, ancestors, descendants]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onInit = useCallback((reactFlowInstance: any) => {
    // 초기 뷰를 중앙에 맞춤
    setTimeout(() => {
      reactFlowInstance.fitView({
        padding: 0.15,
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

  const totalRoles = allRoles.length;
  const activeRoles = allRoles.filter(r => r.is_active).length;
  const relatedRoles = 1 + ancestors.size + descendants.size;

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
        minZoom={0.3}
        maxZoom={2}
        defaultEdgeOptions={{
          type: ConnectionLineType.SmoothStep,
        }}
      >
        <Background color="#f0f0f0" gap={16} size={1} />
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
        <Panel position="top-right" style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '8px 12px',
          borderRadius: '6px',
          border: '1px solid #e8e8e8',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Space direction="vertical" size={4}>
            <Text style={{ fontSize: '10px', color: '#666' }}>
              <Badge color="#1890ff" /> 전체 역할: {totalRoles}개 (활성: {activeRoles})
            </Text>
            <Text style={{ fontSize: '10px', color: '#666' }}>
              <Badge color="#52c41a" /> 관련 역할: {relatedRoles}개
            </Text>
          </Space>
        </Panel>
      </ReactFlow>
    </div>
  );
}

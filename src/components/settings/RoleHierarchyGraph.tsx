// 역할 계층 구조 그래프 시각화 컴포넌트

import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MarkerType,
  Position,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Tag, Space, Typography } from 'antd';
import { SafetyOutlined, CrownOutlined } from '@ant-design/icons';
import type { GlobalRole } from '../../types/user-management';

const { Text } = Typography;

interface RoleHierarchyGraphProps {
  roleHierarchy: GlobalRole[];
  currentRoleId: string;
}

// 커스텀 노드 컴포넌트
function RoleNode({ data }: { data: any }) {
  const isCurrentRole = data.isCurrentRole;
  const isCentralRole = data.isCentralRole;

  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: '8px',
        border: isCurrentRole ? '2px solid #1890ff' : isCentralRole ? '2px solid #52c41a' : '1px solid #d9d9d9',
        background: isCurrentRole ? '#e6f7ff' : isCentralRole ? '#f6ffed' : '#fff',
        minWidth: '200px',
        boxShadow: isCurrentRole ? '0 4px 12px rgba(24, 144, 255, 0.3)' : isCentralRole ? '0 4px 12px rgba(82, 196, 26, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong style={{ fontSize: '13px' }}>
            {data.role_id}
          </Text>
          {data.is_system_role && (
            <Tag color="red" style={{ fontSize: '9px', padding: '0 4px', margin: 0 }}>
              SYSTEM
            </Tag>
          )}
        </div>

        <Text style={{ fontSize: '11px', color: '#666' }}>
          {data.display_name}
        </Text>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <Tag
            color={data.authority_level <= 10 ? 'red' : data.authority_level <= 50 ? 'orange' : 'green'}
            style={{ fontSize: '9px', padding: '2px 6px', margin: 0 }}
          >
            Level {data.authority_level}
          </Tag>

          <Space size={2}>
            <SafetyOutlined style={{ fontSize: '10px', color: '#1890ff' }} />
            <Text style={{ fontSize: '10px', color: '#666' }}>
              {data.permissions?.length || 0}개
            </Text>
          </Space>
        </div>

        {isCurrentRole && (
          <Tag color="blue" style={{ fontSize: '9px', padding: '2px 6px', margin: '4px 0 0 0', textAlign: 'center' }}>
            <CrownOutlined style={{ fontSize: '9px' }} /> 현재 역할
          </Tag>
        )}
      </Space>
    </div>
  );
}

const nodeTypes = {
  roleNode: RoleNode,
};

export function RoleHierarchyGraph({ roleHierarchy, currentRoleId }: RoleHierarchyGraphProps) {
  // 노드와 엣지 생성
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (roleHierarchy.length === 0) {
      return { nodes: [], edges: [] };
    }

    // 중앙에 배치할 역할 찾기 (현재 역할)
    const centralRoleIndex = roleHierarchy.findIndex(r => r.role_id === currentRoleId);
    const centralIndex = centralRoleIndex >= 0 ? centralRoleIndex : Math.floor(roleHierarchy.length / 2);

    const nodes: Node[] = roleHierarchy.map((role, index) => {
      // 수직 레이아웃: 부모가 위, 자식이 아래
      const verticalSpacing = 180;
      const yPosition = (index - centralIndex) * verticalSpacing;

      return {
        id: role.role_id,
        type: 'roleNode',
        position: { x: 250, y: yPosition },
        data: {
          ...role,
          isCurrentRole: role.role_id === currentRoleId,
          isCentralRole: index === centralIndex && role.role_id !== currentRoleId,
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      };
    });

    const edges: Edge[] = [];
    for (let i = 0; i < roleHierarchy.length - 1; i++) {
      const sourceRole = roleHierarchy[i];
      const targetRole = roleHierarchy[i + 1];

      edges.push({
        id: `${sourceRole.role_id}-${targetRole.role_id}`,
        source: sourceRole.role_id,
        target: targetRole.role_id,
        type: ConnectionLineType.SmoothStep,
        animated: targetRole.role_id === currentRoleId,
        style: {
          stroke: targetRole.role_id === currentRoleId ? '#1890ff' : '#b1b1b7',
          strokeWidth: targetRole.role_id === currentRoleId ? 2 : 1.5,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: targetRole.role_id === currentRoleId ? '#1890ff' : '#b1b1b7',
          width: 20,
          height: 20,
        },
        label: '상속',
        labelStyle: {
          fontSize: '10px',
          fill: '#666',
          fontWeight: targetRole.role_id === currentRoleId ? 'bold' : 'normal',
        },
        labelBgStyle: {
          fill: '#fff',
          fillOpacity: 0.8,
        },
      });
    }

    return { nodes, edges };
  }, [roleHierarchy, currentRoleId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onInit = useCallback((reactFlowInstance: any) => {
    // 초기 뷰를 중앙에 맞춤
    setTimeout(() => {
      reactFlowInstance.fitView({
        padding: 0.2,
        duration: 400,
      });
    }, 50);
  }, []);

  if (roleHierarchy.length === 0) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#999',
        fontSize: '12px',
      }}>
        역할 계층 정보가 없습니다
      </div>
    );
  }

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
        minZoom={0.5}
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: ConnectionLineType.SmoothStep,
        }}
      >
        <Background color="#f0f0f0" gap={16} />
        <Controls
          showInteractive={false}
          style={{
            button: {
              backgroundColor: '#fff',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
            }
          }}
        />
      </ReactFlow>
    </div>
  );
}

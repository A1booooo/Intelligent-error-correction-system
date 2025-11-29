import { useState, useCallback, useEffect } from 'react';
import {
  Node,
  Edge,
  Position,
  applyNodeChanges,
  applyEdgeChanges,
  OnNodesChange,
  OnEdgesChange,
  NodeChange,
  EdgeChange,
  MarkerType,
} from 'reactflow';
import { 
  fetchRootPoints, 
  fetchChildPoints,
} from '@/services/apis/KnowledgePointApi/KnowledgePointApi';
import { KnowledgePointNode } from '@/services/apis/KnowledgePointApi/type';

const transformNode = (data: KnowledgePointNode, x: number, y: number, isRoot = false): Node => ({
  id: String(data.id),
  type: isRoot ? 'input' : 'default',
  data: { label: data.keyPoints }, 
  position: { x, y },
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
  style: isRoot ? {
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    width: 140,
    padding: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    textAlign: 'center',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
  } : {
    background: '#ffffff',
    color: '#1e293b',
    border: '1px solid #94a3b8',
    borderRadius: '8px',
    width: 140,
    padding: '10px',
    fontSize: '14px',
    textAlign: 'center',
    cursor: 'pointer',
    fontWeight: 500,
  },
});

// 接收 subject 参数
export const useKnowledgeGraph = (subject: string) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());

  // 初始化获取根节点
  const initGraph = useCallback(async () => {
    if (!subject) return; 

    setIsLoading(true);
    try {
      console.log('正在请求根节点，科目:', subject); 
      const res = await fetchRootPoints({ subject });
      
      console.log('根节点响应:', res); 

      if (res.code === 200 && res.data && res.data.length > 0) {
        // 垂直排列根节点
        const initialNodes = res.data.map((item, index) => 
          transformNode(item, 50, 150 + index * 120, true)
        );
        setNodes(initialNodes);
        setEdges([]); 
        setExpandedNodeIds(new Set()); 
      } else {
        setNodes([]);
        setEdges([]);
      }
    } catch (error) {
      console.error("加载图谱失败", error);
    } finally {
      setIsLoading(false);
    }
  }, [subject]); 

  useEffect(() => {
    initGraph();
  }, [initGraph]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onNodeClick = useCallback(async (_event: React.MouseEvent, node: Node) => {
    const nodeId = node.id;
    setSelectedNodeId(nodeId);

    if (expandedNodeIds.has(nodeId)) return;

    try {
      const res = await fetchChildPoints(Number(nodeId));
      if (res.code === 200 && res.data && res.data.length > 0) {
        const parentX = node.position.x;
        const parentY = node.position.y;
        const childX = parentX + 250;
        const totalHeight = res.data.length * 100;
        const startY = parentY - totalHeight / 2 + 50;

        const newNodes = res.data.map((item, index) => 
          transformNode(item, childX, startY + index * 100)
        );

        const newEdges = res.data.map((item) => ({
          id: `e${nodeId}-${item.id}`,
          source: nodeId,
          target: String(item.id),
          type: 'bezier',
          animated: true,
          style: { stroke: '#94a3b8', strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed },
        }));

        setNodes((nds) => [...nds, ...newNodes]);
        setEdges((eds) => [...eds, ...newEdges]);
        setExpandedNodeIds((prev) => new Set(prev).add(nodeId));
      }
    } catch (error) {
      console.error("加载子节点失败", error);
    }
  }, [expandedNodeIds]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onNodeClick,
    selectedNodeId,
    isLoading,
    refreshGraph: initGraph,
  };
};
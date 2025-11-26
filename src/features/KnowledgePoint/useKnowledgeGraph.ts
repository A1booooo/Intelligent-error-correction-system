import { useState, useEffect, useCallback } from 'react';
import {
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Position,
  MarkerType,
} from 'reactflow';
import dagre from 'dagre';
import { knowledgeApi, KnowledgePointNode } from '@/services/apis/KnowledgePointApi';

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setGraph({ rankdir: 'LR' }); 

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 150, height: 50 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = Position.Left;
    node.sourcePosition = Position.Right;
    node.position = {
      x: nodeWithPosition.x - 75,
      y: nodeWithPosition.y - 25,
    };
    return node;
  });

  return { nodes, edges };
};

export const useKnowledgeGraph = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- 数据转换函数 ---
  const transformData = (apiData: KnowledgePointNode[], parentId?: string) => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    apiData.forEach((item) => {
      const nodeId = item.id.toString();
      const isRoot = !parentId; 
      
      newNodes.push({
        id: nodeId,
        data: { label: item.keyPoints }, 
        position: { x: 0, y: 0 },
        type: isRoot ? 'input' : 'default',
        style: isRoot ? {
          background: '#3b82f6', // 蓝色
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          width: 120,
          padding: '10px',
          fontSize: '14px',
          fontWeight: 'bold',
          textAlign: 'center',
        } : {
          background: '#ffffff', // 白色
          color: '#1e293b',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          width: 120,
          padding: '8px',
          fontSize: '12px',
          textAlign: 'center',
        },
      });

      // 如果有父节点，建立连线
      if (parentId) {
        newEdges.push({
          id: `e${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          type: 'smoothstep', // 平滑折线
          markerEnd: { type: MarkerType.ArrowClosed },
          animated: true, // 动画效果
          style: { stroke: '#94a3b8' },
        });
      }
    });

    return { newNodes, newEdges };
  };

  // --- 真实 API 调用逻辑 ---
  useEffect(() => {
    const initGraph = async () => {
      setIsLoading(true);
      try {
        // 1. 获取根节点 (Subject = 数学)
        const rootRes = await knowledgeApi.fetchRootPoints({ subject: '数学' });
        
        if (rootRes.success && rootRes.data.length > 0) {
          let allNodes: Node[] = [];
          let allEdges: Edge[] = [];

          // 2. 转换根节点数据
          const { newNodes: rootNodes } = transformData(rootRes.data);
          allNodes = [...rootNodes];

          // 3. 遍历所有根节点，获取它们的“一级子节点”
          // 使用 Promise.all 并发请求
          const childPromises = rootRes.data.map(root => 
            knowledgeApi.fetchChildPoints(root.id)
              .then(res => ({ rootId: root.id, data: res.data || [] }))
              .catch(() => ({ rootId: root.id, data: [] }))
          );

          const results = await Promise.all(childPromises);

          results.forEach(({ rootId, data }) => {
            if (data.length > 0) {
              const { newNodes, newEdges } = transformData(data, rootId.toString());
              allNodes = [...allNodes, ...newNodes];
              allEdges = [...allEdges, ...newEdges];
            }
          });

          // 4. 计算布局并渲染
          const layouted = getLayoutedElements(allNodes, allEdges);
          setNodes(layouted.nodes);
          setEdges(layouted.edges);
        } else {
          // 如果没有数据，清空画布
          setNodes([]);
          setEdges([]);
        }
      } catch (e) {
        console.error("图谱加载失败:", e);
      } finally {
        setIsLoading(false);
      }
    };

    initGraph();
  }, [setNodes, setEdges]); // 依赖项

  // 点击节点
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    console.log("选中节点:", node.id);
  }, []);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onNodeClick,
    selectedNodeId,
    isLoading,
  };
};
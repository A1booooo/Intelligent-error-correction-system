import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Node,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  OnNodesChange,
  OnEdgesChange,
  NodeChange,
  EdgeChange,
  MarkerType,
  Position,
} from 'reactflow';

import {
  fetchRootPoints,
  fetchChildPoints,
} from '@/services/apis/KnowledgePointApi/KnowledgePointApi';

import { KnowledgePointNode } from '@/services/apis/KnowledgePointApi/type';

const EDGE_STYLE = { stroke: '#000000', strokeWidth: 1.5 };
const ROOT_X = 50;
const CHILD_X = 400;
const NODE_HEIGHT = 80;
const ROOT_GAP = 120;

const createNode = (
  data: KnowledgePointNode,
  x: number,
  y: number,
  isRoot: boolean
): Node => {
  const nodeId = String(data.id);

  return {
    id: nodeId,
    type: isRoot ? 'input' : 'default',
    data: { label: data.keyPoints },
    position: { x, y },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    connectable: false,
    style: isRoot
      ? {
        background: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 20px',
        fontWeight: 'bold',
        textAlign: 'center',
        minWidth: '120px',
      }
      : {
        background: '#ffffff',
        color: '#1e293b',
        border: '1px solid #000000',
        borderRadius: '8px',
        padding: '8px 16px',
        fontSize: '14px',
        textAlign: 'center',
        fontWeight: 500,
        minWidth: '100px',
      },
  };
};

// History snapshot
interface HistorySnapshot {
  nodes: Node[];
  edges: Edge[];
}

export const useKnowledgeGraph = (subject: string) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // refs to always read latest state in callbacks without nesting setState
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  const historyStack = useRef<HistorySnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyIndexRef = useRef(-1);

  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

  const recordHistoryRef = useRef<((newNodes: Node[], newEdges: Edge[]) => void) | null>(null);

  const recordHistory = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    // truncate future
    if (historyIndexRef.current < historyStack.current.length - 1) {
      historyStack.current = historyStack.current.slice(0, historyIndexRef.current + 1);
    }
    // cap
    if (historyStack.current.length >= 50) {
      historyStack.current.shift();
    }
    historyStack.current.push({
      nodes: JSON.parse(JSON.stringify(newNodes)),
      edges: JSON.parse(JSON.stringify(newEdges)),
    });
    const newIndex = historyStack.current.length - 1;
    setHistoryIndex(newIndex);
    historyIndexRef.current = newIndex;
  }, []);

  useEffect(() => {
    recordHistoryRef.current = recordHistory;
  }, [recordHistory]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const prevIndex = historyIndex - 1;
    const snap = historyStack.current[prevIndex];
    setNodes(snap.nodes);
    setEdges(snap.edges);
    setHistoryIndex(prevIndex);
  }, [historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= historyStack.current.length - 1) return;
    const nextIndex = historyIndex + 1;
    const snap = historyStack.current[nextIndex];
    setNodes(snap.nodes);
    setEdges(snap.edges);
    setHistoryIndex(nextIndex);
  }, [historyIndex]);

  // 递归加载节点及其所有子节点
  const loadNodeRecursively = async (
    node: KnowledgePointNode,
    parentX: number,
    startY: number,
    level: number,
    nodes: Node[],
    edges: Edge[],
    nodeMap: Map<string, { node: Node; children: KnowledgePointNode[] }>
  ): Promise<number> => {
    const nodeX = level === 0 ? ROOT_X : (parentX === ROOT_X ? CHILD_X : parentX + 350);

    let children: KnowledgePointNode[] = [];
    try {
      const res = await fetchChildPoints(node.id);
      if (res.code === 200 && res.data) {
        children = res.data;
      }
    } catch (error) {
      console.error(`加载节点 ${node.id} 的子节点失败:`, error);
    }

    if (children.length === 0) {
      const currentNode = createNode(node, nodeX, startY, level === 0);
      nodes.push(currentNode);
      nodeMap.set(String(node.id), { node: currentNode, children: [] });
      return NODE_HEIGHT;
    }

    let childY = startY;
    let totalHeight = 0;
    const childHeights: number[] = [];

    for (const child of children) {
      const childHeight = await loadNodeRecursively(child, nodeX, childY, level + 1, nodes, edges, nodeMap);
      childHeights.push(childHeight);

      edges.push({
        id: `e${node.id}-${child.id}`,
        source: String(node.id),
        target: String(child.id),
        type: 'smoothstep',
        style: EDGE_STYLE,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#000000' },
      });

      const childNodeData = nodeMap.get(String(child.id));
      if (childNodeData) {
        childNodeData.node.position.y = childY;
      }

      childY += childHeight;
      totalHeight += childHeight;
    }

    const adjustedY = startY + (totalHeight / 2) - 40;
    const currentNode = createNode(node, nodeX, adjustedY, level === 0);
    nodes.push(currentNode);
    nodeMap.set(String(node.id), { node: currentNode, children });

    return Math.max(totalHeight, NODE_HEIGHT);
  };

  // load full graph
  const loadFullGraph = useCallback(async (isFirstLoad = false) => {
    if (!subject) return;
    if (isFirstLoad) setIsLoading(true);


    try {
      const rootRes = await fetchRootPoints({ subject });
      if (rootRes.code !== 200 || !rootRes.data) {
        setNodes([]);
        setEdges([]);
        if (isFirstLoad) {
          historyStack.current = [];
          setHistoryIndex(-1);
          historyIndexRef.current = -1;
        }
        return;
      }

      const roots: KnowledgePointNode[] = rootRes.data;
      const nextNodes: Node[] = [];
      const nextEdges: Edge[] = [];
      const nodeMap = new Map<string, { node: Node; children: KnowledgePointNode[] }>();

      let currentY = 50;

      for (const root of roots) {
        const height = await loadNodeRecursively(root, ROOT_X, currentY, 0, nextNodes, nextEdges, nodeMap);
        currentY += height + ROOT_GAP;
      }


      setNodes(nextNodes);
      setEdges(nextEdges);

      if (isFirstLoad) {
        historyStack.current = [{ nodes: nextNodes, edges: nextEdges }];
        setHistoryIndex(0);
        historyIndexRef.current = 0;
      } else {
        if (recordHistoryRef.current) {
          recordHistoryRef.current(nextNodes, nextEdges);
        }
      }
    } catch (error) {
      console.error('❌ [loadFullGraph] 加载失败', error);
    } finally {
      setIsLoading(false);
    }
  }, [subject]);

  useEffect(() => {
    loadFullGraph(true);
  }, [subject]);

  // reactflow change handlers
  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes(prev => applyNodeChanges(changes, prev)),
    []
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges(prev => applyEdgeChanges(changes, prev)),
    []
  );

  const onNodeClick = useCallback((_ev: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const refreshGraph = useCallback(() => {
    loadFullGraph(false);
  }, [loadFullGraph]);

  const refreshNode = useCallback(async (nodeId: string) => {


    if (!nodeId) {
      refreshGraph();
      return;
    }

    try {
      const res = await fetchChildPoints(nodeId);


      if (res.code !== 200 || !res.data) {
        return;
      }
      const children: KnowledgePointNode[] = res.data;


      const prevNodes = nodesRef.current;
      const prevEdges = edgesRef.current;



      const edgesFromParent = prevEdges.filter(e => String(e.source) === String(nodeId));
      const prevChildIds = edgesFromParent.map(e => String(e.target));


      const nodesKept = prevNodes.filter(n => !prevChildIds.includes(String(n.id)));
      const edgesKept = prevEdges.filter(e => String(e.source) !== String(nodeId));

      const parentNode = prevNodes.find(n => String(n.id) === String(nodeId));
      if (parentNode && !nodesKept.find(n => String(n.id) === String(nodeId))) {
        nodesKept.push(parentNode);
      }






      const parentX = parentNode && typeof parentNode.position?.x === 'number'
        ? parentNode.position.x
        : ROOT_X;
      const childX = parentX === ROOT_X ? CHILD_X : parentX + 350;



      const baseY = (parentNode && typeof parentNode.position?.y === 'number')
        ? parentNode.position.y
        : (nodesKept.reduce((m, cur) => Math.max(m, cur.position?.y ?? 0), 0) + NODE_HEIGHT);

      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      children.forEach((child, idx) => {
        const childY = parentNode
          ? (baseY + (idx - Math.floor(children.length / 2)) * NODE_HEIGHT)
          : (baseY + idx * NODE_HEIGHT);

        const newNode = createNode(child, childX, childY, false);
        newNodes.push(newNode);



        const newEdge: Edge = {
          id: `e${nodeId}-${child.id}`,
          source: String(nodeId),
          target: String(child.id),
          type: 'smoothstep',
          style: EDGE_STYLE,
          markerEnd: { type: MarkerType.ArrowClosed, color: '#000000' },
        };
        newEdges.push(newEdge);


      });

      const mergedNodes = [...nodesKept, ...newNodes];
      const mergedEdges = [...edgesKept, ...newEdges];



      // update both states (no nested setState)
      setNodes(mergedNodes);
      setEdges(mergedEdges);
      recordHistory(mergedNodes, mergedEdges);
    } catch (err) {
    }
  }, [refreshGraph, recordHistory]);

  // addLocalChild: insert child node + edge immediately (used after backend create)
  const addLocalChild = useCallback((parentId: string, child: KnowledgePointNode) => {
    if (!parentId || !child) return;

    const prevNodes = nodesRef.current;
    const prevEdges = edgesRef.current;

    const parentNode = prevNodes.find(n => String(n.id) === String(parentId));
    const directCount = prevEdges.filter(e => String(e.source) === String(parentId)).length;

    const baseY = (parentNode && typeof parentNode.position?.y === 'number')
      ? parentNode.position.y
      : (prevNodes.reduce((m, cur) => Math.max(m, cur.position?.y ?? 0), 0) + NODE_HEIGHT);

    const childY = baseY + directCount * NODE_HEIGHT;

    const newNode = createNode(child, CHILD_X, childY, false);

    const newEdge: Edge = {
      id: `e${parentId}-${child.id}`,
      source: String(parentId),
      target: String(child.id),
      type: 'smoothstep',
      style: EDGE_STYLE,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#000000' },
    };

    const nextNodes = [...prevNodes, newNode];
    const nextEdges = prevEdges.some(e => e.id === newEdge.id) ? prevEdges : [...prevEdges, newEdge];

    setNodes(nextNodes);
    setEdges(nextEdges);
    recordHistory(nextNodes, nextEdges);
  }, [recordHistory]);

  const updateNodeLabel = useCallback((nodeId: string, newLabel: string) => {
    const prevNodes = nodesRef.current;
    const prevEdges = edgesRef.current;

    const nodeIndex = prevNodes.findIndex(n => String(n.id) === String(nodeId));
    if (nodeIndex === -1) return;

    const updatedNodes = [...prevNodes];
    updatedNodes[nodeIndex] = {
      ...updatedNodes[nodeIndex],
      data: {
        ...updatedNodes[nodeIndex].data,
        label: newLabel,
      },
    };

    setNodes(updatedNodes);
    recordHistory(updatedNodes, prevEdges);
  }, [recordHistory]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onNodeClick,
    selectedNodeId,
    isLoading,
    refreshGraph,
    refreshNode,
    addLocalChild,
    updateNodeLabel,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < historyStack.current.length - 1,
  };
};

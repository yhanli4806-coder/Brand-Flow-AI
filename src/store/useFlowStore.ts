//画布节点、连线全局状态
import { create } from 'zustand';
import type { Node, Edge } from 'reactflow';

// 1. 静态类型约束 (TypeScript的优势发挥出来)
interface FlowState {
  nodes: Node[];
  edges: Edge[];
  activeNodeId: string | null;
  // actions (相当于 Dva 的 effects 和 reducers)
  setNodes: (nodes: Node[]) => void;
  setActiveNode: (id: string) => void;
  fetchInitialData: (taskId: string) => Promise<void>; 
}

// 2. 创建 Store
export const useFlowStore = create<FlowState>((set) => ({
  nodes: [],
  edges: [],
  activeNodeId: null,
  
  setNodes: (nodes) => set({ nodes }),
  setActiveNode: (id) => set({ activeNodeId: id }),
  
  // 异步请求也能直接写在这里，不用像 Dva 那样写 Generator 函数
  fetchInitialData: async (taskId) => {
    // const res = await api.getFlowData(taskId);
    // set({ nodes: res.nodes, edges: res.edges });
  }
}));
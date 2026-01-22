
import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  Node, 
  Edge, 
  ConnectionMode, 
  MarkerType,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection
} from 'reactflow';
import { 
  Save, Play, Settings, Plus, RotateCcw, 
  Table, ArrowRightLeft, FileOutput, Search, Filter, 
  MoreVertical, Layout, MousePointer2, Move, Spline, Maximize2
} from 'lucide-react';

// --- Custom Node Components ---

const DatasetNode = ({ data }: { data: { label: string, columns: number, type: 'input' | 'transform' | 'output' } }) => {
  const isInput = data.type === 'input';
  const isOutput = data.type === 'output';

  return (
    <div className={`min-w-[180px] bg-white rounded-lg shadow-sm border border-gray-200 group hover:border-[#FF3C42] transition-colors relative`}>
      {/* Target Handle (Left) */}
      {!isInput && (
        <Handle 
          type="target" 
          position={Position.Left} 
          className="!bg-gray-400 !w-2.5 !h-2.5 !border-2 !border-white" 
        />
      )}
      
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1.5 rounded-md ${
             isInput ? 'bg-blue-50 text-blue-600' :
             isOutput ? 'bg-red-50 text-red-600' :
             'bg-purple-50 text-purple-600'
          }`}>
             {isInput ? <Table size={14} /> : isOutput ? <FileOutput size={14} /> : <ArrowRightLeft size={14} />}
          </div>
          <span className="text-xs font-bold text-gray-800 truncate max-w-[120px]" title={data.label}>{data.label}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
           <span className="text-[10px] text-gray-400 font-medium">{data.columns} columns</span>
           <button className="text-gray-300 hover:text-gray-600"><MoreVertical size={12} /></button>
        </div>
      </div>

      {/* Source Handle (Right) */}
      {!isOutput && (
        <Handle 
          type="source" 
          position={Position.Right} 
          className="!bg-gray-400 !w-2.5 !h-2.5 !border-2 !border-white" 
        />
      )}
    </div>
  );
};

// --- Mock Data ---

const initialNodes: Node[] = [
  // Input Zone
  { id: '1', type: 'dataset', position: { x: 50, y: 100 }, data: { label: 'flight_alerts_raw', columns: 9, type: 'input' } },
  { id: '2', type: 'dataset', position: { x: 50, y: 250 }, data: { label: 'status_mapping_raw', columns: 2, type: 'input' } },
  { id: '3', type: 'dataset', position: { x: 50, y: 400 }, data: { label: 'passengers_prep', columns: 6, type: 'input' } },
  
  // Transform Zone
  { id: '4', type: 'dataset', position: { x: 350, y: 100 }, data: { label: 'Flight Alerts - Clean', columns: 9, type: 'transform' } },
  { id: '5', type: 'dataset', position: { x: 350, y: 250 }, data: { label: 'Status Mapping - Clean', columns: 2, type: 'transform' } },
  { id: '6', type: 'dataset', position: { x: 350, y: 400 }, data: { label: 'Passengers - Clean', columns: 7, type: 'transform' } },
  
  { id: '7', type: 'dataset', position: { x: 650, y: 180 }, data: { label: 'Join Status', columns: 11, type: 'transform' } },
  { id: '8', type: 'dataset', position: { x: 650, y: 350 }, data: { label: 'priority_mapping_raw', columns: 2, type: 'transform' } },
  
  { id: '9', type: 'dataset', position: { x: 950, y: 280 }, data: { label: 'Join (2)', columns: 13, type: 'transform' } },

  // Output Zone
  { id: '10', type: 'dataset', position: { x: 1250, y: 280 }, data: { label: 'Flight Alerts Data', columns: 13, type: 'output' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-4', source: '1', target: '4', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e2-5', source: '2', target: '5', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e3-6', source: '3', target: '6', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
  
  { id: 'e4-7', source: '4', target: '7', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e5-7', source: '5', target: '7', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
  
  { id: 'e7-9', source: '7', target: '9', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e8-9', source: '8', target: '9', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
  
  { id: 'e9-10', source: '9', target: '10', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
];

const nodeTypes = {
  dataset: DatasetNode,
};

// --- Main Component ---

const DataManagementView: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className="flex flex-col h-full bg-[#F7F9FB] animate-fade-in-up">
      {/* Top Toolbar */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
             <button className="p-1.5 bg-white shadow-sm rounded-md text-gray-700 hover:text-[#FF3C42] transition-colors" title="Select"><MousePointer2 size={16}/></button>
             <button className="p-1.5 text-gray-500 hover:text-[#FF3C42] hover:bg-gray-200 rounded-md transition-colors" title="Pan"><Move size={16}/></button>
             <button className="p-1.5 text-gray-500 hover:text-[#FF3C42] hover:bg-gray-200 rounded-md transition-colors" title="Layout"><Layout size={16}/></button>
          </div>
          <div className="h-6 w-px bg-gray-200"></div>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors">
            <Plus size={14} /> Add datasets
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors">
            <Settings size={14} /> Parameters
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-gray-500 mr-2">
             <span className="font-bold text-gray-900">Last saved:</span> 10 mins ago
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold transition-colors">
            <Save size={14} /> Save
          </button>
          <div className="flex items-center rounded-lg border border-[#FF3C42] overflow-hidden">
             <button className="px-3 py-1.5 bg-white text-[#FF3C42] text-xs font-bold hover:bg-red-50 transition-colors border-r border-red-100">
                Deploy
             </button>
             <button className="px-2 py-1.5 bg-[#FF3C42] text-white hover:bg-[#E02B31] transition-colors">
                <Settings size={14} />
             </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Graph Area */}
        <div className="flex-1 bg-[#F7F9FB] relative">
            {/* Zone Backgrounds (Absolute positioning behind graph) */}
            <div className="absolute inset-0 pointer-events-none z-0">
               {/* Input Zone */}
               <div className="absolute top-4 left-4 bottom-4 w-[280px] border-2 border-red-100/50 bg-red-50/20 rounded-2xl flex flex-col items-center pt-2">
                  <span className="text-sm font-bold text-red-300 uppercase tracking-widest">Input</span>
               </div>
               {/* Transform Zone */}
               <div className="absolute top-4 left-[304px] right-[260px] bottom-4 border-2 border-red-100/50 bg-red-50/20 rounded-2xl flex flex-col items-center pt-2">
                  <span className="text-sm font-bold text-red-300 uppercase tracking-widest">Transform</span>
               </div>
               {/* Output Zone */}
               <div className="absolute top-4 right-4 bottom-4 w-[240px] border-2 border-red-100/50 bg-red-50/20 rounded-2xl flex flex-col items-center pt-2">
                  <span className="text-sm font-bold text-red-300 uppercase tracking-widest">Output</span>
               </div>
            </div>

            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              connectionMode={ConnectionMode.Loose}
              fitView
              attributionPosition="bottom-right"
              className="z-10"
            >
              <Background color="#E5E7EB" gap={20} size={1} />
              <Controls className="bg-white border border-gray-200 shadow-sm !rounded-lg overflow-hidden" />
              <MiniMap 
                nodeStrokeColor="#e2e2e2"
                nodeColor="#fff"
                maskColor="rgba(240, 240, 240, 0.6)"
                className="bg-white border border-gray-200 shadow-sm !rounded-lg" 
              />
            </ReactFlow>
        </div>

        {/* Bottom Preview Panel */}
        <div className="h-[280px] bg-white border-t border-gray-200 flex flex-col shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
               <div className="flex items-center gap-2">
                  <Table size={16} className="text-gray-500" />
                  <span className="font-bold text-sm text-gray-800">Data Preview: Join Status</span>
                  <span className="text-xs text-gray-400">| 11 columns, 2,450 rows</span>
               </div>
               <div className="flex items-center gap-2">
                   <div className="relative">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" placeholder="Search data..." className="pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF3C42]" />
                   </div>
                   <button className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded transition-colors"><Maximize2 size={14} /></button>
               </div>
            </div>
            
            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            {['category', 'flight_date', 'alert_display_name', 'flight_id', 'flight_display_name', 'rule_id', 'rule_name', 'priority', 'status', 'created_at', 'updated_at'].map((header) => (
                                <th key={header} className="px-4 py-2 text-xs font-bold text-gray-500 border-b border-r border-gray-200 uppercase tracking-wider whitespace-nowrap bg-gray-50">
                                    <div className="flex items-center justify-between gap-2">
                                        {header}
                                        <Filter size={10} className="text-gray-300" />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="text-xs text-gray-700">
                        {Array.from({ length: 8 }).map((_, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/30 transition-colors even:bg-gray-50/30">
                                <td className="px-4 py-2 border-b border-r border-gray-100 font-medium">delay</td>
                                <td className="px-4 py-2 border-b border-r border-gray-100">2018-07-0{idx + 1}</td>
                                <td className="px-4 py-2 border-b border-r border-gray-100 max-w-[200px] truncate">Extreme Delays: UA200 GUM</td>
                                <td className="px-4 py-2 border-b border-r border-gray-100 font-mono text-gray-500">d9af5aeb9...</td>
                                <td className="px-4 py-2 border-b border-r border-gray-100">UA200 GUM→HNL</td>
                                <td className="px-4 py-2 border-b border-r border-gray-100 font-mono text-gray-500">14ea29e1...</td>
                                <td className="px-4 py-2 border-b border-r border-gray-100">Extreme Delays</td>
                                <td className="px-4 py-2 border-b border-r border-gray-100 text-center">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${idx % 3 === 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                        {idx % 3 === 0 ? 'High' : 'Normal'}
                                    </span>
                                </td>
                                <td className="px-4 py-2 border-b border-r border-gray-100">Active</td>
                                <td className="px-4 py-2 border-b border-r border-gray-100 text-gray-400">2025-01-01</td>
                                <td className="px-4 py-2 border-b border-r border-gray-100 text-gray-400">2025-01-02</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagementView;

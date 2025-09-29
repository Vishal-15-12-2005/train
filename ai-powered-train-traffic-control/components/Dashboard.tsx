import React, { useState, FormEvent, useMemo, useRef, useEffect } from 'react';
import { Train, Signal, TrainType, SignalState, LogType, TrainStatus, Station, Block } from '../types';
import { useMockData } from '../hooks/useMockData';
import Icon from './Icon';
import FeatureRoadmapModal from './FeatureRoadmapModal';

// --- Helper Components ---
const getTrainColor = (type: TrainType) => {
  switch (type) {
    case TrainType.Express: return 'text-red-400';
    case TrainType.Freight: return 'text-blue-400';
    case TrainType.Local: return 'text-green-400';
    default: return 'text-yellow-400';
  }
};

const getTrainColorHex = (type: TrainType) => {
    switch (type) {
      case TrainType.Express: return '#f87171'; // red-400
      case TrainType.Freight: return '#60a5fa'; // blue-400
      case TrainType.Local: return '#4ade80'; // green-400
      default: return '#facc15'; // yellow-400
    }
};

const getSignalColor = (state: SignalState) => {
  switch (state) {
    case SignalState.Green: return 'fill-green-500';
    case SignalState.Red: return 'fill-red-500';
    case SignalState.Yellow: return 'fill-yellow-500';
    default: return 'fill-gray-500';
  }
};

const getStatusBadgeColor = (status: TrainStatus) => {
    switch (status) {
        case TrainStatus.OnTime: return 'bg-green-500/20 text-green-300';
        case TrainStatus.Delayed: return 'bg-yellow-500/20 text-yellow-300';
        case TrainStatus.Halted: return 'bg-red-500/20 text-red-300';
        default: return 'bg-blue-500/20 text-blue-300';
    }
}

const TrendIcon: React.FC<{trend: 'up'|'down'|'stable'}> = ({trend}) => {
    if(trend === 'up') return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" className="text-green-400" />;
    if(trend === 'down') return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" className="text-red-400" />;
    return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" className="text-gray-400" />;
}

// --- Main Dashboard Component ---
const Dashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { trains, signals, blocks, stations, alerts, logs, kpis, runWhatIfScenario, getAiSuggestion, selectRegion, availableRegions, activeRegion, getConversationalAiResponse, generateOptimalRoute } = useMockData();
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);
  const [hoveredElement, setHoveredElement] = useState<{ type: 'train' | 'signal'; id: string; x: number; y: number } | null>(null);
  const [isRoadmapVisible, setIsRoadmapVisible] = useState(false);
  const [whatIfResult, setWhatIfResult] = useState<{ title: string, impact: string, recommendation: string } | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<{title: string; text: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'alerts' | 'planner' | 'advisor' | 'logs'>('alerts');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  const handleRunScenario = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const trainId = formData.get('trainId') as string;
      const disruption = formData.get('disruption') as string;
      const train = trains.find(t => t.id === trainId);
      const result = runWhatIfScenario(trainId, disruption);
      
      setWhatIfResult({
          title: `Scenario: ${disruption.replace('_', ' ')} on ${train?.type} ${trainId}`,
          impact: result.projectedImpact,
          recommendation: result.recommendedAction,
      });
  }
  
  const handleGetSuggestion = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const type = formData.get('elementType') as string;
      const id = formData.get('elementId') as string;
      if (type && id) {
          const result = getAiSuggestion(type, id);
          setAiSuggestion(result);
      }
  }

  return (
    <div className="h-screen w-screen bg-gray-900 text-gray-200 flex flex-col overflow-hidden font-sans">
      {isRoadmapVisible && <FeatureRoadmapModal onClose={() => setIsRoadmapVisible(false)} />}
      {whatIfResult && <Modal title={whatIfResult.title} onClose={() => setWhatIfResult(null)}><div className="space-y-4"><InfoBlock title="Projected Impact" content={whatIfResult.impact} type="danger" /><InfoBlock title="AI Recommended Mitigation" content={whatIfResult.recommendation} type="success" /></div></Modal>}
      {aiSuggestion && <Modal title={aiSuggestion.title} onClose={() => setAiSuggestion(null)}><InfoBlock title="AI Recommendation" content={aiSuggestion.text} type="info" /></Modal>}
      {isChatOpen && <ChatModal onClose={() => setIsChatOpen(false)} getAiResponse={getConversationalAiResponse} />}
      {isManagerOpen && <NetworkManagerModal onClose={() => setIsManagerOpen(false)} onGenerateRoute={generateOptimalRoute} stations={stations} />}
      
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-3 flex justify-between items-center z-20 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-cyan-400">AI Train Control</h1>
          <select value={activeRegion} onChange={e => selectRegion(e.target.value)} className="bg-gray-700 border-gray-600 rounded-md text-sm py-1 pl-2 pr-8 focus:ring-cyan-500 focus:border-cyan-500">
            {availableRegions.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => setIsChatOpen(true)} className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white bg-gray-700 px-3 py-1.5 rounded-md transition-colors"><Icon name="chat" className="w-5 h-5"/><span>Talk with RailOpt AI</span></button>
          <button onClick={() => setIsManagerOpen(true)} className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white bg-gray-700 px-3 py-1.5 rounded-md transition-colors"><Icon name="system" className="w-5 h-5"/><span>Manage Network</span></button>
          <button onClick={() => setIsRoadmapVisible(true)} className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white bg-gray-700 px-3 py-1.5 rounded-md transition-colors"><Icon name="roadmap" className="w-5 h-5"/><span>Project Roadmap</span></button>
          <div className="flex items-center space-x-2 border-l border-gray-600 pl-2 ml-2"><Icon name="user" className="w-5 h-5 text-gray-400"/><span className="text-sm">controller_01</span></div>
          <button onClick={onLogout} className="flex items-center space-x-2 text-sm text-gray-300 hover:text-red-400 bg-red-500/20 px-3 py-1.5 rounded-md transition-colors"><Icon name="logout" className="w-5 h-5" /><span>Logout</span></button>
        </div>
      </header>
      
      <div className="grid grid-cols-4 bg-gray-800/30 border-b border-gray-700 flex-shrink-0">
          <KpiCard icon="throughput" title="Section Throughput" value={`${kpis.sectionThroughput.value} tph`} trend={kpis.sectionThroughput.trend} />
          <KpiCard icon="punctuality" title="Punctuality" value={`${kpis.punctuality.value}%`} trend={kpis.punctuality.trend} color={kpis.punctuality.trend === 'down' ? 'text-red-400' : 'text-green-400'}/>
          <KpiCard icon="delay" title="Average Delay" value={`${kpis.avgDelay.value} min`} trend={kpis.avgDelay.trend} color={kpis.avgDelay.trend === 'up' ? 'text-red-400' : 'text-green-400'}/>
          <KpiCard icon="utilization" title="Track Utilization" value={`${kpis.trackUtilization.value}%`} trend={kpis.trackUtilization.trend} />
      </div>

      <main className="flex-grow p-4 gap-4 grid grid-cols-12 overflow-hidden">
        <div className="col-span-3 flex flex-col gap-4 overflow-hidden">
            <div className="bg-gray-800/50 rounded-lg flex-grow flex flex-col border border-gray-700 overflow-hidden">
                <h2 className="text-lg font-semibold p-3 border-b border-gray-600 flex-shrink-0">Live Train Roster</h2>
                <div className="overflow-y-auto p-3">{trains.map(train => <TrainRosterItem key={train.id} train={train} isSelected={selectedTrain?.id === train.id} onClick={() => setSelectedTrain(train)} />)}</div>
            </div>
            {selectedTrain && <TrainDetailsPanel train={selectedTrain} />}
        </div>

        <div className="col-span-6 bg-gray-800/50 rounded-lg p-3 flex flex-col border border-gray-700">
            <h2 className="text-lg font-semibold mb-2 border-b border-gray-600 pb-2">Network Overview - {activeRegion}</h2>
            <div className="flex-grow bg-black/20 rounded-md relative">
                <svg width="100%" height="100%" viewBox="0 0 900 400">
                  <defs><filter id="glow"><feGaussianBlur stdDeviation="3.5" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
                  <line x1="50" y1="100" x2="850" y2="100" stroke="#4a5568" strokeWidth="2" /><line x1="50" y1="200" x2="850" y2="200" stroke="#4a5568" strokeWidth="2" /><line x1="50" y1="300" x2="850" y2="300" stroke="#4a5568" strokeWidth="2" />
                  <rect x="25" y="50" width="50" height="300" fill="#2d3748" rx="5" /><text x="50" y="45" fill="#a0aec0" textAnchor="middle" fontSize="12">Kanpur</text>
                  <rect x="825" y="50" width="50" height="300" fill="#2d3748" rx="5" /><text x="850" y="45" fill="#a0aec0" textAnchor="middle" fontSize="12">Delhi</text>
                  
                  {selectedTrain && (
                    <g>
                      {selectedTrain.path.slice(0, -1).map((p, i) => <line key={`path-${i}`} x1={p.x} y1={p.y} x2={selectedTrain.path[i+1].x} y2={selectedTrain.path[i+1].y} stroke="#6b7280" strokeWidth="2" strokeDasharray="5,5" />)}
                      {selectedTrain.currentPathIndex < selectedTrain.path.length - 1 && <line x1={selectedTrain.path[selectedTrain.currentPathIndex].x} y1={selectedTrain.path[selectedTrain.currentPathIndex].y} x2={selectedTrain.path[selectedTrain.currentPathIndex+1].x} y2={selectedTrain.path[selectedTrain.currentPathIndex+1].y} stroke={getTrainColorHex(selectedTrain.type)} strokeWidth="3" filter="url(#glow)" />}
                    </g>
                  )}

                  {signals.map(s => <circle key={s.id} cx={s.position.x} cy={s.position.y} r="8" className={`${getSignalColor(s.state)} stroke-gray-400 stroke-2 cursor-pointer`} onMouseEnter={() => setHoveredElement({type: 'signal', id: s.id, x: s.position.x, y: s.position.y})} onMouseLeave={() => setHoveredElement(null)} style={s.state !== 'Green' ? {filter: "url(#glow)"} : {}} /> )}
                  {trains.map(t => <g key={t.id} transform={`translate(${t.position.x}, ${t.position.y})`} className="cursor-pointer" onClick={() => setSelectedTrain(t)} onMouseEnter={() => setHoveredElement({type: 'train', id: t.id, x: t.position.x, y: t.position.y})} onMouseLeave={() => setHoveredElement(null)}><path d="M-10 -6 L10 -6 L12 0 L10 6 L-10 6 Z" className={getTrainColor(t.type).replace('text-', 'fill-')} /><text fill="white" x="0" y="-12" textAnchor="middle" fontSize="10">{t.id}</text></g>)}
                </svg>
                {hoveredElement && (<div className="absolute bg-gray-900 border border-gray-600 p-2 rounded-md text-xs shadow-lg pointer-events-none" style={{ left: `${(hoveredElement.x / 900) * 100}%`, top: `${(hoveredElement.y / 400) * 100}%`, transform: 'translate(15px, 15px)'}}> {hoveredElement.type === 'train' ? `Train: ${hoveredElement.id}` : `Signal: ${hoveredElement.id}`} </div>)}
            </div>
        </div>

        <div className="col-span-3 bg-gray-800/50 rounded-lg p-3 flex flex-col border border-gray-700 overflow-hidden">
            <div className="flex border-b border-gray-600 mb-2">
                <TabButton title="Alerts" active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} count={alerts.length} />
                <TabButton title="What-If" active={activeTab === 'planner'} onClick={() => setActiveTab('planner')} />
                <TabButton title="AI Advisor" active={activeTab === 'advisor'} onClick={() => setActiveTab('advisor')} />
                <TabButton title="Logs" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
            </div>
            <div className="flex-grow overflow-y-auto pr-2">
              {activeTab === 'alerts' && <AlertsPanel alerts={alerts} />}
              {activeTab === 'planner' && <WhatIfPanel trains={trains} handleRunScenario={handleRunScenario} />}
              {activeTab === 'advisor' && <AiAdvisorPanel trains={trains} stations={stations} blocks={blocks} handleGetSuggestion={handleGetSuggestion} />}
              {activeTab === 'logs' && <LogsPanel logs={logs} />}
            </div>
        </div>
      </main>
    </div>
  );
};

// --- Sub-Components for Dashboard ---
const Modal: React.FC<{title: string, onClose: () => void, children: React.ReactNode}> = ({title, onClose, children}) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-cyan-500/50">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center"><h2 className="text-lg font-bold text-cyan-400">{title}</h2><button onClick={onClose} className="text-gray-400 hover:text-white"><Icon name="close" className="w-6 h-6"/></button></div>
            <div className="p-6">{children}</div>
            <div className="p-4 bg-gray-900/50 text-right rounded-b-lg"><button onClick={onClose} className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700">Close</button></div>
        </div>
    </div>
);

const ChatModal: React.FC<{onClose: () => void; getAiResponse: (prompt: string) => string}> = ({onClose, getAiResponse}) => {
    const [history, setHistory] = useState<{sender: 'user' | 'ai', text: string}[]>([{sender: 'ai', text: 'Welcome to RailOpt AI. How can I help you today?'}]);
    const [input, setInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleSend = (e: FormEvent) => {
        e.preventDefault();
        if(!input.trim()) return;

        const userMsg = { sender: 'user' as const, text: input };
        setHistory(prev => [...prev, userMsg]);
        setInput('');

        setTimeout(() => {
            const aiMsg = { sender: 'ai' as const, text: getAiResponse(input) };
            setHistory(prev => [...prev, aiMsg]);
        }, 500);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="chat-modal-title">
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl h-[70vh] flex flex-col border border-cyan-500/50">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <Icon name="chat" className="w-7 h-7 text-cyan-400" />
                        <h2 id="chat-modal-title" className="text-lg font-bold text-cyan-400">Talk with RailOpt AI</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><Icon name="close" className="w-6 h-6" /></button>
                </div>
                <div className="p-4 flex-grow overflow-y-auto space-y-4">
                    {history.map((msg, i) => (
                        <div key={i} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0"><Icon name="ai" className="w-5 h-5 text-cyan-400"/></div>}
                            <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-700'}`}>{msg.text}</div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSend} className="p-4 border-t border-gray-700 flex-shrink-0 flex items-center gap-3">
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="e.g., 'status of RJD-12416'" className="flex-grow bg-gray-900 border-gray-600 rounded-md py-2 px-3 focus:ring-cyan-500 focus:border-cyan-500" />
                    <button type="submit" className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700">Send</button>
                </form>
            </div>
        </div>
    );
};

const NetworkManagerModal: React.FC<{onClose: () => void; onGenerateRoute: (details: any) => any; stations: Station[]}> = ({onClose, onGenerateRoute, stations}) => {
    const [activeTab, setActiveTab] = useState('planner');
    const [routeResult, setRouteResult] = useState<any>(null);

    const handleGenerate = (e: FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const details = {
            startStation: formData.get('startStation'),
            endStation: formData.get('endStation'),
            trainType: formData.get('trainType'),
        };
        const result = onGenerateRoute(details);
        setRouteResult(result);
    }
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="manager-modal-title">
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col border border-gray-700">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <Icon name="system" className="w-7 h-7 text-cyan-400" />
                        <h2 id="manager-modal-title" className="text-lg font-bold text-cyan-400">Network & Timetable Management</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><Icon name="close" className="w-6 h-6" /></button>
                </div>
                <div className="flex flex-grow overflow-hidden">
                    <div className="w-1/4 bg-gray-900/30 border-r border-gray-700 p-4">
                        <h3 className="font-semibold mb-4 text-gray-300">Management Areas</h3>
                        <nav className="flex flex-col space-y-2">
                           <button onClick={() => { setActiveTab('planner'); setRouteResult(null); }} className={`p-2 rounded text-left ${activeTab === 'planner' ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-gray-700'}`}>AI Route Planner</button>
                           <button onClick={() => setActiveTab('trains')} className={`p-2 rounded text-left ${activeTab === 'trains' ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-gray-700'}`}>Manage Trains</button>
                           <button onClick={() => setActiveTab('stations')} className={`p-2 rounded text-left ${activeTab === 'stations' ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-gray-700'}`}>Manage Stations</button>
                        </nav>
                    </div>
                    <div className="w-3/4 p-6 overflow-y-auto">
                        {activeTab === 'planner' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-white">Generate Optimal "Traffic-Free" Route</h3>
                                <form className="grid grid-cols-2 gap-4" onSubmit={handleGenerate}>
                                    <FormSelect id="startStation" label="Start Station">{stations.map(s => <option key={s.id}>{s.name}</option>)}</FormSelect>
                                    <FormSelect id="endStation" label="End Station">{stations.map(s => <option key={s.id}>{s.name}</option>)}</FormSelect>
                                    <FormSelect id="trainType" label="Train Type">{Object.values(TrainType).map(t => <option key={t}>{t}</option>)}</FormSelect>
                                    <div className="col-span-2"><button type="submit" className="w-full flex justify-center items-center space-x-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700"><Icon name="ai" className="w-5 h-5"/><span>Generate Timetable & Path</span></button></div>
                                </form>
                                {routeResult && <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700 space-y-3"><h4 className="font-bold text-green-400">AI Planning Complete</h4><p className="text-sm text-gray-300">{routeResult.message}</p><div><h5 className="font-semibold text-gray-400 mb-1">Generated Schedule</h5><div className="text-xs font-mono bg-black/30 p-2 rounded">{routeResult.schedule.map((s: any, i:number) => <div key={i}>{s.station}: {s.time} ({s.status})</div>)}</div></div></div>}
                            </div>
                        )}
                        {activeTab === 'trains' && <div className="text-gray-400">This section would contain a UI to add, edit, and remove trains from the network simulation.</div>}
                        {activeTab === 'stations' && <div className="text-gray-400">This section would provide tools to manage station properties, platform availability, and yard configurations.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoBlock: React.FC<{title: string, content: string, type: 'danger' | 'success' | 'info'}> = ({ title, content, type}) => {
    const colors = { danger: 'text-red-400', success: 'text-green-400', info: 'text-cyan-400' };
    return <div><h3 className={`font-semibold ${colors[type]} mb-1`}>{title}</h3><p className="text-sm text-gray-300 bg-black/20 p-3 rounded-md">{content}</p></div>;
};

const KpiCard: React.FC<{icon: any, title: string, value: string, trend: 'up'|'down'|'stable', color?: string}> = ({icon, title, value, trend, color}) => (
    <div className="p-3 border-r border-gray-700 last:border-r-0 flex items-center space-x-3"><Icon name={icon} className="w-8 h-8 text-gray-400" /><div><p className="text-sm text-gray-400">{title}</p><div className="flex items-baseline space-x-2"><span className={`text-xl font-bold ${color || 'text-white'}`}>{value}</span><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"><TrendIcon trend={trend} /></svg></div></div></div>
);

const TrainRosterItem: React.FC<{train: Train, isSelected: boolean, onClick: () => void}> = ({train, isSelected, onClick}) => (
    <div onClick={onClick} className={`p-2.5 rounded-md mb-2 cursor-pointer transition-colors border ${isSelected ? 'bg-cyan-500/20 border-cyan-500/50' : 'border-transparent hover:bg-gray-700/50'}`}>
      <div className="flex justify-between items-center"><span className={`font-bold ${getTrainColor(train.type)}`}>{train.id}</span><span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadgeColor(train.status)}`}>{train.status}</span></div>
      <p className="text-sm text-gray-400">To: {train.nextStation} | Delay: {train.delay} min</p>
    </div>
);

const TrainDetailsPanel: React.FC<{train: Train}> = ({train}) => (
    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 flex-shrink-0">
      <h2 className="text-lg font-semibold mb-2 border-b border-gray-600 pb-2">Details: <span className={getTrainColor(train.type)}>{train.id}</span></h2>
       <div className="space-y-1 text-sm"><p><strong>Speed:</strong> {train.speed} km/h | <strong>Priority:</strong> {train.priority}</p><div><strong>Status:</strong> <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeColor(train.status)}`}>{train.status} ({train.delay} min delay)</span></div><div className="pt-2"><h4 className="font-semibold text-gray-400 mb-1">Passenger Impact</h4><p className="text-xs">Est. {train.passengerImpact.count.toLocaleString()} passengers affected.</p><p className="text-xs">{train.passengerImpact.missedConnections} potential missed connections.</p></div></div>
    </div>
);

const TabButton: React.FC<{title: string, active: boolean, onClick: () => void, count?: number}> = ({ title, active, onClick, count }) => (
    <button onClick={onClick} className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${active ? 'text-cyan-400 border-cyan-400' : 'text-gray-400 border-transparent hover:text-white hover:border-gray-400'}`}>
        {title} {count !== undefined && count > 0 && <span className="ml-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">{count}</span>}
    </button>
);

const AlertsPanel: React.FC<{alerts: any[]}> = ({alerts}) => (
    <div className="space-y-2">{alerts.length > 0 ? alerts.map(alert => (<div key={alert.id} className={`p-2.5 rounded-md border-l-4 ${alert.xai ? 'bg-cyan-500/10 border-cyan-500' : 'bg-red-500/10 border-red-500'}`}><p className={`font-bold ${alert.xai ? 'text-cyan-400':'text-red-400'}`}>{alert.title}</p><p className="text-sm text-gray-300">{alert.message}</p>{alert.xai && <p className="text-xs text-cyan-200 mt-2 p-2 bg-black/20 rounded"><strong>[XAI] Reason:</strong> {alert.xai}</p>}<p className="text-xs text-gray-500 text-right mt-1">{alert.timestamp}</p></div>)) : <p className="text-sm text-gray-500 text-center py-4">No critical alerts.</p>}</div>
);

const FormSelect: React.FC<{id: string; label: string; children: React.ReactNode}> = ({id, label, children}) => (
    <div><label htmlFor={id} className="block text-sm font-medium text-gray-400">{label}</label><select id={id} name={id} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-900 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md">{children}</select></div>
)

const WhatIfPanel: React.FC<{trains: Train[], handleRunScenario: (e: FormEvent<HTMLFormElement>) => void}> = ({trains, handleRunScenario}) => (
    <form className="space-y-3" onSubmit={handleRunScenario}>
        <FormSelect id="trainId" label="Select Train">{trains.map(t => <option key={t.id} value={t.id}>{t.id} ({t.type})</option>)}</FormSelect>
        <FormSelect id="disruption" label="Select Disruption"><option value="delay_10">Add 10 Min Delay</option><option value="engine_fault">Simulate Engine Fault</option></FormSelect>
        <button type="submit" className="w-full flex justify-center items-center space-x-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"><Icon name="scenario" className="w-5 h-5"/><span>Run Simulation</span></button>
     </form>
);

const AiAdvisorPanel: React.FC<{trains: Train[], stations: Station[], blocks: Block[], handleGetSuggestion: (e: FormEvent<HTMLFormElement>) => void}> = ({trains, stations, blocks, handleGetSuggestion}) => {
    const [elementType, setElementType] = useState('train');
    const elementOptions = useMemo(() => {
        switch(elementType) {
            case 'train': return trains.map(t => ({id: t.id, name: `${t.id} (${t.type})`}));
            case 'station': return stations.map(s => ({id: s.id, name: s.name}));
            case 'block': return blocks.map(b => ({id: b.id, name: `${b.id} ${b.occupiedBy ? `(Occupied by ${b.occupiedBy})` : '(Clear)'}`}));
            default: return [];
        }
    }, [elementType, trains, stations, blocks]);

    return (
        <form className="space-y-3" onSubmit={handleGetSuggestion}>
            <FormSelect id="elementType" label="Select Element Type" >
                <option value="train" onClick={() => setElementType('train')}>Train</option>
                <option value="station" onClick={() => setElementType('station')}>Station</option>
                <option value="block" onClick={() => setElementType('block')}>Track Block</option>
            </FormSelect>
            <FormSelect id="elementId" label="Select Specific Element">{elementOptions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</FormSelect>
            <button type="submit" className="w-full flex justify-center items-center space-x-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700"><Icon name="ai" className="w-5 h-5"/><span>Get AI Suggestion</span></button>
        </form>
    );
}

const LogsPanel: React.FC<{logs: any[]}> = ({logs}) => (
    <div className="text-xs space-y-2 font-mono">{logs.map(log => (<div key={log.id} className="flex items-start"><span className="text-gray-500 mr-2">{log.timestamp}</span><span className={`font-bold mr-2 ${log.type === LogType.AI ? 'text-cyan-400' : 'text-gray-400'}`}>[{log.type}]</span><p className="flex-1">{log.message}</p></div>))}</div>
);

export default Dashboard;
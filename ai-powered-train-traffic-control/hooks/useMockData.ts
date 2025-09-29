import { useState, useEffect, useCallback, useRef } from 'react';
import { Train, Signal, Alert, LogEntry, TrainType, TrainStatus, SignalState, LogType, KpiData, Block, Station } from '../types';

// --- BASE DATA ---
const networkStations: Station[] = [
    { id: 'ST-KNP', name: 'Kanpur', position: { x: 50, y: 50 } },
    { id: 'ST-ALJ', name: 'Aligarh', position: { x: 450, y: 50 } },
    { id: 'ST-DLI', name: 'Delhi', position: { x: 850, y: 50 } },
];

const blockDefinitions: { [key: string]: { line: number, start: number, end: number } } = {
    'B1-A': { line: 100, start: 0, end: 400 }, 'B1-B': { line: 100, start: 400, end: 900 },
    'B2-A': { line: 200, start: 0, end: 400 }, 'B2-B': { line: 200, start: 400, end: 900 },
    'B3-A': { line: 300, start: 0, end: 400 }, 'B3-B': { line: 300, start: 400, end: 900 },
};

// --- REGIONAL DATA ---
const networkData: { [key: string]: { trains: Train[], signals: Signal[], blocks: Block[], kpis: KpiData } } = {
    'Delhi Division': {
        trains: [
            { id: 'RJD-12416', type: TrainType.Express, priority: 1, speed: 110, position: { x: 50, y: 100 }, path: [{ x: 50, y: 100 }, { x: 450, y: 100 }, { x: 850, y: 100 }], currentPathIndex: 0, status: TrainStatus.OnTime, delay: 0, nextStation: 'Delhi', eta: '10:30', schedule: [], passengerImpact: { count: 850, missedConnections: 0 }, currentBlock: 'B1-A' },
            { id: 'FRT-8805', type: TrainType.Freight, priority: 3, speed: 60, position: { x: 50, y: 200 }, path: [{ x: 50, y: 200 }, { x: 850, y: 200 }], currentPathIndex: 0, status: TrainStatus.OnTime, delay: 0, nextStation: 'Ghaziabad', eta: '11:15', schedule: [], passengerImpact: { count: 0, missedConnections: 0 }, currentBlock: 'B2-A' },
            { id: 'LCL-0442', type: TrainType.Local, priority: 2, speed: 75, position: { x: 850, y: 300 }, path: [{ x: 850, y: 300 }, { x: 450, y: 300 }, { x: 50, y: 300 }], currentPathIndex: 0, status: TrainStatus.Delayed, delay: 10, nextStation: 'Kanpur', eta: '10:55', schedule: [], passengerImpact: { count: 1200, missedConnections: 150 }, currentBlock: 'B3-B' },
            { id: 'MNT-007', type: TrainType.Maintenance, priority: 4, speed: 40, position: { x: 50, y: 300 }, path: [{ x: 50, y: 300 }, { x: 850, y: 300 }], currentPathIndex: 0, status: TrainStatus.OnTime, delay: 0, nextStation: 'Aligarh Yard', eta: '11:00', schedule: [], passengerImpact: { count: 0, missedConnections: 0 }, currentBlock: 'B3-A' },
        ],
        signals: [
            { id: 'S1-DLI', state: SignalState.Green, position: { x: 400, y: 100 }, protectsBlock: 'B1-B' }, { id: 'S2-DLI', state: SignalState.Green, position: { x: 400, y: 200 }, protectsBlock: 'B2-B' }, { id: 'S3-DLI', state: SignalState.Green, position: { x: 400, y: 300 }, protectsBlock: 'B3-B' },
        ],
        blocks: Object.keys(blockDefinitions).map(id => ({ id, occupiedBy: null })),
        kpis: { sectionThroughput: { value: 12, trend: 'stable'}, punctuality: { value: 75.0, trend: 'stable' }, avgDelay: { value: 2.5, trend: 'stable'}, trackUtilization: { value: 76.1, trend: 'stable'}}
    },
    'Mumbai Division': {
        trains: [
            { id: 'CSTM-DR', type: TrainType.Local, priority: 1, speed: 80, position: { x: 50, y: 100 }, path: [{ x: 50, y: 100 }, { x: 850, y: 100 }], currentPathIndex: 0, status: TrainStatus.OnTime, delay: 0, nextStation: 'Dadar', eta: '14:20', schedule: [], passengerImpact: { count: 1500, missedConnections: 20 }, currentBlock: 'B1-A' },
            { id: 'DE-ADI', type: TrainType.Express, priority: 2, speed: 120, position: { x: 850, y: 200 }, path: [{ x: 850, y: 200 }, { x: 50, y: 200 }], currentPathIndex: 0, status: TrainStatus.OnTime, delay: 0, nextStation: 'Ahmedabad', eta: '14:45', schedule: [], passengerImpact: { count: 950, missedConnections: 0 }, currentBlock: 'B2-B' },
            { id: 'FRT-9102', type: TrainType.Freight, priority: 3, speed: 55, position: { x: 50, y: 300 }, path: [{ x: 50, y: 300 }, { x: 850, y: 300 }], currentPathIndex: 0, status: TrainStatus.Delayed, delay: 15, nextStation: 'JNPT', eta: '15:00', schedule: [], passengerImpact: { count: 0, missedConnections: 0 }, currentBlock: 'B3-A' },
        ],
        signals: [
            { id: 'S1-MUM', state: SignalState.Green, position: { x: 400, y: 100 }, protectsBlock: 'B1-B' }, { id: 'S2-MUM', state: SignalState.Green, position: { x: 400, y: 200 }, protectsBlock: 'B2-B' }, { id: 'S3-MUM', state: SignalState.Green, position: { x: 400, y: 300 }, protectsBlock: 'B3-B' },
        ],
        blocks: Object.keys(blockDefinitions).map(id => ({ id, occupiedBy: null })),
        kpis: { sectionThroughput: { value: 18, trend: 'up'}, punctuality: { value: 89.5, trend: 'up' }, avgDelay: { value: 1.2, trend: 'down'}, trackUtilization: { value: 88.4, trend: 'up'}}
    }
};

let alertId = 1;
let logId = 1;

const getBlockIdForPosition = (position: {x: number; y: number}): string | null => {
    for (const id in blockDefinitions) {
        const block = blockDefinitions[id];
        if (position.y === block.line && position.x >= block.start && position.x < block.end) return id;
    }
    return null;
}

export const useMockData = () => {
  const [activeRegion, setActiveRegion] = useState('Delhi Division');
  const [trains, setTrains] = useState<Train[]>(networkData[activeRegion].trains);
  const [signals, setSignals] = useState<Signal[]>(networkData[activeRegion].signals);
  const [blocks, setBlocks] = useState<Block[]>(networkData[activeRegion].blocks);
  const [kpis, setKpis] = useState<KpiData>(networkData[activeRegion].kpis);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const lastKpiUpdate = useRef(Date.now());
  const aiDecisionMade = useRef(new Set());

  const addLog = useCallback((type: LogType, message: string) => {
    const newLog: LogEntry = { id: logId++, type, message, timestamp: new Date().toLocaleTimeString() };
    setLogs(prev => [newLog, ...prev.slice(0, 99)]);
  }, []);

  const addAlert = useCallback((title: string, message: string, xai?: string) => {
    const newAlert: Alert = { id: alertId++, title, message, timestamp: new Date().toLocaleTimeString(), xai };
    setAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
    addLog(LogType.Alert, `${title}: ${message}`);
  }, [addLog]);

  const selectRegion = useCallback((region: string) => {
    if (networkData[region]) {
        addLog(LogType.System, `Controller view switched to ${region}.`);
        setActiveRegion(region);
        setTrains(networkData[region].trains);
        setSignals(networkData[region].signals);
        setBlocks(networkData[region].blocks);
        setKpis(networkData[region].kpis);
        setAlerts([]);
        aiDecisionMade.current.clear();
    }
  }, [addLog]);

  useEffect(() => {
    // Populate initial block occupancy for the current region
    setBlocks(currentBlocks => {
        const updatedBlocks = currentBlocks.map(b => ({...b, occupiedBy: null}));
        trains.forEach(t => {
            const blockId = getBlockIdForPosition(t.position);
            const block = updatedBlocks.find(b => b.id === blockId);
            if(block) block.occupiedBy = t.id;
            t.currentBlock = blockId;
        });
        return updatedBlocks;
    });
    addLog(LogType.System, `Digital Twin initialized for ${activeRegion}. Block system active.`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRegion]); // Run only when region changes

  useEffect(() => {
    const interval = setInterval(() => {
      let currentSignals = signals;
      let currentBlocks = blocks;
      
      // 1. Update signal states based on block occupancy
      setSignals(prevSignals => {
        currentSignals = prevSignals.map(signal => {
            const protectedBlock = blocks.find(b => b.id === signal.protectsBlock);
            return { ...signal, state: protectedBlock?.occupiedBy ? SignalState.Red : SignalState.Green };
        });
        return currentSignals;
      });

      // 2. Update train positions
      setTrains(prevTrains => {
        const nextTrains = prevTrains.map(train => {
            const target = train.path[train.currentPathIndex + 1];
            if (!target) return { ...train, speed: 0 };
            const direction = target.x > train.position.x ? 1 : -1;
            
            const signalAhead = currentSignals.find(s => 
                s.position.y === train.position.y &&
                (direction > 0 ? (s.position.x > train.position.x && s.position.x - train.position.x < 50) : (s.position.x < train.position.x && train.position.x - s.position.x < 50))
            );

            let currentSpeed = train.speed;
            let currentStatus = train.delay > 0 ? TrainStatus.Delayed : TrainStatus.OnTime;
            if (signalAhead && signalAhead.state === SignalState.Red && Math.abs(train.position.x - signalAhead.position.x) < 20) {
                currentSpeed = 0;
                currentStatus = TrainStatus.Halted;
            }

            const distance = Math.abs(target.x - train.position.x);
            if (distance < 5) return { ...train, currentPathIndex: train.currentPathIndex + 1 };
            const moveX = direction * (currentSpeed / 20);
            return { ...train, speed: currentSpeed, status: currentStatus, position: { x: train.position.x + moveX, y: train.position.y } };
        });

        // 3. Update block occupancy based on new train positions
        setBlocks(prevBlocks => {
            currentBlocks = prevBlocks.map(b => ({...b, occupiedBy: null}));
            nextTrains.forEach(train => {
                const newBlockId = getBlockIdForPosition(train.position);
                train.currentBlock = newBlockId;
                const blockToOccupy = currentBlocks.find(b => b.id === newBlockId);
                if (blockToOccupy && !blockToOccupy.occupiedBy) blockToOccupy.occupiedBy = train.id;
            });
            return currentBlocks;
        });
        
        // 4. AI & Event Logic
        const maintenanceTrain = nextTrains.find(t => t.id === 'MNT-007');
        if (!aiDecisionMade.current.has('MNT-007') && maintenanceTrain?.status === TrainStatus.Halted) {
            addAlert(`AI Action: Hold MNT-007`, `Holding Maintenance train at Signal S3-DLI due to occupied block ahead.`, "Conflict detected at Aligarh junction. LCL-0442 (Priority 2, 1200 passengers) currently occupies block B3-B. Holding MNT-007 (Priority 4) minimizes passenger delay and adheres to safety protocols.");
            aiDecisionMade.current.add('MNT-007');
        }

        return nextTrains;
      });
       
       if(Date.now() - lastKpiUpdate.current > 5000) {
           setKpis(prev => {
                const onTimeTrains = trains.filter(t => t.delay === 0).length;
                const totalTrains = trains.length;
                const newPunctuality = totalTrains > 0 ? (onTimeTrains / totalTrains) * 100 : 100;
               return { ...prev, punctuality: { value: parseFloat(newPunctuality.toFixed(1)), trend: newPunctuality > prev.punctuality.value ? 'up' : newPunctuality < prev.punctuality.value ? 'down' : 'stable' }};
           });
           lastKpiUpdate.current = Date.now();
       }

    }, 1000);

    return () => clearInterval(interval);
  }, [addAlert, blocks, signals, trains, activeRegion]);
  
  const runWhatIfScenario = useCallback( (trainId: string, disruption: string) => {
      const train = trains.find(t => t.id === trainId);
      if (!train) return { projectedImpact: "Train not found.", recommendedAction: "N/A" };
      switch(disruption) {
          case "delay_10": return { projectedImpact: `Applying a 10 min delay to ${trainId} will cause a cascading delay of ~7 mins to another train and conflict with a high-priority Express train.`, recommendedAction: `AI suggests rerouting ${trainId} via an alternate line and holding a lower priority train for 3 minutes to clear the junction.` };
          case "engine_fault": return { projectedImpact: `A simulated engine fault on ${trainId} will occupy its block for an additional 18 minutes, halting all subsequent traffic on that line.`, recommendedAction: `AI suggests immediately routing ${trainId} to the nearest maintenance siding (ETA 6 mins) to clear the main line.` };
        default: return { projectedImpact: "Unknown scenario.", recommendedAction: "No action available." };
      }
  }, [trains]);

  const getAiSuggestion = useCallback( (type: string, id: string) => {
      switch(type) {
          case 'train': 
            const train = trains.find(t => t.id === id);
            if (!train) return { title: 'Suggestion for Train', text: 'Train not found.' };
            if (train.delay > 10) return { title: `Optimize ${id}`, text: `Train ${id} has a significant delay. AI suggests increasing its priority to 1 for the next two blocks to recover 8 minutes from its schedule. This has a minimal impact on other low-priority services.` };
            return { title: `Monitor ${id}`, text: `Train ${id} is currently operating within expected parameters. No immediate action is required. Monitor for potential conflicts in block B2-B.` };
          case 'station':
            const station = networkStations.find(s => s.id === id);
            return { title: `Optimize ${station?.name || id}`, text: `Platform 4 at ${station?.name || id} shows high congestion in the next 30 minutes. AI recommends re-routing LCL-0442 to Platform 6 to reduce turnaround time by 4 minutes.` };
          case 'block':
            const block = blocks.find(b => b.id === id);
            if (block?.occupiedBy) return { title: `Action for Block ${id}`, text: `Block ${id} is currently occupied by ${block.occupiedBy}. To improve flow, consider reducing speed for the next approaching train to create a larger gap, preventing a halt at the next signal.` };
            return { title: `Monitor Block ${id}`, text: `Block ${id} is currently clear. Throughput is nominal. No action required.` };
          default:
            return { title: 'AI Suggestion', text: 'Select an element to receive a contextual suggestion.' };
      }
  }, [trains, blocks]);

  const getConversationalAiResponse = useCallback((prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase().trim();
    
    const trainIdRegex = /([a-zA-Z]{3,4}-?\d{4,5})/;
    const trainMatch = lowerPrompt.match(trainIdRegex);
    if (trainMatch) {
        const trainId = trainMatch[1].toUpperCase().replace('-', '');
        const foundTrain = trains.find(t => t.id.replace('-', '') === trainId);
        if (foundTrain) {
            return `Train ${foundTrain.id} (${foundTrain.type}) is currently ${foundTrain.status}. It's moving at ${foundTrain.speed} km/h towards ${foundTrain.nextStation}. Current delay is ${foundTrain.delay} minutes.`;
        } else {
            return `I could not find information for train ID "${trainMatch[1]}". Please ensure the ID is correct.`;
        }
    }

    if (lowerPrompt.includes('free platform') && lowerPrompt.includes('at')) {
        const stationMatch = lowerPrompt.match(/at\s+([a-zA-Z\s]+)/);
        const stationName = stationMatch ? stationMatch[1].trim() : 'the main station';
        return `Analyzing traffic for ${stationName}... Based on current schedules, Platform 4 is projected to be available in 12 minutes and can accommodate an Express service.`;
    }

    if (lowerPrompt.includes('status report') || lowerPrompt.includes('system status')) {
        const onTimeCount = trains.filter(t => t.status === TrainStatus.OnTime).length;
        const delayedCount = trains.filter(t => t.status === TrainStatus.Delayed).length;
        return `Current status for ${activeRegion}: ${trains.length} trains are active. ${onTimeCount} are on-time, ${delayedCount} are delayed. Overall punctuality is ${kpis.punctuality.value}%. All systems are nominal.`;
    }
    
    if (lowerPrompt.includes('help')) {
        return "I can provide real-time status on trains (e.g., 'status of RJD-12416'), find free platforms ('find a free platform at Delhi'), or give a 'system status report'. How can I assist?";
    }

    return "I'm sorry, I could not understand that query. For assistance, type 'help'.";
  }, [trains, kpis, activeRegion]);
  
  const generateOptimalRoute = useCallback((details: { startStation: string; endStation: string; trainType: TrainType }) => {
    const { startStation, endStation, trainType } = details;
    const startTime = new Date();
    const addMinutes = (date: Date, minutes: number) => new Date(date.getTime() + minutes * 60000);
    
    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const schedule = [
        { station: startStation, time: `${formatTime(startTime)} (DEP)`, status: 'Scheduled' },
        { station: 'Aligarh', time: `${formatTime(addMinutes(startTime, 45))} (ARR)`, status: 'Scheduled' },
        { station: 'Aligarh', time: `${formatTime(addMinutes(startTime, 50))} (DEP)`, status: 'Scheduled' },
        { station: endStation, time: `${formatTime(addMinutes(startTime, 90))} (ARR)`, status: 'Scheduled' },
    ];
    
    const path = [{ x: 50, y: 100 }, { x: 450, y: 100 }, { x: 850, y: 100 }];

    const message = `Successfully generated a conflict-free primary route for a new ${trainType} service from ${startStation} to ${endStation}. The proposed path utilizes Track 1 with an estimated journey time of 1h 30m.`;
    
    addLog(LogType.AI, `Generated optimal route for new ${trainType} from ${startStation} to ${endStation}.`);

    return { schedule, path, message };
  }, [addLog]);

  return { trains, signals, blocks, stations: networkStations, alerts, logs, kpis, runWhatIfScenario, getAiSuggestion, selectRegion, availableRegions: Object.keys(networkData), activeRegion, getConversationalAiResponse, generateOptimalRoute };
};
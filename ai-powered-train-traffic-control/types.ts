export enum TrainType {
  Express = 'Express',
  Freight = 'Freight',
  Local = 'Local',
  Maintenance = 'Maintenance',
}

export enum TrainStatus {
  OnTime = 'On Time',
  Delayed = 'Delayed',
  Halted = 'Halted',
  Approaching = 'Approaching',
}

export enum SignalState {
  Green = 'Green',
  Red = 'Red',
  Yellow = 'Yellow',
}

export enum LogType {
  AI = 'AI',
  System = 'System',
  Alert = 'Alert',
  Info = 'Info',
}

export interface Block {
  id: string;
  occupiedBy: string | null;
}

export interface Station {
  id: string;
  name: string;
  position: { x: number; y: number };
}

export interface Train {
  id: string;
  type: TrainType;
  priority: number;
  speed: number;
  position: { x: number; y: number };
  path: { x: number; y: number }[];
  currentPathIndex: number;
  status: TrainStatus;
  delay: number; // in minutes
  nextStation: string;
  eta: string;
  schedule: { station: string; time: string; status: 'Departed' | 'On Time' | 'Delayed' }[];
  passengerImpact: {
    count: number;
    missedConnections: number;
  };
  currentBlock: string | null;
}

export interface Signal {
  id: string;
  state: SignalState;
  position: { x: number; y: number };
  protectsBlock: string;
}

export interface Alert {
  id: number;
  title: string;
  message: string;
  timestamp: string;
  xai?: string; // Explainable AI component
}

export interface LogEntry {
  id: number;
  type: LogType;
  message: string;
  timestamp: string;
}

export interface KpiData {
    sectionThroughput: { value: number, trend: 'up' | 'down' | 'stable' };
    punctuality: { value: number, trend: 'up' | 'down' | 'stable' };
    avgDelay: { value: number, trend: 'up' | 'down' | 'stable' };
    trackUtilization: { value: number, trend: 'up' | 'down' | 'stable' };
}
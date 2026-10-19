export type BreedingMode = 'OFF' | 'TEP' | 'CA' | 'CAY' | 'CUSTOM';

export type PumpType = 'SMALL' | 'LARGE';

export interface ModeThresholds {
  lo: number;
  hi: number;
  flushMinutes: number;
  flushSeconds: number;
}

export interface ErrorDefinition {
  code: string;
  displayCode: string;
  ledState: string;
  cause: string;
  solution: string;
  severity: 'critical' | 'warning' | 'info';
}

export interface ManualSection {
  id: string;
  number: number;
  title: string;
  summary: string;
  content: string;
  highlights?: string[];
  subsections?: {
    id: string;
    title: string;
    content: string;
  }[];
}

export interface SimulatorState {
  // Machine operation
  isPowered: boolean;
  isSleeping: boolean;
  nightMode: boolean;
  screenSleepEnabled: boolean;
  
  // Readings
  currentTDS: number;
  currentTemp: number;
  hasTempSensor: boolean; // Optional sensor: if false, no temp display and NO error
  lastMeasureTimestamp: number;
  
  // Real-time states
  isFiltering: boolean;
  isFlushing: boolean;
  isPressureReleasing: boolean;
  isDryPumping: boolean;
  
  // Hardware configuration
  pumpType: PumpType;
  activeMode: BreedingMode;
  modeSettings: Record<BreedingMode, ModeThresholds>;
  
  // Button hold config
  holdDurationSeconds: number; // 0 for instant, 0.5 - 3s
  
  // Active error or null
  activeError: string | null;
  
  // Filter & Flush Schedules
  filterSchedule: {
    type: '100' | '101' | '102' | '103' | '104';
    dayPattern: 'C07' | 'C24' | 'C13' | 'C03' | 'Ctu';
    minutesPerHour: number;
    weekdays: number[]; // 0-6
  };
  
  flushSchedule: {
    type: 'nd' | 'Ctu';
    everyNDays: number;
    timesPerDay: number;
    startHour: number;
    startMinute: number;
    flushMinutes: number;
    flushSeconds: number;
    weekdays: number[];
  };
  
  // Sensor setting
  sensorMode: 'HOURLY' | 'REALTIME';
  autoRunFilterToMeasure: boolean;
  
  // LED logo effect
  logoEffect: number; // 1-8
  logoSpeed: number;
  
  // WiFi & RTC
  homeWifiSSID: string;
  homeWifiConnected: boolean;
  deviceIp: string;
  rtcTime: string; // HH:mm:ss
}

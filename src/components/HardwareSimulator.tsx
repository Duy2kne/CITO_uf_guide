import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SimulatorState, BreedingMode } from '../types/manual';
import { soundEffects } from '../utils/audioSynth';
import { Volume2, VolumeX, RotateCcw, AlertTriangle, Droplets, Gauge, Sparkles, HelpCircle } from 'lucide-react';

interface HardwareSimulatorProps {
  state: SimulatorState;
  updateState: (partial: Partial<SimulatorState> | ((prev: SimulatorState) => Partial<SimulatorState>)) => void;
  onOpenTroubleshooting?: (code: string) => void;
}

export const HardwareSimulator: React.FC<HardwareSimulatorProps> = ({
  state,
  updateState,
  onOpenTroubleshooting,
}) => {
  // Display cycling: in normal mode, alternate TDS (4s) and Temp (2s)
  const [displayCycle, setDisplayCycle] = useState<'TDS' | 'TEMP'>('TDS');
  const [touchProgress, setTouchProgress] = useState<string | null>(null); // "-", "--", "---"
  const [activeTouchButton, setActiveTouchButton] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(soundEffects.isMuted);

  // Menu navigation state when editing on device
  const [menuState, setMenuState] = useState<{
    type: 'NONE' | 'THRESHOLD_EDIT' | 'LOC_MENU' | 'XA_MENU';
    step: number; // 0, 1, 2, ...
    targetMode?: BreedingMode;
    tempLo?: number;
    tempHi?: number;
    tempMin?: number;
    tempSec?: number;
    filterType?: '100' | '101' | '102' | '103' | '104';
    dayPattern?: 'C07' | 'C24' | 'C13' | 'C03' | 'Ctu';
    minPerHour?: number;
  }>({ type: 'NONE', step: 0 });

  // Transient startup state: e.g. 888 -> Prt -> normal
  const [startupStage, setStartupStage] = useState<'IDLE' | '888' | 'Prt'>('IDLE');

  // Holding timers
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStageTimersRef = useRef<NodeJS.Timeout[]>([]);
  const touchStartTimeRef = useRef<number>(0);
  const autoExitMenuTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Alternating display timer (TDS 4s ↔ Temp 2s)
  // Lưu ý: Nhiệt độ là tùy chọn (optional), nếu không gắn cảm biến nhiệt độ thì chỉ hiển thị TDS (không báo lỗi)
  useEffect(() => {
    if (state.activeError || menuState.type !== 'NONE' || startupStage !== 'IDLE' || touchProgress) {
      return;
    }
    if (!state.hasTempSensor) {
      setDisplayCycle('TDS');
      return;
    }
    const interval = setInterval(() => {
      setDisplayCycle((prev) => (prev === 'TDS' ? 'TEMP' : 'TDS'));
    }, displayCycle === 'TDS' ? 4000 : 2000);

    return () => clearInterval(interval);
  }, [displayCycle, state.activeError, menuState.type, startupStage, touchProgress, state.hasTempSensor]);

  // Dedicated error alternation state (1 second "Err" ↔ 1 second Error Code)
  const [errorPhase, setErrorPhase] = useState<'ERR' | 'CODE'>('ERR');
  useEffect(() => {
    if (!state.activeError) {
      setErrorPhase('ERR');
      return;
    }
    const interval = setInterval(() => {
      setErrorPhase((prev) => (prev === 'ERR' ? 'CODE' : 'ERR'));
    }, 1000);

    return () => clearInterval(interval);
  }, [state.activeError]);

  // Automatic flush triggering when TDS > Hi in active mode
  useEffect(() => {
    if (state.activeMode !== 'OFF' && !state.isFlushing && !state.activeError) {
      const modeCfg = state.modeSettings[state.activeMode];
      if (state.currentTDS > modeCfg.hi) {
        // Trigger automated flush!
        updateState({ isFlushing: true });
        const flushDurationMs = (modeCfg.flushMinutes * 60 + modeCfg.flushSeconds) * 1000;
        const timer = setTimeout(() => {
          updateState((prev) => ({
            isFlushing: false,
            currentTDS: Math.max(modeCfg.lo, prev.currentTDS - 35), // Water changed, TDS dropped
          }));
        }, Math.max(3000, Math.min(flushDurationMs, 8000))); // Simulate flush in a brief observable window
        return () => clearTimeout(timer);
      }
    }
  }, [state.currentTDS, state.activeMode, state.isFlushing, state.activeError, state.modeSettings, updateState]);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (autoExitMenuTimerRef.current) clearTimeout(autoExitMenuTimerRef.current);
      touchStageTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  const resetMenuAutoExit = useCallback(() => {
    if (autoExitMenuTimerRef.current) clearTimeout(autoExitMenuTimerRef.current);
    autoExitMenuTimerRef.current = setTimeout(() => {
      setMenuState({ type: 'NONE', step: 0 });
    }, 10000); // Page 6: "Không bấm gì trong 10 giây thì máy tự thoát về màn hình TDS"
  }, []);

  const clearHoldTimers = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    touchStageTimersRef.current.forEach(clearTimeout);
    touchStageTimersRef.current = [];
    setTouchProgress(null);
    setActiveTouchButton(null);
  };

  // Toggle mute
  const handleToggleMute = () => {
    soundEffects.isMuted = !soundEffects.isMuted;
    setIsMuted(soundEffects.isMuted);
  };

  // Simulate initial startup (Page 3)
  const triggerStartupSequence = () => {
    clearHoldTimers();
    setMenuState({ type: 'NONE', step: 0 });
    setStartupStage('888');
    soundEffects.playStartupBeeps();

    setTimeout(() => {
      setStartupStage('Prt');
      updateState({ isFiltering: true });
      setTimeout(() => {
        setStartupStage('IDLE');
        updateState({ isFiltering: false });
      }, 2500);
    }, 700);
  };

  // Factory reset action: chạy 3.5s kèm 5 tiếng bíp rồi tự về hoạt động bình thường
  const triggerFactoryReset = () => {
    soundEffects.playResetBeeps();
    updateState({
      activeError: 'rES',
      activeMode: 'OFF',
      isFiltering: false,
      isFlushing: false,
      isPressureReleasing: false,
      isDryPumping: false,
      filterSchedule: {
        type: '103',
        dayPattern: 'C07',
        minutesPerHour: 30,
        weekdays: [0, 1, 2, 3, 4, 5, 6],
      },
      flushSchedule: {
        type: 'nd',
        everyNDays: 3,
        timesPerDay: 1,
        startHour: 12,
        startMinute: 0,
        flushMinutes: 1,
        flushSeconds: 0,
        weekdays: [0, 1, 2, 3, 4, 5, 6],
      },
      holdDurationSeconds: 1,
      nightMode: false,
      screenSleepEnabled: true,
      sensorMode: 'HOURLY',
      pumpType: 'SMALL',
    });
    setMenuState({ type: 'NONE', step: 0 });

    // Chạy trong 3.5 giây rồi tự động trở về hoạt động đo TDS bình thường
    setTimeout(() => {
      updateState({
        activeError: null,
      });
    }, 3500);
  };

  // Toggle error helper (Bật / Tắt lỗi theo dạng toggle trực tiếp, không cần nút xóa lỗi riêng)
  const handleToggleError = (
    code: string,
    onActivate: () => void,
    onDeactivate?: () => void
  ) => {
    if (state.activeError === code) {
      soundEffects.playButtonConfirm();
      if (onDeactivate) {
        onDeactivate();
      } else {
        updateState({
          activeError: null,
          isPressureReleasing: false,
        });
      }
    } else {
      onActivate();
    }
  };

  // Touch start handlers
  const handleTouchDown = (btnName: string) => {
    soundEffects.playTouchTick();
    setActiveTouchButton(btnName);
    touchStartTimeRef.current = Date.now();

    // Wake up if sleeping
    if (state.isSleeping) {
      updateState({ isSleeping: false });
      return;
    }

    // Buttons with instantaneous response: OK, UP, DOWN
    if (btnName === 'UP') {
      handleUpClick();
      return;
    }
    if (btnName === 'DOWN') {
      handleDownClick();
      return;
    }
    if (btnName === 'OK') {
      // Immediate response for OK on simple touch
      // But also start 5s / 10s hold detection if user keeps holding!
      startHoldTimer(btnName);
      return;
    }

    // For other buttons: 1s hold needed (Page 4: - immediately, -- at 0.5s, --- + beep at 1s)
    setTouchProgress('-');
    const timer1 = setTimeout(() => {
      setTouchProgress('--');
    }, 450);

    const timer2 = setTimeout(() => {
      setTouchProgress('---');
      soundEffects.playButtonConfirm();
    }, 1000);

    touchStageTimersRef.current = [timer1, timer2];
    startHoldTimer(btnName);
  };

  const startHoldTimer = (btnName: string) => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);

    // 5s hold handlers (dry pump, pressure release, menu, etc.)
    holdTimerRef.current = setTimeout(() => {
      if (btnName === 'LOC') {
        // Toggle dry pump (Page 4 & 5)
        soundEffects.playButtonConfirm();
        updateState((prev) => ({
          isDryPumping: !prev.isDryPumping,
          isFiltering: !prev.isDryPumping,
        }));
        clearHoldTimers();
      } else if (btnName === 'OK') {
        // If holding OK 5s: pressure release & air bleed for filter column (bật đồng thời LỌC + XẢ)
        soundEffects.playButtonConfirm();
        updateState({
          isPressureReleasing: true,
          isFiltering: true, // Bật đồng thời LỌC để xả hơi cho trụ lọc
          isFlushing: true,  // Bật đồng thời XẢ
          activeError: 'XAP',
        });
        setTimeout(() => {
          updateState((prev) => ({
            isPressureReleasing: false,
            isFiltering: false,
            isFlushing: false,
            activeError: prev.activeError === 'XAP' ? null : prev.activeError,
          }));
        }, 6000); // 30s auto shutoff in reality, 6s in simulator
        // Check for 10s factory reset
        holdTimerRef.current = setTimeout(() => {
          triggerFactoryReset();
          clearHoldTimers();
        }, 5000);
      } else if (['TEP', 'CA', 'CAY', 'CUSTOM'].includes(btnName)) {
        // 5s hold enters threshold config for that mode (Page 6)
        soundEffects.playButtonConfirm();
        const mode = btnName as BreedingMode;
        const currentCfg = state.modeSettings[mode];
        setMenuState({
          type: 'THRESHOLD_EDIT',
          step: 0, // 0 = Lo, 1 = Hi, 2 = P min, 3 = G sec
          targetMode: mode,
          tempLo: currentCfg.lo,
          tempHi: currentCfg.hi,
          tempMin: currentCfg.flushMinutes,
          tempSec: currentCfg.flushSeconds,
        });
        resetMenuAutoExit();
        clearHoldTimers();
      } else if (btnName === 'SETTING') {
        // 5s hold enters LOC menu (Page 7)
        soundEffects.playButtonConfirm();
        setMenuState({
          type: 'LOC_MENU',
          step: 0, // 0 = pick 100-104, 1 = pick day pattern, 2 = min per hr
          filterType: state.filterSchedule.type,
          dayPattern: state.filterSchedule.dayPattern,
          minPerHour: state.filterSchedule.minutesPerHour,
        });
        resetMenuAutoExit();

        // If held an additional 5s, switch to XA menu (Page 7.3)
        holdTimerRef.current = setTimeout(() => {
          soundEffects.playButtonConfirm();
          setMenuState({
            type: 'XA_MENU',
            step: 0,
          });
          resetMenuAutoExit();
          clearHoldTimers();
        }, 5000);
      }
    }, 4500);
  };

  const handleTouchUp = (btnName: string) => {
    const elapsed = Date.now() - touchStartTimeRef.current;
    clearHoldTimers();

    // If in menu state, OK button handles advancing
    if (menuState.type !== 'NONE') {
      if (btnName === 'OK') {
        handleOkMenuStep();
      }
      return;
    }

    // In normal state:
    if (btnName === 'OK') {
      // Touch OK acknowledges/clears warnings (Page 4: "Xác nhận, xóa cảnh báo")
      if (state.activeError) {
        soundEffects.playButtonConfirm();
        updateState({ activeError: null });
      }
      if (state.isPressureReleasing) {
        updateState({
          isPressureReleasing: false,
          isFiltering: false,
          isFlushing: false,
          activeError: state.activeError === 'XAP' ? null : state.activeError,
        });
      }
      return;
    }

    // Require ~1s hold for main action buttons (Page 4)
    if (elapsed < 900) {
      // Released too early! Dropped command
      return;
    }

    // Executed after 1s hold
    if (btnName === 'LOC') {
      updateState((prev) => ({ isFiltering: !prev.isFiltering }));
    } else if (btnName === 'XA') {
      updateState((prev) => ({ isFlushing: !prev.isFlushing }));
    } else if (['TEP', 'CA', 'CAY', 'CUSTOM'].includes(btnName)) {
      const mode = btnName as BreedingMode;
      updateState((prev) => ({
        activeMode: prev.activeMode === mode ? 'OFF' : mode,
      }));
    }
  };

  // Up & Down button logic
  const handleUpClick = () => {
    resetMenuAutoExit();
    if (menuState.type === 'THRESHOLD_EDIT') {
      if (menuState.step === 0) {
        setMenuState((p) => ({ ...p, tempLo: Math.min(500, (p.tempLo || 120) + 5) }));
      } else if (menuState.step === 1) {
        setMenuState((p) => ({ ...p, tempHi: Math.min(800, (p.tempHi || 170) + 5) }));
      } else if (menuState.step === 2) {
        setMenuState((p) => ({ ...p, tempMin: Math.min(30, (p.tempMin || 0) + 1) }));
      } else if (menuState.step === 3) {
        setMenuState((p) => ({ ...p, tempSec: (p.tempSec || 0) >= 55 ? 0 : (p.tempSec || 0) + 5 }));
      }
    } else if (menuState.type === 'LOC_MENU') {
      if (menuState.step === 0) {
        const types: Array<'100' | '101' | '102' | '103' | '104'> = ['100', '101', '102', '103', '104'];
        const idx = types.indexOf(menuState.filterType || '103');
        const next = types[(idx + 1) % types.length];
        setMenuState((p) => ({ ...p, filterType: next }));
      } else if (menuState.step === 1) {
        const pats: Array<'C07' | 'C24' | 'C13' | 'C03' | 'Ctu'> = ['C07', 'C24', 'C13', 'C03', 'Ctu'];
        const idx = pats.indexOf(menuState.dayPattern || 'C07');
        const next = pats[(idx + 1) % pats.length];
        setMenuState((p) => ({ ...p, dayPattern: next }));
      } else if (menuState.step === 2) {
        setMenuState((p) => ({ ...p, minPerHour: Math.min(60, (p.minPerHour || 30) + 5) }));
      }
    }
  };

  const handleDownClick = () => {
    resetMenuAutoExit();
    if (menuState.type === 'THRESHOLD_EDIT') {
      if (menuState.step === 0) {
        setMenuState((p) => ({ ...p, tempLo: Math.max(50, (p.tempLo || 120) - 5) }));
      } else if (menuState.step === 1) {
        setMenuState((p) => ({ ...p, tempHi: Math.max(60, (p.tempHi || 170) - 5) }));
      } else if (menuState.step === 2) {
        setMenuState((p) => ({ ...p, tempMin: Math.max(0, (p.tempMin || 0) - 1) }));
      } else if (menuState.step === 3) {
        setMenuState((p) => ({ ...p, tempSec: (p.tempSec || 0) <= 0 ? 55 : (p.tempSec || 0) - 5 }));
      }
    } else if (menuState.type === 'LOC_MENU') {
      if (menuState.step === 0) {
        const types: Array<'100' | '101' | '102' | '103' | '104'> = ['100', '101', '102', '103', '104'];
        const idx = types.indexOf(menuState.filterType || '103');
        const prev = types[(idx - 1 + types.length) % types.length];
        setMenuState((p) => ({ ...p, filterType: prev }));
      } else if (menuState.step === 1) {
        const pats: Array<'C07' | 'C24' | 'C13' | 'C03' | 'Ctu'> = ['C07', 'C24', 'C13', 'C03', 'Ctu'];
        const idx = pats.indexOf(menuState.dayPattern || 'C07');
        const prev = pats[(idx - 1 + pats.length) % pats.length];
        setMenuState((p) => ({ ...p, dayPattern: prev }));
      } else if (menuState.step === 2) {
        setMenuState((p) => ({ ...p, minPerHour: Math.max(1, (p.minPerHour || 30) - 5) }));
      }
    }
  };

  // Advance steps in menu upon pressing OK
  const handleOkMenuStep = () => {
    soundEffects.playButtonConfirm();
    resetMenuAutoExit();
    if (menuState.type === 'THRESHOLD_EDIT') {
      if (menuState.step < 3) {
        setMenuState((p) => ({ ...p, step: p.step + 1 }));
      } else {
        // Save and return to normal
        if (menuState.targetMode) {
          const mode = menuState.targetMode;
          updateState((prev) => ({
            modeSettings: {
              ...prev.modeSettings,
              [mode]: {
                lo: menuState.tempLo || 120,
                hi: menuState.tempHi || 170,
                flushMinutes: menuState.tempMin || 1,
                flushSeconds: menuState.tempSec || 0,
              },
            },
          }));
        }
        setMenuState({ type: 'NONE', step: 0 });
      }
    } else if (menuState.type === 'LOC_MENU') {
      if (menuState.step < 2) {
        setMenuState((p) => ({ ...p, step: p.step + 1 }));
      } else {
        // Save LOC settings
        updateState((prev) => ({
          filterSchedule: {
            ...prev.filterSchedule,
            type: menuState.filterType || '103',
            dayPattern: menuState.dayPattern || 'C07',
            minutesPerHour: menuState.minPerHour || 30,
          },
        }));
        setMenuState({ type: 'NONE', step: 0 });
      }
    } else if (menuState.type === 'XA_MENU') {
      setMenuState({ type: 'NONE', step: 0 });
    }
  };

  // Determine 3-character 7-segment display text (Pure White Digital LED)
  const getDisplayText = (): { text: string; glowColor: string } => {
    if (startupStage === '888') {
      return { text: '888', glowColor: 'digital-glow-white text-white' };
    }
    if (startupStage === 'Prt') {
      return { text: 'Prt', glowColor: 'digital-glow-white text-white' };
    }
    if (touchProgress) {
      return { text: touchProgress, glowColor: 'digital-glow-white text-white' };
    }
    if (state.isPressureReleasing || state.activeError === 'XAP') {
      return { text: 'XAP', glowColor: 'digital-glow-white text-white' };
    }

    // In error condition: white 7-segment alternating "Err" and error code (1s cycle)
    if (state.activeError) {
      const err = state.activeError;
      if (['222', '666', '111', '555', 'FLt', 'ERR2_ONLY', '---'].includes(err)) {
        const codeText = err === 'ERR2_ONLY' ? 'Er2' : err;
        return errorPhase === 'ERR'
          ? { text: 'Err', glowColor: 'digital-glow-white text-white animate-pulse' }
          : { text: codeText, glowColor: 'digital-glow-white text-white animate-pulse' };
      }
      if (err === 'rES') {
        return { text: 'rES', glowColor: 'digital-glow-white text-white animate-pulse' };
      }
      if (err === 'XAP') {
        return { text: 'XAP', glowColor: 'digital-glow-white text-white' };
      }
    }

    // Menu States
    if (menuState.type === 'THRESHOLD_EDIT') {
      if (menuState.step === 0) return { text: `${menuState.tempLo}`, glowColor: 'digital-glow-white text-white' };
      if (menuState.step === 1) return { text: `${menuState.tempHi}`, glowColor: 'digital-glow-white text-white' };
      if (menuState.step === 2) {
        const pStr = `P${String(menuState.tempMin || 0).padStart(2, '0')}`;
        return { text: pStr, glowColor: 'digital-glow-white text-white' };
      }
      if (menuState.step === 3) {
        const gStr = `G${String(menuState.tempSec || 0).padStart(2, '0')}`;
        return { text: gStr, glowColor: 'digital-glow-white text-white' };
      }
    }

    if (menuState.type === 'LOC_MENU') {
      if (menuState.step === 0) return { text: menuState.filterType || '103', glowColor: 'digital-glow-white text-white' };
      if (menuState.step === 1) return { text: menuState.dayPattern || 'C07', glowColor: 'digital-glow-white text-white' };
      if (menuState.step === 2) return { text: `${menuState.minPerHour}`, glowColor: 'digital-glow-white text-white' };
    }

    if (menuState.type === 'XA_MENU') {
      return { text: 'XA', glowColor: 'digital-glow-white text-white' };
    }

    // Screen sleep condition
    if (state.isSleeping && !state.screenSleepEnabled) {
      return { text: '   ', glowColor: 'text-transparent' };
    }

    // Normal display: if no optional temperature sensor, show TDS only. If present, alternate TDS (4s) and Temp (2s).
    if (!state.hasTempSensor || displayCycle === 'TDS') {
      return {
        text: String(state.currentTDS).padStart(3, ' '),
        glowColor: 'digital-glow-white text-white',
      };
    } else {
      return {
        text: `${Math.round(state.currentTemp)}C`,
        glowColor: 'digital-glow-white text-white',
      };
    }
  };

  const display = getDisplayText();

  // Logo animation styling (Page 3 & 8)
  const isLogoRainbow = state.isFiltering || state.isFlushing || state.isPressureReleasing;
  const isLogoMenuFlashing = menuState.type !== 'NONE';

  // Electrical Current calculation for Pump & Drain Valve monitoring (Mạch cảm biến dòng điện Bơm & Van Xả)
  const calculatedPumpCurrentMA = state.activeError === '111'
    ? 0
    : state.activeError === '222'
    ? (state.pumpType === 'SMALL' ? 760 : 1600)
    : state.activeError === 'FLt'
    ? (state.pumpType === 'SMALL' ? 640 : 1280)
    : state.isFiltering || state.isFlushing || state.isDryPumping
    ? (state.pumpType === 'SMALL' ? 180 : 380)
    : 0;

  const calculatedDrainCurrentMA = state.activeError === '555'
    ? 0
    : state.activeError === '666'
    ? 920 // Van xả quá dòng kẹt
    : state.isFlushing || state.isPressureReleasing || state.activeError === 'XAP'
    ? 420 // Dòng điện van xả điện từ khi mở van
    : 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* Physical Hardware Faceplate Simulation (Col 7) */}
      <div className="xl:col-span-7 flex flex-col items-center">
        {/* Machine Frame */}
        <div className="relative w-full max-w-[560px] bg-gradient-to-b from-slate-900 via-zinc-900 to-black p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-2xl shadow-cyan-950/20 select-none">
          {/* Screw accents on hardware corners */}
          <div className="absolute top-3 left-3 w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
            <div className="w-1.5 h-0.5 bg-slate-900 rotate-45" />
          </div>
          <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
            <div className="w-1.5 h-0.5 bg-slate-900 -rotate-45" />
          </div>
          <div className="absolute bottom-3 left-3 w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
            <div className="w-1.5 h-0.5 bg-slate-900 -rotate-12" />
          </div>
          <div className="absolute bottom-3 right-3 w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
            <div className="w-1.5 h-0.5 bg-slate-900 rotate-90" />
          </div>

          {/* Machine Header: Brand Wordmark (Monochrome White LED Backlight) */}
          <div className="flex flex-col items-center mb-6">
            <div
              className={`font-display text-xl sm:text-2xl font-bold tracking-widest transition-all duration-300 ${
                state.nightMode
                  ? 'text-zinc-800'
                  : isLogoMenuFlashing
                  ? 'animate-pulse text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]'
                  : isLogoRainbow
                  ? 'animate-white-breathe text-white'
                  : 'text-zinc-300 drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]'
              }`}
            >
              CITO UF SYSTEM
            </div>
            <div className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase mt-0.5">
              White LED Controller · Action-Based Status
            </div>
          </div>

          {/* ROW 1: LỌC, XẢ, ERR1, ERR2 (Monochrome White LEDs) */}
          <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-5 items-center">
            {/* Nút LỌC */}
            <div className="flex flex-col items-center">
              <div
                className={`w-2.5 h-2.5 rounded-full mb-1.5 transition-all duration-200 ${
                  state.nightMode
                    ? 'bg-zinc-800'
                    : state.activeError === 'FLt'
                    ? 'bg-white animate-pulse shadow-[0_0_10px_#ffffff]'
                    : state.isFiltering
                    ? 'bg-white shadow-[0_0_8px_#ffffff]'
                    : 'bg-zinc-800 border border-zinc-700'
                }`}
              />
              <button
                type="button"
                onMouseDown={() => handleTouchDown('LOC')}
                onMouseUp={() => handleTouchUp('LOC')}
                onTouchStart={() => handleTouchDown('LOC')}
                onTouchEnd={() => handleTouchUp('LOC')}
                className={`w-full py-3 px-2 rounded-xl border text-xs sm:text-sm font-semibold tracking-wider transition-all duration-150 active:scale-95 ${
                  activeTouchButton === 'LOC'
                    ? 'bg-white/20 border-white text-white'
                    : state.isFiltering
                    ? 'bg-zinc-800/90 border-white/50 text-white'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-600'
                }`}
              >
                LỌC
              </button>
            </div>

            {/* Nút XẢ */}
            <div className="flex flex-col items-center">
              <div
                className={`w-2.5 h-2.5 rounded-full mb-1.5 transition-all duration-200 ${
                  state.nightMode
                    ? 'bg-zinc-800'
                    : state.isFlushing
                    ? 'bg-white shadow-[0_0_8px_#ffffff]'
                    : 'bg-zinc-800 border border-zinc-700'
                }`}
              />
              <button
                type="button"
                onMouseDown={() => handleTouchDown('XA')}
                onMouseUp={() => handleTouchUp('XA')}
                onTouchStart={() => handleTouchDown('XA')}
                onTouchEnd={() => handleTouchUp('XA')}
                className={`w-full py-3 px-2 rounded-xl border text-xs sm:text-sm font-semibold tracking-wider transition-all duration-150 active:scale-95 ${
                  activeTouchButton === 'XA'
                    ? 'bg-white/20 border-white text-white'
                    : state.isFlushing
                    ? 'bg-zinc-800/90 border-white/50 text-white'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-600'
                }`}
              >
                XẢ
              </button>
            </div>

            {/* Đèn ERR1 (Chỉ là đèn, màu trắng nhấp nháy khi lỗi) */}
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-950/70 border border-zinc-800">
              <div
                className={`w-3.5 h-3.5 rounded-full mb-1 transition-all duration-200 ${
                  state.nightMode
                    ? 'bg-zinc-800'
                    : state.activeError && ['222', '666', '111', '555'].includes(state.activeError)
                    ? 'bg-white animate-pulse shadow-[0_0_10px_#ffffff]'
                    : 'bg-zinc-800 border border-zinc-700/80'
                }`}
              />
              <span className="text-[10px] font-mono font-semibold tracking-wider text-zinc-300">ERR1</span>
              <span className="text-[9px] text-zinc-400">bơm/van/xả</span>
            </div>

            {/* Đèn ERR2 (Chỉ là đèn, màu trắng nhấp nháy khi lỗi) */}
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-950/70 border border-zinc-800">
              <div
                className={`w-3.5 h-3.5 rounded-full mb-1 transition-all duration-200 ${
                  state.nightMode
                    ? 'bg-zinc-800'
                    : state.activeError && ['FLt', 'ERR2_ONLY', '---'].includes(state.activeError)
                    ? 'bg-white animate-pulse shadow-[0_0_10px_#ffffff]'
                    : 'bg-zinc-800 border border-zinc-700/80'
                }`}
              />
              <span className="text-[10px] font-mono font-semibold tracking-wider text-zinc-300">ERR2</span>
              <span className="text-[9px] text-zinc-400">lõi/cảm biến/giờ</span>
            </div>
          </div>

          {/* CENTER: 3-Digit Digital 7-Segment Screen (White LED) */}
          <div className="my-6 px-4">
            <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[320px] h-28 sm:h-32 bg-black rounded-2xl border-2 border-zinc-700/80 shadow-inner flex flex-col items-center justify-center overflow-hidden">
              {/* Subtle glass reflection & scanlines */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:8px_8px] opacity-20 pointer-events-none" />

              {/* Mode indicator micro text on screen */}
              <div className="absolute top-2 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>{displayCycle === 'TDS' ? 'TDS (ppm)' : 'TEMP (°C)'}</span>
                <span>
                  {state.isPressureReleasing || state.activeError === 'XAP'
                    ? 'XAP (LỌC + XẢ)'
                    : state.isFiltering && state.isFlushing
                    ? 'LỌC + XẢ'
                    : state.isFiltering
                    ? 'FILTER'
                    : state.isFlushing
                    ? 'FLUSH'
                    : 'STANDBY'}
                </span>
              </div>

              {/* 3-Digit 7-Segment Number */}
              <div className={`font-digital text-5xl sm:text-6xl font-bold tracking-widest ${display.glowColor}`}>
                {display.text}
              </div>

              {/* Prompt helper when holding */}
              {touchProgress && (
                <div className="absolute bottom-1.5 text-[10px] font-mono text-zinc-300">
                  {touchProgress === '---' ? 'Đã nhận lệnh (Thả tay ra)' : 'Đang giữ nút...'}
                </div>
              )}
            </div>
          </div>

          {/* ROW 2: TÉP, CÁ, CÂY, CUSTOM (Monochrome White LEDs) */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-5">
            {(['TEP', 'CA', 'CAY', 'CUSTOM'] as BreedingMode[]).map((mode) => {
              const label = mode === 'TEP' ? 'TÉP' : mode === 'CA' ? 'CÁ' : mode === 'CAY' ? 'CÂY' : 'CUSTOM';
              const isActive = state.activeMode === mode;
              const isTouching = activeTouchButton === mode;
              return (
                <div key={mode} className="flex flex-col items-center">
                  <div
                    className={`w-2 h-2 rounded-full mb-1.5 transition-all duration-200 ${
                      state.nightMode
                        ? 'bg-zinc-800'
                        : isActive
                        ? 'bg-white shadow-[0_0_8px_#ffffff]'
                        : 'bg-zinc-800 border border-zinc-700'
                    }`}
                  />
                  <button
                    type="button"
                    onMouseDown={() => handleTouchDown(mode)}
                    onMouseUp={() => handleTouchUp(mode)}
                    onTouchStart={() => handleTouchDown(mode)}
                    onTouchEnd={() => handleTouchUp(mode)}
                    className={`w-full py-2.5 px-1 rounded-xl border text-xs sm:text-sm font-semibold tracking-wider transition-all duration-150 active:scale-95 ${
                      isTouching
                        ? 'bg-white/20 border-white text-white'
                        : isActive
                        ? 'bg-zinc-800/90 border-white/50 text-white'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {label}
                  </button>
                </div>
              );
            })}
          </div>

          {/* ROW 3: SETTING, ▲ UP, ▼ DOWN, OK (Monochrome White Touch LEDs) */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[
              { id: 'SETTING', label: 'SETTING' },
              { id: 'UP', label: '▲ UP' },
              { id: 'DOWN', label: '▼ DOWN' },
              { id: 'OK', label: 'OK' },
            ].map(({ id, label }) => {
              const isTouching = activeTouchButton === id;
              return (
                <div key={id} className="flex flex-col items-center">
                  <div
                    className={`w-2 h-2 rounded-full mb-1.5 transition-all duration-200 ${
                      state.nightMode
                        ? 'bg-zinc-800'
                        : isTouching
                        ? 'bg-white shadow-[0_0_8px_#ffffff]'
                        : 'bg-zinc-800 border border-zinc-700'
                    }`}
                  />
                  <button
                    type="button"
                    onMouseDown={() => handleTouchDown(id)}
                    onMouseUp={() => handleTouchUp(id)}
                    onTouchStart={() => handleTouchDown(id)}
                    onTouchEnd={() => handleTouchUp(id)}
                    className={`w-full py-2.5 px-1 rounded-xl border text-xs sm:text-sm font-semibold tracking-wider transition-all duration-150 active:scale-95 ${
                      isTouching
                        ? 'bg-white text-zinc-950 border-white font-bold'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-500'
                    }`}
                  >
                    {label}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Audio & Power controls at machine base */}
          <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <button
              onClick={handleToggleMute}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-white" />}
              <span>{isMuted ? 'Đã tắt tiếng' : 'Âm thanh bíp'}</span>
            </button>

            <button
              onClick={triggerStartupSequence}
              className="flex items-center gap-1 text-white hover:text-zinc-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khởi động lại (888)</span>
            </button>
          </div>
        </div>

        {/* Action-Based Recognition Note */}
        <div className="w-full max-w-[560px] mt-4 p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-2 text-white font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_6px_#fff]" />
            <span>Quy tắc LED màu trắng & Phân biệt qua Hành động (Action):</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Tất cả đèn LED trên máy là <strong className="text-white">LED màu trắng</strong>. Thiết bị nhận diện và báo hiệu qua trạng thái hành động:
            <br />• <strong className="text-white">Sáng cố định:</strong> Chức năng đang bật (Đang lọc, đang xả, hoặc chế độ nuôi đang chọn).
            <br />• <strong className="text-white">Nhấp nháy:</strong> Cảnh báo sự cố (Lõi lọc bẩn FLt, kẹt bơm 222, kẹt van 666, mất nước 333, mất giờ ERR2).
            <br />• <strong className="text-white">Sáng khi chạm:</strong> Phản hồi xúc giác khi ngón tay chạm vào nút cảm ứng.
          </p>
        </div>

        {/* Operating Touch Guide Tip */}
        <div className="w-full max-w-[560px] mt-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-white">Quy tắc chạm nút (Mục 4):</strong> Giữ nút{' '}
            <span className="font-mono text-cyan-300">LỌC, XẢ, TÉP, CÁ, CÂY, CUSTOM</span> trong 1 giây để màn hình hiện{' '}
            <span className="font-mono text-cyan-300">- → -- → ---</span> kèm tiếng bíp rồi mới thả. Nhấp tức thì{' '}
            <span className="font-mono text-white">UP, DOWN, OK</span>.
          </p>
        </div>
      </div>

      {/* Interactive Water Circuit & Test Bench (Col 5) */}
      <div className="xl:col-span-5 flex flex-col gap-6">
        {/* Real-time Aquarium Telemetry & Simulation Controls */}
        <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Droplets className="w-5 h-5 text-cyan-400" />
              Mô phỏng nước hồ thủy sinh
            </h3>
            <span className="text-xs font-mono text-cyan-400">Real-time Water Lab</span>
          </div>

          <div className="space-y-4">
            {/* TDS Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Chỉ số TDS trong bể (ppm)</span>
                <span className="font-mono font-bold text-cyan-300 text-sm">{state.currentTDS} ppm</span>
              </div>
              <input
                type="range"
                min="60"
                max="450"
                step="5"
                value={state.currentTDS}
                onChange={(e) => updateState({ currentTDS: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                <span>60 (RO tinh khiết)</span>
                {state.activeMode !== 'OFF' && (
                  <span className="text-amber-400 font-semibold">
                    Ngưỡng tự xả Hi: {state.modeSettings[state.activeMode].hi} ppm
                  </span>
                )}
                <span>450 (Quá tải cặn)</span>
              </div>
            </div>

            {/* Temperature Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Nhiệt độ nước (°C)</span>
                <span className="font-mono font-bold text-amber-300 text-sm">{state.currentTemp.toFixed(1)} °C</span>
              </div>
              <input
                type="range"
                min="18"
                max="34"
                step="0.5"
                value={state.currentTemp}
                onChange={(e) => updateState({ currentTemp: Number(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                <span>18°C (Lạnh)</span>
                <span>25-26°C (Lý tưởng)</span>
                <span>34°C (Nóng)</span>
              </div>
            </div>

            {/* Hydraulic & Electrical Components Status (Bơm & Van Xả đều có giám sát dòng điện mA) */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">Máy bơm</span>
                <span
                  className={`text-xs font-semibold ${
                    state.isFiltering || state.isFlushing || state.isDryPumping
                      ? 'text-emerald-400 font-mono'
                      : 'text-slate-400'
                  }`}
                >
                  {state.isFiltering || state.isFlushing || state.isDryPumping ? 'ĐANG CHẠY' : 'DỪNG'}
                </span>
                <span className="text-[10px] font-mono text-cyan-400 block mt-0.5 font-semibold">
                  {calculatedPumpCurrentMA} mA
                </span>
              </div>

              <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">Van Lọc UF</span>
                <span className={`text-xs font-semibold ${state.isFiltering ? 'text-cyan-400 font-mono' : 'text-slate-400'}`}>
                  {state.isFiltering ? 'MỞ THÔNG' : 'ĐÓNG'}
                </span>
                <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                  Cơ học
                </span>
              </div>

              <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">Van Xả Thải</span>
                <span
                  className={`text-xs font-semibold ${
                    state.isFlushing || state.isPressureReleasing || state.activeError === 'XAP'
                      ? 'text-amber-400 font-mono'
                      : 'text-slate-400'
                  }`}
                >
                  {state.isFlushing || state.isPressureReleasing || state.activeError === 'XAP' ? 'MỞ XẢ' : 'ĐÓNG'}
                </span>
                <span className="text-[10px] font-mono text-amber-300 block mt-0.5 font-semibold">
                  {calculatedDrainCurrentMA} mA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fault & Scenario Injector */}
        <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              Tạo tình huống kiểm tra lỗi (Mục 10)
            </h3>
            {state.activeError && (
              <span className="text-xs font-mono text-rose-400 font-semibold animate-pulse">LỖI: {state.activeError}</span>
            )}
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Các nút lỗi hoạt động ở dạng <strong className="text-cyan-300 font-semibold">TOGGLE (Bật / Tắt trực tiếp)</strong>: Bấm để kích hoạt lỗi, bấm lại lần nữa để tắt lỗi và đưa máy về hoạt động đo bình thường:
          </p>

          <div className="space-y-4 text-xs">
            {/* Nhóm 1: Sự cố Bơm & Van (Err xen kẽ mã lỗi) */}
            <div>
              <div className="text-[11px] font-mono text-rose-400 uppercase font-semibold mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span>1. Lỗi Bơm & Van (Màn hình nhấp nháy Err ↔ Mã số · Đèn ERR1 nhấp nháy)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() =>
                    handleToggleError('222', () => {
                      soundEffects.playErrorAlarm();
                      updateState({ activeError: '222', isFiltering: false, isFlushing: false });
                    })
                  }
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    state.activeError === '222'
                      ? 'bg-rose-950/90 border-rose-400 text-white shadow-lg shadow-rose-950/60 ring-2 ring-rose-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-rose-500/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-rose-400 font-bold block text-sm">Err ↔ 222</span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        state.activeError === '222' ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {state.activeError === '222' ? 'BẬT · Tắt' : 'Tắt'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">Bơm quá dòng (kẹt rác)</span>
                </button>

                <button
                  onClick={() =>
                    handleToggleError('666', () => {
                      soundEffects.playErrorAlarm();
                      updateState({ activeError: '666', isFiltering: false, isFlushing: false });
                    })
                  }
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    state.activeError === '666'
                      ? 'bg-rose-950/90 border-rose-400 text-white shadow-lg shadow-rose-950/60 ring-2 ring-rose-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-rose-500/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-rose-400 font-bold block text-sm">Err ↔ 666</span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        state.activeError === '666' ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {state.activeError === '666' ? 'BẬT · Tắt' : 'Tắt'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">Van xả quá dòng (kẹt cơ)</span>
                </button>

                <button
                  onClick={() =>
                    handleToggleError('111', () => {
                      soundEffects.playErrorAlarm();
                      updateState({ activeError: '111', isFiltering: false });
                    })
                  }
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    state.activeError === '111'
                      ? 'bg-amber-950/90 border-amber-400 text-white shadow-lg shadow-amber-950/60 ring-2 ring-amber-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-amber-500/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-amber-300 font-bold block text-sm">Err ↔ 111</span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        state.activeError === '111' ? 'bg-amber-400 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {state.activeError === '111' ? 'BẬT · Tắt' : 'Tắt'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">Bơm chạy không dòng (0mA)</span>
                </button>

                <button
                  onClick={() =>
                    handleToggleError('555', () => {
                      soundEffects.playErrorAlarm();
                      updateState({ activeError: '555', isFlushing: false });
                    })
                  }
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    state.activeError === '555'
                      ? 'bg-amber-950/90 border-amber-400 text-white shadow-lg shadow-amber-950/60 ring-2 ring-amber-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-amber-500/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-amber-300 font-bold block text-sm">Err ↔ 555</span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        state.activeError === '555' ? 'bg-amber-400 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {state.activeError === '555' ? 'BẬT · Tắt' : 'Tắt'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">Van xả mở không dòng (0mA)</span>
                </button>
              </div>
            </div>

            {/* Nhóm 2: Màng Lọc UF & Cảm Biến (Màn hình nhấp nháy Err ↔ Mã · Đèn ERR2 / LỌC nhấp nháy) */}
            <div>
              <div className="text-[11px] font-mono text-cyan-400 uppercase font-semibold mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>2. Màng Lọc UF & Cảm Biến (Màn hình nhấp nháy Err ↔ Mã · Đèn ERR2 nhấp nháy)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() =>
                    handleToggleError('FLt', () => {
                      soundEffects.playErrorAlarm();
                      updateState({ activeError: 'FLt', isFiltering: true });
                    })
                  }
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    state.activeError === 'FLt'
                      ? 'bg-amber-950/90 border-amber-400 text-white shadow-lg shadow-amber-950/60 ring-2 ring-amber-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-amber-500/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-amber-300 font-bold block text-sm">Err ↔ FLt</span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        state.activeError === 'FLt' ? 'bg-amber-400 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {state.activeError === 'FLt' ? 'BẬT · Tắt' : 'Tắt'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">Lõi lọc UF bẩn (vẫn lọc)</span>
                </button>

                <button
                  onClick={() =>
                    handleToggleError('ERR2_ONLY', () => {
                      soundEffects.playErrorAlarm();
                      updateState({ activeError: 'ERR2_ONLY' });
                    })
                  }
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    state.activeError === 'ERR2_ONLY'
                      ? 'bg-cyan-950/90 border-cyan-400 text-white shadow-lg shadow-cyan-950/60 ring-2 ring-cyan-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-cyan-400/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-cyan-300 font-bold block text-sm">Err ↔ Er2</span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        state.activeError === 'ERR2_ONLY' ? 'bg-cyan-400 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {state.activeError === 'ERR2_ONLY' ? 'BẬT · Tắt' : 'Tắt'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">Mất giờ RTC / cảm biến</span>
                </button>

                <button
                  onClick={() =>
                    handleToggleError('---', () => {
                      soundEffects.playErrorAlarm();
                      updateState({ activeError: '---' });
                    })
                  }
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    state.activeError === '---'
                      ? 'bg-cyan-950/90 border-cyan-400 text-white shadow-lg shadow-cyan-950/60 ring-2 ring-cyan-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-cyan-400/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-cyan-300 font-bold block text-sm">Err ↔ ---</span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        state.activeError === '---' ? 'bg-cyan-400 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {state.activeError === '---' ? 'BẬT · Tắt' : 'Tắt'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">Mất tín hiệu TDS (chưa cắm que)</span>
                </button>
              </div>
            </div>

            {/* Trạng thái Cảm biến Nhiệt độ (Optional: Không có cảm biến thì chỉ hiện TDS, hoàn toàn không báo lỗi) */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${state.hasTempSensor ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                    <span>Cảm biến nhiệt độ (Tùy chọn - Optional)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {state.hasTempSensor
                      ? 'Đang bật có cảm biến: Màn hình luân phiên hiện TDS (4s) và Nhiệt độ (2s).'
                      : 'Không lắp cảm biến: Màn hình chỉ hiển thị số TDS và không hiển thị nhiệt độ (hoàn toàn không báo lỗi).'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    soundEffects.playButtonConfirm();
                    updateState((prev) => ({ hasTempSensor: !prev.hasTempSensor }));
                  }}
                  className={`shrink-0 py-1.5 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    state.hasTempSensor
                      ? 'bg-emerald-950 border-emerald-500/80 text-emerald-300 hover:bg-emerald-900'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {state.hasTempSensor ? '✓ Đang gắn đầu dò (Có hiện Temp)' : '○ Không gắn đầu dò (Chỉ hiện TDS)'}
                </button>
              </div>
            </div>

            {/* Nhóm 3: Chế Độ Vận Hành Đặc Biệt (XAP & rES) */}
            <div>
              <div className="text-[11px] font-mono text-cyan-400 uppercase font-semibold mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>3. Chế Độ Vận Hành Đặc Biệt (XAP & rES)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    handleToggleError(
                      'XAP',
                      () => {
                        soundEffects.playButtonConfirm();
                        updateState({
                          activeError: 'XAP',
                          isPressureReleasing: true,
                          isFiltering: true, // Bật đồng thời LỌC để xả hơi cho bình lọc
                          isFlushing: true,  // Bật đồng thời XẢ
                        });
                      },
                      () => {
                        updateState({
                          activeError: null,
                          isPressureReleasing: false,
                          isFiltering: false,
                          isFlushing: false,
                        });
                      }
                    )
                  }
                  className={`p-3 rounded-xl border text-left transition-all ${
                    state.isPressureReleasing || state.activeError === 'XAP'
                      ? 'bg-cyan-950 border-cyan-400 text-white shadow-lg shadow-cyan-950/50 ring-2 ring-cyan-400'
                      : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-cyan-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-300 font-bold block text-sm">XAP</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                        BẬT CẢ XẢ & LỌC
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        state.activeError === 'XAP' || state.isPressureReleasing
                          ? 'bg-cyan-400 text-slate-950 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {state.activeError === 'XAP' || state.isPressureReleasing ? 'BẬT · Bấm để Tắt' : 'Tắt'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-200 font-medium block">Xả áp lực khí trong bình lọc</span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Bật cả 2 van LỌC và XẢ để xả sạch áp lực khí và bọt hơi đọng trong bình lọc an toàn
                  </span>
                </button>

                <button
                  onClick={() => {
                    triggerFactoryReset();
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    state.activeError === 'rES'
                      ? 'bg-amber-950 border-amber-400 text-white shadow-lg shadow-amber-950/50 ring-2 ring-amber-400'
                      : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-amber-300 font-bold block text-sm">rES</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                        CHẠY 3.5S RỒI TỰ VỀ CHUẨN
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        state.activeError === 'rES'
                          ? 'bg-amber-400 text-slate-950 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {state.activeError === 'rES' ? 'ĐANG CHẠY...' : 'Kích hoạt'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-200 font-medium block">Khôi phục cài đặt gốc (Reset Factory)</span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Kêu 5 tiếng bíp, hiển thị rES trong 3.5 giây rồi máy tự động trở về hoạt động đo bình thường
                  </span>
                </button>
              </div>
            </div>
          </div>

          {state.activeError && onOpenTroubleshooting && (
            <button
              onClick={() => onOpenTroubleshooting(state.activeError || '')}
              className="mt-3 w-full py-2 px-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs font-semibold hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Xem hướng dẫn chi tiết xử lý: {state.activeError} (Mục 10)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

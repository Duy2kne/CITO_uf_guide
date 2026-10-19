import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ManualReader } from './components/ManualReader';
import { FeatureSimulator } from './components/FeatureSimulator';
import { SimulatorState } from './types/manual';
import { MODE_DEFAULTS } from './data/manualData';
import { BookOpen, Cpu, ShieldCheck } from 'lucide-react';

export default function App() {
  // Exactly 2 main pages as requested: 'manual' (Sổ Tay Hướng Dẫn) and 'simulator' (Giả Lập Tính Năng)
  const [activePage, setActivePage] = useState<'manual' | 'simulator'>('manual');
  const [preselectedErrorCode, setPreselectedErrorCode] = useState<string | null>(null);
  const [targetSectionNumber, setTargetSectionNumber] = useState<number>(1);

  // Global simulator state shared across the machine panel and web control
  const [simulatorState, setSimulatorState] = useState<SimulatorState>({
    isPowered: true,
    isSleeping: false,
    nightMode: false,
    screenSleepEnabled: true,
    currentTDS: 156,
    currentTemp: 26.2,
    hasTempSensor: false, // Optional: default not fitted -> does not display temp and NO error
    lastMeasureTimestamp: Date.now(),
    isFiltering: false,
    isFlushing: false,
    isPressureReleasing: false,
    isDryPumping: false,
    pumpType: 'SMALL',
    activeMode: 'OFF',
    modeSettings: {
      OFF: { lo: 120, hi: 250, flushMinutes: 1, flushSeconds: 0 },
      ...MODE_DEFAULTS,
    },
    holdDurationSeconds: 1,
    activeError: null,
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
    sensorMode: 'HOURLY',
    autoRunFilterToMeasure: true,
    logoEffect: 1,
    logoSpeed: 3,
    homeWifiSSID: 'Aquarium_WiFi_Home',
    homeWifiConnected: true,
    deviceIp: 'http://192.168.1.55',
    rtcTime: '14:25:30',
  });

  const updateSimulatorState = (
    partial: Partial<SimulatorState> | ((prev: SimulatorState) => Partial<SimulatorState>)
  ) => {
    setSimulatorState((prev) => {
      if (typeof partial === 'function') {
        return { ...prev, ...partial(prev) };
      }
      return { ...prev, ...partial };
    });
  };

  const handleSwitchToSimulator = (scenario?: { section?: number; errorCode?: string }) => {
    if (scenario?.errorCode) {
      setPreselectedErrorCode(scenario.errorCode);
      updateSimulatorState({ activeError: scenario.errorCode });
    }
    setActivePage('simulator');
  };

  const handleGoToManualSection = (sectionNumber: number) => {
    setTargetSectionNumber(sectionNumber);
    setActivePage('manual');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Strict 2-Page Header Navbar */}
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Focused Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 border border-slate-800 p-6 sm:p-8 shadow-xl">
          <div className="relative z-10 max-w-3xl">
            {/* Metadata clean unboxed text */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-cyan-400 mb-2.5">
              <span>citoufsystem_usermanual</span>
              <span aria-hidden="true">·</span>
              <span>Tài liệu: Hướng dẫn sử dụng máy lọc CITO UF</span>
              <span aria-hidden="true">·</span>
              <span>Tác giả: @Duy</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-2.5">
              {activePage === 'manual'
                ? 'Sổ Tay Hướng Dẫn Sử Dụng Máy Lọc CITO UF'
                : 'Giả Lập Tính Năng & Kiểm Tra Hoạt Động'}
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-5">
              {activePage === 'manual'
                ? 'Đầy đủ 12 mục hướng dẫn vận hành chuẩn theo tài liệu gốc của @Duy: hướng dẫn nút cảm ứng, các chế độ Tép/Cá/Cây, lịch lọc, điều khiển web và bảng mã lỗi.'
                : 'Môi trường mô phỏng tương tác thực tế: thử nghiệm chạm phím cảm ứng 1 giây, đèn LED, màn hình 7 thanh, âm thanh bíp, tự xả theo TDS và giao diện web 192.168.4.1.'}
            </p>

            {/* Quick 2-Page Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActivePage('manual')}
                className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  activePage === 'manual'
                    ? 'bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-400/20'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>1. Sổ Tay Hướng Dẫn (12 Mục)</span>
              </button>

              <button
                onClick={() => setActivePage('simulator')}
                className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  activePage === 'simulator'
                    ? 'bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-400/20'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>2. Giả Lập Tính Năng</span>
              </button>
            </div>
          </div>

          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Page 1: Sổ Tay Hướng Dẫn */}
        {activePage === 'manual' && (
          <ManualReader
            onSwitchToSimulator={handleSwitchToSimulator}
            initialSectionNumber={targetSectionNumber}
          />
        )}

        {/* Page 2: Giả Lập Tính Năng */}
        {activePage === 'simulator' && (
          <FeatureSimulator
            state={simulatorState}
            updateState={updateSimulatorState}
            onGoToManualSection={handleGoToManualSection}
            preselectedErrorCode={preselectedErrorCode}
          />
        )}
      </main>

      {/* Clean unboxed footer */}
      <footer className="mt-16 border-t border-slate-800/80 bg-slate-950 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300 font-display">CITO UF SYSTEM</span>
            <span aria-hidden="true">·</span>
            <span>Hướng dẫn sử dụng máy lọc CITO UF — Tác giả @Duy</span>
            <span aria-hidden="true">·</span>
            <span>citoufsystem_usermanual</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setActivePage('manual')}
              className={`hover:text-white transition-colors ${activePage === 'manual' ? 'text-cyan-400 font-medium' : ''}`}
            >
              Sổ Tay Hướng Dẫn
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActivePage('simulator')}
              className={`hover:text-white transition-colors ${activePage === 'simulator' ? 'text-cyan-400 font-medium' : ''}`}
            >
              Giả Lập Tính Năng
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

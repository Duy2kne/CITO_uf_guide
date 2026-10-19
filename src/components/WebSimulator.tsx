import React, { useState } from 'react';
import { SimulatorState, BreedingMode, PumpType } from '../types/manual';
import { SCHEDULE_FILTERS, DAY_PATTERNS } from '../data/manualData';
import {
  Wifi,
  Activity,
  Sliders,
  Calendar,
  Gauge,
  Power,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Moon,
  Sun,
  ShieldAlert,
} from 'lucide-react';

interface WebSimulatorProps {
  state: SimulatorState;
  updateState: (partial: Partial<SimulatorState> | ((prev: SimulatorState) => Partial<SimulatorState>)) => void;
}

export const WebSimulator: React.FC<WebSimulatorProps> = ({ state, updateState }) => {
  const [activeTab, setActiveTab] = useState<
    'status' | 'mode' | 'tds' | 'filter' | 'pump' | 'flush' | 'sensor' | 'control' | 'logo' | 'wifi'
  >('status');

  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Synchronize phone clock with machine RTC
  const handleSyncRTC = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(
      now.getSeconds()
    ).padStart(2, '0')}`;
    updateState({ rtcTime: timeStr });
    showToast('Đã đồng bộ giờ thực RTC thành công!');
  };

  // Immediate Measure
  const handleMeasureNow = () => {
    showToast('Đang chạy bơm mồi 20 giây và đo ngay...');
    updateState({ isFiltering: true });
    setTimeout(() => {
      updateState((prev) => ({
        isFiltering: false,
        lastMeasureTimestamp: Date.now(),
      }));
      showToast('Đã cập nhật chỉ số đo mới nhất!');
    }, 2000);
  };

  // Factory reset from Web UI: Chạy rES trong 3.5 giây rồi tự trở về hoạt động bình thường
  const handleReset = () => {
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
    showToast('Máy đang Reset xuất xưởng (rES), tự về bình thường sau 3.5s...');
    setTimeout(() => {
      updateState({ activeError: null });
      showToast('Máy đã khôi phục toàn bộ cài đặt gốc thành công!');
    }, 3500);
  };

  const pumpMA = state.isFiltering || state.isFlushing
    ? state.pumpType === 'SMALL'
      ? 180
      : 380
    : 0;

  const drainValveMA = state.isFlushing || state.isPressureReleasing || state.activeError === 'XAP'
    ? 420
    : 0;

  const currentMA = pumpMA + drainValveMA;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Browser chrome header bar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-mono text-slate-400 ml-2 hidden sm:inline">
            http://192.168.4.1 · http://cito-uf.local
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono">WiFi: CITO UF SYSTEM</span>
          <span className="text-slate-400">·</span>
          <span className="text-cyan-400 font-mono">RTC: {state.rtcTime}</span>
        </div>
      </div>

      {/* Toast Alert */}
      {notification && (
        <div className="bg-cyan-500/10 border-b border-cyan-500/30 px-4 py-2 text-xs text-cyan-300 font-medium flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-cyan-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Web Status Header (Mục 8.2: Trạng thái đầu trang) */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* TDS */}
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800/80">
            <span className="text-xs text-slate-400 block mb-1">Chỉ số TDS</span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-cyan-300 tabular-nums">
                {state.currentTDS}
              </span>
              <span className="text-xs font-mono text-slate-400">ppm</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {state.activeMode !== 'OFF'
                ? `Mục tiêu: Lo ${state.modeSettings[state.activeMode].lo} - Hi ${state.modeSettings[state.activeMode].hi}`
                : 'Đang tắt chế độ nuôi'}
            </span>
          </div>

          {/* Temp (Optional: nếu không gắn thì báo Chưa gắn, không báo lỗi) */}
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">Nhiệt độ nước</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                Tùy chọn
              </span>
            </div>
            {state.hasTempSensor ? (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-2xl sm:text-3xl font-bold text-amber-300 tabular-nums">
                    {state.currentTemp.toFixed(1)}
                  </span>
                  <span className="text-xs font-mono text-slate-400">°C</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">Đầu dò NTC/DS18B20</span>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-lg sm:text-xl font-medium text-slate-500">
                    Chưa gắn
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">Tùy chọn (không báo lỗi)</span>
              </>
            )}
          </div>

          {/* Current State */}
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800/80">
            <span className="text-xs text-slate-400 block mb-1">Trạng thái vận hành</span>
            <div className="font-semibold text-sm sm:text-base mt-1">
              {state.isFiltering ? (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Đang lọc nước
                </span>
              ) : state.isFlushing ? (
                <span className="text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  Đang tự xả thải
                </span>
              ) : state.isPressureReleasing ? (
                <span className="text-cyan-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  Xả áp lực khí bình lọc (XAP)
                </span>
              ) : (
                <span className="text-slate-300">Chờ theo lịch (Standby)</span>
              )}
            </div>
            <span className="text-[11px] font-mono text-slate-400 mt-1 block">
              Dòng: Bơm {pumpMA}mA · Van xả {drainValveMA}mA
            </span>
          </div>

          {/* Active Error / Schedule countdown */}
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800/80">
            <span className="text-xs text-slate-400 block mb-1">Cảnh báo hệ thống</span>
            {state.activeError ? (
              <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-sm mt-1 animate-pulse">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>MÃ LỖI: {state.activeError}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-sm mt-1">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Bình thường</span>
              </div>
            )}
            <span className="text-[11px] text-slate-400 mt-1 block font-mono">
              Lịch {state.filterSchedule.type} · {state.filterSchedule.minutesPerHour}p/h
            </span>
          </div>
        </div>
      </div>

      {/* Navigation tabs inside web controller */}
      <div className="px-4 border-b border-slate-800 overflow-x-auto flex gap-1 scrollbar-none">
        {[
          { id: 'status', label: 'Tổng quan', icon: Activity },
          { id: 'mode', label: 'Chế độ nuôi', icon: Sliders },
          { id: 'tds', label: 'Cài đặt TDS', icon: Gauge },
          { id: 'filter', label: 'Lịch lọc', icon: Calendar },
          { id: 'pump', label: 'Cấu hình bơm', icon: Power },
          { id: 'sensor', label: 'Cảm biến', icon: Sparkles },
          { id: 'control', label: 'Điều khiển', icon: Power },
          { id: 'wifi', label: 'WiFi & RTC', icon: Wifi },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-3 px-3.5 text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5 border-b-2 transition-colors ${
                isActive
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREA */}
      <div className="p-6">
        {/* TAB: TỔNG QUAN */}
        {activeTab === 'status' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div>
                <h4 className="text-sm font-semibold text-white">Thao tác nhanh trên Web (Mục 8)</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Bật/tắt lọc hoặc xả trực tiếp từ điện thoại mà không cần chạm vào mặt máy.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    updateState((prev) => ({ isFiltering: !prev.isFiltering }));
                    showToast(state.isFiltering ? 'Đã tắt bơm lọc' : 'Đã bật bơm lọc ngay');
                  }}
                  className={`py-2 px-4 rounded-xl text-xs font-semibold transition-all ${
                    state.isFiltering
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  }`}
                >
                  {state.isFiltering ? 'Dừng lọc ngay' : 'Bật lọc ngay'}
                </button>

                <button
                  onClick={() => {
                    updateState((prev) => ({ isFlushing: !prev.isFlushing }));
                    showToast(state.isFlushing ? 'Đã dừng xả' : 'Đã kích hoạt xả nước thải');
                  }}
                  className={`py-2 px-4 rounded-xl text-xs font-semibold transition-all ${
                    state.isFlushing
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  }`}
                >
                  {state.isFlushing ? 'Dừng xả ngay' : 'Bật xả ngay'}
                </button>

                <button
                  onClick={handleMeasureNow}
                  className="py-2 px-3 rounded-xl text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Đo ngay
                </button>
              </div>
            </div>

            {/* Current Schedule & Mode Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800">
                <h5 className="text-xs font-semibold text-slate-300 mb-2">Chế độ nuôi đang chọn</h5>
                <div className="text-lg font-bold text-cyan-300 mb-1">
                  {state.activeMode === 'OFF' ? 'TẮT (Chạy theo lịch xả)' : `CHẾ ĐỘ ${state.activeMode}`}
                </div>
                {state.activeMode !== 'OFF' ? (
                  <p className="text-xs text-slate-400">
                    Ngưỡng tham chiếu Lo: <span className="font-mono text-white">{state.modeSettings[state.activeMode].lo} ppm</span> · 
                    Ngưỡng tự xả Hi: <span className="font-mono text-amber-300">{state.modeSettings[state.activeMode].hi} ppm</span> · 
                    Thời gian xả: <span className="font-mono text-white">{state.modeSettings[state.activeMode].flushMinutes}p {state.modeSettings[state.activeMode].flushSeconds}s</span>
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">
                    Khi tắt chế độ nuôi, máy chỉ xả theo lịch định kỳ {state.flushSchedule.everyNDays} ngày 1 lần vào {state.flushSchedule.startHour}h{state.flushSchedule.startMinute}.
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800">
                <h5 className="text-xs font-semibold text-slate-300 mb-2">Lịch lọc nước tự động</h5>
                <div className="text-lg font-bold text-white mb-1 font-mono">
                  LỊCH {state.filterSchedule.type} ({state.filterSchedule.minutesPerHour} phút/giờ)
                </div>
                <p className="text-xs text-slate-400">
                  Chu kỳ ngày: <span className="font-mono text-cyan-300">{state.filterSchedule.dayPattern}</span>
                  {state.filterSchedule.type === '103' && ' (Mặc định: 23h đêm – 5h sáng hôm sau)'}
                  {state.filterSchedule.type === '101' && ' (8h – 12h và 14h – 17h)'}
                  {state.filterSchedule.type === '102' && ' (19h – 5h sáng)'}
                  {state.filterSchedule.type === '104' && ' (Cả ngày 24/24)'}
                  {state.filterSchedule.type === '100' && ' (Thủ công, chỉ chạy khi bấm)'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CHẾ ĐỘ NUÔI */}
        {activeTab === 'mode' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Chọn loài nuôi trong bể để máy tự động giám sát chỉ số TDS và xả nước bẩn khi vượt ngưỡng Hi (Mục 5):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { id: 'OFF', label: 'TẮT', desc: 'Không xả theo TDS, chỉ xả theo lịch' },
                { id: 'TEP', label: 'TÉP', desc: 'Lo 120 / Hi 170 ppm (Cho tép kiểng nhạy cảm)' },
                { id: 'CA', label: 'CÁ', desc: 'Lo 120 / Hi 250 ppm (Cá cảnh phổ thông)' },
                { id: 'CAY', label: 'CÂY', desc: 'Lo 150 / Hi 250 ppm (Hồ thủy sinh trồng cây)' },
                { id: 'CUSTOM', label: 'CUSTOM', desc: 'Lo 150 / Hi 300 ppm (Tùy biến theo ý bạn)' },
              ].map((m) => {
                const isCurrent = state.activeMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      updateState({ activeMode: m.id as BreedingMode });
                      showToast(`Đã chuyển sang chế độ nuôi: ${m.label}`);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isCurrent
                        ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-lg shadow-cyan-950/30'
                        : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm">{m.label}</span>
                      {isCurrent && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400">{m.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: CÀI ĐẶT TDS */}
        {activeTab === 'tds' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Chỉnh ngưỡng Lo, Hi và thời gian xả nước (phút : giây) cho từng chế độ nuôi:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['TEP', 'CA', 'CAY', 'CUSTOM'] as BreedingMode[]).map((modeKey) => {
                const cfg = state.modeSettings[modeKey];
                return (
                  <div key={modeKey} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-cyan-300">Chế độ {modeKey}</span>
                      {state.activeMode === modeKey && (
                        <span className="text-[10px] font-mono py-0.5 px-2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          ĐANG BẬT
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-slate-400 block mb-1">Mục tiêu Lo (ppm)</label>
                        <input
                          type="number"
                          value={cfg.lo}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            updateState((prev) => ({
                              modeSettings: {
                                ...prev.modeSettings,
                                [modeKey]: { ...prev.modeSettings[modeKey], lo: val },
                              },
                            }));
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Bắt đầu xả Hi (ppm)</label>
                        <input
                          type="number"
                          value={cfg.hi}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            updateState((prev) => ({
                              modeSettings: {
                                ...prev.modeSettings,
                                [modeKey]: { ...prev.modeSettings[modeKey], hi: val },
                              },
                            }));
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-amber-300 text-sm font-semibold"
                        />
                      </div>

                      <div className="col-span-2 flex items-center gap-3">
                        <div className="flex-1">
                          <label className="text-slate-400 block mb-1">Phút xả (P)</label>
                          <input
                            type="number"
                            min="0"
                            max="30"
                            value={cfg.flushMinutes}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              updateState((prev) => ({
                                modeSettings: {
                                  ...prev.modeSettings,
                                  [modeKey]: { ...prev.modeSettings[modeKey], flushMinutes: val },
                                },
                              }));
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-white text-sm"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-slate-400 block mb-1">Giây xả (G)</label>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            step="5"
                            value={cfg.flushSeconds}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              updateState((prev) => ({
                                modeSettings: {
                                  ...prev.modeSettings,
                                  [modeKey]: { ...prev.modeSettings[modeKey], flushSeconds: val },
                                },
                              }));
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-white text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: LỊCH LỌC */}
        {activeTab === 'filter' && (
          <div className="space-y-6">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                1. Chọn kiểu khung giờ lọc (Kiểu 100 – 104)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {SCHEDULE_FILTERS.map((sch) => {
                  const isSelected = state.filterSchedule.type === sch.code;
                  return (
                    <button
                      key={sch.code}
                      onClick={() => {
                        updateState((prev) => ({
                          filterSchedule: {
                            ...prev.filterSchedule,
                            type: sch.code as any,
                          },
                        }));
                        showToast(`Đã chọn kiểu lịch ${sch.code}`);
                      }}
                      className={`p-3 rounded-xl border text-left transition-colors ${
                        isSelected
                          ? 'bg-cyan-950/50 border-cyan-400 text-white'
                          : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-mono font-bold text-cyan-300 block text-xs">{sch.code}</span>
                      <span className="text-xs font-medium block">{sch.name}</span>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">{sch.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                2. Chu kỳ ngày lọc (C07, C24, C13, C03, Ctu)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {DAY_PATTERNS.map((dp) => {
                  const isSelected = state.filterSchedule.dayPattern === dp.code;
                  return (
                    <button
                      key={dp.code}
                      onClick={() => {
                        updateState((prev) => ({
                          filterSchedule: {
                            ...prev.filterSchedule,
                            dayPattern: dp.code as any,
                          },
                        }));
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-colors ${
                        isSelected
                          ? 'bg-cyan-950/50 border-cyan-400 text-white'
                          : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-mono font-bold text-cyan-300 text-xs block">{dp.code}</span>
                      <span className="text-xs font-medium block">{dp.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-semibold">3. Số phút chạy lọc mỗi giờ</span>
                <span className="font-mono text-cyan-300 font-bold">{state.filterSchedule.minutesPerHour} phút / giờ</span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                value={state.filterSchedule.minutesPerHour}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  updateState((prev) => ({
                    filterSchedule: {
                      ...prev.filterSchedule,
                      minutesPerHour: val,
                    },
                  }));
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* TAB: CẤU HÌNH BƠM (Mục 8.3) */}
        {activeTab === 'pump' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Chọn đúng loại bơm đang lắp ráp vào máy để hệ thống hiệu chuẩn giới hạn mA và báo lỗi chính xác (Mục 8.3):
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => {
                  updateState({ pumpType: 'SMALL' });
                  showToast('Đã chọn Bơm nhỏ (Tiêu chuẩn)');
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  state.pumpType === 'SMALL'
                    ? 'bg-cyan-950/50 border-cyan-400 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">Bơm nhỏ (Tiêu chuẩn)</span>
                  {state.pumpType === 'SMALL' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <div className="space-y-1.5 text-xs text-slate-400 font-mono">
                  <div className="flex justify-between">
                    <span>Dòng tối thiểu (111):</span>
                    <span className="text-white font-semibold">40 mA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cảnh báo lõi bẩn (FLt):</span>
                    <span className="text-amber-300 font-semibold">600 mA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quá dòng kẹt ngắt khẩn (222):</span>
                    <span className="text-rose-400 font-semibold">700 mA</span>
                  </div>
                </div>
              </div>

              <div
                onClick={() => {
                  updateState({ pumpType: 'LARGE' });
                  showToast('Đã chọn Bơm lớn (Công suất cao)');
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  state.pumpType === 'LARGE'
                    ? 'bg-cyan-950/50 border-cyan-400 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">Bơm lớn (Công suất cao)</span>
                  {state.pumpType === 'LARGE' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <div className="space-y-1.5 text-xs text-slate-400 font-mono">
                  <div className="flex justify-between">
                    <span>Dòng tối thiểu (111):</span>
                    <span className="text-white font-semibold">80 mA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cảnh báo lõi bẩn (FLt):</span>
                    <span className="text-amber-300 font-semibold">1200 mA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quá dòng kẹt ngắt khẩn (222):</span>
                    <span className="text-rose-400 font-semibold">1500 mA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Van xả thải electrical specs (Van xả cũng có cảm biến dòng điện) */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white">Van xả thải (Solenoid Valve)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                  Cảm biến dòng van xả
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Bo mạch tích hợp cảm biến dòng điện riêng cho Van xả để phát hiện đứt cuộn coil hoặc kẹt kẹt dị vật:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="block text-[11px] text-slate-400">Dòng mở xả chuẩn:</span>
                  <span className="text-amber-300 font-bold text-sm">~420 mA</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="block text-[11px] text-slate-400">Không có dòng (555):</span>
                  <span className="text-white font-bold text-sm">0 mA (Đứt coil)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="block text-[11px] text-slate-400">Quá dòng kẹt ngắt khẩn (666):</span>
                  <span className="text-rose-400 font-bold text-sm">&gt; 800 mA</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CẢM BIẾN (Mục 8.4) */}
        {activeTab === 'sensor' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div>
                <span className="text-sm font-semibold text-white block">Tự chạy lọc đo mỗi 1 tiếng</span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  Máy tự động kích hoạt bơm 20 giây để nước lưu thông qua đầu cảm biến trước khi lấy mẫu đo.
                </span>
              </div>
              <button
                onClick={() =>
                  updateState((prev) => ({
                    autoRunFilterToMeasure: !prev.autoRunFilterToMeasure,
                  }))
                }
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-colors ${
                  state.autoRunFilterToMeasure
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {state.autoRunFilterToMeasure ? 'ĐANG BẬT' : 'ĐÃ TẮT'}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div>
                <span className="text-sm font-semibold text-white block">Chế độ đo</span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  Mỗi 1 tiếng (chuẩn xác nhất) hoặc Real-time (cập nhật liên tục 2 giây/lần).
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateState({ sensorMode: 'HOURLY' })}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold ${
                    state.sensorMode === 'HOURLY'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Mỗi 1 tiếng
                </button>
                <button
                  onClick={() => updateState({ sensorMode: 'REALTIME' })}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold ${
                    state.sensorMode === 'REALTIME'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Real-time (2s)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: ĐIỀU KHIỂN & TIỆN ÍCH */}
        {activeTab === 'control' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Chế độ Ban đêm (Night Mode) */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <Moon className="w-4 h-4 text-indigo-400" />
                    Chế độ Ban đêm
                  </span>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    Tắt 100% đèn báo và logo trên mặt máy để tránh chói phòng ngủ.
                  </span>
                </div>
                <button
                  onClick={() => {
                    updateState((prev) => ({ nightMode: !prev.nightMode }));
                    showToast(state.nightMode ? 'Đã tắt chế độ ban đêm' : 'Đã bật chế độ ban đêm');
                  }}
                  className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-colors ${
                    state.nightMode
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {state.nightMode ? 'BẬT' : 'TẮT'}
                </button>
              </div>

              {/* Màn hình khi ngủ */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-400" />
                    Màn hình khi ngủ
                  </span>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    Bật: vẫn hiện TDS luân phiên; Tắt: tắt màn hình số.
                  </span>
                </div>
                <button
                  onClick={() =>
                    updateState((prev) => ({
                      screenSleepEnabled: !prev.screenSleepEnabled,
                    }))
                  }
                  className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-colors ${
                    state.screenSleepEnabled
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {state.screenSleepEnabled ? 'BẬT' : 'TẮT'}
                </button>
              </div>
            </div>

            {/* Hold duration slider */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-semibold">Giữ nút bao lâu mới ăn (Mục 4)</span>
                <span className="font-mono text-cyan-300 font-bold">
                  {state.holdDurationSeconds === 0 ? 'Tắt (chạm là ăn)' : `${state.holdDurationSeconds} giây`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                step="0.5"
                value={state.holdDurationSeconds}
                onChange={(e) => updateState({ holdDurationSeconds: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Khuyên dùng: 1.0 giây để chống mèo hoặc tay quẹt trúng bật nhầm.
              </span>
            </div>

            {/* Factory Reset */}
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-rose-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Khôi phục cài đặt gốc (Reset Factory)
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  Đưa lịch lọc, lịch xả, chế độ nuôi về giá trị xuất xưởng.
                </span>
              </div>
              <button
                onClick={handleReset}
                className="py-2 px-3.5 rounded-xl text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-colors"
              >
                RESET MÁY
              </button>
            </div>
          </div>
        )}

        {/* TAB: WIFI & RTC (Mục 8.1) */}
        {activeTab === 'wifi' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <h5 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
                <Wifi className="w-4 h-4 text-cyan-400" />
                Cấu hình kết nối WiFi nhà (Mục 8.1)
              </h5>
              <p className="text-xs text-slate-400 mb-3">
                Sau khi kết nối WiFi nhà thành công, máy tự đồng bộ giờ chuẩn Internet mỗi nửa đêm và cấp địa chỉ truy cập qua mạng nội bộ.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
                <div>
                  <label className="text-slate-400 block mb-1">Tên WiFi nhà (SSID 2.4GHz)</label>
                  <input
                    type="text"
                    value={state.homeWifiSSID}
                    onChange={(e) => updateState({ homeWifiSSID: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Mật khẩu WiFi</label>
                  <input
                    type="password"
                    defaultValue="••••••••"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-white text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-xs text-slate-400">
                  Địa chỉ IP cấp phát: <span className="font-mono text-cyan-300 font-semibold">{state.deviceIp}</span>
                </span>
                <button
                  onClick={() => {
                    updateState({ homeWifiConnected: true });
                    showToast('Đã lưu cấu hình và kết nối WiFi nhà thành công!');
                  }}
                  className="py-1.5 px-4 rounded-xl text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors"
                >
                  Kết Nối WiFi
                </button>
              </div>
            </div>

            {/* Đồng bộ giờ RTC */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Đồng hồ thời gian thực RTC
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  Giờ hiện tại trên máy: <span className="font-mono text-white font-bold">{state.rtcTime}</span>
                </span>
              </div>
              <button
                onClick={handleSyncRTC}
                className="py-2 px-3.5 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Đồng bộ giờ điện thoại
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

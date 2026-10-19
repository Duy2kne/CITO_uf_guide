import React, { useState } from 'react';
import { SimulatorState, BreedingMode } from '../types/manual';
import { HardwareSimulator } from './HardwareSimulator';
import { WebSimulator } from './WebSimulator';
import { TroubleshootingWizard } from './TroubleshootingWizard';
import { AquariumCalculator } from './AquariumCalculator';
import { Cpu, Smartphone, AlertTriangle, Calculator, BookOpen, ArrowRight } from 'lucide-react';

interface FeatureSimulatorProps {
  state: SimulatorState;
  updateState: (partial: Partial<SimulatorState> | ((prev: SimulatorState) => Partial<SimulatorState>)) => void;
  onGoToManualSection: (sectionNumber: number) => void;
  preselectedErrorCode?: string | null;
}

export const FeatureSimulator: React.FC<FeatureSimulatorProps> = ({
  state,
  updateState,
  onGoToManualSection,
  preselectedErrorCode,
}) => {
  const [subView, setSubView] = useState<'panel' | 'phone' | 'faults' | 'calc'>('panel');
  const [troubleshootCode, setTroubleshootCode] = useState<string | null>(preselectedErrorCode || null);

  const handleOpenTroubleshooting = (code: string) => {
    setTroubleshootCode(code);
    setSubView('faults');
  };

  const handleInjectFault = (code: string) => {
    if (state.activeError === code) {
      updateState({ activeError: null, isPressureReleasing: false, isFiltering: false, isFlushing: false });
      setSubView('panel');
      return;
    }

    if (code === 'XAP') {
      updateState({
        activeError: 'XAP',
        isPressureReleasing: true,
        isFiltering: true,
        isFlushing: true,
      });
      setTimeout(() => {
        updateState((prev) => ({
          isPressureReleasing: false,
          isFiltering: false,
          isFlushing: false,
          activeError: prev.activeError === 'XAP' ? null : prev.activeError,
        }));
      }, 6000);
    } else if (code === 'rES') {
      updateState({
        activeError: 'rES',
        activeMode: 'OFF',
        isFiltering: false,
        isFlushing: false,
        isPressureReleasing: false,
      });
      setTimeout(() => {
        updateState({ activeError: null });
      }, 3500);
    } else {
      updateState({ activeError: code, isFiltering: false, isFlushing: false });
    }
    setSubView('panel');
  };

  const handleApplyCalculatorSettings = (
    mode: BreedingMode,
    minutes: number,
    seconds: number,
    lo: number,
    hi: number
  ) => {
    updateState((prev) => ({
      activeMode: mode,
      modeSettings: {
        ...prev.modeSettings,
        [mode]: {
          lo,
          hi,
          flushMinutes: minutes,
          flushSeconds: seconds,
        },
      },
    }));
    setSubView('panel');
  };

  return (
    <div className="space-y-6">
      {/* Simulator Workspace Header & Sub-Navigation */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              Giả Lập Tính Năng CITO UF
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Tương tác trực tiếp
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mô phỏng 100% logic cảm ứng chạm 1 giây, đèn báo, màn hình số, xả tự động theo TDS và trang web điều khiển.
          </p>
        </div>

        {/* Sub-tools switcher within Feature Simulator */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSubView('panel')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              subView === 'panel'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Mặt Máy Cảm Ứng</span>
          </button>

          <button
            onClick={() => setSubView('phone')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              subView === 'phone'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Web 192.168.4.1</span>
          </button>

          <button
            onClick={() => setSubView('faults')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              subView === 'faults'
                ? 'bg-rose-500 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Kiểm Tra Lỗi (Mục 10)</span>
          </button>

          <button
            onClick={() => setSubView('calc')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              subView === 'calc'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Tính Hồ Thủy Sinh</span>
          </button>
        </div>
      </div>

      {/* Sub-view: Mặt máy cảm ứng ảo */}
      {subView === 'panel' && (
        <div className="space-y-6">
          <HardwareSimulator
            state={state}
            updateState={updateState}
            onOpenTroubleshooting={handleOpenTroubleshooting}
          />
        </div>
      )}

      {/* Sub-view: Web điều khiển qua điện thoại */}
      {subView === 'phone' && (
        <div className="space-y-6">
          <WebSimulator state={state} updateState={updateState} />
        </div>
      )}

      {/* Sub-view: Thử nghiệm mã lỗi & hướng dẫn */}
      {subView === 'faults' && (
        <div className="space-y-6">
          <TroubleshootingWizard
            selectedErrorCode={troubleshootCode}
            onInjectError={handleInjectFault}
          />
        </div>
      )}

      {/* Sub-view: Công cụ tính toán hồ */}
      {subView === 'calc' && (
        <div className="space-y-6">
          <AquariumCalculator onApplyPreset={handleApplyCalculatorSettings} />
        </div>
      )}

      {/* Bottom Cross-Reference to Manual */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            Bạn cần xem lại thuyết minh chi tiết từng bước? Hãy chuyển sang trang{' '}
            <strong className="text-white">Sổ Tay Hướng Dẫn</strong> (Mục 1 đến Mục 12).
          </span>
        </div>
        <button
          onClick={() => onGoToManualSection(subView === 'phone' ? 8 : subView === 'faults' ? 10 : 4)}
          className="py-1.5 px-3 rounded-lg bg-slate-800 text-cyan-300 hover:bg-slate-700 transition-colors flex items-center gap-1 shrink-0 self-start sm:self-auto font-medium"
        >
          <span>Xem mục hướng dẫn tương ứng</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

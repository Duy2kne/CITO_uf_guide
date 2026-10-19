import React, { useState } from 'react';
import { Calculator, ArrowRight, Check, Droplets } from 'lucide-react';
import { BreedingMode } from '../types/manual';

interface AquariumCalculatorProps {
  onApplyPreset: (mode: BreedingMode, minutes: number, seconds: number, lo: number, hi: number) => void;
}

export const AquariumCalculator: React.FC<AquariumCalculatorProps> = ({ onApplyPreset }) => {
  const [lengthCm, setLengthCm] = useState<number>(60);
  const [widthCm, setWidthCm] = useState<number>(30);
  const [heightCm, setHeightCm] = useState<number>(36);
  const [targetType, setTargetType] = useState<BreedingMode>('TEP');
  const [percentChange, setPercentChange] = useState<number>(10); // % water change per flush
  const [applied, setApplied] = useState<boolean>(false);

  // Volume in Liters = L * W * H / 1000 * 0.85 (minus substrate and hardscape)
  const grossVolume = (lengthCm * widthCm * heightCm) / 1000;
  const netWaterVolume = Math.round(grossVolume * 0.85);

  // Flow rate of standard small drain solenoid / pump ~ 3.5 Liters / minute (~ 0.058 L/sec)
  const targetLiters = (netWaterVolume * percentChange) / 100;
  const estimatedSeconds = Math.round(targetLiters / (3.5 / 60));
  const finalMinutes = Math.floor(Math.min(1800, Math.max(5, estimatedSeconds)) / 60);
  const finalSeconds = Math.round((Math.min(1800, Math.max(5, estimatedSeconds)) % 60) / 5) * 5; // rounded to 5s

  const loTarget = targetType === 'TEP' ? 120 : targetType === 'CA' ? 120 : 150;
  const hiTarget = targetType === 'TEP' ? 170 : targetType === 'CA' ? 250 : 250;

  const handleApply = () => {
    onApplyPreset(targetType, finalMinutes, finalSeconds, loTarget, hiTarget);
    setApplied(true);
    setTimeout(() => setApplied(false), 3000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-cyan-400" />
            Công Cụ Tính Thể Tích Hồ & Thời Gian Xả Nước Tối Ưu
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Giải quyết thắc mắc Mục 11: &ldquo;Hồ nhỏ xả 1 phút là quá nhiều?&rdquo; - Tính chính xác từng giây theo dung tích bể.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Input Parameters (Col 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Dài (cm)</label>
              <input
                type="number"
                value={lengthCm}
                onChange={(e) => setLengthCm(Math.max(10, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Rộng (cm)</label>
              <input
                type="number"
                value={widthCm}
                onChange={(e) => setWidthCm(Math.max(10, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Cao (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Math.max(10, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-white text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Mục tiêu sinh thái</label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as BreedingMode)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              >
                <option value="TEP">Tép kiểng (TDS 120 - 170 ppm)</option>
                <option value="CA">Cá cảnh (TDS 120 - 250 ppm)</option>
                <option value="CAY">Thủy sinh cây (TDS 150 - 250 ppm)</option>
                <option value="CUSTOM">Tùy biến Custom (TDS 150 - 300 ppm)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400">Tỷ lệ thay nước mỗi lần</span>
                <span className="font-mono text-cyan-300 font-bold">{percentChange}% thể tích</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={percentChange}
                onChange={(e) => setPercentChange(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer mt-2"
              />
            </div>
          </div>
        </div>

        {/* Output Recommendation Card (Col 5) */}
        <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-2xl p-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-cyan-400" />
            Khuyến nghị cài đặt CITO UF
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400">Thể tích nước thực:</span>
              <span className="font-bold text-white">~{netWaterVolume} Lít (bể {grossVolume.toFixed(0)}L)</span>
            </div>

            <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400">Lượng nước xả/lần:</span>
              <span className="font-bold text-cyan-300">~{targetLiters.toFixed(1)} Lít ({percentChange}%)</span>
            </div>

            <div className="flex justify-between p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/50">
              <span className="text-cyan-200">Thời gian xả cài đặt:</span>
              <span className="font-bold text-amber-300 text-sm">
                {finalMinutes} phút {finalSeconds} giây (P{String(finalMinutes).padStart(2, '0')} · G{String(finalSeconds).padStart(2, '0')})
              </span>
            </div>
          </div>

          <button
            onClick={handleApply}
            className={`mt-5 w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              applied
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20'
            }`}
          >
            {applied ? (
              <>
                <Check className="w-4 h-4" />
                Đã áp dụng vào máy ảo & Web!
              </>
            ) : (
              <>
                <span>Áp dụng thông số này vào máy CITO UF</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

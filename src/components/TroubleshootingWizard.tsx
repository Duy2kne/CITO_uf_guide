import React, { useState } from 'react';
import { ERROR_CODES } from '../data/manualData';
import { ErrorDefinition } from '../types/manual';
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Wrench,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface TroubleshootingWizardProps {
  onInjectError: (code: string) => void;
  selectedErrorCode?: string | null;
}

export const TroubleshootingWizard: React.FC<TroubleshootingWizardProps> = ({
  onInjectError,
  selectedErrorCode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCode, setActiveCode] = useState<string>(selectedErrorCode || '222');

  const filteredErrors = ERROR_CODES.filter(
    (err) =>
      err.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      err.displayCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      err.cause.toLowerCase().includes(searchQuery.toLowerCase()) ||
      err.solution.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedItem = ERROR_CODES.find((e) => e.code === activeCode) || ERROR_CODES[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-cyan-400" />
            Tra Cứu Mã Lỗi & Chẩn Đoán Kỹ Thuật (Mục 10)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Tìm kiếm theo mã số trên màn hình, đèn báo hoặc hiện tượng thực tế của máy lọc CITO UF.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm mã 222, 666, FLt, lõi bẩn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Error Code List (Left 5 cols) */}
        <div className="lg:col-span-5 space-y-2 max-h-[480px] overflow-y-auto pr-1">
          {filteredErrors.map((err) => {
            const isSelected = activeCode === err.code;
            return (
              <button
                key={err.code}
                onClick={() => setActiveCode(err.code)}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-400 text-white shadow-md'
                    : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`font-mono font-bold text-xs py-0.5 px-2 rounded-md ${
                        err.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : err.severity === 'warning'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {err.displayCode}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{err.ledState}</span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-1">{err.cause}</p>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 ml-2 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
              </button>
            );
          })}
        </div>

        {/* Detailed Troubleshooting Card (Right 7 cols) */}
        <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-2xl font-bold text-white tracking-wider">
                  {selectedItem.displayCode}
                </span>
                <span
                  className={`text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full ${
                    selectedItem.severity === 'critical'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : selectedItem.severity === 'warning'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  }`}
                >
                  {selectedItem.severity === 'critical'
                    ? 'Ngắt khẩn cấp'
                    : selectedItem.severity === 'warning'
                    ? 'Cảnh báo vận hành'
                    : 'Thông tin trạng thái'}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-400">
                Đèn báo trên mặt máy: <span className="text-rose-400 font-semibold">{selectedItem.ledState}</span>
              </div>
            </div>

            {/* Test in Simulator button */}
            <button
              onClick={() => onInjectError(selectedItem.code)}
              className="py-2 px-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/20 transition-all flex items-center gap-1.5 shrink-0"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-cyan-400" />
              Thử trên máy ảo
            </button>
          </div>

          <div className="mt-5 space-y-5">
            {/* Nguyên nhân */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Nguyên nhân phát sinh
              </h4>
              <p className="text-sm text-slate-200 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed">
                {selectedItem.cause}
              </p>
            </div>

            {/* Các bước xử lý */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Quy trình xử lý an toàn
              </h4>
              <div className="text-sm text-slate-200 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed">
                {selectedItem.solution}
              </div>
            </div>

            {/* Lưu ý an toàn quan trọng */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300/90 leading-relaxed">
              <strong>Lưu ý từ tài liệu kỹ thuật:</strong>{' '}
              {selectedItem.code === '222' || selectedItem.code === '666'
                ? 'Đừng bấm OK khi chưa xử lý triệt để nguyên nhân quá dòng; tiếp tục chạy có thể gây cháy hỏng cuộn motor bơm hoặc cuộn coil van điện từ.'
                : selectedItem.code === 'FLt'
                ? 'Ở mã FLt, máy vẫn tiếp tục chạy bơm lọc bình thường để duy trì tuần hoàn nước bể, nhưng bạn nên sắp xếp vệ sinh hoặc thay lõi sớm.'
                : 'Mã lỗi 111 và 555 sẽ tự động biến mất khi dòng điện trở lại giá trị danh định bình thường trong vài giây.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { MANUAL_SECTIONS, MODE_DEFAULTS, PUMP_SPECIFICATIONS, ERROR_CODES, SCHEDULE_FILTERS, DAY_PATTERNS } from '../data/manualData';
import {
  BookOpen,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  List,
  X,
  ShieldAlert,
  Zap,
  Sliders,
  Calendar,
  Wifi,
  HelpCircle,
  FileText,
  Clock,
  Printer,
  Sparkles,
  Cpu,
  ArrowRight,
} from 'lucide-react';

interface ManualReaderProps {
  onSwitchToSimulator?: (scenario?: { section?: number; errorCode?: string }) => void;
  initialSectionNumber?: number;
}

export const ManualReader: React.FC<ManualReaderProps> = ({ onSwitchToSimulator, initialSectionNumber }) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    initialSectionNumber ? `sec-${initialSectionNumber}` : 'sec-1'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileMenuExpanded, setIsMobileMenuExpanded] = useState<boolean>(false);

  const filteredSections = MANUAL_SECTIONS.filter(
    (sec) =>
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeSection = MANUAL_SECTIONS.find((s) => s.id === selectedSectionId) || MANUAL_SECTIONS[0];
  const currentIndex = MANUAL_SECTIONS.findIndex((s) => s.id === activeSection.id);
  const prevSection = currentIndex > 0 ? MANUAL_SECTIONS[currentIndex - 1] : null;
  const nextSection = currentIndex < MANUAL_SECTIONS.length - 1 ? MANUAL_SECTIONS[currentIndex + 1] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Mobile Chapter Navigation (Visible ONLY on mobile screens < lg, NON-BLOCKING, NEVER COVERS CONTENT) */}
      <div className="lg:hidden col-span-1 w-full space-y-2.5">
        {/* Horizontal Quick-Jump Bar of 12 Sections */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none scroll-smooth">
          {MANUAL_SECTIONS.map((sec) => {
            const isSelected = selectedSectionId === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  setSelectedSectionId(sec.id);
                  setIsMobileMenuExpanded(false);
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-400/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <span
                  className={`text-[10px] font-mono px-1 rounded ${
                    isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-cyan-400'
                  }`}
                >
                  {sec.number}
                </span>
                <span>{sec.title}</span>
              </button>
            );
          })}
        </div>

        {/* Current Active Section Bar with Direct Dropdown Picker */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 shadow-md">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono uppercase text-cyan-400 block font-semibold">
              Đang xem Mục {activeSection.number} / 12
            </span>
            <select
              value={selectedSectionId}
              onChange={(e) => {
                setSelectedSectionId(e.target.value);
                setIsMobileMenuExpanded(false);
              }}
              className="w-full bg-transparent text-xs font-bold text-white truncate focus:outline-none cursor-pointer mt-0.5"
            >
              {MANUAL_SECTIONS.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-white py-1">
                  Mục {s.number}: {s.title}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileMenuExpanded((prev) => !prev)}
            className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <List className="w-3.5 h-3.5" />
            <span>{isMobileMenuExpanded ? 'Thu gọn' : 'Mục lục'}</span>
          </button>
        </div>

        {/* Inline Expandable Table of Contents (Pushes content down inline, NEVER fixed/covering!) */}
        {isMobileMenuExpanded && (
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                Mục lục 12 phần hướng dẫn:
              </span>
              <button
                type="button"
                onClick={() => setIsMobileMenuExpanded(false)}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                Đóng
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
              {filteredSections.map((sec) => {
                const isSelected = selectedSectionId === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setSelectedSectionId(sec.id);
                      setIsMobileMenuExpanded(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left flex items-start gap-2.5 transition-colors ${
                      isSelected
                        ? 'bg-cyan-950/60 border border-cyan-500 text-white'
                        : 'bg-slate-950/50 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span
                      className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                        isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {sec.number}
                    </span>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold block truncate">{sec.title}</span>
                      <span className="text-[11px] text-slate-400 block truncate">{sec.summary}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Sidebar (Only visible on lg: and larger, sticky only on desktop!) */}
      <div className="hidden lg:block lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 lg:sticky lg:top-24">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Mục Lục Hướng Dẫn</h3>
          </div>
          <span className="text-xs font-mono text-cyan-400 font-semibold">12 Mục Chính</span>
        </div>

        {/* Source citation */}
        <div className="mb-3.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400">
          <span className="text-slate-300 font-medium block">Tài liệu hướng dẫn CITO UF</span>
          <span>Nguồn: Oct 14, 2026 · @Duy</span>
        </div>

        {/* Search inside manual */}
        <div className="relative mb-4">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mục, mã lỗi, phím bấm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        {/* Section List */}
        <div className="space-y-1 max-h-[520px] overflow-y-auto pr-1">
          {filteredSections.map((sec) => {
            const isSelected = selectedSectionId === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setSelectedSectionId(sec.id)}
                className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start gap-2.5 ${
                  isSelected
                    ? 'bg-cyan-950/50 border border-cyan-500/50 text-white'
                    : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <span
                  className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                    isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {sec.number}
                </span>
                <div className="min-w-0">
                  <span className="text-xs font-semibold block truncate">{sec.title}</span>
                  <span className="text-[11px] text-slate-400 block truncate">{sec.summary}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Viewer (Col 8) */}
      <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10">
        {/* Top Reference Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-cyan-300 font-semibold block text-sm">
              Hướng dẫn sử dụng máy lọc CITO UF (User Manual)
            </span>
            <span className="text-slate-400">Tác giả @Duy · Ngày 14/10/2026 · Phiên bản hoàn chỉnh 13 trang</span>
          </div>
          <button
            onClick={() => onSwitchToSimulator?.({ section: activeSection.number })}
            className="py-1.5 px-3 rounded-xl bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300 transition-colors shrink-0 flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Thao tác trên Giả Lập Tính Năng</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Header of Active Section */}
        <div className="mb-8 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
            <span>MỤC {activeSection.number} TRÊN 12</span>
            <span>·</span>
            <span>TÀI LIỆU CHÍNH THỨC CITO UF</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
            {activeSection.number}. {activeSection.title}
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">{activeSection.summary}</p>

          {/* Highlights checklist */}
          {activeSection.highlights && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
                Điểm cốt lõi cần nhớ:
              </span>
              {activeSection.highlights.map((hl, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span>{hl}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section Body Text */}
        <div className="text-sm text-slate-200 leading-relaxed space-y-4 whitespace-pre-line mb-8">
          {activeSection.content}
        </div>

        {/* SPECIAL INTERACTIVE DIAGRAMS / TABLES EMBEDDED BY SECTION */}

        {/* Section 2: Interactive Table for Buttons & LEDs */}
        {activeSection.number === 2 && (
          <div className="mt-8 space-y-6 pt-6 border-t border-slate-800">
            <h4 className="text-sm font-bold text-white">Bảng chi tiết các nút & đèn báo (Trang 2)</h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px]">
                  <tr>
                    <th className="p-3">Hàng</th>
                    <th className="p-3">Nút / Đèn</th>
                    <th className="p-3">Chức năng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                  <tr>
                    <td className="p-3 font-mono font-bold text-cyan-400">Hàng 1</td>
                    <td className="p-3 font-semibold text-white">LỌC, XẢ (nút có đèn) · ERR1, ERR2 (chỉ là đèn)</td>
                    <td className="p-3 text-slate-300">Bật/tắt lọc và xả, cảnh báo sự cố kỹ thuật</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-cyan-400">Hàng 2</td>
                    <td className="p-3 font-semibold text-white">TÉP, CÁ, CÂY, CUSTOM</td>
                    <td className="p-3 text-slate-300">Chọn chế độ nuôi sinh cảnh bể tương ứng</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-cyan-400">Hàng 3</td>
                    <td className="p-3 font-semibold text-white">SETTING, ▲ UP, ▼ DOWN, OK</td>
                    <td className="p-3 text-slate-300">Vào menu hệ thống, tăng giảm số, xác nhận cài đặt</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 mt-4">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px]">
                  <tr>
                    <th className="p-3">Đèn LED (Màu trắng)</th>
                    <th className="p-3">Hành động (Action)</th>
                    <th className="p-3">Ý nghĩa vận hành & Cảnh báo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                  <tr>
                    <td className="p-3 font-semibold text-white">Đèn LỌC</td>
                    <td className="p-3 font-mono text-white">Sáng cố định</td>
                    <td className="p-3 text-slate-300">Máy đang trong chu trình lọc nước tuần hoàn</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Đèn LỌC</td>
                    <td className="p-3 font-mono text-zinc-300">Nhấp nháy (Flashing)</td>
                    <td className="p-3 text-slate-300">Lõi lọc UF bẩn, cần rửa hoặc thay lõi (máy vẫn chạy bình thường)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Đèn XẢ</td>
                    <td className="p-3 font-mono text-white">Sáng cố định</td>
                    <td className="p-3 text-slate-300">Máy đang mở van xả nước thải đáy bể</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Đèn ERR1</td>
                    <td className="p-3 font-mono text-zinc-300">Nhấp nháy (Flashing)</td>
                    <td className="p-3 text-slate-300">Lỗi bơm hoặc van: không có dòng điện, hoặc quá dòng ngắt khẩn</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Đèn ERR2</td>
                    <td className="p-3 font-mono text-zinc-300">Nhấp nháy (Flashing)</td>
                    <td className="p-3 text-slate-300">Cảnh báo: lõi lọc bẩn, đồng hồ RTC mất giờ, hoặc cảm biến dòng chưa cắm</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">TÉP / CÁ / CÂY / CUSTOM</td>
                    <td className="p-3 font-mono text-white">Sáng cố định</td>
                    <td className="p-3 text-slate-300">Chế độ nuôi tương ứng đang hoạt động (chỉ 1 đèn sáng)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">SETTING / UP / DOWN / OK</td>
                    <td className="p-3 font-mono text-white">Sáng khi chạm</td>
                    <td className="p-3 text-slate-300">Phản hồi xúc giác tức thì khi nhận diện ngón tay chạm vào nút</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 4: Holding Rules Table */}
        {activeSection.number === 4 && (
          <div className="mt-8 space-y-4 pt-6 border-t border-slate-800">
            <h4 className="text-sm font-bold text-white">Bảng thời gian giữ nút cảm ứng (Trang 4)</h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px]">
                  <tr>
                    <th className="p-3">Nút</th>
                    <th className="p-3">Giữ 1 giây rồi thả</th>
                    <th className="p-3">Giữ 5 giây</th>
                    <th className="p-3">Giữ 10 giây</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                  <tr>
                    <td className="p-3 font-bold text-white">LỌC</td>
                    <td className="p-3 text-slate-300">Bật / tắt lọc bằng tay</td>
                    <td className="p-3 text-amber-300 font-mono">Bật / tắt bơm khô (drn)</td>
                    <td className="p-3 text-slate-400">—</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">XẢ</td>
                    <td className="p-3 text-slate-300">Bật / tắt xả bằng tay</td>
                    <td className="p-3 text-slate-400">—</td>
                    <td className="p-3 text-slate-400">—</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-cyan-300">TÉP / CÁ / CÂY / CUSTOM</td>
                    <td className="p-3 text-slate-300">Chọn / tắt chế độ nuôi</td>
                    <td className="p-3 text-cyan-300">Vào chỉnh ngưỡng TDS (Lo/Hi) & thời gian xả</td>
                    <td className="p-3 text-slate-400">—</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">SETTING</td>
                    <td className="p-3 text-slate-400">—</td>
                    <td className="p-3 text-white">Vào menu lịch lọc / lịch xả (LOC / XA)</td>
                    <td className="p-3 text-slate-400">—</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-emerald-400">OK</td>
                    <td className="p-3 text-emerald-300">Chạm là ăn: Xác nhận, xóa cảnh báo</td>
                    <td className="p-3 text-amber-300 font-mono">Xả áp suất trong ống (XAP)</td>
                    <td className="p-3 text-rose-400 font-mono">Khôi phục cài đặt gốc (rES)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">▲ UP / ▼ DOWN</td>
                    <td className="p-3 text-slate-300">Chạm là ăn: Tăng / giảm 1 số</td>
                    <td className="p-3 text-slate-300">Giữ để tăng / giảm liên tục</td>
                    <td className="p-3 text-slate-400">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 5: Breeding Modes Table */}
        {activeSection.number === 5 && (
          <div className="mt-8 space-y-4 pt-6 border-t border-slate-800">
            <h4 className="text-sm font-bold text-white">Thông số mặc định 4 chế độ nuôi (Trang 5)</h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px]">
                  <tr>
                    <th className="p-3">Chế độ</th>
                    <th className="p-3">Lo (ppm) mục tiêu</th>
                    <th className="p-3">Hi (ppm) bắt đầu xả</th>
                    <th className="p-3">Thời gian xả mặc định</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                  <tr>
                    <td className="p-3 font-bold text-cyan-300">Tép (Caridina / Neocaridina)</td>
                    <td className="p-3 font-mono text-white">120 ppm</td>
                    <td className="p-3 font-mono text-amber-300 font-semibold">170 ppm</td>
                    <td className="p-3 font-mono text-slate-300">1 phút (P01 G00)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-cyan-300">Cá (Cá cảnh các loại)</td>
                    <td className="p-3 font-mono text-white">120 ppm</td>
                    <td className="p-3 font-mono text-amber-300 font-semibold">250 ppm</td>
                    <td className="p-3 font-mono text-slate-300">1 phút (P01 G00)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-cyan-300">Cây (Hồ trồng cây thủy sinh)</td>
                    <td className="p-3 font-mono text-white">150 ppm</td>
                    <td className="p-3 font-mono text-amber-300 font-semibold">250 ppm</td>
                    <td className="p-3 font-mono text-slate-300">1 phút (P01 G00)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-cyan-300">Custom (Tùy biến người dùng)</td>
                    <td className="p-3 font-mono text-white">150 ppm</td>
                    <td className="p-3 font-mono text-amber-300 font-semibold">300 ppm</td>
                    <td className="p-3 font-mono text-slate-300">1 phút (P01 G00)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 7 & 8: Flowchart of Menu SETTING (Page 8 Diagram) */}
        {(activeSection.number === 7 || activeSection.number === 8) && (
          <div className="mt-8 space-y-4 pt-6 border-t border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Sơ đồ cây Menu SETTING (Mục 7 & Trang 8)
            </h4>
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center">
              {/* Trigger */}
              <div className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white mb-6">
                Giữ nút SETTING trong 5 giây
              </div>

              {/* 2 Branches */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                {/* LOC Branch */}
                <div className="flex flex-col items-center p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <span className="font-mono text-sm font-bold text-cyan-300 mb-1">Màn hình: LOC</span>
                  <span className="text-xs text-slate-400 mb-4">Nhánh LỊCH LỌC (3 bước)</span>

                  <div className="space-y-2 w-full text-center">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200">
                      1. Kiểu lịch: <span className="font-mono text-cyan-300">100 – 104</span>
                    </div>
                    <div className="text-slate-400 text-xs">↓ chạm OK</div>
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200">
                      2. Ngày lọc: <span className="font-mono text-cyan-300">C07 · C24 · C13 · C03 · Ctu</span>
                    </div>
                    <div className="text-slate-400 text-xs">↓ chạm OK</div>
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200">
                      3. Phút lọc mỗi giờ: <span className="font-mono text-cyan-300">1 – 60</span>
                    </div>
                    <div className="text-slate-400 text-xs">↓ chạm OK</div>
                    <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/80 text-xs text-emerald-300 font-semibold">
                      Lưu hoàn tất, về màn hình TDS
                    </div>
                  </div>
                </div>

                {/* XA Branch */}
                <div className="flex flex-col items-center p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <span className="font-mono text-sm font-bold text-amber-300 mb-1">Màn hình: XA</span>
                  <span className="text-xs text-slate-400 mb-4">(Giữ thêm 5s từ LOC để sang XA)</span>

                  <div className="space-y-2 w-full text-center">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200">
                      1. Kiểu lịch: <span className="font-mono text-amber-300">nd (mỗi N ngày) · Ctu</span>
                    </div>
                    <div className="text-slate-400 text-xs">↓ chạm OK</div>
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200">
                      2. Số lần xả mỗi ngày: <span className="font-mono text-amber-300">1 – 8</span>
                    </div>
                    <div className="text-slate-400 text-xs">↓ chạm OK</div>
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200">
                      3. Giờ bắt đầu: <span className="font-mono text-amber-300">0 – 23</span> · Phút: <span className="font-mono text-amber-300">0 – 59</span>
                    </div>
                    <div className="text-slate-400 text-xs">↓ chạm OK</div>
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200">
                      4. P phút (0–30) → OK → G giây (0–59)
                    </div>
                    <div className="text-slate-400 text-xs">↓ chạm OK</div>
                    <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/80 text-xs text-emerald-300 font-semibold">
                      Lưu hoàn tất, về màn hình TDS
                    </div>
                  </div>
                </div>
              </div>

              <span className="text-[11px] text-slate-400 mt-4">
                * Mẹo: Dùng ▲ UP / ▼ DOWN để đổi số. Dừng bấm 10 giây máy tự động lưu và thoát.
              </span>
            </div>
          </div>
        )}

        {/* Section 10: Error Code Matrix with one-click action */}
        {activeSection.number === 10 && (
          <div className="mt-8 space-y-4 pt-6 border-t border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Bảng tra cứu mã lỗi & đèn báo (Trang 11)
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px]">
                  <tr>
                    <th className="p-3">Màn hình</th>
                    <th className="p-3">Đèn</th>
                    <th className="p-3">Nguyên nhân</th>
                    <th className="p-3">Cách xử lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                  {ERROR_CODES.map((err) => (
                    <tr key={err.code}>
                      <td className="p-3 font-mono font-bold text-white whitespace-nowrap">{err.displayCode}</td>
                      <td className="p-3 font-mono text-rose-400 whitespace-nowrap">{err.ledState}</td>
                      <td className="p-3 text-slate-300 min-w-[200px]">{err.cause}</td>
                      <td className="p-3 text-slate-200 min-w-[240px]">{err.solution}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 12: Factory Defaults Table */}
        {activeSection.number === 12 && (
          <div className="mt-8 space-y-4 pt-6 border-t border-slate-800">
            <h4 className="text-sm font-bold text-white">Cài đặt mặc định ban đầu (sau RESET)</h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px]">
                  <tr>
                    <th className="p-3">Thông số</th>
                    <th className="p-3">Giá trị mặc định</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-mono">
                  <tr>
                    <td className="p-3 text-slate-300">Chế độ nuôi</td>
                    <td className="p-3 text-cyan-300 font-semibold">Tắt (Chạy theo lịch xả)</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-300">Lịch lọc</td>
                    <td className="p-3 text-white">103: 23h – 5h, 30 phút mỗi giờ, mỗi ngày</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-300">Lịch xả</td>
                    <td className="p-3 text-white">Mỗi 3 ngày, 1 lần lúc 12h00, xả 1 phút</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-300">Đo TDS / nhiệt độ</td>
                    <td className="p-3 text-white">Mỗi 1 tiếng, tự chạy lọc để đo: bật</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-300">Loại bơm</td>
                    <td className="p-3 text-white">Bơm nhỏ (40 / 600 / 700 mA)</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-300">Giữ nút cảm ứng</td>
                    <td className="p-3 text-white">1 giây (chống chạm nhầm)</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-300">Tự ngủ</td>
                    <td className="p-3 text-white">Sau 2 phút không thao tác</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-300">Màn hình khi ngủ</td>
                    <td className="p-3 text-emerald-400">Bật (tiếp tục hiện số & sáng logo)</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-300">Chế độ Ban đêm</td>
                    <td className="p-3 text-slate-400">Tắt</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-300">Xả áp suất</td>
                    <td className="p-3 text-white">Tự dừng sau 30 giây</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-300">Menu cài đặt</td>
                    <td className="p-3 text-white">Tự thoát sau 10 giây không bấm</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bottom Prev / Next Navigation for easy reading on all devices */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {prevSection ? (
            <button
              onClick={() => {
                setSelectedSectionId(prevSection.id);
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto py-2.5 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 flex items-center gap-2 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block font-mono">Mục trước</span>
                <span className="font-semibold block truncate max-w-[200px] sm:max-w-none">
                  {prevSection.number}. {prevSection.title}
                </span>
              </div>
            </button>
          ) : (
            <div />
          )}

          {nextSection && (
            <button
              onClick={() => {
                setSelectedSectionId(nextSection.id);
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto py-2.5 px-3.5 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 hover:bg-cyan-900/60 flex items-center justify-between sm:justify-start gap-2 transition-colors sm:ml-auto"
            >
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-cyan-400/80 block font-mono">Mục tiếp theo</span>
                <span className="font-semibold text-white block truncate max-w-[200px] sm:max-w-none">
                  {nextSection.number}. {nextSection.title}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


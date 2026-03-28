import React from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, 
  Clock, 
  Calendar, 
  Settings2,
  Save,
  Info,
  AlertCircle,
  LayoutGrid
} from 'lucide-react';
import { VenueConfig } from '../types';

interface ScheduleConfigProps {
  venueConfig: VenueConfig;
  onUpdateVenueConfig: (updates: Partial<VenueConfig>) => void;
  onSave: () => void;
}

export const ScheduleConfig: React.FC<ScheduleConfigProps> = ({ 
  venueConfig, 
  onUpdateVenueConfig,
  onSave
}) => {
  const calculateVenueCapacity = (config: VenueConfig) => {
    const cycleTime = config.match_duration + config.break_duration + config.buffer_duration;
    if (cycleTime <= 0) return 0;
    const matchesPerCourtPerDay = Math.floor((config.max_daily_hours * 60) / cycleTime);
    return matchesPerCourtPerDay * config.court_count * config.max_days;
  };

  const capacity = calculateVenueCapacity(venueConfig);

  return (
    <div className="max-w-4xl mx-auto px-8 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">赛程安排与场地配置</h1>
          <p className="text-slate-500 mt-1 text-sm">配置全局场地资源、比赛时长及生产力参数</p>
        </div>
        <button 
          onClick={onSave}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-indigo-200"
        >
          <Save className="w-4 h-4" />
          保存全局配置
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Venue Settings */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">场地资源配置</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  场地数量
                  <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                </label>
                <div className="relative">
                  <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="number" 
                    value={venueConfig.court_count}
                    onChange={e => onUpdateVenueConfig({ court_count: parseInt(e.target.value) || 0 })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">每场比赛预估时长 (分钟)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="number" 
                    value={venueConfig.match_duration}
                    onChange={e => onUpdateVenueConfig({ match_duration: parseInt(e.target.value) || 0 })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">场间休息时间 (分钟)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="number" 
                    value={venueConfig.break_duration}
                    onChange={e => onUpdateVenueConfig({ break_duration: parseInt(e.target.value) || 0 })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">转场冗余时间 (分钟)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="number" 
                    value={venueConfig.buffer_duration}
                    onChange={e => onUpdateVenueConfig({ buffer_duration: parseInt(e.target.value) || 0 })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">每天最多比赛时长 (小时)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="number" 
                    value={venueConfig.max_daily_hours}
                    onChange={e => onUpdateVenueConfig({ max_daily_hours: parseInt(e.target.value) || 0 })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">最多比赛天数</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="number" 
                    value={venueConfig.max_days}
                    onChange={e => onUpdateVenueConfig({ max_days: parseInt(e.target.value) || 0 })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Summary & Stats */}
        <div className="space-y-6">
          <section className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/20 rounded-lg">
                <Settings2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold">场地生产力概览</h3>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-indigo-100 text-xs font-medium uppercase tracking-wider mb-1">总场次容量</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black">{capacity}</span>
                  <span className="text-sm font-bold text-indigo-200">场</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                <div>
                  <p className="text-indigo-200 text-[10px] font-medium uppercase tracking-wider mb-1">单日单场容量</p>
                  <p className="text-lg font-bold">{Math.floor(capacity / venueConfig.max_days / venueConfig.court_count)} 场</p>
                </div>
                <div>
                  <p className="text-indigo-200 text-[10px] font-medium uppercase tracking-wider mb-1">总场地数</p>
                  <p className="text-lg font-bold">{venueConfig.court_count} 个</p>
                </div>
              </div>

              <div className="p-4 bg-white/10 rounded-xl border border-white/10">
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-indigo-200 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-indigo-100 leading-relaxed">
                    此容量为基于当前配置的理论最大值。在实际编排中，由于项目交叉、选手兼项等因素，实际可利用率通常在 70%-85% 之间。
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              配置建议
            </h3>
            <ul className="space-y-3">
              {[
                '建议预留 10% 的转场冗余时间以应对突发状况',
                '若比赛天数超过 3 天，请考虑选手体力恢复',
                '场地数量应根据报名人数规模动态调整',
                '单场时长包含热身、正式比赛及比分确认'
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-xs text-slate-500 leading-relaxed">
                  <div className="w-1 h-1 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, 
  Save, 
  AlertCircle,
  Info,
  Clock,
  LayoutGrid
} from 'lucide-react';
import { VenueConfig, ProjectSchedulingConfig, PhaseConfig, PhaseType } from '../types';

interface VenueResourceConfigProps {
  venueConfig: VenueConfig;
  schedulingConfigs: Record<string, ProjectSchedulingConfig>;
  onUpdateVenueConfig: (updates: Partial<VenueConfig>) => void;
  onSave: () => void;
}

export const VenueResourceConfig: React.FC<VenueResourceConfigProps> = ({ 
  venueConfig, 
  schedulingConfigs,
  onUpdateVenueConfig,
  onSave 
}) => {
  const calculatePhaseMatches = (phase: PhaseConfig): number => {
    if (phase.type === PhaseType.ELIMINATION) {
      let matches = Math.max(0, phase.participant_count - 1);
      if (phase.play_third_place) matches += 1;
      return matches;
    } else {
      const groupCount = phase.group_count || 1;
      const n = Math.ceil(phase.participant_count / groupCount);
      const matchesPerGroup = (n * (n - 1)) / 2;
      return matchesPerGroup * groupCount;
    }
  };

  const calculateVenueCapacity = (config: VenueConfig) => {
    const cycleTime = config.match_duration + config.break_duration + config.buffer_duration;
    if (cycleTime <= 0) return 0;
    const matchesPerCourtPerDay = Math.floor((config.max_daily_hours * 60) / cycleTime);
    return matchesPerCourtPerDay * config.court_count * config.max_days;
  };

  const capacity = calculateVenueCapacity(venueConfig);

  let totalOccupied = 0;
  Object.values(schedulingConfigs).forEach((config: ProjectSchedulingConfig) => {
    config.phases.forEach((phase: PhaseConfig) => {
      totalOccupied += calculatePhaseMatches(phase);
    });
  });

  const remaining = capacity - totalOccupied;

  return (
    <div className="w-full">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">场地资源</h2>
              <p className="text-xs text-slate-500 mt-0.5">设置比赛场地的数量、开放时间及比赛节奏，系统将据此计算总容量</p>
            </div>
          </div>
          <button 
            onClick={onSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2 shadow-md shadow-indigo-100"
          >
            <Save className="w-4 h-4" />
            保存配置
          </button>
        </div>

        <div className="p-8">

      {/* Capacity Summary Card - Moved to Top */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 bg-white rounded-3xl p-8 text-slate-900 border border-slate-200 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <MapPin className="w-32 h-32 text-indigo-600" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wider">当前配置下</p>
            <h2 className="text-3xl font-bold text-indigo-600">场次总容量：{capacity} 场</h2>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-300" />
                <span className="text-slate-500 text-xs">已占用: <span className="font-bold text-slate-900">{totalOccupied}</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-300" />
                <span className="text-slate-500 text-xs">
                  {remaining >= 0 ? (
                    <>剩余容量: <span className="font-bold text-emerald-600">{remaining}</span></>
                  ) : (
                    <>容量缺口: <span className="font-bold text-rose-500">{Math.abs(remaining)}</span></>
                  )}
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-[10px] mt-4 max-w-md">
              计算公式：(每天比赛时长 × 60 / (预估时长 + 休息 + 冗余)) × 场地数量 × 比赛天数
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">每场地每天</p>
              <p className="text-xl font-bold text-slate-700">{Math.floor((venueConfig.max_daily_hours * 60) / (venueConfig.match_duration + venueConfig.break_duration + venueConfig.buffer_duration))} 场</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">总场地片数</p>
              <p className="text-xl font-bold text-slate-700">{venueConfig.court_count} 片</p>
            </div>
          </div>
        </div>

        {capacity === 0 && (
          <div className="mt-6 flex items-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100">
            <AlertCircle className="w-4 h-4" />
            <p className="text-xs font-medium">警告：当前配置下的容量为0，请检查参数设置是否合理。</p>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Config */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">场地基础参数</h2>
          </div>
          <div className="p-6 space-y-6">
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
                  onChange={(e) => onUpdateVenueConfig({ court_count: parseInt(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">片</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">最多比赛天数</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="number" 
                  value={venueConfig.max_days}
                  onChange={(e) => onUpdateVenueConfig({ max_days: parseInt(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">天</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">每天最多比赛时长</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="number" 
                  value={venueConfig.max_daily_hours}
                  onChange={(e) => onUpdateVenueConfig({ max_daily_hours: parseInt(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">小时</span>
              </div>
            </div>
          </div>
        </section>

        {/* Rhythm Config */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">比赛节奏设置</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">每场预估时长</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={venueConfig.match_duration}
                  onChange={(e) => onUpdateVenueConfig({ match_duration: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">分钟</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">场间休息时间</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={venueConfig.break_duration}
                  onChange={(e) => onUpdateVenueConfig({ break_duration: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">分钟</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">转场冗余时间</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={venueConfig.buffer_duration}
                  onChange={(e) => onUpdateVenueConfig({ buffer_duration: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">分钟</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-8 p-6 bg-slate-100 rounded-2xl border border-slate-200 flex items-start gap-4">
        <div className="p-2 bg-white rounded-xl shadow-sm">
          <Info className="w-5 h-5 text-slate-400" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-700">配置说明</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            场地资源是赛事编排的基础。系统会根据您设置的场地数量和比赛节奏，自动计算出整个赛事的场次承载能力。
            在“项目编排”页面，您可以实时看到当前已编排的场次是否超过了这一容量限制。
          </p>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};

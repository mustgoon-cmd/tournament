import React, { useState, useEffect } from 'react';
import { motion, Reorder } from 'motion/react';
import { 
  Settings2, 
  GripVertical, 
  Hash, 
  Type, 
  Eye, 
  Save,
  CheckCircle2,
  Info,
  RefreshCw
} from 'lucide-react';

type CodeComponentType = 'project' | 'phase' | 'group' | 'round' | 'sequence';

interface CodeComponent {
  id: CodeComponentType;
  name: string;
  format: string;
  length: number;
}

const DEFAULT_COMPONENTS: CodeComponent[] = [
  { id: 'project', name: '项目', format: 'code', length: 2 },
  { id: 'phase', name: '阶段', format: 'name', length: 1 },
  { id: 'group', name: '分组', format: 'letter', length: 1 },
  { id: 'round', name: '轮次', format: 'default', length: 1 },
  { id: 'sequence', name: '序号', format: 'number', length: 2 },
];

export const MatchCodeConfig: React.FC = () => {
  const [components, setComponents] = useState<CodeComponent[]>(() => {
    const saved = localStorage.getItem('match_code_config');
    return saved ? JSON.parse(saved) : DEFAULT_COMPONENTS;
  });
  const [separator, setSeparator] = useState('-');
  const [example, setExample] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    generateExample();
  }, [components, separator]);

  const getComponentPreview = (comp: CodeComponent) => {
    switch (comp.id) {
      case 'project':
        if (comp.format === 'name') return '男子单打';
        if (comp.format === 'short_name') return '男单';
        return 'MS';
      case 'phase':
        if (comp.format === 'abbreviation') return 'QF';
        if (comp.format === 'elimination_id') return 'R16';
        if (comp.format === 'round_index') return 'R1';
        return '第一阶段';
      case 'group':
        if (comp.format === 'number') return '1';
        if (comp.format === 'number_two_digit') return '01';
        return 'A';
      case 'round':
        return 'R1';
      case 'sequence':
        return '01'.padStart(comp.length, '0');
      default:
        return '';
    }
  };

  const generateExample = () => {
    const parts = components.map(comp => getComponentPreview(comp));
    setExample(parts.join(separator));
  };

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('match_code_config', JSON.stringify(components));
    setTimeout(() => {
      setIsSaving(false);
      alert('比赛代码配置已保存');
    }, 1000);
  };

  const updateComponent = (id: CodeComponentType, updates: Partial<CodeComponent>) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">比赛代码格式配置</h2>
              <p className="text-xs text-slate-500 mt-0.5">自定义比赛编码的组成部分、顺序及展现形式</p>
            </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            保存配置
          </button>
        </div>

        <div className="p-8">

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Configuration Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-slate-400" />
                组成部分与排序
              </h3>
              <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-1 rounded-full uppercase">拖拽可调整顺序</span>
            </div>

            <Reorder.Group axis="y" values={components} onReorder={setComponents} className="space-y-3">
              {components.map((comp) => (
                <Reorder.Item 
                  key={comp.id} 
                  value={comp}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-indigo-300 transition-all cursor-grab active:cursor-grabbing group"
                >
                  <div className="flex items-center gap-4">
                    <GripVertical className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                          {comp.id === 'sequence' ? <Hash className="w-4 h-4" /> : <Type className="w-4 h-4" />}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{comp.name}</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">展现类型</label>
                        <select 
                          disabled={comp.id === 'round' || comp.id === 'sequence'}
                          value={comp.format}
                          onChange={(e) => updateComponent(comp.id, { format: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50"
                        >
                          {comp.id === 'project' && (
                            <>
                              <option value="code">项目代码 (MS)</option>
                              <option value="short_name">项目简称 (男单)</option>
                              <option value="name">项目名称 (男子单打)</option>
                            </>
                          )}
                          {comp.id === 'phase' && (
                            <>
                              <option value="name">阶段名称 (第一阶段)</option>
                              <option value="abbreviation">标准缩写 (QF/SF/F)</option>
                              <option value="elimination_id">淘汰轮标识 (R16/R8)</option>
                              <option value="round_index">轮次序号 (R1/R2)</option>
                            </>
                          )}
                          {comp.id === 'group' && (
                            <>
                              <option value="letter">按字母 (A, B, C...)</option>
                              <option value="number">按数字 (1, 2, 3...)</option>
                              <option value="number_two_digit">按两位数 (01, 02, 03...)</option>
                            </>
                          )}
                          {comp.id === 'round' && <option value="default">默认 (R1-R32)</option>}
                          {comp.id === 'sequence' && <option value="number">数字</option>}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">最小长度</label>
                        <input 
                          type="number" 
                          min="1" 
                          max="5"
                          disabled={comp.id === 'round'}
                          value={comp.length}
                          onChange={(e) => updateComponent(comp.id, { length: parseInt(e.target.value) || 1 })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>

            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-bold text-slate-700">分隔符</label>
                  <input 
                    type="text" 
                    value={separator}
                    onChange={(e) => setSeparator(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="例如: - 或 _"
                  />
                </div>
                <div className="flex-1 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                  <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-700 leading-relaxed">
                    分隔符将用于连接各个组成部分。建议使用短横线或下划线以保证兼容性。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-400" />
              实时预览
            </h3>
            
            <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-all group-hover:bg-indigo-500/20" />
              
              <div className="relative space-y-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Match Code Example</p>
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 flex items-center justify-center">
                    <span className="text-3xl font-mono font-bold text-white tracking-wider">
                      {example}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Structure Breakdown</p>
                  <div className="flex flex-wrap gap-2">
                    {components.map((comp, idx) => (
                      <React.Fragment key={comp.id}>
                        <div className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg flex flex-col items-center gap-0.5">
                          <span className="text-[9px] text-slate-500 font-bold uppercase">{comp.name}</span>
                          <span className="text-xs text-indigo-300 font-mono">{getComponentPreview(comp)}</span>
                        </div>
                        {idx < components.length - 1 && (
                          <div className="flex items-center text-slate-600 font-mono">{separator}</div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-200">配置生效说明</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    保存配置后，系统在生成新的对阵表或场次时将采用此格式。已生成的比赛代码不会自动更新，如需更新请重新生成对阵框架。
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">当前排序</p>
                <p className="text-xs font-bold text-slate-700">{components.map(c => c.name).join(' → ')}</p>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">分隔符</p>
                <p className="text-xs font-bold text-slate-700">"{separator}"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};

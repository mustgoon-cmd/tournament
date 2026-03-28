import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Plus, 
  Trash2, 
  Play, 
  ChevronRight, 
  LayoutGrid, 
  GitBranch, 
  Hash,
  Settings2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Save,
  Zap,
  Download,
  Share2,
  X
} from 'lucide-react';
import { PhaseType, PhaseConfig, ProjectSchedulingConfig, MatchSession, MatchRound, PromotionRule, VenueConfig } from '../types';
import { MOCK_PROJECT_SUMMARY } from '../constants';
import { BracketVisualizer } from './BracketVisualizer';
import { MatchList } from './MatchList';

interface ProjectSchedulingProps {
  onNavigateToAnnouncement?: () => void;
  venueConfig: VenueConfig;
  schedulingConfigs: Record<string, ProjectSchedulingConfig>;
  onUpdateSchedulingConfigs: (configs: Record<string, ProjectSchedulingConfig>) => void;
}

export const ProjectScheduling: React.FC<ProjectSchedulingProps> = ({ 
  onNavigateToAnnouncement,
  venueConfig,
  schedulingConfigs,
  onUpdateSchedulingConfigs
}) => {
  const [establishedProjects] = useState(
    MOCK_PROJECT_SUMMARY.filter(p => p.status === 'ESTABLISHED' || p.establishment_status === '已立项')
  );

  const [projectTypeTab, setProjectTypeTab] = useState<'单项项目' | '团体项目'>('单项项目');
  const filteredProjects = establishedProjects.filter(p => {
    if (projectTypeTab === '单项项目') {
      return p.type === 'single';
    }
    return p.type === 'team';
  });

  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'bracket' | 'list' | 'sub_matches'>('bracket');
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [selectedTie, setSelectedTie] = useState<MatchSession | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);

  // Helper to get group label based on match code config
  const getGroupLabel = (index: number) => {
    const saved = localStorage.getItem('match_code_config');
    const config = saved ? JSON.parse(saved) : null;
    const groupConfig = config?.find((c: any) => c.id === 'group');
    
    if (groupConfig?.format === 'number') return (index + 1).toString();
    if (groupConfig?.format === 'number_two_digit') return (index + 1).toString().padStart(2, '0');
    return String.fromCharCode(65 + index); // Default to letter A, B, C...
  };

  // Reset active phase when project changes
  React.useEffect(() => {
    setActivePhaseIndex(0);
  }, [selectedProject?.id]);

  const getProjectConfig = (projectId: string): ProjectSchedulingConfig => {
    return schedulingConfigs[projectId] || {
      project_id: projectId,
      project_name: establishedProjects.find(p => p.id === projectId)?.name || '',
      project_code: establishedProjects.find(p => p.id === projectId)?.id || '',
      phases: [],
      venue_config: {
        court_count: 8,
        match_duration: 30,
        break_duration: 5,
        buffer_duration: 5,
        max_daily_hours: 8,
        max_days: 2
      }
    };
  };

  const addPhase = (projectId: string) => {
    const config = getProjectConfig(projectId);
    
    // Calculate initial participant count based on previous phase if exists
    let initialCount = establishedProjects.find(p => p.id === projectId)?.current_count || 0;
    if (config.phases.length > 0) {
      const prevPhase = config.phases[config.phases.length - 1];
      if (prevPhase.type === PhaseType.ELIMINATION) {
        initialCount = prevPhase.promotion_count || 1;
      } else {
        initialCount = (prevPhase.group_count || 1) * (prevPhase.promotion_per_group || 1);
      }
    }

    const newPhase: PhaseConfig = {
      id: `phase-${Date.now()}`,
      name: `第${config.phases.length + 1}阶段`,
      type: PhaseType.ELIMINATION,
      order: config.phases.length + 1,
      participant_count: initialCount,
      promotion_count: 1,
      group_count: 1,
      promotion_per_group: 2,
      grouping_strategy: '1号固定逆时针轮转法',
      group_match_format: '单循环',
      enable_promotion_path: false,
      ranking_rules: ['胜场数', '胜负关系', '净胜局', '总得分'],
      seed_count: 0,
      play_third_place: false,
      decide_top_n: 1,
      promotion_rules: [],
      progression_rule: {
        mode: 'group_ranking'
      },
      placement_rule: {
        strategy: 'serpentine',
        avoid_same_group: true,
        mapping_relations: []
      },
      match_win_loss_rule: '3局2胜',
      team_match_rule: '5场3胜',
      sub_match_rules: {}
    };
    
    const newConfig = {
      ...config,
      phases: [...config.phases, newPhase]
    };
    
    onUpdateSchedulingConfigs({
      ...schedulingConfigs,
      [projectId]: newConfig
    });
  };

  const removePhase = (projectId: string, phaseId: string) => {
    const config = getProjectConfig(projectId);
    const newConfig = {
      ...config,
      phases: config.phases.filter(p => p.id !== phaseId)
    };
    
    onUpdateSchedulingConfigs({
      ...schedulingConfigs,
      [projectId]: newConfig
    });
  };

  const updatePhase = (projectId: string, phaseId: string, updates: Partial<PhaseConfig>) => {
    const config = getProjectConfig(projectId);
    const newPhases = config.phases.map(p => p.id === phaseId ? { ...p, ...updates } : p);
    
    // Auto-update subsequent phases' participant counts
    for (let i = 1; i < newPhases.length; i++) {
      const prevPhase = newPhases[i - 1];
      if (prevPhase.type === PhaseType.ELIMINATION) {
        newPhases[i].participant_count = prevPhase.promotion_count || 1;
      } else {
        newPhases[i].participant_count = (prevPhase.group_count || 1) * (prevPhase.promotion_per_group || 1);
      }
    }
    
    const newConfig = {
      ...config,
      phases: newPhases
    };
    
    onUpdateSchedulingConfigs({
      ...schedulingConfigs,
      [projectId]: newConfig
    });
  };

  const updateProjectConfig = (projectId: string, updates: Partial<ProjectSchedulingConfig>) => {
    const config = getProjectConfig(projectId);
    onUpdateSchedulingConfigs({
      ...schedulingConfigs,
      [projectId]: { ...config, ...updates }
    });
  };

  const calculateVenueCapacity = (config: VenueConfig): number => {
    const cycleTime = config.match_duration + config.break_duration + config.buffer_duration;
    if (cycleTime <= 0) return 0;
    const matchesPerCourtPerDay = Math.floor((config.max_daily_hours * 60) / cycleTime);
    return matchesPerCourtPerDay * config.court_count * config.max_days;
  };

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

  const addPromotionRule = (projectId: string, phaseId: string) => {
    const config = getProjectConfig(projectId);
    const phase = config.phases.find(p => p.id === phaseId);
    if (!phase) return;

    const newRule: PromotionRule = {
      from_group: 1,
      from_rank: 1,
      to_position: 1
    };

    updatePhase(projectId, phaseId, {
      promotion_rules: [...(phase.promotion_rules || []), newRule]
    });
  };

  const updatePromotionRule = (projectId: string, phaseId: string, ruleIndex: number, updates: Partial<PromotionRule>) => {
    const config = getProjectConfig(projectId);
    const phase = config.phases.find(p => p.id === phaseId);
    if (!phase || !phase.promotion_rules) return;

    const newRules = [...phase.promotion_rules];
    newRules[ruleIndex] = { ...newRules[ruleIndex], ...updates };

    updatePhase(projectId, phaseId, {
      promotion_rules: newRules
    });
  };

  const removePromotionRule = (projectId: string, phaseId: string, ruleIndex: number) => {
    const config = getProjectConfig(projectId);
    const phase = config.phases.find(p => p.id === phaseId);
    if (!phase || !phase.promotion_rules) return;

    updatePhase(projectId, phaseId, {
      promotion_rules: phase.promotion_rules.filter((_, i) => i !== ruleIndex)
    });
  };

  const generateFrameworkForConfig = (config: ProjectSchedulingConfig): ProjectSchedulingConfig => {
    if (config.phases.length === 0) {
      return { ...config, generated_framework: undefined };
    }

    const rounds: MatchRound[] = [];
    let totalMatches = 0;
    const prefix = config.project_code;
    const project = establishedProjects.find(p => p.id === config.project_id);
    const isTeamProject = project?.type === 'team';
    const teamEvents = project?.team_events || [];

    config.phases.forEach((phase, pIdx) => {
      const groupCount = phase.group_count || 1;
      const phaseCode = phase.type === PhaseType.ELIMINATION ? 'K' : 'G';
      const prevPhase = pIdx > 0 ? config.phases[pIdx - 1] : null;
      
      if (phase.type === PhaseType.ELIMINATION) {
        // Calculate power of 2 bracket
        const bracketSize = Math.pow(2, Math.ceil(Math.log2(phase.participant_count)));
        const byes = bracketSize - phase.participant_count;
        
        let currentParticipants = bracketSize;
        let roundIndex = 1;
        
        while (currentParticipants > 1) {
          const matchCount = currentParticipants / 2;
          const matches: MatchSession[] = [];
          const roundName = matchCount === 1 ? '决赛' : 
                           matchCount === 2 ? '半决赛' :
                           matchCount === 4 ? '1/4决赛' :
                           matchCount === 8 ? '1/8决赛' :
                           matchCount === 16 ? '1/16决赛' :
                           `第${roundIndex}轮`;
          
          for (let i = 0; i < matchCount; i++) {
            const matchIndex = i + 1;
            const roundCode = matchCount === 1 ? 'F' : `R${roundIndex}`;
            const matchCode = `${prefix}-${phaseCode}-${roundCode}-${String(matchIndex).padStart(2, '0')}`;
            
            // In round 1, assign byes and promotion paths if available
            const isBye = roundIndex === 1 && i < byes;
            
            let participantA = undefined;
            let participantB = isBye ? '轮空' : undefined;

            // Try to map from previous phase promotion rules
            if (roundIndex === 1 && prevPhase) {
              const posA = i * 2 + 1;
              const posB = i * 2 + 2;
              
              // If fixed mapping is used
              if (prevPhase.placement_rule?.strategy === 'fixed' && prevPhase.promotion_rules) {
                const ruleA = prevPhase.promotion_rules.find(r => r.to_position === posA);
                const ruleB = prevPhase.promotion_rules.find(r => r.to_position === posB);
                
                if (ruleA) {
                  const groupLabel = prevPhase.group_count && prevPhase.group_count > 1 
                    ? `${getGroupLabel(ruleA.from_group - 1)}组` 
                    : '循环赛';
                  participantA = `${groupLabel}第${ruleA.from_rank}名`;
                }
                
                if (ruleB && !isBye) {
                  const groupLabel = prevPhase.group_count && prevPhase.group_count > 1 
                    ? `${getGroupLabel(ruleB.from_group - 1)}组` 
                    : '循环赛';
                  participantB = `${groupLabel}第${ruleB.from_rank}名`;
                }
              } else if (prevPhase.placement_rule?.strategy === 'serpentine') {
                // Descriptive labels for serpentine
                participantA = `落位位次 ${posA}`;
                if (!isBye) participantB = `落位位次 ${posB}`;
              } else if (prevPhase.placement_rule?.strategy === 'cross_group') {
                participantA = `交叉对阵位 ${posA}`;
                if (!isBye) participantB = `交叉对阵位 ${posB}`;
              } else {
                participantA = `晋级选手 ${posA}`;
                if (!isBye) participantB = `晋级选手 ${posB}`;
              }
            }
            
            const matchId = `match-${matchCode}`;
            const subMatches = isTeamProject ? teamEvents.map((te, teIdx) => ({
              id: `${matchId}-sub-${teIdx}`,
              tie_id: matchId,
              sub_event_id: te.id,
              sub_event_name: te.match_format_rule?.value || '未知单项',
              status: 'PENDING' as const,
              order: teIdx + 1
            })) : undefined;

            matches.push({
              id: matchId,
              code: matchCode,
              project_id: config.project_id,
              project_name: config.project_name,
              phase_id: phase.id,
              phase_name: phase.name,
              phase_type: phase.type,
              round_index: roundIndex,
              round_name: roundName,
              match_index: matchIndex,
              status: isBye ? 'COMPLETED' : 'PENDING',
              is_bye: isBye,
              participant_a: participantA,
              participant_b: participantB,
              winner: isBye ? 'participant_a' : undefined,
              sub_matches: subMatches
            });
            totalMatches++;
          }
          
          rounds.push({
            phase_id: phase.id,
            round_index: roundIndex,
            name: `${phase.name} - ${roundName}`,
            matches
          });
          
          currentParticipants = matchCount;
          roundIndex++;
        }
        
        // Third place match
        if (phase.play_third_place) {
          const roundName = '季军赛';
          const matchCode = `${prefix}-${phaseCode}-3RD-01`;
          const matchId = `match-${matchCode}`;
          const subMatches = isTeamProject ? teamEvents.map((te, teIdx) => ({
            id: `${matchId}-sub-${teIdx}`,
            tie_id: matchId,
            sub_event_id: te.id,
            sub_event_name: te.match_format_rule?.value || '未知单项',
            status: 'PENDING' as const,
            order: teIdx + 1
          })) : undefined;

          rounds.push({
            phase_id: phase.id,
            round_index: roundIndex,
            name: `${phase.name} - ${roundName}`,
            matches: [{
              id: matchId,
              code: matchCode,
              project_id: config.project_id,
              project_name: config.project_name,
              phase_id: phase.id,
              phase_name: phase.name,
              phase_type: phase.type,
              round_index: roundIndex,
              round_name: roundName,
              match_index: 1,
              status: 'PENDING',
              participant_a: '半决赛负者1',
              participant_b: '半决赛负者2',
              sub_matches: subMatches
            }]
          });
          totalMatches++;
        }
      } else if (phase.type === PhaseType.ROUND_ROBIN || phase.type === PhaseType.GROUP_ROUND_ROBIN) {
        for (let g = 0; g < groupCount; g++) {
          const groupLabel = getGroupLabel(g);
          const groupName = groupCount > 1 ? `第${groupLabel}组` : '';
          const participantsInGroup = Math.ceil(phase.participant_count / groupCount);
          const matchCount = (participantsInGroup * (participantsInGroup - 1)) / 2;
          const matches: MatchSession[] = [];
          const roundName = '循环赛';
          
          for (let i = 0; i < matchCount; i++) {
            const matchIndex = i + 1;
            const groupStr = groupCount > 1 ? `-${groupLabel}` : '';
            const matchCode = `${prefix}-${phaseCode}${groupStr}-R1-${String(matchIndex).padStart(2, '0')}`;
            const matchId = `match-${matchCode}`;
            const subMatches = isTeamProject ? teamEvents.map((te, teIdx) => ({
              id: `${matchId}-sub-${teIdx}`,
              tie_id: matchId,
              sub_event_id: te.id,
              sub_event_name: te.match_format_rule?.value || '未知单项',
              status: 'PENDING' as const,
              order: teIdx + 1
            })) : undefined;

            matches.push({
              id: matchId,
              code: matchCode,
              project_id: config.project_id,
              project_name: config.project_name,
              phase_id: phase.id,
              phase_name: phase.name,
              phase_type: phase.type,
              round_index: 1,
              round_name: roundName,
              match_index: matchIndex,
              status: 'PENDING',
              sub_matches: subMatches
            });
            totalMatches++;
          }
          
          if (matches.length > 0) {
            rounds.push({
              phase_id: phase.id,
              round_index: 1,
              name: `${phase.name} ${groupName} - ${roundName}`,
              matches
            });
          }
        }
      }
    });

    return {
      ...config,
      generated_framework: {
        rounds,
        total_matches: totalMatches
      }
    };
  };

  const handleSaveConfig = () => {
    if (!selectedProject) return;
    const config = getProjectConfig(selectedProject.id);
    
    // In a real app, this would be an API call
    console.log('Saving config:', config);
    
    // Simulate persistence
    const savedConfigs = JSON.parse(localStorage.getItem('scheduling_configs') || '{}');
    savedConfigs[selectedProject.id] = config;
    localStorage.setItem('scheduling_configs', JSON.stringify(savedConfigs));
    
    alert(`项目 [${selectedProject.name}] 的编排配置已保存成功！`);
  };

  const handleResetConfig = () => {
    if (!selectedProject) return;
    if (window.confirm(`确定要重置 [${selectedProject.name}] 的编排配置吗？此操作不可撤销。`)) {
      const newConfigs = { ...schedulingConfigs };
      delete newConfigs[selectedProject.id];
      onUpdateSchedulingConfigs(newConfigs);
      setActivePhaseIndex(0);
    }
  };

  const handleGenerateFramework = () => {
    if (!selectedProject) return;
    const config = getProjectConfig(selectedProject.id);
    
    if (config.phases.length === 0) {
      alert('请先添加比赛阶段');
      return;
    }

    const newConfig = generateFrameworkForConfig(config);
    onUpdateSchedulingConfigs({
      ...schedulingConfigs,
      [selectedProject.id]: newConfig
    });
    
    alert(`已成功生成 [${selectedProject.name}] 的对阵框架，共计 ${newConfig.generated_framework?.total_matches} 场比赛。`);
  };

  const generateFramework = (projectId: string) => {
    const config = getProjectConfig(projectId);
    onUpdateSchedulingConfigs({
      ...schedulingConfigs,
      [projectId]: generateFrameworkForConfig(config)
    });
    alert('对阵表及场次信息已更新！');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Header Section */}
      <div className="px-8 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">项目编排管理</h2>
            <p className="text-xs text-slate-500 mt-1">配置比赛阶段、生成对阵框架及场次信息</p>
          </div>
          <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <AlertCircle className="w-4 h-4 text-indigo-500" />
              只有已立项的项目可以编排对阵
            </div>
            <button 
              onClick={onNavigateToAnnouncement}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all flex items-center gap-1"
            >
              前往立项 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                isPreviewMode 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              {isPreviewMode ? '退出预览' : '方案预览'}
            </button>
            <button 
              onClick={() => setShowFinalizeConfirm(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
            >
              <CheckCircle2 className="w-4 h-4" />
              编排定稿
            </button>
          </div>
          {(() => {
            const capacity = calculateVenueCapacity(venueConfig);
            let totalOccupied = 0;
            Object.values(schedulingConfigs).forEach((config: ProjectSchedulingConfig) => {
              config.phases.forEach((phase: PhaseConfig) => {
                totalOccupied += calculatePhaseMatches(phase);
              });
            });
            const remaining = capacity - totalOccupied;
            return (
              <p className="text-[10px] text-slate-500 font-medium">
                场地总容量: <span className="text-slate-900 font-bold">{capacity}</span> | 
                当前已占用: <span className="text-indigo-600 font-bold">{totalOccupied}</span> | 
                {remaining >= 0 ? (
                  <>剩余: <span className="text-emerald-600 font-bold">{remaining}</span></>
                ) : (
                  <>缺口: <span className="text-rose-600 font-bold">{Math.abs(remaining)}</span></>
                )}
              </p>
            );
          })()}
        </div>
      </div>

      {/* 4 Columns Layout */}
      <div className="flex-1 flex overflow-x-auto overflow-y-hidden">
        {isPreviewMode ? (
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">项目编排总方案预览</h3>
                  <p className="text-slate-500 mt-1">查看所有已配置项目的编排详情及场次统计</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">已配置项目</div>
                      <div className="text-xl font-black text-slate-900">
                        {(Object.values(schedulingConfigs) as ProjectSchedulingConfig[]).filter(c => c.phases.length > 0).length}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Hash className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">总场次</div>
                      <div className="text-xl font-black text-slate-900">
                        {(Object.values(schedulingConfigs) as ProjectSchedulingConfig[]).reduce((acc, c) => acc + (c.generated_framework?.total_matches || 0), 0)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(Object.values(schedulingConfigs) as ProjectSchedulingConfig[]).filter(c => c.phases.length > 0).map(config => (
                  <div key={config.project_id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">
                          {establishedProjects.find(p => p.id === config.project_id)?.type === 'single' ? '单项' : '团体'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 font-mono">{config.project_code}</span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-900">{config.project_name}</h4>
                    </div>
                    <div className="p-6 flex-1 space-y-4">
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">比赛阶段</div>
                        <div className="space-y-2">
                          {config.phases.map((phase, idx) => (
                            <div key={phase.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                  {idx + 1}
                                </div>
                                <span className="font-medium text-slate-700">{phase.name}</span>
                              </div>
                              <span className="text-xs text-slate-400">{phase.type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">总场次</div>
                          <div className="text-lg font-black text-indigo-600">{config.generated_framework?.total_matches || 0}</div>
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedProject(establishedProjects.find(p => p.id === config.project_id));
                            setIsPreviewMode(false);
                          }}
                          className="text-xs font-bold text-indigo-600 hover:underline"
                        >
                          查看详情
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {((Object.values(schedulingConfigs) as ProjectSchedulingConfig[]).filter(c => c.phases.length > 0).length === 0) && (
                <div className="py-20 text-center space-y-4">
                  <LayoutGrid className="w-16 h-16 text-slate-200 mx-auto" />
                  <p className="text-slate-400 font-medium">暂无已配置的编排方案</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Column 1: 已立项项目 */}
        <div className="w-72 shrink-0 border-r border-slate-200 bg-white flex flex-col">
          <div className="p-2 border-b border-slate-100 flex gap-1 bg-slate-50/50 shrink-0">
            <button
              onClick={() => { setProjectTypeTab('单项项目'); setSelectedProject(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${projectTypeTab === '单项项目' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              单项项目
            </button>
            <button
              onClick={() => { setProjectTypeTab('团体项目'); setSelectedProject(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${projectTypeTab === '团体项目' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              团体项目
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredProjects.map(p => {
              const config = schedulingConfigs[p.id];
              const isConfigured = config && config.phases.length > 0;
              const isGenerated = config && config.generated_framework;

              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all group relative overflow-hidden ${
                    selectedProject?.id === p.id 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/30'
                  }`}
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Trophy className={`w-3.5 h-3.5 ${selectedProject?.id === p.id ? 'text-indigo-200' : 'text-indigo-600'}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedProject?.id === p.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {p.type}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm">{p.name}</h4>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${selectedProject?.id === p.id ? 'translate-x-1 text-white' : 'text-slate-300 group-hover:translate-x-1'}`} />
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                      isConfigured 
                        ? (selectedProject?.id === p.id ? 'bg-white/20 border-white/30 text-white' : 'bg-emerald-50 border-emerald-100 text-emerald-600')
                        : (selectedProject?.id === p.id ? 'bg-white/10 border-white/20 text-white/60' : 'bg-slate-50 border-slate-100 text-slate-400')
                    }`}>
                      <Settings2 className="w-2.5 h-2.5" />
                      {isConfigured ? '已配置' : '未配置'}
                    </div>
                    {isGenerated && (
                      <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                        selectedProject?.id === p.id ? 'bg-white/20 border-white/30 text-white' : 'bg-blue-50 border-blue-100 text-blue-600'
                      }`}>
                        <GitBranch className="w-2.5 h-2.5" />
                        已生成
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
            {filteredProjects.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs">
                暂无{projectTypeTab}
              </div>
            )}
          </div>
        </div>

        {/* Column 2: 项目编排 (Phase Config) */}
        <div className="w-[420px] shrink-0 border-r border-slate-200 bg-slate-50 flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-indigo-600" />
              项目编排
            </h3>
            <div className="flex items-center gap-2">
              {selectedProject && (
                <>
                  <button 
                    onClick={handleSaveConfig}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    title="保存配置"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleGenerateFramework}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    生成对阵表
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {!selectedProject ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                <LayoutGrid className="w-12 h-12 text-slate-300" />
                <p className="text-sm font-bold text-slate-500">请选择一个项目</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">比赛阶段配置</span>
                  <button 
                    onClick={() => addPhase(selectedProject.id)}
                    className="flex items-center gap-1 px-2 py-1 text-indigo-600 hover:bg-indigo-50 rounded text-[10px] font-bold transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    添加阶段
                  </button>
                </div>
                {getProjectConfig(selectedProject.id).phases.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-white border border-slate-200 flex items-center justify-center text-slate-300 shadow-sm">
                      <LayoutGrid className="w-8 h-8" />
                    </div>
                    <div className="max-w-xs">
                      <p className="text-sm font-bold text-slate-900">暂未配置比赛阶段</p>
                      <p className="text-xs text-slate-500 mt-1">点击右上角按钮开始为该项目配置比赛阶段</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {getProjectConfig(selectedProject.id).phases.map((phase, index) => (
                      <div key={phase.id} className="relative p-5 bg-white rounded-2xl border border-slate-200 shadow-sm group">
                        <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                          {index + 1}
                        </div>
                        <input 
                          type="text" 
                          value={phase.name}
                          onChange={(e) => updatePhase(selectedProject.id, phase.id, { name: e.target.value })}
                          className="bg-transparent border-none p-0 text-sm font-bold text-slate-900 focus:ring-0 w-24"
                          placeholder="阶段名称"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <select 
                          value={phase.type}
                          onChange={(e) => updatePhase(selectedProject.id, phase.id, { type: e.target.value as PhaseType })}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-indigo-600 uppercase tracking-wider focus:ring-0 cursor-pointer"
                        >
                          {Object.values(PhaseType).map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => removePhase(selectedProject.id, phase.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {phase.type === PhaseType.ELIMINATION ? (
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">参赛人数</label>
                          <div className="relative">
                            <Hash className="w-3 h-3 text-slate-300 absolute left-2 top-1/2 -translate-y-1/2" />
                            <input 
                              type="number" 
                              value={phase.participant_count}
                              onChange={(e) => updatePhase(selectedProject.id, phase.id, { participant_count: parseInt(e.target.value) || 0 })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">种子数</label>
                          <div className="relative">
                            <Hash className="w-3 h-3 text-slate-300 absolute left-2 top-1/2 -translate-y-1/2" />
                            <input 
                              type="number" 
                              value={phase.seed_count || 0}
                              onChange={(e) => updatePhase(selectedProject.id, phase.id, { seed_count: parseInt(e.target.value) || 0 })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">晋级人数</label>
                          <div className="relative">
                            <ArrowRight className="w-3 h-3 text-emerald-400 absolute left-2 top-1/2 -translate-y-1/2" />
                            <input 
                              type="number" 
                              value={phase.promotion_count}
                              onChange={(e) => updatePhase(selectedProject.id, phase.id, { promotion_count: parseInt(e.target.value) || 0 })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-emerald-600 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          </div>
                        </div>
                        <div className="space-y-1 flex items-end">
                          <label className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer w-full h-[34px]">
                            <input 
                              type="checkbox" 
                              checked={phase.play_third_place || false}
                              onChange={(e) => updatePhase(selectedProject.id, phase.id, { play_third_place: e.target.checked })}
                              className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 ml-1"
                            />
                            <span className="text-xs font-bold text-slate-700">附加赛(决出3、4名)</span>
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">参赛人数</label>
                          <div className="relative">
                            <Hash className="w-3 h-3 text-slate-300 absolute left-2 top-1/2 -translate-y-1/2" />
                            <input 
                              type="number" 
                              value={phase.participant_count}
                              onChange={(e) => updatePhase(selectedProject.id, phase.id, { participant_count: parseInt(e.target.value) || 0 })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">分组数量</label>
                          <div className="relative">
                            <Hash className="w-3 h-3 text-slate-300 absolute left-2 top-1/2 -translate-y-1/2" />
                            <input 
                              type="number" 
                              value={phase.group_count || 1}
                              onChange={(e) => updatePhase(selectedProject.id, phase.id, { group_count: parseInt(e.target.value) || 1 })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">每组晋级人数</label>
                          <div className="relative">
                            <ArrowRight className="w-3 h-3 text-emerald-400 absolute left-2 top-1/2 -translate-y-1/2" />
                            <input 
                              type="number" 
                              value={phase.promotion_per_group || 1}
                              onChange={(e) => updatePhase(selectedProject.id, phase.id, { promotion_per_group: parseInt(e.target.value) || 1 })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-emerald-600 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">组内赛制</label>
                          <select 
                            value={phase.group_match_format || '单循环'}
                            onChange={(e) => updatePhase(selectedProject.id, phase.id, { group_match_format: e.target.value as any })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="单循环">单循环</option>
                            <option value="双循环">双循环</option>
                          </select>
                        </div>
                        <div className="space-y-1 col-span-2">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">分组策略</label>
                          <select 
                            value={phase.grouping_strategy || '1号固定逆时针轮转法'}
                            onChange={(e) => updatePhase(selectedProject.id, phase.id, { grouping_strategy: e.target.value as any })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="1号固定逆时针轮转法">1号固定逆时针轮转法</option>
                            <option value="蛇形排列法">蛇形排列法</option>
                            <option value="随机抽签">随机抽签</option>
                          </select>
                        </div>
                        <div className="space-y-2 col-span-2 mt-2">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">排序规则配置 (拖拽调整优先级)</label>
                          <div className="flex flex-wrap gap-2">
                            {(phase.ranking_rules || ['胜场数', '胜负关系', '净胜局', '总得分']).map((rule, idx, arr) => (
                              <div
                                key={rule}
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('text/plain', idx.toString());
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const sourceIdx = parseInt(e.dataTransfer.getData('text/plain'));
                                  if (sourceIdx === idx) return;
                                  const newRules = [...arr];
                                  const [draggedItem] = newRules.splice(sourceIdx, 1);
                                  newRules.splice(idx, 0, draggedItem);
                                  updatePhase(selectedProject.id, phase.id, { ranking_rules: newRules });
                                }}
                                className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 cursor-move hover:border-indigo-300 transition-colors"
                              >
                                <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500 shrink-0">
                                  {idx + 1}
                                </div>
                                <span className="text-xs font-bold text-slate-700">{rule}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Match Rules Section */}
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">比赛胜负规则</span>
                      </div>

                      {selectedProject.type === 'single' ? (
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">单项胜负规则</label>
                          <select 
                            value={phase.match_win_loss_rule || '3局2胜'}
                            onChange={(e) => updatePhase(selectedProject.id, phase.id, { match_win_loss_rule: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="1局1胜">1局1胜</option>
                            <option value="3局2胜">3局2胜</option>
                            <option value="5局3胜">5局3胜</option>
                          </select>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">团体对抗规则</label>
                            <select 
                              value={phase.team_match_rule || '5场3胜'}
                              onChange={(e) => updatePhase(selectedProject.id, phase.id, { team_match_rule: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="3场2胜">3场2胜</option>
                              <option value="5场3胜">5场3胜</option>
                              <option value="7场4胜">7场4胜</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">团体单项规则配置</label>
                            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              {(selectedProject.team_events || []).map((te: any) => (
                                <div key={te.id} className="flex items-center justify-between gap-4">
                                  <span className="text-xs font-bold text-slate-600 shrink-0">
                                    {te.match_format_rule?.value || '未知单项'}
                                  </span>
                                  <select 
                                    value={phase.sub_match_rules?.[te.id] || '3局2胜'}
                                    onChange={(e) => {
                                      const newSubRules = { ...(phase.sub_match_rules || {}) };
                                      newSubRules[te.id] = e.target.value;
                                      updatePhase(selectedProject.id, phase.id, { sub_match_rules: newSubRules });
                                    }}
                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                  >
                                    <option value="1局1胜">1局1胜</option>
                                    <option value="3局2胜">3局2胜</option>
                                    <option value="5局3胜">5局3胜</option>
                                  </select>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Progression & Placement Logic Section */}
                    {index < getProjectConfig(selectedProject.id).phases.length - 1 && (
                      <div className="pt-4 border-t border-slate-100 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">晋级与落位逻辑 (至下一阶段)</span>
                        </div>

                        {/* Progression Rules */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">晋级规则 (筛选方式)</label>
                          </div>
                          <select 
                            value={phase.progression_rule?.mode || 'group_ranking'}
                            onChange={(e) => updatePhase(selectedProject.id, phase.id, { 
                              progression_rule: { ...phase.progression_rule, mode: e.target.value as any } 
                            })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="group_ranking">按组内排名晋级</option>
                            <option value="cross_group_ranking">跨组综合排名晋级</option>
                            <option value="hybrid">混合补位模式</option>
                            <option value="playoff">附加赛晋级</option>
                          </select>
                        </div>

                        {/* Placement Rules */}
                        <div className="space-y-4">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">落位规则 (签表分布)</label>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <span className="text-[9px] text-slate-400 block">落位策略</span>
                              <select 
                                value={phase.placement_rule?.strategy || 'serpentine'}
                                onChange={(e) => updatePhase(selectedProject.id, phase.id, { 
                                  placement_rule: { ...phase.placement_rule, strategy: e.target.value as any } 
                                })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                              >
                                <option value="serpentine">蛇形分布</option>
                                <option value="cross_group">小组交叉对阵</option>
                                <option value="fixed">固定映射</option>
                                <option value="random">随机抽签</option>
                                <option value="seed_protection">种子保护</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] text-slate-400 block">分区规则</span>
                              <select 
                                value={phase.placement_rule?.division_rule || 'none'}
                                onChange={(e) => updatePhase(selectedProject.id, phase.id, { 
                                  placement_rule: { ...phase.placement_rule, division_rule: e.target.value } 
                                })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                              >
                                <option value="none">无分区</option>
                                <option value="half">上下半区避开</option>
                                <option value="quarter">四个区避开</option>
                                <option value="region">按地区避开</option>
                                <option value="club">按俱乐部避开</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={phase.placement_rule?.avoid_same_group || false}
                                onChange={(e) => updatePhase(selectedProject.id, phase.id, { 
                                  placement_rule: { ...phase.placement_rule, avoid_same_group: e.target.checked } 
                                })}
                                className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                              />
                              <span className="text-[10px] font-bold text-slate-600">避免同组提前相遇</span>
                            </label>
                          </div>

                          {/* Mapping Relations (Only for Fixed Mapping) */}
                          {phase.placement_rule?.strategy === 'fixed' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">具体映射关系</span>
                                <button 
                                  onClick={() => addPromotionRule(selectedProject.id, phase.id)}
                                  className="text-[9px] font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-0.5 rounded transition-colors"
                                >
                                  + 添加映射
                                </button>
                              </div>
                              <div className="space-y-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                {phase.promotion_rules?.length === 0 && (
                                  <div className="text-center py-2 text-[10px] text-slate-400">
                                    暂无映射规则
                                  </div>
                                )}
                                {phase.promotion_rules?.map((rule, rIdx) => (
                                  <div key={rIdx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                                    <div className="flex-1 grid grid-cols-3 gap-2">
                                      <div className="space-y-1">
                                        <span className="text-[9px] text-slate-400 block">来源组</span>
                                        <select
                                          value={rule.from_group}
                                          onChange={(e) => updatePromotionRule(selectedProject.id, phase.id, rIdx, { from_group: parseInt(e.target.value) || 1 })}
                                          className="w-full bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-[10px] font-bold"
                                        >
                                          {Array.from({ length: phase.group_count || 1 }).map((_, i) => (
                                            <option key={i} value={i + 1}>
                                              小组 {getGroupLabel(i)}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      <div className="space-y-1">
                                        <span className="text-[9px] text-slate-400 block">组名次</span>
                                        <input 
                                          type="number" 
                                          value={rule.from_rank}
                                          onChange={(e) => updatePromotionRule(selectedProject.id, phase.id, rIdx, { from_rank: parseInt(e.target.value) || 1 })}
                                          className="w-full bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-[10px] font-bold"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <span className="text-[9px] text-indigo-400 block">下段位</span>
                                        <input 
                                          type="number" 
                                          value={rule.to_position}
                                          onChange={(e) => updatePromotionRule(selectedProject.id, phase.id, rIdx, { to_position: parseInt(e.target.value) || 1 })}
                                          className="w-full bg-indigo-50 border border-indigo-100 rounded px-1 py-0.5 text-[10px] font-bold text-indigo-600"
                                        />
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => removePromotionRule(selectedProject.id, phase.id, rIdx)}
                                      className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            </div>
          )}
          </div>
        </div>

        {/* Column 3: 赛程安排 (Schedule) */}
        <div className="flex-1 min-w-[500px] shrink-0 border-r border-slate-200 bg-slate-50 flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-emerald-600" />
                赛程安排
              </h3>
              {selectedProject && getProjectConfig(selectedProject.id).generated_framework && (
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab('bracket')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                      activeTab === 'bracket' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {selectedProject?.type === 'team' ? '团体对阵图' : '对阵图'}
                  </button>
                  <button
                    onClick={() => setActiveTab('list')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                      activeTab === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {selectedProject?.type === 'team' ? '团体对阵(Tie)表' : '场次列表'}
                  </button>
                  {selectedProject?.type === 'team' && (
                    <button
                      onClick={() => setActiveTab('sub_matches')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                        activeTab === 'sub_matches' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      单项对阵(所有单项)
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedProject && getProjectConfig(selectedProject.id).generated_framework && (
                <>
                  <button 
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    title="导出赛程"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    发布赛程
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {!selectedProject || !getProjectConfig(selectedProject.id).generated_framework ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                <GitBranch className="w-12 h-12 text-slate-300" />
                <p className="text-sm font-bold text-slate-500">暂无赛程数据</p>
                <p className="text-xs text-slate-400">请先配置项目编排并生成对阵表</p>
              </div>
            ) : (
              <div className="space-y-8">
                {(() => {
                  const currentPhases = getProjectConfig(selectedProject.id).phases;
                  const safeActivePhaseIndex = Math.min(activePhaseIndex, Math.max(0, currentPhases.length - 1));
                  const activePhase = currentPhases[safeActivePhaseIndex];
                  
                  if (!activePhase) return null;
                  
                  const rounds = getProjectConfig(selectedProject.id).generated_framework?.rounds.filter(r => r.phase_id === activePhase.id) || [];
                  
                  return (
                    <div className="space-y-6">
                      {/* Stepper for Phases */}
                      {currentPhases.length > 1 && (
                        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                          {currentPhases.map((phase, idx) => (
                            <React.Fragment key={phase.id}>
                              <button
                                onClick={() => setActivePhaseIndex(idx)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                                  safeActivePhaseIndex === idx 
                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' 
                                    : 'bg-white text-slate-500 border border-slate-200 hover:border-emerald-300 hover:text-emerald-600'
                                }`}
                              >
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                                  safeActivePhaseIndex === idx ? 'bg-white/20' : 'bg-slate-100 text-slate-400'
                                }`}>
                                  {idx + 1}
                                </span>
                                {phase.name}
                              </button>
                              {idx < currentPhases.length - 1 && (
                                <div className="w-8 h-px bg-slate-200 shrink-0" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                      
                      {activeTab === 'bracket' ? (
                        rounds.length > 0 ? (
                          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-x-auto min-h-[600px]">
                            <BracketVisualizer 
                              phase={activePhase} 
                              rounds={rounds} 
                              previousPhase={safeActivePhaseIndex > 0 ? currentPhases[safeActivePhaseIndex - 1] : undefined}
                              onMatchClick={(match) => {
                                if (selectedProject?.type === 'team') {
                                  setSelectedTie(match);
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <div className="text-center py-8 text-slate-500">
                            该阶段暂无对阵数据
                          </div>
                        )
                      ) : activeTab === 'list' ? (
                        <MatchList 
                          phases={currentPhases} 
                          rounds={rounds} 
                          onMatchClick={(match) => {
                            if (selectedProject?.type === 'team') {
                              setSelectedTie(match);
                            }
                          }}
                        />
                      ) : (
                        <div className="space-y-6">
                          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">场次代码</th>
                                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">团体场次</th>
                                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">单项名称</th>
                                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">状态</th>
                                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">操作</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {rounds.flatMap(r => r.matches).flatMap(m => m.sub_matches || []).map(sm => (
                                  <tr key={sm.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-xs font-mono text-slate-600">{sm.id.replace('match-', '')}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-indigo-600">{sm.tie_id.replace('match-', '')}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{sm.sub_event_name}</td>
                                    <td className="px-6 py-4">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                                        sm.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        sm.status === 'ONGOING' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        'bg-slate-50 text-slate-500 border-slate-200'
                                      }`}>
                                        {sm.status === 'COMPLETED' ? '已结束' : sm.status === 'ONGOING' ? '进行中' : '待开始'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <button className="text-indigo-600 hover:text-indigo-700 text-[10px] font-bold bg-indigo-50 px-3 py-1.5 rounded-lg transition-all">
                                        录分
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
          </>
        )}
      </div>
      {/* Finalize Confirmation Modal */}
      <AnimatePresence>
        {showFinalizeConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFinalizeConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-10 h-10 text-amber-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900">确认编排定稿？</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    方案定稿后将生成具体的比赛场次，该操作不可撤回，是否确认继续，继续后比赛管理页面生成match数据。
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <button 
                    onClick={() => setShowFinalizeConfirm(false)}
                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all"
                  >
                    取消
                  </button>
                  <button 
                    onClick={() => {
                      setShowFinalizeConfirm(false);
                      alert('编排已定稿，场次记录已生成！');
                    }}
                    className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                  >
                    确认继续
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tie Detail Modal */}
      <AnimatePresence>
        {selectedTie && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTie(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">团体对阵详情(含多个单项) - {selectedTie.code}</h2>
                    <p className="text-xs text-indigo-100 mt-0.5">{selectedTie.phase_name} · 第{selectedTie.round_index}轮</p>
                  </div>
                </div>
                <button onClick={() => setSelectedTie(null)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                {/* Score Display */}
                <div className="flex items-center justify-between bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="text-center flex-1">
                    <div className="text-sm font-bold text-slate-900 mb-1">{selectedTie.participant_a || '待定'}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Team A</div>
                  </div>
                  <div className="px-8 flex items-center gap-4">
                    <div className="text-4xl font-black text-slate-900 font-mono">0</div>
                    <div className="text-slate-300 font-bold">:</div>
                    <div className="text-4xl font-black text-slate-900 font-mono">0</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-sm font-bold text-slate-900 mb-1">{selectedTie.participant_b || '待定'}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Team B</div>
                  </div>
                </div>

                {/* Sub Matches List */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">包含单项场次</h3>
                  <div className="space-y-3">
                    {selectedTie.sub_matches?.map((sm, idx) => (
                      <div key={sm.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 font-mono text-xs border border-slate-100">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{sm.sub_event_name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{sm.id}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-xs font-bold text-slate-900">0 - 0</div>
                            <div className={`text-[9px] font-bold uppercase ${
                              sm.status === 'COMPLETED' ? 'text-emerald-500' : 'text-slate-400'
                            }`}>
                              {sm.status === 'COMPLETED' ? '已结束' : '未开始'}
                            </div>
                          </div>
                          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setSelectedTie(null)}
                  className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

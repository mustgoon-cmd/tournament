import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Plus, 
  Trash2, 
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
  X
} from 'lucide-react';
import { PhaseType, PhaseConfig, ProjectSchedulingConfig, MatchSession, MatchRound, PromotionRule, VenueConfig } from '../types';
import { MOCK_PROJECT_SUMMARY } from '../constants';
import { BracketVisualizer } from './BracketVisualizer';
import { MatchList } from './MatchList';

interface ProjectSchedulingProps {
  onNavigateToAnnouncement?: () => void;
  onNavigateToRuleTemplates?: () => void;
  onNavigateToMatchCodeFormat?: () => void;
  venueConfig: VenueConfig;
  schedulingConfigs: Record<string, ProjectSchedulingConfig>;
  onUpdateSchedulingConfigs: (configs: Record<string, ProjectSchedulingConfig>) => void;
}

export const ProjectScheduling: React.FC<ProjectSchedulingProps> = ({ 
  onNavigateToAnnouncement,
  onNavigateToRuleTemplates,
  onNavigateToMatchCodeFormat,
  venueConfig,
  schedulingConfigs,
  onUpdateSchedulingConfigs
}) => {
  type SchedulingStatus = 'unconfigured' | 'draft' | 'locked' | 'generated';
  type PhaseWorkflowStatus = 'configured' | 'draft' | 'confirmed' | 'locked' | 'generated';
  type SchedulingConfigWithPhaseState = ProjectSchedulingConfig & {
    phase_statuses?: Record<string, PhaseWorkflowStatus>;
  };
  type BatchSchedulingPreset = 'round_robin_elimination' | 'single_elimination';
  const [establishedProjects] = useState(
    MOCK_PROJECT_SUMMARY.filter(p => p.status === 'ESTABLISHED' || p.establishment_status === '已立项')
  );

  const [projectTypeFilter, setProjectTypeFilter] = useState<'all' | 'single' | 'team'>('all');
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'bracket' | 'list' | 'sub_matches'>('bracket');
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [selectedTie, setSelectedTie] = useState<MatchSession | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);
  const [showBatchSchedulingModal, setShowBatchSchedulingModal] = useState(false);
  const [showBatchPlanResult, setShowBatchPlanResult] = useState(false);
  const [batchPlanLoading, setBatchPlanLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SchedulingStatus>('all');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [batchTemplateKeyword, setBatchTemplateKeyword] = useState('');
  const [batchSchedulingDraft, setBatchSchedulingDraft] = useState({
    templateId: 'round_robin_elimination' as BatchSchedulingPreset
  });
  const [batchTemplatePhases, setBatchTemplatePhases] = useState<PhaseConfig[]>([]);
  const [batchExpandedPhaseIds, setBatchExpandedPhaseIds] = useState<string[]>([]);
  const [batchPlanResult, setBatchPlanResult] = useState<{
    successCount: number;
    failedCount: number;
    failedItems: { projectName: string; reason: string }[];
  } | null>(null);
  const projectListRef = React.useRef<HTMLDivElement | null>(null);
  const allowedPhaseTypes = [PhaseType.ROUND_ROBIN, PhaseType.ELIMINATION];

  const batchPlanningTemplates = [
    {
      id: 'round_robin_elimination' as BatchSchedulingPreset,
      name: '两阶段：单循环赛 + 单淘汰',
      description: '适用于人数相对集中、希望所有人先进行一轮充分比赛的项目。',
      defaultMatchRuleId: 'rule_bo3_standard'
    },
    {
      id: 'single_elimination' as BatchSchedulingPreset,
      name: '单阶段：单淘汰赛',
      description: '适用于项目较多、需要快速进入正式比赛结构的场景。',
      defaultMatchRuleId: 'rule_bo1_fast'
    }
  ];

  const getTemplateDefaultMatchRuleId = (templateId: BatchSchedulingPreset) =>
    batchPlanningTemplates.find((template) => template.id === templateId)?.defaultMatchRuleId || 'rule_bo3_standard';

  const mapMatchRuleToPhaseValue = (ruleId: string, projectType: 'single' | 'team') => {
    if (projectType === 'team') {
      if (ruleId === 'rule_team_tie') return '5场3胜';
      if (ruleId === 'rule_bo1_fast') return '3场2胜';
      return '5场3胜';
    }

    if (ruleId === 'rule_bo1_fast') return '1局1胜';
    return '3局2胜';
  };

  const createTemplatePhase = (
    templateId: BatchSchedulingPreset,
    projectType: 'single' | 'team',
    matchRuleId: string
  ): PhaseConfig[] => {
    const defaultRule = mapMatchRuleToPhaseValue(matchRuleId, projectType);
    const basePhase = (order: number, name: string, type: PhaseType, overrides: Partial<PhaseConfig> = {}): PhaseConfig => ({
      id: `template-phase-${templateId}-${order}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      name,
      type,
      order,
      participant_count: order === 1 ? 16 : 8,
      elimination_goal: 'advance',
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
      match_win_loss_rule: projectType === 'single' ? defaultRule : '3局2胜',
      team_match_rule: projectType === 'team' ? defaultRule : '5场3胜',
      sub_match_rules: {},
      ...overrides
    });

    if (templateId === 'single_elimination') {
      return [
        basePhase(1, '第一阶段', PhaseType.ELIMINATION, {
          participant_count: 16,
          elimination_goal: 'ranking',
          decide_top_n: 1
        })
      ];
    }

    if (templateId === 'round_robin_elimination') {
      return [
        basePhase(1, '第一阶段', PhaseType.ROUND_ROBIN, {
          participant_count: 8,
          group_count: 1,
          promotion_per_group: 4
        }),
        basePhase(2, '第二阶段', PhaseType.ELIMINATION, {
          participant_count: 4,
          elimination_goal: 'ranking',
          decide_top_n: 4
        })
      ];
    }

    return [
      basePhase(1, '第一阶段', PhaseType.ROUND_ROBIN, {
        participant_count: 8,
        group_count: 1,
        promotion_per_group: 4
      }),
      basePhase(2, '第二阶段', PhaseType.ELIMINATION, {
        participant_count: 4,
        elimination_goal: 'ranking',
        decide_top_n: 4
      })
    ];
  };

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

  const batchProjectType = selectedProjectIds.some((projectId) =>
    establishedProjects.find((project) => project.id === projectId)?.type === 'team'
  )
    ? 'team'
    : 'single';

  React.useEffect(() => {
    setBatchTemplatePhases(createTemplatePhase(
      batchSchedulingDraft.templateId,
      batchProjectType,
      getTemplateDefaultMatchRuleId(batchSchedulingDraft.templateId)
    ));
  }, [batchSchedulingDraft.templateId, batchProjectType]);

  React.useEffect(() => {
    setBatchExpandedPhaseIds(batchTemplatePhases[0] ? [batchTemplatePhases[0].id] : []);
  }, [batchTemplatePhases]);

  const projectsByType = establishedProjects.filter((p) => {
    if (projectTypeFilter === 'all') return true;
    return p.type === projectTypeFilter;
  });

  const filteredProjects = projectsByType.filter((project) => {
    const matchesKeyword =
      searchKeyword.trim() === '' ||
      [project.name, project.short_name, project.code]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(searchKeyword.trim().toLowerCase()));

    const schedulingStatus = getProjectSchedulingStatus(project.id);
    const matchesStatus = statusFilter === 'all' ? true : schedulingStatus === statusFilter;

    return matchesKeyword && matchesStatus;
  });

  const visibleSelectedProjectIds = selectedProjectIds.filter((id) => filteredProjects.some((project) => project.id === id));
  const allVisibleSelected = filteredProjects.length > 0 && visibleSelectedProjectIds.length === filteredProjects.length;
  const selectedBatchProjects = filteredProjects.filter((project) => visibleSelectedProjectIds.includes(project.id));
  const filteredBatchPlanningTemplates = batchPlanningTemplates.filter((template) =>
    template.name.toLowerCase().includes(batchTemplateKeyword.trim().toLowerCase())
  );
  const batchPlanningTeamEvents =
    filteredProjects.find((project) => visibleSelectedProjectIds.includes(project.id) && project.type === 'team')?.team_events ||
    projectsByType.find((project) => project.type === 'team')?.team_events ||
    [];

  React.useEffect(() => {
    setSelectedProjectIds((prev) => prev.filter((id) => establishedProjects.some((project) => project.id === id)));
  }, [establishedProjects]);

  function getProjectConfig(projectId: string): SchedulingConfigWithPhaseState {
    const rawConfig = schedulingConfigs[projectId] as Partial<SchedulingConfigWithPhaseState> | undefined;
    const project = establishedProjects.find(p => p.id === projectId);

    return {
      project_id: projectId,
      project_name: rawConfig?.project_name || project?.name || '',
      project_code: rawConfig?.project_code || project?.id || '',
      phases: Array.isArray(rawConfig?.phases) ? rawConfig.phases : [],
      scheduling_status: rawConfig?.scheduling_status,
      generated_framework: rawConfig?.generated_framework,
      phase_statuses: rawConfig?.phase_statuses || {},
      venue_config: {
        court_count: 8,
        match_duration: 30,
        break_duration: 5,
        buffer_duration: 5,
        max_daily_hours: 8,
        max_days: 2,
        ...(rawConfig?.venue_config || {})
      }
    };
  }

  function getPhaseStatus(projectId: string, phaseId: string): PhaseWorkflowStatus {
    const config = getProjectConfig(projectId);
    return config.phase_statuses?.[phaseId] || 'configured';
  }

  function getProjectPhaseStatuses(projectId: string) {
    const config = getProjectConfig(projectId);
    return config.phases.map((phase) => ({
      phase,
      status: getPhaseStatus(projectId, phase.id)
    }));
  }

  function withUpdatedPhaseStatuses(
    config: SchedulingConfigWithPhaseState,
    updater: (current: Record<string, PhaseWorkflowStatus>) => Record<string, PhaseWorkflowStatus>
  ): SchedulingConfigWithPhaseState {
    return {
      ...config,
      phase_statuses: updater(config.phase_statuses || {})
    };
  }

  function getProjectSchedulingStatus(projectId: string): SchedulingStatus {
    const phaseStates = getProjectPhaseStatuses(projectId);
    if (phaseStates.length === 0) return 'unconfigured';
    if (phaseStates.every(({ status }) => status === 'generated')) return 'generated';
    if (phaseStates.some(({ status }) => status === 'locked' || status === 'confirmed')) return 'locked';
    return 'draft';
  }

  const canAddAnotherPhase = (phases: PhaseConfig[]) => {
    if (phases.length === 0) return true;
    const lastPhase = phases[phases.length - 1];
    return !(lastPhase.type === PhaseType.ELIMINATION && lastPhase.elimination_goal === 'ranking');
  };

  const addPhase = (projectId: string) => {
    const config = getProjectConfig(projectId);
    if (!canAddAnotherPhase(config.phases)) {
      alert('当前最后一个阶段已设置为“决出名次”，不能继续添加后续阶段。');
      return;
    }
    
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
      elimination_goal: 'advance',
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
      phases: [...config.phases, newPhase],
      phase_statuses: {
        ...(config.phase_statuses || {}),
        [newPhase.id]: 'configured' as PhaseWorkflowStatus
      },
      scheduling_status: 'draft',
      generated_framework: undefined
    };
    
    onUpdateSchedulingConfigs({
      ...schedulingConfigs,
      [projectId]: newConfig
    });
  };

  const removePhase = (projectId: string, phaseId: string) => {
    const config = getProjectConfig(projectId);
    const nextPhaseStatuses = { ...(config.phase_statuses || {}) };
    delete nextPhaseStatuses[phaseId];
    const newConfig = {
      ...config,
      phases: config.phases.filter(p => p.id !== phaseId),
      phase_statuses: nextPhaseStatuses,
      scheduling_status: config.phases.length > 1 ? 'draft' : undefined,
      generated_framework: undefined
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
      phases: newPhases,
      phase_statuses: config.phase_statuses || {},
      scheduling_status: config.scheduling_status ?? (newPhases.length > 0 ? 'draft' : undefined),
      generated_framework: config.generated_framework
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

  const addBatchTemplatePhase = () => {
    if (!canAddAnotherPhase(batchTemplatePhases)) {
      alert('当前最后一个阶段已设置为“决出名次”，不能继续添加后续阶段。');
      return;
    }
    const projectType = batchProjectType;
    const defaultRule = mapMatchRuleToPhaseValue(getTemplateDefaultMatchRuleId(batchSchedulingDraft.templateId), projectType);
    setBatchTemplatePhases((prev) => [
      ...prev,
      {
        id: `batch-template-phase-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
        name: `第${prev.length + 1}阶段`,
        type: PhaseType.ELIMINATION,
        order: prev.length + 1,
        participant_count: prev.length > 0 ? (prev[prev.length - 1].promotion_count || 1) : 16,
        elimination_goal: 'advance',
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
        match_win_loss_rule: projectType === 'single' ? defaultRule : '3局2胜',
        team_match_rule: projectType === 'team' ? defaultRule : '5场3胜',
        sub_match_rules: {}
      }
    ]);
  };

  const removeBatchTemplatePhase = (phaseId: string) => {
    setBatchTemplatePhases((prev) => prev.filter((phase) => phase.id !== phaseId).map((phase, index) => ({
      ...phase,
      order: index + 1
    })));
  };

  const updateBatchTemplatePhase = (phaseId: string, updates: Partial<PhaseConfig>) => {
    setBatchTemplatePhases((prev) => {
      const nextPhases = prev.map((phase) => phase.id === phaseId ? { ...phase, ...updates } : phase);
      for (let i = 1; i < nextPhases.length; i++) {
        const previousPhase = nextPhases[i - 1];
        if (previousPhase.type === PhaseType.ELIMINATION) {
          nextPhases[i].participant_count = previousPhase.promotion_count || 1;
        } else {
          nextPhases[i].participant_count = (previousPhase.group_count || 1) * (previousPhase.promotion_per_group || 1);
        }
      }
      return nextPhases;
    });
  };

  const addBatchPromotionRule = (phaseId: string) => {
    setBatchTemplatePhases((prev) => prev.map((phase) => {
      if (phase.id !== phaseId) return phase;
      return {
        ...phase,
        promotion_rules: [...(phase.promotion_rules || []), { from_group: 1, from_rank: 1, to_position: 1 }]
      };
    }));
  };

  const updateBatchPromotionRule = (phaseId: string, ruleIndex: number, updates: Partial<PromotionRule>) => {
    setBatchTemplatePhases((prev) => prev.map((phase) => {
      if (phase.id !== phaseId || !phase.promotion_rules) return phase;
      const nextRules = [...phase.promotion_rules];
      nextRules[ruleIndex] = { ...nextRules[ruleIndex], ...updates };
      return { ...phase, promotion_rules: nextRules };
    }));
  };

  const removeBatchPromotionRule = (phaseId: string, ruleIndex: number) => {
    setBatchTemplatePhases((prev) => prev.map((phase) => {
      if (phase.id !== phaseId || !phase.promotion_rules) return phase;
      return {
        ...phase,
        promotion_rules: phase.promotion_rules.filter((_, index) => index !== ruleIndex)
      };
    }));
  };

  const openProjectScheduling = (project: any) => {
    setSelectedProject(project);
    setActiveTab('bracket');
  };

  const openProjectMatchList = (project: any) => {
    setSelectedProject(project);
    setActiveTab('list');
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
    const currentPhase = config.phases[Math.min(activePhaseIndex, Math.max(0, config.phases.length - 1))];
    
    // In a real app, this would be an API call
    console.log('Saving config:', config);
    
    // Simulate persistence
    const nextConfig = {
      ...config,
      scheduling_status: config.scheduling_status ?? (config.phases.length > 0 ? 'draft' as const : undefined),
      generated_framework: config.generated_framework
    };
    const savedConfigs = JSON.parse(localStorage.getItem('scheduling_configs') || '{}');
    const finalConfig = currentPhase
      ? withUpdatedPhaseStatuses(nextConfig, (current) => ({
          ...current,
          [currentPhase.id]: current[currentPhase.id] || 'configured'
        }))
      : nextConfig;
    savedConfigs[selectedProject.id] = finalConfig;
    localStorage.setItem('scheduling_configs', JSON.stringify(savedConfigs));

    onUpdateSchedulingConfigs({
      ...schedulingConfigs,
      [selectedProject.id]: finalConfig
    });
    
    alert(`项目 [${selectedProject.name}] 当前阶段配置已保存成功！`);
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
    const currentPhase = config.phases[Math.min(activePhaseIndex, Math.max(0, config.phases.length - 1))];
    if (!currentPhase) return;
    
    if (config.phases.length === 0) {
      alert('请先添加比赛阶段');
      return;
    }

    if (getPhaseStatus(selectedProject.id, currentPhase.id) !== 'locked') {
      alert('请先锁定当前阶段，再生成比赛。');
      return;
    }

    const newConfig = {
      ...generateFrameworkForConfig(config),
      scheduling_status: 'generated' as const
    };
    onUpdateSchedulingConfigs({
      ...schedulingConfigs,
      [selectedProject.id]: withUpdatedPhaseStatuses(newConfig, (current) => ({
        ...current,
        [currentPhase.id]: 'generated'
      }))
    });
    
    alert(`已成功生成 [${selectedProject.name}] 当前阶段比赛。`);
  };

  const generateBracket = (projectId: string, phaseId: string) => {
    const project = establishedProjects.find((item) => item.id === projectId);
    const config = getProjectConfig(projectId);
    const phase = config.phases.find((item) => item.id === phaseId);

    if (config.phases.length === 0) {
      alert('请先添加比赛阶段');
      return;
    }
    if (!phase) return;

    const draftConfig = {
      ...generateFrameworkForConfig(config),
      scheduling_status: 'draft' as const
    };

    onUpdateSchedulingConfigs({
      ...schedulingConfigs,
      [projectId]: withUpdatedPhaseStatuses(draftConfig, (current) => ({
        ...current,
        [phaseId]: 'draft'
      }))
    });

    setActiveTab('bracket');
    alert(`已成功生成 [${project?.name || config.project_name}] 当前阶段对阵，请确认后再锁定阶段。`);
  };

  const handleGenerateBracket = () => {
    if (!selectedProject) return;
    const config = getProjectConfig(selectedProject.id);
    const currentPhase = config.phases[Math.min(activePhaseIndex, Math.max(0, config.phases.length - 1))];
    if (!currentPhase) return;
    generateBracket(selectedProject.id, currentPhase.id);
  };

  const handleConfirmCurrentPhase = () => {
    if (!selectedProject) return;
    const config = getProjectConfig(selectedProject.id);
    const currentPhase = config.phases[Math.min(activePhaseIndex, Math.max(0, config.phases.length - 1))];
    if (!currentPhase) return;

    if (getPhaseStatus(selectedProject.id, currentPhase.id) !== 'draft') {
      alert('请先生成当前阶段对阵，再确认阶段。');
      return;
    }

    onUpdateSchedulingConfigs({
      ...schedulingConfigs,
      [selectedProject.id]: withUpdatedPhaseStatuses(config, (current) => ({
        ...current,
        [currentPhase.id]: 'confirmed'
      }))
    });
    alert(`已确认 [${currentPhase.name}]，可继续锁定阶段。`);
  };

  const handleLockCurrentPhase = () => {
    if (!selectedProject) return;
    const config = getProjectConfig(selectedProject.id);
    const currentPhase = config.phases[Math.min(activePhaseIndex, Math.max(0, config.phases.length - 1))];
    if (!currentPhase) return;

    if (getPhaseStatus(selectedProject.id, currentPhase.id) !== 'confirmed') {
      alert('请先确认当前阶段，再锁定阶段。');
      return;
    }

    onUpdateSchedulingConfigs({
      ...schedulingConfigs,
      [selectedProject.id]: withUpdatedPhaseStatuses(config, (current) => ({
        ...current,
        [currentPhase.id]: 'locked'
      }))
    });
    alert(`已锁定 [${currentPhase.name}]，可继续生成比赛。`);
  };

  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedProjectIds((prev) => prev.filter((id) => !filteredProjects.some((project) => project.id === id)));
      return;
    }

    setSelectedProjectIds((prev) => {
      const merged = new Set([...prev, ...filteredProjects.map((project) => project.id)]);
      return Array.from(merged);
    });
  };

  const handleBatchGenerate = () => {
    if (visibleSelectedProjectIds.length === 0) {
      alert('请先选择需要批量编排的项目。');
      return;
    }

    if (visibleSelectedProjectIds.some((projectId) => !['unconfigured', 'draft'].includes(getProjectSchedulingStatus(projectId)))) {
      alert('仅支持未编排或编排中的项目');
      return;
    }

    setShowBatchSchedulingModal(true);
  };

  const createBatchPhase = (
    projectId: string,
    order: number,
    name: string,
    type: PhaseType,
    participantCount: number,
    overrides: Partial<PhaseConfig> = {}
  ): PhaseConfig => ({
    id: `batch-phase-${projectId}-${order}-${Date.now()}`,
    name,
    type,
    order,
    participant_count: participantCount,
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
    sub_match_rules: {},
    ...overrides
  });

  const buildBatchPhasesForProject = (projectId: string): PhaseConfig[] => {
    const project = establishedProjects.find((item) => item.id === projectId);
    const participantCount = Math.max(project?.current_count || 0, 1);
    const templatePhases = batchTemplatePhases.length > 0
      ? batchTemplatePhases
      : createTemplatePhase(
          batchSchedulingDraft.templateId,
          project?.type === 'team' ? 'team' : 'single',
          getTemplateDefaultMatchRuleId(batchSchedulingDraft.templateId)
        );

    const clonedPhases = templatePhases.map((phase, index) => ({
      ...phase,
      id: `batch-phase-${projectId}-${index + 1}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      promotion_rules: phase.promotion_rules ? phase.promotion_rules.map((rule) => ({ ...rule })) : [],
      ranking_rules: phase.ranking_rules ? [...phase.ranking_rules] : ['胜场数', '胜负关系', '净胜局', '总得分'],
      placement_rule: phase.placement_rule ? { ...phase.placement_rule, mapping_relations: [...(phase.placement_rule.mapping_relations || [])] } : phase.placement_rule,
      progression_rule: phase.progression_rule ? { ...phase.progression_rule } : phase.progression_rule,
      sub_match_rules: phase.sub_match_rules ? { ...phase.sub_match_rules } : {},
      order: index + 1
    }));

    if (clonedPhases.length === 0) return [];

    clonedPhases[0].participant_count = participantCount;
    for (let i = 1; i < clonedPhases.length; i++) {
      const previousPhase = clonedPhases[i - 1];
      clonedPhases[i].participant_count = previousPhase.type === PhaseType.ELIMINATION
        ? (previousPhase.promotion_count || 1)
        : ((previousPhase.group_count || 1) * (previousPhase.promotion_per_group || 1));
    }

    return clonedPhases;
  };

  const handleApplyBatchScheduling = async () => {
    if (visibleSelectedProjectIds.length === 0) {
      alert('请先选择需要批量编排的项目。');
      return;
    }

    if (!batchSchedulingDraft.templateId) {
      alert('请选择赛制模板。');
      return;
    }

    setBatchPlanLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));

    const nextConfigs = { ...schedulingConfigs };
    const failedItems: { projectName: string; reason: string }[] = [];
    let successCount = 0;

    visibleSelectedProjectIds.forEach((projectId) => {
      const project = establishedProjects.find((item) => item.id === projectId);
      const currentConfig = getProjectConfig(projectId);
      const participantCount = project?.current_count || 0;
      const firstTemplatePhase = batchTemplatePhases[0];
      const minimumRequired = firstTemplatePhase?.type === PhaseType.ELIMINATION
        ? 2
        : Math.max((firstTemplatePhase?.group_count || 1) * 2, firstTemplatePhase?.promotion_per_group || 2);

      if (participantCount < minimumRequired) {
        failedItems.push({
          projectName: project?.name || currentConfig.project_name,
          reason: '人数不足'
        });
        return;
      }

      const phases = buildBatchPhasesForProject(projectId);
      const draftConfig = {
        ...currentConfig,
        phases,
        scheduling_status: 'draft' as const,
        generated_framework: undefined
      };

      nextConfigs[projectId] = withUpdatedPhaseStatuses(
        {
          ...draftConfig,
          generated_framework: generateFrameworkForConfig(draftConfig).generated_framework
        },
        (current) => phases.reduce<Record<string, PhaseWorkflowStatus>>((acc, phase) => {
          acc[phase.id] = 'draft';
          return acc;
        }, { ...current })
      );
      successCount += 1;
    });

    onUpdateSchedulingConfigs(nextConfigs);
    setBatchPlanLoading(false);
    setShowBatchSchedulingModal(false);
    setBatchPlanResult({
      successCount,
      failedCount: failedItems.length,
      failedItems
    });
    setShowBatchPlanResult(true);
  };

  const getPhaseStatusMeta = (status: PhaseWorkflowStatus) => {
    if (status === 'generated') return { label: '已生成比赛', className: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
    if (status === 'locked') return { label: '已锁定', className: 'bg-violet-50 text-violet-600 border-violet-100' };
    if (status === 'confirmed') return { label: '已确认', className: 'bg-sky-50 text-sky-600 border-sky-100' };
    if (status === 'draft') return { label: '对阵草稿', className: 'bg-amber-50 text-amber-600 border-amber-100' };
    return { label: '待配置', className: 'bg-slate-50 text-slate-500 border-slate-200' };
  };

  const getProjectScheduleStatusMeta = (projectId: string) => {
    const phaseStates = getProjectPhaseStatuses(projectId);
    const total = phaseStates.length;
    if (total === 0) {
      return { label: '未编排', className: 'bg-slate-50 text-slate-500 border-slate-200' };
    }

    const generatedCount = phaseStates.filter(({ status }) => status === 'generated').length;
    const lockedCount = phaseStates.filter(({ status }) => status === 'locked').length;
    const confirmedCount = phaseStates.filter(({ status }) => status === 'confirmed').length;
    const draftCount = phaseStates.filter(({ status }) => status === 'draft').length;

    if (generatedCount === total) {
      return { label: '全部阶段已生成比赛', className: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
    }
    if (generatedCount > 0) {
      return { label: `已生成 ${generatedCount}/${total} 阶段`, className: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
    }
    if (lockedCount > 0) {
      return { label: `已锁定 ${lockedCount}/${total} 阶段`, className: 'bg-violet-50 text-violet-600 border-violet-100' };
    }
    if (confirmedCount > 0) {
      return { label: `已确认 ${confirmedCount}/${total} 阶段`, className: 'bg-sky-50 text-sky-600 border-sky-100' };
    }
    if (draftCount > 0) {
      return { label: `编排中 ${draftCount}/${total} 阶段`, className: 'bg-amber-50 text-amber-600 border-amber-100' };
    }
    return { label: `待配置 ${total} 个阶段`, className: 'bg-slate-50 text-slate-500 border-slate-200' };
  };

  const getProjectLatestUpdatedTime = (projectId: string) => {
    const phaseStates = getProjectPhaseStatuses(projectId);
    if (phaseStates.length === 0) return '-';
    const projectIndex = Math.max(establishedProjects.findIndex((project) => project.id === projectId), 0);
    const minute = String(18 + (projectIndex * 7) % 40).padStart(2, '0');
    return `2026-04-01 11:${minute}:00`;
  };

  const getPhaseTypeLabel = (type: PhaseType) => {
    if (type === PhaseType.ELIMINATION) return '单淘汰';
    return '单循环';
  };

  const getPhaseTableValue = (phase?: PhaseConfig) => {
    if (!phase) return '-';
    return `${phase.participant_count || 0}/${getPhaseTypeLabel(phase.type)}/${calculatePhaseMatches(phase)}`;
  };

  const getPhaseDisplayName = (index: number) => {
    const names = ['第一阶段', '第二阶段', '第三阶段', '第四阶段', '第五阶段'];
    return names[index] || `第${index + 1}阶段`;
  };

  const getPhasePromotionSummary = (phase?: PhaseConfig) => {
    if (!phase) return '-';
    if (phase.type === PhaseType.ELIMINATION) {
      return (phase.elimination_goal || 'advance') === 'advance'
        ? `筛选晋级 ${phase.promotion_count || 1} 人`
        : `决出前 ${phase.decide_top_n || 1} 名`;
    }

    const groupCount = phase.group_count || 1;
    const promotionPerGroup = phase.promotion_per_group || 1;
    return groupCount > 1
      ? `${groupCount} 组，每组晋级 ${promotionPerGroup} 人`
      : `单组晋级 ${promotionPerGroup} 人`;
  };

  const getPhaseRoundBreakdown = (phase?: PhaseConfig) => {
    if (!phase) return [];

    if (phase.type === PhaseType.ELIMINATION) {
      const participantCount = Math.max(phase.participant_count || 0, 0);
      if (participantCount <= 1) return [];

      const roundCount = Math.ceil(Math.log2(participantCount));
      const firstRoundBase = Math.pow(2, roundCount - 1);
      const rounds = Array.from({ length: roundCount }).map((_, index) => {
        const matches = index === 0
          ? Math.max(1, participantCount - firstRoundBase)
          : Math.max(1, Math.pow(2, roundCount - index - 1));
        return {
          label: `第${index + 1}轮`,
          matches
        };
      });

      if (phase.play_third_place) {
        rounds.push({ label: '附加赛', matches: 1 });
      }

      return rounds;
    }

    const groupCount = Math.max(phase.group_count || 1, 1);
    const participantsPerGroup = Math.max(Math.ceil((phase.participant_count || 0) / groupCount), 1);
    const roundCount = participantsPerGroup % 2 === 0 ? Math.max(participantsPerGroup - 1, 1) : participantsPerGroup;
    const matchesPerRound = Math.floor(participantsPerGroup / 2) * groupCount;

    return Array.from({ length: roundCount }).map((_, index) => ({
      label: `第${index + 1}轮`,
      matches: matchesPerRound
    }));
  };

  const getPhaseRoundSummary = (phase?: PhaseConfig) => {
    const rounds = getPhaseRoundBreakdown(phase);
    if (rounds.length === 0) return '-';
    return rounds.map((round) => `${round.label}${round.matches}场`).join(' / ');
  };

  const renderPhaseConfigurationEditor = ({
    phases,
    projectType,
    teamEvents,
    onAddPhase,
    onUpdatePhase,
    onRemovePhase,
    onAddPromotionRule,
    onUpdatePromotionRule,
    onRemovePromotionRule,
    emptyTitle,
    emptyDescription,
    canAddPhase = true,
    addPhaseDisabledReason = '当前最后一个阶段已设置为“决出名次”，不能继续添加后续阶段。',
    collapsible = false,
    expandedPhaseIds = [],
    onTogglePhase,
    participantCountMode = 'editable',
    showAddPhaseButton = true,
    visiblePhaseIds,
    contextPhases,
    showPhaseImpactHint = false
  }: {
    phases: PhaseConfig[];
    projectType: 'single' | 'team';
    teamEvents?: any[];
    onAddPhase: () => void;
    onUpdatePhase: (phaseId: string, updates: Partial<PhaseConfig>) => void;
    onRemovePhase: (phaseId: string) => void;
    onAddPromotionRule: (phaseId: string) => void;
    onUpdatePromotionRule: (phaseId: string, ruleIndex: number, updates: Partial<PromotionRule>) => void;
    onRemovePromotionRule: (phaseId: string, ruleIndex: number) => void;
    emptyTitle: string;
    emptyDescription: string;
    canAddPhase?: boolean;
    addPhaseDisabledReason?: string;
    collapsible?: boolean;
    expandedPhaseIds?: string[];
    onTogglePhase?: (phaseId: string) => void;
    participantCountMode?: 'editable' | 'per_project_auto';
    showAddPhaseButton?: boolean;
    visiblePhaseIds?: string[];
    contextPhases?: PhaseConfig[];
    showPhaseImpactHint?: boolean;
  }) => {
    const effectiveContextPhases = contextPhases || phases;
    const visiblePhases = visiblePhaseIds
      ? phases.filter((phase) => visiblePhaseIds.includes(phase.id))
      : phases;

    return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">比赛阶段配置</span>
        {showAddPhaseButton && (
          <button
            onClick={() => {
              if (!canAddPhase) {
                alert(addPhaseDisabledReason);
                return;
              }
              onAddPhase();
            }}
            className={`flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold transition-all ${
              canAddPhase
                ? 'text-indigo-600 hover:bg-indigo-50'
                : 'cursor-not-allowed text-slate-300'
            }`}
            title={canAddPhase ? '添加阶段' : addPhaseDisabledReason}
          >
            <Plus className="w-3 h-3" />
            添加阶段
          </button>
        )}
      </div>
      {showPhaseImpactHint && visiblePhases.length > 0 && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-700">
          修改当前阶段配置后，后续阶段的晋级人数与状态可能同步更新。
        </div>
      )}
      {visiblePhases.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-white border border-slate-200 flex items-center justify-center text-slate-300 shadow-sm">
            <LayoutGrid className="w-8 h-8" />
          </div>
          <div className="max-w-xs">
            <p className="text-sm font-bold text-slate-900">{emptyTitle}</p>
            <p className="text-xs text-slate-500 mt-1">{emptyDescription}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {visiblePhases.map((phase, index) => {
            const actualIndex = Math.max(
              effectiveContextPhases.findIndex((item) => item.id === phase.id),
              0
            );
            const isLastPhase = actualIndex === effectiveContextPhases.length - 1;
            const hasNextPhase = actualIndex < effectiveContextPhases.length - 1;

            return (
            <div key={phase.id} className="relative p-5 bg-white rounded-2xl border border-slate-200 shadow-sm group">
              <div className={`flex items-center justify-between ${collapsible && !expandedPhaseIds.includes(phase.id) ? '' : 'mb-4'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                    {actualIndex + 1}
                  </div>
                  <div className="min-w-0">
                    <input
                      type="text"
                      value={phase.name}
                      onChange={(e) => onUpdatePhase(phase.id, { name: e.target.value })}
                      className="bg-transparent border-none p-0 text-sm font-bold text-slate-900 focus:ring-0 w-32"
                      placeholder="阶段名称"
                    />
                    {collapsible && (
                      <p className="mt-1 text-[11px] text-slate-400">
                        {phase.type} · {phase.type === PhaseType.ELIMINATION
                          ? participantCountMode === 'per_project_auto'
                            ? '参赛人数按项目自动带入'
                            : `${phase.participant_count}人淘汰`
                          : participantCountMode === 'per_project_auto'
                            ? `${phase.group_count || 1}组 / 每组晋级${phase.promotion_per_group || 1}人 / 参赛人数自动带入`
                            : `${phase.group_count || 1}组 / 每组晋级${phase.promotion_per_group || 1}人`}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={allowedPhaseTypes.includes(phase.type) ? phase.type : PhaseType.ROUND_ROBIN}
                    onChange={(e) => onUpdatePhase(phase.id, { type: e.target.value as PhaseType })}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-indigo-600 uppercase tracking-wider focus:ring-0 cursor-pointer"
                  >
                    {allowedPhaseTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => onRemovePhase(phase.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {collapsible && onTogglePhase && (
                    <button
                      onClick={() => onTogglePhase(phase.id)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <ChevronRight className={`w-4 h-4 transition-transform ${expandedPhaseIds.includes(phase.id) ? 'rotate-90' : ''}`} />
                    </button>
                  )}
                </div>
              </div>

              {(!collapsible || expandedPhaseIds.includes(phase.id)) && (phase.type === PhaseType.ELIMINATION ? (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="space-y-1 col-span-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">阶段目标</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onUpdatePhase(phase.id, { elimination_goal: 'advance' })}
                        className={`rounded-lg border px-3 py-2 text-xs font-bold transition-all ${
                          (phase.elimination_goal || 'advance') === 'advance'
                            ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
                            : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:text-indigo-600'
                        }`}
                      >
                        筛选晋级
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!isLastPhase) {
                            alert('“决出名次”只能用于最后一个阶段，请先将后续阶段删除后再设置。');
                            return;
                          }
                          onUpdatePhase(phase.id, { elimination_goal: 'ranking' });
                        }}
                        className={`rounded-lg border px-3 py-2 text-xs font-bold transition-all ${
                          (phase.elimination_goal || 'advance') === 'ranking'
                            ? 'border-violet-200 bg-violet-50 text-violet-600'
                            : isLastPhase
                              ? 'border-slate-200 bg-white text-slate-500 hover:border-violet-200 hover:text-violet-600'
                              : 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300'
                        }`}
                        title={isLastPhase ? '将该阶段作为最终名次阶段' : '仅最后一个阶段可设置为决出名次'}
                      >
                        决出名次
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {(phase.elimination_goal || 'advance') === 'advance'
                        ? '当前阶段用于筛选进入下一阶段的选手。'
                        : '当前阶段将作为最终阶段，直接决出名次。'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">参赛人数</label>
                    {participantCountMode === 'per_project_auto' ? (
                      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                        将按各项目实际报名人数自动带入
                      </div>
                    ) : (
                      <div className="relative">
                        <Hash className="w-3 h-3 text-slate-300 absolute left-2 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          value={phase.participant_count}
                          onChange={(e) => onUpdatePhase(phase.id, { participant_count: parseInt(e.target.value) || 0 })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">种子数</label>
                    <div className="relative">
                      <Hash className="w-3 h-3 text-slate-300 absolute left-2 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        value={phase.seed_count || 0}
                        onChange={(e) => onUpdatePhase(phase.id, { seed_count: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  {(phase.elimination_goal || 'advance') === 'advance' ? (
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">晋级人数</label>
                      <div className="relative">
                        <ArrowRight className="w-3 h-3 text-emerald-400 absolute left-2 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          value={phase.promotion_count}
                          onChange={(e) => onUpdatePhase(phase.id, { promotion_count: parseInt(e.target.value) || 0 })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-emerald-600 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">本阶段决出名次</label>
                      <select
                        value={phase.decide_top_n || 1}
                        onChange={(e) => onUpdatePhase(phase.id, { decide_top_n: parseInt(e.target.value) || 1 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-violet-600 focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                      >
                        <option value={1}>决出冠军</option>
                        <option value={2}>决出前2名</option>
                        <option value={4}>决出前4名</option>
                        <option value={8}>决出前8名</option>
                      </select>
                    </div>
                  )}
                  <div className="space-y-1 flex items-end">
                    <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
                      {(phase.elimination_goal || 'advance') === 'advance'
                        ? '该阶段结束后，系统将按晋级人数自动衔接下一阶段。'
                        : '该阶段作为最终阶段，后续将不允许继续新增比赛阶段。'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">参赛人数</label>
                    {participantCountMode === 'per_project_auto' ? (
                      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                        将按各项目实际报名人数自动带入
                      </div>
                    ) : (
                      <div className="relative">
                        <Hash className="w-3 h-3 text-slate-300 absolute left-2 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          value={phase.participant_count}
                          onChange={(e) => onUpdatePhase(phase.id, { participant_count: parseInt(e.target.value) || 0 })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">分组数量</label>
                    <div className="relative">
                      <Hash className="w-3 h-3 text-slate-300 absolute left-2 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        value={phase.group_count || 1}
                        onChange={(e) => onUpdatePhase(phase.id, { group_count: parseInt(e.target.value) || 1 })}
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
                        onChange={(e) => onUpdatePhase(phase.id, { promotion_per_group: parseInt(e.target.value) || 1 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-emerald-600 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">分组策略</label>
                    <select
                      value={phase.grouping_strategy || '1号固定逆时针轮转法'}
                      onChange={(e) => onUpdatePhase(phase.id, { grouping_strategy: e.target.value as any })}
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
                            onUpdatePhase(phase.id, { ranking_rules: newRules });
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
              ))}

              {(!collapsible || expandedPhaseIds.includes(phase.id)) && hasNextPhase && (
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">晋级与落位逻辑 (至下一阶段)</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">晋级规则 (筛选方式)</label>
                    </div>
                    <select
                      value={phase.progression_rule?.mode || 'group_ranking'}
                      onChange={(e) => onUpdatePhase(phase.id, {
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

                  <div className="space-y-4">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">落位规则 (签表分布)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 block">落位策略</span>
                        <select
                          value={phase.placement_rule?.strategy || 'serpentine'}
                          onChange={(e) => onUpdatePhase(phase.id, {
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
                          onChange={(e) => onUpdatePhase(phase.id, {
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
                          onChange={(e) => onUpdatePhase(phase.id, {
                            placement_rule: { ...phase.placement_rule, avoid_same_group: e.target.checked }
                          })}
                          className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                        />
                        <span className="text-[10px] font-bold text-slate-600">避免同组提前相遇</span>
                      </label>
                    </div>

                    {phase.placement_rule?.strategy === 'fixed' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">具体映射关系</span>
                          <button
                            onClick={() => onAddPromotionRule(phase.id)}
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
                                    onChange={(e) => onUpdatePromotionRule(phase.id, rIdx, { from_group: parseInt(e.target.value) || 1 })}
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
                                    onChange={(e) => onUpdatePromotionRule(phase.id, rIdx, { from_rank: parseInt(e.target.value) || 1 })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-[10px] font-bold"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[9px] text-indigo-400 block">下段位</span>
                                  <input
                                    type="number"
                                    value={rule.to_position}
                                    onChange={(e) => onUpdatePromotionRule(phase.id, rIdx, { to_position: parseInt(e.target.value) || 1 })}
                                    className="w-full bg-indigo-50 border border-indigo-100 rounded px-1 py-0.5 text-[10px] font-bold text-indigo-600"
                                  />
                                </div>
                              </div>
                              <button
                                onClick={() => onRemovePromotionRule(phase.id, rIdx)}
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
          )})}
        </div>
      )}
    </div>
  )};

  const selectedProjectConfig = selectedProject ? getProjectConfig(selectedProject.id) : null;
  const selectedProjectPhases = selectedProjectConfig?.phases || [];
  const safeSelectedPhaseIndex = Math.min(activePhaseIndex, Math.max(0, selectedProjectPhases.length - 1));
  const selectedPhase = selectedProjectPhases[safeSelectedPhaseIndex];
  const selectedPhaseStatus = selectedProject && selectedPhase
    ? getPhaseStatus(selectedProject.id, selectedPhase.id)
    : null;
  const selectedPhaseStatusMeta = selectedPhaseStatus
    ? getPhaseStatusMeta(selectedPhaseStatus)
    : null;
  const selectedPhaseHasStructure = Boolean(
    selectedProject &&
      selectedPhase &&
      ['draft', 'confirmed', 'locked', 'generated'].includes(selectedPhaseStatus || '') &&
      getProjectConfig(selectedProject.id).generated_framework
  );
  const phaseColumnCount = Math.max(
    1,
    ...filteredProjects.map((project) => getProjectConfig(project.id).phases.length)
  );
  const schedulingStatsConfigs = (Object.values(schedulingConfigs) as ProjectSchedulingConfig[])
    .filter((config) => config.phases.length > 0);
  const statsPhaseColumnCount = Math.max(
    1,
    ...schedulingStatsConfigs.map((config) => config.phases.length)
  );
  const statsTotalMatches = schedulingStatsConfigs.reduce(
    (total, config) => total + config.phases.reduce((sum, phase) => sum + calculatePhaseMatches(phase), 0),
    0
  );
  const unplannedProjectCount = establishedProjects.filter((project) => getProjectConfig(project.id).phases.length === 0).length;
  const statsPhaseRoundLabels = Array.from({ length: statsPhaseColumnCount }).map((_, phaseIndex) => {
    const phaseWithMostRounds = schedulingStatsConfigs
      .map((config) => config.phases[phaseIndex])
      .filter((phase): phase is PhaseConfig => Boolean(phase))
      .sort((a, b) => getPhaseRoundBreakdown(b).length - getPhaseRoundBreakdown(a).length)[0];
    const labels = phaseWithMostRounds
      ? getPhaseRoundBreakdown(phaseWithMostRounds).map((round) => round.label)
      : [];

    return labels.length > 0 ? labels : ['第1轮'];
  });
  const statsRoundColumnCount = statsPhaseRoundLabels.reduce((total, labels) => total + labels.length, 0);
  const statsTableMinWidth = 760 + statsPhaseColumnCount * 330 + statsRoundColumnCount * 96;

  return (
    <div className="flex-1 flex flex-col bg-slate-100">
      {/* 4 Columns Layout */}
      <div className="flex-1 flex overflow-x-auto overflow-y-hidden">
        {isPreviewMode ? (
          <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
            <div className="mx-auto max-w-7xl space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">场次统计</h3>
                  <p className="mt-1 text-sm text-slate-500">按项目和阶段查看选手数量、赛制、晋级规则、每轮场次与阶段总场次。</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button 
                    onClick={() => setIsPreviewMode(false)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    返回项目编排
                  </button>
                  <button 
                    onClick={() => setShowFinalizeConfirm(true)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    编排定稿
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">已配置项目</div>
                      <div className="text-2xl font-black text-slate-900">{schedulingStatsConfigs.length}</div>
                    </div>
                  </div>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">未编排项目</div>
                      <div className="text-2xl font-black text-slate-900">{unplannedProjectCount}</div>
                    </div>
                  </div>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <Hash className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">预计总场次</div>
                      <div className="text-2xl font-black text-slate-900">{statsTotalMatches}</div>
                    </div>
                  </div>
                </div>
              </div>

              {schedulingStatsConfigs.length > 0 ? (
                <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left" style={{ minWidth: `${statsTableMinWidth}px` }}>
                      <thead className="bg-slate-50">
                        <tr>
                          <th rowSpan={2} className="border-b border-r border-slate-200 px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500">项目名称</th>
                          <th rowSpan={2} className="border-b border-r border-slate-200 px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500">项目类型</th>
                          <th rowSpan={2} className="border-b border-r border-slate-200 px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500">选手数量</th>
                          {Array.from({ length: statsPhaseColumnCount }).map((_, index) => (
                            <th
                              key={`phase-group-${index}`}
                              colSpan={3 + statsPhaseRoundLabels[index].length}
                              className="border-b border-r border-slate-200 px-5 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-600"
                            >
                              {getPhaseDisplayName(index)}
                            </th>
                          ))}
                          <th rowSpan={2} className="border-b border-r border-slate-200 px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500">项目总场次</th>
                          <th rowSpan={2} className="border-b border-slate-200 px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500">操作</th>
                        </tr>
                        <tr>
                          {Array.from({ length: statsPhaseColumnCount }).map((_, index) => (
                            <React.Fragment key={`phase-sub-${index}`}>
                              <th className="border-b border-r border-slate-200 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-400">赛制</th>
                              <th className="border-b border-r border-slate-200 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-400">晋级规则</th>
                              {statsPhaseRoundLabels[index].map((label) => (
                                <th key={`${index}-${label}`} className="border-b border-r border-slate-200 px-4 py-3 text-center text-xs font-black uppercase tracking-wider text-slate-400">
                                  {label}
                                </th>
                              ))}
                              <th className="border-b border-r border-slate-200 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-400">阶段总场次</th>
                            </React.Fragment>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {schedulingStatsConfigs.map((config) => {
                          const project = establishedProjects.find((item) => item.id === config.project_id);
                          const projectTotalMatches = config.phases.reduce((sum, phase) => sum + calculatePhaseMatches(phase), 0);
                          const participantCount = project?.current_count || config.phases[0]?.participant_count || 0;

                          return (
                            <tr key={config.project_id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                              <td className="whitespace-nowrap border-r border-slate-100 px-5 py-5 align-top">
                                <div className="font-black text-slate-900">{config.project_name}</div>
                                <div className="mt-1 text-xs font-mono font-bold text-slate-400">{config.project_code}</div>
                              </td>
                              <td className="whitespace-nowrap border-r border-slate-100 px-5 py-5 align-top text-sm font-bold text-slate-600">
                                {project?.type === 'team' ? '团体项目' : '单项项目'}
                              </td>
                              <td className="whitespace-nowrap border-r border-slate-100 px-5 py-5 align-top text-sm font-black text-indigo-600">
                                {participantCount} 人
                              </td>
                              {Array.from({ length: statsPhaseColumnCount }).map((_, index) => {
                                const phase = config.phases[index];
                                const phaseRoundLabels = statsPhaseRoundLabels[index];

                                if (!phase) {
                                  return (
                                    <React.Fragment key={`${config.project_id}-empty-${index}`}>
                                      {Array.from({ length: 3 + phaseRoundLabels.length }).map((__, emptyIndex) => (
                                        <td key={`${config.project_id}-empty-${index}-${emptyIndex}`} className="border-r border-slate-100 px-4 py-5 align-top text-sm text-slate-300">-</td>
                                      ))}
                                    </React.Fragment>
                                  );
                                }

                                const rounds = getPhaseRoundBreakdown(phase);

                                return (
                                  <React.Fragment key={`${config.project_id}-${phase.id}`}>
                                    <td className="whitespace-nowrap border-r border-slate-100 px-4 py-5 align-top text-sm font-bold text-slate-700">
                                      {getPhaseTypeLabel(phase.type)}
                                    </td>
                                    <td className="whitespace-nowrap border-r border-slate-100 px-4 py-5 align-top text-sm font-semibold text-slate-600">
                                      {getPhasePromotionSummary(phase)}
                                    </td>
                                    {phaseRoundLabels.map((label, roundIndex) => (
                                      <td key={`${phase.id}-${label}`} className="whitespace-nowrap border-r border-slate-100 px-4 py-5 text-center align-top text-sm font-black text-slate-700">
                                        {rounds[roundIndex] ? `${rounds[roundIndex].matches} 场` : '-'}
                                      </td>
                                    ))}
                                    <td className="whitespace-nowrap border-r border-slate-100 px-4 py-5 align-top text-sm font-black text-emerald-600">
                                      {calculatePhaseMatches(phase)} 场
                                    </td>
                                  </React.Fragment>
                                );
                              })}
                              <td className="whitespace-nowrap border-r border-slate-100 px-5 py-5 align-top text-sm font-black text-emerald-600">
                                {projectTotalMatches} 场
                              </td>
                              <td className="whitespace-nowrap px-5 py-5 align-top">
                                <button
                                  onClick={() => {
                                    setSelectedProject(project);
                                    setIsPreviewMode(false);
                                  }}
                                  className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-black text-indigo-600 transition-colors hover:bg-indigo-100"
                                >
                                  查看详情
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center space-y-4">
                  <LayoutGrid className="w-16 h-16 text-slate-200 mx-auto" />
                  <p className="text-slate-400 font-medium">暂无可统计的项目编排数据</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="mx-auto max-w-7xl space-y-5">
                <div className="sticky top-0 z-30 rounded-[24px] border border-slate-200 bg-white/95 p-2 shadow-lg shadow-slate-200/60 backdrop-blur">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100">
                      <GitBranch className="h-4 w-4" />
                    </span>
                    <button
                      type="button"
                      onClick={onNavigateToAnnouncement}
                      title="只有已立项的项目可以编排对阵，点击前往项目立项页面"
                      className="inline-flex items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-3 py-2 font-semibold text-indigo-700 transition-all hover:border-indigo-200 hover:bg-indigo-100"
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                      立项后可编排，前往立项
                      <ArrowRight className="h-3 w-3" />
                    </button>
                    <span className="hidden h-5 w-px bg-slate-200 sm:block" />
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 font-bold text-indigo-700 ring-1 ring-inset ring-indigo-100">编排流程如下</span>
                    <button
                      type="button"
                      onClick={onNavigateToRuleTemplates}
                      title="查看或维护项目编排可引用的单场胜负规则、团体胜负规则"
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[11px] text-slate-500">1</span>
                      配置胜负规则模板
                    </button>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                    <button
                      type="button"
                      onClick={onNavigateToMatchCodeFormat}
                      title="确认本赛事生成比赛场次时采用的比赛代码格式"
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[11px] text-slate-500">2</span>
                      定义比赛代码格式
                    </button>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                    <button
                      type="button"
                      onClick={() => projectListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                      title="批量或单个配置项目赛制"
                      className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-3 py-2 font-semibold text-white shadow-sm shadow-indigo-100 transition-all hover:bg-indigo-700"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[11px] text-white">3</span>
                      比赛项目编排
                    </button>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                    <button
                      type="button"
                      onClick={() => projectListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                      title="项目赛制锁定后，在操作栏生成比赛场次"
                      className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 font-semibold text-emerald-700 transition-all hover:border-emerald-300 hover:bg-emerald-100"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] text-emerald-700">4</span>
                      编排定稿，生成比赛场次
                    </button>
                  </div>
                </div>
                <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_60px_-42px_rgba(15,23,42,0.35)]">
                  <div className="flex flex-col gap-5 border-b border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.95)_0%,rgba(255,255,255,0.9)_100%)] px-8 py-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3">
                      <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">项目编排管理</h2>
                        <p className="mt-1 text-sm text-slate-500">先对本次比赛的单项和团体项目分别设置赛事与阶段</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                      <button 
                        onClick={() => setIsPreviewMode(true)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition-all hover:border-indigo-300 hover:bg-indigo-50"
                      >
                        <LayoutGrid className="h-4 w-4" />
                        场次统计
                      </button>
                      <button 
                        onClick={() => setShowFinalizeConfirm(true)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        编排定稿
                      </button>
                    </div>
                  </div>

                  <div ref={projectListRef} className="flex flex-col gap-4 border-b border-slate-100 px-8 py-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        value={searchKeyword}
                        onChange={(event) => setSearchKeyword(event.target.value)}
                        placeholder="搜索项目名称 / 简称 / 代码"
                        className="w-72 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <select
                        value={projectTypeFilter}
                        onChange={(event) => {
                          setProjectTypeFilter(event.target.value as typeof projectTypeFilter);
                          setSelectedProject(null);
                        }}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="all">全部项目类型</option>
                        <option value="single">单项项目</option>
                        <option value="team">团体项目</option>
                      </select>
                      <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="all">全部状态</option>
                        <option value="unconfigured">未编排</option>
                        <option value="draft">编排中（草稿）</option>
                        <option value="locked">已锁定赛制</option>
                        <option value="generated">已生成比赛</option>
                      </select>
                      <button
                        onClick={handleBatchGenerate}
                        className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-700 shadow-sm shadow-indigo-200"
                      >
                        <Settings2 className="h-4 w-4" />
                        批量编排
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 px-8 py-4 text-sm text-slate-500">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">列表模式</span>
                    当前筛选出 <span className="font-bold text-slate-900">{filteredProjects.length}</span> 个项目，
                    已选 <span className="font-bold text-indigo-600">{visibleSelectedProjectIds.length}</span> 个用于批量编排。
                  </div>

                  <div className="overflow-x-auto border-t border-slate-100">
                    <table className="w-full text-left" style={{ minWidth: `${980 + phaseColumnCount * 148}px` }}>
                      <thead className="bg-slate-50/80">
                        <tr>
                          <th className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={allVisibleSelected}
                              onChange={toggleSelectAllVisible}
                              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-400">项目名称</th>
                          <th className="px-4 py-4 text-xs font-semibold text-slate-400">项目类型</th>
                          <th className="px-4 py-4 text-xs font-semibold text-slate-400">选手人数</th>
                          {Array.from({ length: phaseColumnCount }).map((_, index) => (
                            <th key={index} className="px-4 py-4 text-xs font-semibold text-slate-400">
                              第{index + 1}阶段（人数/赛制/场数）
                            </th>
                          ))}
                          <th className="px-4 py-4 text-xs font-semibold text-slate-400">总场次</th>
                          <th className="px-4 py-4 text-xs font-semibold text-slate-400">编排状态</th>
                          <th className="px-4 py-4 text-xs font-semibold text-slate-400">最新更新时间</th>
                          <th className="sticky right-0 bg-slate-50/95 px-6 py-4 text-right text-xs font-semibold text-slate-400 shadow-[-12px_0_20px_-16px_rgba(15,23,42,0.18)]">
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredProjects.map((project) => {
                          const config = getProjectConfig(project.id);
                          const statusMeta = getProjectScheduleStatusMeta(project.id);
                          const generatedPhaseIds = getProjectPhaseStatuses(project.id)
                            .filter(({ status }) => status === 'generated')
                            .map(({ phase }) => phase.id);
                          const totalMatchesCount = config.phases.reduce((total, phase) => total + calculatePhaseMatches(phase), 0);
                          const hasGeneratedPhase = generatedPhaseIds.length > 0;
                          const selected = selectedProjectIds.includes(project.id);

                          return (
                            <tr key={project.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() => toggleProjectSelection(project.id)}
                                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-1">
                                  <button
                                    onClick={() => {
                                      openProjectScheduling(project);
                                    }}
                                    className="text-left text-sm font-bold text-slate-900 transition-colors hover:text-indigo-600"
                                  >
                                    {project.name}
                                  </button>
                                  <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span>{project.short_name}</span>
                                    <span>{project.code}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 whitespace-nowrap">
                                  {project.type === 'single' ? '单项项目' : '团体项目'}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-sm font-semibold text-slate-700">{project.current_count || 0}</td>
                              {Array.from({ length: phaseColumnCount }).map((_, index) => {
                                const phase = config.phases[index];
                                return (
                                  <td
                                    key={index}
                                    className="px-4 py-4 text-sm font-semibold text-slate-700 whitespace-nowrap"
                                    title={phase ? `${phase.name}：${getPhaseTableValue(phase)}` : undefined}
                                  >
                                    {getPhaseTableValue(phase)}
                                  </td>
                                );
                              })}
                              <td className="px-4 py-4 text-sm font-semibold text-slate-700 whitespace-nowrap">
                                {totalMatchesCount > 0 ? `${totalMatchesCount} 场` : '-'}
                              </td>
                              <td className="px-4 py-4">
                                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.className}`}>
                                  {statusMeta.label}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-sm text-slate-500 whitespace-nowrap">{getProjectLatestUpdatedTime(project.id)}</td>
                              <td className="sticky right-0 bg-white px-6 py-4 text-right shadow-[-12px_0_20px_-16px_rgba(15,23,42,0.18)]">
                                <div className="flex justify-end gap-2 whitespace-nowrap">
                                  <button
                                    onClick={() => openProjectScheduling(project)}
                                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                                  >
                                    <Settings2 className="h-3.5 w-3.5" />
                                    项目编排
                                  </button>
                                  {hasGeneratedPhase && (
                                    <button
                                      onClick={() => openProjectMatchList(project)}
                                      className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-600 transition-all hover:bg-emerald-100"
                                    >
                                      <LayoutGrid className="h-3.5 w-3.5" />
                                      查看比赛列表
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {filteredProjects.length === 0 && (
                    <div className="px-8 py-16 text-center text-sm text-slate-400">当前筛选条件下暂无可编排项目</div>
                  )}
                </section>
              </div>
            </div>

        {selectedProject && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-slate-900/35 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
              className="relative z-10 flex h-[min(920px,calc(100vh-32px))] w-[min(1440px,calc(100vw-32px))] flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_32px_100px_-40px_rgba(15,23,42,0.45)]"
            >
        <div className="border-b border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.9)_0%,rgba(255,255,255,0.96)_100%)] px-6 py-5 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-50 p-2.5 text-indigo-600">
                <Settings2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold text-slate-900">{selectedProject?.name}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">按阶段分别完成配置、生成对阵、确认、锁定与生成比赛。</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                onClick={() => setSelectedProject(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-600"
                title="关闭弹窗"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-100 bg-white px-6 py-4 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1 overflow-x-auto pb-1">
              <div className="flex items-center gap-3 w-max pr-2">
                {selectedProjectPhases.length === 0 ? (
                  <div className="text-sm text-slate-400">请先添加比赛阶段</div>
                ) : (
                  selectedProjectPhases.map((phase, idx) => {
                    const phaseStatus = getPhaseStatus(selectedProject.id, phase.id);
                    const phaseMeta = getPhaseStatusMeta(phaseStatus);
                    return (
                      <button
                        key={phase.id}
                        onClick={() => {
                          setActivePhaseIndex(idx);
                          setActiveTab('bracket');
                        }}
                        className={`min-w-[180px] rounded-2xl border px-4 py-3 text-left transition-all ${
                          safeSelectedPhaseIndex === idx
                            ? 'border-indigo-200 bg-indigo-50 shadow-sm'
                            : 'border-slate-200 bg-slate-50/60 hover:border-indigo-200 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-slate-900">{phase.name}</div>
                            <div className="mt-1 text-[11px] text-slate-400">{phase.type}</div>
                          </div>
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${phaseMeta.className}`}>
                            {phaseMeta.label}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
            <button
              onClick={() => {
                if (!canAddAnotherPhase(selectedProjectPhases)) {
                  alert('当前最后一个阶段已设置为“决出名次”，不能继续添加后续阶段。');
                  return;
                }
                addPhase(selectedProject.id);
                setActivePhaseIndex(selectedProjectPhases.length);
                setActiveTab('bracket');
              }}
              className={`inline-flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold transition-all ${
                canAddAnotherPhase(selectedProjectPhases)
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                  : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300'
              }`}
              title={canAddAnotherPhase(selectedProjectPhases) ? '添加阶段' : '当前最后一个阶段已设置为“决出名次”，不能继续添加后续阶段。'}
            >
              <Plus className="h-4 w-4" />
              添加阶段
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
        {/* Column 2: 项目编排 (Phase Config) */}
        <div className="w-[420px] shrink-0 border-r border-slate-200 bg-slate-50 flex flex-col">
          <div className="border-b border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.9)_0%,rgba(255,255,255,0.92)_100%)] px-6 py-4 shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-slate-900">当前阶段配置</div>
                <div className="mt-1 text-xs text-slate-500">调整当前选中阶段的赛制、晋级与落位规则。</div>
              </div>
              {selectedPhaseStatusMeta && (
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${selectedPhaseStatusMeta.className}`}>
                  {selectedPhaseStatusMeta.label}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {selectedProject ? renderPhaseConfigurationEditor({
              phases: getProjectConfig(selectedProject.id).phases,
              projectType: selectedProject.type,
              teamEvents: selectedProject.team_events || [],
              onAddPhase: () => addPhase(selectedProject.id),
              onUpdatePhase: (phaseId, updates) => updatePhase(selectedProject.id, phaseId, updates),
              onRemovePhase: (phaseId) => removePhase(selectedProject.id, phaseId),
              onAddPromotionRule: (phaseId) => addPromotionRule(selectedProject.id, phaseId),
              onUpdatePromotionRule: (phaseId, ruleIndex, updates) => updatePromotionRule(selectedProject.id, phaseId, ruleIndex, updates),
              onRemovePromotionRule: (phaseId, ruleIndex) => removePromotionRule(selectedProject.id, phaseId, ruleIndex),
              emptyTitle: '暂未配置比赛阶段',
              emptyDescription: '请先在上方阶段导航右侧添加比赛阶段',
              canAddPhase: canAddAnotherPhase(getProjectConfig(selectedProject.id).phases),
              showAddPhaseButton: false,
              visiblePhaseIds: selectedPhase ? [selectedPhase.id] : undefined,
              contextPhases: getProjectConfig(selectedProject.id).phases,
              showPhaseImpactHint: true
            }) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                <LayoutGrid className="w-12 h-12 text-slate-300" />
                <p className="text-sm font-bold text-slate-500">请选择一个项目</p>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: 赛程安排 (Schedule) */}
        <div className="flex-1 min-w-[500px] shrink-0 border-r border-slate-200 bg-slate-50 flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 bg-white shrink-0">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-emerald-600" />
                  {selectedPhase ? `${selectedPhase.name} · 赛程安排` : '赛程安排'}
                </h3>
                {selectedPhaseStatusMeta && (
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${selectedPhaseStatusMeta.className}`}>
                    当前阶段：{selectedPhaseStatusMeta.label}
                  </span>
                )}
                {selectedPhaseHasStructure && (
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
              <div className="flex flex-wrap items-center justify-end gap-2">
                {selectedPhase && ['configured', 'draft', 'confirmed'].includes(selectedPhaseStatus || '') && (
                  <button 
                    onClick={handleSaveConfig}
                    className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 transition-all hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50"
                    title="保存当前阶段配置"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                )}
                {selectedPhaseStatus === 'configured' && (
                  <button 
                    onClick={handleGenerateBracket}
                    className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white transition-all hover:bg-indigo-700 shadow-sm shadow-indigo-200"
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    生成对阵
                  </button>
                )}
                {selectedPhaseStatus === 'draft' && (
                  <button 
                    onClick={handleConfirmCurrentPhase}
                    className="inline-flex items-center gap-1 rounded-xl bg-sky-600 px-3.5 py-2 text-xs font-bold text-white transition-all hover:bg-sky-700 shadow-sm shadow-sky-200"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    确认阶段
                  </button>
                )}
                {selectedPhaseStatus === 'confirmed' && (
                  <button 
                    onClick={handleLockCurrentPhase}
                    className="inline-flex items-center gap-1 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-bold text-white transition-all hover:bg-violet-700 shadow-sm shadow-violet-200"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    锁定阶段
                  </button>
                )}
                {selectedPhaseStatus === 'locked' && (
                  <button 
                    onClick={handleGenerateFramework}
                    className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white transition-all hover:bg-indigo-700 shadow-sm shadow-indigo-200"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    生成比赛
                  </button>
                )}
                {selectedPhaseStatus === 'generated' && (
                  <button 
                    onClick={() => setActiveTab('list')}
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-700 shadow-sm shadow-emerald-200"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    查看比赛列表
                  </button>
                )}
                {selectedPhaseHasStructure && (
                  <button 
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    title="导出赛程"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {!selectedProject || !selectedPhaseHasStructure ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                <GitBranch className="w-12 h-12 text-slate-300" />
                <p className="text-sm font-bold text-slate-500">当前阶段暂无赛程数据</p>
                <p className="text-xs text-slate-400">请先针对当前阶段生成对阵，并继续完成确认与锁定。</p>
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
        </div>
            </motion.div>
          </div>
        )}
          </>
        )}
      </div>
      <AnimatePresence>
        {showBatchSchedulingModal && (
          <div className="fixed inset-0 z-[190] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBatchSchedulingModal(false)}
              className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="relative flex max-h-[calc(100vh-32px)] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_32px_90px_-36px_rgba(15,23,42,0.45)]"
            >
              <div className="flex items-start justify-between border-b border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.95)_0%,rgba(255,255,255,0.92)_100%)] px-8 py-7">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                      <Settings2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight text-slate-900">批量配置赛制</h3>
                      <p className="mt-1 text-sm text-slate-500">支持为以下项目批量配置赛制，点击“开始编排”一键生成对阵，后续仍可单独调整。</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedBatchProjects.slice(0, 5).map((project) => (
                      <span
                        key={project.id}
                        className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm"
                      >
                        {project.name}
                      </span>
                    ))}
                    {selectedBatchProjects.length > 5 && (
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
                        +{selectedBatchProjects.length - 5} 个项目
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowBatchSchedulingModal(false)}
                  className="rounded-full p-2 text-slate-400 transition-all hover:bg-white hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-8 py-7">
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">选择赛制模板</h4>
                    </div>

                    <div className="space-y-2">
                      <input
                        value={batchTemplateKeyword}
                        onChange={(event) => setBatchTemplateKeyword(event.target.value)}
                        placeholder="搜索模板名称"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="space-y-3">
                      {filteredBatchPlanningTemplates.map((template) => {
                        const selected = batchSchedulingDraft.templateId === template.id;
                        return (
                          <button
                            key={template.id}
                            onClick={() => {
                              setBatchSchedulingDraft((prev) => ({
                                ...prev,
                                templateId: template.id
                              }));
                            }}
                            className={`w-full rounded-2xl border p-4 text-left transition-all ${
                              selected
                                ? 'border-indigo-200 bg-indigo-50 shadow-sm'
                                : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className={`text-sm font-bold ${selected ? 'text-indigo-700' : 'text-slate-900'}`}>{template.name}</div>
                                <div className="text-xs leading-5 text-slate-500">{template.description}</div>
                              </div>
                              <div className={`mt-0.5 h-4 w-4 rounded-full border-2 ${selected ? 'border-indigo-600 bg-indigo-600 shadow-[inset_0_0_0_3px_white]' : 'border-slate-300 bg-white'}`} />
                            </div>
                          </button>
                        );
                      })}
                      {filteredBatchPlanningTemplates.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
                          暂无匹配的赛制模板
                        </div>
                      )}
                    </div>

                  </div>

                  <div className="min-w-0 rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">赛制预览</h4>
                      </div>
                      <div className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm">
                        {batchTemplatePhases.length} 个阶段
                      </div>
                    </div>

                    {renderPhaseConfigurationEditor({
                      phases: batchTemplatePhases,
                      projectType: batchProjectType,
                      teamEvents: batchProjectType === 'team' ? batchPlanningTeamEvents : [],
                      onAddPhase: addBatchTemplatePhase,
                      onUpdatePhase: updateBatchTemplatePhase,
                      onRemovePhase: removeBatchTemplatePhase,
                      onAddPromotionRule: addBatchPromotionRule,
                      onUpdatePromotionRule: updateBatchPromotionRule,
                      onRemovePromotionRule: removeBatchPromotionRule,
                      emptyTitle: '当前模板还没有配置比赛阶段',
                      emptyDescription: '请先补充模板中的阶段与晋级规则，再开始批量编排',
                      canAddPhase: canAddAnotherPhase(batchTemplatePhases),
                      collapsible: true,
                      participantCountMode: 'per_project_auto',
                      expandedPhaseIds: batchExpandedPhaseIds,
                      onTogglePhase: (phaseId) =>
                        setBatchExpandedPhaseIds((prev) =>
                          prev.includes(phaseId) ? prev.filter((id) => id !== phaseId) : [...prev, phaseId]
                        )
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-8 py-5">
                <button
                  onClick={() => setShowBatchSchedulingModal(false)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  onClick={handleApplyBatchScheduling}
                  disabled={batchPlanLoading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                >
                  <Settings2 className="h-4 w-4" />
                  {batchPlanLoading ? '编排中...' : '开始编排'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showBatchPlanResult && batchPlanResult && (
          <div className="fixed inset-0 z-[195] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBatchPlanResult(false)}
              className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_32px_90px_-36px_rgba(15,23,42,0.45)]"
            >
              <div className="border-b border-slate-100 px-8 py-7">
                <h3 className="text-2xl font-black tracking-tight text-slate-900">批量编排完成</h3>
                <p className="mt-2 text-sm text-slate-500">成功：{batchPlanResult.successCount} 个，失败：{batchPlanResult.failedCount} 个</p>
              </div>

              <div className="space-y-5 px-8 py-7">
                {batchPlanResult.failedItems.length > 0 ? (
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5">
                    <h4 className="text-sm font-bold text-rose-700">失败项目</h4>
                    <div className="mt-3 space-y-2 text-sm text-rose-600">
                      {batchPlanResult.failedItems.map((item) => (
                        <div key={`${item.projectName}-${item.reason}`} className="flex items-center justify-between gap-4 rounded-xl bg-white/80 px-4 py-3">
                          <span>项目：{item.projectName}</span>
                          <span>原因：{item.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
                    本次批量编排全部成功，所有结构已写入 Draft。
                  </div>
                )}

                <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50 px-4 py-4 text-sm text-indigo-700">
                  编排完成，请检查结构后进行“锁定赛制”。
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-100 px-8 py-5">
                <button
                  onClick={() => setShowBatchPlanResult(false)}
                  className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                >
                  我知道了
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronRight, 
  User, 
  Users, 
  Trophy, 
  CreditCard,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  X,
  Phone,
  FileText,
  ShieldCheck,
  MapPin,
  ExternalLink,
  ArrowRight,
  RotateCcw
  ,Layers3
} from 'lucide-react';
import { 
  RegistrationOrder, 
  RegistrationEntry, 
  ParticipantRecord, 
  TeamRecord,
  PayStatus,
  EntryStatus,
  PostDeadlineEditableField,
  PostDeadlineEditUntilMode
} from '../types';
import { MOCK_ORDERS, MOCK_PROJECT_SUMMARY, MOCK_PARTICIPANTS, MOCK_TEAMS } from '../constants';
import { TablePagination } from './TablePagination';

type RecordTab = 'orders' | 'project_summary' | 'participants' | 'teams';
type OrderDetailTab = 'projects' | 'payments' | 'refunds';
type EntryDetailTab = 'order' | 'team' | 'participants' | 'payments' | 'refunds';

interface RegistrationRecordsProps {
  initialTab?: RecordTab;
  showTabs?: boolean;
  postDeadlineEditConfig?: {
    enabled: boolean;
    untilMode: PostDeadlineEditUntilMode;
    customDate?: string;
    editableFields: PostDeadlineEditableField[];
    eventStartTime?: string;
  };
}

interface EntryParticipantView {
  id: string;
  name: string;
  phone: string;
  gender: string;
  idType: string;
  idNumber: string;
  tshirtSize: string;
  participantStatus?: 'active' | 'exited_team' | 'replaced_old' | 'replaced_new';
  statusText?: string;
  statusNote?: string;
}

interface ParticipantEntryRelation {
  order: RegistrationOrder;
  entry: RegistrationEntry;
}

const POST_DEADLINE_EDIT_SCOPE_LABELS: Record<PostDeadlineEditableField, string> = {
  [PostDeadlineEditableField.PROFILE]: '个人资料字段',
  [PostDeadlineEditableField.IDENTITY]: '证件信息',
  [PostDeadlineEditableField.EXTRA_FIELDS]: '报名附加字段',
  [PostDeadlineEditableField.TEAM_INFO]: '队伍信息',
};

export const RegistrationRecords: React.FC<RegistrationRecordsProps> = ({
  initialTab,
  showTabs = true,
  postDeadlineEditConfig,
}) => {
  const [activeTab, setActiveTab] = useState<RecordTab>(initialTab || 'orders');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [expandedParticipant, setExpandedParticipant] = useState<string | null>(null);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<RegistrationOrder | null>(null);
  const [selectedEntryForDetail, setSelectedEntryForDetail] = useState<RegistrationEntry | null>(null);
  const [selectedParticipantForOverview, setSelectedParticipantForOverview] = useState<ParticipantRecord | null>(null);
  const [selectedParticipantForDetail, setSelectedParticipantForDetail] = useState<RegistrationEntry | null>(null);
  const [selectedTeamForDetail, setSelectedTeamForDetail] = useState<TeamRecord | null>(null);
  const [replaceParticipantTarget, setReplaceParticipantTarget] = useState<{ entry: RegistrationEntry; participant: EntryParticipantView } | null>(null);
  const [replacementFormData, setReplacementFormData] = useState<EntryParticipantView>({
    id: '',
    name: '',
    phone: '',
    gender: '男',
    idType: '身份证',
    idNumber: '',
    tshirtSize: 'L',
  });
  const [refundEntryTarget, setRefundEntryTarget] = useState<RegistrationEntry | null>(null);
  const [refundAmountInput, setRefundAmountInput] = useState('');
  const [entryRefundedAmounts, setEntryRefundedAmounts] = useState<Record<string, number>>({});
  const [entryReplacementRecords, setEntryReplacementRecords] = useState<Record<string, { oldParticipant: EntryParticipantView; newParticipant: EntryParticipantView }>>({});
  const [teamExitedParticipantKeys, setTeamExitedParticipantKeys] = useState<Record<string, string[]>>({});
  const [orderDetailTab, setOrderDetailTab] = useState<OrderDetailTab>('projects');
  const [entryDetailTab, setEntryDetailTab] = useState<EntryDetailTab>('order');
  const [isEditingParticipant, setIsEditingParticipant] = useState(false);
  const [editingParticipantData, setEditingParticipantData] = useState<RegistrationEntry | null>(null);
  
  // Search states
  const [projectSearch, setProjectSearch] = useState('');
  const [projectTypeSearch, setProjectTypeSearch] = useState('');
  const [projectSearchDraft, setProjectSearchDraft] = useState('');
  const [projectTypeSearchDraft, setProjectTypeSearchDraft] = useState('');
  
  // Participant search states
  const [participantNameSearch, setParticipantNameSearch] = useState('');
  const [participantPhoneSearch, setParticipantPhoneSearch] = useState('');
  const [participantNameSearchDraft, setParticipantNameSearchDraft] = useState('');
  const [participantPhoneSearchDraft, setParticipantPhoneSearchDraft] = useState('');

  // Team search states
  const [teamNameSearch, setTeamNameSearch] = useState('');
  const [teamLeaderSearch, setTeamLeaderSearch] = useState('');
  const [teamGroupSearch, setTeamGroupSearch] = useState('');
  const [teamNameSearchDraft, setTeamNameSearchDraft] = useState('');
  const [teamLeaderSearchDraft, setTeamLeaderSearchDraft] = useState('');
  const [teamGroupSearchDraft, setTeamGroupSearchDraft] = useState('');
  
  // Order search states
  const [orderNoSearch, setOrderNoSearch] = useState('');
  const [orderUserSearch, setOrderUserSearch] = useState('');
  const [orderProjectSearch, setOrderProjectSearch] = useState('');
  const [orderParticipantSearch, setOrderParticipantSearch] = useState('');
  const [orderTeamSearch, setOrderTeamSearch] = useState('');
  const [orderPayStatusSearch, setOrderPayStatusSearch] = useState('');
  const [orderEntryStatusSearch, setOrderEntryStatusSearch] = useState('');
  const [orderDateSearch, setOrderDateSearch] = useState('');
  const [orderNoSearchDraft, setOrderNoSearchDraft] = useState('');
  const [orderUserSearchDraft, setOrderUserSearchDraft] = useState('');
  const [orderProjectSearchDraft, setOrderProjectSearchDraft] = useState('');
  const [orderParticipantSearchDraft, setOrderParticipantSearchDraft] = useState('');
  const [orderTeamSearchDraft, setOrderTeamSearchDraft] = useState('');
  const [orderPayStatusSearchDraft, setOrderPayStatusSearchDraft] = useState('');
  const [orderEntryStatusSearchDraft, setOrderEntryStatusSearchDraft] = useState('');
  const [orderDateSearchDraft, setOrderDateSearchDraft] = useState('');
  const [orderFiltersExpanded, setOrderFiltersExpanded] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPageSize, setOrdersPageSize] = useState(10);
  const [projectSummaryPage, setProjectSummaryPage] = useState(1);
  const [projectSummaryPageSize, setProjectSummaryPageSize] = useState(10);
  const [participantsPage, setParticipantsPage] = useState(1);
  const [participantsPageSize, setParticipantsPageSize] = useState(10);
  const [teamsPage, setTeamsPage] = useState(1);
  const [teamsPageSize, setTeamsPageSize] = useState(10);

  useEffect(() => {
    if (selectedEntryForDetail) {
      setEntryDetailTab('order');
    }
  }, [selectedEntryForDetail]);

  // Project interaction states
  const [selectedProjectForDetails, setSelectedProjectForDetails] = useState<any | null>(null);
  const [selectedParticipantForAdjustment, setSelectedParticipantForAdjustment] = useState<any | null>(null);
  const [isProjectAdjustmentModalOpen, setIsProjectAdjustmentModalOpen] = useState(false);
  const [newProjectForAdjustment, setNewProjectForAdjustment] = useState('');
  const [projectSummary, setProjectSummary] = useState(MOCK_PROJECT_SUMMARY);
  const [projectToEstablish, setProjectToEstablish] = useState<any | null>(null);

  const applyOrderSearch = () => {
    setOrderNoSearch(orderNoSearchDraft);
    setOrderUserSearch(orderUserSearchDraft);
    setOrderProjectSearch(orderProjectSearchDraft);
    setOrderParticipantSearch(orderParticipantSearchDraft);
    setOrderTeamSearch(orderTeamSearchDraft);
    setOrderPayStatusSearch(orderPayStatusSearchDraft);
    setOrderEntryStatusSearch(orderEntryStatusSearchDraft);
    setOrderDateSearch(orderDateSearchDraft);
    setOrdersPage(1);
  };

  const resetOrderSearch = () => {
    setOrderNoSearchDraft('');
    setOrderUserSearchDraft('');
    setOrderProjectSearchDraft('');
    setOrderParticipantSearchDraft('');
    setOrderTeamSearchDraft('');
    setOrderPayStatusSearchDraft('');
    setOrderEntryStatusSearchDraft('');
    setOrderDateSearchDraft('');
    setOrderNoSearch('');
    setOrderUserSearch('');
    setOrderProjectSearch('');
    setOrderParticipantSearch('');
    setOrderTeamSearch('');
    setOrderPayStatusSearch('');
    setOrderEntryStatusSearch('');
    setOrderDateSearch('');
    setOrdersPage(1);
  };

  const applyProjectSummarySearch = () => {
    setProjectSearch(projectSearchDraft);
    setProjectTypeSearch(projectTypeSearchDraft);
    setProjectSummaryPage(1);
  };

  const resetProjectSummarySearch = () => {
    setProjectSearchDraft('');
    setProjectTypeSearchDraft('');
    setProjectSearch('');
    setProjectTypeSearch('');
    setProjectSummaryPage(1);
  };

  const applyParticipantSearch = () => {
    setParticipantNameSearch(participantNameSearchDraft);
    setParticipantPhoneSearch(participantPhoneSearchDraft);
    setParticipantsPage(1);
  };

  const resetParticipantSearch = () => {
    setParticipantNameSearchDraft('');
    setParticipantPhoneSearchDraft('');
    setParticipantNameSearch('');
    setParticipantPhoneSearch('');
    setParticipantsPage(1);
  };

  const applyTeamSearch = () => {
    setTeamNameSearch(teamNameSearchDraft);
    setTeamLeaderSearch(teamLeaderSearchDraft);
    setTeamGroupSearch(teamGroupSearchDraft);
    setTeamsPage(1);
  };

  const resetTeamSearch = () => {
    setTeamNameSearchDraft('');
    setTeamLeaderSearchDraft('');
    setTeamGroupSearchDraft('');
    setTeamNameSearch('');
    setTeamLeaderSearch('');
    setTeamGroupSearch('');
    setTeamsPage(1);
  };

  const handleConfirmEstablishment = (projectId: string) => {
    setProjectSummary(prev => prev.map(p => 
      p.id === projectId ? { ...p, establishment_status: '已立项' } : p
    ));
    setProjectToEstablish(null);
  };

  const handleCancelProject = (projectId: string) => {
    setProjectSummary(prev => prev.map(p => 
      p.id === projectId ? { ...p, establishment_status: '已取消', status: '已取消' } : p
    ));
  };

  const handleProjectAdjustment = (participantId: string, oldProjectId: string, newProjectId: string | 'REFUND') => {
    if (newProjectId === 'REFUND') {
      alert(`已为选手 [${selectedParticipantForAdjustment?.name}] 办理退款并取消报名`);
      // Update counts in project summary
      setProjectSummary(prev => prev.map(p => {
        if (p.id === oldProjectId) return { ...p, current_count: p.current_count - 1 };
        return p;
      }));
    } else {
      const newProject = projectSummary.find(p => p.id === newProjectId);
      alert(`选手 [${selectedParticipantForAdjustment?.name}] 已从 [${selectedProjectForDetails?.name}] 调整至 [${newProject?.name}]`);
      
      // Update counts in project summary
      setProjectSummary(prev => prev.map(p => {
        if (p.id === oldProjectId) return { ...p, current_count: p.current_count - 1 };
        if (p.id === newProjectId) return { ...p, current_count: p.current_count + 1 };
        return p;
      }));
    }
    setIsProjectAdjustmentModalOpen(false);
    setSelectedParticipantForAdjustment(null);
  };

  const handleEditParticipant = () => {
    if (selectedParticipantForDetail) {
      setEditingParticipantData({ ...selectedParticipantForDetail });
      setIsEditingParticipant(true);
    }
  };

  const handleSaveParticipant = () => {
    if (editingParticipantData) {
      // In a real app, this would be an API call
      setSelectedParticipantForDetail(editingParticipantData);
      setIsEditingParticipant(false);
      alert('选手信息已更新');
    }
  };

  const findParticipantRecord = (name?: string, phone?: string) =>
    MOCK_PARTICIPANTS.find((participant) => {
      if (name && phone) return participant.name === name && participant.phone === phone;
      if (name) return participant.name === name;
      if (phone) return participant.phone === phone;
      return false;
    });

  const getParticipantEntryRelations = (participant: Pick<ParticipantRecord, 'name' | 'phone'>): ParticipantEntryRelation[] =>
    MOCK_ORDERS.flatMap((order) =>
      order.entries
        .filter((entry) =>
          getEntryParticipants(entry).some(
            (person) => person.name === participant.name && person.phone === participant.phone,
          ),
        )
        .map((entry) => ({ order, entry })),
    );

  const getTeamEntryRelations = (teamName: string): ParticipantEntryRelation[] =>
    MOCK_ORDERS.flatMap((order) =>
      order.entries
        .filter((entry) => entry.team_name === teamName)
        .map((entry) => ({ order, entry })),
    );

  const getEntryParticipants = (entry: RegistrationEntry): EntryParticipantView[] => {
    if (entry.team_members && entry.team_members.length > 0) {
      return entry.team_members.map((member, index) => {
        const profile = findParticipantRecord(member.name, member.phone);
        return {
          id: `${entry.id}-member-${index}`,
          name: member.name,
          phone: member.phone || profile?.phone || '--',
          gender: member.gender || profile?.gender || entry.form_data?.gender || '--',
          idType: entry.form_data?.id_type || '身份证',
          idNumber: member.id_number || profile?.identity || entry.form_data?.id_number || '--',
          tshirtSize: entry.form_data?.tshirt_size || '--',
        };
      });
    }

    const names = entry.participant_name
      .split('/')
      .map((name) => name.trim())
      .filter(Boolean);

    return names.map((name, index) => {
      const profile = findParticipantRecord(name, index === 0 ? entry.participant_phone : undefined);
      return {
        id: `${entry.id}-participant-${index}`,
        name,
        phone: profile?.phone || (index === 0 ? entry.participant_phone : '--'),
        gender: profile?.gender || entry.form_data?.gender || '--',
        idType: entry.form_data?.id_type || '身份证',
        idNumber: profile?.identity || entry.form_data?.id_number || '--',
        tshirtSize: entry.form_data?.tshirt_size || '--',
      };
    });
  };

  const createParticipantDetailEntry = (
    entry: RegistrationEntry,
    participant: EntryParticipantView,
  ): RegistrationEntry => ({
    ...entry,
    participant_name: participant.name,
    participant_phone: participant.phone,
    form_data: {
      gender: participant.gender,
      tshirt_size: participant.tshirtSize,
      id_type: participant.idType,
      id_number: participant.idNumber,
    },
  });

  const openParticipantForm = (entry: RegistrationEntry, participant?: EntryParticipantView) => {
    const resolvedParticipant = participant || getEntryParticipants(entry)[0];
    if (!resolvedParticipant) return;
    setSelectedParticipantForDetail(createParticipantDetailEntry(entry, resolvedParticipant));
    setIsEditingParticipant(false);
  };

  const getEntryTeamRecord = (entry: RegistrationEntry): TeamRecord | undefined =>
    MOCK_TEAMS.find((team) => team.id === entry.team_id || team.name === entry.team_name);

  const getTeamDetailFromEntry = (entry: RegistrationEntry): TeamRecord | null => {
    if (!entry.team_name) return null;
    const matchedTeam = getEntryTeamRecord(entry);
    if (matchedTeam) {
      return {
        ...matchedTeam,
        members: matchedTeam.members || entry.team_members,
        entries: matchedTeam.entries || MOCK_ORDERS.flatMap((order) => order.entries).filter((item) => item.team_name === matchedTeam.name),
      };
    }

    return {
      id: entry.team_id || `TEAM-${entry.id}`,
      name: entry.team_name,
      invite_code: `${(entry.team_name || 'TEAM').slice(0, 4).toUpperCase()}2026`,
      creator_name: entry.team_members?.[0]?.name || entry.participant_name,
      creator_phone: entry.team_members?.[0]?.phone || entry.participant_phone,
      leader: entry.team_members?.[0]?.name || entry.participant_name,
      leader_phone: entry.team_members?.[0]?.phone || entry.participant_phone,
      liaison_name: '--',
      liaison_phone: '--',
      coach_name: '--',
      coach_phone: '--',
      coaches: [],
      logo_url: '',
      flag_url: '',
      uniforms: [],
      member_count: entry.team_members?.length || getEntryParticipants(entry).length,
      members: entry.team_members,
      event_count: 1,
      events: [entry.registration_event_name],
      entries: [entry],
    };
  };

  const getTeamCoaches = (team?: TeamRecord | null) => {
    if (!team) return [];
    if (team.coaches && team.coaches.length > 0) return team.coaches;
    if (team.coach_name) {
      return [{ name: team.coach_name, phone: team.coach_phone || '--' }];
    }
    return [];
  };

  const openTeamDetail = (entry: RegistrationEntry) => {
    const team = getTeamDetailFromEntry(entry);
    if (team) setSelectedTeamForDetail(team);
  };

  const getOrderForEntry = (entry?: RegistrationEntry) =>
    entry ? MOCK_ORDERS.find((order) => order.id === entry.order_id || order.order_no === entry.order_no) || null : null;

  const getOrderSigningInfo = (entry?: RegistrationEntry) =>
    entry ? MOCK_ORDERS.find((order) => order.id === entry.order_id)?.signing_info || [] : [];

  const getParticipantSigningInfo = (entry: RegistrationEntry, participant: EntryParticipantView) =>
    getOrderSigningInfo(entry).map((sign) => ({
      ...sign,
      participant_name: participant.name,
    }));

  const getEntryParticipantKey = (entry: RegistrationEntry, participant: EntryParticipantView) =>
    `${entry.id}:${participant.name}:${participant.phone}`;

  const getOrderPaymentRecords = (order: RegistrationOrder) => {
    if (order.pay_status === PayStatus.UNPAID) {
      return [
        {
          id: `payment-${order.id}-pending`,
          title: '待支付订单',
          status: '待支付',
          amount: order.pay_amount,
          time: order.created_at,
          method: '微信支付',
          note: '用户已提交订单，尚未完成支付。',
        },
      ];
    }

    return [
      {
        id: `payment-${order.id}-paid`,
        title: '订单支付',
        status: order.pay_status === PayStatus.REFUNDED ? '已支付' : order.pay_status,
        amount: order.pay_amount,
        time: order.updated_at,
        method: '微信支付',
        note: `支付订单号 ${order.order_no}`,
      },
    ];
  };

  const getOrderRefundRecords = (order: RegistrationOrder) => {
    if (order.pay_status !== PayStatus.REFUNDED) return [];
    return [
      {
        id: `refund-${order.id}`,
        title: '订单退款',
        status: '已退款',
        amount: order.pay_amount,
        time: order.updated_at,
        note: `原支付订单号 ${order.order_no}`,
      },
    ];
  };

  const getRefundedAmount = (entry: RegistrationEntry) => entryRefundedAmounts[entry.id] || 0;

  const getRefundableAmount = (entry: RegistrationEntry) =>
    Math.max(entry.actual_amount - getRefundedAmount(entry), 0);

  const getDefaultPostDeadlinePermissionDeadline = () => {
    if (!postDeadlineEditConfig) return '';
    if (
      postDeadlineEditConfig.untilMode === PostDeadlineEditUntilMode.CUSTOM_DATE &&
      postDeadlineEditConfig.customDate
    ) {
      return postDeadlineEditConfig.customDate;
    }
    return postDeadlineEditConfig.eventStartTime || '';
  };

  const getEntryEditPermissionStatus = (entry: RegistrationEntry) => {
    if (postDeadlineEditConfig?.enabled) {
      return {
        enabled: true,
        deadline: getDefaultPostDeadlinePermissionDeadline(),
        source: 'event' as const,
      };
    }
    return {
      enabled: false,
      deadline: '',
      source: 'none' as const,
    };
  };

  const canRefundEntry = (entry: RegistrationEntry) =>
    entry.pay_status !== PayStatus.UNPAID &&
    entry.entry_status !== EntryStatus.REFUNDED &&
    entry.entry_status !== EntryStatus.CANCELLED &&
    getRefundableAmount(entry) > 0;

  const requestEntryRefund = (entry: RegistrationEntry) => {
    if (!canRefundEntry(entry)) return;
    setRefundEntryTarget(entry);
    setRefundAmountInput(getRefundableAmount(entry).toFixed(2));
  };

  const confirmEntryRefund = () => {
    if (!refundEntryTarget) return;
    const amount = Number(refundAmountInput);
    const remaining = getRefundableAmount(refundEntryTarget);
    if (!Number.isFinite(amount) || amount <= 0) {
      alert('请输入正确的退款金额');
      return;
    }
    if (amount > remaining) {
      alert('退款金额不能超过剩余可退款金额');
      return;
    }
    setEntryRefundedAmounts((prev) => ({
      ...prev,
      [refundEntryTarget.id]: Number((getRefundedAmount(refundEntryTarget) + amount).toFixed(2)),
    }));
    setRefundEntryTarget(null);
    setRefundAmountInput('');
    alert('退款申请已提交，将原路退回至用户原支付账户');
  };

  const handleParticipantQuitTeam = (entry: RegistrationEntry, participant?: EntryParticipantView) => {
    if (entry.type !== 'team') return;
    const target = participant || getEntryParticipants(entry)[0];
    if (!target) return;
    const targetName = target.name;
    if (confirm(`确定让选手「${targetName}」退出队伍「${entry.team_name}」吗？`)) {
      setTeamExitedParticipantKeys((prev) => {
        const current = prev[entry.id] || [];
        const targetKey = getEntryParticipantKey(entry, target);
        if (current.includes(targetKey)) return prev;
        return {
          ...prev,
          [entry.id]: [...current, targetKey],
        };
      });
      alert('已提交退出队伍申请');
    }
  };

  const handleReplaceParticipant = (entry: RegistrationEntry, participant?: EntryParticipantView) => {
    if (entry.type !== 'single') return;
    const currentParticipant = participant || getEntryParticipants(entry)[0];
    if (!currentParticipant) return;
    setReplaceParticipantTarget({ entry, participant: currentParticipant });
    setReplacementFormData({
      id: '',
      name: '',
      phone: '',
      gender: currentParticipant.gender || '男',
      idType: currentParticipant.idType || '身份证',
      idNumber: '',
      tshirtSize: currentParticipant.tshirtSize || 'L',
    });
  };

  const submitReplaceParticipant = () => {
    if (!replaceParticipantTarget) return;
    if (!replacementFormData.name.trim() || !replacementFormData.phone.trim()) {
      alert('请先填写更换选手的姓名和手机号');
      return;
    }

    const newParticipant: EntryParticipantView = {
      ...replacementFormData,
      id: `${replaceParticipantTarget.entry.id}-replacement`,
      name: replacementFormData.name.trim(),
      phone: replacementFormData.phone.trim(),
    };

    setEntryReplacementRecords((prev) => ({
      ...prev,
      [replaceParticipantTarget.entry.id]: {
        oldParticipant: replaceParticipantTarget.participant,
        newParticipant,
      },
    }));
    setReplaceParticipantTarget(null);
    alert('已提交更换选手申请');
  };

  const getDetailedEntryParticipants = (entry: RegistrationEntry): EntryParticipantView[] => {
    const baseParticipants = getEntryParticipants(entry);

    if (entry.type === 'single') {
      const replacementRecord = entryReplacementRecords[entry.id];
      if (!replacementRecord) return baseParticipants;

      return [
        {
          ...replacementRecord.oldParticipant,
          participantStatus: 'replaced_old',
          statusText: '已退出',
          statusNote: `变更为 ${replacementRecord.newParticipant.name}`,
        },
        {
          ...replacementRecord.newParticipant,
          participantStatus: 'replaced_new',
          statusText: '当前选手',
          statusNote: `由 ${replacementRecord.oldParticipant.name} 变更而来`,
        },
      ];
    }

    const exitedKeys = teamExitedParticipantKeys[entry.id] || [];
    return baseParticipants.map((participant) => {
      const participantKey = getEntryParticipantKey(entry, participant);
      if (!exitedKeys.includes(participantKey)) return participant;
      return {
        ...participant,
        participantStatus: 'exited_team',
        statusText: '已退出队伍',
      };
    });
  };

  const getOrderProjects = (order: RegistrationOrder) =>
    order.entries.map((entry) => ({
      id: entry.id,
      name: entry.registration_event_name,
      type: entry.type === 'team' ? '团体项目' : '单项项目',
    }));

  const getOrderParticipantsSummary = (order: RegistrationOrder) =>
    order.entries.flatMap((entry) =>
      getEntryParticipants(entry).map((participant) => ({
        key: `${entry.id}-${participant.name}-${participant.phone}`,
        name: participant.name,
        phone: participant.phone,
      })),
    );

  const getOrderTeams = (order: RegistrationOrder) =>
    Array.from(new Set(order.entries.map((entry) => entry.team_name).filter(Boolean) as string[]));

  const getOrderEntryStatusSummary = (order: RegistrationOrder) => {
    const uniqueStatuses = Array.from(new Set(order.entries.map((entry) => entry.entry_status)));
    return uniqueStatuses;
  };

  const getPaymentMethodLabel = (order: RegistrationOrder) => {
    if (order.pay_status === PayStatus.UNPAID) return '--';
    if (order.order_source?.includes('后台')) return '线下转账';
    return '微信支付';
  };

  const getOrderDiscountDetailText = (order: RegistrationOrder) =>
    order.entries
      .map(
        (entry) =>
          `${entry.registration_event_name}：-¥${entry.discount_amount.toFixed(2)}`,
      )
      .join(' ｜ ');

  const handleCancelOrder = (order: RegistrationOrder) => {
    if (order.pay_status !== PayStatus.UNPAID) return;
    if (confirm(`确定要取消订单「${order.order_no}」吗？`)) {
      alert('订单已取消');
    }
  };

  const renderOrderEntryCard = (
    order: RegistrationOrder,
    entry: RegistrationEntry,
    options?: {
      selected?: boolean;
      showDetailButton?: boolean;
      showRefundButton?: boolean;
      onSelect?: () => void;
      onViewDetails?: () => void;
    },
  ) => {
    const participants = getEntryParticipants(entry);
    const selected = options?.selected || false;
    const showDetailButton = options?.showDetailButton ?? true;
    const showRefundButton = options?.showRefundButton ?? false;
    const onSelect = options?.onSelect;
    const onViewDetails = options?.onViewDetails;
    const canRefund = canRefundEntry(entry);

    return (
      <div
        key={entry.id}
        role={onSelect ? 'button' : undefined}
        tabIndex={onSelect ? 0 : undefined}
        onClick={onSelect}
        onKeyDown={onSelect ? (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect();
          }
        } : undefined}
        className={`rounded-xl border p-4 shadow-sm transition-all ${
          selected
            ? 'border-indigo-500 bg-indigo-50 shadow-indigo-100'
            : 'border-slate-200 bg-white'
        } ${onSelect ? 'cursor-pointer' : ''}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-sm font-bold ${selected ? 'text-indigo-700' : 'text-slate-900'}`}>
                {entry.registration_event_name}
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {entry.type === 'team' ? '团体项目' : '单项项目'}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                entry.entry_status === EntryStatus.SUCCESS ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
              }`}>
                {entry.entry_status}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {participants.map((participant) => (
                <button
                  key={participant.id}
                  onClick={(event) => {
                    event.stopPropagation();
                    openParticipantForm(entry, participant);
                  }}
                  className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 hover:bg-indigo-100 hover:border-indigo-200 transition-all"
                >
                  {participant.name}
                </button>
              ))}
              {entry.team_name && (
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    openTeamDetail(entry);
                  }}
                  className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 hover:bg-indigo-100 transition-all"
                >
                  队伍：{entry.team_name}
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {selected && <ChevronRight className="w-4 h-4 text-indigo-500" />}
            {showRefundButton && (
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  requestEntryRefund(entry);
                }}
                disabled={!canRefund}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                  canRefund
                    ? 'text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100'
                    : 'text-slate-400 bg-slate-100 cursor-not-allowed'
                }`}
              >
                退款
              </button>
            )}
            {showDetailButton && (
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  if (onViewDetails) {
                    onViewDetails();
                    return;
                  }
                  setSelectedEntryForDetail(entry);
                }}
                className="text-indigo-600 hover:text-indigo-700 text-[10px] font-bold bg-indigo-50 px-3 py-1.5 rounded-lg transition-all"
              >
                查看详情
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-[10px]">
          <div>
            <p className="font-bold text-slate-400 uppercase">用户实付金额</p>
            <p
              className="mt-0.5 font-bold text-indigo-600"
              title={`报名费：¥${entry.fee.toFixed(2)} ｜ 押金：¥${entry.deposit_amount.toFixed(2)} ｜ 优惠金额：-¥${entry.discount_amount.toFixed(2)} ｜ 应付金额：¥${entry.actual_amount.toFixed(2)}`}
            >
              ¥{entry.actual_amount.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="font-bold text-slate-400 uppercase">更新时间</p>
            <p className="mt-0.5 text-slate-500 font-mono">{entry.updated_at}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderParticipantSnapshotCard = (entry: RegistrationEntry, participant: EntryParticipantView, index: number) => {
    const participantEntry = createParticipantDetailEntry(entry, participant);
    const participantSigningInfo = getParticipantSigningInfo(entry, participant);
    return (
      <div key={participant.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold text-slate-900">{participantEntry.participant_name}</p>
              {participant.statusText && (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  participant.participantStatus === 'replaced_new'
                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                    : 'bg-rose-50 text-rose-600 border border-rose-100'
                }`}>
                  {participant.statusText}
                </span>
              )}
            </div>
            <p className="mt-1 text-[11px] font-mono text-slate-500">{participantEntry.participant_phone}</p>
            {participant.statusNote && (
              <p className="mt-1 text-[11px] text-slate-500">{participant.statusNote}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {entry.type === 'single' && participant.participantStatus !== 'replaced_old' && (
              <button
                onClick={() => handleReplaceParticipant(entry, participant)}
                className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-600 hover:bg-amber-100 transition-all"
              >
                更换选手
              </button>
            )}
            {entry.type === 'team' && participant.participantStatus !== 'exited_team' && (
              <button
                onClick={() => handleParticipantQuitTeam(entry, participant)}
                className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-100 transition-all"
              >
                退出队伍
              </button>
            )}
            <button
              onClick={() => openParticipantForm(entry, participant)}
              className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-600 hover:bg-indigo-100 transition-all"
            >
              单独查看报名表
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_0.8fr_1.2fr] gap-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <p className="text-xs font-bold text-slate-900">个人资料</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">性别</p>
                <p className="mt-1 text-sm font-bold text-slate-700">{participantEntry.form_data?.gender || '--'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">服装尺码</p>
                <p className="mt-1 text-sm font-bold text-slate-700">{participantEntry.form_data?.tshirt_size || '--'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">证件类型</p>
                <p className="mt-1 text-sm font-bold text-slate-700">{participantEntry.form_data?.id_type || '--'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase">证件号码</p>
                <p className="mt-1 text-sm font-bold text-slate-700 font-mono">{participantEntry.form_data?.id_number || '--'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <p className="text-xs font-bold text-slate-900">选手顺位</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">当前顺位</p>
              <p className="mt-1 text-base font-bold text-slate-900">第 {index + 1} 位</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">报名项目</p>
              <p className="mt-1 text-sm font-bold text-slate-700">{entry.registration_event_name}</p>
            </div>
            {participant.statusText && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">当前状态</p>
                <p className="mt-1 text-sm font-bold text-slate-700">{participant.statusText}</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <p className="text-xs font-bold text-slate-900">协议签约信息</p>
            </div>
            {participantSigningInfo.length > 0 ? (
              <div className="space-y-2">
                {participantSigningInfo.map((sign, signIndex) => (
                  <div key={`${participant.id}-${signIndex}`} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold text-slate-900">{sign.agreement_name}</p>
                      <p className="mt-0.5 text-[10px] text-slate-500 font-mono">{sign.signed_at}</p>
                      <p className="mt-0.5 text-[10px] text-slate-400">签署人：{sign.participant_name} · IP: {sign.ip_address}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">暂无签署记录</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (selectedOrder) {
      setOrderDetailTab('projects');
    }
  }, [selectedOrder]);

  const handleParticipantClick = (name: string, phone: string) => {
    // Search in MOCK_ORDERS entries to find a matching entry to show details
    for (const order of MOCK_ORDERS) {
      for (const entry of order.entries) {
        const participants = getEntryParticipants(entry);
        const matchedParticipant = participants.find(
          (participant) => participant.name === name && participant.phone === phone,
        );
        if (matchedParticipant) {
          openParticipantForm(entry, matchedParticipant);
          return;
        }
      }
    }
    
    // Fallback: search in MOCK_PARTICIPANTS and try to find any entry associated with them
    const participant = MOCK_PARTICIPANTS.find(p => p.name === name && p.phone === phone);
    if (participant) {
      // Find any entry for this participant
      for (const order of MOCK_ORDERS) {
        const entry = order.entries.find(e =>
          getEntryParticipants(e).some((person) => person.name === name || person.phone === phone),
        );
        if (entry) {
          openParticipantForm(entry, getEntryParticipants(entry).find((person) => person.name === name || person.phone === phone));
          return;
        }
      }
    }
  };

  const renderOrders = () => {
    const orderDetailRows = MOCK_ORDERS.flatMap((order) =>
      order.entries.map((entry) => ({
        order,
        entry,
        participants: getEntryParticipants(entry),
      })),
    );

    const filteredOrderRows = orderDetailRows.filter(({ order, entry, participants }) => {
      const matchesNo = order.order_no.toLowerCase().includes(orderNoSearch.toLowerCase());
      const matchesUser =
        order.user_name.toLowerCase().includes(orderUserSearch.toLowerCase()) ||
        order.user_phone.includes(orderUserSearch);
      const matchesProject =
        orderProjectSearch === '' ||
        entry.registration_event_name.toLowerCase().includes(orderProjectSearch.toLowerCase());
      const matchesParticipant =
        orderParticipantSearch === '' ||
        participants.some(
          (participant) =>
            participant.name.toLowerCase().includes(orderParticipantSearch.toLowerCase()) ||
            participant.phone.includes(orderParticipantSearch),
        );
      const matchesTeam =
        orderTeamSearch === '' ||
        (entry.team_name || '').toLowerCase().includes(orderTeamSearch.toLowerCase());
      const matchesPayStatus =
        orderPayStatusSearch === '' || entry.pay_status === orderPayStatusSearch || order.pay_status === orderPayStatusSearch;
      const matchesEntryStatus =
        orderEntryStatusSearch === '' || entry.entry_status === orderEntryStatusSearch;
      const matchesDate = order.created_at.includes(orderDateSearch);

      return (
        matchesNo &&
        matchesUser &&
        matchesProject &&
        matchesParticipant &&
        matchesTeam &&
        matchesPayStatus &&
        matchesEntryStatus &&
        matchesDate
      );
    });

    const totalPages = Math.max(1, Math.ceil(filteredOrderRows.length / ordersPageSize));
    const currentPage = Math.min(ordersPage, totalPages);
    const pagedOrderRows = filteredOrderRows.slice((currentPage - 1) * ordersPageSize, currentPage * ordersPageSize);
    const orderSearchActions = (
      <>
        <button
          onClick={applyOrderSearch}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
        >
          筛选
        </button>
        <button
          onClick={resetOrderSearch}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
        >
          重置
        </button>
        <button
          onClick={() => setOrderFiltersExpanded((prev) => !prev)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
        >
          {orderFiltersExpanded ? '收起筛选' : '展开筛选'}
        </button>
        <button className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700">
          导入报名订单
        </button>
        <button className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700">
          导出报名订单
        </button>
      </>
    );

    return (
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="订单编号..."
                value={orderNoSearchDraft}
                onChange={(e) => setOrderNoSearchDraft(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
            <div className="relative min-w-[220px] flex-1">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="报名用户..."
                value={orderUserSearchDraft}
                onChange={(e) => setOrderUserSearchDraft(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
            <div className="relative min-w-[220px] flex-1">
              <ClipboardList className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="报名项目..."
                value={orderProjectSearchDraft}
                onChange={(e) => setOrderProjectSearchDraft(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
            <div className="relative min-w-[220px] flex-1">
              <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="报名选手..."
                value={orderParticipantSearchDraft}
                onChange={(e) => setOrderParticipantSearchDraft(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
            {!orderFiltersExpanded && <div className="flex flex-wrap items-center gap-3">{orderSearchActions}</div>}
          </div>

          <AnimatePresence initial={false}>
            {orderFiltersExpanded ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="grid gap-3 xl:grid-cols-[repeat(4,minmax(0,1fr))_auto] xl:items-center">
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="所属队伍..."
                      value={orderTeamSearchDraft}
                      onChange={(e) => setOrderTeamSearchDraft(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      value={orderPayStatusSearchDraft}
                      onChange={(e) => setOrderPayStatusSearchDraft(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    >
                      <option value="">所有支付状态</option>
                      <option value={PayStatus.UNPAID}>{PayStatus.UNPAID}</option>
                      <option value={PayStatus.PAID}>{PayStatus.PAID}</option>
                      <option value={PayStatus.PARTIAL_REFUND}>{PayStatus.PARTIAL_REFUND}</option>
                      <option value={PayStatus.REFUNDED}>{PayStatus.REFUNDED}</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                  <div className="relative">
                    <CheckCircle2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      value={orderEntryStatusSearchDraft}
                      onChange={(e) => setOrderEntryStatusSearchDraft(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    >
                      <option value="">所有报名状态</option>
                      <option value={EntryStatus.SUCCESS}>{EntryStatus.SUCCESS}</option>
                      <option value={EntryStatus.PENDING_PAYMENT}>{EntryStatus.PENDING_PAYMENT}</option>
                      <option value={EntryStatus.CANCELLED}>{EntryStatus.CANCELLED}</option>
                      <option value={EntryStatus.REFUNDED}>{EntryStatus.REFUNDED}</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="创建时间..."
                      value={orderDateSearchDraft}
                      onChange={(e) => setOrderDateSearchDraft(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 xl:justify-end">{orderSearchActions}</div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[1360px] w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold text-slate-500">订单编号</th>
                <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold text-slate-500">报名项目</th>
                <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold text-slate-500">项目类型</th>
                <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold text-slate-500">报名用户</th>
                <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold text-slate-500">选手信息</th>
                <th className="whitespace-nowrap px-5 py-4 text-right text-xs font-semibold text-slate-500">实付金额</th>
                <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold text-slate-500">报名状态</th>
                <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold text-slate-500">支付信息</th>
                <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold text-slate-500">创建时间</th>
                <th className="whitespace-nowrap px-5 py-4 text-center text-xs font-semibold text-slate-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedOrderRows.map(({ order, entry, participants }) => (
                <tr key={entry.id} className="align-top transition-colors hover:bg-slate-50/40">
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <p className="font-mono text-sm font-bold text-slate-900">{order.order_no}</p>
                      <p className="text-xs text-slate-400">{order.order_source || '用户报名'}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="whitespace-nowrap text-sm font-semibold text-slate-900">{entry.registration_event_name}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex whitespace-nowrap items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                      {entry.type === 'team' ? '团体项目' : '单项项目'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900">{order.user_name}</p>
                      <p className="font-mono text-xs text-slate-400">{order.user_phone}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex max-w-[280px] flex-wrap gap-1.5">
                      {participants.map((participant) => (
                        <button
                          key={`${entry.id}-${participant.name}-${participant.phone}`}
                          onClick={() => openParticipantForm(entry, participant)}
                          className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 transition-all hover:border-indigo-200 hover:bg-indigo-100"
                          title={`查看 ${participant.name} 报名表`}
                        >
                          {participant.name}
                        </button>
                      ))}
                      {entry.team_name && (
                        <button
                          onClick={() => openTeamDetail(entry)}
                          className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 transition-all hover:bg-indigo-100"
                          title={`查看 ${entry.team_name} 队伍详情`}
                        >
                          队伍：{entry.team_name}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="whitespace-nowrap text-sm font-bold text-indigo-600">¥{entry.actual_amount.toFixed(2)}</span>
                      <button
                        title={`报名费 ¥${entry.fee.toFixed(2)} / 押金 ¥${entry.deposit_amount.toFixed(2)} / 优惠 -¥${entry.discount_amount.toFixed(2)}`}
                        className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                      >
                        <AlertCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex whitespace-nowrap items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        entry.entry_status === EntryStatus.SUCCESS
                          ? 'bg-emerald-50 text-emerald-700'
                          : entry.entry_status === EntryStatus.PENDING_PAYMENT
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {entry.entry_status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <p className="whitespace-nowrap text-sm font-semibold text-slate-700">{getPaymentMethodLabel(order)}</p>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        entry.pay_status === PayStatus.PAID
                          ? 'bg-emerald-50 text-emerald-700'
                          : entry.pay_status === PayStatus.PARTIAL_REFUND
                          ? 'bg-sky-50 text-sky-700'
                          : entry.pay_status === PayStatus.UNPAID
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {entry.pay_status}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">{entry.created_at}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                      <button 
                        onClick={() => {
                          setSelectedEntryForDetail(entry);
                        }}
                        className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
                      >
                        订单详情
                      </button>
                      {(entry.pay_status === PayStatus.PAID || entry.pay_status === PayStatus.PARTIAL_REFUND) && (
                        <button
                          onClick={() => requestEntryRefund(entry)}
                          className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-100 hover:text-emerald-700"
                        >
                          退款
                        </button>
                      )}
                      {entry.pay_status === PayStatus.UNPAID && (
                        <button
                          onClick={() => handleCancelOrder(order)}
                          className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100 hover:text-rose-700"
                        >
                          取消订单
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TablePagination
            total={filteredOrderRows.length}
            page={currentPage}
            pageSize={ordersPageSize}
            onPageChange={setOrdersPage}
            onPageSizeChange={(size) => {
              setOrdersPageSize(size);
              setOrdersPage(1);
            }}
            itemLabel="条明细"
            compact
          />
        </div>
      </div>
    );
  };

  const renderProjectSummary = () => {
    const filteredProjects = projectSummary.filter(p => 
      p.name.toLowerCase().includes(projectSearch.toLowerCase()) &&
      p.type.toLowerCase().includes(projectTypeSearch.toLowerCase())
    );
    const totalPages = Math.max(1, Math.ceil(filteredProjects.length / projectSummaryPageSize));
    const currentPage = Math.min(projectSummaryPage, totalPages);
    const pagedProjects = filteredProjects.slice((currentPage - 1) * projectSummaryPageSize, currentPage * projectSummaryPageSize);

    return (
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索项目名称..."
              value={projectSearchDraft}
              onChange={(e) => setProjectSearchDraft(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <div className="relative min-w-[240px] flex-1">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索项目类型..."
              value={projectTypeSearchDraft}
              onChange={(e) => setProjectTypeSearchDraft(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <button onClick={applyProjectSummarySearch} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50">筛选</button>
          <button onClick={resetProjectSummarySearch} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50">重置</button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">项目名称</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">项目类型</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">席位限制</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">成功报名</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">状态</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">立项状态</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedProjects.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{p.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{p.type}</td>
                  <td className="px-6 py-4 text-center text-sm text-slate-600 font-mono">{p.seat_limit}</td>
                  <td className="px-6 py-4 text-center text-sm font-bold text-indigo-600 font-mono">{p.current_count}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                      p.status === '正常' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                      p.establishment_status === '已立项' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-600 border-slate-100'
                    }`}>
                      {p.establishment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedProjectForDetails(p)}
                        className="text-indigo-600 hover:text-indigo-700 text-[10px] font-bold bg-indigo-50 px-2 py-1 rounded-lg transition-all"
                      >
                        选手明细
                      </button>
                      <button 
                        onClick={() => setProjectToEstablish(p)}
                        className="text-emerald-600 hover:text-emerald-700 text-[10px] font-bold bg-emerald-50 px-2 py-1 rounded-lg transition-all"
                      >
                        确认立项
                      </button>
                      <button 
                        onClick={() => handleCancelProject(p.id)}
                        className="text-rose-600 hover:text-rose-700 text-[10px] font-bold bg-rose-50 px-2 py-1 rounded-lg transition-all"
                      >
                        取消项目
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TablePagination
            total={filteredProjects.length}
            page={currentPage}
            pageSize={projectSummaryPageSize}
            onPageChange={setProjectSummaryPage}
            onPageSizeChange={(size) => {
              setProjectSummaryPageSize(size);
              setProjectSummaryPage(1);
            }}
            itemLabel="个项目"
            compact
          />
        </div>
      </div>
    );
  };

  const renderParticipants = () => {
    const filteredParticipants = MOCK_PARTICIPANTS.filter(p => 
      p.name.toLowerCase().includes(participantNameSearch.toLowerCase()) &&
      p.phone.includes(participantPhoneSearch)
    );
    const totalPages = Math.max(1, Math.ceil(filteredParticipants.length / participantsPageSize));
    const currentPage = Math.min(participantsPage, totalPages);
    const pagedParticipants = filteredParticipants.slice((currentPage - 1) * participantsPageSize, currentPage * participantsPageSize);

    return (
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索选手姓名..."
              value={participantNameSearchDraft}
              onChange={(e) => setParticipantNameSearchDraft(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <div className="relative min-w-[220px] flex-1">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索手机号..."
              value={participantPhoneSearchDraft}
              onChange={(e) => setParticipantPhoneSearchDraft(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <button onClick={applyParticipantSearch} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50">筛选</button>
          <button onClick={resetParticipantSearch} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50">重置</button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center"></th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">选手姓名</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">手机号</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">性别</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">已报名项目</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedParticipants.map(p => {
                const participantRelations = getParticipantEntryRelations(p);
                const participantEntries = participantRelations.map(({ entry }) => entry);
                
                return (
                  <React.Fragment key={p.id}>
                    <tr className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-3 py-4">
                        <button 
                          onClick={() => setExpandedParticipant(expandedParticipant === p.id ? null : p.id)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg transition-all text-slate-400 group-hover:text-slate-600"
                        >
                          {expandedParticipant === p.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => setSelectedParticipantForOverview(p)}
                          className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
                        >
                          {p.name}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-slate-600">{p.phone}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-slate-600">{p.gender}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-bold text-indigo-600">{participantEntries.length}</span>
                      </td>
                    </tr>
                    <AnimatePresence>
                      {expandedParticipant === p.id && (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 bg-slate-50/30">
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="space-y-3 overflow-hidden"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div className="h-1 w-4 bg-indigo-600 rounded-full" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">报名项目</p>
                              </div>
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                                {participantRelations.map(({ order, entry }) =>
                                  renderOrderEntryCard(order, entry, {
                                    showRefundButton: true,
                                  }),
                                )}
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          <TablePagination
            total={filteredParticipants.length}
            page={currentPage}
            pageSize={participantsPageSize}
            onPageChange={setParticipantsPage}
            onPageSizeChange={(size) => {
              setParticipantsPageSize(size);
              setParticipantsPage(1);
            }}
            itemLabel="位选手"
            compact
          />
        </div>
      </div>
    );
  };

  const renderTeams = () => {
    const filteredTeams = MOCK_TEAMS.filter(t => 
      t.name.toLowerCase().includes(teamNameSearch.toLowerCase()) &&
      (t.leader.toLowerCase().includes(teamLeaderSearch.toLowerCase()) || t.leader_phone.includes(teamLeaderSearch)) &&
      (t.group_name || '').toLowerCase().includes(teamGroupSearch.toLowerCase())
    );
    const totalPages = Math.max(1, Math.ceil(filteredTeams.length / teamsPageSize));
    const currentPage = Math.min(teamsPage, totalPages);
    const pagedTeams = filteredTeams.slice((currentPage - 1) * teamsPageSize, currentPage * teamsPageSize);

    return (
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索队伍名称..."
              value={teamNameSearchDraft}
              onChange={(e) => setTeamNameSearchDraft(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <div className="relative min-w-[220px] flex-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索领队姓名/手机号..."
              value={teamLeaderSearchDraft}
              onChange={(e) => setTeamLeaderSearchDraft(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <div className="relative min-w-[220px] flex-1">
            <Layers3 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索关联组别..."
              value={teamGroupSearchDraft}
              onChange={(e) => setTeamGroupSearchDraft(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <button onClick={applyTeamSearch} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50">筛选</button>
          <button onClick={resetTeamSearch} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50">重置</button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center"></th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">队伍名称</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">关联组别</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">创建用户</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">领队信息</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">教练信息</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">队伍人数</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">报名项目数</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedTeams.map(t => {
                const teamRelations = getTeamEntryRelations(t.name);

                return (
                  <React.Fragment key={t.id}>
                    <tr className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-3 py-4 text-center">
                        <button 
                          onClick={() => setExpandedTeam(expandedTeam === t.id ? null : t.id)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg transition-all text-slate-400 group-hover:text-slate-600"
                        >
                          {expandedTeam === t.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedTeamForDetail({
                            ...t,
                            entries: teamRelations.map(({ entry }) => entry),
                          })}
                          className="text-sm font-bold text-indigo-600 hover:text-indigo-700 text-left"
                        >
                          {t.name}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100">
                          {t.group_name || '--'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{t.creator_name || '--'}</span>
                          <span className="text-xs text-slate-400 font-mono">{t.creator_phone || '--'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">
                            {t.leader}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">{t.leader_phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">{t.coach_name || '--'}</span>
                          <span className="text-xs text-slate-400 font-mono">{t.coach_phone || '--'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-slate-600">{t.member_count}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-bold text-indigo-600">{teamRelations.length}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedTeamForDetail({
                            ...t,
                            entries: teamRelations.map(({ entry }) => entry),
                          })}
                          className="text-indigo-600 hover:text-indigo-700 text-xs font-bold bg-indigo-50 px-3 py-1.5 rounded-lg transition-all"
                        >
                          查看队伍详情
                        </button>
                      </td>
                    </tr>
                    <AnimatePresence>
                      {expandedTeam === t.id && (
                        <tr>
                          <td colSpan={9} className="px-6 py-4 bg-slate-50/30">
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="space-y-3 overflow-hidden"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div className="h-1 w-4 bg-indigo-600 rounded-full" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">报名项目</p>
                              </div>
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                                {teamRelations.map(({ order, entry }) =>
                                  renderOrderEntryCard(order, entry, {
                                    showRefundButton: true,
                                  }),
                                )}
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          <TablePagination
            total={filteredTeams.length}
            page={currentPage}
            pageSize={teamsPageSize}
            onPageChange={setTeamsPage}
            onPageSizeChange={(size) => {
              setTeamsPageSize(size);
              setTeamsPage(1);
            }}
            itemLabel="支队伍"
            compact
          />
        </div>
      </div>
    );
  };

  const currentPageMeta: Record<RecordTab, { title: string; description: string }> = {
    orders: {
      title: '报名订单管理',
      description: '查看及管理当前比赛所有项目的报名订单数据',
    },
    project_summary: {
      title: '项目报名汇总',
      description: '查看当前比赛各报名项目的整体报名情况与立项依据',
    },
    participants: {
      title: '选手列表',
      description: '查看当前比赛所有报名选手信息及其关联报名项目',
    },
    teams: {
      title: '队伍列表',
      description: '查看当前比赛所有报名队伍信息及其关联项目情况',
    },
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{currentPageMeta[activeTab].title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{currentPageMeta[activeTab].description}</p>
            </div>
          </div>

          {showTabs ? (
            <div className="flex gap-2 rounded-full bg-white p-1.5 shadow-lg shadow-slate-200/70 ring-1 ring-slate-200">
              {[
                { id: 'orders', label: '报名订单', icon: ClipboardList },
                { id: 'project_summary', label: '项目汇总', icon: Trophy },
                { id: 'participants', label: '报名选手', icon: User },
                { id: 'teams', label: '报名队伍', icon: Users }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as RecordTab)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'orders' && renderOrders()}
              {activeTab === 'project_summary' && renderProjectSummary()}
              {activeTab === 'participants' && renderParticipants()}
              {activeTab === 'teams' && renderTeams()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Replace Participant Modal */}
      <AnimatePresence>
        {replaceParticipantTarget && (
          <div className="fixed inset-0 z-[116] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReplaceParticipantTarget(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">正在进行选手更换操作</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{replaceParticipantTarget.entry.registration_event_name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setReplaceParticipantTarget(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-50/40 custom-scrollbar">
                <div className="p-8 space-y-6">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-sm font-bold text-slate-900">当前选手信息</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">姓名</p>
                        <p className="mt-1 text-sm font-bold text-slate-900">{replaceParticipantTarget.participant.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">手机号</p>
                        <p className="mt-1 text-sm font-bold text-slate-900 font-mono">{replaceParticipantTarget.participant.phone}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">性别</p>
                        <p className="mt-1 text-sm font-bold text-slate-900">{replaceParticipantTarget.participant.gender}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">证件类型</p>
                        <p className="mt-1 text-sm font-bold text-slate-900">{replaceParticipantTarget.participant.idType}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-sm font-bold text-slate-900">更换选手信息</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">姓名</label>
                        <input
                          type="text"
                          value={replacementFormData.name}
                          onChange={(e) => setReplacementFormData((prev) => ({ ...prev, name: e.target.value }))}
                          className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">手机号</label>
                        <input
                          type="text"
                          value={replacementFormData.phone}
                          onChange={(e) => setReplacementFormData((prev) => ({ ...prev, phone: e.target.value }))}
                          className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">性别</label>
                        <select
                          value={replacementFormData.gender}
                          onChange={(e) => setReplacementFormData((prev) => ({ ...prev, gender: e.target.value }))}
                          className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                        >
                          <option value="男">男</option>
                          <option value="女">女</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">服装尺码</label>
                        <select
                          value={replacementFormData.tshirtSize}
                          onChange={(e) => setReplacementFormData((prev) => ({ ...prev, tshirtSize: e.target.value }))}
                          className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                        >
                          {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map((size) => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">证件类型</label>
                        <select
                          value={replacementFormData.idType}
                          onChange={(e) => setReplacementFormData((prev) => ({ ...prev, idType: e.target.value }))}
                          className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                        >
                          <option value="身份证">身份证</option>
                          <option value="护照">护照</option>
                          <option value="回乡证">回乡证</option>
                          <option value="台胞证">台胞证</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">证件号码</label>
                        <input
                          type="text"
                          value={replacementFormData.idNumber}
                          onChange={(e) => setReplacementFormData((prev) => ({ ...prev, idNumber: e.target.value }))}
                          className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 pt-4 border-t border-slate-100 bg-white">
                <div className="flex gap-3">
                  <button
                    onClick={submitReplaceParticipant}
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                  >
                    提交更换
                  </button>
                  <button
                    onClick={() => setReplaceParticipantTarget(null)}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all"
                  >
                    取消
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Entry Refund Modal */}
      <AnimatePresence>
        {refundEntryTarget && (
          <div className="fixed inset-0 z-[115] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setRefundEntryTarget(null);
                setRefundAmountInput('');
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-sm">
                      <RotateCcw className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">退款</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{refundEntryTarget.registration_event_name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setRefundEntryTarget(null);
                      setRefundAmountInput('');
                    }}
                    className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">已退款金额</p>
                      <p className="mt-1 text-lg font-bold text-slate-900">¥{getRefundedAmount(refundEntryTarget).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">剩余可退款金额</p>
                      <p className="mt-1 text-lg font-bold text-rose-600">¥{getRefundableAmount(refundEntryTarget).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
                    <p className="text-[11px] font-bold text-rose-600">退款将原路退回至用户原支付账户</p>
                    <p className="mt-1 text-[11px] text-slate-500">请确认退款金额无误后再提交，避免重复或超额退款。</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">本次退款金额</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    max={getRefundableAmount(refundEntryTarget)}
                    value={refundAmountInput}
                    onChange={(e) => setRefundAmountInput(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-rose-500 transition-all"
                    placeholder="请输入本次退款金额"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={confirmEntryRefund}
                    className="flex-1 py-3 bg-rose-600 text-white rounded-2xl text-sm font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200"
                  >
                    确认退款
                  </button>
                  <button
                    onClick={() => {
                      setRefundEntryTarget(null);
                      setRefundAmountInput('');
                    }}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all"
                  >
                    取消
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Participant Overview Modal */}
      <AnimatePresence>
        {selectedParticipantForOverview && (
          <div className="fixed inset-0 z-[108] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedParticipantForOverview(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">选手报名项目</h2>
                    <p className="text-xs text-slate-500 mt-0.5">查看该选手已报名的所有项目，并继续进入单个项目的报名表</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedParticipantForOverview(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-50/40 custom-scrollbar">
                {(() => {
                  const participantRelations = getParticipantEntryRelations(selectedParticipantForOverview);
                  return (
                    <div className="p-8 space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">选手姓名</p>
                          <p className="mt-2 text-sm font-bold text-slate-900">{selectedParticipantForOverview.name}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">手机号</p>
                          <p className="mt-2 text-sm font-bold text-slate-900 font-mono">{selectedParticipantForOverview.phone}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">性别</p>
                          <p className="mt-2 text-sm font-bold text-slate-900">{selectedParticipantForOverview.gender}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">已报名项目</p>
                          <p className="mt-2 text-lg font-bold text-indigo-600">{participantRelations.length}</p>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="w-4 h-4 text-indigo-600" />
                          <h3 className="text-sm font-bold text-slate-900">报名项目</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                          {participantRelations.map(({ order, entry }) =>
                            renderOrderEntryCard(order, entry, {
                              showRefundButton: true,
                              onViewDetails: () => {
                                setSelectedParticipantForOverview(null);
                                setSelectedEntryForDetail(entry);
                              },
                            }),
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Entry Detail Modal */}
      <AnimatePresence>
        {selectedEntryForDetail && (
          <div className="fixed inset-0 z-[105] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEntryForDetail(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">报名项目详情</h2>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">{selectedEntryForDetail.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEntryForDetail(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-50/40 custom-scrollbar">
                {(() => {
                  const relatedOrder = getOrderForEntry(selectedEntryForDetail);
                  const paymentRecords = relatedOrder ? getOrderPaymentRecords(relatedOrder) : [];
                  const refundRecords = relatedOrder ? getOrderRefundRecords(relatedOrder) : [];
                  const paymentTime =
                    paymentRecords.find((record) => record.status !== '待支付')?.time ||
                    (relatedOrder?.pay_status !== PayStatus.UNPAID ? relatedOrder?.updated_at : '--') ||
                    '--';
                  return (
                <div className="p-8 space-y-6">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900">{selectedEntryForDetail.registration_event_name}</h3>
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                            {selectedEntryForDetail.type === 'team' ? '团体项目' : '单项项目'}
                          </span>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            selectedEntryForDetail.entry_status === EntryStatus.SUCCESS
                              ? 'border border-emerald-100 bg-emerald-50 text-emerald-600'
                              : 'border border-amber-100 bg-amber-50 text-amber-600'
                          }`}>
                            {selectedEntryForDetail.entry_status}
                          </span>
                          <button
                            onClick={() => requestEntryRefund(selectedEntryForDetail)}
                            disabled={!canRefundEntry(selectedEntryForDetail)}
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
                              canRefundEntry(selectedEntryForDetail)
                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            退款
                          </button>
                        </div>
                        <p className="mt-2 text-xs text-slate-500 font-mono">
                          所属订单 {selectedEntryForDetail.order_no}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-3">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'order', label: '订单信息', icon: ClipboardList },
                        ...(selectedEntryForDetail.team_name ? [{ id: 'team', label: '队伍信息', icon: Users } as const] : []),
                        { id: 'participants', label: '选手报名表', icon: FileText },
                        { id: 'payments', label: '支付记录', icon: CreditCard },
                        { id: 'refunds', label: '退款记录', icon: RotateCcw },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setEntryDetailTab(tab.id as EntryDetailTab)}
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                            entryDetailTab === tab.id
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                          }`}
                        >
                          <tab.icon className="h-3.5 w-3.5" />
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {entryDetailTab === 'order' ? (
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-sm font-bold text-slate-900">订单信息</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">订单编号</p>
                        <p className="mt-1 text-sm font-bold font-mono text-slate-800">{relatedOrder?.order_no || selectedEntryForDetail.order_no}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">下单用户</p>
                        <p className="mt-1 text-sm font-bold text-slate-800">{relatedOrder?.user_name || '--'}</p>
                        <p className="mt-1 text-[11px] font-mono text-slate-500">{relatedOrder?.user_phone || '--'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">报名状态</p>
                        <p className="mt-1 text-sm font-bold text-slate-800">{selectedEntryForDetail.entry_status}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">订单金额</p>
                        <p className="mt-1 text-sm font-bold text-indigo-600">¥{(relatedOrder?.pay_amount ?? selectedEntryForDetail.actual_amount).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">订单来源</p>
                        <p className="mt-1 text-sm font-bold text-slate-800">{relatedOrder?.order_source || '--'}</p>
                      </div>
                      <div className="xl:col-span-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">订单备注</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{relatedOrder?.remarks || '暂无订单备注'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">下单时间</p>
                        <p className="mt-1 text-sm font-mono text-slate-700">{relatedOrder?.created_at || '--'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">支付时间</p>
                        <p className="mt-1 text-sm font-mono text-slate-700">{paymentTime}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">更新时间</p>
                        <p className="mt-1 text-sm font-mono text-slate-700">{selectedEntryForDetail.updated_at}</p>
                      </div>
                    </div>
                  </div>
                  ) : null}

                  {entryDetailTab === 'team' && selectedEntryForDetail.team_name && (
                    (() => {
                      const teamDetail = getTeamDetailFromEntry(selectedEntryForDetail);
                      const teamCoaches = getTeamCoaches(teamDetail);
                      return (
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-indigo-600" />
                              <h3 className="text-sm font-bold text-slate-900">队伍信息</h3>
                            </div>
                            <button
                              onClick={() => openTeamDetail(selectedEntryForDetail)}
                              className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1.5 text-[11px] font-bold text-indigo-600 hover:bg-indigo-100 transition-all"
                            >
                              查看完整队伍详情
                            </button>
                          </div>
                          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div>
                                <p className="text-sm font-bold text-indigo-900">{teamDetail?.name || selectedEntryForDetail.team_name}</p>
                                <p className="mt-1 text-[11px] font-mono text-indigo-500">Team ID: {teamDetail?.id || selectedEntryForDetail.team_id || 'N/A'}</p>
                              </div>
                              <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-indigo-600 shadow-sm">
                                {teamDetail?.member_count || getEntryParticipants(selectedEntryForDetail).length} 人
                              </span>
                            </div>
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-[10px] font-bold text-indigo-400 uppercase">邀请码</p>
                                <p className="mt-1 text-sm font-bold text-slate-800 font-mono">{teamDetail?.invite_code || '--'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-indigo-400 uppercase">创建人</p>
                                <p className="mt-1 text-sm font-bold text-slate-800">{teamDetail?.creator_name || '--'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-indigo-400 uppercase">领队</p>
                                <p className="mt-1 text-sm font-bold text-slate-800">{teamDetail?.leader || '--'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-indigo-400 uppercase">领队电话</p>
                                <p className="mt-1 text-sm font-bold text-slate-800 font-mono">{teamDetail?.leader_phone || '--'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-indigo-400 uppercase">联络员</p>
                                <p className="mt-1 text-sm font-bold text-slate-800">{teamDetail?.liaison_name || '--'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-indigo-400 uppercase">联络电话</p>
                                <p className="mt-1 text-sm font-bold text-slate-800 font-mono">{teamDetail?.liaison_phone || '--'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-indigo-400 uppercase">队伍总人数</p>
                                <p className="mt-1 text-sm font-bold text-slate-800">{teamDetail?.member_count || getEntryParticipants(selectedEntryForDetail).length} 人</p>
                              </div>
                            </div>
                            <div className="mt-4">
                              <p className="text-[10px] font-bold text-indigo-400 uppercase">教练信息</p>
                              {teamCoaches.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {teamCoaches.map((coach, coachIndex) => (
                                    <span key={`${coach.name}-${coachIndex}`} className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 shadow-sm">
                                      {coach.name} · {coach.phone}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="mt-1 text-sm font-bold text-slate-800">--</p>
                              )}
                            </div>
                            {(teamDetail?.logo_url || teamDetail?.flag_url) && (
                              <div className="mt-4 grid gap-4 md:grid-cols-2">
                                {teamDetail?.logo_url && (
                                  <div>
                                    <p className="text-[10px] font-bold text-indigo-400 uppercase">队伍LOGO</p>
                                    <div className="mt-2 overflow-hidden rounded-2xl border border-white/80 bg-white shadow-sm">
                                      <img src={teamDetail.logo_url} alt="队伍LOGO" className="h-32 w-full object-cover" />
                                    </div>
                                  </div>
                                )}
                                {teamDetail?.flag_url && (
                                  <div>
                                    <p className="text-[10px] font-bold text-indigo-400 uppercase">队旗</p>
                                    <div className="mt-2 overflow-hidden rounded-2xl border border-white/80 bg-white shadow-sm">
                                      <img src={teamDetail.flag_url} alt="队旗" className="h-32 w-full object-cover" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            {teamDetail?.uniforms && teamDetail.uniforms.length > 0 && (
                              <div className="mt-4">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-[10px] font-bold text-indigo-400 uppercase">队伍队服</p>
                                  <span className="text-[11px] text-slate-500">支持多款录入，可后台修改主色调名称</span>
                                </div>
                                <div className="mt-2 grid gap-3 md:grid-cols-2">
                                  {teamDetail.uniforms.map((uniform) => (
                                    <div key={uniform.id} className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-sm">
                                      <img src={uniform.image_url} alt={uniform.name || '队服'} className="h-32 w-full object-cover" />
                                      <div className="space-y-1 px-3 py-3">
                                        <p className="text-sm font-bold text-slate-800">{uniform.name || '队服款式'}</p>
                                        <p className="text-xs text-slate-500">主色调：{uniform.primary_color_name}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {teamDetail?.members && teamDetail.members.length > 0 && (
                              <div className="mt-4">
                                <p className="text-[10px] font-bold text-indigo-400 uppercase">队伍成员</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {teamDetail.members.map((member, memberIndex) => (
                                    <span key={`${member.name}-${memberIndex}`} className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 shadow-sm">
                                      {member.name}
                                      {member.gender ? ` · ${member.gender}` : ''}
                                    </span>
                                  ))}
                                </div>
                                <p className="mt-3 text-[11px] leading-5 text-slate-500">
                                  这里的队伍成员仅指该团体项目里的参赛选手，实际队伍中可能还包含参加单项的其他选手。
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()
                  )}

                  {entryDetailTab === 'participants' ? (
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <h3 className="text-sm font-bold text-slate-900">选手信息与报名表</h3>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500">
                        共 {getEntryParticipants(selectedEntryForDetail).length} 位选手
                      </span>
                    </div>
                    <div className="space-y-4">
                      {getDetailedEntryParticipants(selectedEntryForDetail).map((participant, index) =>
                        renderParticipantSnapshotCard(selectedEntryForDetail, participant, index),
                      )}
                    </div>
                  </div>
                  ) : null}

                  {entryDetailTab === 'payments' ? (
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-sm font-bold text-slate-900">支付记录</h3>
                    </div>
                    <div className="space-y-3">
                      {paymentRecords.map((record) => (
                        <div key={record.id} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{record.title}</p>
                            <p className="mt-1 text-[11px] font-mono text-slate-500">{record.time}</p>
                            <p className="mt-2 text-[11px] text-slate-500">{record.note}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              record.status === '待支付' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            }`}>
                              {record.status}
                            </span>
                            <p className="mt-3 text-base font-bold text-indigo-600">¥{record.amount.toFixed(2)}</p>
                            <p className="mt-1 text-[11px] text-slate-400">{record.method}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  ) : null}

                  {entryDetailTab === 'refunds' ? (
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-sm font-bold text-slate-900">退款记录</h3>
                    </div>
                    {refundRecords.length > 0 ? (
                      <div className="space-y-3">
                        {refundRecords.map((record) => (
                          <div key={record.id} className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-bold text-slate-900">{record.title}</p>
                              <p className="mt-1 text-[11px] font-mono text-slate-500">{record.time}</p>
                              <p className="mt-2 text-[11px] text-slate-500">{record.note}</p>
                            </div>
                            <div className="text-right">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                                {record.status}
                              </span>
                              <p className="mt-3 text-base font-bold text-rose-600">¥{record.amount.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                        <p className="text-sm font-medium text-slate-400">当前报名项目所属订单暂无退款记录</p>
                      </div>
                    )}
                  </div>
                  ) : null}

                </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Participant Detail Modal */}
      <AnimatePresence>
        {selectedParticipantForDetail && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedParticipantForDetail(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">选手报名详情</h3>
                    <p className="text-xs text-slate-500 mt-0.5">查看并管理选手的详细报名信息</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isEditingParticipant && (
                    <button 
                      onClick={handleEditParticipant}
                      className="p-2 hover:bg-indigo-50 rounded-full transition-all text-indigo-600"
                      title="编辑选手信息"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setSelectedParticipantForDetail(null);
                      setIsEditingParticipant(false);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-50/40 custom-scrollbar">
                <div className="p-8 space-y-6">
                  {(() => {
                    const signingInfo = getOrderSigningInfo(selectedParticipantForDetail);
                    const teamDetail = selectedParticipantForDetail ? getTeamDetailFromEntry(selectedParticipantForDetail) : null;
                    return (
                      <>
                  {/* Project Info */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-bold text-slate-900">{selectedParticipantForDetail.registration_event_name}</span>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        selectedParticipantForDetail.entry_status === EntryStatus.SUCCESS ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {selectedParticipantForDetail.entry_status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">选手姓名</p>
                        {isEditingParticipant ? (
                          <input 
                            type="text"
                            value={editingParticipantData?.participant_name || ''}
                            onChange={(e) => setEditingParticipantData(prev => prev ? { ...prev, participant_name: e.target.value } : null)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 mt-1"
                          />
                        ) : (
                          <p className="text-sm font-bold text-slate-700 mt-0.5">{selectedParticipantForDetail.participant_name}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">联系电话</p>
                        {isEditingParticipant ? (
                          <input 
                            type="text"
                            value={editingParticipantData?.participant_phone || ''}
                            onChange={(e) => setEditingParticipantData(prev => prev ? { ...prev, participant_phone: e.target.value } : null)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 mt-1 font-mono"
                          />
                        ) : (
                          <p className="text-sm font-bold text-slate-700 mt-0.5 font-mono">{selectedParticipantForDetail.participant_phone}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_0.8fr_1.2fr] gap-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4 shadow-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <p className="text-xs font-bold text-slate-900">个人资料</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">性别</p>
                          {isEditingParticipant ? (
                            <select 
                              value={editingParticipantData?.form_data?.gender || ''}
                              onChange={(e) => setEditingParticipantData(prev => prev ? { 
                                ...prev, 
                                form_data: { ...prev.form_data, gender: e.target.value } 
                              } : null)}
                              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 mt-1"
                            >
                              <option value="男">男</option>
                              <option value="女">女</option>
                            </select>
                          ) : (
                            <p className="text-sm font-bold text-slate-700 mt-0.5">{selectedParticipantForDetail.form_data?.gender || '--'}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">服装尺码</p>
                          {isEditingParticipant ? (
                            <select 
                              value={editingParticipantData?.form_data?.tshirt_size || ''}
                              onChange={(e) => setEditingParticipantData(prev => prev ? { 
                                ...prev, 
                                form_data: { ...prev.form_data, tshirt_size: e.target.value } 
                              } : null)}
                              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 mt-1"
                            >
                              {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map(size => (
                                <option key={size} value={size}>{size}</option>
                              ))}
                            </select>
                          ) : (
                            <p className="text-sm font-bold text-slate-700 mt-0.5">{selectedParticipantForDetail.form_data?.tshirt_size || '--'}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">证件类型</p>
                          {isEditingParticipant ? (
                            <select 
                              value={editingParticipantData?.form_data?.id_type || ''}
                              onChange={(e) => setEditingParticipantData(prev => prev ? { 
                                ...prev, 
                                form_data: { ...prev.form_data, id_type: e.target.value } 
                              } : null)}
                              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 mt-1"
                            >
                              <option value="身份证">身份证</option>
                              <option value="护照">护照</option>
                              <option value="回乡证">回乡证</option>
                              <option value="台胞证">台胞证</option>
                            </select>
                          ) : (
                            <p className="text-sm font-bold text-slate-700 mt-0.5">{selectedParticipantForDetail.form_data?.id_type || '--'}</p>
                          )}
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">证件号码</p>
                          {isEditingParticipant ? (
                            <input 
                              type="text"
                              value={editingParticipantData?.form_data?.id_number || ''}
                              onChange={(e) => setEditingParticipantData(prev => prev ? { 
                                ...prev, 
                                form_data: { ...prev.form_data, id_number: e.target.value } 
                              } : null)}
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 mt-1 font-mono"
                            />
                          ) : (
                            <p className="text-sm font-bold text-slate-700 mt-0.5 font-mono">{selectedParticipantForDetail.form_data?.id_number || '--'}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4 shadow-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-indigo-600" />
                        <p className="text-xs font-bold text-slate-900">选手顺位</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">当前顺位</p>
                        <p className="mt-1 text-base font-bold text-slate-900">第 1 位</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">报名项目</p>
                        <p className="mt-1 text-sm font-bold text-slate-700">{selectedParticipantForDetail.registration_event_name}</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <p className="text-xs font-bold text-slate-900">协议签约信息</p>
                      </div>
                      {signingInfo.length > 0 ? (
                        <div className="space-y-2">
                          {signingInfo.map((sign, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5" />
                              <div>
                                <p className="text-[11px] font-bold text-slate-900">{sign.agreement_name}</p>
                                <p className="mt-0.5 text-[10px] text-slate-500 font-mono">{sign.signed_at}</p>
                                <p className="mt-0.5 text-[10px] text-slate-400">签署人：{selectedParticipantForDetail.participant_name} · IP: {sign.ip_address}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400">暂无签约记录</p>
                      )}
                    </div>
                  </div>

                  {/* Team Info if applicable */}
                  {selectedParticipantForDetail.team_name && (
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-indigo-600" />
                          <h4 className="text-xs font-bold text-slate-900">所属队伍信息</h4>
                        </div>
                        <button
                          onClick={() => openTeamDetail(selectedParticipantForDetail)}
                          className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-indigo-600 shadow-sm hover:bg-indigo-50 transition-all"
                        >
                          查看队伍详情
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase">队伍名称</p>
                          <p className="mt-1 text-sm font-bold text-indigo-900">{teamDetail?.name || selectedParticipantForDetail.team_name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase">邀请码</p>
                          <p className="mt-1 text-sm font-bold text-slate-700 font-mono">{teamDetail?.invite_code || '--'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase">创建人</p>
                          <p className="mt-1 text-sm font-bold text-slate-700">{teamDetail?.creator_name || '--'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase">Team ID</p>
                          <p className="mt-1 text-sm font-bold text-slate-700 font-mono">{teamDetail?.id || selectedParticipantForDetail.team_id || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase">领队</p>
                          <p className="mt-1 text-sm font-bold text-slate-700">{teamDetail?.leader || '--'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase">联络员</p>
                          <p className="mt-1 text-sm font-bold text-slate-700">{teamDetail?.liaison_name || '--'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase">队伍总人数</p>
                          <p className="mt-1 text-sm font-bold text-slate-700">{teamDetail?.member_count || '--'} 人</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase">教练信息</p>
                        {getTeamCoaches(teamDetail).length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {getTeamCoaches(teamDetail).map((coach, idx) => (
                              <span key={`${coach.name}-${idx}`} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-medium text-slate-600">
                                {coach.name} · {coach.phone}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-1 text-sm font-bold text-slate-700">--</p>
                        )}
                      </div>
                      {(teamDetail?.logo_url || teamDetail?.flag_url) && (
                        <div className="grid gap-3 md:grid-cols-2">
                          {teamDetail?.logo_url && (
                            <div>
                              <p className="text-[10px] font-bold text-indigo-400 uppercase">队伍LOGO</p>
                              <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
                                <img src={teamDetail.logo_url} alt="队伍LOGO" className="h-28 w-full object-cover" />
                              </div>
                            </div>
                          )}
                          {teamDetail?.flag_url && (
                            <div>
                              <p className="text-[10px] font-bold text-indigo-400 uppercase">队旗</p>
                              <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
                                <img src={teamDetail.flag_url} alt="队旗" className="h-28 w-full object-cover" />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {teamDetail?.uniforms && teamDetail.uniforms.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[10px] font-bold text-indigo-400 uppercase">队伍队服</p>
                            <span className="text-[10px] text-slate-500">支持多款与主色调名称维护</span>
                          </div>
                          <div className="mt-2 grid gap-3 md:grid-cols-2">
                            {teamDetail.uniforms.map((uniform) => (
                              <div key={uniform.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                                <img src={uniform.image_url} alt={uniform.name || '队服'} className="h-28 w-full object-cover" />
                                <div className="space-y-1 px-3 py-3">
                                  <p className="text-xs font-bold text-slate-700">{uniform.name || '队服款式'}</p>
                                  <p className="text-[11px] text-slate-500">主色调：{uniform.primary_color_name}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {teamDetail?.members && teamDetail.members.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase">队伍成员</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {teamDetail.members.map((member, idx) => (
                              <span key={idx} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-medium text-slate-600">
                                {member.name}
                                {member.gender ? ` (${member.gender})` : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="p-8 pt-4 border-t border-slate-100 bg-white">
                {isEditingParticipant ? (
                  <div className="flex gap-3">
                    <button 
                      onClick={handleSaveParticipant}
                      className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                    >
                      保存修改
                    </button>
                    <button 
                      onClick={() => setIsEditingParticipant(false)}
                      className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setSelectedParticipantForDetail(null)}
                    className="w-full py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                  >
                    确定
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Team Detail Modal */}
      <AnimatePresence>
        {selectedTeamForDetail && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTeamForDetail(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">队伍详情</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedTeamForDetail.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTeamForDetail(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
                </div>

              <div className="flex-1 overflow-y-auto bg-slate-50/40 custom-scrollbar">
                <div className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-600" />
                        <h3 className="text-sm font-bold text-slate-900">队伍信息</h3>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold text-indigo-900">{selectedTeamForDetail.name}</p>
                          <p className="mt-1 text-[11px] font-mono text-indigo-500">Team ID: {selectedTeamForDetail.id}</p>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-indigo-600 shadow-sm">
                          {selectedTeamForDetail.member_count} 人
                        </span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase">邀请码</p>
                          <p className="mt-1 text-sm font-bold text-slate-800 font-mono">{selectedTeamForDetail.invite_code || '--'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase">关联组别</p>
                          <p className="mt-1 text-sm font-bold text-slate-800">{selectedTeamForDetail.group_name || '--'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase">创建人</p>
                          <p className="mt-1 text-sm font-bold text-slate-800">{selectedTeamForDetail.creator_name || '--'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase">领队</p>
                          <p className="mt-1 text-sm font-bold text-slate-800">{selectedTeamForDetail.leader}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase">领队电话</p>
                          <p className="mt-1 text-sm font-bold text-slate-800 font-mono">{selectedTeamForDetail.leader_phone}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase">联络员</p>
                          <p className="mt-1 text-sm font-bold text-slate-800">{selectedTeamForDetail.liaison_name || '--'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase">联络电话</p>
                          <p className="mt-1 text-sm font-bold text-slate-800 font-mono">{selectedTeamForDetail.liaison_phone || '--'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase">队伍总人数</p>
                          <p className="mt-1 text-sm font-bold text-slate-800">{selectedTeamForDetail.member_count} 人</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-[10px] font-bold text-indigo-400 uppercase">教练信息</p>
                        {getTeamCoaches(selectedTeamForDetail).length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {getTeamCoaches(selectedTeamForDetail).map((coach, idx) => (
                              <span key={`${coach.name}-${idx}`} className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 shadow-sm">
                                {coach.name} · {coach.phone}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-1 text-sm font-bold text-slate-800">--</p>
                        )}
                      </div>
                      {(selectedTeamForDetail.logo_url || selectedTeamForDetail.flag_url) && (
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          {selectedTeamForDetail.logo_url && (
                            <div>
                              <p className="text-[10px] font-bold text-indigo-400 uppercase">队伍LOGO</p>
                              <div className="mt-2 overflow-hidden rounded-2xl border border-white/80 bg-white shadow-sm">
                                <img src={selectedTeamForDetail.logo_url} alt="队伍LOGO" className="h-36 w-full object-cover" />
                              </div>
                            </div>
                          )}
                          {selectedTeamForDetail.flag_url && (
                            <div>
                              <p className="text-[10px] font-bold text-indigo-400 uppercase">队旗</p>
                              <div className="mt-2 overflow-hidden rounded-2xl border border-white/80 bg-white shadow-sm">
                                <img src={selectedTeamForDetail.flag_url} alt="队旗" className="h-36 w-full object-cover" />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {selectedTeamForDetail.uniforms && selectedTeamForDetail.uniforms.length > 0 && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[10px] font-bold text-indigo-400 uppercase">队伍队服</p>
                            <span className="text-[11px] text-slate-500">支持多款上传，并可后台修改主色调名称</span>
                          </div>
                          <div className="mt-2 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {selectedTeamForDetail.uniforms.map((uniform) => (
                              <div key={uniform.id} className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-sm">
                                <img src={uniform.image_url} alt={uniform.name || '队服'} className="h-36 w-full object-cover" />
                                <div className="space-y-1 px-3 py-3">
                                  <p className="text-sm font-bold text-slate-800">{uniform.name || '队服款式'}</p>
                                  <p className="text-xs text-slate-500">主色调：{uniform.primary_color_name}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-sm font-bold text-slate-900">关联报名项目</h4>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500">
                        共 {selectedTeamForDetail.entries?.length || selectedTeamForDetail.events.length} 个
                      </span>
                    </div>
                    <div className="space-y-3">
                      {(selectedTeamForDetail.entries || []).map((entry) => (
                        <div key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-slate-900">{entry.registration_event_name}</p>
                              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                                {entry.type === 'team' ? '团体项目' : '单项项目'}
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] text-slate-500 font-mono">{entry.order_no}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => requestEntryRefund(entry)}
                              disabled={!canRefundEntry(entry)}
                              className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-bold transition-all ${
                                canRefundEntry(entry)
                                  ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              退款
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTeamForDetail(null);
                                setSelectedEntryForDetail(entry);
                              }}
                              className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1.5 text-[11px] font-bold text-indigo-600 hover:bg-indigo-100 transition-all"
                            >
                              查看报名项目详情
                            </button>
                          </div>
                        </div>
                      ))}
                      {(!selectedTeamForDetail.entries || selectedTeamForDetail.entries.length === 0) && (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-400">
                          暂无关联报名项目
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedTeamForDetail.members && selectedTeamForDetail.members.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">队伍成员</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedTeamForDetail.members.map((member, idx) => (
                          <div key={`${member.name}-${idx}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                            <p className="text-sm font-bold text-slate-900">{member.name}</p>
                            <p className="mt-1 text-[11px] text-slate-500 font-mono">{member.phone}</p>
                            <p className="mt-1 text-[11px] text-slate-400">性别：{member.gender}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 pt-4 border-t border-slate-100 bg-white">
                <button
                  onClick={() => setSelectedTeamForDetail(null)}
                  className="w-full py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all"
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header: Fixed at top */}
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">订单详情</h2>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedOrder.order_no}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-50/40 custom-scrollbar">
                {(() => {
                  return (
                    <div className="p-8 space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">下单用户</p>
                          <p className="mt-2 text-sm font-bold text-slate-900">{selectedOrder.user_name}</p>
                          <p className="mt-1 text-[11px] text-slate-500 font-mono">{selectedOrder.user_phone}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">支付状态</p>
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              selectedOrder.pay_status === PayStatus.PAID ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {selectedOrder.pay_status}
                            </span>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">订单金额</p>
                          <p className="mt-2 text-lg font-bold text-indigo-600">¥{selectedOrder.pay_amount.toFixed(2)}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">订单来源</p>
                          <p className="mt-2 text-sm font-bold text-slate-900">{selectedOrder.order_source || '--'}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">更新时间</p>
                          <p className="mt-2 text-[11px] font-mono text-slate-600">{selectedOrder.updated_at}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 rounded-full bg-white p-1.5 shadow-lg shadow-slate-200/70 ring-1 ring-slate-200 w-fit">
                        {[
                          { id: 'projects', label: '报名项目列表', icon: ClipboardList },
                          { id: 'payments', label: '支付记录', icon: CreditCard },
                          { id: 'refunds', label: '退款记录', icon: RotateCcw },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setOrderDetailTab(tab.id as OrderDetailTab)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                              orderDetailTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                          >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {orderDetailTab === 'projects' && (
                        <div className="space-y-4">
                          <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <ClipboardList className="w-4 h-4 text-indigo-600" />
                                  <h3 className="text-sm font-bold text-slate-900">报名项目列表</h3>
                                </div>
                                <p className="mt-1 text-xs text-slate-500">
                                  点击选手可查看报名资料，点击队伍可查看队伍详情；如需退款，请在对应报名项目上单独发起。
                                </p>
                              </div>
                              <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500 shrink-0">
                                共 {selectedOrder.entries.length} 个报名项目
                              </div>
                            </div>
                            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                              {selectedOrder.entries.map((entry) =>
                                renderOrderEntryCard(selectedOrder, entry, {
                                  showRefundButton: true,
                                  onViewDetails: () => setSelectedEntryForDetail(entry),
                                }),
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {orderDetailTab === 'payments' && (
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-indigo-600" />
                            <h3 className="text-sm font-bold text-slate-900">支付记录</h3>
                          </div>
                          <div className="space-y-3">
                            {getOrderPaymentRecords(selectedOrder).map((record) => (
                              <div key={record.id} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 flex items-start justify-between gap-4">
                                <div>
                                  <p className="text-sm font-bold text-slate-900">{record.title}</p>
                                  <p className="mt-1 text-[11px] text-slate-500 font-mono">{record.time}</p>
                                  <p className="mt-2 text-[11px] text-slate-500">{record.note}</p>
                                </div>
                                <div className="text-right">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                    record.status === '待支付' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                  }`}>
                                    {record.status}
                                  </span>
                                  <p className="mt-3 text-base font-bold text-indigo-600">¥{record.amount.toFixed(2)}</p>
                                  <p className="mt-1 text-[11px] text-slate-400">{record.method}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {orderDetailTab === 'refunds' && (
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
                          <div className="flex items-center gap-2">
                            <RotateCcw className="w-4 h-4 text-indigo-600" />
                            <h3 className="text-sm font-bold text-slate-900">退款记录</h3>
                          </div>
                          {getOrderRefundRecords(selectedOrder).length > 0 ? (
                            <div className="space-y-3">
                              {getOrderRefundRecords(selectedOrder).map((record) => (
                                <div key={record.id} className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 flex items-start justify-between gap-4">
                                  <div>
                                    <p className="text-sm font-bold text-slate-900">{record.title}</p>
                                    <p className="mt-1 text-[11px] text-slate-500 font-mono">{record.time}</p>
                                    <p className="mt-2 text-[11px] text-slate-500">{record.note}</p>
                                  </div>
                                  <div className="text-right">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                                      {record.status}
                                    </span>
                                    <p className="mt-3 text-base font-bold text-rose-600">¥{record.amount.toFixed(2)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                              <p className="text-sm font-medium text-slate-400">该订单暂无退款记录</p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">订单备注</p>
                        <p className="mt-2 text-sm text-slate-600 leading-6">{selectedOrder.remarks || '暂无订单备注'}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Project Participant Details Modal */}
      <AnimatePresence>
        {selectedProjectForDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProjectForDetails(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">选手明细 - {selectedProjectForDetails.name}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">当前报名人数: {selectedProjectForDetails.current_count} / {selectedProjectForDetails.seat_limit}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedProjectForDetails(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">选手姓名</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">联系电话</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">所属队伍</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">状态</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MOCK_PARTICIPANTS.slice(0, 5).map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">
                          <button 
                            onClick={() => handleParticipantClick(p.name, p.phone)}
                            className="hover:text-indigo-600 hover:underline transition-all"
                          >
                            {p.name}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-slate-600">{p.phone}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{p.team_name || '--'}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                            已报名
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => {
                              setSelectedParticipantForAdjustment(p);
                              setIsProjectAdjustmentModalOpen(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-700 text-xs font-bold bg-indigo-50 px-3 py-1.5 rounded-lg transition-all"
                          >
                            项目调整
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Participant Project Adjustment Modal */}
      <AnimatePresence>
        {isProjectAdjustmentModalOpen && selectedParticipantForAdjustment && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProjectAdjustmentModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">选手项目调整</h3>
                    <p className="text-xs text-slate-500 mt-0.5">调整选手 [{selectedParticipantForAdjustment.name}] 的报名项目</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">当前项目</p>
                    <p className="text-sm font-bold text-slate-700">{selectedProjectForDetails?.name}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">调整至新项目</label>
                    <select 
                      value={newProjectForAdjustment}
                      onChange={(e) => setNewProjectForAdjustment(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">请选择新项目...</option>
                      {projectSummary.filter(p => p.id !== selectedProjectForDetails?.id).map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      onClick={() => handleProjectAdjustment(selectedParticipantForAdjustment.id, selectedProjectForDetails.id, newProjectForAdjustment)}
                      disabled={!newProjectForAdjustment}
                      className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                      确认调整
                    </button>
                    <button
                      onClick={() => handleProjectAdjustment(selectedParticipantForAdjustment.id, selectedProjectForDetails.id, 'REFUND')}
                      className="flex-1 bg-rose-50 text-rose-600 py-2 rounded-xl text-sm font-bold hover:bg-rose-100 transition-all"
                    >
                      退款并取消
                    </button>
                  </div>
                  <button 
                    onClick={() => setIsProjectAdjustmentModalOpen(false)}
                    className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    取消操作
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Project Establishment Confirmation Modal */}
      <AnimatePresence>
        {projectToEstablish && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProjectToEstablish(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">项目立项确认</h3>
                    <p className="text-xs text-slate-500 mt-0.5">确认将项目 [{projectToEstablish.name}] 立项为比赛项目</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">项目名称</p>
                      <p className="text-sm font-bold text-slate-700">{projectToEstablish.name}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">项目类型</p>
                      <p className="text-sm font-bold text-slate-700">{projectToEstablish.type}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">席位限制</p>
                      <p className="text-sm font-bold text-slate-700 font-mono">{projectToEstablish.seat_limit}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">当前报名人数</p>
                      <p className="text-sm font-bold text-indigo-600 font-mono">{projectToEstablish.current_count}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <p className="text-xs text-amber-700 leading-relaxed">
                      是否确定将该项目立项为比赛项目？立项后该项目可进入项目编排阶段。
                    </p>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      onClick={() => handleConfirmEstablishment(projectToEstablish.id)}
                      className="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                      确认立项
                    </button>
                    <button
                      onClick={() => setProjectToEstablish(null)}
                      className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

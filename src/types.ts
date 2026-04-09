export enum RegistrationChannel {
  UNLIMITED = 'UNLIMITED',
  BACKEND_ONLY = 'BACKEND_ONLY'
}

export enum ListRestrictionType {
  NONE = 'NONE',
  WHITELIST = 'WHITELIST',
  BLACKLIST = 'BLACKLIST'
}

export enum QuotaBasis {
  SEAT = 'SEAT',
  PERSON = 'PERSON'
}

export enum AgeCalculationBase {
  EVENT_START = 'EVENT_START',
  REGISTRATION_END = 'REGISTRATION_END',
  CALENDAR_YEAR_START = 'CALENDAR_YEAR_START',
  CUSTOM_DATE = 'CUSTOM_DATE'
}

export enum AgeCalculationMethod {
  BIRTH_YEAR = 'BIRTH_YEAR',
  FULL_AGE = 'FULL_AGE'
}

export enum RuleType {
  EARLY_BIRD = 'EARLY_BIRD',
  MULTI_EVENT = 'MULTI_EVENT',
  COUPON = 'COUPON',
  MEMBER_DISCOUNT = 'MEMBER_DISCOUNT',
  CUSTOM = 'CUSTOM'
}

export enum ScopeType {
  ORDER = 'ORDER',
  ENTRY = 'ENTRY',
  PLAYER = 'PLAYER'
}

export enum DiscountValueType {
  FIXED = 'FIXED',
  PERCENT = 'PERCENT'
}

export enum StackStrategy {
  STACKABLE = 'STACKABLE',
  EXCLUSIVE = 'EXCLUSIVE'
}

export enum RuleStatus {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED'
}

export enum MultiEventCalcType {
  PLAYER = 'PLAYER',
  ENTRY = 'ENTRY'
}

export interface MultiEventStep {
  index: number;
  discount: number;
  discount_type: DiscountValueType;
}

export interface DiscountRule {
  id: string;
  event_id: string;
  rule_name: string;
  rule_type: RuleType;
  scope_type: ScopeType;
  discount_type: DiscountValueType;
  discount_value: number;
  stack_strategy: StackStrategy;
  priority: number;
  start_time: string;
  end_time: string;
  status: RuleStatus;
  applicable_scope?: string[]; // e.g., ['INDIVIDUAL']
  // Multi Event
  multi_event_calc_type?: MultiEventCalcType;
  multi_event_step_config?: MultiEventStep[];
  // Coupon
  coupon_code?: string;
  usage_conditions?: string;
  // Member
  member_levels?: string[];
  // Custom
  custom_params?: string;
  // Mutual Exclusion
  exclusive_rule_ids?: string[];
}

export interface MutuallyExclusiveGroup {
  id: string;
  eventIds: string[];
  eventNames: string[];
}

export enum SigningMethod {
  READ_AND_AGREE = 'READ_AND_AGREE',
  USER_SIGNATURE = 'USER_SIGNATURE'
}

export interface AgreementTemplate {
  id: string;
  name: string;
}

export interface AdvancedTeamLimitRule {
  id: string;
  groupName: string;
  enabled: boolean;
  maxMembers?: number;
  genderRequirement?: TeamGenderRequirement;
}

export interface AdvancedTeamLimitConfig {
  requireGroupOnTeamCreation: boolean;
  maxMembers?: number;
  includeLeaderInMemberLimit: boolean;
  includeCoachInMemberLimit: boolean;
  leaderRequired: boolean;
  leaderMustBePlayer: boolean;
  allowCoach: boolean;
  coachRequired: boolean;
  maxCoachCount?: number;
}

export interface RegistrationConfig {
  startTime: string;
  endTime: string;
  channel: RegistrationChannel;
  enableRegistrationPublicity: boolean;
  publicVisiblePlayerFields: string[];
  listRestrictions: ListRestrictionType[];
  selectedWhitelistListIds: string[];
  selectedBlacklistListIds: string[];
  enableQuota: boolean;
  individualQuota?: number;
  teamQuota?: number;
  quotaBasis: QuotaBasis;
  multiEventDiscount: DiscountRule;
  // Multi-Event Restriction
  enableMultiEventRestriction: boolean;
  maxEventsPerPerson: number;
  restrictionScope: string[]; // e.g., ['INDIVIDUAL', 'TEAM']
  mutuallyExclusiveGroups: MutuallyExclusiveGroup[];
  enableIndividualRegistration: boolean;
  enableTeamSizeLimit: boolean;
  teamLimitConfig: AdvancedTeamLimitConfig;
  ageCalculationBase: AgeCalculationBase;
  ageCalculationMethod: AgeCalculationMethod;
  ageCalculationCustomDate?: string;
  // Agreement Signing
  enableSigning: boolean;
  selectedAgreements: AgreementTemplate[];
  signingMethod: SigningMethod;
}

export enum PayStatus {
  UNPAID = '未支付',
  PAID = '已支付',
  PARTIAL_REFUND = '部分退款',
  REFUNDED = '已退款'
}

export enum EntryStatus {
  SUCCESS = '报名成功',
  CANCELLED = '已取消',
  REFUNDED = '已退款',
  PENDING_PAYMENT = '待支付'
}

export interface TeamEvent {
  id: string;
  match_format_rule?: {
    category: string;
    operator: string;
    value: string;
  };
  group_rule?: {
    category: string;
    operator: string;
    values: string[];
  };
  restrictions: RestrictionRule[];
}

export interface RestrictionRule {
  id: string;
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contains';
  value: string;
}

export interface TeamGenderRequirement {
  min_male?: number;
  max_male?: number;
  min_female?: number;
  max_female?: number;
}

export interface Project {
  id: string;
  name: string;
  short_name: string;
  code: string;
  type: 'single' | 'team';
  match_format_rule?: {
    category: string;
    operator: string;
    value: string;
  };
  group_rule?: {
    category: string;
    operator: string;
    values: string[];
  };
  fee: number;
  deposit: number;
  max_seats: number;
  min_seats?: number;
  team_join: boolean;
  max_members_per_team?: number;
  team_size_limit?: number; // For team projects
  team_size_min?: number; // For team projects
  team_size_max?: number; // For team projects
  team_gender_requirement?: TeamGenderRequirement; // For team projects
  template: string;
  sort: number;
  status: 'active' | 'inactive';
  restrictions: RestrictionRule[];
  team_events?: TeamEvent[]; // For team projects
}

export interface RegistrationOrder {
  id: string;
  order_no: string;
  user_id: string;
  user_name: string;
  user_phone: string;
  order_source?: string;
  remarks?: string;
  tournament_id: string;
  tournament_name: string;
  total_amount: number;
  discount_amount: number;
  deposit_amount: number;
  pay_amount: number;
  pay_status: PayStatus;
  created_at: string;
  updated_at: string;
  entries: RegistrationEntry[];
  signing_info?: {
    agreement_name: string;
    signed_at: string;
    ip_address: string;
  }[];
}

export interface RegistrationEntry {
  id: string;
  order_id: string;
  order_no: string;
  registration_event_id: string;
  registration_event_name: string;
  type: 'single' | 'team';
  team_id?: string;
  team_name?: string;
  participant_name: string;
  participant_phone: string;
  fee: number;
  discount_amount: number;
  deposit_amount: number;
  actual_amount: number;
  entry_status: EntryStatus;
  pay_status: PayStatus;
  created_at: string;
  updated_at: string;
  team_members?: {
    name: string;
    phone: string;
    gender: string;
    id_number?: string;
  }[];
  form_data?: {
    gender: string;
    tshirt_size: string;
    id_type: string;
    id_number: string;
  };
}

export interface ParticipantRecord {
  id: string;
  name: string;
  identity: string;
  phone: string;
  gender: string;
  event_count: number;
  team_name?: string;
  entries?: RegistrationEntry[];
}

export enum PhaseType {
  ELIMINATION = '淘汰赛',
  ROUND_ROBIN = '单循环赛',
  GROUP_ROUND_ROBIN = '分组循环赛',
  DOUBLE_ELIMINATION = '双败淘汰赛'
}

export interface PromotionRule {
  from_group?: number;
  from_rank: number;
  to_position: number;
}

export interface ProgressionRule {
  mode: 'group_ranking' | 'cross_group_ranking' | 'hybrid' | 'playoff';
  description?: string;
}

export interface PlacementRule {
  strategy: 'serpentine' | 'cross_group' | 'fixed' | 'random' | 'seed_protection';
  avoid_same_group: boolean;
  division_rule?: string;
  mapping_relations?: PromotionRule[];
}

export interface PhaseConfig {
  id: string;
  name: string;
  type: PhaseType;
  order: number;
  participant_count: number;
  promotion_count: number;
  
  // Round Robin specific
  group_count?: number;
  promotion_per_group?: number;
  grouping_strategy?: string;
  group_match_format?: string;
  enable_promotion_path?: boolean;
  ranking_rules?: string[];
  
  // Elimination specific
  seed_count?: number;
  play_third_place?: boolean;
  decide_top_n?: number;
  
  promotion_rules?: PromotionRule[];
  progression_rule?: ProgressionRule;
  placement_rule?: PlacementRule;
  
  // Match Rules
  match_win_loss_rule?: string; // For single projects
  team_match_rule?: string; // For team projects
  sub_match_rules?: Record<string, string>; // For team projects: sub_event_id -> win_loss_rule
}

export interface SubMatch {
  id: string;
  tie_id: string;
  sub_event_id: string;
  sub_event_name: string;
  participant_a?: string;
  participant_b?: string;
  score?: string;
  winner?: string;
  status: 'PENDING' | 'ONGOING' | 'COMPLETED' | 'WALKOVER' | 'WITHDRAWAL';
  order: number;
  referee_name?: string;
  remarks?: string;
}

export interface MatchSession {
  id: string;
  code: string;
  project_id: string;
  project_name: string;
  project_type?: 'single' | 'team';
  phase_id: string;
  phase_name: string;
  phase_type: PhaseType;
  round_index: number;
  round_name: string;
  match_index: number;
  participant_a?: string;
  participant_a_source?: string;
  participant_a_seed?: number;
  participant_b?: string;
  participant_b_source?: string;
  participant_b_seed?: number;
  winner?: string;
  score?: string;
  status: 'PENDING' | 'ONGOING' | 'COMPLETED' | 'WALKOVER' | 'WITHDRAWAL';
  court?: string;
  start_time?: string;
  match_date?: string;
  match_order?: number;
  is_bye?: boolean;
  sub_matches?: SubMatch[]; // For team projects
  winner_to?: string; // Match ID
  loser_to?: string; // Match ID
  progression_status?: 'PENDING' | 'COMPLETED';
  referee_name?: string;
  remarks?: string;
}

export interface MatchRound {
  phase_id: string;
  round_index: number;
  name: string;
  matches: MatchSession[];
}

export interface TournamentAttachment {
  id: string;
  name: string;
  sizeLabel: string;
}

export interface TournamentBasicInfo {
  tournamentName: string;
  tournamentSubtitle: string;
  coverUrl: string;
  registrationStartTime: string;
  registrationEndTime: string;
  startTime: string;
  endTime: string;
  organizers: string[];
  coOrganizers: string[];
  province: string;
  city: string;
  venueName: string;
  venueAddress: string;
  competitionRules: string;
  description: string;
  attachments: TournamentAttachment[];
}

export interface VenueConfig {
  court_count: number;
  match_duration: number; // minutes
  break_duration: number; // minutes
  buffer_duration: number; // minutes
  max_daily_hours: number;
  max_days: number;
}

export interface ProjectSchedulingConfig {
  project_id: string;
  project_name: string;
  project_code: string;
  phases: PhaseConfig[];
  venue_config?: VenueConfig;
  generated_framework?: {
    rounds: MatchRound[];
    total_matches: number;
  };
}

export interface TeamRecord {
  id: string;
  name: string;
  group_name?: string;
  invite_code?: string;
  creator_name?: string;
  creator_phone?: string;
  leader: string;
  leader_phone: string;
  liaison_name?: string;
  liaison_phone?: string;
  coach_name?: string;
  coach_phone?: string;
  coaches?: {
    name: string;
    phone: string;
  }[];
  logo_url?: string;
  flag_url?: string;
  uniforms?: {
    id: string;
    name?: string;
    primary_color_name: string;
    image_url: string;
  }[];
  member_count: number;
  members?: {
    name: string;
    phone: string;
    gender: string;
  }[];
  event_count: number;
  events: string[];
  entries?: RegistrationEntry[];
}

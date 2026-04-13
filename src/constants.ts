import { 
  RegistrationOrder, 
  ParticipantRecord, 
  TeamRecord,
  PayStatus,
  EntryStatus
} from './types';

export const MOCK_ORDERS: RegistrationOrder[] = [
  {
    id: 'ORD-001',
    order_no: 'RE202603180001',
    user_id: 'U1001',
    user_name: '张三',
    user_phone: '13800138000',
    order_source: '小程序报名',
    remarks: '领队已统一确认本次报名信息，待赛事方审核报名资料。',
    tournament_id: 'T001',
    tournament_name: '2026全国羽毛球公开赛',
    total_amount: 300,
    discount_amount: 50,
    deposit_amount: 0,
    pay_amount: 250,
    pay_status: PayStatus.PAID,
    created_at: '2026-03-18 09:30:00',
    updated_at: '2026-03-18 09:35:00',
    signing_info: [
      { agreement_name: '赛事免责声明', signed_at: '2026-03-18 09:32:15', ip_address: '192.168.1.105' },
      { agreement_name: '个人信息保护政策', signed_at: '2026-03-18 09:32:18', ip_address: '192.168.1.105' }
    ],
    entries: [
      {
        id: 'ENT-001',
        order_id: 'ORD-001',
        order_no: 'RE202603180001',
        registration_event_id: 'E001',
        registration_event_name: '男子单打',
        type: 'single',
        participant_name: '张三',
        participant_phone: '13800138000',
        fee: 150,
        discount_amount: 25,
        deposit_amount: 0,
        actual_amount: 125,
        entry_status: EntryStatus.SUCCESS,
        pay_status: PayStatus.PAID,
        created_at: '2026-03-18 09:30:00',
        updated_at: '2026-03-18 09:35:00',
        form_data: {
          gender: '男',
          tshirt_size: 'XL',
          id_type: '身份证',
          id_number: '4401**********1234'
        }
      },
      {
        id: 'ENT-002',
        order_id: 'ORD-001',
        order_no: 'RE202603180001',
        registration_event_id: 'E002',
        registration_event_name: '男子双打',
        type: 'single',
        team_id: 'TEAM-001',
        team_name: '羽林军',
        participant_name: '张三/李四',
        participant_phone: '13800138000',
        fee: 150,
        discount_amount: 25,
        deposit_amount: 0,
        actual_amount: 125,
        entry_status: EntryStatus.SUCCESS,
        pay_status: PayStatus.PAID,
        created_at: '2026-03-18 09:30:00',
        updated_at: '2026-03-18 09:35:00',
        form_data: {
          gender: '男',
          tshirt_size: 'XL',
          id_type: '身份证',
          id_number: '4401**********1234'
        }
      },
      {
        id: 'ENT-004',
        order_id: 'ORD-001',
        order_no: 'RE202603180001',
        registration_event_id: 'E005',
        registration_event_name: '混合双打',
        type: 'single',
        participant_name: '张三',
        participant_phone: '13800138000',
        fee: 150,
        discount_amount: 25,
        deposit_amount: 0,
        actual_amount: 125,
        entry_status: EntryStatus.SUCCESS,
        pay_status: PayStatus.PAID,
        created_at: '2026-03-18 09:30:00',
        updated_at: '2026-03-18 09:35:00',
        form_data: {
          gender: '男',
          tshirt_size: 'XL',
          id_type: '身份证',
          id_number: '4401**********1234'
        }
      },
      {
        id: 'ENT-005',
        order_id: 'ORD-001',
        order_no: 'RE202603180001',
        registration_event_id: 'E006',
        registration_event_name: '混合团体',
        type: 'team',
        team_id: 'TEAM-001',
        team_name: '羽林军',
        participant_name: '羽林军',
        participant_phone: '13800138000',
        fee: 1000,
        discount_amount: 0,
        deposit_amount: 0,
        actual_amount: 1000,
        entry_status: EntryStatus.SUCCESS,
        pay_status: PayStatus.PAID,
        created_at: '2026-03-18 09:30:00',
        updated_at: '2026-03-18 09:35:00',
        team_members: [
          { name: '张三', phone: '13800138000', gender: '男' },
          { name: '李四', phone: '13900139000', gender: '男' },
          { name: '王五', phone: '13700137000', gender: '男' },
          { name: '赵六', phone: '13600136000', gender: '女' }
        ]
      }
    ]
  },
  {
    id: 'ORD-002',
    order_no: 'RE202603180002',
    user_id: 'U1002',
    user_name: '李四',
    user_phone: '13900139000',
    order_source: '后台代报名',
    remarks: '俱乐部统一代报名创建，待用户完成支付。',
    tournament_id: 'T001',
    tournament_name: '2026全国羽毛球公开赛',
    total_amount: 150,
    discount_amount: 0,
    deposit_amount: 0,
    pay_amount: 150,
    pay_status: PayStatus.UNPAID,
    created_at: '2026-03-18 10:00:00',
    updated_at: '2026-03-18 10:00:00',
    entries: [
      {
        id: 'ENT-003',
        order_id: 'ORD-002',
        order_no: 'RE202603180002',
        registration_event_id: 'E001',
        registration_event_name: '男子单打',
        type: 'single',
        participant_name: '李四',
        participant_phone: '13900139000',
        fee: 150,
        discount_amount: 0,
        deposit_amount: 0,
        actual_amount: 150,
        entry_status: EntryStatus.PENDING_PAYMENT,
        pay_status: PayStatus.UNPAID,
        created_at: '2026-03-18 10:00:00',
        updated_at: '2026-03-18 10:00:00',
        form_data: {
          gender: '男',
          tshirt_size: 'L',
          id_type: '身份证',
          id_number: '4401**********5678'
        }
      }
    ]
  }
];

export const MOCK_PROJECT_SUMMARY = [
  { id: 'E001', name: '男子单打', short_name: '男单', code: 'MS', type: 'single', current_count: 32, seat_limit: 64, status: 'ESTABLISHED', establishment_status: '已立项' },
  { id: 'E002', name: '男子双打', short_name: '男双', code: 'MD', type: 'single', current_count: 16, seat_limit: 32, status: 'ESTABLISHED', establishment_status: '已立项' },
  { id: 'E003', name: '女子单打', short_name: '女单', code: 'WS', type: 'single', current_count: 12, seat_limit: 32, status: 'REGISTRATION', establishment_status: '待立项' },
  { id: 'E004', name: '女子双打', short_name: '女双', code: 'WD', type: 'single', current_count: 4, seat_limit: 16, status: 'REGISTRATION', establishment_status: '待立项' },
  { id: 'E005', name: '混合双打', short_name: '混双', code: 'XD', type: 'single', current_count: 24, seat_limit: 32, status: 'ESTABLISHED', establishment_status: '已立项' },
  { 
    id: 'E006', 
    name: '混合团体', 
    short_name: '团赛', 
    code: 'TEAM', 
    type: 'team', 
    current_count: 8, 
    seat_limit: 16, 
    status: 'ESTABLISHED', 
    establishment_status: '已立项',
    team_events: [
      { 
        id: 'TE-1', 
        match_format_rule: { category: '单项', operator: '=', value: '男单' },
        group_rule: { category: '年龄组', operator: 'in', values: ['公开组'] },
        restrictions: [] 
      },
      { 
        id: 'TE-2', 
        match_format_rule: { category: '单项', operator: '=', value: '女单' },
        group_rule: { category: '年龄组', operator: 'in', values: ['公开组'] },
        restrictions: [] 
      },
      { 
        id: 'TE-3', 
        match_format_rule: { category: '单项', operator: '=', value: '男双' },
        group_rule: { category: '年龄组', operator: 'in', values: ['公开组'] },
        restrictions: [] 
      }
    ]
  }
];

export const MOCK_PARTICIPANTS: ParticipantRecord[] = [
  { id: 'P001', name: '张三', identity: '4401**********1234', phone: '13800138000', gender: '男', team_name: '羽林军', event_count: 3 },
  { id: 'P002', name: '李四', identity: '4401**********5678', phone: '13900139000', gender: '男', team_name: '羽林军', event_count: 2 },
  { id: 'P003', name: '王五', identity: '4401**********1111', phone: '13700137000', gender: '男', team_name: '飞翔队', event_count: 1 },
  { id: 'P004', name: '赵六', identity: '4401**********2222', phone: '13600136000', gender: '女', team_name: '飞翔队', event_count: 1 },
  { id: 'P005', name: '钱七', identity: '4401**********3333', phone: '13500135000', gender: '女', team_name: '闪电队', event_count: 2 }
];

export const MOCK_TEAMS: TeamRecord[] = [
  {
    id: 'TEAM-001',
    name: '羽林军',
    group_name: '公开组',
    invite_code: 'YLJ2026',
    creator_name: '张三',
    creator_phone: '13800138000',
    leader: '张三',
    leader_phone: '13800138000',
    liaison_name: '周联络',
    liaison_phone: '13855556666',
    coach_name: '老王',
    coach_phone: '13811112222',
    coaches: [
      { name: '老王', phone: '13811112222' },
      { name: '陈教练', phone: '13822223333' },
    ],
    logo_url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Flag%20of%20the%20People%27s%20Republic%20of%20China%20%28cropped%29.svg',
    flag_url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Flag%20of%20the%20People%27s%20Republic%20of%20China.svg',
    uniforms: [
      {
        id: 'uniform-001',
        name: '中国国家队比赛服（红）',
        primary_color_name: '中国红',
        image_url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Chen%20Long2012.jpg',
      },
      {
        id: 'uniform-002',
        name: '中国国家队训练服（白）',
        primary_color_name: '白金配色',
        image_url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Li%20Xuerui%20%28CHN%29%202012.jpg',
      },
    ],
    member_count: 12,
    event_count: 2,
    events: ['男子单打', '男子双打']
  },
  {
    id: 'TEAM-002',
    name: '飞翔队',
    group_name: 'U12',
    invite_code: 'FXD2026',
    creator_name: '王五',
    creator_phone: '13700137000',
    leader: '王五',
    leader_phone: '13700137000',
    liaison_name: '林联络',
    liaison_phone: '13755556666',
    coach_name: '老李',
    coach_phone: '13711112222',
    coaches: [
      { name: '老李', phone: '13711112222' },
    ],
    logo_url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Japan%20flag%20square.png',
    flag_url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Flag%20of%20Japan.svg',
    uniforms: [
      {
        id: 'uniform-003',
        name: '日本国家队比赛服（蓝）',
        primary_color_name: '靛蓝色',
        image_url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sho%20Sasaki%20US%20Open%20Badminton%202011.jpg',
      },
      {
        id: 'uniform-003b',
        name: '日本国家队比赛服（粉）',
        primary_color_name: '樱花粉',
        image_url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Satoko%20Suetsuna%20%28JAP%29%202011.jpg',
      },
    ],
    member_count: 8,
    event_count: 1,
    events: ['男子单打']
  },
  {
    id: 'TEAM-003',
    name: '闪电队',
    group_name: 'A组',
    invite_code: 'SDD2026',
    creator_name: '钱七',
    creator_phone: '13500135000',
    leader: '钱七',
    leader_phone: '13500135000',
    liaison_name: '苏联络',
    liaison_phone: '13566667777',
    coach_name: '老赵',
    coach_phone: '13511112222',
    coaches: [
      { name: '老赵', phone: '13511112222' },
      { name: '何教练', phone: '13544445555' },
    ],
    logo_url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Flag%20of%20South%20Korea%20%28Square%29.svg',
    flag_url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Flag%20of%20South%20Korea.svg',
    uniforms: [
      {
        id: 'uniform-004',
        name: '韩国国家队比赛服（白）',
        primary_color_name: '纯白色',
        image_url: 'https://commons.wikimedia.org/wiki/Special:FilePath/An%20Se-young.jpg',
      },
      {
        id: 'uniform-005',
        name: '韩国国家队双打服（蓝）',
        primary_color_name: '深蓝色',
        image_url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Jung%20Kyung-eun%202011%20US%20Open%20Badminton%201.jpg',
      },
    ],
    member_count: 15,
    event_count: 2,
    events: ['女子单打', '女子双打']
  }
];

export const GROUP_OPTIONS: Record<string, string[]> = {
  'U系列': ['U8', 'U10', 'U12', 'U14', 'U16', 'U18'],
  '公开组': ['公开组'],
  '精英组': ['精英组'],
  '大师组': ['大师组'],
  '自定义': [],
};

export const EVENT_GROUP_CONFIG = {
  category: 'U系列',
  values: ['U10', 'U12'],
} as const;

export interface MatchFormatOption {
  value: string;
  shortName: string;
  code: string;
}

export interface MatchFormatGroup {
  id: string;
  name: string;
  options: MatchFormatOption[];
}

export const MATCH_FORMAT_GROUPS: MatchFormatGroup[] = [
  {
    id: 'regular',
    name: '常规赛制',
    options: [
      { value: '男子单打', shortName: '男单', code: 'MS' },
      { value: '女子单打', shortName: '女单', code: 'WS' },
      { value: '男子双打', shortName: '男双', code: 'MD' },
      { value: '女子双打', shortName: '女双', code: 'WD' },
      { value: '混合双打', shortName: '混双', code: 'XD' },
    ],
  },
  {
    id: 'open',
    name: '开放形式',
    options: [
      { value: '单打', shortName: '单打', code: 'S' },
      { value: '双打', shortName: '双打', code: 'D' },
      { value: '三人制', shortName: '三人制', code: 'T3' },
    ],
  },
  {
    id: 'three-player-gender',
    name: '三人制（限制性别）',
    options: [
      { value: '3男', shortName: '3男', code: 'M3' },
      { value: '3女', shortName: '3女', code: 'W3' },
      { value: '1男2女', shortName: '1男2女', code: 'M1W2' },
      { value: '2男1女', shortName: '2男1女', code: 'M2W1' },
      { value: '混合(至少1异性)', shortName: '混合(至少1异性)', code: 'MIX1' },
    ],
  },
];

export const MATCH_FORMAT_OPTIONS = MATCH_FORMAT_GROUPS.flatMap((group) =>
  group.options.map((option) => ({
    ...option,
    groupId: group.id,
    groupName: group.name,
  })),
);

export const getMatchFormatOption = (value?: string) =>
  MATCH_FORMAT_OPTIONS.find((option) => option.value === value);

export const getMatchFormatGroupByValue = (value?: string, fallbackGroupName?: string) => {
  if (fallbackGroupName && MATCH_FORMAT_GROUPS.some((group) => group.name === fallbackGroupName)) {
    return fallbackGroupName;
  }
  return getMatchFormatOption(value)?.groupName || MATCH_FORMAT_GROUPS[0].name;
};

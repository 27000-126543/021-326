import type { ClaimRecord, AuditRecord, UserInfo } from '@/types/claim'

export const mockPendingClaims: ClaimRecord[] = [
  {
    id: '1',
    code: 'TW-2025-001',
    title: '1#楼主体结构停工索赔',
    contractor: '中建三局第一建设有限公司',
    submitDate: '2025-06-18 09:30',
    stopDate: '2025-06-15 至 2025-06-17',
    stopLocation: '1#楼 3-5层',
    reason: '设计变更导致停工，等待新图纸下发',
    reasonCategory: '图纸变更',
    resources: [
      { type: '机械', name: '塔式起重机', count: 2, unit: '台' },
      { type: '人员', name: '钢筋班', count: 18, unit: '人' },
      { type: '人员', name: '模板班', count: 12, unit: '人' },
      { type: '人员', name: '混凝土班', count: 8, unit: '人' }
    ],
    attachments: [
      { id: 'a1', name: '停工现场照片1.jpg', type: 'image' },
      { id: 'a2', name: '停工现场照片2.jpg', type: 'image' },
      { id: 'a3', name: '设计变更通知.pdf', type: 'pdf' }
    ],
    attachmentSummary: '现场照片3张、设计变更通知1份、人员考勤表1份',
    status: 'pending',
    currentHandler: '张监理',
    submitter: '李工长',
    submitterPhone: '138****8888'
  },
  {
    id: '2',
    code: 'TW-2025-002',
    title: '地下室施工场地移交延误',
    contractor: '中建三局第一建设有限公司',
    submitDate: '2025-06-17 14:20',
    stopDate: '2025-06-12 至 2025-06-14',
    stopLocation: '地下室B区',
    reason: '场地未按时移交，导致无法进场施工',
    reasonCategory: '场地移交延误',
    resources: [
      { type: '机械', name: '挖掘机', count: 1, unit: '台' },
      { type: '机械', name: '自卸汽车', count: 3, unit: '辆' },
      { type: '人员', name: '土方班', count: 15, unit: '人' }
    ],
    attachments: [
      { id: 'b1', name: '场地现状照片.jpg', type: 'image' },
      { id: 'b2', name: '移交协议.pdf', type: 'pdf' }
    ],
    attachmentSummary: '现场照片2张、场地移交协议1份',
    status: 'pending',
    currentHandler: '张监理',
    submitter: '王工',
    submitterPhone: '139****6666'
  },
  {
    id: '3',
    code: 'TW-2025-003',
    title: '幕墙施工图纸答疑迟滞',
    contractor: '深圳金粤幕墙装饰工程有限公司',
    submitDate: '2025-06-16 11:00',
    stopDate: '2025-06-10 至 2025-06-13',
    stopLocation: '2#楼南立面',
    reason: '幕墙节点图纸疑问未及时答复，导致加工图无法深化',
    reasonCategory: '设计答疑迟滞',
    resources: [
      { type: '机械', name: '高空作业吊篮', count: 4, unit: '台' },
      { type: '人员', name: '幕墙安装工', count: 20, unit: '人' },
      { type: '人员', name: '测量放线工', count: 3, unit: '人' }
    ],
    attachments: [
      { id: 'c1', name: '图纸疑问函.jpg', type: 'image' },
      { id: 'c2', name: '现场人员照片.jpg', type: 'image' },
      { id: 'c3', name: '吊篮租赁合同.pdf', type: 'pdf' }
    ],
    attachmentSummary: '疑问函1份、现场照片2张、设备租赁协议1份',
    status: 'pending',
    currentHandler: '李总监',
    submitter: '赵经理',
    submitterPhone: '137****5555'
  },
  {
    id: '4',
    code: 'TW-2025-004',
    title: '甲供材料进场延误',
    contractor: '中建三局第一建设有限公司',
    submitDate: '2025-06-15 16:45',
    stopDate: '2025-06-13 至 2025-06-14',
    stopLocation: '1#楼机电安装',
    reason: '甲方指定的电缆未按计划进场，导致机电安装停工',
    reasonCategory: '甲供材延误',
    resources: [
      { type: '人员', name: '电工班', count: 12, unit: '人' },
      { type: '人员', name: '管工班', count: 8, unit: '人' }
    ],
    attachments: [
      { id: 'd1', name: '材料进场计划.jpg', type: 'image' },
      { id: 'd2', name: '停工通知.pdf', type: 'pdf' }
    ],
    attachmentSummary: '进场计划1份、停工通知1份',
    status: 'pending',
    currentHandler: '张监理',
    submitter: '陈工',
    submitterPhone: '136****4444'
  },
  {
    id: '5',
    code: 'TW-2025-005',
    title: '雨季施工受阻',
    contractor: '中建三局第一建设有限公司',
    submitDate: '2025-06-14 10:30',
    stopDate: '2025-06-08 至 2025-06-09',
    stopLocation: '室外管网工程',
    reason: '连续暴雨导致室外管网施工无法进行',
    reasonCategory: '不可抗力',
    resources: [
      { type: '机械', name: '挖掘机', count: 2, unit: '台' },
      { type: '人员', name: '管道安装工', count: 10, unit: '人' }
    ],
    attachments: [
      { id: 'e1', name: '天气预报截图.jpg', type: 'image' },
      { id: 'e2', name: '现场积水照片.jpg', type: 'image' }
    ],
    attachmentSummary: '天气预报1份、现场照片2张',
    status: 'pending',
    currentHandler: '李总监',
    submitter: '刘工',
    submitterPhone: '135****3333'
  }
]

export const mockReviewingClaims: ClaimRecord[] = [
  {
    id: '6',
    code: 'TW-2025-006',
    title: '电梯井道尺寸偏差整改',
    contractor: '中建三局第一建设有限公司',
    submitDate: '2025-06-13 09:00',
    stopDate: '2025-06-11',
    stopLocation: '1#楼电梯井道',
    reason: '电梯井道尺寸与电梯图纸不符，需整改后安装',
    reasonCategory: '图纸变更',
    resources: [
      { type: '人员', name: '瓦工', count: 6, unit: '人' },
      { type: '机械', name: '升降机', count: 1, unit: '台' }
    ],
    attachments: [
      { id: 'f1', name: '井道测量记录.jpg', type: 'image' }
    ],
    attachmentSummary: '测量记录1份',
    status: 'reviewing',
    currentHandler: '张监理',
    submitter: '周工',
    submitterPhone: '134****2222'
  }
]

export const mockAuditRecords: AuditRecord[] = [
  {
    id: 'ar1',
    claimId: 'c1001',
    claimCode: 'TW-2025-000',
    auditor: '张监理',
    auditorRole: '监理工程师',
    auditTime: '2025-06-10 14:30',
    result: 'partial',
    approvedScope: '认可1台塔吊停置3天，钢筋班12人窝工2天',
    approvedResources: [
      { type: '机械', name: '塔式起重机', count: 1, unit: '台', duration: 3, durationUnit: '天' },
      { type: '人员', name: '钢筋班', count: 12, unit: '人', duration: 2, durationUnit: '天' }
    ],
    remark: '经现场核实，部分属实，具体数量以现场确认为准'
  },
  {
    id: 'ar2',
    claimId: 'c1002',
    claimCode: 'TW-2025-098',
    auditor: '李总监',
    auditorRole: '总监理工程师',
    auditTime: '2025-06-08 10:15',
    result: 'true',
    approvedScope: '全部属实，认可索赔事实',
    approvedResources: [
      { type: '机械', name: '挖掘机', count: 2, unit: '台', duration: 2, durationUnit: '天' },
      { type: '人员', name: '土方班', count: 15, unit: '人', duration: 2, durationUnit: '天' }
    ],
    remark: '情况属实，同意按实计算'
  },
  {
    id: 'ar3',
    claimId: 'c1003',
    claimCode: 'TW-2025-095',
    auditor: '张监理',
    auditorRole: '监理工程师',
    auditTime: '2025-06-05 16:00',
    result: 'false',
    approvedScope: '不属实，不予认可',
    approvedResources: [],
    remark: '经核实，施工方所述停工原因不成立，为自身施工组织不当造成'
  },
  {
    id: 'ar4',
    claimId: 'c1004',
    claimCode: 'TW-2025-092',
    auditor: '王工',
    auditorRole: '业主现场代表',
    auditTime: '2025-06-03 11:30',
    result: 'partial',
    approvedScope: '只认可5个工日的误工损失',
    approvedResources: [
      { type: '人员', name: '安装工', count: 5, unit: '人', duration: 1, durationUnit: '天' }
    ],
    remark: '部分认可，具体数量需进一步核实'
  },
  {
    id: 'ar5',
    claimId: 'c1005',
    claimCode: 'TW-2025-088',
    auditor: '李总监',
    auditorRole: '总监理工程师',
    auditTime: '2025-06-01 09:45',
    result: 'true',
    approvedScope: '事实清楚，全部认可',
    approvedResources: [
      { type: '机械', name: '塔式起重机', count: 2, unit: '台', duration: 3, durationUnit: '天' },
      { type: '人员', name: '各班组', count: 50, unit: '人', duration: 3, durationUnit: '天' }
    ],
    remark: '设计变更导致停工，情况属实'
  }
]

export const mockApprovedClaims: ClaimRecord[] = [
  {
    id: 'c1001',
    code: 'TW-2025-000',
    title: '室外工程设计变更停工',
    contractor: '中建三局第一建设有限公司',
    submitDate: '2025-06-08 14:20',
    stopDate: '2025-06-05 至 2025-06-07',
    stopLocation: '南区室外工程',
    reason: '景观设计变更导致停工',
    reasonCategory: '图纸变更',
    resources: [
      { type: '机械', name: '塔式起重机', count: 2, unit: '台' },
      { type: '人员', name: '钢筋班', count: 18, unit: '人' }
    ],
    attachments: [],
    attachmentSummary: '设计变更通知1份',
    status: 'partial',
    currentHandler: '张监理',
    submitter: '李工长'
  },
  {
    id: 'c1002',
    code: 'TW-2025-098',
    title: '土方开挖场地移交延误',
    contractor: '中建三局第一建设有限公司',
    submitDate: '2025-06-06 10:00',
    stopDate: '2025-06-03 至 2025-06-04',
    stopLocation: '北区地下室',
    reason: '场地移交延误2天',
    reasonCategory: '场地移交延误',
    resources: [
      { type: '机械', name: '挖掘机', count: 2, unit: '台' },
      { type: '人员', name: '土方班', count: 15, unit: '人' }
    ],
    attachments: [],
    attachmentSummary: '移交协议1份',
    status: 'approved',
    currentHandler: '李总监',
    submitter: '王工'
  },
  {
    id: 'c1003',
    code: 'TW-2025-095',
    title: '精装修材料进场延误',
    contractor: '金螳螂装饰股份有限公司',
    submitDate: '2025-06-03 15:30',
    stopDate: '2025-06-01',
    stopLocation: '1#楼精装修',
    reason: '石材进场延误',
    reasonCategory: '甲供材延误',
    resources: [
      { type: '人员', name: '装修工', count: 20, unit: '人' }
    ],
    attachments: [],
    attachmentSummary: '进场计划1份',
    status: 'rejected',
    currentHandler: '张监理',
    submitter: '赵经理'
  },
  {
    id: 'c1004',
    code: 'TW-2025-092',
    title: '消防工程图纸会审延误',
    contractor: '广东省工业设备安装公司',
    submitDate: '2025-05-30 11:00',
    stopDate: '2025-05-28 至 2025-05-29',
    stopLocation: '地下室消防工程',
    reason: '消防图纸会审延迟',
    reasonCategory: '设计答疑迟滞',
    resources: [
      { type: '人员', name: '消防安装工', count: 12, unit: '人' }
    ],
    attachments: [],
    attachmentSummary: '会审纪要1份',
    status: 'partial',
    currentHandler: '王工',
    submitter: '陈工'
  },
  {
    id: 'c1005',
    code: 'TW-2025-088',
    title: '地下室结构设计变更',
    contractor: '中建三局第一建设有限公司',
    submitDate: '2025-05-28 09:00',
    stopDate: '2025-05-25 至 2025-05-27',
    stopLocation: '地下室结构工程',
    reason: '结构设计重大变更',
    reasonCategory: '图纸变更',
    resources: [
      { type: '机械', name: '塔式起重机', count: 2, unit: '台' },
      { type: '人员', name: '各班组', count: 50, unit: '人' }
    ],
    attachments: [],
    attachmentSummary: '设计变更文件1份',
    status: 'approved',
    currentHandler: '李总监',
    submitter: '李工长'
  }
]

export const mockUserInfo: UserInfo = {
  id: 'u001',
  name: '张工',
  role: 'supervisor',
  roleName: '监理工程师',
  company: '广东省建设工程监理有限公司',
  phone: '138****8888',
  stats: {
    pending: 5,
    reviewing: 1,
    approved: 42,
    total: 56
  }
}

export const mockAllClaims = [
  ...mockPendingClaims,
  ...mockReviewingClaims,
  ...mockApprovedClaims
]

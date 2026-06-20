import type { ClaimRecord, AuditRecord, UserInfo, FlowRecord, ReviewRecord } from '@/types/claim'

const projectNames = [
  '滨海新区中央商务区T7地块项目',
  '南山科技园创新中心项目',
  '前海金融中心二期项目'
]

const contractors = [
  '中建三局第一建设有限公司',
  '深圳金粤幕墙装饰工程有限公司',
  '金螳螂装饰股份有限公司',
  '广东省工业设备安装公司'
]

const reasonCategories = [
  '图纸变更',
  '场地移交延误',
  '设计答疑迟滞',
  '甲供材延误',
  '不可抗力',
  '其他'
]

const generateSubmitFlow = (claimId: string): FlowRecord => ({
  id: `flow_${claimId}_submit`,
  claimId,
  action: 'submit',
  party: 'contractor',
  partyName: '李工长',
  status: 'read',
  time: '2025-06-18 09:30',
  remark: '施工单位已提交索赔申请'
})

const generateSyncFlow = (claimId: string): FlowRecord => ({
  id: `flow_${claimId}_sync`,
  claimId,
  action: 'sync',
  party: 'supervisor',
  partyName: '张监理',
  status: 'synced',
  time: '2025-06-18 10:00',
  remark: '已同步至业主方'
})

const generateAuditFlow = (claimId: string, auditRecordId: string, result: string): FlowRecord => ({
  id: `flow_${claimId}_audit`,
  claimId,
  auditRecordId,
  action: 'audit',
  party: 'supervisor',
  partyName: '张监理',
  status: 'synced',
  time: '2025-06-18 15:00',
  remark: `监理审核：${result === 'true' ? '属实' : result === 'partial' ? '部分属实' : '不属实'}`
})

const generateOwnerReadFlow = (claimId: string): FlowRecord => ({
  id: `flow_${claimId}_owner_read`,
  claimId,
  action: 'read',
  party: 'owner',
  partyName: '王工',
  status: 'read',
  time: '2025-06-18 16:20',
  remark: '业主方已查看'
})

const generateContractorReadFlow = (claimId: string): FlowRecord => ({
  id: `flow_${claimId}_contractor_read`,
  claimId,
  action: 'read',
  party: 'contractor',
  partyName: '李工长',
  status: 'read',
  time: '2025-06-18 17:00',
  remark: '施工单位已查看'
})

const generateReviewFlow = (claimId: string, reviewRecordId: string, result: string): FlowRecord => ({
  id: `flow_${claimId}_review`,
  claimId,
  reviewRecordId,
  action: 'review',
  party: 'owner',
  partyName: '王工',
  status: 'synced',
  time: '2025-06-19 10:30',
  remark: `业主复核：${result === 'agree' ? '同意' : result === 'return' ? '退回补充' : '发起争议'}`
})

const generateFlowRecords = (claimId: string, status: string, auditRecordId?: string, reviewRecordId?: string): FlowRecord[] => {
  const records: FlowRecord[] = [generateSubmitFlow(claimId)]

  if (status === 'pending') return records

  records.push(generateSyncFlow(claimId))

  if (status === 'reviewing') return records

  if (auditRecordId) {
    const result = status === 'approved' ? 'true' : status === 'partial' ? 'partial' : 'true'
    records.push(generateAuditFlow(claimId, auditRecordId, result))
  }

  if (status === 'approved' || status === 'partial' || status === 'rejected') {
    records.push(generateOwnerReadFlow(claimId))
    records.push(generateContractorReadFlow(claimId))
    return records
  }

  if (status === 'reviewing_owner') {
    records.push(generateOwnerReadFlow(claimId))
    return records
  }

  if (status === 'archived' || status === 'returned' || status === 'disputed') {
    records.push(generateOwnerReadFlow(claimId))
    records.push(generateContractorReadFlow(claimId))
    if (reviewRecordId) {
      const result = status === 'archived' ? 'agree' : status === 'returned' ? 'return' : 'dispute'
      records.push(generateReviewFlow(claimId, reviewRecordId, result))
    }
    return records
  }

  return records
}

const baseResources = [
  [
    { type: '机械', name: '塔式起重机', count: 2, unit: '台' },
    { type: '人员', name: '钢筋班', count: 18, unit: '人' },
    { type: '人员', name: '模板班', count: 12, unit: '人' },
    { type: '人员', name: '混凝土班', count: 8, unit: '人' }
  ],
  [
    { type: '机械', name: '挖掘机', count: 1, unit: '台' },
    { type: '机械', name: '自卸汽车', count: 3, unit: '辆' },
    { type: '人员', name: '土方班', count: 15, unit: '人' }
  ],
  [
    { type: '机械', name: '高空作业吊篮', count: 4, unit: '台' },
    { type: '人员', name: '幕墙安装工', count: 20, unit: '人' },
    { type: '人员', name: '测量放线工', count: 3, unit: '人' }
  ]
]

export const mockPendingClaims: ClaimRecord[] = [
  {
    id: '1',
    code: 'TW-2025-001',
    title: '1#楼主体结构停工索赔',
    projectName: projectNames[0],
    contractor: contractors[0],
    submitDate: '2025-06-18 09:30',
    stopDate: '2025-06-15 至 2025-06-17',
    stopLocation: '1#楼 3-5层',
    reason: '设计变更导致停工，等待新图纸下发',
    reasonCategory: reasonCategories[0],
    resources: baseResources[0],
    attachments: [
      { id: 'a1', name: '停工现场照片1.jpg', type: 'image', category: 'photo', categoryName: '现场照片' },
      { id: 'a2', name: '停工现场照片2.jpg', type: 'image', category: 'photo', categoryName: '现场照片' },
      { id: 'a3', name: '设计变更通知.pdf', type: 'pdf', category: 'notice', categoryName: '设计变更通知' },
      { id: 'a4', name: '人员考勤表6月15-17日.xlsx', type: 'doc', category: 'attendance', categoryName: '考勤表' }
    ],
    attachmentSummary: '现场照片2张、设计变更通知1份、人员考勤表1份',
    status: 'pending',
    currentHandler: '张监理',
    submitter: '李工长',
    submitterPhone: '138****8888',
    syncStatus: { contractor: 'read', owner: 'unsynced' },
    flowRecords: generateFlowRecords('1', 'pending')
  },
  {
    id: '2',
    code: 'TW-2025-002',
    title: '地下室施工场地移交延误',
    projectName: projectNames[0],
    contractor: contractors[0],
    submitDate: '2025-06-17 14:20',
    stopDate: '2025-06-12 至 2025-06-14',
    stopLocation: '地下室B区',
    reason: '场地未按时移交，导致无法进场施工',
    reasonCategory: reasonCategories[1],
    resources: baseResources[1],
    attachments: [
      { id: 'b1', name: '场地现状照片.jpg', type: 'image', category: 'photo', categoryName: '现场照片' },
      { id: 'b2', name: '场地移交协议.pdf', type: 'pdf', category: 'agreement', categoryName: '移交协议' }
    ],
    attachmentSummary: '现场照片1张、场地移交协议1份',
    status: 'pending',
    currentHandler: '张监理',
    submitter: '王工',
    submitterPhone: '139****6666',
    syncStatus: { contractor: 'read', owner: 'synced' },
    flowRecords: generateFlowRecords('2', 'reviewing')
  },
  {
    id: '3',
    code: 'TW-2025-003',
    title: '幕墙施工图纸答疑迟滞',
    projectName: projectNames[1],
    contractor: contractors[1],
    submitDate: '2025-06-16 11:00',
    stopDate: '2025-06-10 至 2025-06-13',
    stopLocation: '2#楼南立面',
    reason: '幕墙节点图纸疑问未及时答复，导致加工图无法深化',
    reasonCategory: reasonCategories[2],
    resources: baseResources[2],
    attachments: [
      { id: 'c1', name: '图纸疑问函.jpg', type: 'image', category: 'notice', categoryName: '图纸疑问函' },
      { id: 'c2', name: '现场人员照片.jpg', type: 'image', category: 'photo', categoryName: '现场照片' },
      { id: 'c3', name: '吊篮租赁合同.pdf', type: 'pdf', category: 'contract', categoryName: '设备租赁合同' }
    ],
    attachmentSummary: '疑问函1份、现场照片1张、设备租赁协议1份',
    status: 'pending',
    currentHandler: '李总监',
    submitter: '赵经理',
    submitterPhone: '137****5555',
    syncStatus: { contractor: 'read', owner: 'unsynced' },
    flowRecords: generateFlowRecords('3', 'pending')
  },
  {
    id: '4',
    code: 'TW-2025-004',
    title: '甲供材料进场延误',
    projectName: projectNames[1],
    contractor: contractors[0],
    submitDate: '2025-06-15 16:45',
    stopDate: '2025-06-13 至 2025-06-14',
    stopLocation: '1#楼机电安装',
    reason: '甲方指定的电缆未按计划进场，导致机电安装停工',
    reasonCategory: reasonCategories[3],
    resources: [
      { type: '人员', name: '电工班', count: 12, unit: '人' },
      { type: '人员', name: '管工班', count: 8, unit: '人' }
    ],
    attachments: [
      { id: 'd1', name: '材料进场计划.jpg', type: 'image', category: 'plan', categoryName: '材料进场计划' },
      { id: 'd2', name: '停工通知.pdf', type: 'pdf', category: 'notice', categoryName: '停工通知' }
    ],
    attachmentSummary: '进场计划1份、停工通知1份',
    status: 'pending',
    currentHandler: '张监理',
    submitter: '陈工',
    submitterPhone: '136****4444',
    syncStatus: { contractor: 'read', owner: 'synced' },
    flowRecords: generateFlowRecords('4', 'reviewing')
  },
  {
    id: '5',
    code: 'TW-2025-005',
    title: '雨季施工受阻',
    projectName: projectNames[2],
    contractor: contractors[0],
    submitDate: '2025-06-14 10:30',
    stopDate: '2025-06-08 至 2025-06-09',
    stopLocation: '室外管网工程',
    reason: '连续暴雨导致室外管网施工无法进行',
    reasonCategory: reasonCategories[4],
    resources: [
      { type: '机械', name: '挖掘机', count: 2, unit: '台' },
      { type: '人员', name: '管道安装工', count: 10, unit: '人' }
    ],
    attachments: [
      { id: 'e1', name: '天气预报截图.jpg', type: 'image', category: 'other', categoryName: '气象证明' },
      { id: 'e2', name: '现场积水照片1.jpg', type: 'image', category: 'photo', categoryName: '现场照片' },
      { id: 'e3', name: '现场积水照片2.jpg', type: 'image', category: 'photo', categoryName: '现场照片' }
    ],
    attachmentSummary: '天气预报1份、现场照片2张',
    status: 'pending',
    currentHandler: '李总监',
    submitter: '刘工',
    submitterPhone: '135****3333',
    syncStatus: { contractor: 'read', owner: 'unsynced' },
    flowRecords: generateFlowRecords('5', 'pending')
  }
]

export const mockReviewingClaims: ClaimRecord[] = [
  {
    id: '6',
    code: 'TW-2025-006',
    title: '电梯井道尺寸偏差整改',
    projectName: projectNames[2],
    contractor: contractors[0],
    submitDate: '2025-06-13 09:00',
    stopDate: '2025-06-11',
    stopLocation: '1#楼电梯井道',
    reason: '电梯井道尺寸与电梯图纸不符，需整改后安装',
    reasonCategory: reasonCategories[0],
    resources: [
      { type: '人员', name: '瓦工', count: 6, unit: '人' },
      { type: '机械', name: '升降机', count: 1, unit: '台' }
    ],
    attachments: [
      { id: 'f1', name: '井道测量记录.jpg', type: 'image', category: 'other', categoryName: '测量记录' }
    ],
    attachmentSummary: '测量记录1份',
    status: 'reviewing',
    currentHandler: '张监理',
    submitter: '周工',
    submitterPhone: '134****2222',
    syncStatus: { contractor: 'read', owner: 'synced' },
    flowRecords: generateFlowRecords('6', 'reviewing')
  }
]

export const mockApprovedClaims: ClaimRecord[] = [
  {
    id: 'c1001',
    code: 'TW-2025-000',
    title: '室外工程设计变更停工',
    projectName: projectNames[0],
    contractor: contractors[0],
    submitDate: '2025-06-08 14:20',
    stopDate: '2025-06-05 至 2025-06-07',
    stopLocation: '南区室外工程',
    reason: '景观设计变更导致停工',
    reasonCategory: reasonCategories[0],
    resources: baseResources[0].slice(0, 2),
    attachments: [
      { id: 'g1', name: '设计变更通知.pdf', type: 'pdf', category: 'notice', categoryName: '设计变更通知' }
    ],
    attachmentSummary: '设计变更通知1份',
    status: 'partial',
    currentHandler: '张监理',
    submitter: '李工长',
    syncStatus: { contractor: 'read', owner: 'read' },
    flowRecords: generateFlowRecords('c1001', 'partial', 'ar1')
  },
  {
    id: 'c1002',
    code: 'TW-2025-098',
    title: '土方开挖场地移交延误',
    projectName: projectNames[0],
    contractor: contractors[0],
    submitDate: '2025-06-06 10:00',
    stopDate: '2025-06-03 至 2025-06-04',
    stopLocation: '北区地下室',
    reason: '场地移交延误2天',
    reasonCategory: reasonCategories[1],
    resources: baseResources[1],
    attachments: [
      { id: 'h1', name: '移交协议.pdf', type: 'pdf', category: 'agreement', categoryName: '移交协议' }
    ],
    attachmentSummary: '移交协议1份',
    status: 'approved',
    currentHandler: '李总监',
    submitter: '王工',
    syncStatus: { contractor: 'read', owner: 'read' },
    flowRecords: generateFlowRecords('c1002', 'approved', 'ar2')
  },
  {
    id: 'c1003',
    code: 'TW-2025-095',
    title: '精装修材料进场延误',
    projectName: projectNames[1],
    contractor: contractors[2],
    submitDate: '2025-06-03 15:30',
    stopDate: '2025-06-01',
    stopLocation: '1#楼精装修',
    reason: '石材进场延误',
    reasonCategory: reasonCategories[3],
    resources: [
      { type: '人员', name: '装修工', count: 20, unit: '人' }
    ],
    attachments: [
      { id: 'i1', name: '材料进场计划.xlsx', type: 'doc', category: 'plan', categoryName: '材料进场计划' }
    ],
    attachmentSummary: '进场计划1份',
    status: 'rejected',
    currentHandler: '张监理',
    submitter: '赵经理',
    syncStatus: { contractor: 'read', owner: 'read' },
    flowRecords: generateFlowRecords('c1003', 'rejected', 'ar3')
  },
  {
    id: 'c1004',
    code: 'TW-2025-092',
    title: '消防工程图纸会审延误',
    projectName: projectNames[1],
    contractor: contractors[3],
    submitDate: '2025-05-30 11:00',
    stopDate: '2025-05-28 至 2025-05-29',
    stopLocation: '地下室消防工程',
    reason: '消防图纸会审延迟',
    reasonCategory: reasonCategories[2],
    resources: [
      { type: '人员', name: '消防安装工', count: 12, unit: '人' }
    ],
    attachments: [
      { id: 'j1', name: '会审纪要.pdf', type: 'pdf', category: 'notice', categoryName: '图纸会审纪要' }
    ],
    attachmentSummary: '会审纪要1份',
    status: 'reviewing_owner',
    currentHandler: '王工',
    submitter: '陈工',
    syncStatus: { contractor: 'read', owner: 'read' },
    flowRecords: generateFlowRecords('c1004', 'reviewing_owner', 'ar4')
  },
  {
    id: 'c1005',
    code: 'TW-2025-088',
    title: '地下室结构设计变更',
    projectName: projectNames[2],
    contractor: contractors[0],
    submitDate: '2025-05-28 09:00',
    stopDate: '2025-05-25 至 2025-05-27',
    stopLocation: '地下室结构工程',
    reason: '结构设计重大变更',
    reasonCategory: reasonCategories[0],
    resources: [
      { type: '机械', name: '塔式起重机', count: 2, unit: '台' },
      { type: '人员', name: '各班组', count: 50, unit: '人' }
    ],
    attachments: [
      { id: 'k1', name: '设计变更文件.pdf', type: 'pdf', category: 'notice', categoryName: '设计变更通知' }
    ],
    attachmentSummary: '设计变更文件1份',
    status: 'archived',
    currentHandler: '李总监',
    submitter: '李工长',
    syncStatus: { contractor: 'read', owner: 'read' },
    flowRecords: generateFlowRecords('c1005', 'archived', 'ar5', 'rr1')
  },
  {
    id: 'c1006',
    code: 'TW-2025-085',
    title: '外立面幕墙甲供材延误',
    projectName: projectNames[2],
    contractor: contractors[1],
    submitDate: '2025-05-25 14:00',
    stopDate: '2025-05-22 至 2025-05-24',
    stopLocation: '2#楼外立面',
    reason: '甲方供应的铝型材未按期进场',
    reasonCategory: reasonCategories[3],
    resources: baseResources[2],
    attachments: [
      { id: 'l1', name: '材料供货合同.pdf', type: 'pdf', category: 'contract', categoryName: '材料供货合同' }
    ],
    attachmentSummary: '供货合同1份',
    status: 'returned',
    currentHandler: '赵经理',
    submitter: '赵经理',
    syncStatus: { contractor: 'read', owner: 'read' },
    flowRecords: generateFlowRecords('c1006', 'returned', 'ar6', 'rr2')
  },
  {
    id: 'c1007',
    code: 'TW-2025-082',
    title: '不可抗力暴雨停工',
    projectName: projectNames[0],
    contractor: contractors[0],
    submitDate: '2025-05-22 10:00',
    stopDate: '2025-05-20 至 2025-05-21',
    stopLocation: '全部室外作业',
    reason: '特大暴雨导致全部室外工程停工',
    reasonCategory: reasonCategories[4],
    resources: [
      { type: '人员', name: '所有室外班组', count: 80, unit: '人' }
    ],
    attachments: [
      { id: 'm1', name: '气象局暴雨预警.jpg', type: 'image', category: 'other', categoryName: '气象证明' }
    ],
    attachmentSummary: '气象证明1份',
    status: 'disputed',
    currentHandler: '张监理',
    submitter: '刘工',
    syncStatus: { contractor: 'read', owner: 'read' },
    flowRecords: generateFlowRecords('c1007', 'disputed', 'ar7', 'rr3')
  }
]

export const mockAuditRecords: AuditRecord[] = [
  {
    id: 'ar1',
    claimId: 'c1001',
    claimCode: 'TW-2025-000',
    projectName: projectNames[0],
    auditor: '张监理',
    auditorRole: '监理工程师',
    auditTime: '2025-06-10 14:30',
    result: 'partial',
    approvedScope: '认可1台塔吊停置3天，钢筋班12人窝工2天',
    approvedResources: [
      { type: '机械', name: '塔式起重机', count: 1, unit: '台', duration: 3, durationUnit: '天' },
      { type: '人员', name: '钢筋班', count: 12, unit: '人', duration: 2, durationUnit: '天' }
    ],
    remark: '经现场核实，部分属实，具体数量以现场确认为准',
    readStatus: { contractor: true, owner: true },
    reviewStatus: 'pending'
  },
  {
    id: 'ar2',
    claimId: 'c1002',
    claimCode: 'TW-2025-098',
    projectName: projectNames[0],
    auditor: '李总监',
    auditorRole: '总监理工程师',
    auditTime: '2025-06-08 10:15',
    result: 'true',
    approvedScope: '全部属实，认可索赔事实',
    approvedResources: [
      { type: '机械', name: '挖掘机', count: 2, unit: '台', duration: 2, durationUnit: '天' },
      { type: '人员', name: '土方班', count: 15, unit: '人', duration: 2, durationUnit: '天' }
    ],
    remark: '情况属实，同意按实计算',
    readStatus: { contractor: true, owner: true },
    reviewStatus: 'pending'
  },
  {
    id: 'ar3',
    claimId: 'c1003',
    claimCode: 'TW-2025-095',
    projectName: projectNames[1],
    auditor: '张监理',
    auditorRole: '监理工程师',
    auditTime: '2025-06-05 16:00',
    result: 'false',
    approvedScope: '不属实，不予认可',
    approvedResources: [],
    remark: '经核实，施工方所述停工原因不成立，为自身施工组织不当造成',
    readStatus: { contractor: true, owner: true },
    reviewStatus: 'pending'
  },
  {
    id: 'ar4',
    claimId: 'c1004',
    claimCode: 'TW-2025-092',
    projectName: projectNames[1],
    auditor: '王工',
    auditorRole: '业主现场代表',
    auditTime: '2025-06-03 11:30',
    result: 'partial',
    approvedScope: '只认可5个工日的误工损失',
    approvedResources: [
      { type: '人员', name: '安装工', count: 5, unit: '人', duration: 1, durationUnit: '天' }
    ],
    remark: '部分认可，具体数量需进一步核实',
    readStatus: { contractor: true, owner: true },
    reviewStatus: 'pending'
  },
  {
    id: 'ar5',
    claimId: 'c1005',
    claimCode: 'TW-2025-088',
    projectName: projectNames[2],
    auditor: '李总监',
    auditorRole: '总监理工程师',
    auditTime: '2025-06-01 09:45',
    result: 'true',
    approvedScope: '事实清楚，全部认可',
    approvedResources: [
      { type: '机械', name: '塔式起重机', count: 2, unit: '台', duration: 3, durationUnit: '天' },
      { type: '人员', name: '各班组', count: 50, unit: '人', duration: 3, durationUnit: '天' }
    ],
    remark: '设计变更导致停工，情况属实',
    readStatus: { contractor: true, owner: true },
    reviewStatus: 'agree',
    reviewRecordId: 'rr1'
  },
  {
    id: 'ar6',
    claimId: 'c1006',
    claimCode: 'TW-2025-085',
    projectName: projectNames[2],
    auditor: '张监理',
    auditorRole: '监理工程师',
    auditTime: '2025-05-28 15:20',
    result: 'partial',
    approvedScope: '认可2台吊篮停滞2天',
    approvedResources: [
      { type: '机械', name: '高空作业吊篮', count: 2, unit: '台', duration: 2, durationUnit: '天' }
    ],
    remark: '需补充材料进场延误证明材料',
    readStatus: { contractor: true, owner: true },
    reviewStatus: 'return',
    reviewRecordId: 'rr2'
  },
  {
    id: 'ar7',
    claimId: 'c1007',
    claimCode: 'TW-2025-082',
    projectName: projectNames[0],
    auditor: '张监理',
    auditorRole: '监理工程师',
    auditTime: '2025-05-25 14:00',
    result: 'true',
    approvedScope: '暴雨停工，全部认可',
    approvedResources: [
      { type: '人员', name: '所有室外班组', count: 80, unit: '人', duration: 2, durationUnit: '天' }
    ],
    remark: '不可抗力因素造成',
    readStatus: { contractor: true, owner: true },
    reviewStatus: 'dispute',
    reviewRecordId: 'rr3'
  }
]

export const mockReviewRecords: ReviewRecord[] = [
  {
    id: 'rr1',
    auditRecordId: 'ar5',
    claimId: 'c1005',
    reviewer: '王工',
    reviewerRole: '业主现场代表',
    reviewTime: '2025-06-02 10:30',
    result: 'agree',
    remark: '同意监理审核意见，予以归档'
  },
  {
    id: 'rr2',
    auditRecordId: 'ar6',
    claimId: 'c1006',
    reviewer: '王工',
    reviewerRole: '业主现场代表',
    reviewTime: '2025-05-29 09:15',
    result: 'return',
    remark: '缺少甲供材供货计划和实际进场时间对比资料，请施工单位补充'
  },
  {
    id: 'rr3',
    auditRecordId: 'ar7',
    claimId: 'c1007',
    reviewer: '王工',
    reviewerRole: '业主现场代表',
    reviewTime: '2025-05-26 16:45',
    result: 'dispute',
    remark: '暴雨停工天数存在争议，需提交造价咨询单位审定'
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

export const filterOptions = {
  projectNames: [...new Set(mockAllClaims.map((c) => c.projectName))],
  contractors: [...new Set(mockAllClaims.map((c) => c.contractor))],
  reasonCategories: [...new Set(mockAllClaims.map((c) => c.reasonCategory))],
  results: [
    { value: 'all', label: '全部' },
    { value: 'true', label: '属实' },
    { value: 'partial', label: '部分属实' },
    { value: 'false', label: '不属实' }
  ],
  reviewResults: [
    { value: 'all', label: '全部' },
    { value: 'agree', label: '同意归档' },
    { value: 'return', label: '退回补充' },
    { value: 'dispute', label: '发起争议' }
  ]
}

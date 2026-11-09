# EZ Storyboard & AI Director v0.1（可选生产层）

**状态：实验性接口契约。** 借鉴 Story2Board 的结构化分镜、角色/产品/场景一致性锚点和运镜理由；**不**包含 Story2Board 商业产品的闭源代码、电影镜头数据库或受版权保护的影片画面。名称只是设计参考，不表示与该产品存在合作或兼容 API。

## 何时启用

- **EZ AI Video Production 项目**：多镜头视频在 `references/pipeline.md` 阶段 3 结束前必须产出机器可读的 `storyboard.json`，通过本层校验后才进入阶段 4。
- 普通 video-shotcraft 项目：只有涉及跨镜头人物、商品、道具或场景连续性，或用户要求 PDF 分镜表时，才启用此层。
- 模板、自由创作、共同创作的审批节点依然由原 SKILL.md 决定；这层不引入新的用户确认步骤。

## 最小执行合同

1. **输入**：已批准或记录的产品简报、设计 tokens、真实参考图、可用素材、声称与限制、已有镜头映射、可选 BGM 结构。
2. **锁定资产**：给角色/产品/道具/场景分配稳定 `anchor.id`；记录原始 `reference_asset`、必须保留的特征、可变项和证据来源。视觉生成器不允许悄悄改写硬特征。未提供参考时标为待核验，不能声称工程外观准确。
3. **导演决策**：每镜头保存叙事目标 `intent`、景别 `shot_size`、运镜 `camera_motion` 以及原因 `camera_reason`。镜头动作受产品逻辑而非炫技优先。
4. **结构化分镜**：将镜头序列转为 `storyboard.json`（示例见 `references/examples/ez-storyboard-vfd.json`），帧数为真相源；保留 `shot_card` 字段以连接现有镜头库及 demo。每镜只有一个主动作。
5. **放行**：执行 `node assets/scripts/validate-ez-storyboard.mjs <storyboard.json>`；错误必须修复。校验只检查结构、时间线与锚点引用，不代表图片真实性/镜头美学/版权已通过。
6. **生成与组装**：镜头素材按 `source_assets` 和 `anchor_ids` 从同一事实源解析，分别适配 Remotion、AI 图像/视频生成、外部 3D 场景；剪辑、声音与最终渲染仍走现有 pipeline/workbench。
7. **人工验收**：比较原始锚点与每镜关键帧；比对型号、logo、端子、接线、功率参数、机械运动及字幕声明。遇到未证实的工业参数、接线或安全声明则阻止对外发布。
8. **交付**：保留 storyboard JSON、引用素材及授权记录、设计 spec、关键帧 QA 报告；需要 PDF 时由后续导出适配器排版。**v0.1 暂未实现 PDF 导出或自动一致性图像评分。**

## JSON 字段（v0.1）

根字段：
- `schema_version` 固定为 `ez.storyboard.v0.1`
- `project`：`id,title,fps,width,height`
- `anchors[]`：`id,kind,label,reference_asset,must_keep[],allowed_variations[],evidence[]`
- `shots[]`：`id,start_frame,duration_frames,intent,shot_size,camera_motion,camera_reason,visual_description,anchor_ids[],source_assets[],shot_card,caption,sfx[],transition,review_required`

时间线从 `start_frame=0` 开始，必须连续且不重叠；每个 `anchor_ids` 必须存在于 `anchors`。与 Remotion 的镜头索引和 Workbench props 之间由后续 adapter 负责转换，**不要**直接把 JSON 塞入未验证的渲染入口。

## 权限、版权与来源

- 仅使用自有、已获许可或允许参考的素材；第三方电影镜头检索作为灵感参考，不复制画面，不以商业产品内部数据为训练/本地检索库。
- 不上传用户客户信息、项目报价、设备机密或未经脱敏的屏幕截图到外部生成服务。
- 工业设计的型号、比例、接口和接线以可靠产品资料与实测为准，生图的连续性分数不能代替工程审查。
- 变更 `anchor.must_keep` 必须产生新的版本和复审记录，不得在镜头级隐式覆盖。
- v0.1 不改变现有 BGM 卡点、素材脱敏、帧级 QA、人工发布确认等规则。

## 验收门槛（首轮建议）

- JSON 校验零错误；100% 镜头存在意图、运镜理由及合法锚点引用。
- 人工逐镜检查身份/外观一致性，记录通过率与返工次数，不虚报自动检测能力。
- 30 秒 / 6 镜头 VFD 宣传样片：生成镜头表，标记输入素材与真实证据，制作前冻结产品外观锚点。
- 下一步：PDF 导出、Workbench 的分镜导入适配、关键帧差异 QA 与版本化审核。

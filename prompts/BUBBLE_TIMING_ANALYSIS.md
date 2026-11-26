# AI 泡沫破裂时间：技术面与经济面双轨分析指南

> 用途：指导自动执行的分析 Agent 从**技术基本面**与**经济/市场面**两个方向，评估 AI 泡沫破裂的风险与可能时间窗口，输出可核查、可复算、带不确定性的结论。
>
> 重要前提：**没有人能可靠预测泡沫破裂的精确日期。** 本指南要求输出的是“风险状态 + 情景 + 时间窗口 + 触发条件”，不是伪精确的倒计时。任何具体天数都必须来自公开规则和可复算输入，并明确标注为模型估计或讽刺文案。

## 0. 先定义“泡沫破裂”

在开始分析前，先写下本次评估采用的**操作性定义**，并且当天不再更改。否则容易在看到数据后不断移动门槛，制造事后合理化的结论。

建议同时记录以下维度，而不是只看股价：

- **估值收缩**：主要 AI 相关公司从高点出现持续、显著的估值或市值回撤（写明指数、幅度、持续时间）。
- **融资收缩**：一级市场融资、IPO、债务融资明显放缓或取消；初创公司折价融资、裁员、倒闭增加。
- **资本开支转向**：云厂商/AI 巨头的资本开支指引下调，或明确推迟、取消数据中心项目。
- **信用与债务**：AI 相关债券利差扩大、评级展望恶化、债务再融资困难。
- **收入证伪**：AI 相关收入增速持续低于指引或市场预期，客户流失、合同取消、利用率下降。
- **供应链反馈**：芯片、服务器、电力、数据中心订单和交付出现砍单、库存上升、价格下跌。

“泡沫破裂”应被定义为**多个维度同时或依次恶化**，而不是单日股价下跌。单次财报不及预期、单日大跌、某位名人唱衰，都不足以单独构成破裂。

## 1. 通用研究纪律

1. **先定基准日。** 所有价格、财报、新闻必须注明数据截止时间（精确到日期，必要时到收盘时区）。不得把不同日期的数据混在一起比较。
2. **区分事实、市场预期与推演。** 股价是市场预期，不是基本面事实；财报是已发生数据，但可能有口径差异；推演必须标为推演。
3. **一手优先。** 财报、电话会记录、公司公告、监管文件（如 SEC 10-K/10-Q/8-K）、央行与统计机构数据优先于媒体转述。
4. **多源交叉。** 关键数字至少两个独立来源，或一个一手来源加一个可靠二手来源。转载同一篇通稿不算多源。
5. **不把相关性当因果。** 股价下跌与某条新闻同时发生，不等于该新闻导致下跌；需找市场评论、资金流、期权、公告等佐证。
6. **主动寻找反证。** 每个结论都要写“什么证据会推翻它”。只看支持崩溃的材料，会得到必然崩溃的结论。
7. **不提供投资建议。** 输出是研究与评论，不构成买卖建议、目标价或择时信号。

## 2. 技术面分析（AI 技术基本面，不是股票 K 线）

这里的“技术面”指**技术能力、成本、采用与供给约束**，用于判断当前 AI 叙事是否有真实生产力支撑。技术面不直接给出日期，但决定经济面预期的“地基”是否牢固。

### 2.1 能力进展是否在放缓

- 新一代模型在**独立、可复现**的基准上是否仍有显著提升，还是只在厂商自选测试上刷新分数。
- 推理、长上下文、多模态、Agent、代码等关键能力是否出现明显平台期；进步是否越来越依赖更多算力与数据。
- 是否存在“基准饱和”：分数接近上限、测试集污染、评测方法不透明，导致无法判断真实进步。
- 学术复现、第三方评测、真实生产环境案例是否支持厂商宣传。

**看空信号**：多个独立评测显示能力提升放缓；厂商 increasingly 只公布自选指标；实际部署效果与演示差距大。
**看多/反证信号**：独立复现持续确认进步；新能力带来可测量的生产率提升；成本下降打开新应用。

### 2.2 单位经济性

- 训练成本、推理成本、单位 token 成本、每次任务成本是否下降，下降速度是否足以支撑当前定价与毛利。
- 推理需求增长是否带来利润，还是“越用越亏”；免费用户、低价套餐、补贴战对毛利的影响。
- 模型折旧周期、GPU 利用率、数据中心利用率、电力成本、冷却与网络成本。
- 客户是否愿意为 AI 功能持续付费，续费率、客单价、使用深度如何。

**看空信号**：收入增长依赖补贴；推理毛利低或为负；算力闲置；客户试用后不续费。
**反证信号**：单位成本快速下降；付费转化与续费率稳定；AI 功能带来可验证的客户增收。

### 2.3 采用深度与生产率证据

- 企业采用是“试点/演示”还是“生产系统关键路径”；部署规模、活跃用户、任务替代率。
- 是否有独立研究或企业披露显示生产率提升、错误率下降、人力需求变化。
- 开发者生态、API 调用量、开源模型采用、边缘/端侧部署是否形成真实需求。
- 教育、医疗、法律、软件等行业的落地案例是否可审计。

**看空信号**：大量 PoC 无法上线；采用集中在少数场景；生产率提升无法复现。
**反证信号**：生产环境规模化；第三方审计的生产率数据；付费客户扩张。

### 2.4 供给链与物理约束

- 先进制程、HBM、封装、服务器、网络、电力、土地、并网许可等瓶颈是否缓解或恶化。
- 数据中心建设周期、延期、取消、社区反对、环境与水资源约束。
- 芯片库存、交付周期、二手价格、租赁价格变化。
- 能源价格与电网投资是否成为长期约束。

**看空信号**：订单砍单、库存上升、租赁价格下跌、项目延期/取消。
**反证信号**：供给瓶颈缓解、成本下降、利用率维持高位。

### 2.5 技术面评分

对每个维度按 0–5 分打分（0=明显恶化，3=中性，5=明显强劲），并写明依据与来源：

| 维度 | 分数 | 关键证据 | 数据日期 | 反证 |
|---|---|---|---|---|
| 能力进展 | | | | |
| 单位经济性 | | | | |
| 采用深度 | | | | |
| 供给链与物理约束 | | | | |
| 竞争格局与技术护城河 | | | | |

技术面总分只用于横向比较和跟踪变化，**不能直接换算成破裂日期**。

## 3. 经济面分析（市场、财报与宏观）

经济面更接近“市场何时失去耐心”，但价格噪音大、反转快，必须结合基本面与信用条件判断。

### 3.1 股价与估值

- 主要 AI 相关公司的股价、市值、远期市盈率、市销率、EV/EBITDA，与自身历史区间及非 AI 同业比较。
- 回撤幅度、波动率、成交量、期权偏斜、做空比例、资金流。
- 是“整个板块同步下跌”还是个别公司问题；是估值压缩还是盈利下修。
- 注意：股价上涨不代表基本面健康，下跌也不等于泡沫破裂；需看盈利预期与折现率变化。

### 3.2 财报与指引

- 营收、利润、自由现金流、资本开支、折旧、运营费用、AI 相关收入占比。
- 管理层指引：上调/下调、措辞变化、是否回避关键问题。
- 电话会中关于需求、产能、定价、客户集中度、回报周期的表述。
- 会计口径：资本化软件、折旧年限、一次性收益、股权激励、表外负债。
- 与市场一致预期的差距，以及财报后分析师修正方向。

**看空信号**：资本开支继续上升但收入/利润不及预期；自由现金流转负；指引下调；管理层无法量化 AI 回报。
**反证信号**：AI 收入加速、毛利改善、资本开支回报可量化、指引上调。

### 3.3 融资、信用与私募市场

- AI 相关公司债券利差、评级、CDS、债务到期结构、再融资成本。
- 数据中心/算力项目的项目融资、租赁义务、表外 SPV、供应商融资。
- 一级市场融资额、估值、折价融资、IPO 撤回、并购减少。
- 初创公司裁员、倒闭、被低价收购；独角兽估值下调。
- 循环交易与关联交易：供应商投资客户、客户承诺采购、互相背书等，是否放大收入质量风险。

**看空信号**：信用利差走阔、融资窗口关闭、折价融资增多、循环交易被质疑。
**反证信号**：融资顺畅、债务成本稳定、客户与收入结构多元化。

### 3.4 宏观与政策

- 利率、通胀、经济增长、失业率、企业 IT 支出、广告市场。
- 电力价格、数据中心监管、补贴、出口管制、反垄断、数据与版权诉讼。
- 选举、财政政策、地缘政治对供应链与资本流动的影响。
- 宏观衰退会放大泡沫破裂，但不能把一切下跌都归因于 AI。

### 3.5 市场情绪与叙事

- 媒体、卖方研究、社交平台是否一边倒乐观；散户参与度、IPO 热度、杠杆水平。
- “这次不一样”的叙事强度；对风险提示的容忍度。
- 名人、机构、监管者的公开警告（需核实原话与上下文）。
- 注意：情绪是反向指标之一，但 timing 极不可靠；狂热可以持续很久。

### 3.6 经济面评分

| 维度 | 分数 | 关键证据 | 数据日期 | 反证 |
|---|---|---|---|---|
| 估值与股价 | | | | |
| 财报与指引 | | | | |
| 融资与信用 | | | | |
| 宏观与政策 | | | | |
| 市场情绪 | | | | |

## 4. 双轨整合：从评分到情景

### 4.1 不要求两轨同时恶化

技术面与经济面可能背离：

- **技术强、经济弱**：真实进步存在，但估值/融资超前，破裂可能由信用事件触发。
- **技术弱、经济强**：叙事与资金仍在，但基本面逐渐证伪，破裂可能由财报或采用数据触发。
- **双强**：泡沫风险较低或推迟，但需警惕估值过热。
- **双弱**：风险最高，需重点跟踪触发条件。

### 4.2 输出三种情景，而不是一个日期

| 情景 | 时间窗口 | 触发条件 | 支持证据 | 反证/推翻条件 | 主观概率 |
|---|---|---|---|---|---|
| 基准：降温/慢撒气 | | | | | |
| 看空：快速破裂 | | | | | |
| 看多：延续/再加速 | | | | | |

时间窗口用“未来 3 个月 / 3–6 个月 / 6–12 个月 / 12 个月以上”这类区间，不用精确到日。概率是主观判断，必须说明依据，且三档之和为 100%。

### 4.3 领先、同步与滞后指标

- **领先**：融资窗口、信用利差、资本开支指引、订单/库存、招聘、期权偏斜、供应商交付。
- **同步**：股价回撤、财报不及预期、收入增速、利用率、项目取消。
- **滞后**：裁员、倒闭、GDP/就业影响、监管收紧、媒体叙事反转。

不要用滞后指标预测破裂；它们更多用于确认已经发生的变化。

### 4.4 触发条件图

列出 3–5 个最可能把“风险”变成“破裂”的触发事件，例如：

- 某主要云厂商下调资本开支指引；
- 某大型 AI 公司融资失败或估值大幅下调；
- 关键客户取消大额合同；
- 信用利差突破某阈值；
- 财报显示 AI 收入增速连续两个季度低于预期；
- 监管/诉讼导致核心业务受限。

每个触发条件写明**可观测指标、阈值、数据来源、更新频率**。

## 5. 关于“破裂倒计时”

如果网站需要展示“泡沫破裂提前了 XX 天/时分秒”，必须把它和严肃分析分开：

1. **严肃分析**只输出情景、窗口、概率、触发条件，不输出精确的“崩盘日期”。
2. 本站若把倒计时做成“综合倒计时”，应定位为**编辑部压力测试模型**：公式公开、输入可复算、权重是编辑判断，不是统计概率、专家预测或市场共识。页面上的日期是观察点，不是断言泡沫会在那天破裂。
3. 若一定要有数字，必须基于**公开、固定、可复算**的规则，例如：以某个明确基准日为起点，按每日更新的风险评分做线性或分段映射；公式、输入、时区、更新频率全部公开，任何人可复算。
4. 没有基准、公式或可靠累积状态时，不生成精确数字；用“计时器又抖了一下”这类明显戏仿的短句。
5. 不暗示数字来自经济模型、专家预测、真实市场数据或客观测量。

## 6. 与当前页面代码的结合（下述前端形式为建议）

> **说明：本节的前端形式——包括 DOM 结构、CSS 变量、插入位置、示例代码和行号——都只是建议方案，不是硬性验收标准，也不要求逐字复刻。** Agent 应先阅读当前代码，可自由调整实现方式。必须保留的只是功能与内容要求：一个大的综合倒计时、技术面/经济面占比、数据可复算、移动端不裁切。行号是当前快照，仓库更新后以实际文件为准。

当前站点已有一个大的“压力测试倒计时”，建议把它改造成**技术面 + 经济面加权后的综合倒计时**，并在同一卡片中显示两轨的预测占比。**不要新造第二套大字计时器**：直接复用现有 `#clock` 的数字样式，保证字号、字距、移动端断点与当前完全一致。

建议的最小改动范围：新增根目录 `bubble.json`；改 `index.html:56-59` 和 `61-64`；在 `style.css:380` 之后追加占比条样式；改 `script.js:428-463`；把 `bubble.json` 加入 `pages.yml:27` 的复制列表。

### 6.1 现状代码地图

| 位置 | 现状 | 改动 |
|---|---|---|
| `index.html:54-66` | `.checkpoint` 卡片 | 保留结构，改标题与倒计时说明 |
| `index.html:56` | “AI bubble stress-test countdown” | 改为“综合倒计时” |
| `index.html:57` | `#clock` 四段大数字 | **保留原样**，作为综合倒计时主体 |
| `index.html:58` | `#passed` 到期提示 | 改为“综合观察点已到，复核两轨信号” |
| `index.html:59` | `#checkpoint` 硬编码 `2027-03-20T09:00:00+08:00` | 保留为 JS 失败时的回退值；成功加载后由 `bubble.json` 覆盖 |
| `index.html:60-65` | “Why this date?” 方法与来源 | 增加两轨权重、目标日期、计算方法和来源 |
| `script.js:428` | 直接读取 `#checkpoint` 的 `dateTime` | 改为 `let deadline = ...`，加载 `bubble.json` 后替换 |
| `script.js:430-453` | 每秒刷新 `#clock` | 保留；加载数据后重新调用 `tick()` |
| `script.js:454-463` | `applyLanguage()` | 增加综合日期与占比文案的双语刷新 |
| `style.css:38-40` | `#clock` 基础布局 | 不改字号；新占比条样式追加在 380 行附近 |
| `style.css:144-146` | 封面 `#clock` 覆盖 | 不改 |
| `style.css:275-278` | **当前最终大字字号** `clamp(1.85rem,4.35vw,4.58rem)` | **不要修改**，综合倒计时直接继承 |
| `style.css:313` | 760px 以下移动端字号 | 不改 |
| `style.css:459-461` | 370px 以下窄屏字号 | 不改 |
| `style.css:378-380` | 封面时钟配色 | 新占比条沿用同一组琥珀色 |
| `.github/workflows/pages.yml:27` | 只复制 `index.html style.css script.js atlas.js news.json` | 增加 `bubble.json`，否则线上 404 |

### 6.2 新增数据文件 `bubble.json`

放在仓库根目录，与 `news.json` 同级。分析 Agent 每次更新时写入；前端只读取、不猜日期。

```json
{
  "schemaVersion": 1,
  "asOf": "2026-11-26T15:00:00+08:00",
  "tracks": {
    "technical": {
      "weight": 58,
      "target": "2027-02-15T09:00:00+08:00",
      "summary": {
        "en": "Capability gains are real, but unit economics and adoption depth lag the narrative.",
        "zh": "能力进展真实存在，但单位经济性与采用深度落后于叙事。"
      }
    },
    "economic": {
      "weight": 42,
      "target": "2027-04-10T09:00:00+08:00",
      "summary": {
        "en": "Valuations and capex outrun cash returns; credit and funding are the weak link.",
        "zh": "估值与资本开支跑在现金回报之前，信用与融资是薄弱环节。"
      }
    }
  },
  "method": "Weighted mean of the two track target timestamps; weights are editorial, not probabilities.",
  "sources": [
    {
      "label": {"en": "Example source", "zh": "示例来源"},
      "url": "https://example.com/"
    }
  ]
}
```

约束：

- `weight` 为 0–100 的整数，两轨合计必须为 **100**；它是综合信号的**权重/预测占比**，不是“泡沫一定由该因素触发的概率”。注意：这里的 100% 与第 4 节三种情景的主观概率不是同一组数字，不能混用或互相推导。
- `target` 必须是带时区的 ISO 8601 时间；两轨目标可以不同。这里的 `target` 是**压力测试观察点**，不是“崩盘日期”。
- 综合目标由前端按 `(技术目标 × 技术权重 + 经济目标 × 经济权重) / 100` 计算，不要另写一个无法复算的日期。
- `sources` 至少 1 条 HTTPS 链接；没有来源时不得展示具体日期，应回退到现有观察点。
- `asOf` 用北京时间，页面显示时统一标注“北京时间”。
- `weight` 应依据两轨证据强度、直接性和不确定性分配，不能为了视觉效果随意写成 90/10；证据相当时用 50/50。`target` 建议取该轨基准情景时间窗口的中点，作为“观察点”，不要把看空情景的最极端日期直接当目标。
- 综合日期只是两个观察点的加权平均，用于排序和展示，**不是概率意义上的期望崩盘日**；这个限制要写进页面折叠说明。

### 6.3 `index.html` 的建议插入位置

1. 第 56 行标题改为：

```html
<h2 id="clock-title"><span class="en">AI bubble composite countdown</span><span class="zh" lang="zh-Hans">AI 泡沫综合倒计时</span></h2>
```

2. **第 57 行 `#clock` 完全保留**。不要复制一套新的 `strong`，否则字号会和当前不一致。

3. 在第 57 行之后、`#passed` 之前插入占比条：

```html
<div id="bubble-mix" class="bubble-mix" hidden>
  <div class="bubble-mix-labels">
    <span><span class="en">Technical</span><span class="zh" lang="zh-Hans">技术面</span> <b data-share="technical">—</b></span>
    <span><span class="en">Economic</span><span class="zh" lang="zh-Hans">经济面</span> <b data-share="economic">—</b></span>
  </div>
  <div class="bubble-mix-bar" aria-hidden="true"><i data-bar="technical"></i><i data-bar="economic"></i></div>
</div>
```

4. 第 58 行到期提示改为：

```html
<p id="passed" role="status" hidden><span class="en">Composite checkpoint reached. Re-check both tracks.</span><span class="zh" lang="zh-Hans">综合观察点已到。请复核技术面与经济面两轨信号。</span></p>
```

5. 第 59 行保留回退日期；JS 会用 `bubble.json` 覆盖 `datetime` 和可见文本。

6. 第 61–64 行的方法说明中增加：两轨权重、两个目标日期、加权公式、`asOf`，并说明“这是编辑部观察模型，不是崩盘预测”。

### 6.4 `style.css` 的建议插入位置

只在第 380 行附近追加新规则，**不要改第 277 行 `#clock strong` 的字号**。占比条使用与现有时钟一致的琥珀/浅色，不抢大数字的视觉层级。

```css
.sl .cover .bubble-mix{margin:0 0 14px;max-width:45rem}
.sl .cover .bubble-mix-labels{display:flex;justify-content:space-between;gap:14px;font:700 .72rem/1.4 var(--mono);letter-spacing:.04em;text-transform:uppercase;color:#f7d7c8}
.sl .cover .bubble-mix-labels b{font-size:1rem;color:#ffbe9e;font-variant-numeric:tabular-nums}
.sl .cover .bubble-mix-bar{display:flex;height:6px;margin-top:7px;background:#ffbb9c1f;border:1px solid #eab49348;overflow:hidden}
.sl .cover .bubble-mix-bar i{display:block;min-width:0;background:#ffbe9e}
.sl .cover .bubble-mix-bar i[data-bar="technical"]{flex:var(--technical-share,50) 1 0}
.sl .cover .bubble-mix-bar i[data-bar="economic"]{flex:var(--economic-share,50) 1 0;background:#c9b3f5}
@media(max-width:760px){
  .sl .cover .bubble-mix-labels{font-size:.64rem}
  .sl .cover .bubble-mix-labels b{font-size:.9rem}
}
```

若希望两段颜色更有区分度，可把 `economic` 改为 `#d7b6ff`；但必须保证在深色底上对比度足够，且两段都有文字标签，不能只靠颜色区分。

### 6.5 `script.js` 的建议改法

1. **第 428 行**：把 `const deadline` 改为可更新变量。

```js
let deadline = Date.parse(document.getElementById('checkpoint').dateTime);
```

2. **第 428 行之后**新增加载与计算函数（示意，需按现有代码风格放在 IIFE 内）：

```js
let bubble = null;
const bubbleBox = document.getElementById('bubble-mix');
const bubbleLabels = {
  technical: bubbleBox?.querySelector('[data-share="technical"]'),
  economic: bubbleBox?.querySelector('[data-share="economic"]')
};

function renderBubbleDate() {
  const time = document.getElementById('checkpoint');
  if (!bubble || !time) return;
  const when = new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-GB', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Shanghai'
  }).format(new Date(deadline));
  time.dateTime = new Date(deadline).toISOString();
  const en = time.querySelector('.en');
  const zh = time.querySelector('.zh');
  if (en) en.textContent = `${when} · Beijing time`;
  if (zh) zh.textContent = `${when} · 北京时间`;
}

function applyBubble(data) {
  const technical = data.tracks.technical;
  const economic = data.tracks.economic;
  if (!technical || !economic || !bubbleBox || !bubbleLabels.technical || !bubbleLabels.economic) return false;
  const total = technical.weight + economic.weight;
  if (!Number.isFinite(total) || total !== 100) return false;
  const technicalTarget = Date.parse(technical.target);
  const economicTarget = Date.parse(economic.target);
  if (!Number.isFinite(technicalTarget) || !Number.isFinite(economicTarget)) return false;
  bubble = data;
  deadline = Math.round((technicalTarget * technical.weight + economicTarget * economic.weight) / total);
  bubbleBox.style.setProperty('--technical-share', technical.weight);
  bubbleBox.style.setProperty('--economic-share', economic.weight);
  bubbleLabels.technical.textContent = `${technical.weight}%`;
  bubbleLabels.economic.textContent = `${economic.weight}%`;
  bubbleBox.hidden = false;
  document.getElementById('passed').hidden = deadline > Date.now();
  renderBubbleDate();
  return true;
}

async function loadBubble() {
  try {
    const response = await fetch('./bubble.json', {mode:'same-origin', cache:'no-cache'});
    if (!response.ok) return;
    const data = await response.json();
    if (data.schemaVersion !== 1 || !data.tracks) return;
    if (applyBubble(data)) tick();
  } catch { /* Keep the editorial checkpoint fallback. */ }
}
```

3. **第 453 行** `tick();` 后调用 `loadBubble();`。加载完成后 `tick()` 会用新 `deadline` 刷新大字。

4. **第 454–463 行** `applyLanguage()` 中增加 `renderBubbleDate();`。这样切换语言后，综合日期会重新格式化为“北京时间 / Beijing time”。

百分比本身无需翻译；`技术面/经济面` 由 HTML 里的 `.en/.zh` 负责切换。

5. **边界处理**：
   - `bubble.json` 缺失、字段不合法、权重和不为 100：隐藏 `#bubble-mix`，保留现有 `2027-03-20` 观察点，不报错。
   - 目标时间已过：沿用现有 `#passed` 逻辑，但不要除以零或显示负数。
   - 不要在 `Date.parse` 失败时把 `deadline` 设为 `NaN`，否则整个计时器会显示 `NaN`。

### 6.6 视觉规范

从上到下保持以下层级：

1. 小号元信息：“Next checkpoint / 综合观察”。
2. 标题：“AI 泡沫综合倒计时”。
3. **大号 `#clock`**：天、时、分、秒，字号完全继承现有 `clamp(1.85rem,4.35vw,4.58rem)`；移动端继承第 313/461 行断点，不新增字号。
4. **占比条**：一行“技术面 58% / 经济面 42%”，下方 6px 双色条；百分比是辅助信息，字号明显小于计时数字。
5. 综合目标日期（北京时间）。
6. 折叠面板：权重依据、两个目标时间、公式、来源。

不要给技术面、经济面各加一个同样大的倒计时；页面只有一个综合大倒计时，两轨只以占比和说明出现。这样既符合“大字体综合倒计时”，也不会让读者误以为两个日期都是确定预测。

### 6.7 部署与自动化接线

1. **`pages.yml:27`** 的复制列表加入 `bubble.json`：

```yaml
cp index.html style.css script.js atlas.js news.json bubble.json _site/
```

2. 如果 `bubble.json` 由每日分析 Agent 直接提交，不需要改发布工作流；只要确保提交到 `main` 后 Pages 重新构建。
3. 如果希望现有 `scalinglow-publish.yml` 同时提交 `news.json` 和 `bubble.json`，必须同步修改第 91–97 行，否则会失败：
   - 第 91 行 `git diff --quiet -- news.json` 改为同时检查两个文件；
   - 第 95 行 `git add -- news.json` 改为 `git add -- news.json bubble.json`；
   - 第 97 行只允许 `news.json` 的断言改为“只允许这两个文件”，例如用 `git diff --cached --name-only | grep -vxE 'news.json|bubble.json'`，有输出就失败。
4. 若暂时不想改工作流，可由分析 Agent 单独提交 `bubble.json`；前端仍能读取。

### 6.8 验收清单

- [ ] `#clock` 的字号与改动前一致：桌面最大 4.58rem，760px 以下 3.4rem 上限，370px 以下 2.65rem 上限。
- [ ] 页面只有一个大倒计时，技术面/经济面只以“58% / 42%”及占比条出现。
- [ ] 两个权重合计 100%，进度条宽度与百分比一致。
- [ ] 综合目标等于两轨目标按权重加权，刷新页面后结果不变。
- [ ] `bubble.json` 缺失或损坏时，回退到 `2027-03-20` 观察点且计时器正常。
- [ ] 中英文切换后，“技术面/经济面”、日期和“北京时间”文案都正确。
- [ ] 1440px、768px、375px 三种宽度下数字不换行、不裁切。
- [ ] `pages.yml` 已复制 `bubble.json`，线上请求不是 404。
- [ ] 折叠面板写明“编辑部观察模型，不是崩盘预测”，且列出来源与 `asOf`。

## 7. 禁止事项

- 不编造股价、财报数字、融资额、评级、日期或来源。
- 不把单日股价波动、单条推文、单个名人言论当作泡沫破裂的证据。
- 不把相关性写成因果；不把“某公司下跌”写成“AI 泡沫破裂”。
- 不把主观概率写成客观事实；不给出精确到日的预测日期。
- 不提供投资建议、目标价、买卖信号。
- 不使用未经核实的“内部消息”“据说”“业内人士”。
- 不为了迎合“崩溃叙事”而忽略反证；也不为了乐观而忽略信用与融资风险。
- 不将技术面评分直接换算成经济面时间；两者必须分别论证。

## 8. 发布前检查清单

- [ ] 已写明数据截止时间、时区与“泡沫破裂”的操作性定义。
- [ ] 技术面四个维度均有至少一个可靠来源，并记录反证。
- [ ] 经济面五个维度均有数据或明确说明“未获取”。
- [ ] 股价、财报、融资、信用数据可追溯，未混用不同日期口径。
- [ ] 区分了事实、市场预期、推演与讽刺文案。
- [ ] 输出的是情景与时间窗口，不是精确预测日期。
- [ ] 每个情景都有触发条件、支持证据和推翻条件。
- [ ] 概率为主观判断并已标注；三档合计 100%。
- [ ] 没有投资建议、目标价或买卖信号。
- [ ] 若展示倒计时，规则公开可复算，且与严肃分析明确分开。

## 9. 可直接使用的 Agent 提示模板

### 9.1 分析 Agent 提示模板

```text
你是一名 AI 产业与市场分析员。请以 {YYYY-MM-DD} 为数据截止日，分析当前 AI 泡沫破裂的风险与可能时间窗口。

要求：
1. 先给出“泡沫破裂”的操作性定义（估值、融资、资本开支、信用、收入、供应链多维度），当天不得更改。
2. 技术面：评估能力进展、单位经济性、采用深度、供给链约束四个维度，各 0–5 分，列证据、来源、日期与反证。
3. 经济面：评估股价估值、财报指引、融资信用、宏观政策、市场情绪五个维度，各 0–5 分，列证据、来源、日期与反证。
4. 输出三种情景（基准/看空/看多），给出 3/6/12 个月时间窗口、触发条件、支持证据、推翻条件与主观概率（合计 100%）。
5. 列出 3–5 个最关键的领先指标与触发阈值，说明数据来源和更新频率。
6. 明确写出哪些结论证据不足、哪些数据无法获取。
7. 不给出精确破裂日期，不提供投资建议，不编造数据。
8. 最后用 200 字以内总结“技术面 vs 经济面”的核心分歧。
9. 按本指南第 6.2 节写出同目录 `bubble.json`：technical/economic 的 weight 为 0–100 整数且合计 100，target 带时区，sources 用 HTTPS；另附 Markdown 报告。

输出格式：Markdown 报告 + 来源列表（标题、发布者、日期、链接）+ `bubble.json`。
```

### 9.2 前端集成 Agent 提示模板

```text
你正在修改 Scaling Low 静态站点。目标：把现有大号压力测试倒计时改造成“技术面 + 经济面”的综合倒计时，并显示两轨预测占比。

注意：下面的 DOM 结构、CSS 写法和行号只是建议，可按当前代码调整；功能目标不可省略。

功能要求：
1. 只保留一个大的倒计时：复用现有 #clock，不得新建第二套大数字。
2. 字号必须继承现有 style.css:277 的 #clock strong（桌面最大 4.58rem），以及 313、461 行的移动端断点；不要改这三处字号。
3. 在 #clock 下方插入占比条：技术面 XX% / 经济面 XX%，两轨合计 100%，下方双色条。百分比字号明显小于计时数字。
4. 新增根目录 bubble.json，字段按 prompts/BUBBLE_TIMING_ANALYSIS.md 第 6.2 节；前端按权重计算综合目标，不另写死日期。
5. 修改 script.js:428-453：deadline 改为 let；加载 bubble.json 后重算 deadline 并调用 tick()；加载失败保留 2027-03-20 回退。
6. 修改 script.js:454-463：语言切换时刷新综合日期与“北京时间/Beijing time”文案。
7. 修改 .github/workflows/pages.yml:27，复制 bubble.json 到 _site。
8. 若同时改 scalinglow-publish.yml，必须同步处理 91-97 行只允许 news.json 的断言，否则发布失败；不确定时不要让分析 Agent 走该工作流，单独提交 bubble.json。

验收：
- 1440/768/375px 下计时数字不换行、不裁切；
- 权重合计 100%，条形宽度与百分比一致；
- bubble.json 缺失/损坏时回退正常；
- 中英文切换正确；
- 页面只有一个大倒计时。

请先阅读实际文件再改，不要仅按本模板猜测行号；完成后运行 node --check script.js，并说明改了哪些文件、哪些行。
```

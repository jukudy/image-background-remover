# Image Background Remover MVP 需求文档

> 文档版本：v1.0  
> 更新日期：2026-07-13  
> 产品阶段：MVP  
> 目标市场：全球英文用户  
> 核心关键词：`image background remover`

## 1. 项目概述

### 1.1 产品简介

Image Background Remover 是一个无需注册的在线图片去背景工具。用户上传 JPG、PNG 或 WebP 图片后，系统调用 Remove.bg API 自动识别前景并移除背景，随后在浏览器中展示透明背景结果，并允许用户下载 PNG 文件。

产品部署在 Cloudflare。图片只在用户浏览器、Cloudflare Worker 与 Remove.bg API 之间临时流转，不写入数据库、对象存储或磁盘，也不提供历史记录。

### 1.2 产品定位

一句话定位：

> Remove image backgrounds online in seconds — no signup and no watermark.

MVP 核心价值：

- 操作简单：打开页面即可上传，不要求注册。
- 结果快速：尽可能在数秒内完成处理。
- 输出可用：提供透明 PNG 下载，无本站水印。
- 隐私明确：本站不持久化保存用户图片。
- 移动友好：手机与桌面端均可完成上传、预览和下载。

### 1.3 项目目标

MVP 需要验证以下假设：

1. `image background remover` 及相关长尾关键词能够带来具有明确工具使用意图的访问者。
2. 无需登录、操作直接的体验能够产生较高的上传和下载转化率。
3. 用户愿意使用由第三方 Remove.bg API 处理图片的在线工具。
4. 单次图片处理成本能够被流量价值、后续付费功能或广告收入覆盖。

### 1.4 MVP 成功指标

上线后前 30 天重点观察：

| 指标 | 定义 | MVP 目标 |
| --- | --- | --- |
| 上传转化率 | 发起有效上传的访客 / 工具页访客 | ≥ 20% |
| 处理成功率 | 成功返回结果的任务 / 有效处理请求 | ≥ 95%（排除第三方故障） |
| 下载转化率 | 点击下载的成功任务 / 成功任务 | ≥ 60% |
| 中位处理时间 | 上传开始至结果可见 | ≤ 10 秒 |
| 重复使用率 | 7 天内再次访问并处理图片的用户占比 | 作为基线记录 |
| 单次成功成本 | Remove.bg 消耗及基础设施成本 / 成功任务 | 作为基线记录 |

目标值用于产品验证，不作为第三方服务可用性的承诺。

## 2. 目标用户与使用场景

### 2.1 目标用户

MVP 服务以下用户，优先级由高到低：

1. 电商卖家：为商品图制作透明或纯净背景素材。
2. 内容创作者：制作缩略图、社交媒体图片和演示素材。
3. 普通用户：处理头像、宠物、汽车、Logo 等图片。
4. 设计与运营人员：临时获取可继续编辑的透明 PNG 素材。

### 2.2 核心使用场景

- 用户需要将商品从杂乱背景中分离出来。
- 用户需要生成透明 PNG，用于 Canva、Figma 或演示文稿。
- 用户希望去除白色或纯色背景。
- 用户通过手机拍照后立即移除背景。
- 用户不愿为一次性任务创建账户或安装软件。

### 2.3 用户故事

- 作为访客，我希望无需登录即可上传图片，以便立即开始处理。
- 作为访客，我希望看见处理进度，以确认网站仍在工作。
- 作为访客，我希望对比原图与结果，以判断去背景质量。
- 作为访客，我希望下载透明 PNG，以便在其他工具中继续使用。
- 作为移动端用户，我希望可以从相册选择图片并保存结果。
- 作为注重隐私的用户，我希望知道图片会发给谁、是否被本站保存。
- 作为失败任务的用户，我希望收到可理解的原因和下一步建议。

## 3. 产品范围

### 3.1 MVP 范围内

- 英文单页工具站。
- JPG、JPEG、PNG、WebP 单图上传。
- 点击上传和拖放上传。
- 上传前客户端格式、大小校验。
- 原图本地预览。
- 调用 Remove.bg API 自动移除背景。
- 透明背景结果预览。
- Before/After 对比。
- 透明 PNG 下载。
- 重新上传和处理另一张图片。
- 响应式桌面端与移动端界面。
- Cloudflare Turnstile 人机验证。
- 基础请求频率限制和滥用防护。
- 基础 SEO、Open Graph、结构化数据、sitemap 和 robots.txt。
- Privacy Policy、Terms of Use 页面。
- 基础匿名产品事件统计。

### 3.2 MVP 范围外

- 用户注册、登录和个人中心。
- 图片历史记录或云端项目。
- R2、KV、D1 或其他图片持久化存储。
- 批量上传、ZIP 下载。
- 手动擦除、恢复、画笔和精细蒙版编辑。
- AI 生成背景和背景模板。
- 阴影生成、商品自动居中和电商尺寸模板。
- 移动 App、桌面 App 或浏览器扩展。
- 面向第三方开发者开放 API。
- 付费订阅、积分系统和在线支付。
- 多语言页面。

## 4. 信息架构

### 4.1 页面清单

| 路径 | 页面 | 目的 |
| --- | --- | --- |
| `/` | 首页及工具页 | SEO 落地、上传、处理、预览和下载 |
| `/privacy` | Privacy Policy | 说明图片流转、第三方处理、日志和统计 |
| `/terms` | Terms of Use | 使用条件、责任边界、禁止行为 |
| `/404` | 404 页面 | 返回首页和工具入口 |

### 4.2 首页模块顺序

1. Header：Logo、How it works、FAQ、Privacy。
2. Hero：H1、价值说明、上传区域、支持格式说明。
3. 工具状态区：上传、处理中、成功或失败状态。
4. 示例效果：人物、商品等 Before/After 示例。
5. How it works：Upload、Remove、Download 三步。
6. Benefits：No signup、No watermark、High-quality result、Privacy-aware。
7. Use cases：Products、Portraits、Pets、Cars、Logos。
8. FAQ。
9. Footer：Privacy、Terms、联系邮箱和版权信息。

## 5. 核心用户流程

### 5.1 正常流程

1. 用户打开首页。
2. 用户点击上传区域选择图片，或将图片拖入上传区域。
3. 浏览器校验格式和文件大小。
4. 浏览器展示原图预览，并在需要时执行 Turnstile 验证。
5. 用户点击 `Remove Background`；也可以在上传后自动开始，具体由实现阶段选择，默认推荐按钮确认后开始，以减少误调用成本。
6. 页面进入处理中状态并锁定重复提交。
7. Cloudflare Worker 将图片请求流式转发给 Remove.bg API。
8. Remove.bg 返回透明背景结果。
9. Worker 将结果流返回浏览器，不进行持久化存储。
10. 页面展示透明棋盘背景上的处理结果。
11. 用户拖动 Before/After 控件检查效果。
12. 用户点击 `Download PNG` 下载结果。
13. 用户可点击 `Remove another image` 重置页面并处理新图片。

### 5.2 失败流程

发生错误时，页面必须退出加载状态，保留可安全重试的入口，并显示用户可理解的信息。不得直接展示 API Key、内部堆栈或 Remove.bg 原始敏感响应。

| 场景 | 用户提示 | 可执行操作 |
| --- | --- | --- |
| 格式不支持 | Please upload a JPG, PNG, or WebP image. | 重新选择 |
| 文件超过 20MB | Your image is larger than 20MB. Please choose a smaller file. | 重新选择 |
| 文件损坏 | We couldn't read this image. Please try another file. | 重新选择 |
| Turnstile 失败 | Verification failed. Please try again. | 重新验证 |
| 前景无法识别 | We couldn't detect a clear subject in this image. | 更换图片 |
| API 额度不足 | Background removal is temporarily unavailable. Please try again later. | 稍后重试 |
| 请求过多 | Too many requests. Please wait a moment and try again. | 延迟重试 |
| 网络中断 | Your connection was interrupted. Please try again. | 手动重试 |
| 服务端异常 | Something went wrong. Please try again. | 手动重试 |

## 6. 功能需求

### FR-01 图片选择

- 上传区域在首屏可见，无需滚动。
- 支持点击选择及桌面端拖放。
- 文件选择器接受 `.jpg,.jpeg,.png,.webp`。
- 每次只接受一个文件；新文件替换当前未处理文件。
- 上传前显示文件名、文件大小和本地预览。
- 不把 base64 图片写入 Local Storage、Session Storage 或 IndexedDB。

### FR-02 客户端校验

- 最大文件大小为 20MB。
- 允许的 MIME 类型为 `image/jpeg`、`image/png`、`image/webp`。
- 不能只依赖文件扩展名。
- 校验失败不得调用后端和 Remove.bg API。
- 前端校验仅用于体验优化，Worker 必须再次执行可行的安全校验。

### FR-03 人机验证与防重复提交

- 有效处理请求必须携带 Cloudflare Turnstile token。
- Worker 调用 Turnstile Siteverify 验证 token。
- 同一任务处理中禁用重复提交按钮。
- 请求失败后是否允许重试取决于失败类型；不对可能已计费的请求自动重试。

### FR-04 背景移除

- Worker 使用服务端 Secret 中的 Remove.bg API Key。
- 调用 `POST https://api.remove.bg/v1.0/removebg`。
- MVP 默认参数：`size=auto`、`format=png`。
- Worker 不将用户图片或结果写入持久化存储。
- Worker 应尽可能流式转发请求体和响应体，避免不必要的完整二进制副本。
- API 超时后终止请求并返回统一错误；建议超时阈值为 60 秒。
- Remove.bg API Key 不得出现在前端包、HTML、日志或客户端网络请求头中。

### FR-05 处理状态

页面至少包含以下互斥状态：

- `idle`：等待上传。
- `ready`：已选择有效图片，等待处理。
- `verifying`：正在进行人机验证。
- `processing`：正在处理。
- `success`：已获得结果。
- `error`：处理失败。

处理中应展示明确的视觉反馈和文案，例如 `Removing background…`。不得显示虚假的精确百分比；如果无法获得服务端进度，使用不确定进度动画。

### FR-06 结果预览

- 结果默认显示在透明棋盘背景上。
- 支持 Before/After 拖动对比。
- 结果图片不得因 UI 展示而改变实际下载分辨率。
- 预览使用浏览器内存中的 Object URL。
- 选择新图片、重置或离开页面时释放旧的 Object URL。

### FR-07 下载

- 下载格式为 PNG。
- 下载按钮文案为 `Download PNG`。
- 下载文件名格式：`{original-name}-no-background.png`。
- 文件名必须经过清理，不允许注入路径或特殊控制字符。
- 下载操作在浏览器端完成，不经过第二次 API 调用。
- 下载后展示处理另一张图片的入口。

### FR-08 重置

- 用户可在成功或失败后选择另一张图片。
- 重置后清除当前页面内存中的原图、结果和错误状态。
- 重置不刷新整个页面。

### FR-09 内容与 FAQ

FAQ 至少回答：

1. How do I remove the background from an image?
2. Is this background remover free?
3. Do I need to create an account?
4. Which image formats are supported?
5. Are my images stored?
6. Why did background removal fail?
7. Can I use the result commercially?

关于免费额度、商业使用和第三方数据处理的表述必须与上线时 Remove.bg 的实际条款保持一致，不能给出未经确认的永久承诺。

## 7. API 需求

### 7.1 处理接口

```http
POST /api/remove-background
Content-Type: multipart/form-data
```

请求字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `image_file` | File | 是 | JPG、PNG 或 WebP，最大 20MB |
| `size` | String | 否 | MVP 固定或白名单限制为 `auto` |
| `format` | String | 否 | MVP 固定或白名单限制为 `png` |
| `turnstile_token` | String | 是 | Cloudflare Turnstile token |

成功响应：

```http
HTTP/1.1 200 OK
Content-Type: image/png
Cache-Control: no-store, private
X-Content-Type-Options: nosniff
```

响应体为 PNG 二进制流。

错误响应统一为：

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please wait a moment and try again.",
    "requestId": "optional-safe-id"
  }
}
```

建议错误码：

- `METHOD_NOT_ALLOWED`
- `INVALID_CONTENT_TYPE`
- `FILE_TOO_LARGE`
- `UNSUPPORTED_IMAGE`
- `VERIFICATION_FAILED`
- `SUBJECT_NOT_FOUND`
- `RATE_LIMITED`
- `PROVIDER_UNAVAILABLE`
- `PROVIDER_QUOTA_EXCEEDED`
- `REQUEST_TIMEOUT`
- `INTERNAL_ERROR`

### 7.2 健康检查

```http
GET /api/health
```

只检查 Worker 是否正常响应，不调用 Remove.bg，不暴露 API Key、额度或内部配置。

```json
{
  "status": "ok"
}
```

## 8. 技术架构与部署约束

### 8.1 推荐技术栈

- 前端：React、Vite、TypeScript。
- UI：Tailwind CSS 或轻量自定义 CSS。
- 运行平台：Cloudflare Workers + Static Assets。
- 后端：同一 Cloudflare Worker 中的 API 路由。
- 第三方处理：Remove.bg API。
- 部署工具：Wrangler。
- 持久化存储：无。

### 8.2 数据流

```text
User browser
  -> Cloudflare Worker
  -> Remove.bg API
  -> Cloudflare Worker
  -> User browser
```

原图和处理结果只存在于网络传输、Worker 请求生命周期以及用户浏览器内存中。Remove.bg 自身如何处理或保留数据，以其届时有效的隐私政策和服务条款为准。

### 8.3 环境配置

| 配置项 | 类型 | 说明 |
| --- | --- | --- |
| `REMOVE_BG_API_KEY` | Secret | Remove.bg API 密钥 |
| `TURNSTILE_SECRET_KEY` | Secret | Turnstile 服务端密钥 |
| `VITE_TURNSTILE_SITE_KEY` | Public env | Turnstile 前端 Site Key |
| `APP_ENV` | Plain env | `development`、`staging`、`production` |

生产密钥通过 Cloudflare Secret 管理，不提交到 Git。

## 9. 非功能需求

### 9.1 性能

- 首屏内容在常见移动网络下尽快可交互。
- 首页非工具图片采用 WebP/AVIF 并懒加载。
- 原始用户图片不做不必要的 base64 转换。
- API 请求和响应尽可能使用流式传输。
- 不缓存用户上传内容和处理结果。
- Lighthouse 目标：Performance ≥ 85，SEO ≥ 95，Accessibility ≥ 90，Best Practices ≥ 90。

### 9.2 可用性

- 支持最近两个主要版本的 Chrome、Edge、Firefox 和 Safari。
- 支持 iOS Safari 与 Android Chrome。
- 上传、处理、成功和失败状态均有明确反馈。
- 关键按钮具备 loading、disabled、hover 和 keyboard focus 状态。

### 9.3 可访问性

- 达到 WCAG 2.1 AA 的核心要求。
- 所有交互控件可用键盘操作。
- 上传区域提供按钮语义，不能只依赖拖放。
- 错误信息通过可访问的状态区域播报。
- Before/After 控件提供键盘操作和可理解标签。
- 文本与背景颜色保持足够对比度。

### 9.4 安全与滥用防护

- 使用 Turnstile 验证真实用户。
- 配置 Cloudflare Rate Limiting 或等效规则。
- 服务端限制方法、Content-Type、文件大小和允许字段。
- API 响应统一设置安全头。
- 只允许预期站点来源，但不把 `Origin` 或 `Referer` 作为唯一安全机制。
- 不将第三方错误完整透传给用户。
- 不记录请求体、图片二进制、API Key 或 Turnstile Secret。
- 对 429 按 `Retry-After` 提示用户，不自动循环重试。
- 设置 Remove.bg 用量告警，避免额度异常消耗。

### 9.5 隐私

- 本站不持久化存储用户图片。
- 本站不使用用户图片训练模型。
- 用户提交前应能访问 Privacy Policy。
- 上传区域附近展示简短说明：`Your image is sent securely to our processing provider and is not stored by this website.`
- Privacy Policy 必须明确列出 Remove.bg 作为处理服务提供方。
- 分析工具不采集图片内容、文件名或可还原图片的信息。

## 10. SEO 需求

### 10.1 首页元数据

建议 Title：

```text
Free Image Background Remover – Remove Background Online
```

建议 Meta Description：

```text
Remove image backgrounds automatically in seconds. Download a transparent PNG with no signup and no watermark.
```

建议 H1：

```text
Remove Image Background Online for Free
```

### 10.2 技术 SEO

- 首页设置唯一 canonical。
- 生成 `sitemap.xml` 和 `robots.txt`。
- 添加 Organization、WebApplication 和 FAQPage JSON-LD；内容必须与页面可见内容一致。
- Open Graph 和 Twitter Card 使用独立静态分享图，不使用用户图片。
- 页面必须具备服务端可见或静态生成的核心文本内容。
- 不创建只有关键词替换、没有独立功能价值的薄内容页面。

## 11. 数据统计

### 11.1 事件清单

统计应匿名化，且不包含图片、文件名、API Key 或完整错误响应。

| 事件 | 触发时机 | 建议属性 |
| --- | --- | --- |
| `page_view` | 首页打开 | device、referrer、country（平台聚合） |
| `upload_selected` | 选择有效图片 | mime_type、size_bucket |
| `upload_rejected` | 客户端校验失败 | reason |
| `remove_started` | 发起处理 | size_bucket、mime_type |
| `remove_succeeded` | 成功获得结果 | duration_bucket、provider_status |
| `remove_failed` | 处理失败 | error_code、provider_status |
| `download_clicked` | 点击下载 | result_format |
| `remove_another_clicked` | 点击处理另一张 | previous_state |

`size_bucket` 示例：`<1MB`、`1-5MB`、`5-10MB`、`10-20MB`，不得上传精确文件大小与文件名。

### 11.2 服务端监控

- 每分钟请求量。
- 成功率和各错误码占比。
- Remove.bg 响应时间。
- 402、429、5xx 数量。
- Turnstile 验证失败率。
- Worker 异常率。
- Remove.bg 额度和成本告警。

## 12. 文案要求

### 12.1 首屏建议文案

```text
Remove Image Background Online for Free

Automatically remove backgrounds from photos in seconds.
No signup. No watermark. Transparent PNG.

[Upload Image]
or drag and drop an image

JPG, PNG or WebP · Max 20MB
```

### 12.2 状态文案

| 状态 | 文案 |
| --- | --- |
| 待上传 | Upload an image to remove its background. |
| 已选择 | Your image is ready. |
| 验证中 | Verifying… |
| 处理中 | Removing background… |
| 成功 | Your image is ready to download. |
| 通用失败 | We couldn't process this image. Please try again. |

文案应避免在未核实供应商条款时使用 `unlimited`、`100% private`、`never uploaded` 或永久免费的承诺。

## 13. 验收标准

### 13.1 上传与校验

- [ ] 用户可点击或拖放上传 JPG、PNG、WebP。
- [ ] 大于 20MB 的文件在调用后端前被拒绝。
- [ ] 非图片文件不能触发 Remove.bg 请求。
- [ ] 上传后能看到清晰的本地预览。
- [ ] 移动端可以从相册选择图片。

### 13.2 处理

- [ ] 有效图片能够通过 Worker 调用 Remove.bg。
- [ ] API Key 不出现在浏览器网络请求和前端构建产物中。
- [ ] 同一任务处理中不能重复提交。
- [ ] 成功后展示透明背景结果。
- [ ] 结果保持 Remove.bg 返回的分辨率，不因预览缩放而降质。
- [ ] 所有已知失败类型均退出 loading 状态并展示正确提示。

### 13.3 下载与重置

- [ ] 下载文件为可打开且带透明通道的 PNG。
- [ ] 下载不会再次调用 Remove.bg。
- [ ] 下载文件名符合约定。
- [ ] 用户可以不刷新页面处理另一张图片。
- [ ] 重置后旧 Object URL 被释放。

### 13.4 安全与隐私

- [ ] 未通过 Turnstile 的请求被拒绝。
- [ ] 频率限制规则已经启用并验证。
- [ ] 图片未写入 R2、KV、D1、日志或其他持久化位置。
- [ ] 响应包含 `Cache-Control: no-store, private`。
- [ ] Privacy Policy 明确披露 Remove.bg 第三方处理。
- [ ] 前端和服务端日志不包含图片内容及密钥。

### 13.5 SEO 与质量

- [ ] Title、Description、H1 唯一且符合关键词意图。
- [ ] canonical、sitemap、robots.txt 正常。
- [ ] JSON-LD 可通过结构化数据验证。
- [ ] 页面在手机、平板和桌面宽度下可用。
- [ ] 键盘可以完成上传、处理、对比和下载流程。
- [ ] 生产环境无阻断流程的控制台错误。

## 14. 上线计划

### 阶段一：开发环境

- 搭建 Vite、React、TypeScript 和 Worker 项目。
- 完成上传、状态机、Remove.bg 代理和结果下载。
- 使用测试密钥和开发 Turnstile 配置。

### 阶段二：预发布

- 部署 Cloudflare 预览环境。
- 配置独立预发布密钥或严格额度。
- 完成桌面端、移动端、错误流程和可访问性测试。
- 验证日志中不存在图片内容及密钥。

### 阶段三：生产发布

- 配置域名、生产 Secret、Turnstile 和频率限制。
- 设置 Remove.bg 用量及费用告警。
- 提交 sitemap，接入搜索分析和匿名产品统计。
- 小流量发布，观察 402、429、5xx 和处理耗时。

## 15. 发布后迭代判断

根据 MVP 数据选择后续方向：

- 上传多、下载高、重复率低：加强 SEO 页面、相关小工具和广告变现。
- 重复率高：优先开发批量处理、账户和付费套餐。
- 电商图片占比高：开发白底、阴影、自动居中和平台尺寸模板。
- 处理成本过高：增加免费额度控制、客户端预处理或评估自建模型。
- 失败集中在复杂边缘：增加手动恢复/擦除编辑器。

## 16. 风险与待确认事项

| 风险或事项 | 影响 | MVP 处理方式 |
| --- | --- | --- |
| Remove.bg 按调用计费 | 可能被滥用或成本失控 | Turnstile、频率限制、用量告警 |
| 第三方服务故障 | 无法完成核心任务 | 友好错误提示和监控，不自动切换供应商 |
| Remove.bg 条款变化 | 免费、隐私或商用文案失效 | 上线前复核并定期检查 |
| 不持久化导致无法恢复任务 | 页面关闭后结果丢失 | 明确提示用户及时下载 |
| Worker 内存和请求限制 | 大图片可能失败 | 20MB 上限、流式传输、避免二进制复制 |
| 公共代理被绕过前端调用 | 消耗 API 额度 | 服务端 Turnstile 校验和边缘频率限制 |

开发前仍需确认但不阻塞项目脚手架的事项：

1. 正式域名和品牌名称。
2. Remove.bg 正式套餐及月度成本上限。
3. 联系邮箱。
4. 使用 Cloudflare Web Analytics 或其他匿名统计方案。
5. 免费使用是否设置每日软限制；若设置，需要选择无需数据库的边缘限制策略。

---

## 附录：MVP 完成定义

当真实用户可以在生产域名完成“打开首页 → 选择有效图片 → 通过验证 → 去除背景 → 对比结果 → 下载透明 PNG”，同时图片不被本站持久化、API Key 不泄露、异常和额度受到基本保护，且核心指标可观测时，MVP 视为完成。

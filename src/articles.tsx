import type { ReactNode } from "react";

export type ArticleLink = {
  label: string;
  href: string;
};

export type Article = {
  slug: string;
  path: string;
  index: string;
  kicker: string;
  title: string;
  summary: string;
  cover: string;
  coverAlt: string;
  tags: string[];
  links?: ArticleLink[];
  body: ReactNode;
  previous?: string;
  next?: string;
};

export const articles: Article[] = [
  {
    slug: "coral-launcher",
    path: "/blog/CoralLauncher.html",
    index: "05",
    kicker: "Minecraft · Tauri · AI",
    title: "Coral Launcher，用 AI 做出一直想写的 Minecraft 启动器",
    summary: "刚接触编程时就想做一个 Minecraft 启动器。如今借助 AI，我用 Tauri 和 Rust 把下载、登录与启动流程做进了自己的桌面程序。",
    cover: "/images/coral-launcher-cover.png",
    coverAlt: "Coral Launcher 界面封面",
    tags: ["Minecraft", "启动器", "Tauri", "Rust", "AI 辅助开发"],
    links: [
      { label: "GitHub", href: "https://github.com/SmallCoral/coral-launcher" },
      { label: "项目说明", href: "https://github.com/SmallCoral/coral-launcher#readme" },
    ],
    body: (
      <>
        <p>我最早想学编程，很大一部分原因是 Minecraft，想写一个自己的启动器，把游戏版本下载好，登上账号，再从自己做的界面里启动游戏。知道别人做得出来，轮到自己，又觉得要学的东西太多。后来接触的技术越来越多，手头也有了别的项目，这个想法就一直搁着。</p>
        <p>有了 AI 辅助开发以后，我又开始做这件事。项目叫 Coral Launcher。它是一个 Minecraft Java 版桌面启动器，也是我的第一个 AI 辅助开发项目，现在已经能打包成 Windows 的 <code>.exe</code>，从界面里下载游戏并启动 Java。刚入门时想做的东西，终于有了一个能运行的版本。</p>
        <h2>界面交给 React，文件和进程交给 Rust</h2>
        <p>我选了 Tauri 2 做桌面框架，前端用 React 18、TypeScript 5 和 Vite 5。版本列表、账号页面和设置都在界面里处理，下载文件、校验内容以及启动进程这些工作交给 Rust。后端用到 reqwest、tokio、sha1、md5 和 zip 等库，分别处理网络请求、异步任务与文件操作。</p>
        <p><a href="https://v2.tauri.app/concept/architecture/" target="_blank" rel="noreferrer">Tauri 使用系统的 WebView</a> 来显示界面，应用不必再捆绑一套完整的 Chromium。我可以继续用熟悉的前端技术写页面，也能通过 Rust 访问本地文件和进程。对这个项目来说，这样的分工比较顺手。</p>
        <p>仓库也保留了浏览器预览模式，改界面时可以单独启动。不过，下载 Minecraft、登录账号和启动 Java 都需要 Tauri 后端，浏览器里只能预览界面。要用完整功能，得运行桌面版。</p>
        <h2>让游戏启动起来，要把文件逐个处理好</h2>
        <p>启动器先从 BMCLAPI 获取版本列表，镜像请求失败时回退到 Mojang/Piston 官方源。选好版本以后，再读取版本清单，下载客户端 jar 和依赖库，接着处理资源索引、资源文件，以及需要解压的原生库。按钮上写着“下载”，后面实际要做的是这一串工作。</p>
        <p>现有文件也要检查大小和 SHA1，确认完整了才能继续用。下载失败需要重试，镜像不可用时需要换源；文件齐了，还得把原生库解压到对应版本的目录。项目目前支持并行下载，类库最多 8 个任务同时跑，资源文件最多 24 个，避免所有文件都一个接一个地等。</p>
        <p>最后，启动器根据版本元数据、账号信息和 Java 设置生成命令行，把内存参数也带上，再启动进程。版本里的库规则、系统路径和 Java 大版本都会影响这一步。前面下载完成，并不保证后面就能顺利启动，一个字段处理错了，仍然得沿着日志往回查。</p>
        <h2>账号和模组还各有一套流程</h2>
        <p>Microsoft 登录用的是设备码流程，用户不必自己填写 Client ID。拿到 Microsoft 令牌后，还要经过 Xbox Live 和 XSTS，再向 Minecraft Services 认证，检查游戏资格并读取角色信息。启动器也保留了离线模式，按 OfflinePlayer 规则生成 UUID，方便本地测试和离线服务器使用。</p>
        <p>模组页面接入了 Modrinth API，可以按 Minecraft 版本和加载器筛选，找到文件后下载到实例的 <code>mods</code> 目录。Fabric、Quilt、Forge 和 NeoForge 的模组都可以按条件搜索；加载器本身的安装仍在后续计划里，搜索得到模组与装好对应加载器是两件需要分别处理的事。</p>
        <p>账号信息也有待继续改。预览启动命令时，敏感 token 已经会被隐藏；用于恢复登录的 refresh token 目前仍保存在本地 JSON 文件里。我想把它迁到系统密钥链或 Tauri Stronghold，改进会话的保存方式。</p>
        <h2>AI 帮我开始，我得负责把它跑通</h2>
        <p>以前做一个完整的桌面应用，碰到不熟的技术，很容易在查资料的时候停下来。这次我让 AI 帮忙梳理接口、拆分任务，也用它补样板代码和查错误。这样做省下了一部分准备时间，我能更早把程序运行起来，再看哪里需要改。</p>
        <p>运行结果仍然得自己判断。代码在解释里讲得通，放到实际的下载、认证和启动流程里，未必每一步都能过。出错以后，我需要看懂它写了什么，才能决定接着修哪一段。这个项目让我愿意重新尝试以前搁下的想法，也让我更清楚自己还需要补哪些知识。</p>
        <p>接下来想补加载器安装，以及 Java 运行时的自动发现和下载。下载部分还缺断点续传，进度也想按文件组显示得更清楚。Coral Launcher 已经能运行，后面要做的，是把这些使用时会碰到的麻烦逐个处理掉。</p>
      </>
    ),
    previous: "daplink-stm32",
  },
  {
    slug: "daplink-stm32",
    path: "/blog/DAPLink-STM32.html",
    index: "04",
    kicker: "Embedded · CMSIS-DAP · USB HID",
    title: "从零开始做一个 STM32 CMSIS-DAP 调试器",
    summary: "从电脑认不出 USB 设备，到 OpenOCD 连上目标芯片，记录我用 STM32 做调试器时遇到的几个难关。",
    cover: "/images/resource/blog-3.png",
    coverAlt: "STM32 CMSIS-DAP 调试器开发记录封面",
    tags: ["嵌入式", "STM32", "CMSIS-DAP", "调试器"],
    links: [{ label: "GitHub", href: "https://github.com/SmallCoral/coral-dap" }],
    body: (
      <>
        <p>开始做这个调试器的时候，我还在写一些 STM32 小项目，点灯、接串口，再慢慢用上 OLED 和传感器。ST-Link 插上能下载程序，我平时就这样用着。后来忽然好奇，调试器里也有单片机，它到底怎样把电脑发来的命令交给另一块芯片？能不能自己做一个试试？</p>
        <p>我去查资料，遇到了 DAPLink 和 CMSIS-DAP。协议、结构体、接口定义都摆在文档里，可当时很难把它们和手里的板子对应起来。字能看懂，数据从哪里来、发给谁、收到以后该干什么，却还没理顺。</p>
        <p>两个名字也需要分开。<a href="https://arm-software.github.io/CMSIS_5/DAP/html/index.html" target="_blank" rel="noreferrer">CMSIS-DAP</a> 规定了电脑与调试器之间的命令，<a href="https://github.com/ARMmbed/DAPLink" target="_blank" rel="noreferrer">DAPLink</a> 是包含调试和其他 USB 功能的固件工程。我这里做的 CORAL-DAP 实现 CMSIS-DAP v1，通过 USB HID 收发数据，再用 GPIO 模拟 SWD 时序，与目标芯片通信。</p>
        <h2>第一关，先让电脑看见它</h2>
        <p>我选了带 USB 的 STM32F042，先尝试把它做成一个 HID 设备。之前主要用串口，到了 USB 这里，CubeMX 生成了代码，我仍然不知道该从哪里检查。</p>
        <p>插上电脑，没反应。没有提示，也没有错误，我只好从描述符和 HID 报告开始看，检查字段与长度，改了代码就重新插上，再看系统有没有识别。</p>
        <p>字段漏了、长度写错了，都可能让电脑认不出设备。后来它终于出现在 HID 设备里，我高兴了一阵，至少 USB 这一段开始有结果了。</p>
        <p>接下来还要按 CMSIS-DAP 的格式解析请求、组织响应。USB 能收发数据，只解决了传输这一段；电脑收到的内容是否正确，还得拿调试工具来检查。</p>
        <h2>OpenOCD 连不上，问题藏在哪里</h2>
        <p>当时我用下面这条命令尝试连接目标 STM32。</p>
        <pre><code>openocd -f interface/cmsis-dap.cfg -f target/stm32f1x.cfg</code></pre>
        <p>有时它报错，有时卡住，还有时候看不到有用的输出。设备已经能识别，连接却一直过不去，我查日志，也看 <code>/proc</code> 里的信息，怀疑过驱动和板子，前面做了那么多，仍然没法用它调试。</p>
        <p>其中一次是 C 结构体的对齐出了问题。看代码时，字段都在；到了实际传输的数据里，位置已经错开了。就这么卡了一整天。检查源码里的结构体，还需要检查它在内存里怎样排列，以及发出去的字节是否符合协议。</p>
        <p>后来再运行 OpenOCD，它终于开始正常识别设备、初始化接口，并连上目标 STM32。之前失败太多次，看到这次输出，我还愣了一下。到这里，电脑发来的调试命令才真的经过我的设备，到达了目标芯片。</p>
        <h2>现在这块板子能做什么</h2>
        <p>仓库里的固件基于 STM32CubeMX 和 HAL，已在配套的 STM32F103CB 开发板上做过读写、烧录和断点调试测试。SWD 通过 GPIO 模拟，建议从 100 kHz 开始，固件把最高速度限制在 1 MHz。复现时可以用仓库中的 <code>daplink.cfg</code> 配置；接线和构建方法也写在项目说明里。</p>
        <p>配套原理图和 PCB 由 <a href="https://github.com/xcvista" target="_blank" rel="noreferrer">xcvista</a> 提供，在这里也感谢他的设计。这个项目让我把 USB 传输、协议命令和目标芯片的调试接口接到了一起。以后再遇到连接失败，至少知道可以从哪一段开始查了。</p>
      </>
    ),
    previous: "empty-magazine-cleaner",
    next: "revek-boss",
  },
  {
    slug: "empty-magazine-cleaner",
    path: "/blog/EmptyMagazineCleaner.html",
    index: "03",
    kicker: "Barotrauma Mod · Lua",
    title: "潜渊症自动清理地上的空弹匣",
    summary: "让 Lua 模组自动收走地上耗尽的弹匣和部分弹药，保留背包、容器里的物品，省下手动清理的功夫。",
    cover: "/images/resource/blog-4.png",
    coverAlt: "潜渊症自动清理地上的空弹匣封面",
    tags: ["潜渊症", "自制模组", "自动清理", "Lua"],
    links: [
      { label: "创意工坊", href: "https://steamcommunity.com/sharedfiles/filedetails/?id=3690720502" },
      { label: "GitHub", href: "https://github.com/SmallCoral/EmptyMagazineCleaner" },
    ],
    body: (
      <>
        <p>《潜渊症》里，用完后丢在地上的弹匣和弹药箱会一直留着。EmptyMagazineCleaner 就用来收走这些废弃弹药，让潜艇里少堆一些杂物。模组需要 Lua For Barotrauma，具体规则可以在 <a href="https://github.com/SmallCoral/EmptyMagazineCleaner/blob/main/Lua/Autorun/00_empty_mag_cleanup.lua" target="_blank" rel="noreferrer">清理脚本</a> 中查看。</p>
        <h2>哪些物品会被清理</h2>
        <p>脚本会检查空弹匣、空弹药箱，以及部分耗尽的轨道炮弹、深水炸弹和诱饵弹药。它先判断物品是否在地上，再检查物品标识和状态值。物品放在角色背包或容器里时，会跳过处理。</p>
        <p>当前脚本用 <code>ConditionPercentage</code> 判断是否耗尽，清理阈值为 0.5，单位是百分比。只有状态值小于或等于这个阈值，且符合物品类别和位置条件，才会被删除。这里的“空”由脚本中的数值判断，读者可以对照源码确认自己使用的弹药是否符合规则。</p>
        <p>这样设置是为了尽量保留仍能用的弹药。别的模组可能给物品使用不同的标识，或者用不同方式记录剩余弹药；遇到这类物品，仍需检查兼容情况。本文介绍的是当前脚本的处理范围。</p>
        <h2>安装前先准备 Lua 环境</h2>
        <ol>
          <li>安装 Lua For Barotrauma，并确认它已经正常工作。这个模组需要它来执行 Lua 脚本。</li>
          <li>将模组文件放入 <code>Barotrauma/LocalMods/</code> 目录，再到游戏的内容包列表里启用。</li>
          <li>进入游戏后，把背包外已经耗尽的弹药作为检查对象，确认清理规则符合自己的使用需求。</li>
        </ol>
        <h2>单人与联机</h2>
        <p>它适用于单人游戏，也可以在有 Lua For Barotrauma 的本地主机环境里使用。多人游戏中，客户端脚本会直接退出，清理工作由服务端处理；只在自己的客户端装上模组，无法替没有安装它的主机清理物品。</p>
      </>
    ),
    next: "daplink-stm32",
  },
  {
    slug: "revek-boss",
    path: "/blog/RevekBoss.html",
    index: "02",
    kicker: "Game Design · Hollow Knight",
    title: "瑞维克 BOSS 战设计",
    summary: "为《空洞骑士》的瑞维克构思一场梦境 Boss 战，写下攻击节奏、梦之钉的用法，以及娇嫩的花参与的剧情。",
    cover: "/images/resource/blog-2.jpg",
    coverAlt: "瑞维克 BOSS 战设计封面",
    tags: ["游戏", "空洞骑士", "Boss 设计", "梦之钉"],
    body: (
      <>
        <p>我想给《空洞骑士》灵魂沼地的守护者瑞维克（Revek）设计一场完整的 Boss 战。他守着那些鬼魂居民，这个身份让我想围绕梦之钉和守护的职责做一些变化。下面是我的设计草案，技能数值和剧情触发都属于自定义设定，还需要通过 Mod 实现。</p>
        <p>在这份构想里，小骑士对瑞维克所在的位置使用梦之钉，进入他的梦境。战斗中的梦之钉能够伤害瑞维克，也承担打断治疗、触发硬直的作用。</p>
        <h2>场景布置</h2>
        <p>背景沿用灵魂沼地。场地中央放一棵巨大的低语之根，下方保留鬼魂居民的剪影，让玩家在战斗时仍然能看见瑞维克守护的对象。</p>
        <h2>行动模式</h2>
        <p>冲刺斩和噬魂爆炸每次造成两格面具伤害，其余攻击造成一格。具体动作先按下面的版本设计。</p>
        <ul>
          <li><strong>冲刺斩。</strong>连续三次从不同方向冲向小骑士，每次命中造成两格面具伤害。两次冲刺之间的间隔，参考无上辐光的光辐射节奏。</li>
          <li><strong>剑波。</strong>从瑞维克所在的位置朝小骑士放出一道剑波，横跨屏幕，命中造成一格面具伤害。</li>
          <li><strong>噬魂治疗。</strong>小骑士的灵魂值达到 33 点时，瑞维克可以吸走其中 33 点为自己回血，并引发范围爆炸。此时用梦之钉命中他，可以打断治疗并造成大量伤害。</li>
          <li><strong>格挡。</strong>小骑士靠得太近时，瑞维克会进入防御姿态，挡住来自正面、上方和下方的骨钉及法术攻击。格挡成功后，他向前刺击，攻击覆盖约一半场地。</li>
          <li><strong>下刺。</strong>传送到小骑士上方，向下猛砸，落地后向左右放出冲击波。</li>
          <li><strong>骨钉刺击。</strong>在场地的随机位置生成三根骨钉，依次射向小骑士，每根间隔 0.5 到 1 秒。这个动作取自灵魂沼地百钉战士的三根骨钉。</li>
        </ul>
        <h2>梦之钉怎样参与战斗</h2>
        <p>在这场战斗中，普通梦之钉命中造成 33 点伤害，装备舞梦者后提高到 66 点。噬魂治疗的前摇会略长于装备舞梦者时挥动梦之钉所需的时间，给玩家留下打断的机会。</p>
        <p>瑞维克的硬直也由梦之钉触发。累计命中三次后，他进入持续 3 秒的硬直。这个期间，骨钉和法术无法造成伤害，骨钉命中仍可让小骑士获得灵魂；再次使用梦之钉则会造成伤害，并提前结束硬直。</p>
        <p>下刺会留出可观察的时间间隔，玩家可以用下砸躲避并反击，装备萨满之石后提高法术伤害。冲刺斩和骨钉刺击可以用黑冲或下砸应对；冲刺斩也允许通过拼刀免除伤害。这些时机需要在实际实现后反复测试，才能确定是否有足够的反应时间。</p>
        <h2>神居中的数值与文案</h2>
        <p>调谐、进升和辐辉三个等级的生命值，暂时都设为 950。</p>
        <p>神居雕像前的两句文案拟为下面这样。</p>
        <blockquote><p>我守护着沼池边的墓地。</p><p>强大与忠诚的灵魂守护神。</p></blockquote>
        <p>战斗中的梦语保留三句。</p>
        <blockquote><p>守护……这片安息之地。</p><p>彼岸的……花海。</p><p>保护，终生的使命。</p></blockquote>
        <h2>从守护鬼魂到进入梦境</h2>
        <p>初次见面时，瑞维克仍然警告小骑士，不要伤害鬼魂居民。后续剧情设想接在居民全部消失之后。小骑士对墓地中的其他鬼魂都使用过梦之钉，瑞维克便沮丧地表示，自己忘记了一项重要的使命。再对他使用梦之钉，他也会消失。</p>
        <p>此后返回灵魂沼地，在瑞维克原来的位置使用梦之钉，就能进入这场 Boss 战。这样安排，也让战斗入口和他失去守护对象后的处境连在一起。</p>
        <p>娇嫩的花是另一条剧情条件。携带花进入梦境时，战斗期间花不会损毁；如果失败，小骑士退出梦境，花随之损毁。如果胜利，灵魂沼地会开满娇嫩的花，除瑞维克外的鬼魂居民重新出现。</p>
        <p>这些仍是纸面设定。后续要做成 Mod，还需要实现技能和剧情事件，尤其要测试梦之钉打断、三次命中硬直与花的状态变化，看看它们能否按预想衔接。</p>
      </>
    ),
    previous: "daplink-stm32",
    next: "software-not-service",
  },
  {
    slug: "software-not-service",
    path: "/blog/SoftwareNotService.html",
    index: "01",
    kicker: "Open Source · Ownership",
    title: "Software Not Service",
    summary: "用户可以自行部署和修改软件，服务方靠运行与维护收费。我想讨论这种做法能留下多少选择，以及维护的钱从哪里来。",
    cover: "/images/resource/blog-1.jpg",
    coverAlt: "Software Not Service 封面",
    tags: ["科技", "软件", "开源", "服务"],
    body: (
      <>
        <p>我用 Software Not Service，简称 SnS，来称呼自己设想的一种做法。软件开放源代码，允许用户自行部署和修改，也允许他人遵守许可证，用这套软件提供服务；用户可以自己运行，需要别人代为维护时，再为服务付费。</p>
        <p>以游戏为例，在这个设想里，玩家可以免费获取源代码，部署自己的版本，或按需要改编。服务方则可以负责运行服务器、维护社区，或者提供内容服务，并为这些工作收费。玩家选择付费，有一部分原因应当是服务方把这些事做得更好。</p>
        <p>我在意的是，用户能不能保留自己运行软件的选择。自己部署当然要花时间，还要承担维护的麻烦；有人愿意付费交给服务方处理，也很合理。允许自行部署，让不同需求的人有机会选择不同做法。</p>
        <p>这里说的免费获取，是我对这套做法的设想。<a href="https://opensource.org/osd" target="_blank" rel="noreferrer">开源定义</a>允许软件出售，使用和再分发的条件仍要看具体许可证。讨论 SnS 时，我希望把这些条件写清楚，让用户知道自己可以做哪些事。</p>
        <p>维护的钱从哪里来？源代码开放以后，开发者还是要修错误，服务方也要承担运行成本。我想继续讨论，怎样让这些工作得到报酬，同时保留用户部署、修改和迁移的自由。</p>
      </>
    ),
    previous: "revek-boss",
  },
];

export const articleBySlug = new Map(articles.map((article) => [article.slug, article]));

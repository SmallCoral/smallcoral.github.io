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
    title: "Coral Launcher：用 AI 圆一个 Minecraft 启动器的旧梦",
    summary: "从旧日的 Minecraft 启动器执念出发，用 Tauri、React、TypeScript 和 Rust 做出一个真正能运行的桌面客户端。",
    cover: "/images/coral-launcher-cover.png",
    coverAlt: "Coral Launcher 界面封面",
    tags: ["Minecraft", "启动器", "Tauri", "Rust", "AI 辅助开发"],
    links: [
      { label: "GitHub", href: "https://github.com/SmallCoral/coral-launcher" },
      { label: "项目说明", href: "https://github.com/SmallCoral/coral-launcher#readme" },
    ],
    body: (
      <>
        <p>最开始接触编程的时候，我很大一部分动力来自 Minecraft。那时候总觉得，能写一个自己的启动器、能把游戏版本、资源文件、登录和启动流程全部串起来，是一件很酷也很遥远的事。后来学的东西越来越多，真正要做的项目也越来越杂，这个念头反而被放到了很后面。</p>
        <p>直到现在，有了 AI 辅助开发，我又把这个旧想法翻了出来。Coral Launcher 就是在这种背景下诞生的：它不是一个网页玩具，而是一款基于 Tauri 2、React、TypeScript 和 Rust 构建的桌面端 Minecraft Java 版启动器。React 负责界面，Rust 负责文件、网络、校验、解压、认证和进程启动，最后打包成 Windows 上可以直接运行的 exe。</p>
        <h2>为什么选 Tauri</h2>
        <p>做启动器并不只是画几个按钮。它需要访问本地文件系统，需要下载大量文件，需要校验 SHA1 和文件大小，需要解压原生库，还要把 Java 命令行拼对并启动进程。Tauri 的好处是界面层可以继续用熟悉的前端技术，底层能力交给 Rust，而且不需要捆绑完整 Chromium，成品体积和桌面应用的感觉都会更舒服。</p>
        <p>这个项目的技术栈最终定成了 React 18 + TypeScript 5 + Vite 5 做前端，Tauri 2 做桌面框架，Rust 后端用 reqwest、tokio、sha1、md5、zip 等库处理网络和文件。这样的分工很清晰：前端负责把版本、账号、模组和设置展示出来，后端负责真正会影响系统状态的工作。</p>
        <h2>它现在能做什么</h2>
        <p>目前 Coral Launcher 已经能从 BMCLAPI 获取 Minecraft 版本列表，失败时回退到 Mojang/Piston 官方元数据源。下载版本时，它会处理版本清单、客户端 jar、libraries、natives、asset index 和资源文件，并且支持重试、镜像回退、大小校验、SHA1 校验，以及并行下载。</p>
        <p>账号方面，它支持 Microsoft 设备码登录，不需要用户手动填 Client ID；登录后会完成 Xbox Live、XSTS 和 Minecraft Services 的认证流程，检查游戏资格并读取角色信息。为了方便本地测试和离线服务器，也保留了离线模式，并按 OfflinePlayer 规则生成 UUID。</p>
        <p>模组部分接入了 Modrinth API，可以按游戏版本和加载器搜索 Fabric、Forge、Quilt、NeoForge 相关模组，并把文件安装到实例的 mods 目录。启动部分则会根据版本元数据、账号信息、Java 设置和内存设置拼出命令行，同时把敏感 token 从预览命令里隐藏掉。</p>
        <h2>真正麻烦的地方</h2>
        <p>写启动器最容易低估的是“细节数量”。Minecraft 的版本元数据、资源索引、库规则、原生库、不同系统的路径、Java 大版本、Microsoft 登录链路，每一块单独看都不算神秘，但全部串起来以后，任何一个小字段处理错都会让启动失败，而且错误原因经常不直观。</p>
        <p>比如下载不是简单地把 URL 保存下来。要考虑国内镜像和官方源的回退，要控制并发，要校验文件是否已经完整存在，要把 natives 解压到正确目录。再比如登录也不是拿到一个 access token 就结束，中间还要经过 Xbox Live、XSTS，再换到 Minecraft Services，最后才能得到游戏内真正可用的资料。</p>
        <h2>AI 在这个项目里的位置</h2>
        <p>这个项目对我来说最重要的并不是“AI 写了多少代码”，而是它降低了把想法落地的启动成本。过去一个人做完整桌面应用，很容易被某一块不熟的技术卡住；现在可以让 AI 帮忙整理接口、拆任务、补样板代码、定位错误，然后我再根据实际运行结果去判断、修改和取舍。</p>
        <p>AI 不是替我决定项目该长什么样的东西。真正重要的仍然是我要做什么、我能不能看懂它写的代码、我能不能在出错时继续往下查。Coral Launcher 更像是一次验证：当工具足够强时，很多以前“也许以后再做”的想法，真的可以被重新捡起来。</p>
        <h2>后面还想继续补什么</h2>
        <p>接下来我想继续完善加载器安装，把 Fabric、Quilt、Forge、NeoForge 的安装流程做得更完整；也想把 refresh token 从普通 JSON 文件迁移到系统密钥链或 Tauri Stronghold。Java 运行时自动发现和下载、断点续传、更细的下载进度，也都是启动器体验里很值得补的部分。</p>
        <p>不管最后它会发展到什么程度，Coral Launcher 已经完成了最重要的一步：它把我刚入行时的一个念头，变成了一个能实际运行的桌面程序。这种感觉很难用“效率提升”四个字概括。它更像是回头对过去的自己说：这个坑，我们终于开始填了。</p>
      </>
    ),
    previous: "daplink-stm32",
  },
  {
    slug: "daplink-stm32",
    path: "/blog/DAPLink-STM32.html",
    index: "04",
    kicker: "Embedded · CMSIS-DAP · USB HID",
    title: "从 0 开始制作一个 STM32 DAPLink",
    summary: "从一个“能不能自己做调试器”的念头开始，记录 USB、HID、CMSIS-DAP 和 OpenOCD 一路踩坑的过程。",
    cover: "/images/resource/blog-3.png",
    coverAlt: "STM32 DAPLink 开发记录封面",
    tags: ["嵌入式", "STM32", "DAPLink", "调试器"],
    links: [{ label: "GitHub", href: "https://github.com/SmallCoral/coral-dap" }],
    body: (
      <>
        <p>这东西一开始真不是我计划要做的。当时我还在老老实实写 STM32，小项目那种：点灯、串口、OLED、传感器，一步一步往上走。调试器对我来说就是“下载程序的工具”，插上能用就行。直到有一天我突然想到一件事：我现在用的 ST-Link，这玩意本身不也是个单片机吗？然后事情就开始不对劲了。</p>
        <p>一开始真的只是想试试：能不能自己做一个。没想做多好，也没觉得能做成，就是单纯好奇。然后去查资料，第一次看到 DAPLink、CMSIS-DAP 这些东西，说实话是懵的。文档一堆，但没有一个是“从零教你做”的，全是协议、结构体、接口定义，当时的感觉就是：字都认识，但完全不知道在干嘛。</p>
        <p>后来我干脆不管了，直接开始写。我选了一个带 USB 的 STM32，想着先把设备搞出来，结果第一关就卡在 USB 上。我之前只用过串口，对 USB 基本等于不会，CubeMX 虽然能生成代码，但你根本不知道它在干嘛。最离谱的是设备插上电脑一点反应都没有，没有报错，没有提示，就像没插一样。那段时间只能一点点查，从描述符、HID 到各种长度限制慢慢补，中间踩了很多坑，比如少一个字段设备直接消失，长度不对系统直接无视你。基本就是：改代码，插上，没反应，再改。</p>
        <p>后来某一次，设备终于被识别成了一个 HID。虽然什么都不能做，但那一刻还是挺爽的，至少说明这东西“活了”。但我很快发现事情远没结束，DAPLink 不是“能通信就行”，上面还有一整套协议要自己实现，要解析数据、按格式回数据，而且你写完之后还不知道自己写得对不对。</p>
        <h2>真正卡住我的是 OpenOCD</h2>
        <p>我当时直接跑：</p>
        <pre><code>openocd -f interface/cmsis-dap.cfg -f target/stm32f1x.cfg</code></pre>
        <p>然后要么报错，要么卡住，有时候甚至一点输出都没有。那种感觉很难受：设备有了，通信也通了，但就是用不了。我那段时间基本把能试的都试了，查日志、看 /proc、怀疑驱动、怀疑板子，甚至怀疑是不是自己哪一步完全搞错了。最离谱的一次是 struct 对齐问题，代码看起来完全没问题，但数据已经错位了，这种问题卡了一整天。</p>
        <p>后来某一次再跑 openocd，它突然开始正常输出了，没有报错，开始识别设备、初始化接口，然后成功连上目标 STM32。当时其实是愣了一下，因为前面失败太多次了，有点不太敢信。</p>
        <h2>回头看</h2>
        <p>现在回头看，这一段时间其实不是在“写一个项目”，而是在一点点把整条链路走了一遍：USB 是怎么工作的，HID 怎么传数据，调试器是怎么控制芯片的。写代码反而是最不难的部分，难的是你根本不知道你在实现什么。</p>
        <p>最后做出来的东西其实很简单：能识别，能连接，能调试。跟成熟的调试器肯定没法比，但感觉完全不一样，以前是会用工具，现在是知道它是怎么来的。如果非要总结一下，大概就是：一开始只是想试试，结果越陷越深。</p>
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
    summary: "一个轻量 Lua 模组，清理掉在地上的废弃弹药，尽量不打扰原版体验。",
    cover: "/images/resource/blog-4.png",
    coverAlt: "潜渊症自动清理地上的空弹匣封面",
    tags: ["潜渊症", "自制模组", "自动清理", "Lua"],
    links: [
      { label: "创意工坊", href: "https://steamcommunity.com/sharedfiles/filedetails/?id=3690720502" },
      { label: "GitHub", href: "https://github.com/SmallCoral/EmptyMagazineCleaner" },
    ],
    body: (
      <>
        <p>一个用于 <strong>Barotrauma</strong> 的轻量 Lua 模组。会自动清理掉在地上的空弹匣、空弹药箱，以及部分已经耗尽的轨道炮弹和深水炸弹，减少潜艇内部杂物堆积。</p>
        <h2>功能</h2>
        <ul>
          <li>清理空弹匣。</li><li>清理空弹药箱。</li><li>清理部分已耗尽的轨道炮弹。</li><li>清理部分已耗尽的深水炸弹和诱饵弹药。</li><li>仅处理掉在地上的废弃物品。</li><li>不清理背包、容器和正常可用弹药。</li>
        </ul>
        <h2>设计目标</h2>
        <p>这个模组的目标不是改动平衡，也不是增加新内容。它只是解决一个很烦人的小问题：打完后的废弃弹药会一直留在地上，占地方，也影响整洁。</p>
        <p>因此，这个模组专注于自动化清理、尽量低侵入、尽量避免误删，并保持原版体验。</p>
        <h2>依赖</h2>
        <ul><li>Lua For Barotrauma。</li></ul>
        <h2>安装方法</h2>
        <p>将模组放入 <code>Barotrauma/LocalMods/</code> 目录，并在游戏内容包列表中启用。确保已经正确安装并启用 <strong>Lua For Barotrauma</strong>。</p>
        <h2>适用范围</h2>
        <ul><li>单人游戏。</li><li>本地主机。</li><li>使用 Lua For Barotrauma 的环境。</li></ul>
        <h2>说明</h2>
        <p>本模组只会清理掉在地上的、已明显耗尽的废弃弹药物品。不会处理背包、柜子或仍可正常使用的弹药。</p>
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
    summary: "把《空洞骑士》灵魂沼地的守护者改造成 Boss 战，整理技能、打法与剧情触发。",
    cover: "/images/resource/blog-2.jpg",
    coverAlt: "瑞维克 BOSS 战设计封面",
    tags: ["游戏", "空洞骑士", "Boss 设计", "梦之钉"],
    body: (
      <>
        <p>突发奇想感觉瑞维克可以做成一个 Boss，于是把目前的构思整理下来。瑞维克（Revek）是《空洞骑士》中灵魂沼地的鬼魂守护者，在灵魂沼地对他使用梦之钉即可进入他的梦境并与之战斗。</p>
        <h2>场景布置</h2>
        <p>初步构想为灵魂沼地的背景，中央坐落着一颗巨大的低语之根，下方是他所守护的鬼魂居民剪影。</p>
        <h2>行动模式</h2>
        <p>除了冲刺斩与噬魂爆炸的伤害为两格面具之外，其他伤害都为一格面具。</p>
        <ul>
          <li>冲刺斩：连续三下从不同方向进行冲刺斩，每次造成两格面具伤害，冲刺间隔接近无上辐光的光辐射节奏。</li>
          <li>剑波：以瑞维克为中心，向小骑士方向释放一道横跨屏幕的剑波，造成一格面具伤害。</li>
          <li>噬魂治疗：若小骑士的灵魂大于等于 33，则消耗 33 点灵魂为自己恢复生命，并产生范围爆炸；此时使用梦之钉可打断噬魂并造成大量伤害。</li>
          <li>格挡：距离过近时摆出防御姿态，防御正面、向上和向下的骨钉与法术攻击；若格挡成功，会向前刺击并覆盖约 50% 场地。</li>
          <li>下刺：传送到小骑士上方向下猛砸，并向左右产生冲击波。</li>
          <li>骨钉刺击：在场地随机位置生成三根骨钉射向小骑士，每根骨钉间隔 0.5 到 1 秒。</li>
        </ul>
        <h2>打法策略</h2>
        <ul>
          <li>瑞维克是少数能用梦之钉造成伤害的 Boss。普通梦之钉造成 33 点伤害，搭配舞梦者后提升为 66 点。</li>
          <li>噬魂治疗的前摇略大于舞梦者梦之钉的挥动时间，需要选择合适时机打断。</li>
          <li>下刺存在可观察的时间间隔，可以搭配下砸反击，萨满之石能进一步提高收益。</li>
          <li>冲刺斩与骨钉刺击可以通过黑冲或下砸躲避，冲刺斩也可通过拼刀免除伤害。</li>
        </ul>
        <h2>硬直条件</h2>
        <p>瑞维克只能通过梦之钉进入硬直，持续 3 秒。硬直过程中，骨钉与法术无法对其造成伤害，但仍可为小骑士回魂；再次使用梦之钉会造成伤害并取消硬直。</p>
        <blockquote>使用梦之钉次数：3 次。</blockquote>
        <h2>神居文案</h2>
        <ul><li>“我守护着沼池边的墓地”。</li><li>“强大与忠诚的灵魂守护神”。</li></ul>
        <h2>生命值</h2>
        <ul><li>调谐级：950。</li><li>进升级：950。</li><li>辐辉级：950。</li></ul>
        <h2>梦语</h2>
        <ul><li>守护……这片安息之地。</li><li>彼岸的……花海。</li><li>保护，终生的使命。</li></ul>
        <h2>游戏剧情</h2>
        <ul>
          <li>初次见到瑞维克时，他会像原版一样警告小骑士；如果伤害鬼魂居民，就要面对恶果。</li>
          <li>对墓地中的其他所有鬼魂使用梦之钉后，瑞维克会沮丧地表示自己忘记了一项重要使命。再次对他使用梦之钉，他会消失；回到灵魂沼地后，在他的位置使用梦之钉即可进入 Boss 战。</li>
          <li>如果小骑士携带娇嫩的花进入战斗，战斗中花不会损毁。失败后小骑士退出梦境并且花被损毁；胜利后，灵魂沼地开满娇嫩的花，除瑞维克外所有鬼魂居民重新出现。</li>
        </ul>
        <h2>其他信息</h2>
        <ul><li>瑞维克的骨钉刺击来源于灵魂沼池一位鬼魂居民，百钉战士的三根骨钉。</li><li>这个 Boss 战灵感来自突发奇想，目前偏设计文档，实际 Mod 化还需要补实现。</li></ul>
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
    summary: "关于软件本体、开源部署权和服务价值之间关系的一段思考。",
    cover: "/images/resource/blog-1.jpg",
    coverAlt: "Software Not Service 封面",
    tags: ["科技", "软件", "开源", "服务"],
    body: (
      <>
        <p>Software Not Service 指在自由开源的情况下，软件本身主要作为提供服务的平台和技术渠道，而不是被单独售卖的商品。</p>
        <p>比如一款游戏软件，所有人都可以自由免费地获取源代码，并将它部署或进行改编；服务方不靠售卖软件本体收费，而是通过它提供真正有价值的运行、维护、社区或内容服务。</p>
        <h2>核心想法</h2>
        <p>软件本身自由开放，人人都拥有部署、改编并基于其提供服务的权利，这是 SnS 的两个前提。价值不消失，只是从“软件拷贝”转向“持续服务”。</p>
        <h2>适合讨论的问题</h2>
        <ul><li>开源软件如何持续维护。</li><li>软件本体与服务体验如何分离。</li><li>用户是否真正拥有部署和迁移的自由。</li></ul>
      </>
    ),
    previous: "revek-boss",
  },
];

export const articleBySlug = new Map(articles.map((article) => [article.slug, article]));

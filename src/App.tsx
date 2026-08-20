import { useEffect, useMemo, useRef, useState } from "react";
import { articleBySlug, articles, type Article } from "./articles";
import { Arrow, Footer, SiteNav } from "./SiteChrome";

type AppProps = {
  articleSlug?: string;
};

type Friend = {
  label?: string;
  name: string;
  url: string;
  avatar?: string;
  tags?: string[];
  group?: "friend" | "resource";
  description: string;
};

const fallbackFriends: Friend[] = [
  {
    label: "GitHub",
    name: "SmallCoral",
    url: "https://github.com/SmallCoral",
    tags: ["personal", "code"],
    group: "resource",
    description: "代码、硬件和杂项项目的主要归档地。",
  },
  {
    label: "Hardware",
    name: "OSHWHub",
    url: "https://oshwhub.com/smallcoral/",
    tags: ["hardware", "personal"],
    group: "resource",
    description: "电路与板子项目，会把硬件相关内容放在这里。",
  },
  {
    label: "Video",
    name: "Bilibili",
    url: "https://space.bilibili.com/517434964",
    tags: ["personal", "video"],
    group: "resource",
    description: "视频账号入口，适合放过程记录和整活内容。",
  },
  {
    label: "Study",
    name: "CS 自学指南",
    url: "https://csdiy.wiki/",
    tags: ["study"],
    group: "resource",
    description: "计算机自学路线与课程资料导航。",
  },
];

const filterLabels = [
  ["all", "全部"],
  ["personal", "个人"],
  ["hardware", "硬件"],
  ["study", "学习"],
] as const;

function SectionTitle({ eyebrow, title, note }: { eyebrow: string; title: string; note?: string }) {
  return (
    <div className="section-title">
      <div><span>{eyebrow}</span><h2>{title}</h2></div>
      {note && <p>{note}</p>}
    </div>
  );
}

function SignalConsole() {
  const consoleRef = useRef<HTMLDivElement>(null);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const card = consoleRef.current;
    if (!card || event.pointerType === "touch") return;
    const bounds = card.getBoundingClientRect();
    const rotateX = ((event.clientY - bounds.top) / bounds.height - 0.5) * -7;
    const rotateY = ((event.clientX - bounds.left) / bounds.width - 0.5) * 7;
    card.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
    card.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
  }

  function resetTilt() {
    consoleRef.current?.style.setProperty("--tilt-x", "0deg");
    consoleRef.current?.style.setProperty("--tilt-y", "0deg");
  }

  return (
    <div
      ref={consoleRef}
      className="hero-console"
      aria-label="BH6TAW 电台状态卡"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
    >
      <div className="console-head"><span>Station identity</span><b>ON AIR</b></div>
      <div className="console-cover">
        <img src="/images/gallery/8.jpg" alt="夜晚水面与灯光" />
        <div className="console-gradient" />
        <p>CALLSIGN</p><strong>BH6TAW</strong>
      </div>
      <div className="signal-wave" aria-hidden="true">
        {[22, 38, 68, 44, 82, 56, 31, 73, 92, 48, 64, 27, 51, 76, 39, 60].map((height, index) => (
          <i key={index} style={{ height: `${height}%` }} />
        ))}
      </div>
      <div className="console-meta"><span>QTH / 湖北宜昌</span><span>73 DE BH6TAW</span></div>
    </div>
  );
}

function PostShowcase() {
  const [activeSlug, setActiveSlug] = useState(articles[0].slug);
  const activeArticle = articleBySlug.get(activeSlug) ?? articles[0];

  return (
    <div className="post-showcase" data-reveal>
      <a className="showcase-visual" href={activeArticle.path} key={`${activeSlug}-visual`}>
        <img src={activeArticle.cover} alt={activeArticle.coverAlt} />
        <span className="showcase-index">LOG {activeArticle.index}</span>
        <span className="showcase-open">阅读文章 <Arrow /></span>
      </a>
      <div className="showcase-copy" key={`${activeSlug}-copy`}>
        <p>{activeArticle.kicker}</p>
        <h3><a href={activeArticle.path}>{activeArticle.title}</a></h3>
        <span>{activeArticle.summary}</span>
        <a className="showcase-button" href={activeArticle.path}>进入这篇日志 <Arrow /></a>
      </div>
      <div className="showcase-tabs" role="tablist" aria-label="切换文章">
        {articles.map((article) => (
          <button
            key={article.slug}
            type="button"
            role="tab"
            aria-selected={activeSlug === article.slug}
            className={activeSlug === article.slug ? "active" : ""}
            onClick={() => setActiveSlug(article.slug)}
          >
            <span>{article.index}</span><strong>{article.title}</strong><i aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}

type ExplorePanelName = "station" | "gallery" | "friends";

const exploreMeta: Record<ExplorePanelName, { index: string; eyebrow: string; title: string; note: string }> = {
  station: { index: "02", eyebrow: "Radio station", title: "调到我的频率", note: "拖动频率旋钮，看看信号面板如何回应。" },
  gallery: { index: "03", eyebrow: "Captured fragments", title: "翻阅水族馆碎片", note: "不再把所有照片一起铺开，像翻唱片一样逐张浏览。" },
  friends: { index: "04", eyebrow: "Friendly frequencies", title: "交换一个坐标", note: "搜索、筛选并找到同一片网络里的朋友。" },
};

function StationPanel() {
  const [frequency, setFrequency] = useState(145);
  const isEasterEggLocked = Math.abs(frequency - 145.55) < 0.0005;
  const signal = isEasterEggLocked ? 100 : Math.max(18, 88 - Math.abs(frequency - 145.55) * 36);

  function nudge(amount: number) {
    setFrequency((current) => Math.min(148, Math.max(144, Number((current + amount).toFixed(3)))));
  }

  return (
    <div className="station-panel">
      <div className="station-copy">
        <p className="section-index">BH6TAW / QTH 湖北宜昌</p>
        <h3>听见空气里<br />看不见的连接。</h3>
        <p>电台呼号和代码仓库、硬件项目一样，都是“我真实做过什么”的一部分。试着调到 145.550 MHz，触发本站的信号彩蛋；它只是交互演示，不代表固定守听或中继频点。</p>
        <div className="station-facts">
          <div><span>CALLSIGN</span><strong>BH6TAW</strong></div>
          <div><span>QTH</span><strong>湖北宜昌</strong></div>
          <div><span>SIGN OFF</span><strong>73</strong></div>
        </div>
      </div>
      <div className={isEasterEggLocked ? "radio-panel interactive-radio locked" : "radio-panel interactive-radio"}>
        <div className={isEasterEggLocked ? "radio-screen locked" : "radio-screen"}>
          <div><span>FREQUENCY</span><strong>{frequency.toFixed(3)}</strong><small>MHz</small></div>
          <p>{isEasterEggLocked ? "SIGNAL LOCKED · BH6TAW" : signal > 55 ? "TUNING… SIGNAL FOUND" : "CQ CQ CQ · SEARCHING"}</p>
          <div className="signal-meter"><i style={{ width: `${signal}%` }} /></div>
          {isEasterEggLocked && (
            <div className="station-easter-egg" role="status" aria-live="polite">
              <span>DE BH6TAW · 73</span>
              <b>同频相遇，欢迎来到 SmallCoral 的水族馆。</b>
              <small>愿你总能越过噪声，找到愿意回应的信号。</small>
            </div>
          )}
        </div>
        <div className="tuner-control">
          <button type="button" onClick={() => nudge(-0.025)} aria-label="降低频率">−</button>
          <input
            aria-label="电台频率"
            type="range"
            min="144"
            max="148"
            step="0.025"
            value={frequency}
            onChange={(event) => setFrequency(Number(event.target.value))}
          />
          <button type="button" onClick={() => nudge(0.025)} aria-label="提高频率">＋</button>
        </div>
        <div className="radio-labels"><span>144.000</span><span>TUNE</span><span>148.000</span></div>
        <div className="radio-band-note">
          <span>CHINA MAINLAND · 2 M BAND</span>
          <p>144–146 MHz：业余 / 卫星业余；146–148 MHz：含业余业务，并与其他业务共用。</p>
          <small>频率划分不等同于发射许可，实际操作以电台执照、操作权限及当地协调要求为准。</small>
          <a className="radio-lookup-link" href="/frequency/">打开频率查询页 <Arrow /></a>
        </div>
      </div>
    </div>
  );
}

const galleryItems = [
  { src: "/images/gallery/1.jpg", label: "Night walk", index: "01" },
  { src: "/images/gallery/2.jpg", label: "Signal source", index: "02" },
  { src: "/images/gallery/3.jpg", label: "Small discovery", index: "03" },
  { src: "/images/gallery/114514.jpg", label: "Archive oddity", index: "04" },
];

function GalleryPanel() {
  const [selected, setSelected] = useState(0);
  const item = galleryItems[selected];

  function move(direction: number) {
    setSelected((current) => (current + direction + galleryItems.length) % galleryItems.length);
  }

  return (
    <div className="gallery-browser">
      <figure className="gallery-preview" key={item.src}>
        <img src={item.src} alt={`水族馆碎片 ${item.index}`} />
        <figcaption><span>{item.index} / 04</span><strong>{item.label}</strong></figcaption>
        <div className="gallery-controls">
          <button type="button" onClick={() => move(-1)} aria-label="上一张照片">←</button>
          <button type="button" onClick={() => move(1)} aria-label="下一张照片">→</button>
        </div>
      </figure>
      <div className="gallery-thumbs" role="tablist" aria-label="选择照片">
        {galleryItems.map((galleryItem, index) => (
          <button
            key={galleryItem.src}
            type="button"
            role="tab"
            aria-selected={selected === index}
            className={selected === index ? "active" : ""}
            onClick={() => setSelected(index)}
          >
            <img src={galleryItem.src} alt="" loading="lazy" /><span>{galleryItem.index}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ExploreDeck() {
  const [active, setActive] = useState<ExplorePanelName>(() => {
    const hash = window.location.hash.slice(1);
    return hash === "gallery" || hash === "friends" ? hash : "station";
  });
  const stageRef = useRef<HTMLDivElement>(null);
  const meta = exploreMeta[active];

  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash.slice(1);
      if (hash === "station" || hash === "gallery" || hash === "friends") setActive(hash);
    };
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  function selectPanel(panel: ExplorePanelName) {
    setActive(panel);
    window.history.replaceState(null, "", `#${panel}`);
  }

  function updateGlow(event: React.PointerEvent<HTMLDivElement>) {
    const stage = stageRef.current;
    if (!stage) return;
    const bounds = stage.getBoundingClientRect();
    stage.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
    stage.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
  }

  return (
    <section className="section explore-section" id="explore">
      <div className="shell">
        <div className="explore-heading" data-reveal>
          <div key={active}><span>{meta.index} / {meta.eyebrow}</span><h2>{meta.title}</h2></div>
          <p>{meta.note}</p>
        </div>
        <div className="explore-tabs" role="tablist" aria-label="切换探索内容" data-reveal>
          {(["station", "gallery", "friends"] as ExplorePanelName[]).map((panel) => (
            <button
              id={panel}
              key={panel}
              type="button"
              role="tab"
              aria-selected={active === panel}
              className={active === panel ? "active" : ""}
              onClick={() => selectPanel(panel)}
            >
              <span>{exploreMeta[panel].index}</span><strong>{panel === "station" ? "电台" : panel === "gallery" ? "碎片" : "友链"}</strong><i />
            </button>
          ))}
        </div>
        <div className="explore-stage" data-panel={active} ref={stageRef} onPointerMove={updateGlow} data-reveal>
          <div className={`explore-panel ${active === "station" ? "active" : ""}`} aria-hidden={active !== "station"}><StationPanel /></div>
          <div className={`explore-panel ${active === "gallery" ? "active" : ""}`} aria-hidden={active !== "gallery"}><GalleryPanel /></div>
          <div className={`explore-panel ${active === "friends" ? "active" : ""}`} aria-hidden={active !== "friends"}><FriendPanel /></div>
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.12 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-page">
      <header className="home-hero" id="top">
        <SiteNav />
        <div className="hero-grid shell">
          <div className="hero-copy">
            <div className="live-badge"><i /> BH6TAW · Signal online</div>
            <p className="overline">Embedded systems / radio / field notes</p>
            <h1>把好奇心<br />接入<span>现实世界。</span></h1>
            <p className="hero-lead">这里是 SmallCoral 的个人水族馆。电子、代码、Minecraft、游戏设计和无线电信号，在同一张持续扩展的工作台上相遇。</p>
            <div className="hero-actions">
              <a className="button primary" href="#posts">开始阅读 <span>↓</span></a>
              <a className="button ghost" href="https://github.com/SmallCoral" target="_blank" rel="noreferrer">查看项目 <Arrow /></a>
            </div>
          </div>

          <SignalConsole />
        </div>

        <div className="hero-stats shell">
          <div><b>05</b><span>Published logs</span></div>
          <div><b>∞</b><span>Things to explore</span></div>
          <div><b>2.4G</b><span>Radio curiosity</span></div>
          <p>SCROLL TO TUNE <span>↓</span></p>
        </div>
      </header>

      <main>
        <section className="section posts-section" id="posts">
          <div className="shell">
            <div data-reveal><SectionTitle eyebrow="01 / Field logs" title="最近写下的东西" note="一次只聚焦一篇：在右侧切换日志，减少重复卡片带来的纵向堆叠。" /></div>
            <PostShowcase />
          </div>
        </section>

        <ExploreDeck />

        <section className="contact-section" id="contact">
          <div className="shell contact-inner" data-reveal>
            <p>05 / Open channel</p>
            <h2>有信号，<br />就来打个招呼。</h2>
            <div className="contact-links">
              <a href="mailto:200503hys@gmail.com"><span>Mail</span><strong>200503hys@gmail.com</strong><Arrow /></a>
              <a href="https://github.com/SmallCoral" target="_blank" rel="noreferrer"><span>Code</span><strong>github.com/SmallCoral</strong><Arrow /></a>
              <a href="/pay/"><span>Support</span><strong>赞助 SmallCoral</strong><Arrow /></a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function FriendPanel() {
  const [friends, setFriends] = useState<Friend[]>(fallbackFriends);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [copyStatus, setCopyStatus] = useState("复制本站信息");

  useEffect(() => {
    const controller = new AbortController();

    fetch("/data/friends.json", { cache: "no-cache", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Friend list: ${response.status}`);
        return response.json() as Promise<Friend[]>;
      })
      .then((data) => Array.isArray(data) && setFriends(data))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.warn("Friend list fallback is active.");
        }
      });

    return () => controller.abort();
  }, []);

  const visibleFriends = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return friends.filter((friend) => {
      const tags = friend.tags ?? [];
      const matchesFilter = filter === "all" || tags.includes(filter);
      const haystack = `${friend.name} ${friend.description} ${friend.label ?? ""} ${tags.join(" ")}`.toLowerCase();
      return matchesFilter && (!keyword || haystack.includes(keyword));
    });
  }, [filter, friends, query]);

  const friendSites = visibleFriends.filter((friend) => friend.group === "friend" || friend.avatar);
  const resources = visibleFriends.filter((friend) => !(friend.group === "friend" || friend.avatar));

  async function copyFriendInfo() {
    const info = "站名：SmallCoral 的水族馆\n链接：https://smallcoral.github.io/\n头像：https://smallcoral.github.io/images/favicon.png\n简介：电子、代码、Minecraft、业余无线电与折腾记录。呼号 BH6TAW。";
    try {
      await navigator.clipboard.writeText(info);
      setCopyStatus("已复制 ✓");
    } catch {
      setCopyStatus("复制失败");
    }
    window.setTimeout(() => setCopyStatus("复制本站信息"), 1600);
  }

  return (
    <div className="friend-panel">
        <div className="friend-toolbar">
          <label><span>搜索友链</span><input type="search" placeholder="输入站名、标签或描述…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <div className="friend-filters" aria-label="友链筛选">
            {filterLabels.map(([value, label]) => <button key={value} className={filter === value ? "active" : ""} type="button" onClick={() => setFilter(value)}>{label}</button>)}
          </div>
        </div>

        <div className="friend-block">
          <div className="friend-block-title"><span>FRIEND LINKS</span><b>{String(friendSites.length).padStart(2, "0")}</b></div>
          <div className="friend-grid">
            {friendSites.map((friend) => <FriendCard key={friend.url} friend={friend} />)}
            <a className="friend-card invite-card" href="https://github.com/SmallCoral/smallcoral.github.io/issues/new?template=friend-link.yml" target="_blank" rel="noreferrer">
              <div className="friend-avatar">+</div><div><span>EXCHANGE</span><h3>申请友链</h3><p>通过 GitHub Issues 留下站点信息，审核后自动加入。</p></div><Arrow />
            </a>
          </div>
        </div>

        <div className="friend-block resource-block">
          <div className="friend-block-title"><span>RESOURCES</span><b>{String(resources.length).padStart(2, "0")}</b></div>
          <div className="resource-grid">{resources.map((friend) => <FriendCard key={friend.url} friend={friend} compact />)}</div>
        </div>

        <div className="friend-kit"><div><span>ADD ME</span><strong>SmallCoral 的水族馆</strong><p>smallcoral.github.io · BH6TAW</p></div><button type="button" onClick={copyFriendInfo}>{copyStatus}</button></div>
    </div>
  );
}

function FriendCard({ friend, compact = false }: { friend: Friend; compact?: boolean }) {
  const initial = Array.from(friend.name.trim())[0] || "S";
  return (
    <a className={compact ? "resource-card" : "friend-card"} href={friend.url} target="_blank" rel="noreferrer">
      {!compact && <div className="friend-avatar">{initial}{friend.avatar && <img src={friend.avatar} alt="" loading="lazy" referrerPolicy="no-referrer" />}</div>}
      <div><span>{friend.label ?? "FRIEND"}</span><h3>{friend.name}</h3><p>{friend.description}</p></div><Arrow />
    </a>
  );
}

function ArticlePage({ article }: { article: Article }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? Math.min(100, (window.scrollY / height) * 100) : 0);
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  const previous = article.previous ? articleBySlug.get(article.previous) : undefined;
  const next = article.next ? articleBySlug.get(article.next) : undefined;

  return (
    <div className="article-page">
      <div className="reading-progress" style={{ width: `${progress}%` }} />
      <header className="article-top">
        <SiteNav article />
        <div className="article-hero shell">
          <div className="article-hero-copy">
            <a className="back-link" href="/#posts">← 返回日志</a>
            <p className="overline">{article.kicker}</p>
            <h1>{article.title}</h1>
            <p className="article-deck">{article.summary}</p>
            <div className="article-meta"><span>LOG {article.index}</span><span>SMALLCORAL AQUARIUM</span></div>
          </div>
          <figure className="article-hero-image"><img src={article.cover} alt={article.coverAlt} /><figcaption>{article.kicker}</figcaption></figure>
        </div>
      </header>

      <main className="article-main shell">
        <aside className="article-aside">
          <span>IN THIS LOG</span>
          <strong>{article.index}</strong>
          <p>{article.tags.join(" · ")}</p>
          {article.links && <div className="article-resources">{article.links.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} <Arrow /></a>)}</div>}
        </aside>
        <article className="article-prose">
          {article.body}
          <div className="article-tags">{article.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
        </article>
      </main>

      <nav className="article-pagination shell" aria-label="文章切换">
        {previous ? <a href={previous.path}><span>上一篇</span><strong>{previous.title}</strong></a> : <a href="/#posts"><span>归档</span><strong>返回所有日志</strong></a>}
        {next ? <a className="next" href={next.path}><span>下一篇</span><strong>{next.title}</strong></a> : <a className="next" href="/#posts"><span>归档</span><strong>返回所有日志</strong></a>}
      </nav>
      <Footer />
    </div>
  );
}

export function App({ articleSlug }: AppProps) {
  const article = articleSlug ? articleBySlug.get(articleSlug) : undefined;
  return article ? <ArticlePage article={article} /> : <HomePage />;
}

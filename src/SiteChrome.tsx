import { useState } from "react";

export function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export function Brand() {
  return (
    <a className="brand" href="/" aria-label="SmallCoral 首页">
      <span className="brand-mark"><img src="/images/logo.svg" alt="" /></span>
      <span className="brand-copy"><strong>SmallCoral</strong><small>Personal aquarium</small></span>
    </a>
  );
}

export function SiteNav({ article = false }: { article?: boolean }) {
  const [open, setOpen] = useState(false);
  const prefix = article ? "/" : "";
  const links = [
    [`${prefix}#posts`, "日志"],
    [`${prefix}#station`, "电台"],
    ["/frequency/", "频率查询"],
    [`${prefix}#gallery`, "碎片"],
    [`${prefix}#friends`, "友链"],
  ];

  return (
    <nav className="site-nav" aria-label="主导航">
      <Brand />
      <button
        className="nav-toggle"
        type="button"
        aria-label={open ? "关闭导航" : "打开导航"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span /><span />
      </button>
      <div className={`nav-links ${open ? "is-open" : ""}`}>
        {article && <a href="/">首页</a>}
        {links.map(([href, label]) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>
        ))}
        <a className="nav-cta" href="https://github.com/SmallCoral" target="_blank" rel="noreferrer">
          GitHub <Arrow />
        </a>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner"><Brand /><p>SmallCoral Aquarium · Built from curiosity<br /><span>73 de BH6TAW</span></p><a href="#top">BACK TO TOP ↑</a></div>
    </footer>
  );
}

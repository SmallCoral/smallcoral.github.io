import { useEffect, useMemo, useRef, useState } from "react";
import frequencyData from "./data/frequency-allocations.json";
import { Arrow, Footer, SiteNav } from "./SiteChrome";

type FrequencyUnit = "kHz" | "MHz" | "GHz";

type Allocation = {
  startHz: number;
  endHz: number;
  start: number;
  end: number;
  unit: FrequencyUnit;
  primary: string[];
  secondary: string[];
  notes: string[];
  footnotes: string[];
  pdfPage: number;
  documentPage: number;
};

const allocations = frequencyData.allocations as Allocation[];
const chinaFootnotes = frequencyData.chinaFootnotes as Record<string, string>;
const unitMultipliers: Record<FrequencyUnit, number> = { kHz: 1_000, MHz: 1_000_000, GHz: 1_000_000_000 };

const quickFrequencies = [
  { value: "7.050", unit: "MHz" as const, label: "40 m" },
  { value: "14.200", unit: "MHz" as const, label: "20 m" },
  { value: "50.150", unit: "MHz" as const, label: "6 m" },
  { value: "145.550", unit: "MHz" as const, label: "2 m" },
  { value: "433.500", unit: "MHz" as const, label: "70 cm" },
  { value: "2.400", unit: "GHz" as const, label: "2.4 GHz" },
];

const serviceDescriptions: Array<[string, string]> = [
  ["卫星标准频率和时间信号", "利用卫星播发高精度频率、时间信号的业务。"],
  ["卫星航空无线电导航", "利用卫星为航空器飞行和安全运行提供导航的业务。"],
  ["卫星水上无线电导航", "利用卫星为船舶航行和安全运行提供导航的业务。"],
  ["卫星地球探测", "利用卫星获取地球及其自然现象资料的业务，可分为有源和无源。"],
  ["卫星无线电导航", "利用卫星进行定位、导航与授时的无线电测定业务。"],
  ["卫星无线电定位", "利用卫星开展除导航以外的无线电测定业务。"],
  ["卫星航空移动", "航空器上的移动地球站与空间电台之间的通信业务。"],
  ["卫星水上移动", "船舶上的移动地球站与空间电台之间的通信业务。"],
  ["卫星陆地移动", "陆地移动地球站与空间电台之间的通信业务。"],
  ["卫星固定", "位于给定位置的地球站之间通过卫星开展的通信业务。"],
  ["卫星移动", "移动地球站与一个或多个空间电台之间的通信业务。"],
  ["卫星气象", "利用卫星开展气象观测与气象数据传输的业务。"],
  ["卫星广播", "由空间电台发射、供公众直接接收的广播业务。"],
  ["卫星业余", "利用地球卫星开展自我训练、相互通信和技术研究的业余业务。"],
  ["航空无线电导航", "为航空器飞行和安全运行提供导航的业务。"],
  ["水上无线电导航", "为船舶航行和安全运行提供导航的业务。"],
  ["标准频率和时间信号", "播发规定的高精度频率或时间信号、供普遍接收的业务。"],
  ["航空移动", "航空电台与航空器电台之间，或航空器电台之间的移动业务。"],
  ["水上移动", "海岸电台与船舶电台之间，或船舶电台之间的移动业务。"],
  ["陆地移动", "基地电台与陆地移动电台之间，或陆地移动电台之间的业务。"],
  ["无线电导航", "利用无线电波测定位置、速度等参数并用于导航的业务。"],
  ["无线电定位", "用于导航以外无线电测定的业务，例如部分雷达应用。"],
  ["无线电测定", "利用无线电波传播特性测定位置、速度或其他特征的业务。"],
  ["气象辅助", "用于气象和水文观测与探测的无线电通信业务。"],
  ["空间操作", "与航天器跟踪、遥测和遥令有关的无线电通信业务。"],
  ["空间研究", "利用航天器或其他空间物体进行科学、技术研究的业务。"],
  ["射电天文", "接收来自宇宙的无线电波并用于天文学研究的业务。"],
  ["固定", "在指定固定地点之间开展的无线电通信业务。"],
  ["移动", "移动电台与陆地电台之间，或移动电台之间的通信业务。"],
  ["广播", "供公众直接接收的声音、电视或其他形式的无线电业务。"],
  ["业余", "供经批准的无线电爱好者自我训练、相互通信和技术研究的业务。"],
  ["安全", "为保障人类生命和财产安全而设置的无线电通信业务。"],
  ["特别", "为一般公益事业的特定需要设立、且不对公众通信开放的业务。"],
];

function describeService(service: string) {
  return serviceDescriptions.find(([name]) => service.startsWith(name))?.[1] ?? "具体业务定义和使用条件请查阅规定原文及相关脚注。";
}

function formatQueryFrequency(hz: number) {
  if (hz >= 1_000_000_000) return `${(hz / 1_000_000_000).toLocaleString("zh-CN", { maximumFractionDigits: 9 })} GHz`;
  if (hz >= 1_000_000) return `${(hz / 1_000_000).toLocaleString("zh-CN", { maximumFractionDigits: 6 })} MHz`;
  return `${(hz / 1_000).toLocaleString("zh-CN", { maximumFractionDigits: 3 })} kHz`;
}

function wavelengthFor(hz: number) {
  if (hz <= 0) return "∞";
  const metres = 299_792_458 / hz;
  if (metres >= 1_000) return `${(metres / 1_000).toFixed(2)} km`;
  if (metres >= 1) return `${metres.toFixed(metres >= 100 ? 1 : 2)} m`;
  if (metres >= 0.01) return `${(metres * 100).toFixed(2)} cm`;
  return `${(metres * 1_000).toFixed(2)} mm`;
}

function spectrumBand(hz: number) {
  if (hz < 3_000) return { code: "ELF", name: "极低频以下" };
  if (hz < 30_000) return { code: "VLF", name: "甚低频" };
  if (hz < 300_000) return { code: "LF", name: "低频" };
  if (hz < 3_000_000) return { code: "MF", name: "中频" };
  if (hz < 30_000_000) return { code: "HF", name: "高频 / 短波" };
  if (hz < 300_000_000) return { code: "VHF", name: "甚高频" };
  if (hz < 3_000_000_000) return { code: "UHF", name: "特高频" };
  if (hz < 30_000_000_000) return { code: "SHF", name: "超高频" };
  if (hz < 300_000_000_000) return { code: "EHF", name: "极高频" };
  return { code: "THF", name: "太赫兹频段" };
}

function AllocationTags({ title, services, kind }: { title: string; services: string[]; kind: "primary" | "secondary" }) {
  return (
    <div className={`allocation-group ${kind}`}>
      <div className="allocation-heading"><span>{kind === "primary" ? "PRIMARY" : "SECONDARY"}</span><strong>{title}</strong></div>
      {services.length > 0 ? (
        <div className="allocation-tags">
          {services.map((service) => <span key={service} title={describeService(service)}>{service}</span>)}
        </div>
      ) : <p>本频段未列出{title}。</p>}
    </div>
  );
}

function AllocationCard({ allocation }: { allocation: Allocation }) {
  const nationalFootnotes = allocation.footnotes.filter((code) => code.startsWith("CHN"));
  const internationalFootnotes = allocation.footnotes.filter((code) => !code.startsWith("CHN"));

  return (
    <article className="allocation-card">
      <header>
        <div><span>ALLOCATION RANGE</span><h3>{allocation.start}–{allocation.end} {allocation.unit}</h3></div>
        <p>表内第 {allocation.documentPage} 页</p>
      </header>
      {allocation.notes.length > 0 && <div className="allocation-alert">{allocation.notes.join(" · ")}</div>}
      <div className="allocation-columns">
        <AllocationTags title="主要业务" services={allocation.primary} kind="primary" />
        <AllocationTags title="次要业务" services={allocation.secondary} kind="secondary" />
      </div>
      {(nationalFootnotes.length > 0 || internationalFootnotes.length > 0) && (
        <div className="allocation-footnotes">
          {nationalFootnotes.map((code) => (
            <details key={code}>
              <summary><span>{code}</span> 展开中国脚注</summary>
              <p>{chinaFootnotes[code] ?? "请查阅规定原文中的中国无线电频率划分脚注。"}</p>
            </details>
          ))}
          {internationalFootnotes.length > 0 && (
            <p className="itu-footnotes"><span>ITU 脚注</span>{internationalFootnotes.join(" · ")} <small>完整适用条件请查阅原文第 3.5 节。</small></p>
          )}
        </div>
      )}
    </article>
  );
}

function allocationTone(allocation: Allocation) {
  const services = `${allocation.primary.join(" ")} ${allocation.secondary.join(" ")}`;
  if (services.includes("业余")) return "amateur";
  if (services.includes("航空")) return "aviation";
  if (services.includes("广播")) return "broadcast";
  if (services.includes("卫星") || services.includes("空间")) return "space";
  if (services.includes("无线电定位") || services.includes("无线电导航")) return "navigation";
  return "general";
}

function FrequencyRuler({ selectedHz, onSelect }: { selectedHz: number; onSelect: (allocation: Allocation) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<number | null>(null);
  const skipAutoCenterRef = useRef(false);
  const activeIndex = allocations.findIndex((allocation) => (
    allocation.startHz <= selectedHz
    && (selectedHz < allocation.endHz || (selectedHz === 3_000_000_000_000 && allocation.endHz === selectedHz))
  ));

  useEffect(() => {
    if (skipAutoCenterRef.current) {
      skipAutoCenterRef.current = false;
      return;
    }
    const track = trackRef.current;
    const item = track?.querySelector<HTMLElement>(`[data-allocation-index="${activeIndex}"]`);
    if (!track || !item) return;
    const frame = window.requestAnimationFrame(() => {
      track.scrollTo({ left: item.offsetLeft - (track.clientWidth - item.clientWidth) / 2, behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeIndex]);

  useEffect(() => () => {
    if (scrollTimerRef.current !== null) window.clearTimeout(scrollTimerRef.current);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleWheel = (event: WheelEvent) => {
      const rawDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (rawDelta === 0) return;
      const deltaScale = event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? track.clientWidth
          : 1;
      track.scrollLeft += rawDelta * deltaScale;
      event.preventDefault();
    };

    track.addEventListener("wheel", handleWheel, { passive: false });
    return () => track.removeEventListener("wheel", handleWheel);
  }, []);

  function selectCenteredAllocation() {
    const track = trackRef.current;
    if (!track) return;
    const center = track.scrollLeft + track.clientWidth / 2;
    let closestIndex = activeIndex >= 0 ? activeIndex : 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    for (const item of Array.from(track.querySelectorAll<HTMLElement>("[data-allocation-index]"))) {
      const distance = Math.abs(item.offsetLeft + item.clientWidth / 2 - center);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = Number(item.dataset.allocationIndex);
      }
    }
    const allocation = allocations[closestIndex];
    if (allocation && closestIndex !== activeIndex) {
      skipAutoCenterRef.current = true;
      onSelect(allocation);
    }
  }

  function handleScroll() {
    if (scrollTimerRef.current !== null) window.clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = window.setTimeout(selectCenteredAllocation, 120);
  }

  function selectAndCenter(allocation: Allocation, index: number) {
    skipAutoCenterRef.current = true;
    onSelect(allocation);
    const track = trackRef.current;
    const item = track?.querySelector<HTMLElement>(`[data-allocation-index="${index}"]`);
    if (track && item) track.scrollTo({ left: item.offsetLeft - (track.clientWidth - item.clientWidth) / 2, behavior: "smooth" });
  }

  function moveSelection(direction: number) {
    const nextIndex = Math.min(allocations.length - 1, Math.max(0, (activeIndex < 0 ? 0 : activeIndex) + direction));
    selectAndCenter(allocations[nextIndex], nextIndex);
  }

  return (
    <section className="frequency-ruler" aria-labelledby="ruler-title">
      <header className="ruler-heading">
        <div><span>SCROLLABLE SPECTRUM</span><h2 id="ruler-title">滚动频段尺</h2></div>
        <p>滚轮 / 拖动 / 点击频段；中央标线所指条目会自动载入。</p>
      </header>
      <div className="ruler-shell">
        <div className="ruler-marker" aria-hidden="true"><span>SELECT</span></div>
        <div
          ref={trackRef}
          className="ruler-track"
          role="listbox"
          aria-label="滚动选择频率划分区间"
          tabIndex={0}
          onScroll={handleScroll}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              event.preventDefault();
              moveSelection(event.key === "ArrowLeft" ? -1 : 1);
            }
          }}
        >
          {allocations.map((allocation, index) => {
            const active = index === activeIndex;
            const services = allocation.primary.length > 0 ? allocation.primary : allocation.secondary;
            return (
              <button
                key={`${allocation.startHz}-${allocation.endHz}-${allocation.pdfPage}`}
                type="button"
                role="option"
                aria-selected={active}
                className={active ? "ruler-segment active" : "ruler-segment"}
                data-allocation-index={index}
                data-tone={allocationTone(allocation)}
                onClick={() => selectAndCenter(allocation, index)}
              >
                <span>{String(index + 1).padStart(3, "0")}</span>
                <strong>{allocation.start}–{allocation.end}</strong>
                <small>{allocation.unit}</small>
                <p>{services.slice(0, 2).join(" · ") || allocation.notes.join(" · ")}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function FrequencyLookupPage() {
  const [input, setInput] = useState("145.550");
  const [unit, setUnit] = useState<FrequencyUnit>("MHz");
  const [frequencyHz, setFrequencyHz] = useState(145.55 * unitMultipliers.MHz);
  const [error, setError] = useState("");

  const matches = useMemo(() => allocations.filter((allocation) => (
    allocation.startHz <= frequencyHz
    && (frequencyHz < allocation.endHz || (frequencyHz === 3_000_000_000_000 && allocation.endHz === frequencyHz))
  )), [frequencyHz]);
  const band = spectrumBand(frequencyHz);

  function runQuery(nextInput = input, nextUnit = unit) {
    const parsed = Number(nextInput.trim().replace(",", "."));
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError("请输入大于或等于 0 的有效数字。");
      return;
    }
    const nextHz = parsed * unitMultipliers[nextUnit];
    if (nextHz > 3_000_000_000_000) {
      setError("本规定的频率划分范围截止到 3000 GHz。");
      return;
    }
    setError("");
    setFrequencyHz(nextHz);
  }

  function chooseQuickFrequency(value: string, nextUnit: FrequencyUnit) {
    setInput(value);
    setUnit(nextUnit);
    runQuery(value, nextUnit);
  }

  function chooseAllocation(allocation: Allocation) {
    const midpointHz = allocation.startHz + (allocation.endHz - allocation.startHz) / 2;
    const nextUnit = allocation.unit;
    const decimals = nextUnit === "kHz" ? 3 : nextUnit === "MHz" ? 6 : 9;
    setInput((midpointHz / unitMultipliers[nextUnit]).toFixed(decimals).replace(/\.?0+$/, ""));
    setUnit(nextUnit);
    setError("");
    setFrequencyHz(midpointHz);
  }

  const matchedServices = Array.from(new Set(matches.flatMap((item) => [...item.primary, ...item.secondary])));

  return (
    <div className="frequency-page" id="top">
      <header className="frequency-hero">
        <SiteNav article />
        <div className="frequency-hero-grid shell">
          <div className="frequency-hero-copy">
            <a className="back-link" href="/#station">← 返回电台</a>
            <p className="overline">BH6TAW / Spectrum field guide</p>
            <h1>无线电频率<br /><span>划分查询。</span></h1>
            <p>输入一个频率，查看它在中国内地对应的主要业务、次要业务和国内脚注。数据覆盖 0–3000 GHz，来自工业和信息化部令第 62 号。</p>
          </div>
          <div className="spectrum-orbit" aria-hidden="true">
            <div className="orbit-core"><span>LIVE QUERY</span><strong>0–3000</strong><small>GHz</small></div>
            <i /><i /><i /><i />
          </div>
        </div>
        <div className="frequency-source-strip shell">
          <span>DATASET / CHINA MAINLAND</span><strong>{frequencyData.meta.allocationCount} 个频段条目</strong><span>2023-07-01 生效</span>
        </div>
      </header>

      <main>
        <section className="frequency-workbench shell" aria-labelledby="lookup-title">
          <FrequencyRuler selectedHz={frequencyHz} onSelect={chooseAllocation} />
          <div className="lookup-panel">
            <div className="lookup-heading"><span>01 / LOOKUP</span><h2 id="lookup-title">今天想找哪段频率？</h2><p>支持 kHz、MHz 和 GHz。查询结果采用中国内地一栏，不适用于港澳地区。</p></div>
            <form className="frequency-form" onSubmit={(event) => { event.preventDefault(); runQuery(); }}>
              <label>
                <span>FREQUENCY</span>
                <input aria-label="查询频率" inputMode="decimal" value={input} onChange={(event) => setInput(event.target.value)} />
              </label>
              <label className="unit-select">
                <span>UNIT</span>
                <select aria-label="频率单位" value={unit} onChange={(event) => setUnit(event.target.value as FrequencyUnit)}>
                  <option>kHz</option><option>MHz</option><option>GHz</option>
                </select>
              </label>
              <button type="submit">查询划分 <Arrow /></button>
            </form>
            {error && <p className="frequency-error" role="alert">{error}</p>}
            <div className="quick-frequencies" aria-label="常用频率示例">
              <span>QUICK TUNE</span>
              {quickFrequencies.map((item) => (
                <button key={`${item.value}-${item.unit}`} type="button" onClick={() => chooseQuickFrequency(item.value, item.unit)}>
                  <strong>{item.value}</strong><small>{item.unit} · {item.label}</small>
                </button>
              ))}
            </div>
          </div>

          <section className="lookup-result" aria-live="polite" aria-atomic="false">
            <header className="result-console">
              <div><span>QUERY RESULT</span><strong>{formatQueryFrequency(frequencyHz)}</strong></div>
              <dl>
                <div><dt>ITU BAND</dt><dd>{band.code} · {band.name}</dd></div>
                <div><dt>WAVELENGTH</dt><dd>≈ {wavelengthFor(frequencyHz)}</dd></div>
                <div><dt>SERVICES</dt><dd>{matchedServices.length || "—"}</dd></div>
              </dl>
            </header>
            <div className="result-list">
              {matches.length > 0 ? matches.map((allocation) => (
                <AllocationCard key={`${allocation.startHz}-${allocation.endHz}-${allocation.pdfPage}`} allocation={allocation} />
              )) : (
                <div className="no-allocation"><span>NO MATCH</span><h3>没有找到对应条目</h3><p>请检查数值与单位，或换一个相邻频率重试。</p></div>
              )}
            </div>
            {matchedServices.length > 0 && (
              <section className="result-glossary" aria-labelledby="matched-glossary-title">
                <div><span>MATCHED GLOSSARY</span><h3 id="matched-glossary-title">本次结果里的业务是什么？</h3></div>
                <dl>{matchedServices.map((service) => <div key={service}><dt>{service}</dt><dd>{describeService(service)}</dd></div>)}</dl>
              </section>
            )}
          </section>
        </section>

        <section className="frequency-explainer">
          <div className="shell">
            <div className="explainer-heading"><span>02 / HOW TO READ</span><h2>查到了频段，<br />还要读懂它。</h2></div>
            <div className="explainer-grid">
              <article><span>01</span><h3>“划分”不是“指配”</h3><p>划分表示某段频谱可供哪些无线电业务使用；它不是分配给某个具体电台的工作频率，也不自动产生发射权限。</p></article>
              <article><span>02</span><h3>主要与次要业务</h3><p>方括号中的业务是次要业务。次要业务不得对主要业务造成有害干扰，也不能要求主要业务保护自己免受干扰。</p></article>
              <article><span>03</span><h3>能接收不等于能发射</h3><p>实际发射还要满足无线电台执照、操作技术能力、设备型号核准、功率限制和当地频率协调等要求。</p></article>
            </div>
          </div>
        </section>

        <section className="frequency-source">
          <div className="shell source-card">
            <div><span>03 / SOURCE & LIMITS</span><h2>依据原文，<br />但不替代原文。</h2></div>
            <div>
              <p>本工具根据《中华人民共和国无线电频率划分规定》（工业和信息化部令第 62 号）中“中国内地”栏制作。查询结果用于学习和快速定位；遇到脚注、边界频率或实际设台问题，应以工信部公布的法定文本和无线电管理机构要求为准。</p>
              <div className="source-actions">
                <a href="https://www.miit.gov.cn/gyhxxhb/jgsj/cyzcyfgs/bmgz/wxdl/art/2023/art_1e98823e689f42ca9ed14dcb6feec07a.html" target="_blank" rel="noreferrer">工信部规定页面 <Arrow /></a>
                <a href="https://www.miit.gov.cn/cms_files/filemanager/1226211233/attach/20236/9086700eed45430bafe236efd1096fd3.pdf" target="_blank" rel="noreferrer">查看完整 PDF <Arrow /></a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

import { useEffect, useState } from "react";

const THEME_KEY = "architecture-workbench-theme";

const RAMP_PALETTES = {
  blue: {
    light: { fill: "#e8f1ff", stroke: "#2f6feb", text: "#123062", mid: "#4f8dff" },
    dark: { fill: "#10213f", stroke: "#7cb2ff", text: "#e3efff", mid: "#4f8dff" },
  },
  teal: {
    light: { fill: "#e5faf3", stroke: "#198b73", text: "#0f4a43", mid: "#39c0a0" },
    dark: { fill: "#0d2d2a", stroke: "#5be0c0", text: "#dffcf6", mid: "#39c0a0" },
  },
  purple: {
    light: { fill: "#efecff", stroke: "#6f56d9", text: "#30215d", mid: "#9d85ff" },
    dark: { fill: "#21173d", stroke: "#b39cff", text: "#f0ebff", mid: "#9d85ff" },
  },
  amber: {
    light: { fill: "#fff1d8", stroke: "#b76a14", text: "#5f3508", mid: "#f2a93b" },
    dark: { fill: "#37240d", stroke: "#ffc46a", text: "#fff1dd", mid: "#f2a93b" },
  },
  coral: {
    light: { fill: "#ffebe6", stroke: "#d95f40", text: "#6a2411", mid: "#ff8c6d" },
    dark: { fill: "#371715", stroke: "#ff9b83", text: "#ffeae4", mid: "#ff8c6d" },
  },
  green: {
    light: { fill: "#edf8e6", stroke: "#4e8a2d", text: "#234616", mid: "#74c451" },
    dark: { fill: "#1a2f17", stroke: "#99df6a", text: "#ebffe0", mid: "#74c451" },
  },
  gray: {
    light: { fill: "#f2f4f7", stroke: "#6b7280", text: "#344054", mid: "#98a2b3" },
    dark: { fill: "#1d2230", stroke: "#b8c1d9", text: "#eef2ff", mid: "#98a2b3" },
  },
  pink: {
    light: { fill: "#ffedf5", stroke: "#d94f8a", text: "#70163d", mid: "#ff7cab" },
    dark: { fill: "#321221", stroke: "#ff9cc1", text: "#ffe5f0", mid: "#ff7cab" },
  },
};

const EXAMPLES = [
  "E-commerce platform for 1M users with product catalog, shopping cart, payment processing, order management, and real-time inventory.",
  "Healthcare patient portal with appointment scheduling, medical records, telemedicine video calls, prescriptions, and HIPAA compliance.",
  "Real-time collaborative code editor like VS Code Live Share with 10K concurrent users, conflict resolution, presence, and offline sync.",
];

const TABS = [
  { id: "requirements", label: "Requirements" },
  { id: "style", label: "Architecture style" },
  { id: "diagram", label: "Diagram" },
  { id: "components", label: "Components" },
  { id: "patterns", label: "Patterns & NFRs" },
  { id: "reasoning", label: "Reasoning" },
];

const typeToRamp = (type) =>
  (
    {
      Service: "blue",
      Database: "purple",
      Queue: "amber",
      Cache: "teal",
      Gateway: "teal",
      Frontend: "pink",
      External: "gray",
      "Load Balancer": "coral",
      Storage: "purple",
      Microservice: "blue",
      API: "teal",
    }[type] || "blue"
  );

const nfrToRamp = (category) =>
  (
    {
      Performance: "amber",
      Security: "coral",
      Scalability: "blue",
      Reliability: "green",
      Maintainability: "purple",
      Usability: "pink",
    }[category] || "blue"
  );

const patToRamp = (category) =>
  (
    {
      Structural: "blue",
      Behavioral: "green",
      Integration: "amber",
      Data: "purple",
    }[category] || "teal"
  );

const layerToRamp = (name) =>
  (
    {
      Presentation: "pink",
      "API Gateway": "teal",
      "Business Logic": "blue",
      Data: "purple",
      Infrastructure: "green",
    }[name] || "gray"
  );

function getRamp(name, theme) {
  const palette = RAMP_PALETTES[name] || RAMP_PALETTES.blue;
  return palette[theme] || palette.dark;
}

function getInitialTheme() {
  if (typeof window === "undefined") {
    return "dark";
  }

  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function setActiveResult(parsed, setResult, setSelectedComponent, setTab) {
  setResult(parsed);
  setSelectedComponent(parsed.components?.[0] ?? null);
  setTab("requirements");
}

function LogoMark() {
  return (
    <svg width="42" height="42" viewBox="0 0 42 42" fill="none" aria-hidden="true">
      <rect x="0.5" y="0.5" width="41" height="41" rx="14" fill="url(#logo-bg)" />
      <path d="M10 12.75H18V19.75H10V12.75Z" fill="url(#logo-blue)" />
      <path d="M24 12.75H32V19.75H24V12.75Z" fill="url(#logo-purple)" />
      <path d="M17 23H25V30H17V23Z" fill="url(#logo-green)" />
      <path d="M18 19.75L21 23" stroke="#75AAFF" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M24 19.75L21 23" stroke="#A691FF" strokeWidth="1.6" strokeLinecap="round" />
      <defs>
        <linearGradient id="logo-bg" x1="4" y1="4" x2="37" y2="37" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0E1424" />
          <stop offset="1" stopColor="#1A2440" />
        </linearGradient>
        <linearGradient id="logo-blue" x1="10" y1="12.75" x2="18" y2="19.75" gradientUnits="userSpaceOnUse">
          <stop stopColor="#79B3FF" />
          <stop offset="1" stopColor="#4D84F7" />
        </linearGradient>
        <linearGradient id="logo-purple" x1="24" y1="12.75" x2="32" y2="19.75" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C0ABFF" />
          <stop offset="1" stopColor="#8E71FF" />
        </linearGradient>
        <linearGradient id="logo-green" x1="17" y1="23" x2="25" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#78E3C2" />
          <stop offset="1" stopColor="#27B892" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function ThemeToggleButton({ theme, onToggle }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="icon-toggle"
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 4.75V2.5M12 21.5v-2.25M6.88 6.88 5.29 5.29M18.71 18.71l-1.59-1.59M4.75 12H2.5M21.5 12h-2.25M6.88 17.12l-1.59 1.59M18.71 5.29l-1.59 1.59M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M20 14.5A7.5 7.5 0 0 1 9.5 4a8.75 8.75 0 1 0 10.5 10.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

function SectionLabel({ label }) {
  return <p className="section-label">{label}</p>;
}

function Tag({ label, ramp, theme, size = "sm" }) {
  const colors = getRamp(ramp, theme);

  return (
    <span
      className={`tag tag--${size}`}
      style={{
        "--tag-bg": colors.fill,
        "--tag-border": colors.stroke,
        "--tag-text": colors.text,
      }}
    >
      {label}
    </span>
  );
}

function MetricTile({ label, value, ramp, theme }) {
  const colors = getRamp(ramp, theme);

  return (
    <div
      className="metric-tile"
      style={{
        "--metric-bg": colors.fill,
        "--metric-border": colors.stroke,
        "--metric-text": colors.text,
      }}
    >
      <span className="metric-tile__value">{value}</span>
      <span className="metric-tile__label">{label}</span>
    </div>
  );
}

function RequirementCard({ item, ramp, badge, theme }) {
  const colors = getRamp(ramp, theme);

  return (
    <article
      className="card requirement-card"
      style={{
        "--accent-stroke": colors.stroke,
        "--accent-fill": colors.fill,
      }}
    >
      <div className="requirement-card__header">
        <div>
          <div className="requirement-card__eyebrow">{item.id}</div>
          <h3 className="requirement-card__title">{item.title}</h3>
        </div>
        {badge ? <Tag label={badge} ramp={ramp} theme={theme} /> : null}
      </div>
      <p className="card-copy">{item.description}</p>
    </article>
  );
}

function ComponentDetail({ component, allComponents, theme }) {
  const rampName = typeToRamp(component.type);
  const colors = getRamp(rampName, theme);
  const dependencies = (component.dependencies || [])
    .map((id) => allComponents.find((candidate) => candidate.id === id)?.name || id)
    .filter(Boolean);

  return (
    <article
      className="card component-detail"
      style={{
        "--component-stroke": colors.stroke,
        "--component-fill": colors.fill,
      }}
    >
      <div className="component-detail__header">
        <div>
          <h2>{component.name}</h2>
          <div className="component-detail__meta">
            <Tag label={component.type} ramp={rampName} theme={theme} />
            {component.layer ? <span className="muted-mono">{component.layer}</span> : null}
          </div>
        </div>
      </div>
      <p className="card-copy component-detail__copy">{component.description}</p>

      {component.responsibilities?.length ? (
        <section className="component-detail__section">
          <SectionLabel label="Responsibilities" />
          <div className="list-rows">
            {component.responsibilities.map((responsibility) => (
              <div key={responsibility} className="list-row">
                <span className="list-row__bullet" style={{ color: colors.stroke }}>
                  /
                </span>
                <span>{responsibility}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {dependencies.length ? (
        <section className="component-detail__section">
          <SectionLabel label="Depends on" />
          <div className="inline-token-wrap">
            {dependencies.map((dependency) => (
              <span key={dependency} className="inline-token">
                {dependency}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {component.tech_suggestions?.length ? (
        <section className="component-detail__section">
          <SectionLabel label="Technology suggestions" />
          <div className="inline-token-wrap">
            {component.tech_suggestions.map((suggestion) => (
              <span
                key={suggestion}
                className="inline-token inline-token--accent"
                style={{
                  "--token-bg": colors.fill,
                  "--token-border": colors.stroke,
                  "--token-text": colors.text,
                }}
              >
                {suggestion}
              </span>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

function ArchitectureDiagram({ result, onSelectComponent, selectedComponent, theme }) {
  if (!result) {
    return null;
  }

  const { components = [], connections = [], layers = [] } = result;
  const pad = 28;
  const layerHeight = 102;
  const gap = 40;
  const componentWidth = 170;
  const componentHeight = 68;
  const sortedLayers = [...layers].sort((left, right) => left.order - right.order);
  const labelBackground = theme === "dark" ? "rgba(7, 17, 31, 0.94)" : "rgba(255, 255, 255, 0.96)";
  const labelBorder = theme === "dark" ? "rgba(160, 186, 222, 0.22)" : "rgba(35, 54, 86, 0.14)";

  let width = 860;
  const positions = {};

  sortedLayers.forEach((layer) => {
    const names = layer.components || [];
    const totalWidth = names.length * componentWidth + Math.max(0, names.length - 1) * 14;
    width = Math.max(width, totalWidth + 72);
  });

  sortedLayers.forEach((layer, layerIndex) => {
    const layerY = pad + layerIndex * (layerHeight + gap);
    const names = layer.components || [];
    const totalWidth = names.length * componentWidth + Math.max(0, names.length - 1) * 14;
    const startX = (width - totalWidth) / 2;

    names.forEach((componentName, componentIndex) => {
      const component = components.find(
        (candidate) =>
          candidate.name === componentName ||
          candidate.name.toLowerCase() === componentName.toLowerCase(),
      );

      if (!component) {
        return;
      }

      const x = startX + componentIndex * (componentWidth + 14);
      const y = layerY + (layerHeight - componentHeight) / 2;
      positions[component.id] = {
        x,
        y,
        cx: x + componentWidth / 2,
        cy: y + componentHeight / 2,
      };
    });
  });

  const height = sortedLayers.length * (layerHeight + gap) + pad * 2;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="diagram-svg" aria-label="Architecture diagram">
      <defs>
        {connections.map((connection, index) => {
          const color =
            connection.type === "async"
              ? "#f2a93b"
              : connection.type === "data"
                ? "#9d85ff"
                : "#5a9bff";

          return (
            <marker
              key={index}
              id={`diagram-arrow-${index}`}
              markerWidth="7"
              markerHeight="7"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L7,3 z" fill={color} />
            </marker>
          );
        })}
      </defs>

      {sortedLayers.map((layer, index) => {
        const layerY = pad + index * (layerHeight + gap);
        const colors = getRamp(layerToRamp(layer.name), theme);

        return (
          <g key={layer.name}>
            <rect
              x={8}
              y={layerY}
              width={width - 16}
              height={layerHeight}
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth="0.75"
              rx="20"
              opacity="0.52"
            />
            <text x={24} y={layerY + 21} fontSize="10.5" fill={colors.text} fontFamily="var(--font-mono)">
              {layer.name}
            </text>
          </g>
        );
      })}

      {connections.map((connection, index) => {
        const sourcePosition = positions[connection.from];
        const targetPosition = positions[connection.to];

        if (!sourcePosition || !targetPosition) {
          return null;
        }

        const isSameRow = Math.abs(sourcePosition.cy - targetPosition.cy) < 10;
        let x1;
        let y1;
        let x2;
        let y2;

        if (isSameRow) {
          x1 = sourcePosition.cx < targetPosition.cx ? sourcePosition.x + componentWidth : sourcePosition.x;
          y1 = sourcePosition.cy;
          x2 = targetPosition.cx < sourcePosition.cx ? targetPosition.x + componentWidth : targetPosition.x;
          y2 = targetPosition.cy;
        } else {
          x1 = sourcePosition.cx;
          y1 = sourcePosition.cy + componentHeight / 2;
          x2 = targetPosition.cx;
          y2 = targetPosition.cy - componentHeight / 2;
        }

        const color =
          connection.type === "async"
            ? "#f2a93b"
            : connection.type === "data"
              ? "#9d85ff"
              : "#5a9bff";
        const dash = connection.type === "async" ? "6,4" : connection.type === "data" ? "2.5,3" : "none";
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const label = connection.label?.length > 16 ? `${connection.label.slice(0, 16)}…` : connection.label;
        const labelWidth = label ? Math.max(44, Math.min(94, label.length * 5.8 + 12)) : 0;
        const labelX = midX - labelWidth / 2;
        const sameRowOffsets = [-24, -6, 14];
        const crossRowOffsets = [-16, 2, 18];
        const labelOffset = isSameRow
          ? sameRowOffsets[index % sameRowOffsets.length]
          : crossRowOffsets[index % crossRowOffsets.length];
        const labelY = midY + labelOffset;

        return (
          <g key={`${connection.from}-${connection.to}-${index}`}>
            <path
              d={`M${x1},${y1} Q${x1},${midY} ${x2},${y2}`}
              fill="none"
              stroke={color}
              strokeWidth="1.4"
              strokeDasharray={dash}
              markerEnd={`url(#diagram-arrow-${index})`}
              opacity="0.72"
            />
            {label ? (
              <g>
                <rect
                  x={labelX}
                  y={labelY - 9}
                  width={labelWidth}
                  height={14}
                  rx="7"
                  fill={labelBackground}
                  stroke={labelBorder}
                  strokeWidth="0.7"
                />
                <text
                  x={midX}
                  y={labelY + 0.5}
                  fontSize="8.2"
                  fill={color}
                  opacity="0.96"
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                >
                  {label}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}

      {components.map((component) => {
        const position = positions[component.id];
        if (!position) {
          return null;
        }

        const colors = getRamp(typeToRamp(component.type), theme);
        const isSelected = selectedComponent?.id === component.id;

        return (
          <g key={component.id} onClick={() => onSelectComponent(component)} style={{ cursor: "pointer" }}>
            <rect
              x={position.x}
              y={position.y}
              width={componentWidth}
              height={componentHeight}
              fill={colors.fill}
              stroke={isSelected ? colors.text : colors.stroke}
              strokeWidth={isSelected ? 1.8 : 0.8}
              rx="12"
            />
            <rect x={position.x} y={position.y} width={componentWidth} height={4} fill={colors.stroke} rx="4" />
            <text
              x={position.cx}
              y={position.y + 28}
              fontSize="12"
              fontWeight="600"
              fill={colors.text}
              textAnchor="middle"
              fontFamily="var(--font-sans)"
              paintOrder="stroke"
              stroke={colors.fill}
              strokeWidth="2"
              strokeLinejoin="round"
            >
              {component.name.length > 20 ? `${component.name.slice(0, 20)}…` : component.name}
            </text>
            <text
              x={position.cx}
              y={position.y + 47}
              fontSize="9.2"
              fill={colors.stroke}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              paintOrder="stroke"
              stroke={colors.fill}
              strokeWidth="2"
              strokeLinejoin="round"
            >
              {component.type}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function LoadingState({ dots }) {
  return (
    <section className="workspace-state workspace-state--loading">
      <div className="signal-loader" aria-hidden="true">
        {[0, 1, 2, 3].map((index) => (
          <span key={index} className={index <= dots ? "is-active" : ""} />
        ))}
      </div>
      <div className="workspace-state__copy">
        <SectionLabel label="Analyzing" />
        <h2>Shaping the architecture{dots ? ".".repeat(dots) : "."}</h2>
        <p>Pulling requirements apart, selecting patterns, and mapping the system.</p>
      </div>
    </section>
  );
}

function Launchpad({ examples, onUseExample, theme, onToggleTheme }) {
  return (
    <section className="workspace-state workspace-state--launchpad">
      <div className="launchpad__theme">
        <ThemeToggleButton theme={theme} onToggle={onToggleTheme} />
      </div>

      <div className="launchpad__intro">
        <SectionLabel label="Start here" />
        <h2>Choose an example to get started.</h2>
      </div>

      <div className="launchpad__grid">
        {examples.map((example) => (
          <button key={example} type="button" className="example-card example-card--large" onClick={() => onUseExample(example)}>
            <span>{example}</span>
            <span className="example-card__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path
                  d="M6 4.5v12.5l3.9-3.8 2.6 6.3 2.2-.9-2.6-6.2 5.9-.1L6 4.5Z"
                  fill="currentColor"
                />
              </svg>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [requirements, setRequirements] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("requirements");
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [dots, setDots] = useState(0);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (!loading) {
      setDots(0);
      return undefined;
    }

    const timer = window.setInterval(() => {
      setDots((current) => (current + 1) % 4);
    }, 420);

    return () => window.clearInterval(timer);
  }, [loading]);

  const analyze = async () => {
    if (!requirements.trim() || loading) {
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedComponent(null);

    try {
      const response = await fetch("/api/design", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ req: requirements }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || `API error ${response.status}`);
      }

      const text = data.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      setActiveResult(parsed, setResult, setSelectedComponent, setTab);
    } catch (caughtError) {
      setError(caughtError.message || "Analysis failed. Please review the prompt and try again.");
    } finally {
      setLoading(false);
    }
  };

  const summaryMetrics = result
    ? [
        { label: "Functional", value: result.functional_requirements?.length || 0, ramp: "blue" },
        { label: "Non-functional", value: result.non_functional_requirements?.length || 0, ramp: "teal" },
        { label: "Components", value: result.components?.length || 0, ramp: "purple" },
        { label: "Patterns", value: result.patterns?.length || 0, ramp: "green" },
      ]
    : [];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <section className="panel panel--brand">
          <div className="brand">
            <LogoMark />
            <div>
              <p className="section-label">Architecture workbench</p>
              <h1>Clean architecture, less chaos.</h1>
            </div>
          </div>
          <p className="supporting-copy">
            Write the requirement, send it to Claude, and review the generated architecture in a cleaner workspace.
          </p>
        </section>

        <section className="panel">
          <div className="panel__header panel__header--tight">
            <div>
              <SectionLabel label="Prompt" />
              <h2>System requirements</h2>
            </div>
          </div>

          <textarea
            className="input-textarea"
            value={requirements}
            onChange={(event) => setRequirements(event.target.value)}
            rows={12}
            placeholder={
              "Describe the product, scale, constraints, and any reliability or security concerns.\n\nExample: A food delivery platform with real-time order tracking, restaurant management, driver coordination, and payment processing for 500K daily users."
            }
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                analyze();
              }
            }}
          />

          <div className="action-group action-group--inline">
            <button
              type="button"
              className="button button--primary"
              onClick={analyze}
              disabled={loading || !requirements.trim()}
            >
              {loading ? `Run${".".repeat(dots + 1)}` : "Run with Claude"}
            </button>
            <span className="shortcut-note">Ctrl/⌘ + Enter</span>
          </div>

          {error ? <p className="error-banner">{error}</p> : null}
        </section>

        {result ? (
          <section className="panel">
            <div className="panel__header panel__header--tight">
              <div>
                <SectionLabel label="Summary" />
                <h2>Claude result</h2>
              </div>
            </div>
            <div className="metric-grid">
              {summaryMetrics.map((metric) => (
                <MetricTile
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                  ramp={metric.ramp}
                  theme={theme}
                />
              ))}
            </div>
          </section>
        ) : null}
      </aside>

      <main className="workspace">
        {!result && !loading ? (
          <Launchpad
            examples={EXAMPLES}
            onUseExample={setRequirements}
            theme={theme}
            onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
          />
        ) : null}

        {loading ? <LoadingState dots={dots} /> : null}

        {result ? (
          <>
            <header className="workspace-hero workspace-hero--compact">
              <div className="workspace-hero__top">
                <div className="workspace-hero__copy">
                  <SectionLabel label="Claude result" />
                  <h2>{result.architecture_style?.name || "Architecture result"}</h2>
                  <p>
                    {result.architecture_style?.description ||
                      "Review requirements, components, patterns, and reasoning in the tabs below."}
                  </p>
                </div>
                <ThemeToggleButton
                  theme={theme}
                  onToggle={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
                />
              </div>
            </header>

            <nav className="tabs" aria-label="Result sections">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`tabs__button ${tab === item.id ? "is-active" : ""}`}
                  onClick={() => setTab(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <section className="workspace-content">
              {tab === "requirements" ? (
                <div className="two-column-layout">
                  <div className="section-stack">
                    <SectionLabel label="Functional requirements" />
                    <div className="stack">
                      {result.functional_requirements?.map((item) => (
                        <RequirementCard key={item.id} item={item} ramp="blue" theme={theme} />
                      ))}
                    </div>
                  </div>
                  <div className="section-stack">
                    <SectionLabel label="Non-functional requirements" />
                    <div className="stack">
                      {result.non_functional_requirements?.map((item) => (
                        <RequirementCard
                          key={item.id}
                          item={item}
                          ramp={nfrToRamp(item.category)}
                          badge={item.category}
                          theme={theme}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {tab === "style" && result.architecture_style ? (
                <article className="card spotlight-card">
                  <div className="spotlight-card__header">
                    <div className="spotlight-card__line" />
                    <div>
                      <SectionLabel label="Recommended architecture style" />
                      <h2>{result.architecture_style.name}</h2>
                    </div>
                  </div>
                  <p className="card-copy spotlight-card__copy">{result.architecture_style.description}</p>
                  <div className="card inset-card">
                    <SectionLabel label="Why this works" />
                    <p className="card-copy">{result.architecture_style.rationale}</p>
                  </div>
                </article>
              ) : null}

              {tab === "diagram" ? (
                <div className="section-stack">
                  <div className="panel-heading">
                    <div>
                      <SectionLabel label="Diagram" />
                      <h2>System view</h2>
                    </div>
                    <p className="panel-heading__copy">Click any component to inspect it in the Components tab.</p>
                  </div>
                  <article className="card diagram-card">
                    <ArchitectureDiagram
                      result={result}
                      onSelectComponent={(component) => {
                        setSelectedComponent(component);
                        setTab("components");
                      }}
                      selectedComponent={selectedComponent}
                      theme={theme}
                    />
                  </article>
                  <div className="legend-row">
                    {[
                      ["Service", "blue"],
                      ["Database", "purple"],
                      ["Queue", "amber"],
                      ["Cache / Gateway", "teal"],
                      ["Frontend", "pink"],
                      ["External", "gray"],
                      ["Load Balancer", "coral"],
                    ].map(([label, ramp]) => (
                      <Tag key={label} label={label} ramp={ramp} theme={theme} />
                    ))}
                    <span className="muted-mono">sync / async // data</span>
                  </div>
                </div>
              ) : null}

              {tab === "components" ? (
                <div className="components-layout">
                  <div className="component-list">
                    <SectionLabel label="Component inventory" />
                    {result.components?.map((component) => {
                      const colors = getRamp(typeToRamp(component.type), theme);
                      const isSelected = selectedComponent?.id === component.id;

                      return (
                        <button
                          key={component.id}
                          type="button"
                          className={`component-list__item ${isSelected ? "is-selected" : ""}`}
                          style={{
                            "--component-list-fill": colors.fill,
                            "--component-list-stroke": colors.stroke,
                          }}
                          onClick={() => setSelectedComponent(component)}
                        >
                          <span className="component-list__dot" />
                          <span>
                            <strong>{component.name}</strong>
                            <small>{component.type}</small>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {selectedComponent ? (
                    <ComponentDetail
                      component={selectedComponent}
                      allComponents={result.components || []}
                      theme={theme}
                    />
                  ) : (
                    <article className="card empty-detail-card">
                      <h2>Select a component</h2>
                      <p className="card-copy">
                        Pick an item from the left to inspect dependencies, responsibilities, and suggested tech.
                      </p>
                    </article>
                  )}
                </div>
              ) : null}

              {tab === "patterns" ? (
                <div className="section-stack">
                  <div className="section-stack">
                    <SectionLabel label="Architectural patterns" />
                    <div className="pattern-grid">
                      {result.patterns?.map((pattern) => {
                        const rampName = patToRamp(pattern.category);
                        const colors = getRamp(rampName, theme);

                        return (
                          <article
                            key={`${pattern.name}-${pattern.applied_to}`}
                            className="card pattern-card"
                            style={{
                              "--pattern-stroke": colors.stroke,
                              "--pattern-fill": colors.fill,
                            }}
                          >
                            <div className="pattern-card__header">
                              <h3>{pattern.name}</h3>
                              <Tag label={pattern.category} ramp={rampName} theme={theme} />
                            </div>
                            <p className="card-copy">{pattern.description}</p>
                            <p className="pattern-card__foot">
                              Applied to <span>{pattern.applied_to}</span>
                            </p>
                          </article>
                        );
                      })}
                    </div>
                  </div>

                  <div className="section-stack">
                    <SectionLabel label="NFR coverage tags" />
                    <div className="legend-row">
                      {result.nfr_tags?.map((item) => (
                        <Tag
                          key={`${item.tag}-${item.category}`}
                          label={item.tag}
                          ramp={nfrToRamp(item.category)}
                          theme={theme}
                          size="lg"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {tab === "reasoning" && result.reasoning ? (
                <div className="section-stack section-stack--narrow">
                  <article className="card">
                    <SectionLabel label="Overall rationale" />
                    <p className="card-copy">{result.reasoning.overall}</p>
                  </article>

                  <div className="section-stack">
                    <SectionLabel label="Key design decisions" />
                    <div className="decision-stack">
                      {result.reasoning.key_decisions?.map((decision, index) => (
                        <article key={`${decision.decision}-${index}`} className="card decision-card">
                          <div className="decision-card__index">{index + 1}</div>
                          <div>
                            <h3>{decision.decision}</h3>
                            <p className="card-copy">{decision.rationale}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}

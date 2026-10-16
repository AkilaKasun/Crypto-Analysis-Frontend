import { useState } from "react";
import AsyncSelect from "react-select/async";
import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    BrainCircuit,
    CheckCircle2,
    ChevronRight,
    CircleAlert,
    Coins,
    Cpu,
    Landmark,
    RefreshCw,
    Search,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    Wallet,
    X,
} from "lucide-react";
import {
    analyzeCryptocurrencies,
    fetchCryptocurrencyList,
} from "../services/AnalysisServices";

const selectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: 54,
        backgroundColor: "#101827",
        borderColor: state.isFocused ? "#22d3ee" : "#29364a",
        boxShadow: state.isFocused ? "0 0 0 1px #22d3ee" : "none",
        borderRadius: 12,
        cursor: "text",
        "&:hover": { borderColor: "#22d3ee" },
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: "#111c2d",
        border: "1px solid #29364a",
        borderRadius: 12,
        overflow: "hidden",
        zIndex: 50,
    }),
    menuList: (base) => ({ ...base, maxHeight: 280 }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? "#1c3045" : "#111c2d",
        color: "#e2e8f0",
        cursor: "pointer",
        padding: "12px 16px",
    }),
    input: (base) => ({ ...base, color: "#e2e8f0" }),
    placeholder: (base) => ({ ...base, color: "#718096" }),
    multiValue: (base) => ({
        ...base,
        backgroundColor: "#123044",
        borderRadius: 7,
    }),
    multiValueLabel: (base) => ({ ...base, color: "#67e8f9" }),
    multiValueRemove: (base) => ({
        ...base,
        color: "#67e8f9",
        cursor: "pointer",
        "&:hover": { backgroundColor: "#164e63", color: "white" },
    }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base) => ({ ...base, color: "#94a3b8" }),
    clearIndicator: (base) => ({ ...base, color: "#94a3b8" }),
    noOptionsMessage: (base) => ({ ...base, color: "#94a3b8" }),
    loadingMessage: (base) => ({ ...base, color: "#94a3b8" }),
};

function sentimentStyle(sentiment) {
    switch (sentiment?.toLowerCase()) {
        case "bullish":
            return {
                label: "Bullish",
                description: "Positive market outlook",
                color: "text-emerald-300",
                border: "border-emerald-400/30",
                panel: "bg-emerald-400/10",
                glow: "from-emerald-400/20",
                bar: "bg-emerald-400",
                icon: ArrowUpRight,
            };
        case "bearish":
            return {
                label: "Bearish",
                description: "Negative market outlook",
                color: "text-rose-300",
                border: "border-rose-400/30",
                panel: "bg-rose-400/10",
                glow: "from-rose-400/20",
                bar: "bg-rose-400",
                icon: ArrowDownRight,
            };
        default:
            return {
                label: "Neutral",
                description: "Mixed or balanced signals",
                color: "text-amber-200",
                border: "border-amber-400/30",
                panel: "bg-amber-400/10",
                glow: "from-amber-400/20",
                bar: "bg-amber-400",
                icon: Activity,
            };
    }
}

function SectionTitle({ icon: Icon, title, subtitle, trailing }) {
    return (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/10 p-2.5">
                    <Icon size={18} className="text-cyan-300" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white">{title}</h3>
                    {subtitle && (
                        <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
                    )}
                </div>
            </div>
            {trailing}
        </div>
    );
}

function formatCurrency(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "—";

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: number >= 1 ? 2 : 6,
    }).format(number);
}

function formatCompactCurrency(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "—";

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 2,
    }).format(number);
}

function formatPercentage(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "—";
    return `${number > 0 ? "+" : ""}${number.toFixed(2)}%`;
}

function MetricCard({ icon: Icon, label, value, hint, valueClass = "text-white" }) {
    return (
        <div className="rounded-2xl border border-slate-700/80 bg-[#121e30] p-4 transition hover:border-cyan-400/25">
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-slate-400">{label}</p>
                <Icon size={17} className="text-cyan-300" />
            </div>
            <p className={`mt-3 break-words text-xl font-bold tracking-tight sm:text-2xl ${valueClass}`}>
                {value}
            </p>
            {hint && <p className="mt-2 text-[11px] text-slate-500">{hint}</p>}
        </div>
    );
}

function AnalysisCard({ item, index = 0 }) {
    const sentiment = sentimentStyle(item.sentiment);
    const SentimentIcon = sentiment.icon;
    const factors = Array.isArray(item.key_factors) ? item.key_factors : [];
    const insights = Array.isArray(item.insights) ? item.insights : [];
    const summary = item.summary || item.summery || "No market summary was provided.";

    // These metrics appear only if the backend includes real CoinGecko values.
    const market = item.market_data || item.market || item.metrics || item;
    const price = market.current_price ?? market.price;
    const marketCap = market.market_cap;
    const volume = market.total_volume ?? market.total_volume_24h;
    const change = market.price_change_percentage_24h ?? market.change_24h;
    const hasMarketMetrics = [price, marketCap, volume, change].some(
        (value) => value !== undefined && value !== null && Number.isFinite(Number(value))
    );
    const positiveChange = Number(change) >= 0;

    return (
        <article className="group relative overflow-hidden rounded-3xl border border-slate-700/80 bg-[#0d1524] shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-400/30">
            <div className={`h-1 w-full bg-gradient-to-r ${sentiment.glow} via-cyan-400/60 to-transparent`} />

            <div className="border-b border-slate-700/70 bg-gradient-to-br from-[#152237] to-[#0d1524] p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 shadow-lg shadow-cyan-950/30">
                            <Coins size={27} className="text-cyan-300" />
                        </div>
                        <div className="min-w-0">
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-400">
                                Asset {String(index + 1).padStart(2, "0")}
                            </p>
                            <h2 className="break-words text-xl font-bold tracking-tight text-white sm:text-2xl">
                                {item.coin || "Cryptocurrency"}
                            </h2>
                            <p className="mt-1 text-xs text-slate-400">
                                AI market intelligence report
                            </p>
                        </div>
                    </div>

                    <div className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 ${sentiment.border} ${sentiment.panel}`}>
                        <SentimentIcon size={21} className={sentiment.color} />
                        <div>
                            <p className={`text-sm font-bold ${sentiment.color}`}>{sentiment.label}</p>
                            <p className="mt-0.5 text-[10px] text-slate-400">Market sentiment</p>
                        </div>
                    </div>
                </div>

                <div className="mt-5 flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${sentiment.bar}`} />
                    <p className="text-xs font-medium text-slate-300">{sentiment.description}</p>
                    <span className="ml-auto rounded-full border border-slate-700 bg-slate-900/70 px-2.5 py-1 text-[10px] text-slate-400">
                        AI generated
                    </span>
                </div>
            </div>

            <div className="space-y-7 p-5 sm:p-6">
                {hasMarketMetrics && (
                    <section>
                        <SectionTitle
                            icon={BarChart3}
                            title="Market snapshot"
                            subtitle="Market data supplied by the backend"
                        />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {price != null && (
                                <MetricCard
                                    icon={Wallet}
                                    label="Current price"
                                    value={formatCurrency(price)}
                                    hint="USD"
                                />
                            )}
                            {change != null && (
                                <MetricCard
                                    icon={positiveChange ? TrendingUp : Activity}
                                    label="24-hour change"
                                    value={formatPercentage(change)}
                                    hint="Price movement"
                                    valueClass={positiveChange ? "text-emerald-300" : "text-rose-300"}
                                />
                            )}
                            {marketCap != null && (
                                <MetricCard
                                    icon={Landmark}
                                    label="Market capitalization"
                                    value={formatCompactCurrency(marketCap)}
                                    hint="USD"
                                />
                            )}
                            {volume != null && (
                                <MetricCard
                                    icon={BarChart3}
                                    label="24-hour trading volume"
                                    value={formatCompactCurrency(volume)}
                                    hint="USD"
                                />
                            )}
                        </div>
                    </section>
                )}

                <section>
                    <SectionTitle
                        icon={BrainCircuit}
                        title="Market overview"
                        subtitle="AI-generated summary"
                    />
                    <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/[0.09] via-[#111c2d] to-[#101827] p-4 sm:p-5">
                        <p className="text-sm leading-7 text-slate-200">{summary}</p>
                    </div>
                </section>

                <section>
                    <SectionTitle
                        icon={Activity}
                        title="Key market factors"
                        subtitle="Signals influencing the outlook"
                        trailing={
                            <span className="rounded-lg border border-slate-700 bg-slate-800/70 px-2.5 py-1.5 text-xs font-semibold text-cyan-200">
                                {factors.length} factors
                            </span>
                        }
                    />
                    {factors.length ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {factors.map((factor, i) => (
                                <div
                                    key={`${factor.factor}-${i}`}
                                    className="rounded-xl border border-slate-700/80 bg-[#121e30] p-4 transition hover:border-cyan-400/30"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-400/10 text-xs font-bold text-violet-200">
                                            {String(i + 1).padStart(2, "0")}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="break-words text-sm font-semibold leading-5 text-white">
                                                {factor.factor || "Market factor"}
                                            </h4>
                                            <p className="mt-2 text-xs leading-6 text-slate-300">
                                                {factor.impact || "No additional details provided."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="rounded-xl border border-slate-700 p-4 text-sm text-slate-400">
                            No market factors were returned.
                        </p>
                    )}
                </section>

                <section>
                    <SectionTitle
                        icon={Sparkles}
                        title="AI insights"
                        subtitle="Model-generated outlook and confidence"
                        trailing={
                            <span className="rounded-lg border border-violet-400/20 bg-violet-400/10 px-2.5 py-1.5 text-xs font-semibold text-violet-200">
                                {insights.length} insights
                            </span>
                        }
                    />
                    {insights.length ? (
                        <div className="space-y-3">
                            {insights.map((insight, i) => {
                                const parsedConfidence = Number(insight.confidence);
                                const confidence = Number.isFinite(parsedConfidence)
                                    ? Math.min(100, Math.max(0, parsedConfidence))
                                    : 0;

                                return (
                                    <div
                                        key={`${insight.prediction}-${i}`}
                                        className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-400/[0.08] to-[#101827] p-4 sm:p-5"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10">
                                                <Sparkles size={17} className="text-violet-300" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300">
                                                    Insight {String(i + 1).padStart(2, "0")}
                                                </p>
                                                <p className="text-sm leading-7 text-slate-100">
                                                    {insight.prediction || "No prediction provided."}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-5 border-t border-slate-700/70 pt-4">
                                            <div className="flex items-end justify-between gap-3">
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-300">
                                                        Reported confidence
                                                    </p>
                                                    <p className="mt-1 max-w-xs text-[10px] leading-4 text-slate-500">
                                                        AI model estimate, not a verified probability.
                                                    </p>
                                                </div>
                                                <span className="shrink-0 text-2xl font-bold tabular-nums text-violet-200">
                                                    {confidence}<span className="text-sm text-violet-300">%</span>
                                                </span>
                                            </div>
                                            <div
                                                className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800"
                                                role="progressbar"
                                                aria-label={`Reported confidence ${confidence}%`}
                                                aria-valuenow={confidence}
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                            >
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-300 transition-all duration-700"
                                                    style={{ width: `${confidence}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="rounded-xl border border-slate-700 p-4 text-sm text-slate-400">
                            No AI insights were returned.
                        </p>
                    )}
                </section>

                <div className="flex items-start gap-3 rounded-xl border border-amber-400/15 bg-amber-400/[0.04] p-3.5">
                    <ShieldCheck size={17} className="mt-0.5 shrink-0 text-amber-300" />
                    <p className="text-xs leading-5 text-slate-400">
                        AI-generated analysis is informational only. Predictions and
                        confidence scores are not guarantees of future market performance.
                    </p>
                </div>
            </div>
        </article>
    );
}

function FeatureRow({ children }) {
    return (
        <div className="flex items-center gap-2.5 text-sm text-slate-300">
            <CheckCircle2 size={16} className="shrink-0 text-cyan-300" />
            <span>{children}</span>
        </div>
    );
}

export default function AnalysisPage() {
    const [selected, setSelected] = useState([]);
    const [results, setResults] = useState([]);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState("");

    async function handleAnalyze(event) {
        event.preventDefault();
        if (!selected.length || analyzing) return;

        setAnalyzing(true);
        setError("");
        setResults([]);

        try {
            const ids = selected.map((coin) => String(coin.value).trim().toLowerCase());
            const data = await analyzeCryptocurrencies(ids);

            if (!Array.isArray(data.analysis)) {
                throw new Error("The backend returned an unexpected response.");
            }

            setResults(data.analysis);
        } catch (err) {
            const detail = err.response?.data?.detail;
            setError(
                typeof detail === "string"
                    ? detail
                    : err.message || "Analysis failed. Please try again."
            );
        } finally {
            setAnalyzing(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#080d17] text-slate-200">
            <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#080d17]/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <a href="#" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/10">
                            <TrendingUp size={22} />
                        </div>
                        <div>
                            <p className="font-bold tracking-tight text-white">
                                Crypto<span className="text-cyan-300">Scope</span>
                            </p>
                            <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                                AI research terminal
                            </p>
                        </div>
                    </a>

                    <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span className="text-xs text-emerald-300">Analysis workspace</span>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
                <section className="relative mb-9 overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-[#101e32] via-[#0c1422] to-[#0a101b] p-6 sm:p-9">
                    <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-400/[0.08] blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-violet-500/[0.08] blur-3xl" />

                    <div className="relative max-w-3xl">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-xs font-semibold text-cyan-300">
                            <Sparkles size={14} />
                            AI-POWERED MARKET INTELLIGENCE
                        </div>

                        <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                            Understand the market.
                            <span className="mt-1 block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                                Analyze with clarity.
                            </span>
                        </h1>

                        <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                            Explore cryptocurrency market signals, compare sentiment, and
                            discover AI-generated insights in one focused research workspace.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <span className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-300">
                                <span className="mr-2 text-cyan-300">01</span>Market context
                            </span>
                            <span className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-300">
                                <span className="mr-2 text-violet-300">02</span>Sentiment analysis
                            </span>
                            <span className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-300">
                                <span className="mr-2 text-emerald-300">03</span>AI insights
                            </span>
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <section className="rounded-2xl border border-slate-800 bg-[#101827] p-5 sm:p-7">
                        <div className="mb-6 flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
                                <Search size={20} />
                            </div>
                            <div>
                                <h2 className="font-semibold text-white">Configure your analysis</h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Search by name or ticker symbol and select up to five assets.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleAnalyze}>
                            <label htmlFor="crypto-select" className="mb-2 block text-sm font-medium text-slate-300">
                                Cryptocurrencies
                            </label>

                            <AsyncSelect
                                inputId="crypto-select"
                                isMulti
                                isSearchable
                                isClearable
                                cacheOptions
                                defaultOptions={false}
                                loadOptions={fetchCryptocurrencyList}
                                filterOption={null}
                                closeMenuOnSelect={false}
                                value={selected}
                                onChange={(value) => setSelected(value ?? [])}
                                styles={selectStyles}
                                placeholder="Type at least 2 characters to search..."
                                loadingMessage={() => "Searching cryptocurrencies..."}
                                noOptionsMessage={({ inputValue }) =>
                                    inputValue.trim().length < 2
                                        ? "Type at least 2 characters"
                                        : "No matching cryptocurrencies found"
                                }
                                getOptionValue={(option) => option.value}
                                getOptionLabel={(option) => option.label}
                                isOptionDisabled={(option) =>
                                    !selected.some((coin) => coin.value === option.value) &&
                                    selected.length >= 5
                                }
                            />

                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                <p className="text-xs text-slate-400">
                                    <span className="font-semibold text-cyan-300">{selected.length}/5</span>
                                    {" "}selected · Search results load as you type
                                </p>
                                {selected.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setSelected([])}
                                        className="inline-flex items-center gap-1 text-xs text-slate-400 transition hover:text-white"
                                    >
                                        <X size={13} />
                                        Clear selection
                                    </button>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={!selected.length || analyzing}
                                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                            >
                                {analyzing ? (
                                    <>
                                        <RefreshCw size={17} className="animate-spin" />
                                        Analyzing market...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={17} />
                                        Generate AI analysis
                                        <ChevronRight size={17} />
                                    </>
                                )}
                            </button>
                        </form>
                    </section>

                    <aside className="space-y-4">
                        <div className="rounded-2xl border border-slate-800 bg-[#101827] p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                                    <Cpu size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-white">AI analysis engine</h3>
                                    <p className="mt-1 text-xs text-slate-400">Powered by your backend</p>
                                </div>
                            </div>
                            <div className="mt-5 space-y-3">
                                <FeatureRow>Market data context</FeatureRow>
                                <FeatureRow>Sentiment classification</FeatureRow>
                                <FeatureRow>Factor-based insights</FeatureRow>
                                <FeatureRow>Structured JSON output</FeatureRow>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-[#101827] p-5">
                            <div className="flex items-center gap-2 text-sm font-semibold text-white">
                                <ShieldCheck size={17} className="text-violet-300" />
                                Research responsibly
                            </div>
                            <p className="mt-3 text-xs leading-6 text-slate-400">
                                AI predictions are estimates, not guarantees. Confidence scores
                                are model-reported and do not establish the probability of a
                                prediction being correct.
                            </p>
                        </div>
                    </aside>
                </div>

                <section className="mt-12">
                    <div className="mb-7 flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-xs font-semibold text-cyan-300">
                                <Activity size={14} />
                                ANALYSIS OUTPUT
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                Market <span className="text-cyan-300">intelligence</span>
                            </h2>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                                Explore sentiment, market drivers, and AI-generated outlooks
                                for each selected cryptocurrency.
                            </p>
                        </div>

                        {results.length > 0 && (
                            <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-[#101827] px-4 py-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/10">
                                    <Coins size={18} className="text-cyan-300" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-white">{results.length}</p>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                                        Assets analyzed
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-rose-400/30 bg-rose-400/[0.07] p-4 text-sm text-rose-100">
                            <CircleAlert size={19} className="mt-0.5 shrink-0 text-rose-300" />
                            <div>
                                <p className="font-semibold">Analysis could not be completed</p>
                                <p className="mt-1 break-words text-rose-100/80">{error}</p>
                            </div>
                        </div>
                    )}

                    {analyzing && (
                        <div className="rounded-2xl border border-slate-800 bg-[#101827] px-6 py-16 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/5">
                                <RefreshCw size={26} className="animate-spin text-cyan-300" />
                            </div>
                            <h3 className="mt-5 font-semibold text-white">Analyzing your selected assets</h3>
                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                                Retrieving market data and generating AI insights. This may take a little while.
                            </p>
                        </div>
                    )}

                    {!analyzing && results.length === 0 && !error && (
                        <div className="rounded-2xl border border-dashed border-slate-700 bg-[#0d1421] px-6 py-16 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/60">
                                <BrainCircuit size={27} className="text-cyan-300" />
                            </div>
                            <h3 className="mt-5 text-lg font-semibold text-white">
                                Your insights will appear here
                            </h3>
                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                                Choose up to five cryptocurrencies above and generate your
                                first AI-powered market analysis.
                            </p>
                        </div>
                    )}

                    {!analyzing && results.length > 0 && (
                        <div className="grid items-start gap-5 xl:grid-cols-2">
                            {results.map((item, index) => (
                                <AnalysisCard key={`${item.coin}-${index}`} item={item} index={index} />
                            ))}
                        </div>
                    )}
                </section>

                <footer className="mt-16 border-t border-slate-800 pt-6">
                    <div className="flex flex-col justify-between gap-3 text-xs text-slate-500 sm:flex-row">
                        <p>CryptoScope · AI-assisted cryptocurrency research</p>
                        <p>For informational purposes only. Not financial advice.</p>
                    </div>
                </footer>
            </main>
        </div>
    );
}

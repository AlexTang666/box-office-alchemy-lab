import { type ReactElement, useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import { AlchemySimulator } from "./components/AlchemySimulator";
import { ChaosEventStage } from "./components/ChaosEventStage";
import { GameplayGuide } from "./components/GameplayGuide";
import { HomePage } from "./components/HomePage";
import { MarketEnergy } from "./components/MarketEnergy";
import { OpeningFilmStrip } from "./components/OpeningFilmStrip";
import { PathChoice } from "./components/PathChoice";
import { RecipeBuilder } from "./components/RecipeBuilder";
import { StudioSingleScreen } from "./components/StudioSingleScreen";
import { Top15Gallery } from "./components/Top15Gallery";
import { drawChaosEvents } from "./lib/chaosEvents";
import { loadGameData, type GameData } from "./lib/data";
import { simulateMovie } from "./lib/scoring";
import type {
  ChaosEventResponses,
  MarketChaosEvent,
  MarketEnergyAllocation,
  PlayerRecipe,
  SelectedPath,
  SimulationResult,
} from "./types/movie";

type View = "home" | "guide" | "recipe" | "energy" | "chaos" | "simulate" | "pathChoice" | "studioResult" | "gallery";
const debugMode = false;
const useStudioSingleScreen = false;
const useStudioAsCoreFlow = true;

const blankRecipe: PlayerRecipe = {
  country: "",
  genres: [],
  season: "",
  formats: [],
  promotion: "",
};

const blankMarketEnergy: MarketEnergyAllocation = {
  preheatPromotion: 0,
  reputationBuild: 0,
  screeningAccess: 0,
  communitySpread: 0,
};

const experimentStages = [
  { key: "recipe", label: "电影基因" },
  { key: "energy", label: "能量分配" },
  { key: "chaos", label: "混沌事件" },
  { key: "result", label: "命运结算" },
] as const;

const debugJumpTargets: { view: View; label: string }[] = [
  { view: "home", label: "首页" },
  { view: "guide", label: "玩法说明" },
  { view: "recipe", label: "单屏实验台" },
  { view: "simulate", label: "上映模拟" },
  { view: "studioResult", label: "电影命运结算" },
  { view: "gallery", label: "样本库" },
];

function stageIndexForView(view: View) {
  if (view === "recipe") return 0;
  if (view === "energy") return 1;
  if (view === "chaos" || view === "simulate") return 2;
  if (view === "studioResult") return 3;
  return -1;
}

function ExperimentProgress({ view }: { view: View }) {
  const currentIndex = stageIndexForView(view);
  if (currentIndex < 0) return null;

  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/86 px-5 py-3 text-white shadow-[0_0_26px_rgba(34,211,238,0.12)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto">
        {experimentStages.map((stage, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;

          return (
            <div key={stage.key} className="flex min-w-max items-center gap-3">
              <div
                className={[
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition",
                  active
                    ? "border-ember-300/70 bg-ember-300 text-slate-950 shadow-amber"
                    : done
                      ? "border-reactor-green/40 bg-reactor-green/10 text-reactor-green"
                      : "border-white/10 bg-white/5 text-slate-500",
                ].join(" ")}
              >
                <span className="grid h-5 w-5 place-items-center rounded-full border border-current/30 font-mono">
                  {done ? "✓" : index + 1}
                </span>
                {stage.label}
              </div>
              {index < experimentStages.length - 1 ? (
                <div className={done ? "h-px w-8 bg-reactor-green/45" : "h-px w-8 bg-white/10"} />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function withProgress(view: View, content: ReactElement) {
  return (
    <>
      <ExperimentProgress view={view} />
      {content}
    </>
  );
}

function App() {
  const [showOpening, setShowOpening] = useState(true);
  const [view, setView] = useState<View>("home");
  const [recipe, setRecipe] = useState<PlayerRecipe>(blankRecipe);
  const [marketEnergy, setMarketEnergy] = useState<MarketEnergyAllocation>(blankMarketEnergy);
  const [chaosEvents, setChaosEvents] = useState<MarketChaosEvent[]>([]);
  const [eventResponses, setEventResponses] = useState<ChaosEventResponses>({});
  const [selectedPath, setSelectedPath] = useState<SelectedPath | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [data, setData] = useState<GameData | null>(null);
  const [error, setError] = useState("");
  const [debugViewRunId, setDebugViewRunId] = useState(0);

  useEffect(() => {
    loadGameData()
      .then(setData)
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "数据加载失败");
      });
  }, []);

  const ready = useMemo(
    () => Boolean(data?.movies.length && data?.top15.length),
    [data],
  );

  const startSimulation = useCallback((selectedEvents?: MarketChaosEvent[]) => {
    if (!data) return;
    const activeChaosEvents = selectedEvents ?? chaosEvents;
    if (selectedEvents) {
      setChaosEvents(selectedEvents);
    }
    const nextResult = simulateMovie(recipe, data.movies, data.top15, {
      marketEnergy,
      chaosEvents: activeChaosEvents,
      eventResponses,
      selectedPath,
    });
    setResult(nextResult);
    setView("simulate");
  }, [chaosEvents, data, eventResponses, marketEnergy, recipe, selectedPath]);

  const resetRecipe = () => {
    setRecipe(blankRecipe);
    setMarketEnergy(blankMarketEnergy);
    setChaosEvents([]);
    setEventResponses({});
    setSelectedPath(null);
    setResult(null);
    setView("recipe");
  };

  const startChaosStage = () => {
    setChaosEvents(drawChaosEvents(4));
    setEventResponses({});
    setSelectedPath(null);
    setView("chaos");
  };

  const choosePath = (path: SelectedPath) => {
    setSelectedPath(path);
    setView("studioResult");
  };

  const ensureDebugResult = useCallback((activeChaosEvents: MarketChaosEvent[]) => {
    if (!data) return null;

    const nextResult = simulateMovie(recipe, data.movies, data.top15, {
      marketEnergy,
      chaosEvents: activeChaosEvents,
      eventResponses,
      selectedPath,
    });
    setResult(nextResult);
    return nextResult;
  }, [data, eventResponses, marketEnergy, recipe, selectedPath]);

  const jumpToDebugView = useCallback((nextView: View) => {
    if (nextView === "simulate" || nextView === "studioResult") {
      setDebugViewRunId((current) => current + 1);
    }

    const needsChaosEvents = nextView === "chaos";
    const needsResult = false;
    const activeChaosEvents = needsChaosEvents && chaosEvents.length === 0 ? drawChaosEvents(4) : chaosEvents;

    if (activeChaosEvents !== chaosEvents) {
      setChaosEvents(activeChaosEvents);
    }

    if (needsResult) {
      ensureDebugResult(activeChaosEvents);
    }

    setView(nextView);
  }, [chaosEvents, ensureDebugResult]);

  const withDebugPanel = (content: ReactElement) => (
    <>
      {debugMode && (
        <div className="fixed bottom-4 left-1/2 z-[80] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-wrap justify-center gap-2 rounded-2xl border border-cyan-200/20 bg-slate-950/90 p-3 text-white shadow-[0_0_34px_rgba(34,211,238,0.18)] backdrop-blur-md">
          {debugJumpTargets.map((target) => (
            <button
              key={target.view}
              type="button"
              onClick={() => jumpToDebugView(target.view)}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-bold transition",
                view === target.view
                  ? "border-amber-200/70 bg-amber-300/20 text-amber-100"
                  : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-reactor-cyan/50 hover:text-reactor-cyan",
              ].join(" ")}
            >
              {target.label}
            </button>
          ))}
        </div>
      )}
      {content}
    </>
  );

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-5 text-white">
        <div className="max-w-lg rounded-lg border border-red-300/30 bg-red-950/30 p-6">
          <TriangleAlert className="text-red-200" size={32} aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-bold">数据尚未准备好</h1>
          <p className="mt-3 leading-7 text-red-100/90">
            {error}。请先运行数据转换命令生成 `public/data/movieData.json` 和 `public/data/top15Data.json`。
          </p>
        </div>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-5 text-white">
        <div className="flex items-center gap-3 rounded-lg border border-reactor-cyan/30 bg-slate-900/70 px-5 py-4">
          <Loader2 className="animate-spin text-reactor-cyan" size={22} aria-hidden="true" />
          正在唤醒票房反应炉...
        </div>
      </main>
    );
  }

  if (useStudioSingleScreen) {
    return <StudioSingleScreen />;
  }

  // Legacy multi-step flow is preserved for fallback.
  if (showOpening && view === "home") {
    return <OpeningFilmStrip onFinish={() => setShowOpening(false)} />;
  }

  if (view === "home") {
    return withDebugPanel(<HomePage onGallery={() => setView("gallery")} onGuide={() => setView("guide")} />);
  }

  if (view === "guide") {
    return withDebugPanel(<GameplayGuide onBack={() => setView("home")} onStart={() => setView("recipe")} onGallery={() => setView("gallery")} />);
  }

  if (view === "recipe") {
    // StudioSingleScreen replaces the legacy recipe, energy, and chaos stages.
    if (useStudioAsCoreFlow) {
      return withDebugPanel(<StudioSingleScreen />);
    }

    return withDebugPanel(withProgress(view, (
      <RecipeBuilder
        recipe={recipe}
        onRecipeChange={setRecipe}
        onStart={() => setView("energy")}
        onHome={() => setView("home")}
      />
    )));
  }

  if (view === "energy") {
    // Legacy multi-step flow is preserved for fallback.
    if (useStudioAsCoreFlow) {
      return withDebugPanel(<StudioSingleScreen />);
    }

    return withDebugPanel(withProgress(view, (
      <MarketEnergy
        allocation={marketEnergy}
        onChange={setMarketEnergy}
        onBack={() => setView("recipe")}
        onStart={startChaosStage}
      />
    )));
  }

  if (view === "chaos") {
    // Legacy multi-step flow is preserved for fallback.
    if (useStudioAsCoreFlow) {
      return withDebugPanel(<StudioSingleScreen />);
    }

    return withDebugPanel(withProgress(view, (
      <ChaosEventStage
        events={chaosEvents}
        responses={eventResponses}
        onChange={setEventResponses}
        onBack={() => setView("energy")}
        onContinue={startSimulation}
      />
    )));
  }

  if (view === "simulate") {
    return withDebugPanel(<StudioSingleScreen key={`simulate-${debugViewRunId}`} initialSimulationMode />);
  }

  if (view === "studioResult") {
    return withDebugPanel(<StudioSingleScreen key={`studio-result-${debugViewRunId}`} initialResultMode />);
  }

  if (view === "pathChoice" && result) {
    return withDebugPanel(withProgress(view, <PathChoice result={result} selectedPath={selectedPath} onSelect={choosePath} />));
  }

  return withDebugPanel((
    <Top15Gallery
      top15={data!.top15}
      onBack={() => setView(result ? "studioResult" : "home")}
      onStart={resetRecipe}
    />
  ));
}

export default App;

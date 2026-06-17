import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  dailyPredictionApi,
  type DailyMeState,
  type DailyRoundInfo,
} from "../../services/api";

interface DailyGame {
  round: DailyRoundInfo | null;
  me: DailyMeState | null;
  authenticated: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

const Ctx = createContext<DailyGame>({
  round: null,
  me: null,
  authenticated: false,
  loading: true,
  refresh: async () => {},
});

export function useDailyGame() {
  return useContext(Ctx);
}

export function DailyGameProvider({ children }: { children: ReactNode }) {
  const { authenticated, getAccessToken } = usePrivy();
  const [round, setRound] = useState<DailyRoundInfo | null>(null);
  const [me, setMe] = useState<DailyMeState | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const r = await dailyPredictionApi.current().catch(() => null);
      setRound(r);
      if (authenticated) {
        const token = await getAccessToken();
        if (token) {
          const m = await dailyPredictionApi.me(token).catch(() => null);
          setMe(m);
        }
      } else {
        setMe(null);
      }
    } finally {
      setLoading(false);
    }
  }, [authenticated, getAccessToken]);

  useEffect(() => {
    refresh();
    const i = setInterval(refresh, 30000);
    return () => clearInterval(i);
  }, [refresh]);

  return (
    <Ctx.Provider value={{ round, me, authenticated, loading, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

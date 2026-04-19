export interface Family {
  id: number;
  name: string;
  active: boolean;
  folder: string;
}

export interface Bot {
  id: number;
  family: number;
  name: string;
  strategy_type: string;
  folder: string;
  execute_minute: number;
  summer_operate_hour: number;
  winter_operate_hour: number;
  active: boolean;
  capital_active: number;
  cap_value: number;
  cap_ingresado: number;
  cap_no_asignado: number;
  cap_to_add: number;
  cap_retirado: number;
  pnl_real: number;
  pnl_unreal: number;
  rets: number;
  tg_key1: string;
  tg_key2: string;
  tp: number;
  sl: number;
}

export interface Broker {
  id: number;
  name: string;
  coms: number;
}

export interface BotAssetStats {
  win_rate?: number;
  [key: string]: unknown;
}

export interface BotAsset {
  id: number;
  bot: number;
  bot_name: string;
  family_name: string;
  broker_name: string;
  operate: boolean;
  asset: string;
  params1: string | null;
  params2: string | null;
  params3: string | null;
  alloc: number;
  broker: number;
  position: number;
  qty_open: number;
  cap_to_trade: number;
  cap_to_add: number;
  cap_value_in_trade: number;
  op_price: number;
  last_price: number;
  pnl_un: number;
  capAdded: number;
  PNL: number;
  trades: number;
  coms: number;
  created_date: string;
  updated_date: string;
  stats1: BotAssetStats | null;
  stats2: BotAssetStats | null;
}

export interface AggregatedStats {
  cap_to_add_sum: number;
  cap_value_in_trade_sum: number;
  pnl_un_sum: number;
  PNL_sum: number;
  coms_sum: number;
  trades_sum: number;
  cap_to_trade_sum: number;
  cap_no_asignado: number;
  total_capital_added: number;
}

export interface PortfolioHistory {
  date: string;
  capital: number;
  log_cum_sum: number;
  ret_cums: number;
  cagr: number;
  spy_price: number;
  spy_ret: number;
  qqq_price: number;
  qqq_ret: number;
}

export interface Tactic {
  id: number;
  name: string;
  active: boolean;
  params: Record<string, string>;
  market_cap_category: string;
  overall_weights: Record<string, number>;
  value_weights: Record<string, number>;
  quality_weights: Record<string, number>;
  trend_weights: Record<string, number>;
  latest_session_id: number | null;
}

export interface SelectedAsset {
  id: number;
  ticker: string;
  company_name: string;
  sector: string;
  industry: string;
  country: string;
  market_cap: string;
  score: number;
  raw_metrics: Record<string, string>;
  session: number;
}

export interface CompetitorAsset {
  id: number;
  ticker: string;
  company_name: string;
  raw_metrics: Record<string, string>;
  target_asset: number;
}

export interface BacktestMetrics {
  start: string;
  end: string;
  BH_rets?: number;
  BH_rets_EA?: number;
  BH_max_dd?: number;
  ST_rets?: number;
  ST_rets_EA?: number;
  CAGR?: number;
  max_dd?: number;
  profit_factor?: number;
  prof_fact?: number;
  no_trds?: number;
  prof_trds?: number;
  adj_rets?: number;
  'wns/ls'?: number;
  [key: string]: any;
}

export interface BacktestBootstrap {
  confidence_interaval_30: number[];
  estadisticas_bootstrap_ci?: number[];
  estadisticas_bootstrap_h0?: number[];
  statistic_of_back_test: number;
  valor_critico?: number;
  media_h0?: number;
  [key: string]: any;
}

export interface BacktestDistributions {
  longs_rets?: number[];
  short_rets?: number[];
  days_inside?: number[];
  bootstrap?: BacktestBootstrap;
  [key: string]: any;
}

export interface BacktestResult {
  id: number;
  bot_asset: number;
  period: string;
  created_at: string;
  metrics: BacktestMetrics;
  distributions: BacktestDistributions;
  equity_curve: {
    Date: string[];
    cum_returns_st: number[];
  };
  bh_curve: {
    Date: string[];
    BH_rets: number[];
  };
  drawdown_curve: {
    Date: string[];
    drawdown: number[];
  };
}

export interface AssetBotPercentage {
  bot_asset_id: number | null;
  asset: string;
  bot_name: string;
  value: number;
  percentage: number;
}

export interface BotPercentage {
  bot_id: number;
  bot_name: string;
  value: number;
  cash_included: number;
  percentage: number;
}

export interface PortfolioPercentages {
  total_portfolio_value: number;
  asset_bot_percentages: AssetBotPercentage[];
  bot_percentages: BotPercentage[];
}

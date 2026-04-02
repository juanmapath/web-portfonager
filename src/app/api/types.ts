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
  chg_log: number;
  log_cum_sum: number;
  ret_cums: number;
  cagr: number;
  spy_price: number;
  spy_ret: number;
  qqq_price: number;
  qqq_ret: number;
}

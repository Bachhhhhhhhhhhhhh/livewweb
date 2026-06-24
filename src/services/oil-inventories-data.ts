import { readBootstrapKey } from '@/services/bootstrap';
import { loadStaticPanelSeed } from '@/services/static-panel-seed';
import { shouldUseLiveApiFetch } from '@/services/static-mirror';
import { toApiUrl } from '@/services/runtime';
import type {
  GetCrudeInventoriesResponse,
  GetEuGasStorageResponse,
  GetNatGasStorageResponse,
  GetOilStocksAnalysisResponse,
} from '@/generated/client/worldmonitor/economic/v1/service_client';

export interface OilInventoriesCrudeWeek {
  period: string;
  stocksMb: number;
  weeklyChangeMb?: number;
}

export interface OilInventoriesSprWeek {
  period: string;
  stocksMb: number;
}

export interface OilInventoriesSprData {
  latestStocksMb: number;
  changeWow: number;
  weeks: OilInventoriesSprWeek[];
}

export interface OilInventoriesNatGasWeek {
  period: string;
  storBcf: number;
  weeklyChangeBcf?: number;
}

export interface OilInventoriesEuGasDay {
  date: string;
  fillPct: number;
}

export interface OilInventoriesEuGasData {
  fillPct: number;
  fillPctChange1d: number;
  trend: string;
  history: OilInventoriesEuGasDay[];
}

export interface OilInventoriesIeaMember {
  iso2: string;
  daysOfCover?: number;
  netExporter: boolean;
  belowObligation: boolean;
}

export interface OilInventoriesRegionStats {
  avgDays?: number;
  minDays?: number;
  countBelowObligation?: number;
}

export interface OilInventoriesIeaData {
  dataMonth: string;
  members: OilInventoriesIeaMember[];
  europe?: OilInventoriesRegionStats;
  asiaPacific?: OilInventoriesRegionStats;
  northAmerica?: OilInventoriesRegionStats;
}

export interface OilInventoriesRefineryData {
  inputsMbpd: number;
  period: string;
}

export interface OilInventoriesData {
  crudeWeeks: OilInventoriesCrudeWeek[];
  spr?: OilInventoriesSprData;
  natGasWeeks: OilInventoriesNatGasWeek[];
  euGas?: OilInventoriesEuGasData;
  ieaStocks?: OilInventoriesIeaData;
  refinery?: OilInventoriesRefineryData;
}

async function buildFromBootstrapKeys(): Promise<OilInventoriesData | null> {
  const [crude, natGas, euGas, iea] = await Promise.all([
    readBootstrapKey('crudeInventories') as Promise<GetCrudeInventoriesResponse | undefined>,
    readBootstrapKey('natGasStorage') as Promise<GetNatGasStorageResponse | undefined>,
    readBootstrapKey('euGasStorage') as Promise<GetEuGasStorageResponse | undefined>,
    readBootstrapKey('oilStocksAnalysis') as Promise<GetOilStocksAnalysisResponse | undefined>,
  ]);

  const crudeWeeks = (crude?.weeks ?? []).map((w) => ({
    period: w.period,
    stocksMb: w.stocksMb,
    weeklyChangeMb: w.weeklyChangeMb,
  }));
  const natGasWeeks = (natGas?.weeks ?? []).map((w) => ({
    period: w.period,
    storBcf: w.storBcf,
    weeklyChangeBcf: w.weeklyChangeBcf,
  }));

  let euGasData: OilInventoriesEuGasData | undefined;
  if (euGas && !euGas.unavailable && euGas.fillPct > 0) {
    euGasData = {
      fillPct: euGas.fillPct,
      fillPctChange1d: euGas.fillPctChange1d,
      trend: euGas.trend,
      history: (euGas.history ?? []).map((h) => ({ date: h.date, fillPct: h.fillPct })),
    };
  }

  let ieaStocks: OilInventoriesIeaData | undefined;
  if (iea && !iea.unavailable && iea.ieaMembers.length > 0) {
    ieaStocks = {
      dataMonth: iea.dataMonth,
      members: iea.ieaMembers.map((m) => ({
        iso2: m.iso2,
        daysOfCover: m.daysOfCover,
        netExporter: m.netExporter,
        belowObligation: m.belowObligation,
      })),
      europe: iea.regionalSummary?.europe ? {
        avgDays: iea.regionalSummary.europe.avgDays,
        minDays: iea.regionalSummary.europe.minDays,
        countBelowObligation: iea.regionalSummary.europe.countBelowObligation,
      } : undefined,
      asiaPacific: iea.regionalSummary?.asiaPacific ? {
        avgDays: iea.regionalSummary.asiaPacific.avgDays,
        minDays: iea.regionalSummary.asiaPacific.minDays,
        countBelowObligation: iea.regionalSummary.asiaPacific.countBelowObligation,
      } : undefined,
      northAmerica: iea.regionalSummary?.northAmerica?.avgDays != null ? {
        avgDays: iea.regionalSummary.northAmerica.avgDays,
      } : undefined,
    };
  }

  if (!crudeWeeks.length && !natGasWeeks.length && !euGasData && !ieaStocks) return null;
  return { crudeWeeks, natGasWeeks, euGas: euGasData, ieaStocks };
}

/** Baked seed → bootstrap keys → live API (when proxy is up). */
export async function resolveOilInventoriesData(): Promise<OilInventoriesData | null> {
  const seeded = await loadStaticPanelSeed<OilInventoriesData>('oil-inventories');
  if (seeded && (seeded.crudeWeeks?.length || seeded.natGasWeeks?.length || seeded.euGas || seeded.ieaStocks)) {
    return seeded;
  }

  const fromBootstrap = await buildFromBootstrapKeys();
  if (fromBootstrap) return fromBootstrap;

  if (!shouldUseLiveApiFetch()) return null;

  try {
    const resp = await fetch(toApiUrl('/api/economic/v1/get-oil-inventories'), {
      signal: AbortSignal.timeout(8_000),
    });
    if (!resp.ok) return null;
    return (await resp.json()) as OilInventoriesData;
  } catch {
    return null;
  }
}
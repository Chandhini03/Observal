// SPDX-FileCopyrightText: 2026 Hari Srinivasan <harisrini21@gmail.com>
// SPDX-FileCopyrightText: 2026 Lokesh Selvam <lokeshselvam7025@gmail.com>
// SPDX-License-Identifier: Apache-2.0

/**
 * Leaderboard page — matches the approved HTML mockup exactly.
 *
 * Layout (top → bottom):
 *  1. Leaderboard controls — three segmented rows (Agents/Components,
 *     Rankings/Publishers, time‑range).
 *  2. Feature card — top‑ranked entity with sparkline and stats.
 *  3. Lower grid — ranking list (left ~60 %) + movement card (right ~40 %).
 */

import { useMemo, useState } from "react";
import { PageHeader, PageIntro } from "@/components/layouts/page-header";
import { TableSkeleton } from "@/components/shared/skeleton-layouts";
import {
  SegmentedControl,
  LeaderFeatureCard,
  RankingHead,
  RankingRow,
} from "@/components/registry/registry-primitives";
import { useLeaderboard, useComponentLeaderboard } from "@/hooks/use-api";
import { compactNumber } from "@/lib/utils";
import type { LeaderboardWindow } from "@/lib/types";

/* ────────────────────────────────────────────────── */
/*  Top tab / sub-tab / window types                 */
/* ────────────────────────────────────────────────── */

type TopTab = "agents" | "components";
type SubTab = "rankings" | "publishers";

export default function LeaderboardPage() {
  const [topTab, setTopTab] = useState<TopTab>("agents");
  const [subTab, setSubTab] = useState<SubTab>("rankings");
  const [window, setWindow] = useState<LeaderboardWindow>("7d");

  const { data: leaderboard, isLoading: agentsLoading } = useLeaderboard(window, 50);
  const { data: componentLeaderboard, isLoading: componentsLoading } = useComponentLeaderboard(window, 50);

  const isLoading = topTab === "agents" ? agentsLoading : componentsLoading;

  /* Build ranked list from API data */
  const rankings = useMemo(() => {
    if (topTab === "agents") {
      if (!leaderboard || leaderboard.length === 0) return null;
      return [...leaderboard]
        .sort((a, b) => b.download_count - a.download_count)
        .map((item, i) => ({
          pos: i + 1,
          id: item.id,
          name: item.name,
          handle: item.namespace ? `${item.namespace}/${item.slug ?? item.name}` : item.name,
          downloads: compactNumber(item.download_count),
          rating: item.average_rating?.toFixed(1) ?? "—",
          change: "+—",
          item,
        }));
    }
    if (!componentLeaderboard || componentLeaderboard.length === 0) return null;
    return [...componentLeaderboard]
      .sort((a, b) => b.download_count - a.download_count)
      .map((item, i) => ({
        pos: i + 1,
        id: item.id,
        name: item.name,
        handle: item.created_by_email ?? item.name,
        downloads: compactNumber(item.download_count),
        rating: item.average_rating?.toFixed(1) ?? "—",
        change: "+—",
        item,
      }));
  }, [topTab, leaderboard, componentLeaderboard]);

  /* Feature card: use first ranked item */
  const featuredItem = rankings?.[0] ?? null;

  return (
    <>
      <PageHeader
        title="Leaderboard"
        breadcrumbs={[
          { label: "Registry", href: "/" },
          { label: "Leaderboard" },
        ]}
      />

      <div className="page-body w-full mx-auto space-y-0">
        <PageIntro
          eyebrow="Registry momentum"
          title="Leaderboard"
          subtitle="See what developers are adopting, who publishes it, and why rankings changed."
        />

        {/* ── Leaderboard controls ─────────────────────── */}
        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <SegmentedControl
            options={[
              { value: "agents", label: "Agents" },
              { value: "components", label: "Components" },
            ]}
            value={topTab}
            onChange={(v) => setTopTab(v as TopTab)}
          />
          <SegmentedControl
            options={[
              { value: "rankings", label: "Rankings" },
              { value: "publishers", label: "Publishers" },
            ]}
            value={subTab}
            onChange={(v) => setSubTab(v as SubTab)}
          />
          <div className="ml-auto">
            <SegmentedControl
              options={[
                { value: "24h", label: "24h" },
                { value: "7d", label: "7 days" },
                { value: "30d", label: "30 days" },
                { value: "all", label: "All time" },
              ]}
              value={window}
              onChange={(v) => setWindow(v as LeaderboardWindow)}
            />
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : (
          <>
            {/* ── Feature card ───────────────────────────── */}
            <section className="mb-3.5">
              <LeaderFeatureCard
                rank="Most adopted this week"
                title={featuredItem?.name ?? "—"}
                handle={featuredItem?.handle ?? "—"}
                description={
                  ((featuredItem?.item as unknown as Record<string, unknown>)?.description as string) ??
                    "No description available."
                }
                stats={[
                  { label: "Downloads", value: featuredItem?.downloads ?? "—" },
                  {
                    label: "7-day growth",
                    value: (
                      <span className="text-success">
                        {featuredItem?.change ?? "—"}
                      </span>
                    ),
                  },
                  { label: "Rating", value: featuredItem?.rating ?? "—" },
                  { label: "Compatible harnesses", value: "—" },
                ]}
              />
            </section>

            {/* ── Lower grid: rankings + movement ────────── */}
            <div className="grid grid-cols-1 items-start gap-3.5 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.55fr)]">
              {/* Ranking list */}
              <section className="overflow-hidden rounded-xl bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div>
                    <h2 className="text-sm font-medium">
                      {topTab === "agents" ? "Agent rankings" : "Component rankings"}
                    </h2>
                    <p className="mt-0.5 text-2xs text-muted-foreground">
                      Approved {topTab} ranked by downloads in the selected period
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    How rankings work
                  </button>
                </div>
                <RankingHead />
                {rankings && rankings.length > 0
                  ? rankings.map((r) => (
                      <RankingRow
                        key={r.id}
                        position={r.pos}
                        downloads={r.downloads}
                        rating={r.rating}
                        change={r.change}
                        isTop={r.pos <= 3}
                      >
                        <strong className="block text-xs font-medium">{r.name}</strong>
                        <span className="block mt-0.5 font-mono text-[10px] text-muted-foreground">
                          {r.handle}
                        </span>
                      </RankingRow>
                    ))
                  : (
                    <div className="px-5 py-8 text-center text-xs text-muted-foreground">
                      No ranking data available for this period.
                    </div>
                  )}
              </section>

              {/* Movement card */}
              <aside className="rounded-xl bg-card p-5 shadow-sm">
                <h2 className="mb-1 text-[15px] font-medium">What moved this week</h2>
                <p className="mb-3.5 text-[10px] text-muted-foreground">
                  Context behind the ranking changes.
                </p>
                <div className="py-4 text-center text-xs text-muted-foreground">
                  No movement data available yet.
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </>
  );
}

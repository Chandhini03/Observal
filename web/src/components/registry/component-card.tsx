// SPDX-FileCopyrightText: 2026 Hari Srinivasan <harisrini21@gmail.com>
// SPDX-License-Identifier: Apache-2.0


import { Link } from "@tanstack/react-router";
import { GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RegistryName } from "@/components/registry/registry-name";
import { canonicalRouteParts } from "@/lib/registry-name";
import { tagColorClasses } from "@/lib/tag-colors";
import { EntityGlyph } from "@/components/registry/entity-glyph";
import type { RegistryType } from "@/lib/api";

interface ComponentCardProps {
  id: string;
  name: string;
  namespace?: string;
  slug?: string;
  qualified_name?: string;
  type: RegistryType;
  description?: string;
  version?: string;
  status?: string;
  git_url?: string;
  className?: string;
}

const TYPE_LABELS: Record<string, string> = {
  mcps: "MCP",
  skills: "Skill",
  hooks: "Hook",
  prompts: "Prompt",
  sandboxes: "Sandbox",
};

export function ComponentCard({
  id,
  name,
  namespace,
  slug,
  qualified_name,
  type,
  description,
  version,
  status,
  git_url,
  className,
}: ComponentCardProps) {
  const cardClassName = [
    "group block border border-border bg-card p-4 rounded-xl shadow-sm",
    "transition-all duration-200 ease-out",
    "hover:-translate-y-0.5 hover:shadow-md hover:border-foreground/20",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    className ?? "",
  ].join(" ");
  // Prefer the canonical shareable URL; fall back to the UUID route for
  // payloads that predate namespace/slug, or whose namespace is a legacy
  // verbatim username the canonical route cannot resolve.
  const canonical = canonicalRouteParts(namespace, slug);

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          {/* The glyph names the type symbolically; the chip below repeats it as
              text so the meaning never rests on colour or icon alone. */}
          <EntityGlyph type={type} labelled={false} />
          <RegistryName
            item={{ name, namespace, slug, qualified_name }}
            nameClassName="font-display text-sm font-semibold leading-tight"
          />
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-2xs font-medium ${tagColorClasses(type)}`}
        >
          {TYPE_LABELS[type] ?? type}
        </span>
      </div>

      {description && (
        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {description}
        </p>
      )}

      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        {version && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {version}
          </Badge>
        )}
        {status && status !== "approved" && (
          <Badge
            variant={status === "pending" ? "secondary" : "outline"}
            className="text-[10px] px-1.5 py-0"
          >
            {status}
          </Badge>
        )}
        {git_url && (
          <span className="inline-flex items-center gap-1 ml-auto">
            <GitBranch className="h-3 w-3" />
          </span>
        )}
      </div>
    </>
  );

  if (canonical) {
    return (
      <Link
        to="/components/$type/$namespace/$slug"
        params={{ type, ...canonical }}
        className={cardClassName}
      >
        {body}
      </Link>
    );
  }
  return (
    <Link
      to="/components/$componentId"
      params={{ componentId: id }}
      search={{ type }}
      className={cardClassName}
    >
      {body}
    </Link>
  );
}

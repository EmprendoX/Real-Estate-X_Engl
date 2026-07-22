"use client";

import React, { useMemo } from "react";
import type { GetServerSideProps } from "next";
import AdminLayout from "@/components/admin/AdminLayout";
import { useDemoState } from "@/utils/useDemoState";
import { getAdminServerSideProps } from "@/utils/pageData";
import {
  Automation,
  DEFAULT_AUTOMATIONS,
  RUN_LOG_TEMPLATES,
} from "@/data/demoIntegrations";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return getAdminServerSideProps(locale);
};

function relativeTime(minutesAgo: number): string {
  if (minutesAgo < 1) return "just now";
  if (minutesAgo < 60) return `${minutesAgo} min ago`;
  const hours = Math.round(minutesAgo / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return `${days} d ago`;
}

export default function AutomationsPage() {
  const [automations, setAutomations, hydrated] = useDemoState<Automation[]>(
    "demo.automations",
    DEFAULT_AUTOMATIONS
  );

  const totalRuns = useMemo(
    () => automations.reduce((sum, a) => sum + a.runs, 0),
    [automations]
  );
  const activeCount = useMemo(
    () => automations.filter((a) => a.enabled).length,
    [automations]
  );

  const toggle = (id: string) =>
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-gray-900">Automations</h1>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Flow engine active
        </span>
      </div>
      <p className="text-gray-500 mb-6">
        Every site event triggers automated actions. No code required.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Active flows</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {hydrated ? activeCount : "—"}{" "}
            <span className="text-base font-normal text-gray-400">/ {automations.length}</span>
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Total runs</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {hydrated ? totalRuns.toLocaleString("en-US") : "—"}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Success rate</p>
          <p className="text-2xl font-bold text-green-600 mt-1">98.6%</p>
        </div>
      </div>

      {/* Recipes */}
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Flows</h3>
      <div className="space-y-3 mb-10">
        {hydrated &&
          automations.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">{a.name}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="font-mono text-xs bg-primary/10 text-primary rounded px-2 py-1">
                    {a.trigger}
                  </span>
                  <span className="text-gray-300">→</span>
                  {a.actions.map((act) => (
                    <span
                      key={act}
                      className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-1"
                    >
                      {act}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {a.runs.toLocaleString("en-US")} runs
                </p>
              </div>

              {/* Toggle */}
              <button
                onClick={() => toggle(a.id)}
                role="switch"
                aria-checked={a.enabled}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                  a.enabled ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    a.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
      </div>

      {/* History */}
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Run history</h3>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 divide-y divide-gray-100">
        {RUN_LOG_TEMPLATES.map((log, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 shrink-0 ${
                log.status === "success"
                  ? "bg-green-50 text-green-700"
                  : log.status === "running"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  log.status === "success"
                    ? "bg-green-500"
                    : log.status === "running"
                    ? "bg-blue-500 animate-pulse"
                    : "bg-red-500"
                }`}
              />
              {log.status === "success" ? "OK" : log.status === "running" ? "Running" : "Error"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{log.automation}</p>
              <p className="text-xs text-gray-500 truncate">{log.detail}</p>
            </div>
            <span className="text-xs text-gray-400 shrink-0">{relativeTime(log.minutesAgo)}</span>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}

"use client";

import React, { useMemo, useState } from "react";
import type { GetServerSideProps } from "next";
import AdminLayout from "@/components/admin/AdminLayout";
import { useSiteConfig } from "@/contexts/SiteDataContext";
import { getAdminServerSideProps } from "@/utils/pageData";
import { useDemoState } from "@/utils/useDemoState";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return getAdminServerSideProps(locale);
};
import {
  CONNECTORS,
  Connector,
  API_ENDPOINTS,
  ApiKey,
  DEFAULT_API_KEYS,
  McpServer,
  DEFAULT_MCP_SERVERS,
} from "@/data/demoIntegrations";

type Tab = "connectors" | "apikeys" | "mcp";

// Connection state seeded from the catalog defaults
const initialConnections: Record<string, boolean> = CONNECTORS.reduce(
  (acc, c) => ({ ...acc, [c.id]: !!c.defaultConnected }),
  {} as Record<string, boolean>
);

function genApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 32; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return `rex_live_${out}`;
}

function maskKey(key: string): string {
  return `${key.slice(0, 12)}${"•".repeat(16)}${key.slice(-4)}`;
}

export default function IntegrationsPage() {
  const siteConfig = useSiteConfig();
  const [tab, setTab] = useState<Tab>("connectors");

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          API-first platform
        </span>
      </div>
      <p className="text-gray-500 mb-6">
        Connect AI, messaging, automations and portals. Everything plugs into the public RealEstateX API.
      </p>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {[
            { id: "connectors", label: "Connectors" },
            { id: "apikeys", label: "API Keys" },
            { id: "mcp", label: "MCP Servers" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as Tab)}
              className={`pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === "connectors" && <ConnectorsTab />}
      {tab === "apikeys" && <ApiKeysTab />}
      {tab === "mcp" && <McpTab />}
    </AdminLayout>
  );
}

/* ============================ CONNECTORS ============================ */

function ConnectorsTab() {
  const [connections, setConnections, hydrated] = useDemoState<Record<string, boolean>>(
    "demo.connections",
    initialConnections
  );
  const [modal, setModal] = useState<Connector | null>(null);

  const connectedCount = useMemo(
    () => Object.values(connections).filter(Boolean).length,
    [connections]
  );

  const categories = useMemo(
    () => Array.from(new Set(CONNECTORS.map((c) => c.category))),
    []
  );

  const disconnect = (id: string) =>
    setConnections((prev) => ({ ...prev, [id]: false }));

  const confirmConnect = () => {
    if (!modal) return;
    setConnections((prev) => ({ ...prev, [modal.id]: true }));
    setModal(null);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 text-sm text-gray-600">
        <span className="inline-flex items-center gap-1.5 font-medium text-gray-900">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          {hydrated ? connectedCount : 0} connected
        </span>
        <span className="text-gray-300">·</span>
        <span>{CONNECTORS.length} integrations available</span>
      </div>

      {categories.map((cat) => (
        <div key={cat} className="mb-8">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
            {cat}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CONNECTORS.filter((c) => c.category === cat).map((c) => {
              const isConnected = hydrated && connections[c.id];
              return (
                <div
                  key={c.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex flex-col"
                >
                  <div className="flex items-start justify-between">
                    <div className={`h-11 w-11 rounded-lg ${c.accent} flex items-center justify-center text-xl`}>
                      {c.icon}
                    </div>
                    {isConnected ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-500 text-xs font-medium px-2.5 py-1">
                        Disconnected
                      </span>
                    )}
                  </div>
                  <h4 className="mt-4 font-semibold text-gray-900">{c.name}</h4>
                  <p className="mt-1 text-sm text-gray-500 flex-1">{c.description}</p>
                  <div className="mt-4">
                    {isConnected ? (
                      <button
                        onClick={() => disconnect(c.id)}
                        className="w-full text-sm font-medium text-gray-600 border border-gray-200 rounded-md py-2 hover:bg-gray-50 transition-colors"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={() => setModal(c)}
                        className="w-full text-sm font-medium text-white bg-primary rounded-md py-2 hover:opacity-90 transition-opacity"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Connection modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`h-11 w-11 rounded-lg ${modal.accent} flex items-center justify-center text-xl`}>
                {modal.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Connect {modal.name}</h3>
                <p className="text-xs text-gray-500">{modal.category}</p>
              </div>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {modal.credentialLabel}
            </label>
            <input
              type="text"
              autoFocus
              placeholder="Paste your credential here…"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <p className="mt-2 text-xs text-gray-400">
              Your credentials are stored encrypted. You can revoke them at any time.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setModal(null)}
                className="flex-1 text-sm font-medium text-gray-600 border border-gray-200 rounded-md py-2 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmConnect}
                className="flex-1 text-sm font-medium text-white bg-primary rounded-md py-2 hover:opacity-90"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================ API KEYS ============================ */

function ApiKeysTab() {
  const siteConfig = useSiteConfig();
  const [keys, setKeys, hydrated] = useDemoState<ApiKey[]>("demo.apikeys", DEFAULT_API_KEYS);
  const [revealed, setRevealed] = useState<string | null>(null); // id of the newly created key
  const [copied, setCopied] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const baseUrl = `${siteConfig.siteUrl.replace(/\/$/, "")}/api/v1`;

  const createKey = () => {
    const key: ApiKey = {
      id: `key_${Math.random().toString(36).slice(2, 8)}`,
      name: newName.trim() || "New API key",
      key: genApiKey(),
      createdAt: new Date().toISOString(),
      lastUsed: null,
    };
    setKeys((prev) => [key, ...prev]);
    setRevealed(key.id);
    setNewName("");
    setCreating(false);
  };

  const revoke = (id: string) => setKeys((prev) => prev.filter((k) => k.id !== id));

  const copy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1500);
  };

  const curl = `curl ${baseUrl}/properties \\
  -H "Authorization: Bearer rex_live_•••••••••••••••••"`;

  return (
    <div className="space-y-8">
      {/* Base URL */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Base URL</p>
            <code className="text-sm text-gray-900">{baseUrl}</code>
          </div>
          <button
            onClick={() => copy(baseUrl, "baseurl")}
            className="text-sm font-medium text-primary hover:underline"
          >
            {copied === "baseurl" ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Keys */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Your API keys</h3>
          <button
            onClick={() => setCreating(true)}
            className="text-sm font-medium text-white bg-primary rounded-md px-4 py-2 hover:opacity-90"
          >
            + Generate API key
          </button>
        </div>

        {creating && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-3 flex gap-3">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name (e.g. Make integration)"
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button onClick={createKey} className="text-sm font-medium text-white bg-primary rounded-md px-4 hover:opacity-90">
              Create
            </button>
            <button onClick={() => setCreating(false)} className="text-sm text-gray-500 px-2">
              Cancel
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 divide-y divide-gray-100">
          {!hydrated ? (
            <div className="p-5 text-sm text-gray-400">Loading…</div>
          ) : (
            keys.map((k) => (
              <div key={k.id} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{k.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-sm text-gray-600">
                      {revealed === k.id ? k.key : maskKey(k.key)}
                    </code>
                    <button
                      onClick={() => copy(k.key, k.id)}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      {copied === k.id ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Created {new Date(k.createdAt).toLocaleDateString("en-US")} ·{" "}
                    {k.lastUsed
                      ? `last used ${new Date(k.lastUsed).toLocaleDateString("en-US")}`
                      : "not used yet"}
                  </p>
                </div>
                <button
                  onClick={() => revoke(k.id)}
                  className="text-sm font-medium text-red-500 hover:text-red-600 shrink-0"
                >
                  Revoke
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Endpoints */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Available endpoints</h3>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 divide-y divide-gray-100">
          {API_ENDPOINTS.map((e) => (
            <div key={`${e.method}-${e.path}`} className="p-4 flex items-center gap-4">
              <span
                className={`text-xs font-bold w-14 text-center rounded px-2 py-1 ${
                  e.method === "GET"
                    ? "bg-blue-50 text-blue-700"
                    : e.method === "POST"
                    ? "bg-green-50 text-green-700"
                    : e.method === "PUT"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {e.method}
              </span>
              <code className="text-sm text-gray-900 flex-1">{e.path}</code>
              <span className="text-sm text-gray-500 hidden md:block">{e.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* curl example */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Example</h3>
        <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto">
          <code>{curl}</code>
        </pre>
      </div>
    </div>
  );
}

/* ============================ MCP ============================ */

function McpTab() {
  const [servers, setServers, hydrated] = useDemoState<McpServer[]>(
    "demo.mcp",
    DEFAULT_MCP_SERVERS
  );
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<{ name: string; transport: "http" | "stdio"; target: string }>({
    name: "",
    transport: "http",
    target: "",
  });

  const add = () => {
    const server: McpServer = {
      id: `mcp_${Math.random().toString(36).slice(2, 8)}`,
      name: form.name.trim() || "New MCP server",
      transport: form.transport,
      target: form.target.trim() || (form.transport === "http" ? "https://" : "npx ..."),
      status: "connected",
      tools: ["tool_a", "tool_b"],
    };
    setServers((prev) => [server, ...prev]);
    setForm({ name: "", transport: "http", target: "" });
    setAdding(false);
  };

  const remove = (id: string) => setServers((prev) => prev.filter((s) => s.id !== id));

  const toggleStatus = (id: string) =>
    setServers((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === "connected" ? "disconnected" : "connected" }
          : s
      )
    );

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm text-gray-500 max-w-xl">
          Connect <strong>MCP (Model Context Protocol)</strong> servers so your AI agents
          can access tools: search properties, schedule visits, log leads and more.
        </p>
        <button
          onClick={() => setAdding(true)}
          className="text-sm font-medium text-white bg-primary rounded-md px-4 py-2 hover:opacity-90 shrink-0"
        >
          + Add MCP
        </button>
      </div>

      {adding && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              autoFocus
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Server name"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <select
              value={form.transport}
              onChange={(e) => setForm((f) => ({ ...f, transport: e.target.value as "http" | "stdio" }))}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="http">HTTP / SSE</option>
              <option value="stdio">stdio (command)</option>
            </select>
            <input
              value={form.target}
              onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))}
              placeholder={form.transport === "http" ? "https://mcp.yourserver.com" : "npx -y @your/mcp"}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={add} className="text-sm font-medium text-white bg-primary rounded-md px-4 py-2 hover:opacity-90">
              Connect server
            </button>
            <button onClick={() => setAdding(false)} className="text-sm text-gray-500 px-2">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {hydrated &&
          servers.map((s) => (
            <div key={s.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-lg bg-indigo-100 flex items-center justify-center text-xl">
                    🔌
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">{s.name}</h4>
                      <span className="text-xs uppercase font-semibold text-gray-400">{s.transport}</span>
                    </div>
                    <code className="text-xs text-gray-500">{s.target}</code>
                  </div>
                </div>
                <button
                  onClick={() => toggleStatus(s.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full text-xs font-medium px-2.5 py-1 ${
                    s.status === "connected"
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      s.status === "connected" ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  {s.status === "connected" ? "Connected" : "Disconnected"}
                </button>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                  Exposed tools ({s.tools.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {s.tools.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-xs bg-gray-100 text-gray-700 rounded px-2 py-1"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => remove(s.id)}
                  className="text-sm font-medium text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

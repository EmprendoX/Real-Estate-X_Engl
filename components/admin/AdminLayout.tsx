"use client";

import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [readOnly, setReadOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    fetch("/api/admin/check-auth")
      .then((res) => res.json())
      .then((data) => {
        setAuthenticated(data.authenticated);
        setReadOnly(!!data.readOnly);
        setLoading(false);
        if (!data.authenticated && router.pathname !== "/admin/login") {
          router.push("/admin/login");
        }
      })
      .catch(() => {
        setAuthenticated(false);
        setLoading(false);
        if (router.pathname !== "/admin/login") {
          router.push("/admin/login");
        }
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated && router.pathname !== "/admin/login") {
    return null;
  }

  if (router.pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <meta name="robots" content="noindex,nofollow" />
        <title>Admin</title>
      </Head>
      {readOnly && (
        <div className="bg-amber-100 border-b border-amber-300 text-amber-900 text-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
            <span>
              <strong>Modo solo lectura.</strong> Este sitio se administra desde el
              dashboard RealEX — cualquier edición aquí será rechazada.
            </span>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/admin" className="text-xl font-bold text-gray-900">
                Admin Panel
              </Link>
              <nav className="hidden md:flex space-x-4">
                <Link
                  href="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    router.pathname === "/admin"
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/config"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    router.pathname === "/admin/config"
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Settings
                </Link>
                <Link
                  href="/admin/about"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    router.pathname === "/admin/about"
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  About
                </Link>
                <Link
                  href="/admin/properties"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    router.pathname.startsWith("/admin/properties")
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Properties
                </Link>
                <Link
                  href="/admin/integrations"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    router.pathname === "/admin/integrations"
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Integrations
                </Link>
                <Link
                  href="/admin/automations"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    router.pathname === "/admin/automations"
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Automations
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                target="_blank"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                View site
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}



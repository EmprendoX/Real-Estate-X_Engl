"use client";

import React from "react";
import type { GetServerSideProps } from "next";
import AdminLayout from "@/components/admin/AdminLayout";
import AboutForm from "@/components/admin/AboutForm";
import { getAdminServerSideProps } from "@/utils/pageData";
import type { AboutContent } from "@/data/aboutPage";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return getAdminServerSideProps(locale);
};

interface Props {
  __siteData?: { about?: { es: AboutContent; en: AboutContent } };
}

export default function AboutAdminPage({ __siteData }: Props) {
  const about = __siteData?.about;
  if (!about) {
    return (
      <AdminLayout>
        <div className="text-center py-12 text-gray-600">
          Loading About content…
        </div>
      </AdminLayout>
    );
  }
  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">About page</h1>
        <p className="text-gray-600 mb-8">
          Edit the &ldquo;About us&rdquo; page: sections, texts, agency photo and
          team. Each language is saved independently.
        </p>
        <AboutForm initial={about} />
      </div>
    </AdminLayout>
  );
}

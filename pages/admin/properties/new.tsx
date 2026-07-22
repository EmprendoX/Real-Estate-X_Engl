"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import AdminLayout from "@/components/admin/AdminLayout";
import PropertyForm from "@/components/admin/PropertyForm";
import { Property, MAX_PROPERTIES } from "@/data/properties";
import { getAdminServerSideProps } from "@/utils/pageData";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return getAdminServerSideProps(locale);
};

export default function NewPropertyPage() {
  const router = useRouter();
  const [propertiesCount, setPropertiesCount] = useState(0);

  useEffect(() => {
    // Check the limit
    fetch("/api/admin/properties")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setPropertiesCount(data.count || 0);
          if (data.count >= MAX_PROPERTIES) {
            alert(
              `You cannot add more than ${MAX_PROPERTIES} properties. Delete an existing one first.`
            );
            router.push("/admin/properties");
          }
        }
      });
  }, [router]);

  const handleSubmit = async (property: Property) => {
    const response = await fetch("/api/admin/properties", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(property),
    });

    const data = await response.json();

    if (data.ok) {
      alert("Property created successfully");
      router.push("/admin/properties");
    } else {
      throw new Error(data.message || "Error creating the property");
    }
  };

  if (propertiesCount >= MAX_PROPERTIES) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">
            You have reached the maximum limit of {MAX_PROPERTIES} properties.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Create New Property
        </h1>
        <p className="text-gray-600 mb-8">
          Fill out the form to add a new property. Remember that
          the maximum limit is {MAX_PROPERTIES} properties ({propertiesCount} / {MAX_PROPERTIES}).
        </p>
        <PropertyForm
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin/properties")}
        />
      </div>
    </AdminLayout>
  );
}



"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import AdminLayout from "@/components/admin/AdminLayout";
import PropertyList from "@/components/admin/PropertyList";
import { Property, MAX_PROPERTIES } from "@/data/properties";
import { getAdminServerSideProps } from "@/utils/pageData";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return getAdminServerSideProps(locale);
};

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await fetch("/api/admin/properties");
      const data = await response.json();
      if (data.ok) {
        setProperties(data.properties || []);
      }
    } catch (error) {
      console.error("Error loading properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/properties/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.ok) {
        setProperties(properties.filter((p) => p.id !== id));
        alert("Property deleted successfully");
      } else {
        alert(data.message || "Error deleting the property");
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      alert("Error deleting the property");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Properties
            </h1>
            <p className="text-gray-600 mt-2">
              {properties.length} / {MAX_PROPERTIES} properties
            </p>
          </div>
          {properties.length < MAX_PROPERTIES ? (
            <Link
              href="/admin/properties/new"
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              + Create Property
            </Link>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-md text-sm">
              Limit reached ({MAX_PROPERTIES} properties)
            </div>
          )}
        </div>

        {properties.length >= MAX_PROPERTIES && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  You have reached the maximum limit of {MAX_PROPERTIES} properties.
                  Delete an existing property to create a new one.
                </p>
              </div>
            </div>
          </div>
        )}

        <PropertyList properties={properties} onDelete={handleDelete} />
      </div>
    </AdminLayout>
  );
}



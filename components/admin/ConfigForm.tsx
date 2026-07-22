"use client";

import React, { useState, useEffect, useRef } from "react";
import { SiteConfig } from "@/config/siteConfig";
import { useSiteConfig } from "@/contexts/SiteDataContext";

export default function ConfigForm() {
  const currentConfig = useSiteConfig();
  const [formData, setFormData] = useState<SiteConfig>(currentConfig);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [uploadingHero, setUploadingHero] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Sync the form when the effective config changes (e.g. right after a
    // save + revalidation).
    setFormData(currentConfig);
  }, [currentConfig]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? undefined : value,
    }));
  };

  const uploadImageToField = async (
    file: File,
    field: "heroImage" | "logoUrl",
    setUploading: (v: boolean) => void
  ) => {
    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError(
        "File type not allowed. Only images are permitted (JPG, PNG, WEBP, GIF, SVG)"
      );
      return;
    }

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("The file is too large. Maximum 10MB");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const uploadData = new FormData();
      uploadData.append("image", file);

      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: uploadData,
      });

      const data = await response.json();

      if (data.ok && data.url) {
        setFormData((prev) => ({ ...prev, [field]: data.url }));
      } else {
        setError(data.message || "Failed to upload the image");
      }
    } catch (err) {
      setError("Failed to upload the image");
    } finally {
      setUploading(false);
    }
  };

  const handleHeroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImageToField(file, "heroImage", setUploadingHero);
    e.target.value = "";
  };

  const handleHeroDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadImageToField(file, "heroImage", setUploadingHero);
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImageToField(file, "logoUrl", setUploadingLogo);
    e.target.value = "";
  };

  const handleLogoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingLogo(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadImageToField(file, "logoUrl", setUploadingLogo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      const response = await fetch("/api/admin/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.ok) {
        setSuccess(true);
        setTimeout(() => {
          window.location.reload(); // Reload to see the changes
        }, 1500);
      } else {
        setError(data.message || "Error saving the settings");
        setLoading(false);
      }
    } catch (error) {
      setError("Error saving the settings");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Site Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Site Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site Name *
            </label>
            <input
              type="text"
              name="siteName"
              value={formData.siteName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site URL *
            </label>
            <input
              type="url"
              name="siteUrl"
              value={formData.siteUrl}
              onChange={handleChange}
              required
              placeholder="https://juanperez.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
            <p className="mt-1 text-xs text-gray-500">
              Absolute URL without a trailing slash. Used in the sitemap and SEO.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo Text *
            </label>
            <input
              type="text"
              name="logoText"
              value={formData.logoText}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo (optional)
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {/* Current logo preview */}
              {formData.logoUrl && (
                <div className="relative flex-shrink-0">
                  <div className="w-32 h-20 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.logoUrl}
                      alt="Logo preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, logoUrl: undefined }))
                    }
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow"
                    title="Remove logo"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Drag & drop / click to upload */}
              <div
                onClick={() => logoInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingLogo(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDraggingLogo(false);
                }}
                onDrop={handleLogoDrop}
                className={`flex-1 w-full flex flex-col items-center justify-center border-2 border-dashed rounded-md p-4 cursor-pointer transition-colors ${
                  isDraggingLogo
                    ? "border-primary bg-primary/5"
                    : "border-gray-300 hover:border-primary hover:bg-gray-50"
                }`}
              >
                {uploadingLogo ? (
                  <p className="text-sm text-gray-600">Uploading...</p>
                ) : (
                  <>
                    <p className="text-sm text-gray-700 font-medium text-center">
                      Drag a logo here, or click to choose a file
                    </p>
                    <p className="mt-1 text-xs text-gray-500 text-center">
                      PNG, SVG, JPG, WEBP or GIF. Max 10MB
                    </p>
                  </>
                )}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
                  onChange={handleLogoFileChange}
                  className="hidden"
                />
              </div>
            </div>
            <input
              type="text"
              name="logoUrl"
              value={formData.logoUrl || ""}
              onChange={handleChange}
              className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              placeholder="Or paste a logo URL: https://example.com/logo.png"
            />
            <p className="mt-1 text-xs text-gray-500">
              If no logo is set, the Logo Text is shown instead.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Color * (hex)
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))
                }
                className="h-10 w-20 border border-gray-300 rounded"
              />
              <input
                type="text"
                name="primaryColor"
                value={formData.primaryColor}
                onChange={handleChange}
                required
                pattern="^#[0-9A-Fa-f]{6}$"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secondary Color * (hex)
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.secondaryColor}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, secondaryColor: e.target.value }))
                }
                className="h-10 w-20 border border-gray-300 rounded"
              />
              <input
                type="text"
                name="secondaryColor"
                value={formData.secondaryColor}
                onChange={handleChange}
                required
                pattern="^#[0-9A-Fa-f]{6}$"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          Hero Image
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Background image shown in the main hero section of the home page.
        </p>

        {/* Current preview */}
        {formData.heroImage && (
          <div className="mb-4">
            <div className="relative w-full h-48 rounded-md overflow-hidden border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={formData.heroImage}
                alt="Hero preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, heroImage: undefined }))
                }
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm shadow"
                title="Remove image"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Drag & drop / click to upload */}
        <div
          onClick={() => heroInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={handleHeroDrop}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-md p-8 cursor-pointer transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-primary hover:bg-gray-50"
          }`}
        >
          <svg
            className="w-10 h-10 text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.9A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          {uploadingHero ? (
            <p className="text-sm text-gray-600">Uploading...</p>
          ) : (
            <>
              <p className="text-sm text-gray-700 font-medium">
                Drag an image here, or click to choose a file
              </p>
              <p className="mt-1 text-xs text-gray-500">
                JPG, PNG, WEBP or GIF. Maximum size: 10MB
              </p>
            </>
          )}
          <input
            ref={heroInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleHeroFileChange}
            className="hidden"
          />
        </div>

        {/* Optional: URL input */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Or paste an image URL
          </label>
          <input
            type="text"
            name="heroImage"
            value={formData.heroImage || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            placeholder="https://example.com/hero.jpg"
          />
        </div>
      </div>

      {/* Broker Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {formData.businessType === "agencia"
            ? "Agency Details"
            : formData.businessType === "desarrollador"
            ? "Developer Details"
            : "Broker Details"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Account type */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Type *
            </label>
            <select
              name="businessType"
              value={formData.businessType || "broker"}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            >
              <option value="broker">Broker (independent agent)</option>
              <option value="agencia">Agency</option>
              <option value="desarrollador">Developer</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Choose the type of business. The fields below adapt to your selection.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.businessType === "agencia"
                ? "Agency Name *"
                : formData.businessType === "desarrollador"
                ? "Developer / Company Name *"
                : "Broker Name *"}
            </label>
            <input
              type="text"
              name="brokerName"
              value={formData.brokerName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Agency-only: number of agents */}
          {formData.businessType === "agencia" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Agents
              </label>
              <input
                type="number"
                name="agentsCount"
                min="0"
                value={formData.agentsCount ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    agentsCount:
                      e.target.value === ""
                        ? undefined
                        : parseInt(e.target.value, 10),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                placeholder="e.g. 12"
              />
            </div>
          )}

          {/* Developer-only: development / project name */}
          {formData.businessType === "desarrollador" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Development / Project Name
              </label>
              <input
                type="text"
                name="developmentName"
                value={formData.developmentName || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                placeholder="e.g. Torre Reforma Residencial"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp * (no + or spaces)
            </label>
            <input
              type="text"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              placeholder="5215512345678"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slogan *
            </label>
            <input
              type="text"
              name="slogan"
              value={formData.slogan}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Social Media (optional)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facebook
            </label>
            <input
              type="url"
              name="facebook"
              value={formData.facebook || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              placeholder="https://facebook.com/your-page"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instagram
            </label>
            <input
              type="url"
              name="instagram"
              value={formData.instagram || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              placeholder="https://instagram.com/your-account"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              TikTok
            </label>
            <input
              type="url"
              name="tiktok"
              value={formData.tiktok || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              placeholder="https://tiktok.com/@your-account"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn
            </label>
            <input
              type="url"
              name="linkedin"
              value={formData.linkedin || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              placeholder="https://linkedin.com/in/your-profile"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              name="website"
              value={formData.website || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              placeholder="https://your-site.com"
            />
          </div>
        </div>
      </div>

      {/* Automations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Automations (optional)
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lead Webhook URL
            </label>
            <input
              type="url"
              name="leadWebhookUrl"
              value={formData.leadWebhookUrl || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              placeholder="https://hook.make.com/your-webhook-id"
            />
            <p className="mt-1 text-sm text-gray-500">
              Webhook URL to send leads automatically (Make, Zapier, etc.)
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chat Script
            </label>
            <textarea
              name="chatScript"
              value={formData.chatScript || ""}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary font-mono text-sm"
              placeholder='<script type="text/javascript">window.$crisp=[];...</script>'
            />
            <p className="mt-1 text-sm text-gray-500">
              HTML/JS script for the chat widget (Crisp, Intercom, Tidio, etc.)
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          Settings saved successfully. Reloading...
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}



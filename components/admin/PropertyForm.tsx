"use client";

import React, { useState } from "react";
import { Property, PropertyType, Currency } from "@/data/properties";

interface PropertyFormProps {
  property?: Property;
  onSubmit: (property: Property) => Promise<void>;
  onCancel?: () => void;
}

export default function PropertyForm({
  property,
  onSubmit,
  onCancel,
}: PropertyFormProps) {
  const [formData, setFormData] = useState<Property>(
    property || {
      id: "",
      slug: "",
      title: "",
      description: "",
      type: "venta",
      price: 0,
      currency: "MXN",
      location: "",
      city: "",
      bedrooms: 0,
      bathrooms: 0,
      parking: 0,
      area: 0,
      featured: false,
      images: [],
      tourUrl: "",
    }
  );
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? 0 : parseFloat(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageUrl.trim()],
      }));
      setImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("File type not allowed. Only images are permitted (JPG, PNG, WEBP, GIF)");
      return;
    }

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("The file is too large. Maximum 10MB");
      return;
    }

    setUploadingImage(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.ok && data.url) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, data.url],
        }));
        // Clear input
        e.target.value = "";
      } else {
        setError(data.message || "Failed to upload the image");
      }
    } catch (error) {
      setError("Failed to upload the image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!formData.id || !formData.slug || !formData.title) {
      setError("ID, Slug and Title are required");
      setLoading(false);
      return;
    }

    if (formData.images.length === 0) {
      setError("You must add at least one image");
      setLoading(false);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setError("Failed to save the property");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID * (unique)
            </label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              placeholder="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug * (friendly URL, unique)
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              placeholder="departamento-lujo-polanco"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title * <span className="text-xs font-normal text-gray-500">(Spanish)</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description * <span className="text-xs font-normal text-gray-500">(Spanish)</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-xs font-normal text-gray-500">(English — optional, shown on the English site)</span>
            </label>
            <input
              type="text"
              name="titleEn"
              value={formData.titleEn || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-xs font-normal text-gray-500">(English — optional, shown on the English site)</span>
            </label>
            <textarea
              name="descriptionEn"
              value={formData.descriptionEn || ""}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Type and price */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Type and Price
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            >
              <option value="venta">For sale</option>
              <option value="renta">For rent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 pointer-events-none select-none">
                $
              </span>
              <input
                type="number"
                name="price"
                value={formData.price ? formData.price : ""}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="0"
                className="w-full pl-7 pr-16 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 text-sm pointer-events-none select-none">
                {formData.currency}
              </span>
            </div>
            {formData.price > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                {new Intl.NumberFormat("es-MX", {
                  style: "currency",
                  currency: formData.currency,
                  maximumFractionDigits: 0,
                }).format(formData.price)}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency *
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            >
              <option value="MXN">MXN — Mexican Pesos</option>
              <option value="USD">USD — US Dollars</option>
            </select>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address/Neighborhood *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
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
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Features
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bedrooms *
            </label>
            <input
              type="number"
              name="bedrooms"
              value={formData.bedrooms ? formData.bedrooms : ""}
              onChange={handleChange}
              required
              min="0"
              inputMode="numeric"
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bathrooms *
            </label>
            <input
              type="number"
              name="bathrooms"
              value={formData.bathrooms ? formData.bathrooms : ""}
              onChange={handleChange}
              required
              min="0"
              inputMode="numeric"
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parking *
            </label>
            <input
              type="number"
              name="parking"
              value={formData.parking ? formData.parking : ""}
              onChange={handleChange}
              required
              min="0"
              inputMode="numeric"
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Area (m²) *
            </label>
            <input
              type="number"
              name="area"
              value={formData.area ? formData.area : ""}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured || false}
              onChange={handleChange}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-2 text-sm text-gray-700">
              Featured property
            </span>
          </label>
        </div>
      </div>

      {/* Virtual tour */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          Virtual tour <span className="text-sm font-normal text-gray-500">(optional)</span>
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Paste a URL from YouTube, Vimeo, Matterport or another 360° tour provider.
          It will be embedded on the property detail page.
        </p>
        <input
          type="url"
          name="tourUrl"
          value={formData.tourUrl || ""}
          onChange={handleChange}
          placeholder="https://my.matterport.com/show/?m=XXXX  or  https://youtu.be/XXXX"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
        />
      </div>

      {/* Images */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Images</h2>
        <div className="space-y-4">
          {/* Option 1: Upload file */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload an image from your computer
            </label>
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleFileUpload}
                disabled={uploadingImage}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 disabled:opacity-50"
              />
              {uploadingImage && (
                <span className="flex items-center text-sm text-gray-600">
                  Uploading...
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Allowed formats: JPG, PNG, WEBP, GIF. Maximum size: 10MB
            </p>
          </div>

          {/* Option 2: Add URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or add an image from a URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddImage();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
              >
                Add URL
              </button>
            </div>
          </div>
          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/400x300?text=Image+unavailable";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : property ? "Update" : "Create"} Property
        </button>
      </div>
    </form>
  );
}

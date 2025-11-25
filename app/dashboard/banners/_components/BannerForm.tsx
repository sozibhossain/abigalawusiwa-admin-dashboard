"use client";

import React, { useEffect, useState } from "react";
import type { CmsBanner } from "@/type/cms";

const ALLOWED_TYPES = ["hero", "flash", "discount1", "discount2", "brands"] as const;

type Props = {
  initialData?: CmsBanner;
  loading?: boolean;
  onSubmit: (data: {
    title: string;
    type: string;
    description: string;
    images: FileList | null;
  }) => void | Promise<void>;
  onCancel: () => void;
};

export const BannerForm: React.FC<Props> = ({
  initialData,
  loading,
  onSubmit,
  onCancel,
}) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      // ensure type is one of the allowed ones, otherwise empty
      const safeType = ALLOWED_TYPES.includes(initialData.type as any)
        ? initialData.type
        : "";
      setType(safeType);
      setDescription(initialData.description || "");
      setExistingImages(initialData.images || []);
    } else {
      setTitle("");
      setType("");
      setDescription("");
      setExistingImages([]);
      setImages(null);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ title, type, description, images });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Summer Sale Banner"
        />
      </div>

      {/* Type (select) */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          required
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="" disabled>
            Select banner type
          </option>
          {ALLOWED_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500">
          Type must be one of: hero, flash, discount1, discount2, brands.
        </p>
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Amazing summer deals with up to 50% off"
        />
      </div>

      {/* Existing Images (shown on Edit) */}
      {existingImages.length > 0 && (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Existing Images
          </label>
          <div className="flex flex-wrap gap-2">
            {existingImages.map((img, idx) => (
              <div key={idx} className="relative">
                <img
                  src={img}
                  alt={`Banner image ${idx + 1}`}
                  className="w-20 h-14 object-cover rounded border"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            These are the currently saved images for this banner.
          </p>
        </div>
      )}

      {/* Upload new images */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          {existingImages.length
            ? "Upload New Images (optional)"
            : "Upload Images"}
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setImages(e.target.files)}
          className="block w-full text-sm"
        />
        {existingImages.length ? (
          <p className="text-xs text-gray-500">
            If you upload new images, the backend will use those and may replace
            existing ones. Leave this empty to keep current images.
          </p>
        ) : (
          <p className="text-xs text-gray-500">
            You can upload multiple images (backend allows up to 10).
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded border border-gray-300 text-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Saving..." : initialData ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

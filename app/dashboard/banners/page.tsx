"use client";

import React, { useEffect, useState } from "react";
import { BannerForm } from "./_components/BannerForm";
import { BannerTable } from "./_components/BannerTable";
import type { CmsBanner } from "@/type/cms";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

function BannersPage() {
  const [banners, setBanners] = useState<CmsBanner[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<CmsBanner | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { data: session } = useSession();
  const token = (session?.user as any)?.accessToken as string | undefined;

  const fetchBanners = async () => {
    try {
      if (!BASE_URL) {
        throw new Error("Base URL is not configured");
      }

      setLoading(true);
      setError(null);

      const res = await fetch(`${BASE_URL}/cms/banners`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json = await res.json();

      if (!json.status) {
        throw new Error(json.message || "Failed to fetch banners");
      }

      setBanners(json.data || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      toast.error(err.message || "Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleCreateClick = () => {
    setSelectedBanner(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleEditClick = (banner: CmsBanner) => {
    setSelectedBanner(banner);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  // ✅ This is now called only AFTER user clicks "Yes" in the modal
  const handleDeleteClick = async (banner: CmsBanner) => {
    if (!token) {
      const msg = "Authentication token missing. Cannot delete.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!BASE_URL) {
      const msg = "Base URL is not configured";
      setError(msg);
      toast.error(msg);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch(`${BASE_URL}/cms/${banner._id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (!json.status) {
        throw new Error(json.message || "Failed to delete banner");
      }

      toast.success("Banner deleted successfully");
      await fetchBanners();
    } catch (err: any) {
      const msg = err.message || "Something went wrong";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (formData: {
    title: string;
    type: string;
    description: string;
    images: FileList | null;
  }) => {
    if (!token) {
      const msg = "Authentication token missing. Cannot save.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!BASE_URL) {
      const msg = "Base URL is not configured";
      setError(msg);
      toast.error(msg);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const data = new FormData();
      data.append("title", formData.title);
      data.append("type", formData.type);
      data.append("description", formData.description);

      if (formData.images) {
        Array.from(formData.images).forEach((file) => {
          data.append("images", file);
        });
      }

      const url =
        isEditing && selectedBanner
          ? `${BASE_URL}/cms/${selectedBanner._id}`
          : `${BASE_URL}/cms`;

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include",
        body: data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (!json.status) {
        throw new Error(json.message || "Failed to save banner");
      }

      toast.success(
        isEditing ? "Banner updated successfully" : "Banner created successfully"
      );

      setIsFormOpen(false);
      setSelectedBanner(null);
      await fetchBanners();
    } catch (err: any) {
      const msg = err.message || "Something went wrong";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Banners</h1>
        <button
          onClick={handleCreateClick}
          className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
        >
          + Add Banner
        </button>
      </div>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <BannerTable
        loading={loading}
        banners={banners}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        deleting={submitting}
      />

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">
                {isEditing ? "Edit Banner" : "Add Banner"}
              </h2>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setSelectedBanner(null);
                }}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <BannerForm
              initialData={selectedBanner || undefined}
              loading={submitting}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setSelectedBanner(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default BannersPage;

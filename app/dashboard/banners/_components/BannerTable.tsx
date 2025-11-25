"use client";

import React, { useState } from "react";
import type { CmsBanner } from "@/type/cms";

type Props = {
  banners: CmsBanner[];
  loading: boolean;
  deleting?: boolean;
  onEdit: (banner: CmsBanner) => void;
  onDelete: (banner: CmsBanner) => void; // this will perform the actual delete in parent
};

export const BannerTable: React.FC<Props> = ({
  banners,
  loading,
  deleting,
  onEdit,
  onDelete,
}) => {
  const [confirmBanner, setConfirmBanner] = useState<CmsBanner | null>(null);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading banners...</p>;
  }

  if (!banners.length) {
    return <p className="text-sm text-gray-500">No banners found.</p>;
  }

  const handleAskDelete = (banner: CmsBanner) => {
    setConfirmBanner(banner);
  };

  const handleConfirmYes = async () => {
    if (!confirmBanner) return;
    await onDelete(confirmBanner);
    setConfirmBanner(null);
  };

  const handleConfirmNo = () => {
    setConfirmBanner(null);
  };

  return (
    <>
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-600">
                Title
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">
                Type
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">
                Description
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">
                Images
              </th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {banners.map((banner) => (
              <tr key={banner._id} className="border-t">
                <td className="px-3 py-2 font-medium">{banner.title}</td>
                <td className="px-3 py-2">{banner.type}</td>
                <td className="px-3 py-2 max-w-xs">
                  <span className="line-clamp-2 text-xs text-gray-600">
                    {banner.description}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {banner.images?.length ? (
                    <div className="flex gap-1 flex-wrap">
                      {banner.images.slice(0, 3).map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={banner.title}
                          className="w-12 h-8 object-cover rounded"
                        />
                      ))}
                      {banner.images.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{banner.images.length - 3} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">No images</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right space-x-2">
                  <button
                    onClick={() => onEdit(banner)}
                    className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    disabled={!!deleting}
                    onClick={() => handleAskDelete(banner)}
                    className="px-2 py-1 text-xs rounded border border-red-400 text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirm Delete Modal */}
      {confirmBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-4">
            <h3 className="text-lg font-semibold mb-2">Delete Banner</h3>
            <p className="text-sm text-gray-700">
              Are you sure you want to delete{" "}
              <span className="font-semibold">"{confirmBanner.title}"</span>?
            </p>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={handleConfirmNo}
                className="px-3 py-1.5 rounded border border-gray-300 text-sm hover:bg-gray-50"
              >
                No
              </button>
              <button
                type="button"
                onClick={handleConfirmYes}
                disabled={!!deleting}
                className="px-3 py-1.5 rounded bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

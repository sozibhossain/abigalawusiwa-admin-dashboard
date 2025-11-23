"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Trash2 } from "lucide-react";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/toast-provider";
import { DeleteModal } from "@/components/delete-modal";
import { vendorApi } from "@/lib/api";

type VendorStatus = "pending" | "approved" | "rejected";

interface VendorRequest {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  storeName: string;
  city?: string;
  country?: string;
  address?: string;
  storePhone?: string;
  status: VendorStatus;
  createdAt: string;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<VendorRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const [selectedStatus, setSelectedStatus] =
    useState<"all" | VendorStatus>("all");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { addToast } = useToast();

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await vendorApi.getAll(currentPage, 10, selectedStatus);
      if (res.data.status) {
        setVendors(res.data.data.requests);
        setTotalPages(res.data.data.paginationInfo.totalPages);
        setTotalData(res.data.data.paginationInfo.totalData);
      }
    } catch (error: any) {
      addToast({
        title:
          error?.response?.data?.message ||
          "Failed to fetch vendor requests",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedStatus]);

  const handleStatusChange = async (
    id: string,
    status: VendorStatus
  ) => {
    const prev = [...vendors];

    // optimistic update
    setVendors((prevState) =>
      prevState.map((v) =>
        v._id === id ? { ...v, status } : v
      )
    );

    try {
      await vendorApi.updateStatus(id, status);
      addToast({
        title: "Vendor status updated",
        type: "success",
      });
    } catch (error: any) {
      // rollback on error
      setVendors(prev);
      addToast({
        title:
          error?.response?.data?.message ||
          "Failed to update status",
        type: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);

    try {
      await vendorApi.delete(deleteId);
      addToast({
        title: "Vendor request deleted",
        type: "success",
      });
      setDeleteId(null);
      fetchVendors();
    } catch (error: any) {
      addToast({
        title:
          error?.response?.data?.message ||
          "Failed to delete vendor request",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Vendor List
        </h1>

        {/* Status filter buttons like tabs */}
        <div className="flex items-center gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map(
            (status) => (
              <Button
                key={status}
                size="sm"
                variant={
                  selectedStatus === status ? "default" : "outline"
                }
                onClick={() => {
                  setCurrentPage(1);
                  setSelectedStatus(status);
                }}
              >
                {status === "all"
                  ? "All"
                  : status.charAt(0).toUpperCase() +
                    status.slice(1)}
              </Button>
            )
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {vendors.length} of {totalData} entries
          </p>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Vendor Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Store
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Location
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Phone
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {vendors.map((vendor) => {
                      const displayName =
                        vendor.name ||
                        vendor.storeName ||
                        vendor.email;
                      const location =
                        vendor.city ||
                        vendor.address ||
                        vendor.country ||
                        "-";

                      return (
                        <tr
                          key={vendor._id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 font-medium text-gray-900">
                            {displayName}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {vendor.email}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {vendor.storeName}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {location}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {vendor.storePhone || "-"}
                          </td>

                          {/* Status dropdown */}
                          <td className="py-3 px-4">
                            <select
                              value={vendor.status}
                              onChange={(e) =>
                                handleStatusChange(
                                  vendor._id,
                                  e.target
                                    .value as VendorStatus
                                )
                              }
                              className={`px-3 py-1 rounded-full text-xs font-medium border bg-white ${
                                vendor.status === "approved"
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : vendor.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                  : "bg-red-100 text-red-700 border-red-200"
                              }`}
                            >
                              <option value="pending">
                                Pending
                              </option>
                              <option value="approved">
                                Approved
                              </option>
                              <option value="rejected">
                                Rejected
                              </option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {/* View */}
                              <Link
                                href={`/dashboard/vendors/${vendor._id}`}
                              >
                                <button className="p-1 hover:bg-gray-200 rounded">
                                  <Eye className="w-4 h-4 text-gray-600" />
                                </button>
                              </Link>

                              {/* Delete */}
                              <button
                                onClick={() =>
                                  setDeleteId(vendor._id)
                                }
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((p) => p - 1)
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => p + 1)
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation modal */}
      <DeleteModal
        open={!!deleteId}
        title="Delete Vendor Request"
        message="Are you sure you want to delete this vendor request?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}

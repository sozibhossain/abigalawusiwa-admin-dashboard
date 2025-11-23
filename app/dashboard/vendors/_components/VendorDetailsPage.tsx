"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

import { vendorApi } from "@/lib/api";
import { useToast } from "@/components/toast-provider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type VendorStatus = "pending" | "approved" | "rejected";

interface VendorDetails {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  storeLogo?: string;
  storeName: string;
  storeDescription?: string;
  contactEmail?: string;
  storePhone?: string;
  tradeLicence?: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
  suburb?: string;
  placeName?: string;
  address?: string;
  idCardNumber?: string;
  passport?: string;
  residencePermit?: string;
  customerAgreement?: string;
  equipmentAgreement?: string;
  additionalInfo?: string;
  status: VendorStatus;
  submittedAt?: string;
  adminNotes?: string;
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) {
  if (!value) return null;
  return (
    <div className="mb-4">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm text-gray-900 mt-1 break-words">{value}</p>
    </div>
  );
}

export default function VendorDetailsPage( { verndorId }: { verndorId: string } ) {
  const id  = verndorId
  const router = useRouter();
  const { addToast } = useToast();

  const [vendor, setVendor] = useState<VendorDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await vendorApi.getById(id);
      const data = res.data?.data;
      // support both { data: { request: {...} } } or { data: {...} }
      const v = data?.request || data;
      setVendor(v);
    } catch (error: any) {
      addToast({
        title:
          error?.response?.data?.message ||
          "Failed to load vendor details",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const statusClasses =
    vendor?.status === "approved"
      ? "bg-green-100 text-green-700 border-green-200"
      : vendor?.status === "pending"
      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
      : "bg-red-100 text-red-700 border-red-200";

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="p-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <p className="text-gray-600">Vendor not found.</p>
      </div>
    );
  }

  const location =
    vendor.address ||
    [vendor.city, vendor.country].filter(Boolean).join(", ") ||
    "-";

  return (
    <div className="p-8 space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${statusClasses}`}
        >
          {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left column – profile & basic info */}
            <div className="space-y-6">
              {/* Profile image */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                  {vendor.profileImage || vendor.storeLogo ? (
                    <Image
                      src={vendor.profileImage || vendor.storeLogo!}
                      alt={vendor.name || vendor.storeName}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
                <div>
                  <p className="text-sm text-blue-600 cursor-pointer">
                    Profile Image
                  </p>
                  <p className="font-semibold text-gray-900 mt-2">
                    {vendor.name || "—"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {vendor.storeName}
                  </p>
                </div>
              </div>

              <InfoRow
                label="Description"
                value={vendor.storeDescription}
              />
              <InfoRow label="Email" value={vendor.email} />
              <InfoRow
                label="Contact Email"
                value={vendor.contactEmail}
              />
              <InfoRow
                label="Phone Number"
                value={vendor.storePhone}
              />
              <InfoRow label="Address" value={location} />
              <InfoRow label="Postcode" value={vendor.postcode} />
              <InfoRow label="Additional Info" value={vendor.additionalInfo} />
              <InfoRow label="Admin Notes" value={vendor.adminNotes} />
            </div>

            {/* Middle column – Identification documents */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Identification Documents
              </h3>
              <div className="space-y-4">
                <InfoRow
                  label="ID Card Number"
                  value={vendor.idCardNumber}
                />
                <InfoRow label="Passport" value={vendor.passport} />
                <InfoRow
                  label="Residence Permit"
                  value={vendor.residencePermit}
                />
                {vendor.tradeLicence && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500">
                      Trade Licence
                    </p>
                    <a
                      href={vendor.tradeLicence}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 mt-1 inline-block"
                    >
                      View File
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Right column – Documents */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Documents
              </h3>
              <div className="space-y-4">
                {vendor.customerAgreement && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Customer Agreement
                    </p>
                    <a
                      href={vendor.customerAgreement}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 mt-1 inline-block"
                    >
                      View File
                    </a>
                  </div>
                )}

                {vendor.equipmentAgreement && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Equipment Agreement
                    </p>
                    <a
                      href={vendor.equipmentAgreement}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 mt-1 inline-block"
                    >
                      View File
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

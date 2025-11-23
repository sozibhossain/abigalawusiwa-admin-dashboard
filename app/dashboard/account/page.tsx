"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/toast-provider";
import { accountApi } from "@/lib/api";
import { Upload } from "lucide-react";
import { DeleteModal } from "@/components/delete-modal";
import Image from "next/image";
import ChengePassword from "./_components/chenge-password";

type VendorRequest = {
  storeLogo?: string;
  storeName?: string;
  storeDescription?: string;
  contactEmail?: string;
  storePhone?: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
  suburb?: string;
  placeName?: string;
  address?: string;
  [key: string]: any;
};

export default function AccountPage() {
  const { data: session, status } = useSession();
  const { addToast } = useToast();

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [storeLogoUploading, setStoreLogoUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const storeLogoInputRef = useRef<HTMLInputElement | null>(null);

  const userId = (session?.user as any)?._id || (session?.user as any)?.id;
  const storeId = (session?.user as any)?.storeId;

  const [profileData, setProfileData] = useState({
    // user fields
    name: "",
    email: "",
    dob: "",
    gender: "",
    city: "",
    state: "",
    country: "",
    postcode: "",
    suburb: "",
    placeName: "",
    address: "",

    // vendorRequest fields
    storeName: "",
    storeDescription: "",
    contactEmail: "",
    storePhone: "",
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [storeLogoUrl, setStoreLogoUrl] = useState<string | null>(null);
  const [vendorRequestState, setVendorRequestState] =
    useState<VendorRequest | null>(null);

  // 🔄 Reusable function: get ALL data and show in UI
  const loadProfile = async () => {
    if (!userId) return;
    try {
      setProfileLoading(true);
      const res = await accountApi.getAccountDetails(userId);
      const user = res.data?.data;

      const vendorReq: VendorRequest = user?.vendorRequest || {};

      setVendorRequestState(vendorReq);

      setProfileData({
        name: user?.name ?? "",
        email: user?.email ?? "",
        dob: user?.dob ? user.dob.slice(0, 10) : "",
        gender: user?.gender ?? "",

        city: vendorReq.city || user?.city || "",
        state: vendorReq.state || user?.state || "",
        country: vendorReq.country || user?.country || "",
        postcode: vendorReq.postcode || user?.postcode || "",
        suburb: vendorReq.suburb || user?.suburb || "",
        placeName: vendorReq.placeName || user?.placeName || "",
        address: vendorReq.address || user?.address || "",

        storeName: vendorReq.storeName || "",
        storeDescription: vendorReq.storeDescription || "",
        contactEmail: vendorReq.contactEmail || user?.email || "",
        storePhone: vendorReq.storePhone || "",
      });

      setAvatarUrl(
        user?.profileImage ||
          (session?.user?.image as string | undefined) ||
          null
      );

      setStoreLogoUrl(vendorReq.storeLogo || null);
    } catch (error: any) {
      console.error(error);
      addToast({
        title: error?.response?.data?.message || "Failed to load profile",
        type: "error",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // load once on mount
  useEffect(() => {
    if (!userId || status !== "authenticated") return;
    loadProfile();
  }, [userId, status]); // eslint-disable-line react-hooks/exhaustive-deps

  // 💾 Update ALL mapped data when clicking "Update Profile"
  const handleUpdateProfile = async () => {
    if (!userId) return;

    try {
      setProfileLoading(true);

      const updatedVendorRequest: VendorRequest = {
        ...(vendorRequestState || {}),
        storeName: profileData.storeName,
        storeDescription: profileData.storeDescription,
        contactEmail: profileData.contactEmail,
        storePhone: profileData.storePhone,
        city: profileData.city,
        state: profileData.state,
        country: profileData.country,
        postcode: profileData.postcode,
        suburb: profileData.suburb,
        placeName: profileData.placeName,
        address: profileData.address,
      };

      const body = {
        name: profileData.name,
        email: profileData.email,
        dob: profileData.dob || null,
        gender: profileData.gender || null,
        city: profileData.city,
        state: profileData.state,
        country: profileData.country,
        postcode: profileData.postcode,
        suburb: profileData.suburb,
        placeName: profileData.placeName,
        address: profileData.address,
        vendorRequest: updatedVendorRequest,
      };

      await accountApi.updateAccountDetails(userId, body);
      addToast({ title: "Profile updated successfully", type: "success" });

      // ⬇️ immediately refetch to show latest data from backend
      await loadProfile();
    } catch (error: any) {
      addToast({
        title: error?.response?.data?.message || "Failed to update profile",
        type: "error",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // 📤 Avatar upload
  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !userId) return;
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      setAvatarUploading(true);
      const res = await accountApi.uploadAvatar(userId, formData);
      const user = res.data?.data || res.data;
      const newUrl = user?.profileImage;
      if (newUrl) setAvatarUrl(newUrl);
      addToast({ title: "Avatar updated successfully", type: "success" });

      // optional: refresh all other data too
      await loadProfile();
    } catch (error: any) {
      addToast({
        title: error?.response?.data?.message || "Failed to upload avatar",
        type: "error",
      });
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  // 📤 Store logo upload
  const handleStoreLogoClick = () => storeLogoInputRef.current?.click();

  const handleStoreLogoChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files?.[0] || !storeId) return;
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("storeLogo", file);

    try {
      setStoreLogoUploading(true);
      const res = await accountApi.uploadStoreLogo(storeId, formData);
      const user = res.data?.data || res.data;
      const newLogo =
        user?.vendorRequest?.storeLogo || user?.storeLogo || null;

      if (newLogo) setStoreLogoUrl(newLogo);

      addToast({ title: "Store logo updated successfully", type: "success" });

      // refresh full profile so vendorRequest in state is in sync
      await loadProfile();
    } catch (error: any) {
      addToast({
        title: error?.response?.data?.message || "Failed to upload store logo",
        type: "error",
      });
    } finally {
      setStoreLogoUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Account</h1>

        <div className="flex items-center gap-4">
          <Button
            type="button"
            onClick={() => setShowPasswordForm(true)}
            className="text-sm font-medium bg-blue-600 hover:bg-blue-700"
          >
            Change Password
          </Button>
          <Button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="text-sm font-medium text-red-600 hover:underline bg-transparent"
            variant="ghost"
          >
            Delete Account
          </Button>
        </div>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar + Store logo */}
          <div className="flex items-center gap-8 pb-6 border-b">
            {/* User Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : profileData.name ? (
                  <span className="text-2xl text-white font-bold">
                    {profileData.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <span className="text-2xl text-white font-bold">U</span>
                )}
              </div>

              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={avatarUploading}
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-60"
              >
                <Upload className="w-4 h-4" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Text info */}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {profileData.name || "Vendor"}
              </h3>
              <p className="text-sm text-gray-600">
                {(session?.user as any)?.role || "VENDOR"}
              </p>
              <p className="text-xs text-gray-500 mt-1">{profileData.email}</p>
            </div>

            {/* Store logo preview + upload */}
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1">Store Logo</span>
              <div className="relative w-20 h-20 border rounded-lg overflow-hidden bg-white flex items-center justify-center">
                {storeLogoUrl ? (
                  <Image
                    src={storeLogoUrl}
                    alt="Store Logo"
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-[10px] text-gray-400 text-center px-1">
                    No logo
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleStoreLogoClick}
                  disabled={storeLogoUploading}
                  className="absolute bottom-1 right-1 bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700 disabled:opacity-60"
                >
                  <Upload className="w-3 h-3" />
                </button>

                <input
                  ref={storeLogoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleStoreLogoChange}
                />
              </div>
              {storeLogoUploading && (
                <span className="text-[10px] text-gray-500 mt-1">
                  Uploading...
                </span>
              )}
            </div>
          </div>

          {/* User + Vendor fields (unchanged) */}
          <div className="grid grid-cols-2 gap-4 max-w-4xl">
            {/* USER */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <Input
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <Input
                value={profileData.gender}
                onChange={(e) =>
                  setProfileData({ ...profileData, gender: e.target.value })
                }
                placeholder="male / female / other"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birthday (dob)
              </label>
              <Input
                type="date"
                value={profileData.dob}
                onChange={(e) =>
                  setProfileData({ ...profileData, dob: e.target.value })
                }
              />
            </div>

            {/* STORE INFO (vendorRequest) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Name
              </label>
              <Input
                value={profileData.storeName}
                onChange={(e) =>
                  setProfileData({ ...profileData, storeName: e.target.value })
                }
                placeholder="Fresh Food Market"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Description
              </label>
              <Input
                value={profileData.storeDescription}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    storeDescription: e.target.value,
                  })
                }
                placeholder="Premium grocery"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <Input
                type="email"
                value={profileData.contactEmail}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    contactEmail: e.target.value,
                  })
                }
                placeholder="contact@freshfoodmarket.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Phone
              </label>
              <Input
                value={profileData.storePhone}
                onChange={(e) =>
                  setProfileData({ ...profileData, storePhone: e.target.value })
                }
                placeholder="+1234567890"
              />
            </div>

            {/* ADDRESS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <Input
                value={profileData.city}
                onChange={(e) =>
                  setProfileData({ ...profileData, city: e.target.value })
                }
                placeholder="New York, NY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <Input
                value={profileData.state}
                onChange={(e) =>
                  setProfileData({ ...profileData, state: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <Input
                value={profileData.country}
                onChange={(e) =>
                  setProfileData({ ...profileData, country: e.target.value })
                }
                placeholder="United States"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postcode
              </label>
              <Input
                value={profileData.postcode}
                onChange={(e) =>
                  setProfileData({ ...profileData, postcode: e.target.value })
                }
                placeholder="10001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Suburb
              </label>
              <Input
                value={profileData.suburb}
                onChange={(e) =>
                  setProfileData({ ...profileData, suburb: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Place Name
              </label>
              <Input
                value={profileData.placeName}
                onChange={(e) =>
                  setProfileData({ ...profileData, placeName: e.target.value })
                }
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Address
              </label>
              <Input
                value={profileData.address}
                onChange={(e) =>
                  setProfileData({ ...profileData, address: e.target.value })
                }
                placeholder="123 Main Street, Downtown, New York, NY, United States - 10001"
              />
            </div>
          </div>

          <div className="flex gap-3 max-w-md">
            <Button
              onClick={handleUpdateProfile}
              disabled={profileLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {profileLoading ? "Updating..." : "Update Profile"}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              type="button"
              onClick={loadProfile}
              disabled={profileLoading}
            >
              Reset Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 🔵 Change Password Modal */}
      {showPasswordForm && (
        <ChengePassword onClose={() => setShowPasswordForm(false)} />
      )}

      {/* 🔴 Delete Account Modal (Yes / No) */}
      <DeleteModal
        open={showDeleteModal}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone."
        confirmText="Yes, delete my account"
        onConfirm={() => {
          // TODO: call your real delete API here
          addToast({ title: "Account deletion initiated", type: "success" });
          setShowDeleteModal(false);
        }}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Check, Pencil, Trash2, Plus, X } from "lucide-react";
import { DeleteModal } from "@/components/delete-modal";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  currency: "USD",
  billingCycle: "monthly",
  trialPeriodDays: "",
  isActive: true,
  features: [""], // now an array of feature strings
  usageLimits: {
    maxProducts: "",
    maxStores: "",
    maxUsers: "",
  },
  customDurationDays: "",
};

export default function SubscriptionManagementPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formValues, setFormValues] = useState<any>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // fetch all plans
  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/subscription/get-all`);
      const json = await res.json();

      if (!json.status) {
        throw new Error(json.message || "Failed to fetch subscription plans");
      }

      setPlans(json.data || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // open "Add" modal
  const openCreateModal = () => {
    setEditingId(null);
    setFormValues(emptyForm);
    setIsFormOpen(true);
  };

  // open "Edit" modal
  const openEditModal = (plan: any) => {
    setEditingId(plan._id);
    setFormValues({
      name: plan.name || "",
      description: plan.description || "",
      price: plan.price?.toString() ?? "",
      currency: plan.currency || "USD",
      billingCycle: plan.billingCycle || "monthly",
      trialPeriodDays: plan.trialPeriodDays?.toString() ?? "",
      isActive: plan.isActive ?? true,
      features:
        Array.isArray(plan.features) && plan.features.length > 0
          ? plan.features
          : [""],
      usageLimits: {
        maxProducts: plan.usageLimits?.maxProducts?.toString() ?? "",
        maxStores: plan.usageLimits?.maxStores?.toString() ?? "",
        maxUsers: plan.usageLimits?.maxUsers?.toString() ?? "",
      },
      customDurationDays: plan.customDurationDays?.toString() ?? "",
    });
    setIsFormOpen(true);
  };

  const handleFormChange = (
    field: string,
    value: any,
    isUsageLimit = false
  ) => {
    if (isUsageLimit) {
      setFormValues((prev: any) => ({
        ...prev,
        usageLimits: {
          ...prev.usageLimits,
          [field]: value,
        },
      }));
    } else {
      setFormValues((prev: any) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // features helpers
  const handleFeatureChange = (index: number, value: string) => {
    setFormValues((prev: any) => {
      const next = [...prev.features];
      next[index] = value;
      return { ...prev, features: next };
    });
  };

  const addFeatureField = () => {
    setFormValues((prev: any) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  const removeFeatureField = (index: number) => {
    setFormValues((prev: any) => {
      const next = [...prev.features];
      next.splice(index, 1);
      return { ...prev, features: next.length ? next : [""] };
    });
  };

  // submit create / update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: any = {
      name: formValues.name,
      description: formValues.description,
      price: Number(formValues.price) || 0,
      currency: formValues.currency,
      billingCycle: formValues.billingCycle,
      trialPeriodDays: Number(formValues.trialPeriodDays) || 0,
      isActive: formValues.isActive,
      features: (formValues.features as string[])
        .map((f: string) => f.trim())
        .filter((f: string) => f.length > 0),
      usageLimits: {
        maxProducts: formValues.usageLimits.maxProducts
          ? Number(formValues.usageLimits.maxProducts)
          : undefined,
        maxStores: formValues.usageLimits.maxStores
          ? Number(formValues.usageLimits.maxStores)
          : undefined,
        maxUsers: formValues.usageLimits.maxUsers
          ? Number(formValues.usageLimits.maxUsers)
          : undefined,
      },
      customDurationDays: formValues.customDurationDays
        ? Number(formValues.customDurationDays)
        : undefined,
    };

    const isEdit = Boolean(editingId);

    try {
      const res = await fetch(
        isEdit
          ? `${API_BASE_URL}/subscription/${editingId}`
          : `${API_BASE_URL}/subscription/create`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();
      if (!json.status) {
        throw new Error(json.message || "Save failed");
      }

      // Refresh list
      await fetchPlans();
      setIsFormOpen(false);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // delete handlers
  const openDeleteModal = (plan: any) => {
    setDeleteTarget(plan);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?._id) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${API_BASE_URL}/subscription/delete/${deleteTarget._id}`,
        {
          method: "DELETE",
        }
      );
      const json = await res.json();
      if (!json.status) {
        throw new Error(json.message || "Delete failed");
      }

      setPlans((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      setIsDeleteOpen(false);
      setDeleteTarget(null);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Subscription Plans
          </h1>
          <p className="text-gray-600">
            Manage your subscription plans (add, update, delete).
          </p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Plan
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && <p className="text-sm text-gray-500">Loading...</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan._id}
            className={plan.isActive ? "border-blue-600 border" : "opacity-80"}
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {plan.name}
                </CardTitle>
                <p className="text-xs text-gray-500">
                  {plan.billingCycle?.toUpperCase()} • {plan.currency}{" "}
                  {plan.price}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditModal(plan)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openDeleteModal(plan)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{plan.description}</p>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500">Features</p>
                <div className="space-y-1">
                  {Array.isArray(plan.features) &&
                    plan.features.map((feature: string) => (
                      <div key={feature} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-gray-700">{feature}</span>
                      </div>
                    ))}
                </div>
              </div>

              {plan.usageLimits && (
                <div className="space-y-1 text-xs text-gray-500">
                  <p className="font-semibold">Usage limits</p>
                  {plan.usageLimits.maxProducts != null && (
                    <p>Max products: {plan.usageLimits.maxProducts}</p>
                  )}
                  {plan.usageLimits.maxStores != null && (
                    <p>Max stores: {plan.usageLimits.maxStores}</p>
                  )}
                  {plan.usageLimits.maxUsers != null && (
                    <p>Max users: {plan.usageLimits.maxUsers}</p>
                  )}
                </div>
              )}

              <div className="text-xs text-gray-500 flex items-center justify-between">
                <span>
                  Trial: {plan.trialPeriodDays} days
                  {plan.customDurationDays
                    ? ` • Custom duration: ${plan.customDurationDays} days`
                    : ""}
                </span>
                <span
                  className={plan.isActive ? "text-green-600" : "text-red-500"}
                >
                  {plan.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {!loading && plans.length === 0 && (
          <p className="text-sm text-gray-500">
            No plans found. Create your first plan.
          </p>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Plan" : "Create Plan"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formValues.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formValues.description}
                onChange={(e) =>
                  handleFormChange("description", e.target.value)
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formValues.price}
                  onChange={(e) => handleFormChange("price", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input
                  value={formValues.currency}
                  onChange={(e) => handleFormChange("currency", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Billing cycle</Label>
                <Select
                  value={formValues.billingCycle}
                  onValueChange={(value) =>
                    handleFormChange("billingCycle", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Billing cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Trial period (days)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formValues.trialPeriodDays}
                  onChange={(e) =>
                    handleFormChange("trialPeriodDays", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Dynamic Features */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Features</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={addFeatureField}
                >
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>

              <div className="space-y-2">
                {formValues.features.map(
                  (feature: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Feature ${index + 1}`}
                        value={feature}
                        onChange={(e) =>
                          handleFeatureChange(index, e.target.value)
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeFeatureField(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Max products</Label>
                <Input
                  type="number"
                  min="0"
                  value={formValues.usageLimits.maxProducts}
                  onChange={(e) =>
                    handleFormChange("maxProducts", e.target.value, true)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Max stores</Label>
                <Input
                  type="number"
                  min="0"
                  value={formValues.usageLimits.maxStores}
                  onChange={(e) =>
                    handleFormChange("maxStores", e.target.value, true)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Max users</Label>
                <Input
                  type="number"
                  min="0"
                  value={formValues.usageLimits.maxUsers}
                  onChange={(e) =>
                    handleFormChange("maxUsers", e.target.value, true)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Custom duration (days) – if using custom cycle</Label>
              <Input
                type="number"
                min="0"
                value={formValues.customDurationDays}
                onChange={(e) =>
                  handleFormChange("customDurationDays", e.target.value)
                }
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label className="flex items-center gap-2">
                Active
                <Switch
                  checked={formValues.isActive}
                  onCheckedChange={(checked) =>
                    handleFormChange("isActive", checked)
                  }
                />
              </Label>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {editingId ? "Update Plan" : "Create Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation modal */}
      <DeleteModal
        open={isDeleteOpen}
        title="Delete Subscription Plan"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteOpen(false);
          setDeleteTarget(null);
        }}
        loading={loading}
      />
    </div>
  );
}

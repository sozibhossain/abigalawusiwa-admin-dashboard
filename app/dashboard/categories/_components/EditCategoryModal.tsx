"use client";

import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categoryApi } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

interface ChildCategory {
  _id?: string;
  name: string;
  thumbnail: string;
  thumbFile?: File | null;
}

interface SubCategory {
  _id?: string;
  name: string;
  thumbnail: string;
  thumbFile?: File | null;
  childCategories: ChildCategory[];
}

interface EditCategoryFormProps {
  category: any; // editing existing category
  onCancel: () => void;
  onUpdated: () => void;
  renderThumb: (thumb: string, size?: string) => JSX.Element;
}

function EditCategoryForm({
  category,
  onCancel,
  onUpdated,
  renderThumb,
}: EditCategoryFormProps) {
  const { addToast } = useToast();
  const [mainCategory, setMainCategory] = useState("");
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!category) return;

    setMainCategory(category.mainCategory || "");
    setMainImageFile(null);

    const initialSubs: SubCategory[] =
      category.subCategories?.map((sub: any) => ({
        _id: sub._id,
        name: sub.name || "",
        thumbnail: sub.thumbnail || "",
        thumbFile: null,
        childCategories:
          sub.childCategories?.map((child: any) => ({
            _id: child._id,
            name: child.name || "",
            thumbnail: child.thumbnail || "",
            thumbFile: null,
          })) || [],
      })) || [];

    setSubCategories(initialSubs);
  }, [category]);

  const handleSubNameChange = (index: number, value: string) => {
    setSubCategories((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], name: value };
      return copy;
    });
  };

  const handleSubThumbChange = (index: number, file: File) => {
    setSubCategories((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        thumbFile: file,
      };
      return copy;
    });
  };

  const handleChildNameChange = (
    subIndex: number,
    childIndex: number,
    value: string
  ) => {
    setSubCategories((prev) => {
      const subsCopy = [...prev];
      const sub = { ...subsCopy[subIndex] };
      const childrenCopy = [...sub.childCategories];
      childrenCopy[childIndex] = {
        ...childrenCopy[childIndex],
        name: value,
      };
      sub.childCategories = childrenCopy;
      subsCopy[subIndex] = sub;
      return subsCopy;
    });
  };

  const handleChildThumbChange = (
    subIndex: number,
    childIndex: number,
    file: File
  ) => {
    setSubCategories((prev) => {
      const subsCopy = [...prev];
      const sub = { ...subsCopy[subIndex] };
      const childrenCopy = [...sub.childCategories];
      childrenCopy[childIndex] = {
        ...childrenCopy[childIndex],
        thumbFile: file,
      };
      sub.childCategories = childrenCopy;
      subsCopy[subIndex] = sub;
      return subsCopy;
    });
  };

  const handleAddSubCategory = () => {
    setSubCategories((prev) => [
      ...prev,
      {
        _id: undefined,
        name: "",
        thumbnail: "",
        thumbFile: null,
        childCategories: [],
      },
    ]);
  };

  const handleAddChildCategory = (subIndex: number) => {
    setSubCategories((prev) => {
      const subsCopy = [...prev];
      const sub = { ...subsCopy[subIndex] };
      sub.childCategories = [
        ...sub.childCategories,
        {
          _id: undefined,
          name: "",
          thumbnail: "",
          thumbFile: null,
        },
      ];
      subsCopy[subIndex] = sub;
      return subsCopy;
    });
  };

  const handleRemoveSubCategory = (subIndex: number) => {
    setSubCategories((prev) => prev.filter((_, idx) => idx !== subIndex));
  };

  const handleRemoveChildCategory = (subIndex: number, childIndex: number) => {
    setSubCategories((prev) => {
      const subsCopy = [...prev];
      const sub = { ...subsCopy[subIndex] };
      sub.childCategories = sub.childCategories.filter(
        (_, idx) => idx !== childIndex
      );
      subsCopy[subIndex] = sub;
      return subsCopy;
    });
  };

 const handleSave = async () => {
  if (!category) return;
  setSaving(true);

  try {
    const fd = new FormData();

    // simple fields
    fd.append("mainCategory", mainCategory);

    if (mainImageFile) {
      // ✅ matches: req.files?.mainCategoryImage
      fd.append("mainCategoryImage", mainImageFile);
    }

    // ✅ send structure as JSON (with existing thumbnails)
    fd.append(
      "subCategories",
      JSON.stringify(
        subCategories.map((sub) => ({
          _id: sub._id,
          name: sub.name,
          thumbnail: sub.thumbnail,
          childCategories: sub.childCategories.map((child) => ({
            _id: child._id,
            name: child.name,
            thumbnail: child.thumbnail,
          })),
        }))
      )
    );

    // ✅ send new/updated image files with expected field names
    // IMPORTANT: order here must match backend's indexing logic
    subCategories.forEach((sub, sIdx) => {
      // sub category thumbnail
      if (sub.thumbFile) {
        // matches: req.files?.subCategoryThumbnails[sIdx]
        fd.append("subCategoryThumbnails", sub.thumbFile);
      }

      // child thumbnails
      sub.childCategories.forEach((child, cIdx) => {
        if (child.thumbFile) {
          // backend flattens: fileIdx = sIdx * 10 + cIdx
          // we just need consistent append order
          fd.append("childCategoryThumbnails", child.thumbFile);
        }
      });
    });

    await categoryApi.update(category._id, fd);

    addToast({ title: "Category updated successfully", type: "success" });
    await onUpdated();
  } catch (err: any) {
    addToast({
      title: err?.response?.data?.message || "Failed to update category",
      type: "error",
    });
  } finally {
    setSaving(false);
  }
};


  if (!category) return null;

  return (
    <div className="min-h-[80vh] bg-slate-50 rounded-lg p-4 md:p-6">
      <div className="bg-white rounded-xl border shadow-sm p-6 md:p-8 space-y-8">
        {/* Header + back */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              Edit Category
            </h2>
            <p className="text-sm text-gray-500">
              Update the main category, subcategories and child categories.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={onCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to list</span>
          </Button>
        </div>

        {/* MAIN INFO */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
            Main Info
          </h3>

          <div className="bg-slate-100 p-4 rounded-lg border grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">
                Main Category
              </label>
              <Input
                value={mainCategory}
                onChange={(e) => setMainCategory(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 flex items-center justify-center">
              <div className="flex flex-col items-center justify-center gap-3 bg-white p-4 rounded-lg border">
                {renderThumb(category.mainCategoryImage, "w-24 h-24")}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setMainImageFile(file);
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* SUBCATEGORIES (editable) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                Sub Categories
              </h3>
              <p className="text-xs text-gray-500">
                Manage subcategories and their child categories under this main
                category.
              </p>
            </div>

            <Button size="sm" variant="outline" onClick={handleAddSubCategory}>
              + Add Subcategory
            </Button>
          </div>

          <div className="space-y-3">
            {subCategories.map((sub, subIndex) => (
              <div
                key={sub._id || `new-sub-${subIndex}`}
                className="border rounded-lg p-4 bg-slate-50 space-y-3"
              >
                {/* Sub header row */}
                <div className="flex flex-wrap items-start gap-4">
                  <div className="flex flex-col items-center gap-2 bg-slate-100 p-3 rounded-md border">
                    {renderThumb(sub.thumbnail, "w-20 h-20")}
                    <Input
                      type="file"
                      accept="image/*"
                      className="text-xs"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleSubThumbChange(subIndex, file);
                      }}
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="text-xs font-medium text-gray-600">
                      Subcategory Name
                    </label>
                    <div className="flex gap-2 items-center">
                      <Input
                        placeholder="Subcategory name"
                        value={sub.name}
                        onChange={(e) =>
                          handleSubNameChange(subIndex, e.target.value)
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-red-500"
                        size="sm"
                        onClick={() => handleRemoveSubCategory(subIndex)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Child categories */}
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-700">
                      Child Categories
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddChildCategory(subIndex)}
                    >
                      + Add Child
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {sub.childCategories.map((child, childIndex) => (
                      <div
                        key={child._id || `new-child-${subIndex}-${childIndex}`}
                        className="flex flex-wrap items-center gap-3 bg-slate-100 rounded-md border px-3 py-2"
                      >
                        <div className="flex flex-col items-center gap-2 bg-white p-2 rounded-md border">
                          {renderThumb(child.thumbnail, "w-16 h-16")}
                          <Input
                            type="file"
                            accept="image/*"
                            className="w-40"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleChildThumbChange(
                                  subIndex,
                                  childIndex,
                                  file
                                );
                              }
                            }}
                          />
                        </div>
                        <Input
                          placeholder="Child category name"
                          value={child.name}
                          onChange={(e) =>
                            handleChildNameChange(
                              subIndex,
                              childIndex,
                              e.target.value
                            )
                          }
                          className="flex-1 min-w-[160px]"
                        />

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={() =>
                            handleRemoveChildCategory(subIndex, childIndex)
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ))}

                    {sub.childCategories.length === 0 && (
                      <p className="text-xs text-gray-500">
                        No child categories yet. Click &quot;Add Child&quot; to
                        create one.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {subCategories.length === 0 && (
              <p className="text-xs text-gray-500">
                No subcategories yet. Click &quot;Add Subcategory&quot; to
                create one.
              </p>
            )}
          </div>
        </section>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default EditCategoryForm;

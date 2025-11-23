// app/dashboard/products/edit/[id]/page.tsx
"use client"

import { useEffect, useState, ChangeEvent, FormEvent } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea" // if you don't have this, replace with <textarea>
import { Upload, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/toast-provider"
import { productApi, categoryApi } from "@/lib/api"
import Image from "next/image"

type ProductType = "generalgoods" | "vehicles" | "services"

interface ChildCategory {
  _id: string
  name: string
}

interface SubCategory {
  _id: string
  name: string
  childCategories: ChildCategory[]
}

interface CategoryDoc {
  _id: string
  mainCategory: string
  subCategories: SubCategory[]
}

interface ProductFromApi {
  _id: string
  title: string
  description: string
  deliveryAndReturnPolicy?: string
  mainCategory: string
  category: { _id: string; mainCategory: string }
  subCategory?: string
  childCategory?: string
  price: number
  discountPrice?: number
  tags: string[]
  generalGoods?: {
    stockQuantity?: number
    wholesalePrice?: number
    size?: string
    brand?: string
    measurement?: string
    color?: string[]
  }
  store?: {
    _id: string
  }
}

interface FormState {
  title: string
  description: string
  deliveryPolicy: string
  regularPrice: string
  discountPrice: string
  stockQuantity: string
  wholesalePrice: string
  size: string
  brand: string
  color: string
  tags: string[]
}

const emptyForm: FormState = {
  title: "",
  description: "",
  deliveryPolicy: "",
  regularPrice: "",
  discountPrice: "",
  stockQuantity: "",
  wholesalePrice: "",
  size: "",
  brand: "",
  color: "",
  tags: [],
}

export default function EditProductPage({ productId }: { productId?: string }) {
  const router = useRouter()
  const { addToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [product, setProduct] = useState<ProductFromApi | null>(null)

  const [form, setForm] = useState<FormState>(emptyForm)
  const [tagInput, setTagInput] = useState("")

  const [activeTab, setActiveTab] = useState<ProductType>("generalgoods")

  const [categories, setCategories] = useState<CategoryDoc[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [childCategories, setChildCategories] = useState<ChildCategory[]>([])

  const [selectedMainId, setSelectedMainId] = useState("")
  const [selectedSubId, setSelectedSubId] = useState("")
  const [selectedChildId, setSelectedChildId] = useState("")

  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)

  // ─────────────────────────────
  // Initial load: product + cats
  // ─────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)

        const [prodRes, catRes] = await Promise.all([
          productApi.getById(productId),
          categoryApi.getAll(1, 100),
        ])

        const fetched: ProductFromApi = prodRes.data.data.product
        setProduct(fetched)

        const cats: CategoryDoc[] = catRes.data.data.categories
        setCategories(cats)

        // form state from product
        setForm({
          title: fetched.title || "",
          description: fetched.description || "",
          deliveryPolicy: fetched.deliveryAndReturnPolicy || "",
          regularPrice: String(fetched.price ?? ""),
          discountPrice: String(fetched.discountPrice ?? ""),
          stockQuantity: String(
            fetched.generalGoods?.stockQuantity ?? ""
          ),
          wholesalePrice: String(
            fetched.generalGoods?.wholesalePrice ?? ""
          ),
          size: fetched.generalGoods?.size || "",
          brand: fetched.generalGoods?.brand || "",
          color:
            fetched.generalGoods?.color &&
            fetched.generalGoods.color.length > 0
              ? fetched.generalGoods.color.join(",")
              : "",
          tags: fetched.tags || [],
        })

        // main category tab
        if (fetched.mainCategory === "services") {
          setActiveTab("services")
        } else if (fetched.mainCategory === "vehicles") {
          setActiveTab("vehicles")
        } else {
          setActiveTab("generalgoods")
        }

        // selected category / sub / child
        const mainId = fetched.category?._id || ""
        const subId = fetched.subCategory || ""
        const childId = fetched.childCategory || ""

        setSelectedMainId(mainId)
        setSelectedSubId(subId)
        setSelectedChildId(childId)

        const mainCat = cats.find((c) => c._id === mainId)
        const subs = mainCat ? mainCat.subCategories : []
        setSubCategories(subs)

        const subCat = subs.find((s) => s._id === subId)
        const childs = subCat ? subCat.childCategories : []
        setChildCategories(childs)
      } catch (error: any) {
        console.error(error)
        addToast({
          title:
            error?.response?.data?.message ||
            "Failed to load product",
          type: "error",
        })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [productId, addToast])

  // ─────────────────────────────
  // Handlers
  // ─────────────────────────────
  const handleInput =
    (key: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
    }

  const handleMainChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    setSelectedMainId(id)
    setSelectedSubId("")
    setSelectedChildId("")

    const main = categories.find((c) => c._id === id)
    const subs = main ? main.subCategories : []
    setSubCategories(subs)
    setChildCategories([])
  }

  const handleSubChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    setSelectedSubId(id)
    setSelectedChildId("")

    const sub = subCategories.find((s) => s._id === id)
    const childs = sub ? sub.childCategories : []
    setChildCategories(childs)
  }

  const handleChildChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedChildId(e.target.value)
  }

  const handleAddTag = () => {
    const value = tagInput.trim()
    if (!value) return
    if (form.tags.includes(value)) {
      setTagInput("")
      return
    }
    setForm((prev) => ({ ...prev, tags: [...prev.tags, value] }))
    setTagInput("")
  }

  const handleRemoveTag = (i: number) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, idx) => idx !== i),
    }))
  }

  const onMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setMainImageFile(file)
    setMainImagePreview(URL.createObjectURL(file))
  }

  // ─────────────────────────────
  // Submit update
  // ─────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!product) return

    if (!form.title || !selectedMainId || !selectedChildId) {
      addToast({
        title: "Title, Category and Child Category are required",
        type: "error",
      })
      return
    }

    try {
      setSaving(true)

      const fd = new FormData()

      // Required refs
      if (product.store?._id) {
        fd.append("store", product.store._id)
      }

      fd.append("title", form.title)
      fd.append("description", form.description)
      fd.append("deliveryAndReturnPolicy", form.deliveryPolicy)

      // main category string from tab
      const mainCategoryValue =
        activeTab === "services"
          ? "services"
          : activeTab === "vehicles"
          ? "vehicles"
          : "general goods"

      fd.append("mainCategory", mainCategoryValue)
      fd.append("category", selectedMainId)
      fd.append("subCategory", selectedSubId)
      fd.append("childCategory", selectedChildId)

      fd.append("price", form.regularPrice || "0")
      fd.append("discountPrice", form.discountPrice || "0")

      // general goods – backend probably flattens these into generalGoods object
      fd.append("stockQuantity", form.stockQuantity || "0")
      fd.append("wholesalePrice", form.wholesalePrice || "0")
      fd.append("size", form.size)
      fd.append("brand", form.brand)
      fd.append("measurement", "") // optional – adjust if you use it
      fd.append("color", form.color)

      if (form.tags.length) {
        // your backend in Postman example uses comma separated string
        fd.append("tags", form.tags.join(","))
      }

      if (mainImageFile) {
        fd.append("mainImage", mainImageFile)
      }

      // 🔥 update API
      await productApi.update(productId, fd)

      addToast({
        title: "Product updated successfully",
        type: "success",
      })

      router.push("/dashboard/products")
    } catch (error: any) {
      console.error(error)
      addToast({
        title:
          error?.response?.data?.message ||
          "Failed to update product",
        type: "error",
      })
    } finally {
      setSaving(false)
    }
  }

  // ─────────────────────────────
  // Render
  // ─────────────────────────────
  if (loading || !product) {
    return (
      <div className="p-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <p>Loading product...</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">
            Edit Product – {product.title}
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        {[
          { id: "generalgoods", label: "General Goods" },
          { id: "vehicles", label: "Vehicles" },
          { id: "services", label: "Services" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as ProductType)}
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* LEFT: fields */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.title}
                  onChange={handleInput("title")}
                  placeholder="Enter product title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Detailed Description
                </label>
                <Textarea
                  rows={4}
                  value={form.description}
                  onChange={handleInput("description")}
                />
              </div>

              {/* Delivery */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Delivery & Return Policy
                </label>
                <Textarea
                  rows={3}
                  value={form.deliveryPolicy}
                  onChange={handleInput("deliveryPolicy")}
                />
              </div>

              {/* Category selects */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category (Main)
                  </label>
                  <select
                    value={selectedMainId}
                    onChange={handleMainChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.mainCategory}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Sub Category
                  </label>
                  <select
                    value={selectedSubId}
                    onChange={handleSubChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={!selectedMainId}
                  >
                    <option value="">Select Sub Category</option>
                    {subCategories.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Child Category
                  </label>
                  <select
                    value={selectedChildId}
                    onChange={handleChildChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={!selectedSubId}
                  >
                    <option value="">Select Child Category</option>
                    {childCategories.map((child) => (
                      <option key={child._id} value={child._id}>
                        {child.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Regular Price
                  </label>
                  <Input
                    type="number"
                    value={form.regularPrice}
                    onChange={handleInput("regularPrice")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Discount Price
                  </label>
                  <Input
                    type="number"
                    value={form.discountPrice}
                    onChange={handleInput("discountPrice")}
                  />
                </div>
              </div>

              {/* Extra fields for General goods (you can gate by activeTab) */}
              {activeTab === "generalgoods" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Stock Quantity
                    </label>
                    <Input
                      type="number"
                      value={form.stockQuantity}
                      onChange={handleInput("stockQuantity")}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Wholesale Price
                      </label>
                      <Input
                        type="number"
                        value={form.wholesalePrice}
                        onChange={handleInput("wholesalePrice")}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Size
                      </label>
                      <Input
                        value={form.size}
                        onChange={handleInput("size")}
                        placeholder="e.g. Large"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Brand
                      </label>
                      <Input
                        value={form.brand}
                        onChange={handleInput("brand")}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Colors (comma separated)
                      </label>
                      <Input
                        value={form.color}
                        onChange={handleInput("color")}
                        placeholder="red, black"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <label className="block text-sm font-medium mb-1">
                Tags
              </label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-blue-600"
                >
                  +
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(i)}
                      className="hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: image upload */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Main Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center gap-3">
                <div className="w-40 h-40 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                  {mainImagePreview ? (
                    <Image
                      src={mainImagePreview}
                      alt="Preview"
                      width={160}
                      height={160}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">
                      Current image or placeholder
                    </span>
                  )}
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-sm text-blue-600">
                  <Upload className="w-4 h-4" />
                  <span>Upload New Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onMainImageChange}
                  />
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom buttons (full width) */}
        <div className="lg:col-span-3 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/products")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="bg-blue-600">
            {saving ? "Saving..." : "Update Product"}
          </Button>
        </div>
      </form>
    </div>
  )
}

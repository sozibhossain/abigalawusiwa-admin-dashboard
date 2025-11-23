"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Upload } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/toast-provider"
import { productApi, categoryApi } from "@/lib/api"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useRouter } from "next/navigation"

type ProductType = "generalgoods" | "vehicles" | "services"

interface ProductFormData {
  title: string
  briefDescription: string
  description: string
  deliveryPolicy: string

  // category chain
  categoryId: string
  subCategoryId: string
  childCategory: string // id of child category

  regularPrice: string
  discountPrice: string
  tags: string[]
  document: string
  photo: string
  images: string[]
  stockQuantity?: string
  wholesalePrice?: string
  size?: string
  brands?: string
  colour?: string
  vehicleCondition?: string
  registration?: string
  specialFeatures?: string
  fuelType?: string
  cc?: string
  transmission?: string
  serviceFeatures?: string
}

const initialFormData: ProductFormData = {
  title: "",
  briefDescription: "",
  description: "",
  deliveryPolicy: "",

  categoryId: "",
  subCategoryId: "",
  childCategory: "",

  regularPrice: "",
  discountPrice: "",
  tags: [],
  document: "",
  photo: "",
  images: [],
  stockQuantity: "",
  wholesalePrice: "",
  size: "",
  brands: "",
  colour: "",
  vehicleCondition: "",
  registration: "",
  specialFeatures: "",
  fuelType: "",
  cc: "",
  transmission: "",
  serviceFeatures: "",
}

// ---- Category types -------
interface ChildCategory {
  _id: string
  name: string
  thumbnail?: string
}

interface SubCategory {
  _id: string
  name: string
  thumbnail?: string
  childCategories: ChildCategory[]
}

interface Category {
  _id: string
  mainCategory: string
  mainCategoryImage?: string
  subCategories: SubCategory[]
}

export default function AddEditProductPage({ productId }: { productId?: string }) {
  const [activeTab, setActiveTab] = useState<ProductType>("generalgoods")
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const { addToast } = useToast()
  const router = useRouter()
  const { data: session } = useSession()

  const isEditing = !!productId

  console.log(isEditing)
  const storeId = (session?.user as any)?.storeId

  // categories from API
  const [categories, setCategories] = useState<Category[]>([])

  // main image upload
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement | null>(null)

  // ─────────────────────────────
  // Helpers: mapping mainCategory <-> tab
  // ─────────────────────────────
  const tabToMainCategory = (tab: ProductType) => {
    if (tab === "vehicles") return "vehicles"
    if (tab === "services") return "services"
    return "general goods"
  }

  const mainCategoryToTab = (main: string): ProductType => {
    const m = main.toLowerCase()
    if (m === "vehicles") return "vehicles"
    if (m === "services") return "services"
    return "generalgoods"
  }

  // ─────────────────────────────
  // Load categories
  // ─────────────────────────────
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryApi.getAll(1, 50)
        const cats: Category[] = res.data?.data?.categories || []
        setCategories(cats)
      } catch (err) {
        addToast({ title: "Failed to load categories", type: "error" })
      }
    }
    loadCategories()
  }, [addToast])

  // ─────────────────────────────
  // Load product if editing
  // ─────────────────────────────
  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setLoading(false)
        return
      }
      try {
        const res = await productApi.getById(productId)
        const p = res.data.data

        setFormData((prev) => ({
          ...prev,
          title: p.title || "",
          briefDescription: p.briefDescription || "",
          description: p.description || "",
          deliveryPolicy: p.deliveryAndReturnPolicy || "",

          categoryId: p.category?._id || "",
          subCategoryId: p.subCategory?._id || "",
          childCategory: p.childCategory?._id || "",

          regularPrice: String(p.price || ""),
          discountPrice: String(p.discountPrice || ""),
          tags: p.tags || [],
          stockQuantity: p.generalGoods?.stockQuantity || "",
          wholesalePrice: p.generalGoods?.wholesalePrice || "",
          size: p.generalGoods?.size || "",
          brands: p.generalGoods?.brand || "",
          colour: p.generalGoods?.color?.[0] || "",
          vehicleCondition: p.vehicleCondition || "",
          registration: p.registration || "",
          specialFeatures: p.specialFeatures || "",
          fuelType: p.fuelType || "",
          cc: p.cc || "",
          transmission: p.transmission || "",
          serviceFeatures: p.serviceFeatures || "",
        }))

        if (p.mainCategory) {
          setActiveTab(mainCategoryToTab(p.mainCategory))
        }

        if (p.mainImage || p.photo) {
          setMainImagePreview(p.mainImage || p.photo)
        }

        setLoading(false)
      } catch (err) {
        addToast({ title: "Failed to load product", type: "error" })
        setLoading(false)
      }
    }

    loadProduct()
  }, [productId, addToast])

  // ─────────────────────────────
  // Derived category options for current tab
  // ─────────────────────────────
  const currentMainCategoryLabel = tabToMainCategory(activeTab)

  const filteredCategories = categories.filter(
    (c) => c.mainCategory.toLowerCase() === currentMainCategoryLabel.toLowerCase(),
  )

  const selectedCategory = filteredCategories.find(
    (c) => c._id === formData.categoryId,
  )

  const subCategoryOptions: SubCategory[] = selectedCategory?.subCategories || []

  const selectedSubCategory = subCategoryOptions.find(
    (s) => s._id === formData.subCategoryId,
  )

  const childCategoryOptions: ChildCategory[] =
    selectedSubCategory?.childCategories || []

  // ─────────────────────────────
  // Tags
  // ─────────────────────────────
  const handleAddTag = () => {
    if (tagInput.trim()) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }))
      setTagInput("")
    }
  }

  const handleRemoveTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }))
  }

  // ─────────────────────────────
  // Image upload (main image)
  // ─────────────────────────────
  const handlePhotoClick = () => photoInputRef.current?.click()

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setMainImageFile(file)
    setMainImagePreview(URL.createObjectURL(file))
  }

  // ─────────────────────────────
  // Submit Form → create / update
  // ─────────────────────────────
  const handleConfirm = async () => {
    if (!formData.title || !formData.childCategory || !formData.subCategoryId || !formData.categoryId) {
      addToast({ title: "Please fill in all required fields", type: "error" })
      return
    }

    if (!storeId) {
      addToast({ title: "Store ID is missing. Please re-login.", type: "error" })
      return
    }

    try {
      setSubmitting(true)

      const fd = new FormData()

      // core product info
      fd.append("store", storeId)
      fd.append("title", formData.title)
      fd.append("description", formData.description)
      fd.append("deliveryAndReturnPolicy", formData.deliveryPolicy)

      // 🔗 category chain (matches your Postman body)
      fd.append("category", formData.categoryId)
      fd.append("subCategory", formData.subCategoryId)
      fd.append("childCategory", formData.childCategory)

      const mainCategoryStr = tabToMainCategory(activeTab) // "general goods" / "vehicles" / "services"
      fd.append("mainCategory", mainCategoryStr)

      // numbers & pricing
      fd.append("stockQuantity", formData.stockQuantity || "")
      fd.append("price", formData.regularPrice || "0")
      fd.append("discountPrice", formData.discountPrice || "0")
      fd.append("wholesalePrice", formData.wholesalePrice || "")

      // general goods extras
      fd.append("size", formData.size || "")
      fd.append("brand", formData.brands || "")
      fd.append("measurement", "") // optional – you can wire a field if needed
      fd.append("color", formData.colour || "")

      // vehicle / service extras
      if (activeTab === "vehicles") {
        fd.append("vehicleCondition", formData.vehicleCondition || "")
        fd.append("registration", formData.registration || "")
        fd.append("specialFeatures", formData.specialFeatures || "")
        fd.append("fuelType", formData.fuelType || "")
        fd.append("cc", formData.cc || "")
        fd.append("transmission", formData.transmission || "")
      } else if (activeTab === "services") {
        fd.append("serviceFeatures", formData.serviceFeatures || "")
      }

      // tags – backend in screenshot uses comma-separated string
      if (formData.tags.length) {
        fd.append("tags", formData.tags.join(","))
      }

      // main image
      if (mainImageFile) {
        fd.append("mainImage", mainImageFile)
      }

      if (isEditing) {
        await productApi.update(productId!, fd)
        addToast({ title: "Product updated successfully", type: "success" })
      } else {
        await productApi.create(fd)
        addToast({ title: "Product created successfully", type: "success" })
        router.push("/dashboard/products")
      }
    } catch (e) {
      console.error(e)
      addToast({ title: "Something went wrong", type: "error" })
    } finally {
      setSubmitting(false)
    }
  }

  // ─────────────────────────────
  // Field groups
  // ─────────────────────────────
  const renderCommonFields = () => (
    <>
      <div>
        <label className="block text-sm font-medium mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter product title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Detailed Description</label>
        <textarea
          rows={4}
          className="w-full px-3 py-2 border rounded-lg"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Brief Description</label>
        <textarea
          rows={3}
          className="w-full px-3 py-2 border rounded-lg"
          value={formData.briefDescription}
          onChange={(e) =>
            setFormData({ ...formData, briefDescription: e.target.value })
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Delivery &amp; Return Policy
        </label>
        <textarea
          rows={3}
          className="w-full px-3 py-2 border rounded-lg"
          value={formData.deliveryPolicy}
          onChange={(e) =>
            setFormData({ ...formData, deliveryPolicy: e.target.value })
          }
        />
      </div>

      {/* Category Chain Selects */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category (top-level doc) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) =>
              setFormData({
                ...formData,
                categoryId: e.target.value,
                subCategoryId: "",
                childCategory: "",
              })
            }
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Select Category</option>
            {filteredCategories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.mainCategory}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Subcategory <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.subCategoryId}
            onChange={(e) =>
              setFormData({
                ...formData,
                subCategoryId: e.target.value,
                childCategory: "",
              })
            }
            className="w-full px-3 py-2 border rounded-lg"
            disabled={!formData.categoryId}
          >
            <option value="">Select Subcategory</option>
            {subCategoryOptions.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* Child category */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Child Category <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.childCategory}
            onChange={(e) =>
              setFormData({ ...formData, childCategory: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            disabled={!formData.subCategoryId}
          >
            <option value="">Select Child Category</option>
            {childCategoryOptions.map((child) => (
              <option key={child._id} value={child._id}>
                {child.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Regular Price</label>
          <Input
            type="number"
            value={formData.regularPrice}
            onChange={(e) =>
              setFormData({ ...formData, regularPrice: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Discount Price</label>
          <Input
            type="number"
            value={formData.discountPrice}
            onChange={(e) =>
              setFormData({ ...formData, discountPrice: e.target.value })
            }
          />
        </div>
      </div>
    </>
  )

  const renderGeneralGoodsFields = () => (
    <>
      {renderCommonFields()}
      <div>
        <label className="block text-sm font-medium mb-2">Stock Quantity</label>
        <Input
          type="number"
          value={formData.stockQuantity}
          onChange={(e) =>
            setFormData({ ...formData, stockQuantity: e.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Wholesale Price</label>
          <Input
            type="number"
            value={formData.wholesalePrice}
            onChange={(e) =>
              setFormData({ ...formData, wholesalePrice: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Size</label>
          <select
            value={formData.size}
            onChange={(e) =>
              setFormData({ ...formData, size: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Select Size</option>
            <option>Small</option>
            <option>Medium</option>
            <option>Large</option>
            <option>XL</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Brand</label>
          <Input
            value={formData.brands}
            onChange={(e) =>
              setFormData({ ...formData, brands: e.target.value })
            }
            placeholder="Adidas"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Color</label>
          <Input
            value={formData.colour}
            onChange={(e) =>
              setFormData({ ...formData, colour: e.target.value })
            }
            placeholder="red,black"
          />
        </div>
      </div>
    </>
  )

  const renderVehiclesFields = () => (
    <>
      {renderCommonFields()}
      <div>
        <label className="block text-sm font-medium mb-2">Special Features</label>
        <Input
          value={formData.specialFeatures}
          onChange={(e) =>
            setFormData({ ...formData, specialFeatures: e.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Vehicle Condition</label>
          <select
            value={formData.vehicleCondition}
            onChange={(e) =>
              setFormData({ ...formData, vehicleCondition: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Select</option>
            <option>new</option>
            <option>used</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Registration</label>
          <select
            value={formData.registration}
            onChange={(e) =>
              setFormData({ ...formData, registration: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Select</option>
            <option>registered</option>
            <option>unregistered</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Fuel Type</label>
          <Input
            value={formData.fuelType}
            onChange={(e) =>
              setFormData({ ...formData, fuelType: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">CC</label>
          <Input
            value={formData.cc}
            onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Transmission</label>
          <Input
            value={formData.transmission}
            onChange={(e) =>
              setFormData({ ...formData, transmission: e.target.value })
            }
          />
        </div>
      </div>
    </>
  )

  const renderServicesFields = () => (
    <>
      {renderCommonFields()}
      <div>
        <label className="block text-sm font-medium mb-2">Service Features</label>
        <Input
          value={formData.serviceFeatures}
          onChange={(e) =>
            setFormData({ ...formData, serviceFeatures: e.target.value })
          }
        />
      </div>
    </>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case "vehicles":
        return renderVehiclesFields()
      case "services":
        return renderServicesFields()
      default:
        return renderGeneralGoodsFields()
    }
  }

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="text-3xl font-bold">
          {isEditing ? "Edit Product" : "Add New Product"}
        </h1>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORM LEFT */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">{renderTabContent()}</CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>

                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                  />
                  <Button onClick={handleAddTag} className="bg-blue-600">
                    +
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(index)}
                        className="text-blue-800 hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* IMAGE UPLOAD */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Photo</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center flex flex-col items-center gap-3 cursor-pointer"
                onClick={handlePhotoClick}
              >
                {mainImagePreview ? (
                  <div className="w-full h-40 relative mb-2">
                    <Image
                      src={mainImagePreview}
                      alt="Product"
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Drag &amp; drop or click to upload
                    </p>
                  </>
                )}

                <Button className="mt-2 bg-blue-600" type="button">
                  {mainImagePreview ? "Change Image" : "Upload Image"}
                </Button>

                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4">
        <Link href="/dashboard/products">
          <Button variant="outline" className="border-red-500 text-red-500">
            Cancel
          </Button>
        </Link>

        <Button onClick={handleConfirm} className="bg-blue-600" disabled={submitting}>
          {submitting ? "Saving..." : "Confirm"}
        </Button>
      </div>
    </div>
  )
}

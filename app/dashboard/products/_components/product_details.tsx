"use client"

import { useEffect, useState } from "react"
import { productApi, categoryApi } from "@/lib/api"

type ChildCategory = {
  _id: string
  name: string
}

type SubCategory = {
  _id: string
  name: string
  childCategories: ChildCategory[]
}

type CategoryDoc = {
  _id: string
  mainCategory: string
  subCategories: SubCategory[]
}

export default function ProductDetails({ productId }: { productId: string }) {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [subCategoryName, setSubCategoryName] = useState<string>("")
  const [childCategoryName, setChildCategoryName] = useState<string>("")

  useEffect(() => {
    if (!productId) return
    fetchData()
  }, [productId])

  const fetchData = async () => {
    try {
      setLoading(true)

      // 1) Get product
      const prodRes = await productApi.getById(productId)
      const data = prodRes.data.data
      const p = data.product || data // just in case

      setProduct(p)

      // 2) Get categories to resolve names
      const catRes = await categoryApi.getAll(1, 100)
      const categories: CategoryDoc[] = catRes.data.data.categories

      let subName = ""
      let childName = ""

      categories.forEach((main) => {
        main.subCategories.forEach((sub) => {
          if (sub._id === p.subCategory) {
            subName = sub.name
          }
          sub.childCategories.forEach((child) => {
            if (child._id === p.childCategory) {
              childName = child.name
              if (!subName) subName = sub.name
            }
          })
        })
      })

      setSubCategoryName(subName)
      setChildCategoryName(childName)
    } catch (err) {
      console.error("Failed to fetch product:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-6">Loading product details...</div>
  if (!product) return <div className="p-6">Product not found</div>

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{product.title}</h1>

      <p>
        <strong>Main Category:</strong>{" "}
        {product.mainCategory || product.category?.mainCategory || "-"}
      </p>
      <p>
        <strong>Sub Category:</strong>{" "}
        {subCategoryName || product.subCategory || "-"}
      </p>
      <p>
        <strong>Child Category:</strong>{" "}
        {childCategoryName || product.childCategory || "-"}
      </p>

      <p>
        <strong>Price:</strong> ${product.price}
      </p>
      <p>
        <strong>Discount Price:</strong>{" "}
        {product.discountPrice ? `$${product.discountPrice}` : "-"}
      </p>

      <div>
        <strong>Description:</strong>
        <p className="text-gray-700 mt-1">{product.description}</p>
      </div>

      {product.deliveryAndReturnPolicy && (
        <div>
          <strong>Delivery & Return Policy:</strong>
          <p className="text-gray-700 mt-1">
            {product.deliveryAndReturnPolicy}
          </p>
        </div>
      )}

      {product.tags && product.tags.length > 0 && (
        <div className="mt-4">
          <strong>Tags:</strong>
          <div className="flex gap-2 flex-wrap mt-1">
            {product.tags.map((tag: string, i: number) => (
              <span
                key={i}
                className="px-3 py-1 bg-gray-200 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Example: show some store info */}
      {product.store && (
        <div className="mt-4 text-sm text-gray-700">
          <strong>Store:</strong> {product.store.storeName} (
          {product.store.contactEmail})
        </div>
      )}
    </div>
  )
}

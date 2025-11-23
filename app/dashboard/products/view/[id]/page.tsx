"use client"

import { useParams } from "next/navigation"
import ProductDetails from "../../_components/product_details"

export default function ViewProductPage() {
  const { id } = useParams()

  return <ProductDetails productId={id as string} />
}

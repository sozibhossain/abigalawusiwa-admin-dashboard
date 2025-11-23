"use client"

import { useParams } from "next/navigation"
import EditProductPage from "../../_components/EditProductPage"

export default function EditProduct() {
  const { id } = useParams()  

  console.log(id, "IIIIIIIIIIIIIII")

  return <EditProductPage productId={id as string} />
}

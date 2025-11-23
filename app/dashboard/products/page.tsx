import React from "react";
import ProductsPage from "./_components/products-page";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

function Page() {
  return (
    <div className="">
      <div className="flex items-center justify-between mb-6 p-8">
        <h1 className="text-3xl font-bold text-gray-900">Product Inventory</h1>
      </div>

      <ProductsPage />
    </div>
  );
}

export default Page;

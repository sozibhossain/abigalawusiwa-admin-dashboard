"use client"

import { Fragment, useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/toast-provider"
import { categoryApi } from "@/lib/api"
import EditCategoryForm from "./EditCategoryModal"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [editingCategory, setEditingCategory] = useState<any | null>(null)

  const { addToast } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAll(1, 50)
      setCategories(res.data.data.categories)
    } catch (err) {
      addToast({ title: "Failed to load categories", type: "error" })
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const openEdit = (cat: any) => {
    setEditingCategory(cat)
  }

  const filteredCategories = categories.filter((c) =>
    c.mainCategory.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // fallback thumbnail renderer
  const renderThumb = (thumb: string, size = "w-10 h-10") => {
    if (!thumb || thumb.trim() === "") {
      return (
        <div
          className={`rounded-md ${size} flex items-center justify-center bg-gradient-to-br from-purple-200 to-indigo-300 text-white text-xs`}
        >
          No Img
        </div>
      )
    }

    return (
      <img
        src={thumb}
        className={`${size} rounded-md object-cover`}
        alt="thumbnail"
      />
    )
  }

  const showList = !editingCategory

  return (
    <div className="p-8 space-y-6">
      {showList ? (
        <>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search categories…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      Products
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCategories.map((cat) => (
                    <Fragment key={cat._id}>
                      {/* MAIN CATEGORY ROW */}
                      <tr
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleExpand(cat._id)}
                      >
                        <td className="px-4 py-3 text-gray-900 font-medium flex items-center gap-3">
                          {renderThumb(cat.mainCategoryImage)}
                          {cat.mainCategory}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {cat.productCount}
                        </td>

                        <td className="px-4 py-3">
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Active
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation() // don’t toggle expand
                              openEdit(cat)
                            }}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>

                      {/* Animated Expand Section */}
                      <AnimatePresence>
                        {expandedId === cat._id && (
                          <motion.tr
                            key={`${cat._id}-expand`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.35 }}
                            className="bg-gray-50 overflow-hidden"
                          >
                            <td colSpan={4} className="p-4">
                              <div className="space-y-6">
                                {cat.subCategories.map((sub: any) => (
                                  <motion.div
                                    key={sub._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white p-4 rounded-lg border shadow-sm"
                                  >
                                    <div className="flex items-center gap-3">
                                      {renderThumb(sub.thumbnail)}
                                      <h3 className="text-lg font-semibold capitalize">
                                        {sub.name}
                                      </h3>
                                    </div>

                                    {/* CHILD CATEGORIES */}
                                    <div className="ml-12 mt-3 grid grid-cols-2 gap-3">
                                      {sub.childCategories.map(
                                        (child: any) => (
                                          <motion.div
                                            key={child._id}
                                            initial={{
                                              opacity: 0,
                                              x: -10,
                                            }}
                                            animate={{
                                              opacity: 1,
                                              x: 0,
                                            }}
                                            transition={{ duration: 0.25 }}
                                            className="flex items-center gap-2"
                                          >
                                            {renderThumb(
                                              child.thumbnail,
                                              "w-8 h-8",
                                            )}
                                            <span className="text-gray-700 capitalize text-sm">
                                              {child.name}
                                            </span>
                                          </motion.div>
                                        ),
                                      )}
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      ) : (
        <EditCategoryForm
          category={editingCategory}
          renderThumb={renderThumb}
          onCancel={() => setEditingCategory(null)}
          onUpdated={async () => {
            await fetchCategories()
            setEditingCategory(null)
          }}
        />
      )}
    </div>
  )
}

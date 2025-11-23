export const dummyProducts = [
  {
    id: 1,
    title: "Premium Headphones",
    category: "Electronics",
    price: 299.99,
    discount: 249.99,
    stock: 45,
    status: "Active",
    image: "/diverse-people-listening-headphones.png",
  },
  {
    id: 2,
    title: "Wireless Mouse",
    category: "Electronics",
    price: 49.99,
    discount: 39.99,
    stock: 120,
    status: "Active",
    image: "/field-mouse.png",
  },
]

export const dummyCategories = [
  { id: 1, name: "Electronics", status: "Active" },
  { id: 2, name: "Clothing", status: "Active" },
  { id: 3, name: "Books", status: "Inactive" },
]

export const dummyOrders = [
  {
    id: "#O-001",
    customer: "John Doe",
    date: "2024-01-15",
    amount: "$299.99",
    status: "Delivered",
  },
  {
    id: "#O-002",
    customer: "Jane Smith",
    date: "2024-01-14",
    amount: "$149.99",
    status: "Processing",
  },
]

export const dummyCustomers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    orders: 5,
    totalSpent: "$1,299.99",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+0987654321",
    orders: 3,
    totalSpent: "$599.99",
  },
]

export const dummyCoupons = [
  {
    id: 1,
    code: "SAVE20",
    discount: "20%",
    validity: "2024-12-31",
    status: "Active",
  },
  {
    id: 2,
    code: "WELCOME10",
    discount: "10%",
    validity: "2024-06-30",
    status: "Expired",
  },
]

export const dummyStaff = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@example.com",
    phone: "+1234567890",
    role: "Admin",
    status: "Active",
  },
  {
    id: 2,
    name: "Support User",
    email: "support@example.com",
    phone: "+0987654321",
    role: "Support",
    status: "Active",
  },
]

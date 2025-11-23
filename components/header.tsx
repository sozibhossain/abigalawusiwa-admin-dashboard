"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  MessageCircleMore,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/toast-provider";
import { DeleteModal } from "./delete-modal";
import Image from "next/image";

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { addToast } = useToast();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    addToast({ title: "Logged out successfully", type: "success" });
    router.push("/auth/login");
    setShowLogoutModal(false);
  };

  return (
    <>
      <header className="bg-[#E8F0F8] border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search"
              className="pl-10 bg-white border-gray-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/notifications"
            className="p-2 hover:bg-blue-600 hover:text-white rounded-lg"
          >
            <Bell className="w-5 h-5 hover:text-white" />
          </Link>
          <Link
            href="/dashboard/messages"
            className="p-2 hover:bg-blue-600 hover:text-white rounded-lg"
          >
            <MessageCircleMore className="w-5 h-5 hover:text-white" />
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity overflow-hidden">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image || "/placeholder.svg"}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-4 py-2 border-b">
                <p className="text-xs text-gray-500">{session?.user?.role}</p>
              </div>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/account" className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <DeleteModal
        open={showLogoutModal}
        title="Log Out"
        message="Are you sure you want to log out?"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}

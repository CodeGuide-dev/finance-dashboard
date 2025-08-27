"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from "@/lib/auth-client"
import {
  IconChartBar,
  IconDashboard,
  IconFile,
  IconFolder,
  IconMoneybag,
  IconReport,
  IconSettings,
  IconTrendingUp,
  IconUser,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"

const staticData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Transactions",
      url: "/dashboard/transactions",
      icon: IconMoneybag,
    },
    {
      title: "Assets",
      url: "/dashboard/assets",
      icon: IconFolder,
    },
    {
      title: "Investments",
      url: "/dashboard/investments",
      icon: IconTrendingUp,
    },
    {
      title: "Documents",
      url: "/dashboard/documents",
      icon: IconFile,
    },
  ],
  navClouds: [],
  navSecondary: [
    {
      title: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
  ],
  documents: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const router = useRouter()
  
  const handleSignOut = async () => {
    await signOut()
    router.push("/sign-in")
  }

  const userData = session?.user ? {
    name: session.user.name || "User",
    email: session.user.email,
    avatar: session.user.image || "/codeguide-logo.png",
  } : {
    name: "Guest",
    email: "guest@example.com", 
    avatar: "/codeguide-logo.png",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <span className="text-base font-semibold font-parkinsans">Finance Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={staticData.navMain} />
        <NavSecondary items={staticData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser 
          user={userData} 
          onSignOut={handleSignOut}
        />
      </SidebarFooter>
    </Sidebar>
  )
}

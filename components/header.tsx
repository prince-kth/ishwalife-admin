"use client"

import { Settings, User, LogOut, Crown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { CommandMenu } from "./command-menu"
import { Badge } from "@/components/ui/badge"
import { useThemeStore } from "@/lib/theme-store"
import { cn } from "@/lib/utils"
// import { useSession } from "next-auth/react"

export function Header() {
  const router = useRouter()
  const { accentColor } = useThemeStore()
  // const { data: session } = useSession()

  const handleLogout = () => {
    document.cookie = "isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    router.push("/login")
  }

  const getAvatarStyles = () => {
    const styles = {
      blue: {
        base: "bg-blue-50 text-blue-600",
        hover: "from-blue-600 to-blue-700",
        avatar: "from-blue-600 to-blue-700",
        avatarBg: "bg-blue-600",
        badge: "border-blue-100 bg-blue-50 text-blue-600"
      },
      green: {
        base: "bg-green-50 text-green-600",
        hover: "from-green-600 to-green-700",
        avatar: "from-green-600 to-green-700",
        avatarBg: "bg-green-600",
        badge: "border-green-100 bg-green-50 text-green-600"
      },
      purple: {
        base: "bg-purple-50 text-purple-600",
        hover: "from-purple-600 to-purple-700",
        avatar: "from-purple-600 to-purple-700",
        avatarBg: "bg-purple-600",
        badge: "border-purple-100 bg-purple-50 text-purple-600"
      },
      rose: {
        base: "bg-rose-50 text-rose-600",
        hover: "from-rose-600 to-rose-700",
        avatar: "from-rose-600 to-rose-700",
        avatarBg: "bg-rose-600",
        badge: "border-rose-100 bg-rose-50 text-rose-600"
      },
      amber: {
        base: "bg-amber-50 text-amber-600",
        hover: "from-amber-600 to-amber-700",
        avatar: "from-amber-600 to-amber-700",
        avatarBg: "bg-amber-600",
        badge: "border-amber-100 bg-amber-50 text-amber-600"
      },
      teal: {
        base: "bg-teal-50 text-teal-600",
        hover: "from-teal-600 to-teal-700",
        avatar: "from-teal-600 to-teal-700",
        avatarBg: "bg-teal-600",
        badge: "border-teal-100 bg-teal-50 text-teal-600"
      }
    }
    return styles[accentColor]
  }

  const styles = getAvatarStyles()

  return (
    <header className="sticky top-0 z-50 border-b bg-gradient-to-b from-white to-slate-50/80 backdrop-blur-sm">
      <div className="flex h-16 items-center px-6 gap-4">
        <div className="flex-1 flex items-center gap-4">
          <CommandMenu />
        </div>

        <div className="flex items-center gap-6">
          <button className="relative group">
            <div
              className={cn(
                "absolute -inset-0.5 bg-gradient-to-r rounded-full blur opacity-0 group-hover:opacity-30 transition duration-200",
                styles.hover,
              )}
            ></div>
          </button>

          <div className="h-8 w-px bg-slate-200"></div>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 rounded-full hover:bg-white/80 p-2 pr-4 transition-all duration-200 border border-transparent hover:border-slate-200/50 hover:shadow-sm">
              <div className="relative">
                <div
                  className={cn("absolute -inset-0.5 bg-gradient-to-r rounded-full blur opacity-10", styles.avatar)}
                ></div>
                <Avatar className="relative h-9 w-9 border-2 border-white">
                  <AvatarImage src="./logo-orange - sidebar.png" alt="Ishavaa Life" />
                  <AvatarFallback className={cn("text-white", styles.avatarBg)}>IL</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">Ishavaa Life</span>
                  <Badge
                    variant="secondary"
                    className={cn("gap-1 flex items-center px-2 shadow-sm border", styles.badge)}
                  >
                    <Crown className="h-3 w-3" /> Admin
                  </Badge>
                </div>
                <span className="text-xs text-slate-500">admin@gmail.com</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2">
              <DropdownMenuLabel className="p-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                    <AvatarImage src="./logo-orange - sidebar.png" alt="Ishavaa Life" />
                    <AvatarFallback className={cn("text-white", styles.avatarBg)}>IL</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900">Ishavaa Life</span>
                    <span className="text-xs text-slate-500">admin@gmail.com</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              {/* <div className="px-2 py-2.5 mt-1.5 bg-gradient-to-br from-purple-50 via-blue-50/50 to-white rounded-lg border border-purple-100/50">
                <div className="flex items-center gap-3 px-2">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Wallet className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-purple-600">Available Balance</div>
                    <div className="text-lg font-semibold text-slate-900">$2,850.00</div>
                  </div>f
                </div>
              </div> */}
              <div className="my-2 px-1">
                <div className="h-px bg-slate-200"></div>
              </div>
              <div className="px-1">
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg flex items-center gap-3 h-[42px] px-2 hover:bg-slate-50"
                  onClick={() => router.push("/profile")}
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${styles.base}`}>
                    <User className={`h-4 w-4 ${styles.avatar}`} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-900 styles.avatarBg">View Profile</span>
                    <span className="text-xs text-slate-500">Account settings and more</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg flex items-center gap-3 h-[42px] px-2 hover:bg-slate-50"
                  onClick={() => router.push("/settings")}
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${styles.base}`}>
                    <Settings className={`h-4 w-4 ${styles.avatar}`}/>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-900">Settings</span>
                    <span className="text-xs text-slate-500">Preferences & customization</span>
                  </div>
                </DropdownMenuItem>
              </div>
              <div className="my-2 px-1">
                <div className="h-px bg-slate-200"></div>
              </div>
              <div className="px-1">
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg flex items-center gap-3 h-[42px] px-2 hover:bg-red-50 text-red-600"
                  onClick={handleLogout}
                >
                  <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center">
                    <LogOut className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Log Out</span>
                    <span className="text-xs">Sign out of your account</span>
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}


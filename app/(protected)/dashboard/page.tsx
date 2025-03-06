'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, FileText, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { useThemeStore } from "@/lib/theme-store"

// Types for our dashboard data
interface DashboardStats {
  totalUsers: number
  totalTransactions: number
  totalReport: number
}

interface Transaction {
  id: string
  userId: number
  amount: number
  type: 'credit' | 'debit'
  status: string
  timestamp: string
  description: string
  user: {
    name: string
    email: string
  }
}

interface TransactionsResponse {
  transactions: Transaction[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTransactions: 0,
    totalReport: 0
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true)
  const { accentColor } = useThemeStore()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setIsLoadingTransactions(true)

        // Fetch dashboard stats
        const statsResponse = await fetch('/api/dashboard/stats')
        if (!statsResponse.ok) throw new Error('Failed to fetch dashboard stats')
        const statsData = await statsResponse.json()
        setStats(statsData)

        // Fetch recent transactions
        const transactionsResponse = await fetch('/api/users/transactions?limit=5')
        if (!transactionsResponse.ok) throw new Error('Failed to fetch transactions')
        const transactionsData: TransactionsResponse = await transactionsResponse.json()
        setTransactions(transactionsData.transactions)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
        setIsLoadingTransactions(false)
      }
    }

    fetchData()
  }, [])

  const getThemeColors = () => {
    const colors = {
      blue: {
        stats: "text-blue-500",
        bar: "#3498db",
        header: "from-blue-600 to-blue-700"
      },
      green: {
        stats: "text-green-500",
        bar: "#169746",
        header: "from-green-600 to-green-700"
      },
      purple: {
        stats: "text-purple-500",
        bar: "#7A288A",
        header: "from-purple-600 to-purple-700"
      },
      rose: {
        stats: "text-rose-500",
        bar: "#D21843",
        header: "from-rose-600 to-rose-700"
      },
      amber: {
        stats: "text-amber-500",
        bar: "#af621a",
        header: "from-amber-600 to-amber-700"
      },
      teal: {
        stats: "text-teal-500",
        bar: "#0E887D",
        header: "from-teal-600 to-teal-700"
      }
    }
    return colors[accentColor] || colors.blue
  }

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="hover:shadow-md transition-all">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-[100px]" />
        ) : (
          <div className="text-2xl font-bold" suppressHydrationWarning>{value}</div>
        )}
      </CardContent>
    </Card>
  )

  const chartData = [
    { name: "Users", value: stats.totalUsers },
    { name: "Transactions", value: stats.totalTransactions },
    { name: "Reports", value: stats.totalReport }
  ]

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
        <h2 className={`text-3xl font-bold tracking-tight bg-gradient-to-r ${getThemeColors().header} bg-clip-text text-transparent`}>
        Dashboard</h2>
          <p className="text-muted-foreground">Welcome back, here's what's happening today.</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          color={getThemeColors().stats}
        />
        <StatCard
          title="Total Transactions"
          value={stats.totalTransactions.toLocaleString()}
          icon={Activity}
          color={getThemeColors().stats}
        />
        <StatCard
          title="Total Generated Reports"
          value={stats.totalReport.toLocaleString()}
          icon={FileText}
          color={getThemeColors().stats}
        />
      </div>

      {/* Chart Section */}
      <Card>
        <CardHeader>
          <CardTitle>Statistics Overview</CardTitle>
          <CardDescription>Visual representation of dashboard data</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[300px] w-full flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={getThemeColors().bar} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="col-span-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest financial activities across the platform</CardDescription>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{transaction.user.name}</div>
                        <div className="text-sm text-muted-foreground">{transaction.user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className={transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                      ₹{transaction.amount.toLocaleString()} 
                    </TableCell>
                    <TableCell className="capitalize">{transaction.type}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{transaction.description}</TableCell>
                    <TableCell suppressHydrationWarning>{format(new Date(transaction.timestamp), 'MMM d, yyyy h:mm a')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

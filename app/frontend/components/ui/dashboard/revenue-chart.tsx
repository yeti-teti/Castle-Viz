"use client"

import { CalendarIcon } from "@heroicons/react/24/outline"
import { lusitana } from "@/components/ui/fonts"
import { fetchExpenses } from "@/lib/new-data"
import { BarChartVariant } from "@/components/BarChartVariant"
import { formatters } from "@/lib/utils"
import { useEffect, useState } from "react"

interface ChartData {
  month: string
  revenue: number
}

export default function ExpensesChart() {
  const [expenses, setExpenses] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        setLoading(true)
        const data = await fetchExpenses()
        setExpenses(data)
      } catch (err) {
        console.error("Failed to fetch expenses:", err)
        setError("Failed to load expenses data")
      } finally {
        setLoading(false)
      }
    }

    loadExpenses()
  }, [])

  if (loading) {
    return (
      <div className="w-full md:col-span-4">
        <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
          Recent Expenses
        </h2>
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="rounded-md bg-white p-4">
            <div className="h-80 animate-pulse bg-gray-100 rounded-md"></div>
          </div>
          <div className="flex items-center pb-2 pt-6">
            <CalendarIcon className="h-5 w-5 text-gray-500" />
            <h3 className="ml-2 text-sm text-gray-500">Last 12 months</h3>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full md:col-span-4">
        <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
          Recent Expenses
        </h2>
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="rounded-md bg-white p-4 text-center">
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="w-full md:col-span-4">
        <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
          Recent Expenses
        </h2>
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="rounded-md bg-white p-4 text-center">
            <p className="text-gray-400">No data available.</p>
          </div>
        </div>
      </div>
    )
  }

  // Format data for the chart
  const chartData = expenses.map(expense => ({
    month: expense.month,
    revenue: expense.revenue
  }))

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Recent Expenses
      </h2>

      <div className="rounded-xl bg-gray-50 p-4">
        <div className="rounded-md bg-white p-4">
          <BarChartVariant
            data={chartData}
            index="month"
            categories={["revenue"]}
            colors={["blue"]}
            valueFormatter={(value: number) => 
              formatters.currency({ 
                number: value / 100, 
                maxFractionDigits: 0 
              })
            }
            showLegend={false}
            showGridLines={false}
            showYAxis={true}
            yAxisWidth={60}
            className="h-80"
            barCategoryGap="20%"
          />
        </div>
        <div className="flex items-center pb-2 pt-6">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500">Last 12 months</h3>
        </div>
      </div>
    </div>
  )
}

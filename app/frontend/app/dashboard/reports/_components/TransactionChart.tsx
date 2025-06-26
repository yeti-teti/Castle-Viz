"use client"
import { BarChartVariant } from "@/components/BarChartVariant"
import { Tooltip } from "@/components/Tooltip"
import { apiService } from "@/lib/api"
import { AvailableChartColorsKeys } from "@/lib/chartUtils"
import { cx, formatters } from "@/lib/utils"
import { InfoIcon } from "lucide-react"
import { useQueryState } from "nuqs"
import { useMemo, useEffect, useState } from "react"
import { DEFAULT_RANGE, RANGE_DAYS, RangeKey } from "./dateRanges"

interface ChartDataItem {
  key: string
  value: number
}

type ChartType = "amount" | "count" | "category" | "merchant"

interface RealTransaction {
  id: string
  category: string
  vendor: string
  amount: number
  status: string
  created_at: string
}

interface ChartConfig {
  title: string
  tooltipContent: string
  processData: (
    transactions: RealTransaction[],
    filterDate: Date,
    filters: Filters,
  ) => ChartDataItem[]
  valueFormatter: (value: number) => string
  layout?: "horizontal" | "vertical"
  color: string
  xValueFormatter?: (value: string) => string
}

interface Filters {
  expenseStatus: string
  minAmount: number
  maxAmount: number
  selectedCategories: string[]
}

const chartConfigs: Record<ChartType, ChartConfig> = {
  amount: {
    title: "Total Transaction Amount",
    tooltipContent:
      "Total amount of transactions for the selected period and amount range.",
    color: "blue",
    processData: (transactions, filterDate, filters) => {
      const summedData: Record<string, number> = {}
      transactions.forEach((transaction) => {
        const date = transaction.created_at.split("T")[0]
        if (isTransactionValid(transaction, filterDate, filters)) {
          summedData[date] = (summedData[date] || 0) + transaction.amount
        }
      })
      return Object.entries(summedData).map(([date, value]) => ({
        key: date,
        value,
      }))
    },
    valueFormatter: (number: number) =>
      formatters.currency({ number: number / 100, maxFractionDigits: 0 }),
    xValueFormatter: (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
    },
  },
  count: {
    title: "Transaction Count",
    tooltipContent:
      "Total number of transactions for the selected period and amount range.",
    processData: (transactions, filterDate, filters) => {
      const countedData: Record<string, number> = {}
      transactions.forEach((transaction) => {
        const date = transaction.created_at.split("T")[0]
        if (isTransactionValid(transaction, filterDate, filters)) {
          countedData[date] = (countedData[date] || 0) + 1
        }
      })
      return Object.entries(countedData).map(([date, value]) => ({
        key: date,
        value,
      }))
    },
    valueFormatter: (number: number) =>
      Intl.NumberFormat("us").format(number).toString(),
    color: "blue",
    xValueFormatter: (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
    },
  },
  category: {
    title: "Top 5 Categories by Transaction Amount",
    tooltipContent:
      "Total amount of transactions for the top 5 categories in the selected period and amount range.",
    processData: (transactions, filterDate, filters) => {
      const categoryTotals: Record<string, number> = {}
      transactions.forEach((transaction) => {
        if (isTransactionValid(transaction, filterDate, filters)) {
          categoryTotals[transaction.category] =
            (categoryTotals[transaction.category] || 0) + transaction.amount
        }
      })
      return Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([category, value]) => ({ key: category, value }))
    },
    valueFormatter: (number: number) =>
      formatters.currency({ number: number / 100, maxFractionDigits: 0 }),
    layout: "vertical",
    color: "emerald",
  },
  merchant: {
    title: "Top 5 Vendors by Transaction Amount",
    tooltipContent:
      "Total amount of transactions for the top 5 vendors in the selected period and amount range.",
    processData: (transactions, filterDate, filters) => {
      const merchantTotals: Record<string, number> = {}
      transactions.forEach((transaction) => {
        if (isTransactionValid(transaction, filterDate, filters)) {
          merchantTotals[transaction.vendor] =
            (merchantTotals[transaction.vendor] || 0) + transaction.amount
        }
      })
      return Object.entries(merchantTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([merchant, value]) => ({ key: merchant, value }))
    },
    valueFormatter: (number: number) =>
      formatters.currency({ number: number / 100, maxFractionDigits: 0 }),
    layout: "vertical",
    color: "orange",
  },
}

const isTransactionValid = (
  transaction: RealTransaction,
  filterDate: Date,
  filters: Filters,
) => {
  const { expenseStatus, minAmount, maxAmount, selectedCategories } = filters
  const transactionDate = new Date(transaction.created_at)
  return (
    transactionDate >= filterDate &&
    (expenseStatus === "all" || transaction.status === expenseStatus) &&
    transaction.amount >= minAmount &&
    transaction.amount <= maxAmount &&
    (selectedCategories.length === 0 ||
      selectedCategories.includes(transaction.category))
  )
}

export function TransactionChart({
  type,
  yAxisWidth,
  showYAxis,
  className,
}: {
  type: ChartType
  yAxisWidth?: number
  showYAxis?: boolean
  className?: string
}) {
  const [transactions, setTransactions] = useState<RealTransaction[]>([])
  const [loading, setLoading] = useState(true)
  
  const [range] = useQueryState<RangeKey>("range", {
    defaultValue: DEFAULT_RANGE,
    parse: (value): RangeKey =>
      Object.keys(RANGE_DAYS).includes(value)
        ? (value as RangeKey)
        : DEFAULT_RANGE,
  })
  const [expenseStatus] = useQueryState("expense_status", {
    defaultValue: "all",
  })
  const [amountRange] = useQueryState("amount_range", {
    defaultValue: "0-Infinity",
  })
  const [selectedCategories] = useQueryState<string[]>("categories", {
    defaultValue: [],
    parse: (value: string) => (value ? value.split("+") : []),
    serialize: (value: string[]) => value.join("+"),
  })

  const [minAmount, maxAmount] = useMemo(() => {
    const [min, max] = amountRange.split("-").map(Number)
    return [min * 100, max === Infinity ? Number.MAX_SAFE_INTEGER : max * 100]
  }, [amountRange])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all transactions from the filtered expenses endpoint
        const expenses = await apiService.getFilteredExpenses('', 1, 1000); // Get a large number
        const allTransactions: RealTransaction[] = expenses.map(expense => ({
          id: expense.id,
          category: expense.category,
          vendor: expense.vendor,
          amount: expense.amount,
          status: expense.status,
          created_at: expense.created_at
        }));
        setTransactions(allTransactions);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const config = chartConfigs[type]

  const chartData = useMemo(() => {
    if (loading || transactions.length === 0) return [];
    
    const currentDate = new Date()
    const filterDate = new Date(currentDate)
    const daysToSubtract = RANGE_DAYS[range] || RANGE_DAYS[DEFAULT_RANGE]
    filterDate.setDate(currentDate.getDate() - daysToSubtract)

    const filters: Filters = {
      expenseStatus,
      minAmount,
      maxAmount,
      selectedCategories,
    }
    return config.processData(transactions, filterDate, filters)
  }, [range, expenseStatus, minAmount, maxAmount, selectedCategories, config, transactions, loading])

  const totalValue = useMemo(
    () => Math.round(chartData.reduce((sum, item) => sum + item.value, 0)),
    [chartData],
  )

  if (loading) {
    return (
      <div className={cx(className, "w-full")}>
        <div className="bg-white dark:bg-gray-900/30 rounded-lg p-6 border border-gray-100 dark:border-gray-800">
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded mb-4 animate-pulse"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded mb-6 w-1/3 animate-pulse"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={cx(className, "w-full")}>
      <div className="bg-white dark:bg-gray-900/30 rounded-lg p-6 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <h2
              id={`${type}-chart-title`}
              className="text-sm text-black dark:text-gray-200"
            >
              {config.title}
            </h2>
            <Tooltip side="bottom" content={config.tooltipContent}>
              <InfoIcon className="size-4 text-black dark:text-gray-200" />
            </Tooltip>
          </div>
        </div>
        <p
          className="mt-2 text-2xl font-semibold text-black dark:text-gray-50"
          aria-live="polite"
        >
          {config.valueFormatter(totalValue)}
        </p>
        <BarChartVariant
          data={chartData}
          index="key"
          categories={["value"]}
          showLegend={false}
          showGridLines={false}
          colors={[config.color as AvailableChartColorsKeys]}
          yAxisWidth={yAxisWidth}
          valueFormatter={config.valueFormatter}
          xValueFormatter={config.xValueFormatter}
          showYAxis={showYAxis}
          className="mt-6 h-48"
          layout={config.layout}
          barCategoryGap="6%"
          aria-labelledby={`${type}-chart-title`}
          role="figure"
          aria-roledescription="chart"
        />
      </div>
    </div>
  )
}

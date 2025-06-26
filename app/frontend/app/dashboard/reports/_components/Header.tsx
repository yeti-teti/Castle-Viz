"use client"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/Accordion"
import { Button } from "@/components/Button"
import useScroll from "@/lib/useScroll"
import { cx } from "@/lib/utils"
import { useQueryState } from "nuqs"
import React from "react"
import { FilterAmount } from "./FilterAmount"
import { FilterCategory } from "./FilterCategory"
import { FilterDate } from "./FilterDate"
import { FilterExpenseStatus } from "./FilterExpenseStatus"
import { DEFAULT_RANGE } from "./dateRanges"

function FormattedDate() {
  const [dateString, setDateString] = React.useState<string>("")

  React.useEffect(() => {
    const date = new Date(new Date().setHours(new Date().getHours() - 1))
    setDateString(
      date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    )
  }, [])

  return (
    <p className="whitespace-nowrap text-sm text-black-600 dark:text-black-400">
      Last refresh: {dateString}
    </p>
  )
}

export default function Header() {
  const scrolled = useScroll(10)

  const [, setRange] = useQueryState("range")
  const [, setExpenseStatus] = useQueryState("expense_status")
  const [, setAmountRange] = useQueryState("amount_range")
  const [, setSelectedCategories] = useQueryState("countries")

  const handleResetFilters = () => {
    setRange(DEFAULT_RANGE)
    setExpenseStatus(null)
    setAmountRange(null)
    setSelectedCategories(null)
  }

  return (
    <section
      aria-labelledby="reports-title"
      className={cx(
        "top-16 z-50 card-bg rounded-xl p-6 shadow-sm border border-gray-200 mb-6 lg:top-0",
        scrolled &&
          "border-b border-gray-300 transition-all",
      )}
    >
      <div className="space-y-1">
        <h1
          id="reports-title"
          className="text-lg font-semibold text-black-900 dark:text-black-50"
        >
          Reports
        </h1>
        
      </div>
      <Accordion type="single" collapsible className="block md:hidden">
        <AccordionItem className="rounded-md border" value="1">
          <AccordionTrigger className="px-4 py-2.5">Filters</AccordionTrigger>
          <AccordionContent className="p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <FilterDate />
              <FilterCategory />
              <FilterExpenseStatus />
              <FilterAmount />
              <Button
                variant="light"
                className="h-fit dark:border-black-800"
                onClick={handleResetFilters}
              >
                Reset
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="hidden items-end gap-3 md:flex md:flex-wrap">
        <FilterDate />
        <FilterCategory />
        <FilterExpenseStatus />
        <FilterAmount />
        <Button
          variant="light"
          className="h-fit dark:border-black-800"
          onClick={handleResetFilters}
        >
          Reset
        </Button>
      </div>
    </section>
  )
}

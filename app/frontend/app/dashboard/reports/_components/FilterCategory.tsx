import { Button } from "@/components/Button"
import { Checkbox } from "@/components/Checkbox"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover"
import { cx } from "@/lib/utils"
import { apiService } from "@/lib/api"
import { useQueryState } from "nuqs"
import { useEffect, useMemo, useState } from "react"

interface Category {
  name: string
  selected: boolean
}

const useDebounce = (value: string, delay: number): string => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

function FilterCategory() {
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedCategories, setSelectedCategories] = useQueryState<string[]>(
    "categories",
    {
      defaultValue: [],
      parse: (value: string) => (value ? value.split("+") : []),
      serialize: (value: string[]) => value.join("+"),
    },
  )

  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await apiService.getCategories()
        setCategories(categoriesData)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        // Fallback to some default categories if API fails
        setCategories(["Bills", "Payments", "Transportation", "Food", "Utilities", "Other"])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const categoryItems = useMemo(() => {
    return categories.map((category) => ({
      name: category,
      selected: selectedCategories.includes(category),
    }))
  }, [categories, selectedCategories])

  const filteredCategories = useMemo(() => {
    return categoryItems.filter((category) =>
      category.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  }, [categoryItems, debouncedSearchTerm])

  const handleCategoryChange = (categoryName: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryName])
    } else {
      setSelectedCategories(
        selectedCategories.filter((category) => category !== categoryName)
      )
    }
  }

  if (loading) {
    return (
      <div>
        <Label htmlFor="category-filter" className="block font-medium">
          Categories
        </Label>
        <div className="mt-3 h-10 w-full md:w-fit animate-pulse bg-gray-200 rounded" />
      </div>
    )
  }

  return (
    <div>
      <Label htmlFor="category-filter" className="font-medium text-black-900 dark:text-black-50">
        Categories
      </Label>
      <Popover modal={true}>
        <PopoverTrigger
          asChild
          className="mt-3 w-full md:w-fit"
          id="category-filter"
        >
          <Button
            variant="secondary"
            className={cx(
              "flex justify-start gap-1.5 font-normal md:justify-center dark:bg-[#090E1A] hover:dark:bg-gray-950/50",
            )}
          >
            Selected Categories
            <span className="flex shrink-0 items-center justify-center rounded bg-gray-200 px-1 tabular-nums text-gray-900 dark:bg-gray-800 dark:text-gray-50">
              {selectedCategories.length}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="z-50 min-w-[calc(var(--radix-popover-trigger-width))] max-w-[calc(var(--radix-popover-trigger-width))] sm:min-w-56 sm:max-w-56"
          align="end"
        >
          <div className="flex h-full max-h-96 flex-col gap-3">
            <Input
              placeholder="Search for category"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sm:[&>input]:py-1.5"
            />
            <div className="flex-grow overflow-y-auto">
              <div className={filteredCategories.length > 0 ? "space-y-3" : ""}>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <div key={category.name} className="flex items-center gap-2">
                      <Checkbox
                        id={category.name}
                        checked={category.selected}
                        onCheckedChange={(checked: boolean) =>
                          handleCategoryChange(category.name, checked)
                        }
                      />
                      <Label className="text-base sm:text-sm w-full" htmlFor={category.name}>
                        {category.name}
                      </Label>
                    </div>
                  ))
                ) : (
                  <span className="mt-2 block text-base sm:text-sm text-gray-500 dark:text-gray-500">
                    No results found
                  </span>
                )}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { FilterCategory }
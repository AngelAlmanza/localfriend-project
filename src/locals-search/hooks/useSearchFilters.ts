import { useCallback, useState } from "react"
import { DEFAULT_PRICE_RANGE_MAX, DEFAULT_PRICE_RANGE_MIN } from "../constants/filterDefaultValues"
import { SearchContentType } from "../interfaces/Local"
import { useLocalsSearchStore } from "../store/locals"
import { useLocalsDataStore } from "../store/localsData"

export const useSearchFilters = () => {
  const { filters, setFilters } = useLocalsSearchStore()
  const { productCategories, serviceCategories } = useLocalsDataStore()

  const [showFiltersSection, setShowFiltersSection] = useState(false)

  const handleToggleFiltersSection = useCallback(() => {
    setShowFiltersSection((prev) => !prev)
  }, [])

  const handleContentTypeChange = useCallback(
    (type: SearchContentType) => {
      setFilters({
        contentType: type,
        selectedProductCategories: [],
        selectedServiceCategories: [],
      })
    },
    [setFilters],
  )

  const handleProductCategoryToggle = useCallback(
    (categoryId: string) => {
      const current = filters.selectedProductCategories
      setFilters({
        selectedProductCategories: current.includes(categoryId)
          ? current.filter((c) => c !== categoryId)
          : [...current, categoryId],
      })
    },
    [filters.selectedProductCategories, setFilters],
  )

  const handleServiceCategoryToggle = useCallback(
    (categoryId: string) => {
      const current = filters.selectedServiceCategories
      setFilters({
        selectedServiceCategories: current.includes(categoryId)
          ? current.filter((c) => c !== categoryId)
          : [...current, categoryId],
      })
    },
    [filters.selectedServiceCategories, setFilters],
  )

  const handlePriceRangeChange = useCallback(
    (value: number[]) => {
      setFilters({ priceRange: [value[0], value[1]] })
    },
    [setFilters],
  )

  const handleSearchTextChange = useCallback(
    (text: string) => {
      setFilters({ searchText: text })
    },
    [setFilters],
  )

  const handleClearFilters = useCallback(() => {
    setFilters({
      contentType: "both",
      selectedProductCategories: [],
      selectedServiceCategories: [],
      priceRange: [DEFAULT_PRICE_RANGE_MIN, DEFAULT_PRICE_RANGE_MAX],
      searchText: "",
    })
  }, [setFilters])

  // Compute visible categories based on content type
  const visibleProductCategories =
    filters.contentType === "services" ? [] : productCategories
  const visibleServiceCategories =
    filters.contentType === "products" ? [] : serviceCategories

  return {
    showFiltersSection,
    handleToggleFiltersSection,

    // Content type
    contentType: filters.contentType,
    handleContentTypeChange,

    // Categories (separated)
    productCategories: visibleProductCategories,
    serviceCategories: visibleServiceCategories,
    selectedProductCategories: filters.selectedProductCategories,
    selectedServiceCategories: filters.selectedServiceCategories,
    handleProductCategoryToggle,
    handleServiceCategoryToggle,

    // Price
    priceRange: filters.priceRange,
    handlePriceRangeChange,

    // Search text
    searchText: filters.searchText,
    handleSearchTextChange,

    // Clear
    handleClearFilters,
  }
}

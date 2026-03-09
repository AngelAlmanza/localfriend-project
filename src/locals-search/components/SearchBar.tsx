"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/src/shared/utils/formatCurrency"
import { Package, SearchIcon, SlidersVertical, Trash2, Wrench } from "lucide-react"
import { useTranslations } from "next-intl"
import { SearchContentType } from "../interfaces/Local"
import { useSearchFilters } from "../hooks/useSearchFilters"

export const SearchBar = () => {
  const t = useTranslations("Locals.search")
  const {
    showFiltersSection,
    handleToggleFiltersSection,
    contentType,
    handleContentTypeChange,
    productCategories,
    serviceCategories,
    selectedProductCategories,
    selectedServiceCategories,
    handleProductCategoryToggle,
    handleServiceCategoryToggle,
    priceRange,
    handlePriceRangeChange,
    searchText,
    handleSearchTextChange,
    handleClearFilters,
  } = useSearchFilters()

  const contentTypes: { value: SearchContentType; label: string; icon: React.ReactNode }[] = [
    { value: "both", label: t("filters.typeAll"), icon: null },
    { value: "products", label: t("filters.typeProducts"), icon: <Package className="size-3.5" /> },
    { value: "services", label: t("filters.typeServices"), icon: <Wrench className="size-3.5" /> },
  ]

  const hasCategories = productCategories.length > 0 || serviceCategories.length > 0

  return (
    <aside className="w-full space-y-4" data-testid="search-bar">
      <div className="flex gap-3 items-center w-full">
        <div className="flex-1">
          <InputGroup className="py-6">
            <InputGroupInput
              placeholder={t("searchInputPlaceholder")}
              value={searchText}
              onChange={(e) => handleSearchTextChange(e.target.value)}
              data-testid="search-input"
            />
            <InputGroupAddon>
              <SearchIcon className="size-4" />
            </InputGroupAddon>
          </InputGroup>
        </div>

        <Button
          onClick={handleToggleFiltersSection}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-6 rounded-md text-md font-semibold transition-all duration-300 cursor-pointer"
          data-testid="search-filters-toggle"
        >
          <SlidersVertical className="size-4" />
          {t("filters.btnText")}
        </Button>
      </div>

      {/* Content type pills */}
      <div className="flex gap-2" data-testid="search-content-type-pills">
        {contentTypes.map((ct) => (
          <button
            key={ct.value}
            onClick={() => handleContentTypeChange(ct.value)}
            data-testid={`search-type-${ct.value}`}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer",
              contentType === ct.value
                ? "bg-primary text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            {ct.icon}
            {ct.label}
          </button>
        ))}
      </div>

      {/* Expanded filters */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          showFiltersSection ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 pb-2 border-t border-gray-100">
          {/* Price range */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-900">
              {t("filters.priceRange", {
                min: formatCurrency(priceRange[0]),
                max: formatCurrency(priceRange[1]),
              })}
            </p>
            <Slider
              value={[...priceRange]}
              max={10000}
              step={50}
              className="w-full"
              onValueChange={handlePriceRangeChange}
            />
          </div>

          {/* Categories from API - separated by type */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-900">
              {t("filters.categories")}
            </p>
            <ScrollArea className="h-48">
              {!hasCategories && (
                <p className="text-xs text-gray-400">{t("filters.noCategories")}</p>
              )}

              {/* Product categories */}
              {productCategories.length > 0 && (
                <div className="space-y-2 mb-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Package className="size-3" />
                    {t("filters.typeProducts")}
                  </p>
                  <FieldGroup>
                    {productCategories.map((cat) => (
                      <Field key={cat.id} orientation="horizontal">
                        <Checkbox
                          id={`cat-${cat.id}`}
                          checked={selectedProductCategories.includes(cat.id)}
                          onCheckedChange={() => handleProductCategoryToggle(cat.id)}
                        />
                        <Label htmlFor={`cat-${cat.id}`}>{cat.name}</Label>
                      </Field>
                    ))}
                  </FieldGroup>
                </div>
              )}

              {/* Service categories */}
              {serviceCategories.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Wrench className="size-3" />
                    {t("filters.typeServices")}
                  </p>
                  <FieldGroup>
                    {serviceCategories.map((cat) => (
                      <Field key={cat.id} orientation="horizontal">
                        <Checkbox
                          id={`cat-${cat.id}`}
                          checked={selectedServiceCategories.includes(cat.id)}
                          onCheckedChange={() => handleServiceCategoryToggle(cat.id)}
                        />
                        <Label htmlFor={`cat-${cat.id}`}>{cat.name}</Label>
                      </Field>
                    ))}
                  </FieldGroup>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Clear */}
          <div className="flex flex-col items-end justify-end">
            <Button
              variant="destructive"
              className="w-fit cursor-pointer"
              onClick={handleClearFilters}
              data-testid="search-clear-filters"
            >
              {t("filters.clearFilters")}
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  )
}

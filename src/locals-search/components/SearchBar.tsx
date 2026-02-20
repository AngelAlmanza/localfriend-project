"use client"

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/src/shared/utils/formatCurrency";
import { SearchIcon, SlidersVertical, StarIcon, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { DEFAULT_PRICE_RANGE, DEFAULT_RATING, DEFAULT_SORT } from "../constants/filterDefaultValues";
import { useSearchFilters } from "../hooks/useSearchFilters";

export const SearchBar = () => {
  const t = useTranslations("Locals.search");
  const {
    showFiltersSection,
    handleToggleFiltersSection,
    searchValue,
    setSearchValue,
    priceRange,
    setPriceRange,
    sort,
    setSort,
    rating,
    setRating,
    handleClearFilters,
    // handleSearch,
  } = useSearchFilters();

  return (
    <aside className="w-full">
      <div className="flex gap-4 items-center w-full justify-center">
        <div className="w-4/5">
          <InputGroup className="py-6">
            <InputGroupInput
              placeholder={t("searchInputPlaceholder")}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <InputGroupAddon>
              <SearchIcon className="size-4" />
            </InputGroupAddon>
          </InputGroup>
        </div>

        <div>
          <Button
            onClick={handleToggleFiltersSection}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-6 rounded-md text-md font-semibold transition-all duration-300 col-span-1 cursor-pointer"
          >
            <SlidersVertical className="size-4" />
            {t("searchFilters.btnText")}
          </Button>
          {/* <Button
            variant="primary"
            className="px-4 py-6 rounded-md text-md font-semibold transition-all duration-300 shadow-lg hover:shadow-xl col-span-1"
            onClick={handleSearch}
          >
            {t("searchButton")}
          </Button> */}
        </div>
      </div>

      <div className={cn("hidden mt-4", showFiltersSection ? "grid grid-cols-3 gap-4 h-48" : "hidden")}>
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-lg font-bold text-gray-900">
              {t("searchFilters.priceRange", { min: formatCurrency(priceRange[0]), max: formatCurrency(priceRange[1]) })}
            </p>
            <Slider
              defaultValue={[...DEFAULT_PRICE_RANGE]}
              max={1000}
              step={10}
              className="w-full"
              value={priceRange}
              onValueChange={setPriceRange}
            />
          </div>
          <div className="space-y-3">
            <p className="text-lg font-bold text-gray-900 flex items-center gap-2">
              {t("searchFilters.rating")}
              <span className="flex items-center gap-1">
                <StarIcon className="size-4 text-yellow-500" /> {rating[0]}
              </span>
            </p>
            <Slider
              defaultValue={[DEFAULT_RATING]}
              max={5}
              step={1}
              className="w-full"
              value={[DEFAULT_RATING]}
              onValueChange={setRating}
            />
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-lg font-bold text-gray-900">{t("searchFilters.categories")}</p>
          <ScrollArea className="h-36">
            <FieldGroup>
              <Field orientation="horizontal">
                <Checkbox id="food" name="food" />
                <Label htmlFor="food">{t("searchFilters.categoriesCheckbox.food")}</Label>
              </Field>
              <Field orientation="horizontal">
                <Checkbox id="health" name="health" />
                <Label htmlFor="health">{t("searchFilters.categoriesCheckbox.health")}</Label>
              </Field>
              <Field orientation="horizontal">
                <Checkbox id="beauty" name="beauty" />
                <Label htmlFor="beauty">{t("searchFilters.categoriesCheckbox.beauty")}</Label>
              </Field>
              <Field orientation="horizontal">
                <Checkbox id="electronics" name="electronics" />
                <Label htmlFor="electronics">{t("searchFilters.categoriesCheckbox.electronics")}</Label>
              </Field>
              <Field orientation="horizontal">
                <Checkbox id="home" name="home" />
                <Label htmlFor="home">{t("searchFilters.categoriesCheckbox.home")}</Label>
              </Field>
              <Field orientation="horizontal">
                <Checkbox id="sports" name="sports" />
                <Label htmlFor="sports">{t("searchFilters.categoriesCheckbox.sports")}</Label>
              </Field>
              <Field orientation="horizontal">
                <Checkbox id="tools" name="tools" />
                <Label htmlFor="tools">{t("searchFilters.categoriesCheckbox.tools")}</Label>
              </Field>
            </FieldGroup>
          </ScrollArea>
        </div>

        <div className="flex flex-col gap-4 items-end">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("searchFilters.sort")} defaultValue={DEFAULT_SORT} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="name-asc">{t("searchFilters.sortOptions.name-asc")}</SelectItem>
                <SelectItem value="name-desc">{t("searchFilters.sortOptions.name-desc")}</SelectItem>
                <SelectItem value="price-asc">{t("searchFilters.sortOptions.price-asc")}</SelectItem>
                <SelectItem value="price-desc">{t("searchFilters.sortOptions.price-desc")}</SelectItem>
                <SelectItem value="rating-asc">{t("searchFilters.sortOptions.rating-asc")}</SelectItem>
                <SelectItem value="rating-desc">{t("searchFilters.sortOptions.rating-desc")}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button variant="destructive" className="w-fit cursor-pointer" onClick={handleClearFilters}>
            {t("searchFilters.clearFilters")}
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
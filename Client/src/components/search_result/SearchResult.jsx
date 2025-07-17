import { Navbar, Footer,RenderSearchResult } from "@/components"

import useThemeStore from "@/store/useThemeStore"

export default function SearchResultsPage() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode)

  return (
    <div className={isDarkMode ? "bg-neutral-800" : "bg-white"}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <RenderSearchResult
          isSellerForm={false}
          />
        <Footer />
      </div>
    </div>
  )
}

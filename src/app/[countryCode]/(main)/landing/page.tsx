import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import MagazinePreview from "@modules/products/components/magazine-preview"
import { HttpTypes } from "@medusajs/types"

// Helper to check if product is a magazine
function isMagazineProduct(product: HttpTypes.StoreProduct): boolean {
  // Check if product has category with handle or name "magazines"
  const hasMagazineCategory = product.categories?.some(
    (category) => {
      const handle = category.handle?.toLowerCase() || ""
      const name = category.name?.toLowerCase() || ""
      return handle === "magazines" || name === "magazines"
    }
  )
  
  return hasMagazineCategory || false
}

// Section 1 - Header
function HeaderSection() {
  return (
    <section className="h-screen bg-[#0E0E0E] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-white text-6xl font-bold tracking-tight mb-4">
          Welcome to 4got10
        </h1>
        <p className="text-gray-400 text-xl">
          Discover our latest collection
        </p>
      </div>
    </section>
  )
}

// Section 2 - Product Highlighter Row (Full Width)
async function ProductHighlightSection({ countryCode }: { countryCode: string }) {
  const region = await getRegion(countryCode)
  
  if (!region) {
    return null
  }

  const { response: { products } } = await listProducts({
    queryParams: {
      limit: 4,
      fields: "+tags,*categories,*images,*variants.calculated_price,*variants.images",
    },
    countryCode,
  })
  
  // Debug: log products and their images with full details
  console.log("Products:", products.map(p => ({ 
    title: p.title, 
    categories: p.categories,
    images: p.images?.map(img => ({ id: img.id, url: img.url })),
    thumbnail: p.thumbnail,
  })))
  
  return (
    <section className="w-full bg-[#F9F9F9] py-16">
      <div className="w-full">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-black mb-4">Featured Products</h2>
          <p className="text-gray-600">Shop our best sellers</p>
        </div>
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full px-4">
          {products.map((product) => {
            const isMagazine = isMagazineProduct(product)
            console.log(`=== PRODUCT: "${product.title}" ===`)
            console.log("Categories:", product.categories)
            console.log("Category handles:", product.categories?.map(c => c.handle))
            console.log("Category names:", product.categories?.map(c => c.name))
            console.log("isMagazine:", isMagazine)
            console.log("============================")
            return (
              <li key={product.id}>
                {isMagazine ? (
                  <MagazinePreview product={product} region={region} isFeatured />
                ) : (
                  <ProductPreview product={product} region={region} isFeatured />
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

// Section 3 - Text in Middle
function TextSectionOne() {
  return (
    <section className="h-screen bg-[#0E0E0E] flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-white text-5xl font-bold mb-8">
          Crafted with Purpose
        </h2>
        <p className="text-gray-400 text-xl leading-relaxed">
          Every piece in our collection is designed with intention. We believe in quality over quantity, 
          creating products that stand the test of time. Our commitment to excellence drives everything we do.
        </p>
      </div>
    </section>
  )
}

// Section 4 - Text in Middle
function TextSectionTwo() {
  return (
    <section className="h-screen bg-[#F9F9F9] flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-black text-5xl font-bold mb-8">
          Join the Movement
        </h2>
        <p className="text-gray-600 text-xl leading-relaxed">
          Be part of something bigger. When you choose 4got10, you're choosing sustainability, 
          quality craftsmanship, and a community that values authenticity above all else.
        </p>
      </div>
    </section>
  )
}

export default async function LandingPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  
  return (
    <div className="min-h-screen">
      <HeaderSection />
      <ProductHighlightSection countryCode={params.countryCode} />
      <TextSectionOne />
      <TextSectionTwo />
    </div>
  )
}

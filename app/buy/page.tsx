// app/products/page.tsx
import { BuyButton } from './BuyButton'

type Product = {
  id: string
  name: string
  price: string
}

async function getProducts(): Promise<Product[]> {
  // DB fetch, CMS, Supabase, etc.
  return [
    { id: 'p1', name: 'E-book', price: '0.05 ETH' },
    { id: 'p2', name: 'Video Course', price: '0.15 ETH' },
    { id: 'p3', name: 'Plugin', price: '0.2 ETH' },
  ]
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="grid gap-6">
      {products.map(product => (
        <div
          key={product.id}
          className="border rounded p-4 flex items-center justify-between"
        >
          <div>
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-sm text-muted-foreground">
              {product.price}
            </p>
          </div>

          <BuyButton productId={product.id} />
        </div>
      ))}
    </div>
  )
}

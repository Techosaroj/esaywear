import React from 'react'
import { Link } from 'react-router-dom'

const ProductGrid = ({ products, loading, error }) => {
  if (loading) {
    return <p>Loading...</p>
  }

  if (error) {
    return <p>Error: {error}</p>
  }

  if (!products || products.length === 0) {
    return <p className='text-center'>No products found</p>
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 '>
      {products.map((product, index) => {
        const primaryImage = product.images?.[0]?.url;
        const altText = product.images?.[0]?.altText || product.name;
        return (
          <Link key={index} to={`/product/${product._id}`} className='block'>
            <div className="bg-white p-4 rounded-lg">
              <div className="w-full h-96 mb-4 relative">
                {product.countInStock === 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg z-10">
                    <span className="text-white font-bold text-lg px-4 py-2 border-2 border-white rounded">Out of Stock</span>
                  </div>
                )}
                {primaryImage ? (
                  <img
                    src={primaryImage}
                    alt={altText}
                    className='w-full h-full object-cover rounded-lg'
                  />
                ) : (
                  <div className='w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm'>
                    No image
                  </div>
                )}
              </div>
              <h3 className='text-sm mb-2'>{product.name}</h3>
              <p className='text-gray-500 font-medium text-sm tracking-tighter'>$ {product.price}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

export default ProductGrid

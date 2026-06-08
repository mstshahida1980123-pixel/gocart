'use client'
import React from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'

const LatestProducts = () => {

    const displayQuantity = 4
    const products = useSelector(state => state.product.list)

    const tagged = products.filter(p => p.latest)
    const listToShow = tagged.length ? tagged : products.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title title='Latest Products' description={`Showing ${listToShow.length < displayQuantity ? listToShow.length : displayQuantity} of ${products.length} products`} href='/shop' />
            <div className='mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 justify-between'>
                {listToShow.slice(0, displayQuantity).map((product, index) => (
                    <ProductCard key={index} product={product} />
                ))}
            </div>
        </div>
    )
}

export default LatestProducts
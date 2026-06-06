'use client'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'
import { getCombinedRatings } from '@/lib/demoReviews'

const BestSelling = () => {

    const displayQuantity = 8
    const products = useSelector(state => state.product.list)

    const tagged = products.filter(p => p.bestSelling)
    const listToShow = tagged.length ? tagged : products.slice().sort((a, b) => {
        const aCount = getCombinedRatings(a.id, a.name, a.ratings || []).reviewCount
        const bCount = getCombinedRatings(b.id, b.name, b.ratings || []).reviewCount
        return bCount - aCount
    })

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title title='Best Selling' description={`Showing ${listToShow.length < displayQuantity ? listToShow.length : displayQuantity} of ${products.length} products`} href='/shop' />
            <div className='mt-12  grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12'>
                {listToShow.slice(0, displayQuantity).map((product, index) => (
                    <ProductCard key={index} product={product} />
                ))}
            </div>
        </div>
    )
}

export default BestSelling
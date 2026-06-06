'use client'
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function Product() {

    const { productId } = useParams();
    const [product, setProduct] = useState();
    const products = useSelector(state => state.product.list);

    const fetchProduct = async () => {
        const productFromStore = products.find((product) => product.id === productId);
        if (productFromStore) {
            setProduct(productFromStore);
            return;
        }
        try {
            const res = await fetch(`/api/products/${productId}`)
            if (!res.ok) return
            const json = await res.json()
            setProduct(json)
        } catch (err) {
            console.error('Failed to fetch product fallback:', err)
        }
    }

    useEffect(() => {
        fetchProduct()
        scrollTo(0, 0)
    }, [productId,products]);

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">

                {/* Breadcrums */}
                <div className="  text-gray-600 text-sm mt-8 mb-5">
                    Home / Products / {product?.category || 'Products'}
                </div>

                {/* Product Details */}
                {product && (
                    <ProductDetails key={`details-${product.id}`} product={product} />
                )}

                {/* Description & Reviews */}
                {product && (<ProductDescription key={`desc-${product.id}`} product={product} />)}
            </div>
        </div>
    );
}
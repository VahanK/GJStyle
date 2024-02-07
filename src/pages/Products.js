import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { categoryId, subcategoryId } = useParams();
    const navigate = useNavigate();


    const handleProductClick = (productId) => {
        // Check if subcategoryId is present in the URL and reset the URL accordingly
        if (subcategoryId) {
            navigate(`/product/${productId}`);
        } else {
            navigate(`/product/${productId}`);
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                let url = `http://backoffice.gjstylelb.com/items/products?fields=*,images.*`;

                if (categoryId) {
                    url += `&filter[category]=${categoryId}`;
                }
                if (subcategoryId) {
                    url += `&filter[subcategory]=${subcategoryId}`;
                }

                const response = await axios.get(url)
                setProducts(response.data.data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [categoryId, subcategoryId]);




    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="bg-white">
            <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
                <h2 className="sr-only">Products</h2>

                <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => handleProductClick(product.id)}
                            className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white cursor-pointer"
                        >
                            <div className="aspect-h-4 aspect-w-3 bg-gray-200 sm:aspect-none group-hover:opacity-75 sm:h-96">
                                <img

                                    src={`http://backoffice.gjstylelb.com/assets/${product.images[0].directus_files_id}`}

                                    alt={`http://backoffice.gjstylelb.com/assets/${product.images[0].directus_files_id}`}
                                    className="h-full w-full object-cover object-center sm:h-full sm:w-full"
                                />
                            </div>
                            <div className="flex flex-1 flex-col space-y-2 p-4">
                                <h3 className="text-sm font-medium text-gray-900">
                                    <a href={product.href}>
                                        <span aria-hidden="true" className="absolute inset-0" />
                                        {product.title}
                                    </a>
                                </h3>
                                <p className="text-sm text-gray-500">{product.Description}</p>
                                <div className="flex flex-1 flex-col justify-end">
                                    <p className="text-base font-medium text-gray-900">${product.price}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;

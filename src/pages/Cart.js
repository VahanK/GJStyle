import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { XMarkIcon, CheckIcon, ClockIcon } from '@heroicons/react/20/solid';

export default function Cart() {
    const [cartProducts, setCartProducts] = useState([]);

    useEffect(() => {
        const fetchCartData = async () => {
            try {
                const userId = 'cfa37b66-49b0-49d1-bf22-d44c784a2e68';
                const response = await axios.get(`http://0000:8055/items/cart?fields=*,cart_details.*,cart_details.product.*,cart_details.product.category.*,cart_details.product.images.*&filter[user][_eq]=${userId}`);
                const cartData = response.data.data[0].cart_details;

                const transformedProducts = cartData.map(detail => ({
                    uniqueKey: `${detail.product.id}-${detail.plating_color}-${detail.stone_color}`, // Create a unique key
                    id: detail.product.id,
                    name: detail.product.title,
                    href: '#',
                    price: `$${detail.price}`,
                    color: detail.plating_color,
                    stoneColor: detail.stone_color,
                    imageSrc: `http://0000:8055/assets/${detail.product.images[0].directus_files_id}`,
                    imageAlt: detail.product.Description,
                    quantity: parseInt(detail.quantity)
                }));

                setCartProducts(transformedProducts);
            } catch (error) {
                console.error('Error fetching cart data:', error);
            }
        };

        fetchCartData();
    }, []);

    const orderTotal = cartProducts.reduce((total, product) => {
        return total + (parseFloat(product.price.replace('$', '')) * product.quantity);
    }, 0);

    const updateQuantity = (uniqueKey, newQuantity) => {
        setCartProducts(currentProducts =>
            currentProducts.map(product =>
                product.uniqueKey === uniqueKey ? { ...product, quantity: Math.max(1, newQuantity) } : product
            )
        );
    };

    return (
        <div className="bg-white">
            <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Shopping Cart</h1>
                <form className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
                    <section aria-labelledby="cart-heading" className="lg:col-span-7">
                        <h2 id="cart-heading" className="sr-only">Items in your shopping cart</h2>

                        <ul role="list" className="divide-y divide-gray-200 border-b border-t border-gray-200">
                            {cartProducts.map((product) => (
                                <li key={product.uniqueKey} className="flex py-6 sm:py-10">

                                    <div className="flex-shrink-0">
                                        <img
                                            src={product.imageSrc}
                                            alt={product.imageAlt}
                                            className="h-24 w-24 rounded-md object-cover object-center sm:h-48 sm:w-48"
                                        />
                                    </div>

                                    <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                                        <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                                            <div>
                                                <div className="flex justify-between">
                                                    <h3 className="text-sm">
                                                        <a href={product.href} className="font-medium text-gray-700 hover:text-gray-800">{product.name}</a>
                                                    </h3>
                                                </div>
                                                <div className="mt-1 flex text-sm">
                                                    <p className="text-gray-500">{product.color}</p>
                                                    {product.stoneColor && (
                                                        <p className="ml-4 border-l border-gray-200 pl-4 text-gray-500">{product.stoneColor}</p>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-sm font-medium text-gray-900">{product.price}</p>
                                            </div>

                                            <div className="mt-4 sm:mt-0 sm:pr-9">
                                                <label htmlFor={`quantity-${product.uniqueKey}`} className="sr-only">
                                                    Quantity, {product.name}
                                                </label>
                                                <div className="flex my-10 h-12 w-20 overflow-hidden rounded border">
                                                    <input
                                                        type="text"
                                                        value={product.quantity}
                                                        onChange={e => updateQuantity(product.uniqueKey, parseInt(e.target.value))}
                                                        className="w-full px-4 py-2 outline-none ring-inset ring-indigo-300 transition duration-100 focus:ring"
                                                    />
                                                    <div className="flex flex-col divide-y border-l">
                                                        <button
                                                            type="button"
                                                            onClick={e => { e.preventDefault(); updateQuantity(product.uniqueKey, product.quantity + 1); }}
                                                            className="flex w-6 flex-1 select-none items-center justify-center bg-white leading-none transition duration-100 hover:bg-gray-100 active:bg-gray-200"
                                                        >
                                                            +
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={e => { e.preventDefault(); updateQuantity(product.uniqueKey, product.quantity - 1); }}
                                                            disabled={product.quantity <= 1}
                                                            className="flex w-6 flex-1 select-none items-center justify-center bg-white leading-none transition duration-100 hover:bg-gray-100 active:bg-gray-200"
                                                        >
                                                            -
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="absolute right-0 top-0">
                                                    <button type="button" className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500">
                                                        <span className="sr-only">Remove</span>
                                                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                    <section
                        aria-labelledby="summary-heading"
                        className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
                    >


                        <dl className="space-y-4">
                            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                <dt className="text-base font-medium text-gray-900">Order total</dt>
                                <dd className="text-base font-medium text-gray-900">${orderTotal.toFixed(2)}</dd>
                            </div>
                        </dl>

                        <div className="mt-6">
                            <button
                                type="submit"
                                className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                            >
                                Checkout
                            </button>
                        </div>
                    </section>
                </form>
            </div>
        </div>
    )
}

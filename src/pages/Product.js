import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/20/solid';
import { RadioGroup } from '@headlessui/react';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function ProductDetail() {
    const [product, setProduct] = useState(null);
    const { productId } = useParams();
    const placeholderImage = 'https://via.placeholder.com/150';

    const [selectedPlatingColor, setSelectedPlatingColor] = useState('');
    const [selectedStoneColor, setSelectedStoneColor] = useState('');
    const [quantity, setQuantity] = useState(1);

    // Function to increment quantity
    const incrementQuantity = () => {
        setQuantity(prevQuantity => prevQuantity + 1);
    };

    // Function to decrement quantity
    const decrementQuantity = () => {
        setQuantity(prevQuantity => Math.max(1, prevQuantity - 1));
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`http://localhost:8055/items/Products?fields=*,images.*&filter[id]=${productId}`);
                if (response.data && response.data.data) {
                    const fetchedProduct = response.data.data[0];
                    setProduct(fetchedProduct);
                    setSelectedPlatingColor('Gold'); // Default value
                    if (fetchedProduct.stone_color && fetchedProduct.stone_color.length > 0) {
                        setSelectedStoneColor(fetchedProduct.stone_color[0]);
                    }
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            }
        };

        fetchProduct();
    }, [productId]);

    const userId = 'cfa37b66-49b0-49d1-bf22-d44c784a2e68'; // Static user ID for now

    // Function to handle Add to Bag
    const addToBag = async () => {
        try {
            console.log('Adding to bag for product ID:', productId);

            let cartResponse = await axios.get(`http://0000:8055/items/cart?filter[user]=${userId}`);
            let cartId = cartResponse.data && cartResponse.data.data && cartResponse.data.data.length > 0 ? cartResponse.data.data[0].id : null;

            console.log('Existing cart ID:', cartId);


            if (!cartId) {
                let newCartResponse = await axios.post('http://0000:8055/items/cart', {
                    user: userId,
                    status: 'draft'
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                cartId = newCartResponse.data.data.id;
                console.log('New cart created with ID:', cartId);
            }
            const productData = {
                product: productId, // Assuming this is dynamically obtained
                quantity: quantity,
                cart: cartId,
                price: product.price,
                plating_color: selectedPlatingColor.name, // Make sure this matches actual property names expected by API
                stone_color: selectedStoneColor // Make sure this matches actual property names expected by API
            };

            let productResponse = await axios.post('http://0000:8055/items/cart_details', productData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Product added to cart response:', productResponse.data);
        } catch (error) {
            console.error('Error adding to bag:', error);
        }
    };



    if (!product) {
        return <div>Loading...</div>;
    }

    // Image processing
    const baseUrl = 'http://localhost:8055/assets/';
    const images = product.images.map(image => ({
        src: `${baseUrl}${image.directus_files_id}`,
        alt: product.title
    }));
    while (images.length < 4) {
        images.push({ src: placeholderImage, alt: 'Placeholder' });
    }

    const platingColors = [
        { name: 'Gold', class: 'bg-gold', selectedClass: 'ring-gold' },
        { name: 'Silver', class: 'bg-silver', selectedClass: 'ring-silver' },
        { name: 'Bronze', class: 'bg-bronze', selectedClass: 'ring-bronze' },
    ];


    return (
        <div className="bg-white">
            {/* Image gallery */}
            <div className="mx-auto mt-6 max-w-2xl sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:gap-x-8 lg:px-8">
                <div className="aspect-h-4 aspect-w-3 hidden overflow-hidden rounded-lg lg:block">
                    <img
                        src={images[0].src}
                        alt={images[0].alt}
                        className="h-full w-full object-cover object-center"
                    />
                </div>
                <div className="hidden lg:grid lg:grid-cols-1 lg:gap-y-8">
                    <div className="aspect-h-2 aspect-w-3 overflow-hidden rounded-lg">
                        <img
                            src={images[1].src}
                            alt={images[1].alt}
                            className="h-full w-full object-cover object-center"
                        />
                    </div>
                    <div className="aspect-h-2 aspect-w-3 overflow-hidden rounded-lg">
                        <img
                            src={images[2].src}
                            alt={images[2].alt}
                            className="h-full w-full object-cover object-center"
                        />
                    </div>
                </div>
                <div className="aspect-h-5 aspect-w-4 lg:aspect-h-4 lg:aspect-w-3 sm:overflow-hidden sm:rounded-lg">
                    <img
                        src={images[3].src}
                        alt={images[3].alt}
                        className="h-full w-full object-cover object-center"
                    />
                </div>
            </div>
            <div className="mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:gap-x-8 lg:px-8 lg:pb-24 lg:pt-16">
                <div className="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{product.title}</h1>
                </div>

                {/* Options */}
                <div className="mt-4 lg:row-span-3 lg:mt-0">
                    <h2 className="sr-only">Product information</h2>
                    <p className="text-3xl tracking-tight text-gray-900">${product.price}</p>


                    {/* Plating Color Selection */}
                    <div className="mt-10">
                        <h3 className="text-sm font-medium text-gray-900">Plating Color</h3>
                        <RadioGroup value={selectedPlatingColor} onChange={setSelectedPlatingColor} className="mt-4">
                            <RadioGroup.Label className="sr-only">Choose a plating color</RadioGroup.Label>
                            <div className="flex items-center space-x-3">
                                {platingColors.map((platingColor) => (
                                    <RadioGroup.Option
                                        key={platingColor.name}
                                        value={platingColor}
                                        className={({ active, checked }) =>
                                            classNames(
                                                platingColor.selectedClass,
                                                active && checked ? 'ring ring-offset-1 ring-indigo-500' : '',
                                                !active && checked ? 'ring-2 ring-indigo-500' : '',
                                                'relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none'
                                            )
                                        }
                                    >
                                        {({ active, checked }) => (
                                            <>
                                                <span
                                                    className={classNames(
                                                        platingColor.class,
                                                        'h-8 w-8 rounded-full border border-gray-300',
                                                        checked ? 'ring-2 ring-indigo-500' : '',
                                                        active ? 'ring ring-offset-1 ring-indigo-500' : ''
                                                    )}
                                                    style={{ backgroundColor: platingColor.name }}
                                                />
                                                {checked && (
                                                    <div
                                                        className="absolute inset-0 rounded-full"
                                                        style={{ boxShadow: '0 0 0 2px white, 0 0 0 4px rgba(59, 130, 246, 0.5)' }}
                                                    ></div>
                                                )}
                                            </>
                                        )}
                                    </RadioGroup.Option>
                                ))}
                            </div>
                        </RadioGroup>
                    </div>

                    {product.stone_color && product.stone_color.length > 0 && (
                        <div className="mt-10">
                            <h3 className="text-sm font-medium text-gray-900">Stone Color</h3>
                            <RadioGroup value={selectedStoneColor} onChange={setSelectedStoneColor} className="mt-4">
                                <RadioGroup.Label className="sr-only">Choose a stone color</RadioGroup.Label>
                                <div className="grid grid-cols-4 gap-4">
                                    {product.stone_color.map((stoneColor) => (
                                        <RadioGroup.Option
                                            key={stoneColor}
                                            value={stoneColor}
                                            className={({ active, checked }) =>
                                                classNames(
                                                    'cursor-pointer text-gray-900',
                                                    checked ? 'text-indigo-600' : '',
                                                    'group relative flex items-center justify-center rounded-md border py-3 px-4 text-sm font-medium uppercase focus:outline-none'
                                                )
                                            }
                                        >
                                            {({ active, checked }) => (
                                                <>
                                                    <RadioGroup.Label as="span">{stoneColor}</RadioGroup.Label>
                                                    {checked && (
                                                        <div
                                                            className={classNames(
                                                                'absolute inset-0 rounded-md',
                                                                'ring-2 ring-indigo-500'
                                                            )}
                                                        />
                                                    )}
                                                </>
                                            )}
                                        </RadioGroup.Option>
                                    ))}
                                </div>
                            </RadioGroup>
                        </div>
                    )}
                    {/* Quantity Selector */}
                    <div className="flex my-10 h-12 w-20 overflow-hidden rounded border">
                        <input
                            type="text"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                            className="w-full px-4 py-2 outline-none ring-inset ring-indigo-300 transition duration-100 focus:ring"
                        />

                        <div className="flex flex-col divide-y border-l">
                            <button
                                className="flex w-6 flex-1 select-none items-center justify-center bg-white leading-none transition duration-100 hover:bg-gray-100 active:bg-gray-200"
                                onClick={incrementQuantity}
                            >
                                +
                            </button>
                            <button
                                className="flex w-6 flex-1 select-none items-center justify-center bg-white leading-none transition duration-100 hover:bg-gray-100 active:bg-gray-200"
                                onClick={decrementQuantity}
                                disabled={quantity <= 1}
                            >
                                -
                            </button>
                        </div>
                    </div>
                    {/* Add to Bag Button */}
                    <button
                        onClick={addToBag}
                        type="submit"
                        className="mt-10 flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Add to bag
                    </button>
                </div>

                {/* Product Description */}
                <div className="py-10 lg:col-span-2 lg:col-start-1 lg:border-r lg:border-gray-200 lg:pb-16 lg:pr-8 lg:pt-6">
                    <div>
                        <h3 className="sr-only">Description</h3>
                        <div className="space-y-6">
                            <p className="text-base text-gray-900">{product.Description}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
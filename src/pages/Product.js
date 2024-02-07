import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/20/solid';
import { RadioGroup } from '@headlessui/react';
import StackedNotifications from '../components/CartNotification';
import { AnimatePresence, motion } from "framer-motion";
import { FiAlertCircle, FiShoppingCart, FiX } from "react-icons/fi";
function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function ProductDetail() {
    const [product, setProduct] = useState(null);
    const { productId } = useParams();
    const placeholderImage = 'https://via.placeholder.com/150';
    const [selectedStoneColor, setSelectedStoneColor] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [notification, setNotification] = useState(null);



    const platingColors = [
        { name: 'Gold', class: 'bg-gold', selectedClass: 'ring-gold' },
        { name: 'Silver', class: 'bg-silver', selectedClass: 'ring-silver' },
        { name: 'Bronze', class: 'bg-bronze', selectedClass: 'ring-bronze' },
    ];
    const removeNotif = () => {
        setNotification(null);
    };
    // Function to increment quantity
    const incrementQuantity = () => {
        setQuantity(prevQuantity => prevQuantity + 1);
    };

    // Function to increment quantity by 5
    const incrementQuantityByFive = () => {
        setQuantity(prevQuantity => prevQuantity + 5);
    };

    // Function to decrement quantity by 5
    const decrementQuantityByFive = () => {
        setQuantity(prevQuantity => Math.max(1, prevQuantity - 5));
    };


    // Function to decrement quantity
    const decrementQuantity = () => {
        setQuantity(prevQuantity => Math.max(1, prevQuantity - 1));
    };

    const NOTIFICATION_TTL = 2000;

    const Notification = ({ text, id, removeNotif }) => {
        useEffect(() => {
            const timeoutRef = setTimeout(() => {
                removeNotif();
            }, NOTIFICATION_TTL);

            return () => clearTimeout(timeoutRef);
        }, []);

        return (
            <motion.div
                layout
                initial={{ y: 15, scale: 0.9, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: -25, scale: 0.9, opacity: 0 }}
                transition={{ type: "spring" }}
                className="p-4 w-80 flex items-start rounded-lg gap-2 text-sm font-medium shadow-lg text-white bg-violet-600 fixed z-50 bottom-4 right-4"
            >
                <FiShoppingCart className="text-3xl absolute -top-4 -left-4 p-2 rounded-full bg-white text-violet-600 shadow" />
                <span>{text}</span>
                <button onClick={() => removeNotif(id)} className="ml-auto mt-0.5">
                    <FiX />
                </button>
            </motion.div>
        );
    };
    const [selectedPlatingColor, setSelectedPlatingColor] = useState(platingColors[0]); // Default to first color

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`http://backoffice.gjstylelb.com/items/products?fields=*,images.*&filter[id]=${productId}`);
                if (response.data && response.data.data) {
                    const fetchedProduct = response.data.data[0];
                    setProduct(fetchedProduct);

                    // Set default values based on fetched product
                    setSelectedPlatingColor(platingColors[0]); // or any logic to set based on fetched data
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

    const userId = localStorage.getItem('userId');

    const addToBag = async () => {
        try {

            // Fetch the current cart details
            let cartResponse = await axios.get(`http://backoffice.gjstylelb.com/items/cart?filter[user]=${userId}`);
            let cartId = cartResponse.data && cartResponse.data.data && cartResponse.data.data.length > 0 ? cartResponse.data.data[0].id : null;


            if (!cartId) {
                let newCartResponse = await axios.post('http://backoffice.gjstylelb.com/items/cart', {
                    user: userId,
                    status: 'draft'
                });
                cartId = newCartResponse.data.data.id;
            }

            // Fetch the cart details
            let cartDetailsResponse = await axios.get(`http://backoffice.gjstylelb.com/items/cart_details?filter[cart]=${cartId}`);
            let cartDetails = cartDetailsResponse.data.data;



            // Check if product with same properties exists
            // Convert productId to the correct type if necessary
            const parsedProductId = parseInt(productId); // Use this if the IDs in cart are numbers

            // Check if product with same properties exists
            let existingItem = cartDetails.find(item =>
                item.product === parsedProductId &&  // Compare using the parsed product ID
                item.plating_color === selectedPlatingColor.name &&
                item.stone_color === selectedStoneColor);



            if (existingItem) {
                // Convert both quantities to numbers before adding
                let updatedQuantity = (parseInt(existingItem.quantity, 10) || 0) + (parseInt(quantity, 10) || 0);

                await axios.patch(`http://backoffice.gjstylelb.com/items/cart_details/${existingItem.id}`, {
                    quantity: updatedQuantity
                });

            } else {
                // Add new item to cart
                const productData = {
                    product: productId,
                    quantity: quantity,
                    cart: cartId,
                    price: product.price,
                    plating_color: selectedPlatingColor.name,
                    stone_color: selectedStoneColor
                };

                await axios.post('http://backoffice.gjstylelb.com/items/cart_details', productData);
            }
        } catch (error) {
            console.error('Error adding to bag:', error);
        }
    };





    if (!product) {
        return <div>Loading...</div>;
    }

    // Image processing
    const baseUrl = 'http://backoffice.gjstylelb.com/assets/';
    const images = product.images.map(image => ({
        src: `${baseUrl}${image.directus_files_id}`,
        alt: product.title
    }));
    while (images.length < 4) {
        images.push({ src: placeholderImage, alt: 'Placeholder' });
    }

    const selectedBorderClass = 'ring-2 ring-offset-2 ring-red-500';

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
                        <h3 className="text-sm font-medium text-gray-900">Plating Color <span className="text-red-500">*</span></h3>
                        <RadioGroup value={selectedPlatingColor} onChange={setSelectedPlatingColor} className="mt-4">
                            <RadioGroup.Label className="sr-only">Choose a plating color</RadioGroup.Label>
                            <div className="flex items-center space-x-3">
                                {platingColors.map((platingColor) => (
                                    <RadioGroup.Option
                                        key={platingColor.name}
                                        value={platingColor}
                                        className={({ checked }) =>
                                            classNames(
                                                'relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none',
                                                platingColor.name === selectedPlatingColor.name ? `${selectedBorderClass} ring-4 ring-red-500` : 'ring-1 ring-gray-300'
                                            )
                                        }
                                    >
                                        <span
                                            className={classNames(
                                                platingColor.class,
                                                'h-8 w-8 rounded-full border border-gray-300',
                                                platingColor.name === selectedPlatingColor.name && selectedBorderClass
                                            )}
                                            style={{ backgroundColor: platingColor.name }}
                                        />
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




                    <div className="flex my-10 h-12 w-28 overflow-hidden rounded border">
                        <input
                            type="text"
                            value={quantity}
                            readOnly // Makes the input field read-only
                            className="w-full px-4 py-2 outline-none ring-inset ring-indigo-300 transition duration-100 focus:ring"
                        />

                        <div className="flex flex-col divide-y border-l">
                            <button
                                type="button"
                                onClick={incrementQuantity}
                                className="flex w-6 flex-1 select-none items-center justify-center bg-white leading-none transition duration-100 hover:bg-gray-100 active:bg-gray-200"
                            >
                                +
                            </button>
                            <button
                                type="button"
                                onClick={decrementQuantity}
                                disabled={quantity <= 1}
                                className="flex w-6 flex-1 select-none items-center justify-center bg-white leading-none transition duration-100 hover:bg-gray-100 active:bg-gray-200"
                            >
                                -
                            </button>
                        </div>

                        <div className="flex flex-col divide-y border-l">
                            <button
                                type="button"
                                onClick={incrementQuantityByFive}
                                className="flex w-7 flex-1 select-none items-center justify-center bg-white leading-none transition duration-100 hover:bg-gray-100 active:bg-gray-200"
                            >
                                +5
                            </button>
                            <button
                                type="button"
                                onClick={decrementQuantityByFive}
                                disabled={quantity < 5}
                                className={`flex w-7 flex-1 select-none items-center justify-center bg-white leading-none transition duration-100 hover:bg-gray-100 active:bg-gray-200 ${product.quantity < 5 ? 'hidden' : ''}`}
                            >
                                -5
                            </button>
                        </div>
                    </div>

                    {/* Add to Bag Button */}
                    <AnimatePresence>
                        {notification && (
                            <Notification
                                removeNotif={removeNotif}
                                key={notification.id}
                                {...notification}
                            />
                        )}
                    </AnimatePresence>
                    <button
                        onClick={() => {
                            addToBag().then(() => {
                                if (selectedPlatingColor.name) {
                                    // Only set the notification if a plating color is selected
                                    setNotification({
                                        id: Math.random(),
                                        text: "Added to Cart"
                                    });
                                }
                            });
                        }}
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
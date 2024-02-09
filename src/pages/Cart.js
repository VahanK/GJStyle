import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { XMarkIcon, CheckIcon, ClockIcon, QuestionMarkCircleIcon } from '@heroicons/react/20/solid';
import { AnimatePresence, motion } from "framer-motion";
import { FiDelete, FiDollarSign } from "react-icons/fi";
import { MdConfirmationNumber, MdDeleteOutline } from "react-icons/md";
import { FiAlertCircle, FiShoppingCart, FiX } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';

export default function Cart() {
    const [cartProducts, setCartProducts] = useState([]);
    const [isOpenShipping, setIsOpenShipping] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [currentDeletingItemId, setCurrentDeletingItemId] = useState(null);
    const [modifiedItems, setModifiedItems] = useState([]);
    const [isCheckoutConfirmationOpen, setIsCheckoutConfirmationOpen] = useState(false);
    const navigate = useNavigate();

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchCartData = async () => {
            try {

                const response = await axios.get(`https://backoffice.gjstylelb.com/items/cart?fields=*,cart_details.*,cart_details.product.*,cart_details.product.category.*,cart_details.product.images.*&filter[user][_eq]=${userId}`);
                const cartData = response.data.data[0].cart_details;

                const transformedProducts = cartData.map(detail => ({
                    uniqueKey: `${detail.product.id}-${detail.plating_color}-${detail.stone_color}`, // Create a unique key
                    id: detail.product.id,
                    name: detail.product.title,
                    href: '#',
                    price: `$${detail.price}`,
                    cartDetailId: detail.id,
                    color: detail.plating_color,
                    stoneColor: detail.stone_color,
                    imageSrc: `https://backoffice.gjstylelb.com/assets/${detail.product.images[0].directus_files_id}`,
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

    const clearCart = async () => {
        try {
            // Loop through each product in the cart
            for (const product of cartProducts) {
                // Construct the endpoint for deleting individual cart detail item
                // Assuming the endpoint requires the cartDetailId for deletion
                const deleteEndpoint = `https://backoffice.gjstylelb.com/items/cart_details/${product.cartDetailId}`;

                // Make the API call to delete the cart item
                await axios.delete(deleteEndpoint);
            }

            // After all items are deleted, clear the cartProducts state
            setCartProducts([]);

        } catch (error) {
            console.error('Error clearing the cart:', error);
        }
    };



    const processCheckout = async () => {
        setIsCheckoutConfirmationOpen(false); // Close the confirmation modal
        try {

            // Directly create a new order
            let newOrderResponse = await axios.post('https://backoffice.gjstylelb.com/items/order', {
                user: userId,
                status: 'draft' // Set initial order status
            });

            let orderId = newOrderResponse.data.data.id;



            for (const product of cartProducts) {
                try {
                    const orderData = {
                        product: product.id,
                        quantity: product.quantity,
                        order: orderId,
                        price: parseFloat(product.price.replace('$', '')), // Assuming price is a string like "$20"
                        plating_color: product.color,
                        stone_color: product.stoneColor
                    };
                    const response = await axios.post('https://backoffice.gjstylelb.com/items/order_details', orderData);
                } catch (error) {
                    console.error(`Error adding product ${product.id} to order:`, error);
                }
            }
            // Clear the cart after successful checkout
            await clearCart();

        } catch (error) {
            console.error('Error processing checkout:', error);
        }
    };

    const handleCheckout = async (event) => {
        event.preventDefault();
        setIsCheckoutConfirmationOpen(true); // Show the confirmation modal
    };


    const updateQuantity = (uniqueKey, newQuantity) => {
        setCartProducts((prevCartProducts) => {
            return prevCartProducts.map((product) => {
                if (product.uniqueKey === uniqueKey) {
                    const updatedProduct = { ...product, quantity: newQuantity };
                    // Update modifiedItems directly here
                    setModifiedItems((prevModifiedItems) => {
                        const existingItemIndex = prevModifiedItems.findIndex(item => item.uniqueKey === uniqueKey);
                        if (existingItemIndex > -1) {
                            // Replace the existing item
                            const updatedItems = [...prevModifiedItems];
                            updatedItems[existingItemIndex] = updatedProduct;
                            return updatedItems;
                        } else {
                            // Add the new item
                            return [...prevModifiedItems, updatedProduct];
                        }
                    });
                    return updatedProduct;
                }
                return product;
            });
        });

        setHasUnsavedChanges(true);
    };




    const saveCartChanges = async () => {

        try {
            for (const product of modifiedItems) {
                const updatePayload = {
                    plating_color: product.color,
                    stone_color: product.stoneColor,
                    quantity: product.quantity
                };


                await axios.patch(`https://backoffice.gjstylelb.com/items/cart_details/${product.cartDetailId}`, updatePayload);
            }
            setHasUnsavedChanges(false);
            setModifiedItems([]);
        } catch (error) {
            console.error('Error updating cart:', error);
        }
    };



    const orderTotal = cartProducts.reduce((total, product) => {
        return total + (parseFloat(product.price.replace('$', '')) * product.quantity);
    }, 0);


    const handleDeleteItem = (cartDetailId) => {

        setCartProducts(currentProducts => currentProducts.filter(product => product.cartDetailId !== cartDetailId));
        // Optional: Make an API call to remove the item from the backend
        axios.delete(`https://backoffice.gjstylelb.com/items/cart_details/${cartDetailId}`)
            .then(response => {
            })
            .catch(error => {
                console.error('Error deleting item:', error);
            });
    };





    return (
        <div className="bg-white">
            <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Shopping Cart</h1>
                <form className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
                    <section aria-labelledby="cart-heading" className="lg:col-span-7">
                        <h2 id="cart-heading" className="sr-only">Items in your shopping cart</h2>

                        <ul role="list" className="divide-y divide-gray-200 border-b border-t border-gray-200">
                            {cartProducts.length === 0 ? (
                                // Display a message when the cart is empty
                                <div className="text-center mx-auto py-6 sm:py-10">
                                    <h3 className="text-lg font-medium text-gray-700">Your cart is currently empty.</h3>
                                    <p className="mt-2 text-sm text-gray-500">Browse our categories and discover our products</p>
                                    <a onClick={() => navigate(`/categories`)} className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500">
                                        categories
                                    </a>
                                </div>
                            ) : (cartProducts.map((product) => (
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
                                                <div className="mt-1 flex-col text-sm">
                                                    <p className="text-gray-500">Plating Color : {product.color}</p>
                                                    {product.stoneColor && (
                                                        <p className=" border-gray-200  text-gray-500">Stone Color : {product.stoneColor}</p>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-sm font-medium text-gray-900">{product.price}</p>
                                            </div>

                                            <div className="mt-4 sm:mt-0 sm:pr-9">
                                                <label htmlFor={`quantity-${product.uniqueKey}`} className="sr-only">
                                                    Quantity, {product.name}
                                                </label>
                                                <div className="flex my-10 h-12 w-28 overflow-hidden rounded border">
                                                    <input
                                                        type="text"
                                                        value={product.quantity}
                                                        readOnly // Add this attribute to make the input field read-only
                                                        className="w-full px-4 py-2 outline-none ring-inset ring-indigo-300 transition duration-100 focus:ring"
                                                    />

                                                    <div className="flex flex-col divide-y border-l">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(product.uniqueKey, product.quantity + 1)}
                                                            className="flex w-6 flex-1 select-none items-center justify-center bg-white leading-none transition duration-100 hover:bg-gray-100 active:bg-gray-200"
                                                        >
                                                            +
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(product.uniqueKey, product.quantity - 1)}
                                                            disabled={product.quantity < 1}
                                                            className="flex w-6 flex-1 select-none items-center justify-center bg-white leading-none transition duration-100 hover:bg-gray-100 active:bg-gray-200"
                                                        >
                                                            -
                                                        </button>
                                                    </div>

                                                    <div className="flex flex-col divide-y border-l">

                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(product.uniqueKey, product.quantity + 5)}
                                                            className={`flex w-7 flex-1 select-none items-center justify-center bg-white leading-none transition duration-100 hover:bg-gray-100 active:bg-gray-200 `}
                                                        >
                                                            +5
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(product.uniqueKey, product.quantity - 5)}
                                                            disabled={product.quantity < 5}
                                                            className={`flex w-7 flex-1 select-none items-center justify-center bg-white leading-none transition duration-100 hover:bg-gray-100 active:bg-gray-200 ${product.quantity < 5 ? 'hidden' : ''}`}
                                                        >
                                                            -5
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="absolute right-0 top-0">
                                                    <button onClick={() => setIsOpen(true)} type="button" className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500">
                                                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />


                                                    </button>
                                                    <DeleteModal isOpen={isOpen} setIsOpen={setIsOpen} cartDetailId={product.cartDetailId} onDelete={handleDeleteItem} />

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))
                            )}
                        </ul>
                    </section>
                    {cartProducts.length > 0 && (
                        <section
                            aria-labelledby="summary-heading"
                            className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
                        >


                            <dl className="space-y-4">
                                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                    <dt className="flex text-sm text-gray-600">

                                        <span>Shipping Estimate</span>
                                        <a href="#" className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500">
                                            <span className="sr-only">Learn more about how tax is calculated</span>
                                            <QuestionMarkCircleIcon onClick={() => setIsOpenShipping(true)} className="h-5 w-5" aria-hidden="true" />
                                            <ShippingModal isOpenShipping={isOpenShipping} setIsOpenShipping={setIsOpenShipping} />
                                        </a>
                                    </dt>
                                    <dd className="text-sm font-medium text-gray-900"></dd>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                    <dt className="text-base font-medium text-gray-900">Order total</dt>
                                    <dd className="text-base font-medium text-gray-900">${orderTotal.toFixed(2)}</dd>
                                </div>
                            </dl>




                            <div className="mt-6">
                                {hasUnsavedChanges && (
                                    <div className="mt-4">
                                        <button
                                            type="button" // Set the type to "button"
                                            onClick={saveCartChanges} // Add onClick handler
                                            className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 my-2"
                                        >
                                            Save Changes
                                        </button>

                                    </div>
                                )}

                                <button
                                    className={`w-full rounded-md border border-transparent px-4 py-3 text-base font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 
                ${hasUnsavedChanges ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'}`}
                                    type="button"
                                    onClick={(e) => handleCheckout(e)}
                                    disabled={hasUnsavedChanges} // Disable the button if there are unsaved changes
                                >
                                    Checkout
                                </button>
                                <CheckoutConfirmationModal
                                    isOpen={isCheckoutConfirmationOpen}
                                    setIsOpen={setIsCheckoutConfirmationOpen}
                                    onConfirm={processCheckout}
                                />

                            </div>
                        </section>
                    )}
                </form>
            </div>
        </div>
    )
}


const ShippingModal = ({ isOpenShipping, setIsOpenShipping }) => {
    return (
        <AnimatePresence>
            {isOpenShipping && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsOpenShipping(false)}
                    className="bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
                >
                    <motion.div
                        initial={{ scale: 0, rotate: "12.5deg" }}
                        animate={{ scale: 1, rotate: "0deg" }}
                        exit={{ scale: 0, rotate: "0deg" }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white p-6 rounded-lg w-full max-w-lg shadow-xl cursor-default relative overflow-hidden"
                    >
                        <FiDollarSign className="text-white/10 rotate-12 text-[250px] absolute z-0 -top-24 -left-24" />
                        <div className="relative z-10">
                            <div className="bg-white w-16 h-16 mb-2 rounded-full text-3xl text-indigo-600 grid place-items-center mx-auto">
                                <FiDollarSign />
                            </div>
                            <h3 className="text-3xl font-bold text-center mb-2">
                                Shipping Estimation
                            </h3>
                            <p className="text-center mb-6">

                                Shipping costs will be calculated after you place the order.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsOpenShipping(false)}
                                    className="bg-white hover:opacity-90 transition-opacity text-indigo-600 font-semibold w-full py-2 rounded"
                                >
                                    ok
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


const DeleteModal = ({ isOpen, setIsOpen, cartDetailId, onDelete }) => {
    const handleDelete = () => {
        onDelete(cartDetailId);
        setIsOpen(false);
    };
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsOpen(false)}
                    className="bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
                >
                    <motion.div
                        initial={{ scale: 0, rotate: "12.5deg" }}
                        animate={{ scale: 1, rotate: "0deg" }}
                        exit={{ scale: 0, rotate: "0deg" }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white p-6 rounded-lg w-full max-w-lg shadow-xl cursor-default relative overflow-hidden"
                    >
                        <MdDeleteOutline className="text-white/10 rotate-12 text-[250px] absolute z-0 -top-24 -left-24" />
                        <div className="relative z-10">
                            <div className="bg-white w-16 h-16 mb-2 rounded-full text-3xl text-indigo-600 grid place-items-center mx-auto">
                                <MdDeleteOutline />
                            </div>
                            <h3 className="text-3xl font-bold text-center mb-2">
                                Delete Item?
                            </h3>
                            <p className="text-center mb-6">
                                Are you sure you want to remove this item from your cart?
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="bg-transparent hover:bg-white/10 transition-colors text-white font-semibold w-full py-2 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="bg-white hover:opacity-90 transition-opacity text-indigo-600 font-semibold w-full py-2 rounded"
                                >
                                    Yes
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


const CheckoutConfirmationModal = ({ isOpen, setIsOpen, onConfirm }) => {

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsOpen(false)}
                    className="bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
                >
                    <motion.div
                        initial={{ scale: 0, rotate: "12.5deg" }}
                        animate={{ scale: 1, rotate: "0deg" }}
                        exit={{ scale: 0, rotate: "0deg" }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white p-6 rounded-lg w-full max-w-lg shadow-xl cursor-default relative overflow-hidden"
                    >
                        <MdConfirmationNumber className="text-white/10 rotate-12 text-[250px] absolute z-0 -top-24 -left-24" />
                        <div className="relative z-10">
                            <h3 className="text-3xl font-bold text-center mb-2">
                                Confirm Checkout
                            </h3>
                            <p className="text-center mb-6">
                                Are you sure you want to proceed with the checkout?
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type='button'
                                    onClick={() => setIsOpen(false)}
                                    className="bg-transparent hover:bg-white/10 transition-colors text-white font-semibold w-full py-2 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type='button'
                                    onClick={onConfirm}
                                    className="bg-white hover:opacity-90 transition-opacity text-indigo-600 font-semibold w-full py-2 rounded"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

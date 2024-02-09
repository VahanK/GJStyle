import { Fragment } from 'react'
import { Dialog, Menu, Transition } from '@headlessui/react'
import { EllipsisVerticalIcon, XMarkIcon } from '@heroicons/react/20/solid'



import { useState, useEffect } from 'react';
function formatDate(dateString) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        fetch(`https://backoffice.gjstylelb.com/items/order?fields=*,order_details.*,order_details.product.*,order_details.product.category.*,order_details.product.images.*,images.url&filter[user][_eq]=${userId}`)
            .then(response => response.json())
            .then(data => {
                const sortedOrders = data.data.sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
                setOrders(sortedOrders);
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);


    const handleViewOrder = (order) => {
        setSelectedOrder(order);
    };



    return (
        <>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl mx-10 lg:mx-auto">Order History</h1>

            {orders.length > 0 ? (
                <ul role="list" className="md:max-w-7xl mx-10 lg:mx-auto divide-y divide-gray-100">
                    {orders.map((order) => (
                        <li key={order.id} className="flex items-center justify-between gap-x-6 py-5">
                            <div className="min-w-0">
                                <div className="flex items-start gap-x-3">
                                    <p className="text-sm leading-6 text-gray-900">Order ID: {order.id}</p>
                                </div>
                                <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                                    <p className="whitespace-nowrap">
                                        <span className="hidden md:inline">Order Date: </span>
                                        <time dateTime={order.date_created}>{formatDate(order.date_created)}</time>
                                    </p>

                                    <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
                                        <circle cx={1} cy={1} r={1} />
                                    </svg>
                                    <p className="truncate">Item Count: {order.order_details.length}</p>
                                </div>
                            </div>
                            <div className="flex flex-none  items-center gap-x-4">
                                <button
                                    className="rounded-md bg-white px-2.5 py-1.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 block"
                                    onClick={() => handleViewOrder(order)}
                                >
                                    View Order<span className="sr-only"> {order.id}</span>
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-lg mt-20 text-gray-900 mx-10 lg:mx-auto">No orders found.</p>
            )}
            {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
        </>
    );
}

// OrderDetailsModal Component
export function OrderDetailsModal({ order, onClose }) {
    const [open, setOpen] = useState(true)
    // Function to calculate the total price of the order
    const calculateTotalPrice = (orderDetails) => {
        return orderDetails.reduce((total, detail) => {
            return total + (detail.product.price * detail.quantity);
        }, 0);
    };

    const handleClose = () => {
        setOpen(false);
        onClose(); // Call the passed onClose function
    };


    const totalPrice = calculateTotalPrice(order.order_details);

    return (

        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={() => setOpen(false)}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="hidden sm:fixed sm:inset-0 sm:block sm:bg-gray-500 sm:bg-opacity-75 sm:transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-stretch justify-center text-center sm:items-center sm:px-6 lg:px-8">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-105"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-105"
                        >
                            <Dialog.Panel className="flex w-full max-w-3xl transform text-left text-base transition sm:my-8">
                                <form className="relative flex w-full flex-col overflow-hidden bg-white pb-8 pt-6 sm:rounded-lg sm:pb-6 lg:py-8">
                                    <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
                                        <h2 className="text-lg font-medium text-gray-900">Order Details</h2>
                                        <button type="button" className="text-gray-400 hover:text-gray-500" onClick={handleClose}>
                                            <span className="sr-only">Close</span>
                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>

                                    <section aria-labelledby="cart-heading">
                                        <h2 id="cart-heading" className="sr-only">
                                            Items in your shopping cart
                                        </h2>
                                        <ul role="list" className="divide-y divide-gray-200 px-4 sm:px-6 lg:px-8">
                                            {order.order_details.map((detail, index) => (
                                                <li key={detail.id} className="flex py-8 text-sm sm:items-center">
                                                    <img
                                                        src={`https://backoffice.gjstylelb.com/assets/${detail.product.images[0].directus_files_id}`}
                                                        alt={`https://backoffice.gjstylelb.com/assets/${detail.product.images[0].directus_files_id}`}
                                                        className="h-24 w-24 flex-none rounded-lg border border-gray-200 sm:h-32 sm:w-32"
                                                    />
                                                    <div className="ml-4 grid flex-auto grid-cols-1 grid-rows-1 items-start gap-x-5 gap-y-3 sm:ml-6 sm:flex sm:items-center sm:gap-0">
                                                        <div className="row-end-1 flex-auto sm:pr-6">
                                                            <h3 className="font-medium text-gray-900">
                                                                <a href={detail.product.id}>{detail.product.title}</a>
                                                            </h3>
                                                            <p className="mt-1 text-gray-500">Plating color: {detail.plating_color}</p>
                                                            <p className="mt-1 text-gray-500">Stone color: {detail.stone_color}</p>
                                                            <p className="mt-1 text-gray-500">Quantity : {detail.quantity}</p>
                                                        </div>
                                                        <p className="row-span-2 row-end-2 font-medium text-gray-900 sm:order-1 sm:ml-6 sm:w-1/3 sm:flex-none sm:text-right">
                                                            ${detail.price}
                                                        </p>


                                                    </div>
                                                </li>
                                            ))}
                                        </ul>

                                    </section>

                                    <section aria-labelledby="summary-heading" className="mt-auto sm:px-6 lg:px-8">
                                        <div className="bg-gray-50 p-6 sm:rounded-lg sm:p-8">
                                            <h2 id="summary-heading" className="sr-only">
                                                Order summary
                                            </h2>

                                            <div className="flow-root">
                                                <dl className="-my-4 divide-y divide-gray-200 text-sm">

                                                    <div className="flex items-center justify-between py-4">
                                                        <dt className="text-base font-medium text-gray-900">Order total</dt>
                                                        <dd className="text-base font-medium text-gray-900">${totalPrice}</dd>
                                                    </div>
                                                </dl>
                                            </div>
                                        </div>
                                    </section>

                                    <div className="mt-8 flex justify-end px-4 sm:px-6 lg:px-8">
                                        <button
                                            onClick={handleClose}
                                            type="button"
                                            className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root >


    );
}
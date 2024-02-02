import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, ShoppingCartIcon, UserCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { navigate, useNavigate } from 'react-router-dom'
import { FiLogOut } from 'react-icons/fi';
import { AnimatePresence, motion } from "framer-motion";
import { FiAlertCircle } from "react-icons/fi";
import { useState } from "react";


export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate(); // Correctly use the useNavigate hook

    const handleLogout = () => {
        localStorage.removeItem('accessToken'); // Clear the stored token
        localStorage.removeItem('userId'); // Also clear the stored user ID
        setIsOpen(false);
        navigate('/'); // Redirect to the login page
    };

    return (
        <Disclosure as="nav" className="bg-white">
            {({ open }) => (
                <>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex">
                                <div className="flex flex-shrink-0 items-center">
                                    <img
                                        className="h-8 w-auto rounded"
                                        src="/logo.jpg"
                                        alt="Your Company"
                                    />
                                </div>
                                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                    <a
                                        onClick={() => navigate('/categories')}
                                        className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                    >
                                        Products
                                    </a>
                                    <a
                                        href="#"
                                        className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                    >
                                        New Products
                                    </a>

                                </div>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:items-center">
                                <a
                                    onClick={() => navigate('/orderhistory')}
                                    className="inline-flex mx-4 items-center border-b-2 border-transparent  pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                >
                                    Order History
                                </a>
                                <button
                                    onClick={() => navigate('/cart')}
                                    type="button"
                                    className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                >
                                    <span className="absolute -inset-1.5" />
                                    <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
                                </button>
                                <button
                                    // onClick={handleLogout}
                                    onClick={() => setIsOpen(true)}
                                    type="button"
                                    className="relative rounded-full ml-2 bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                >
                                    <span className="absolute -inset-1.5" />
                                    <span className="sr-only">Logout</span>
                                    <FiLogOut className="h-6 w-6" aria-hidden="true" />
                                </button>
                                <LogoutModal isOpen={isOpen} setIsOpen={setIsOpen} handleLogout={handleLogout} />

                            </div>
                            <div className="-mr-2 flex items-center sm:hidden">
                                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                                    <span className="absolute -inset-0.5" />
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                    )}
                                </Disclosure.Button>
                            </div>
                        </div>
                    </div>

                    <Disclosure.Panel className="sm:hidden">
                        <div className="">
                            {/* Current: "bg-indigo-50 border-indigo-500 text-indigo-700", Default: "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700" */}
                            <Disclosure.Button
                                as="a"
                                href="#"
                                className="block border-l-4 border-indigo-500 bg-indigo-50 py-2 pl-3 pr-4 text-base font-medium text-indigo-700"
                            >
                                Dashboard
                            </Disclosure.Button>
                            <Disclosure.Button
                                as="a"
                                href="#"
                                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                            >
                                Team
                            </Disclosure.Button>
                            <Disclosure.Button
                                as="a"
                                href="#"
                                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                            >
                                Projects
                            </Disclosure.Button>
                            <Disclosure.Button
                                as="a"
                                href="#"
                                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                            >
                                Calendar
                            </Disclosure.Button>
                        </div>

                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    )
}


const LogoutModal = ({ isOpen, setIsOpen, handleLogout }) => {
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
                        <FiAlertCircle className="text-white/10 rotate-12 text-[250px] absolute z-0 -top-24 -left-24" />
                        <div className="relative z-10">
                            <div className="bg-white w-16 h-16 mb-2 rounded-full text-3xl text-indigo-600 grid place-items-center mx-auto">
                                <FiAlertCircle />
                            </div>
                            <h3 className="text-3xl font-bold text-center mb-2">
                                Log Out!
                            </h3>
                            <p className="text-center mb-6">
                                Are you sure you want to log out?
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="bg-transparent hover:bg-white/10 transition-colors text-white font-semibold w-full py-2 rounded"
                                >
                                    Nah, go back
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="bg-white hover:opacity-90 transition-opacity text-indigo-600 font-semibold w-full py-2 rounded"
                                >
                                    Understood!
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
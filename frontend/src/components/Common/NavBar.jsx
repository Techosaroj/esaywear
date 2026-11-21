import React, { useState } from 'react'
import { HiOutlineUser, HiOutlineShoppingBag, HiBars3BottomRight } from 'react-icons/hi2'
import { Link } from 'react-router-dom'
import SearchBar from './SearchBar'
import CartDrawer from '../Layout/CartDrawer'
import { IoMdClose } from 'react-icons/io'
import { useSelector } from 'react-redux'

const NavBar = () => {
    const[drawerOpen, setDrawerOpen] = useState(false);
    const [navDrawerOpen, setnavDrawerOpen] = useState(false);
    const {cart} = useSelector((state) => state.cart)
    const {user} = useSelector((state) => state.auth)

    const cartItemCount = cart?.products?.reduce((total, product) => total + product.quantity, 0) || 0

    const toggleNaDrawer = () =>{
        setnavDrawerOpen(!navDrawerOpen)
    }

    const toggleCartDrawer = () =>{
        setDrawerOpen(!drawerOpen);
    }


    return (
        <>
            <nav className='fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm'>
                <div className='container mx-auto flex items-center justify-between py-4 px-6'>
                    <div>
                        <Link to="/" className="text-2xl font-bold tracking-tight text-black hover:text-gray-700 transition-colors">EasyWear</Link>

                    </div>

                    <div className="hidden md:flex space-x-8">
                        <Link to="/collections/all?gender=Men" className='text-gray-700 hover:text-black text-sm font-semibold uppercase tracking-wide transition-colors duration-200'>Men</Link>
                        <Link to="/collections/all?gender=Women" className='text-gray-700 hover:text-black text-sm font-semibold uppercase tracking-wide transition-colors duration-200'>Women</Link>
                        <Link to="/collections/all?category=Top Wear" className='text-gray-700 hover:text-black text-sm font-semibold uppercase tracking-wide transition-colors duration-200'>Top Wear</Link>
                        <Link to="/collections/all?category=Bottom Wear" className='text-gray-700 hover:text-black text-sm font-semibold uppercase tracking-wide transition-colors duration-200'>Bottom Wear</Link>
                    </div>

                    <div className="flex items-center space-x-5">
                        {user && user.role === "admin" &&( <Link to="/admin" className='block bg-black px-3 py-1.5 rounded-md text-sm text-white hover:bg-gray-800 transition-colors duration-200 font-medium'>Admin</Link>)}
                       
                        <Link to="/profile" className='hover:text-black transition-colors duration-200'>
                            <HiOutlineUser className='h-6 w-6 text-gray-700 hover:text-black' />
                        </Link>
                        <button
                        onClick={toggleCartDrawer}
                        className='relative hover:text-black cursor-pointer transition-colors duration-200'>
                            <HiOutlineShoppingBag className='h-6 w-6 text-gray-700 hover:text-black' />
                            {cartItemCount > 0 && (<span className='absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5 font-semibold min-w-[20px] text-center'>{cartItemCount}</span>)}
                            
                        </button>

                        <div className="overflow-hidden">
                            <SearchBar className="cursor-pointer" />
                        </div>

                        <button onClick={toggleNaDrawer} className='md:hidden hover:text-black transition-colors duration-200'>
                            <HiBars3BottomRight className='h-6 w-6 text-gray-700 hover:text-black' />
                        </button>
                    </div>
                </div>
            </nav>

            <CartDrawer drawerOpen={drawerOpen} toggleCartDrawer={toggleCartDrawer} />

            {/* Mobile Navigation*/}

            <div className={`fixed top-0 left-0 w-3/4 sm:w-1/2 md:w-1/3 h-full bg-white shadow-xl transform transition-transform duration-300 z-40 ${
            navDrawerOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className='flex justify-end p-4'>
                    <button onClick={toggleNaDrawer}>
                        <IoMdClose className='h-6 w-6 text-gray-600' />
                    </button>

                </div>
                <div className="p-4">
                    <h2 className="text-xl font-semibold mb-4">Menu</h2>
                    <nav className='spacey-4 '>
                        <Link to="/collections/all?gender=Men" onClick={toggleNaDrawer} className='block text-gray-600 hover:text-black'>
                        Men
                        </Link>
                        <Link to="/collections/all?gender=Women" onClick={toggleNaDrawer} className='block text-gray-600 hover:text-black'>
                        Women
                        </Link>
                        <Link to="/collections/all?category=Top Wear" onClick={toggleNaDrawer} className='block text-gray-600 hover:text-black'>
                        Top Wear
                        </Link>
                        <Link to="/collections/all?category=Bottom Wear" onClick={toggleNaDrawer} className='block text-gray-600 hover:text-black'>
                        Bottom Wear
                        </Link>
                    </nav>
                </div>
            </div>

        </>
    )
}

export default NavBar

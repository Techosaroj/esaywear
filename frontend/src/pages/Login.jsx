import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import login from "../images/img7.jpg";
import { loginUser } from "../redux/slices/authSlice";
import { useDispatch, useSelector } from 'react-redux';
import { mergeCart } from '../redux/slices/cartSlice';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, guestId, error: authError, loading } = useSelector((state) => state.auth)
    const { cart } = useSelector((state) => state.cart);

    // Get redirect params
    const redirect = new URLSearchParams(location.search).get("redirect") || "/";
    const isCheckoutRedirect = redirect.includes("checkout");

    useEffect(() => {
        if (user) {
            if (cart?.products.length > 0 && guestId) {
                dispatch(mergeCart({ guestId, user })).then(() => {
                    navigate(isCheckoutRedirect ? "/checkout" : "/");
                })
            } else {
                navigate(isCheckoutRedirect ? "/checkout" : "/");
            }
        }
    }, [user, guestId, cart, navigate, isCheckoutRedirect, dispatch])



    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(loginUser({ email, password }))

    }

    return (
        <div className='flex bg-gray-200'>
            <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12">
                <form onSubmit={handleSubmit} className='w-full max-w-md bg-white p-8 rounded-lg shadow-lg' action="">
                    <div className="flex justify-center mb-6">
                        <h2 className='text-xl font-medium'>EasyWear</h2>
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-6">Hey there! 👋</h2>
                    {authError && (
                        <p className="text-center mb-4 text-red-600">
                            {authError}
                        </p>
                    )}
                    <p className="text-center mb-4">
                        Enter your username and password to Login
                    </p>
                    <div className="mb4">
                        <label className='block text-sm font-semibold mb-2'>Email</label>
                        <input type="email"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                            className='w-full p-2 border rounded'
                            placeholder='Enter your email address' />
                    </div>

                    <div className="mb-4 relative">
                        <label className='block text-sm font-semibold mt-2'>Password</label>
                        <input type={showPassword ? "text" : "password"}
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            className='w-full p-2 border rounded pr-10'
                            placeholder='Enter your password' />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 text-sm focus:outline-none"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                    <button
                        type='submit'
                        disabled={loading}
                        className="w-full bg-black text-white p-2 rounded-lg font-semibold hover:bg-gray-800 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                    <p className="mt-6 text-center text-sm">
                        Dont have an account? {" "}
                        <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} className='text-blue-500 underline'>Register</Link>
                    </p>
                </form>
            </div>
            <div className="hidden md:block w-1/2 bg-gray-800">
                <div className="h-full flex flex-col justify-center items-center">
                    <img src={login} alt="Login to Account" className='h-[750px] w-full object-cover' />
                </div>
            </div>

        </div>
    )
}

export default Login

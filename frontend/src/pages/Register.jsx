import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import register from "../images/img1.jpg";
import { registerUser } from '../redux/slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { mergeCart } from '../redux/slices/cartSlice';

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [name, setName] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
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

    // Password validation function
    const validatePassword = (pwd) => {
        if (pwd.length < 6) {
            return "Password must be at least 6 characters long";
        }
        if (!/[A-Z]/.test(pwd)) {
            return "Password must contain at least one uppercase letter";
        }
        if (!/[a-z]/.test(pwd)) {
            return "Password must contain at least one lowercase letter";
        }
        if (!/[0-9]/.test(pwd)) {
            return "Password must contain at least one number";
        }
        if (!/[!@#$]/.test(pwd)) {
            return "Password must contain at least one symbol (!@#$)";
        }
        return "";
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        if (newPassword.length > 0) {
            setPasswordError(validatePassword(newPassword));
        } else {
            setPasswordError("");
        }
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        if (e.target.value !== password) {
            setConfirmPasswordError("Passwords do not match");
        } else {
            setConfirmPasswordError("");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate password before submitting
        const passwordValidationError = validatePassword(password);
        if (passwordValidationError) {
            setPasswordError(passwordValidationError);
            return;
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError("Passwords do not match");
            return;
        }

        setPasswordError("");
        setConfirmPasswordError("");
        dispatch(registerUser({ name, email, password }));
    }

    // Format error message for email already in use
    const getErrorMessage = () => {
        if (authError) {
            if (authError.toLowerCase().includes("user already exists") || authError.toLowerCase().includes("already exists")) {
                return "Email already in use";
            }
            return authError;
        }
        return null;
    }
    return (
        <div className='flex bg-gray-200'>
            <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12">
                <form onSubmit={handleSubmit} className='w-full max-w-md bg-white p-8 rounded-lg shadow-lg'>
                    <div className="flex justify-center mb-6">
                        <h2 className='text-xl font-medium'>EasyWear</h2>
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-6">Hey there! 👋</h2>
                    {getErrorMessage() && (
                        <p className="text-center mb-4 text-red-600">
                            {getErrorMessage()}
                        </p>
                    )}
                    <p className="text-center mb-4">
                        Enter your name, email and password to Sign up
                    </p>

                    <div className="mb4">
                        <label className='block text-sm font-semibold mb-2'>Name</label>
                        <input type="text"
                            value={name} onChange={(e) => setName(e.target.value)}
                            className='w-full p-2 border rounded'
                            placeholder='Enter your name' />
                    </div>
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
                            value={password} onChange={handlePasswordChange}
                            className={`w-full p-2 border rounded pr-10 ${passwordError ? 'border-red-500' : ''}`}
                            placeholder='Enter your password' />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 text-sm focus:outline-none"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                        {passwordError && (
                            <p className="text-red-600 text-sm mt-1">{passwordError}</p>
                        )}
                        {!passwordError && password.length > 0 && (
                            <p className="text-green-600 text-sm mt-1">Password is valid ✓</p>
                        )}
                    </div>

                    <div className="mb-4 relative">
                        <label className='block text-sm font-semibold mt-2'>Confirm Password</label>
                        <input type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword} onChange={handleConfirmPasswordChange}
                            className={`w-full p-2 border rounded pr-10 ${confirmPasswordError ? 'border-red-500' : ''}`}
                            placeholder='Confirm your password' />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 text-sm focus:outline-none"
                        >
                            {showConfirmPassword ? "Hide" : "Show"}
                        </button>
                        {confirmPasswordError && (
                            <p className="text-red-600 text-sm mt-1">{confirmPasswordError}</p>
                        )}
                        {!confirmPasswordError && confirmPassword.length > 0 && confirmPassword === password && (
                            <p className="text-green-600 text-sm mt-1">Passwords match ✓</p>
                        )}
                    </div>
                    <button
                        type='submit'
                        disabled={loading}
                        className="w-full bg-black text-white p-2 rounded-lg font-semibold hover:bg-gray-800 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? "Signing up..." : "Sign Up"}
                    </button>
                    <p className="mt-6 text-center text-sm">
                        Already have an account? {" "}
                        <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className='text-blue-500 underline'>Login</Link>
                    </p>
                </form>
            </div>
            <div className="hidden md:block w-1/2 bg-gray-800">
                <div className="h-full flex flex-col justify-center items-center">
                    <img src={register} alt="Login to Account" className='h-[750px] w-full object-cover' />
                </div>
            </div>

        </div>
    )
}

export default Register

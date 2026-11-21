import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { clearCart } from '../redux/slices/cartSlice';

const OrderConfirmationPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const checkoutId = searchParams.get('checkout_id');
    const sessionId = searchParams.get('session_id');

    const [order, setOrder] = useState(null);
    const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
    const [errorMessage, setErrorMessage] = useState('');

    // When the user lands here after paying via Stripe, confirm payment with
    // our backend (which in turn verifies with Stripe) and fetch the finalized order.
    useEffect(() => {
        if (!checkoutId || !sessionId) {
            navigate('/my-orders');
            return;
        }

        const verify = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/verify-stripe-session`,
                    {
                        params: { session_id: sessionId },
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('userToken')}`,
                        },
                    }
                );
                setOrder(response.data);
                setStatus('success');
                dispatch(clearCart());
                localStorage.removeItem('cart');
            } catch (error) {
                console.error(error);
                setErrorMessage(
                    error.response?.data?.message || 'We could not confirm your payment.'
                );
                setStatus('error');
            }
        };

        verify();
    }, [checkoutId, sessionId, dispatch, navigate]);

    const calculateEstimateDelivery = (createdAt) => {
        const orderDate = new Date(createdAt);
        orderDate.setDate(orderDate.getDate() + 10); // Add 10 days to the order date
        return orderDate.toLocaleDateString();
    }

    if (status === 'loading') {
        return (
            <div className='max-w-4xl mx-auto p-6 bg-white text-center'>
                <p className="text-gray-600">Confirming your payment...</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className='max-w-4xl mx-auto p-6 bg-white text-center'>
                <h1 className="text-2xl font-bold text-red-700 mb-4">Payment not confirmed</h1>
                <p className="text-gray-600 mb-6">{errorMessage}</p>
                <button
                    onClick={() => navigate('/my-orders')}
                    className="bg-black text-white px-6 py-2 rounded"
                >
                    View My Orders
                </button>
            </div>
        );
    }

    return (
        <div className='max-w-4xl mx-auto p-6 bg-white'>
            <h1 className="text-4xl font-bold text-center text-emerald-700 mb-8">
                Thank You for Your Order!
            </h1>

            {order && (
                <div className="p-6 rounded-lg border">
                    <div className="flex justify-between mb-20">
                        {/* Order Id and date */}
                        <div>
                            <h2 className="text-xl font-semibold ">Order ID: {order._id}</h2>
                            <p className='text-gray-500 '>Order Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>

                        {/* Estimated delivery */}
                        <div className="">
                            <p className="text-emerald-700 text-sm">
                                Estimated Delivery: {calculateEstimateDelivery(order.createdAt)}
                            </p>
                        </div>
                    </div>

                    {/* Ordered items */}
                    <div className="mb-20">
                        {order.orderItems.map((item) => (
                            <div key={item.productId} className="flex items-center mb-4">
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className='w-16 h-16 mr-4 object-cover rounded-md'
                                    />
                                ) : null}
                                <div className="">
                                    <h4 className="text-md font-semibold">{item.name}</h4>
                                    <p className="text-sm text-gray-500">
                                        {item.color} | {item.size}
                                    </p>
                                </div>
                                <div className="ml-auto text-right">
                                    <p className="text-md ">$ {item.price}</p>
                                    <p className="text-sm text-gray-500"> Qty: {item.quantity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Payment and Delivery info */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-lg font-semibold mb-2">Payment</h4>
                            <p className="text-gray-700">{order.paymentMethod} — Paid</p>
                        </div>

                        {/* Delivery info */}
                        <div>
                            <h4 className="text-lg font-semibold mb-2">Delivery</h4>
                            <p className="text-gray-600">{order.shippingAddress.address}</p>
                            <p className="text-gray-600">{order.shippingAddress.city}, {" "}
                                {order.shippingAddress.country}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OrderConfirmationPage

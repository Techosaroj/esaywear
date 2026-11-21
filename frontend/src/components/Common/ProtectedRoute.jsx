import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({children, role}) => {
    const {user} = useSelector((state) => state.auth);

    // If not logged in OR role doesn't match, send to login
    if(!user || (role && user.role !== role )){
        return <Navigate to="/login" replace />
    }

    return children;
}

export default ProtectedRoute

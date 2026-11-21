import React from 'react'
import NavBar from "../Common/NavBar"
import Footer from "../Common/Footer"
import { Outlet } from 'react-router-dom'

const UserLayout = () => {
  return (
    <>
    <NavBar />
    <main className="pt-20">
      <Outlet />
    </main>

    
    <Footer />
    </>
  )
}

export default UserLayout

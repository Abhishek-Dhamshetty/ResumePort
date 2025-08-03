// filepath: /Users/abhishekdhamshetty/Desktop/ResumePort/frontend/src/components/common/RootLayout.jsx
import React from 'react'
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom"
import { AuthProvider } from "../../contexts/AuthContext";

function RootLayout() {
  return (
    <AuthProvider>
      <div className=''>
        <Header/>
        <div className='' style={{minHeight:"90vh"}}>
          <Outlet />
        </div>
        <Footer/>
      </div>
    </AuthProvider>
  )
}

export default RootLayout
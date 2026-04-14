import React from 'react'
import SignUp from '../../components/Modals/SignUp'

export default function Signup() {
    return (
        <div className="bg-gradient-to-b from-gray-600 to-black h-screen relative ">
            <div className="w-3/5 h-screen bg-gradient-to-b from-brand-orange ">           
             <SignUp />
            </div>
        </div>
    )
}
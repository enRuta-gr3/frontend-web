import React, { useEffect } from 'react';
import { Navbar,Hero,HowItWork, CTA, Footer } from '@/components';
import { useNavigate } from "react-router-dom"
import useAuthStore from "@/store/useAuthStore"

export default function HomePage() {

  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.tipo_usuario === "ADMINISTRADOR" || user?.tipo_usuario === "VENDEDOR") {
      logout()
      navigate("/", { replace: true })
    }
  }, [user])



  return (
    <div className="  bg-slate-950 text-white overflow-x-hidden">
        <Navbar />
        <main>
            <Hero />
            <HowItWork />
            <CTA />    
        </main>
        <Footer />
    </div>
  );
}
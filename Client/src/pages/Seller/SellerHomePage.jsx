import {SellerLayout}  from '@/components/Seller';
import useThemeStore from '@/store/useThemeStore';



export default function SellerHomePage(){
    const isDarkMode = useThemeStore(state => state.isDarkMode);

    return (
        <SellerLayout>
            <div className='mb-6 text-center'>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    Bienvenido a la página de inicio del vendedor
                </h1>
            </div>
        </SellerLayout>
    )
}
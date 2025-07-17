import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logout as logoutService } from '@/services/authService';


/**
 *  Store de Zustand para manejar el estado de autenticacion.
 *  Persiste los datos en el localstorage usando zustand/middleware.
 *  
 *  @typedef {Object} AuthStore
 *  @property {Object} user: Objeto con los datos del usuario
 *  @property {string} token: Token de autenticacion
 *  @property {string} role: Rol del usuario
 *  @property {boolean} isAuthenticated: Flag que indica si el usuario esta autenticado
 *  @property {function} login: Funcion que se encarga de logear al usuario
 *  @property {function} logout: Funcion que se encarga de deslogear al usuario
 *  @property {function} hasRole: Funcion que se encarga de verificar si el usuario tiene un rol especifico
 *
 *  @type {import('zustand').UseBoundStore<AuthStore>}
 */
const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,   // user {...}
            token: null,
            role: null,
            isAuthenticated: false,

            login: (user, token, role) => {
                set({ user, token, role, isAuthenticated: true });
            },
            logout: async () => {
                const state = get();
                
                try{
                    
                    if(state.user?.uuidAuth && state.token){
                        await logoutService(state.user.uuidAuth, state.token);
                    }
                }catch(error){
                    console.error("❌ Error al cerrar sesion: ",error);
                }finally{
                    set({user: null, token: null, role: null, isAuthenticated: false})
                }
             return true
            },
            hasRole: (requiredRole) => {
                /**
                 *  @param {string} requiredRole: Rol requerido
                 *  @property {string} currentRole: Rol actual
                 *  @returns {boolean}  : Devuelve true si el usuario tiene el rol requerido.
                 *  @example: hasRole("ADMIN") => true
                 *  @example: hasRole("VENDEDOR") => false
                 */
                const currentRole = get().role;
                return currentRole === requiredRole;
            },

        }),
        {
            name: 'auth-storage', // importante para el uso de localstorage
            getStorage: () => localStorage, // => cambiar a sessionStorage
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                role: state.role,
                isAuthenticated: state.isAuthenticated,
            }),
            getAuthState: () => get(),
        }
    )
);
export default useAuthStore;
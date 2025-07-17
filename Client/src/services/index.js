
// los servicios que esten en espaniol hay que  colocarlos en ingles
export { register, login,logout, recoverPassword, cambiarContraseña, confirmarRecuperacion, modificarPerfil } from './authService';
export {  adminSellerLogin, adminSellerLogout, internalRecoverPassword } from './internalAuthService';


// listar buses, crear nuevo bus, alta masiva bus, cambiar estado bus
export { getBuses, getAvailableBuses, createNewBus, massiveBusUpload, changeStatusBus } from './busService';

// listar localidades, crear nueva localidad, alta masiva localidad
export { getLocalities, createNewLocality, massiveLocalities} from './localityService';

// listar viajes, crear viaje y asignar bus, calcular venta, listar viajes por bus, listar omnibus disponibles, reasignar viaje
export { getTravels, createTravelAndAssignBus, calculateSale,getTripsByBus,availableBusForTrip,reasignTrip } from './travelService';

// obtener departamentos
export { getDepartments } from './departmentService';


// listar asientos, cambiar estado asientos
export { listSeats, changeSeatsState} from './seatServices'


// solicitar parametros mercado pago, solicitar metodos de pago, solicitar param de pago
export { requestMercadoPagoParams,requestPaymentMethods,requestPaymentParams } from './paymentService'


// solicitar monto, confirmar venta , confirmar venta paypal
export {requestAmount, confirmSale, confirmSalePayPal} from './saleService'


// obtener usuario por cedula, obtenet todos los usuarios, eliminar usuario por admin, registrar usuario interno
export { getUserByIDcard, getAllUser, deleteUserByAdmin, registerInternalUser, validateUserBySeller } from './userService';

// listar viajes , crear viajes
export { getViajes, createNewViaje } from './viajesService'

// historial de pasajes , ticket por viajes , tickets por venta
export {getUserTicketHistory,getTicketsByTrip,getTicketsBySale} from './ticketService'


// carga de archivo
export {uploadCSVFile} from './uploadCsvFileService'

// estadisticas
export { getTripsByMonth, getReturnedTicketsByMonth, getSoldTicketsByMonth, getBusStatusByMonth, getTripsByLocation, getNumberOfUsers, getActivityOfUsers, getAverageUserExpenditure } from './statsService'

// notificaciones
export { getNotifications, markNotificationAsRead } from './notificationService'


// devoluciones

export { returnTicket } from './returnService'
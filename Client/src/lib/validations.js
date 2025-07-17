

/**
 * Este archivo contiene funciones de validación reutilizables para formularios de la aplicación EnRuta.
 * Incluye validaciones para cédula uruguaya, correo electrónico, contraseñas, fechas y lógica de formularios de registro y login.
 * Cada función está documentada para facilitar su comprensión y mantenimiento.
 */

/**
 * Valida que la cédula de identidad uruguaya sea válida según el algoritmo oficial.
 * Acepta cédulas de 6, 7 u 8 dígitos (rellenando con ceros a la izquierda si es necesario).
 * @param {string} idCard - Cédula de identidad sin guiones ni puntos y con dígito verificador.
 * @returns {boolean} true si la cédula es válida, false si no lo es.
 * @example isValidUyId("11111111") => true
 * @example isValidUyId("11111112") => false
 */
export const isValidUyId = (idCard) => {
    // Completa con ceros a la izquierda si tiene menos de 8 dígitos
    const padded = idCard.padStart(8, "0");
    if(!/^\d{8}$/.test(padded)) return false;

    const weights = [2, 9, 8, 7, 6, 3, 4];
    const digits = padded.split('').map(Number);

    // Extrae el dígito verificador
    const checkDigit = digits.pop();

    // Calcula el dígito verificador esperado
    const sum = digits.reduce((acc, digit, index) => acc + digit * weights[index], 0);
    const remainder = sum % 10;
    const calculatedCheckDigit = remainder === 0 ? 0 : 10 - remainder;

    return calculatedCheckDigit === checkDigit;
}

/**
 * Valida el formato de un correo electrónico usando una expresión regular simple.
 * @param {string} email - Correo electrónico a validar.
 * @returns {boolean} true si el correo es válido, false si no lo es.
 * @example isValidEmail("test@gmail.com") => true
 * @example isValidEmail("test@") => false
 */
export const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
}

/**
 * Valida que la contraseña tenga al menos 6 caracteres.
 * @param {string} password - Contraseña a validar.
 * @returns {boolean} true si la contraseña es válida, false si no lo es.
 * @example checkPassowrdLength("123456") => true
 * @example checkPassowrdLength("12345") => false
 */
export const checkPassowrdLength = (password) => {
    return password.length >= 6;
}

/**
 * Verifica que la contraseña y su confirmación sean iguales.
 * @param {string} password - Contraseña.
 * @param {string} confirmPassword - Confirmación de la contraseña.
 * @returns {boolean} true si ambas coinciden, false si no.
 * @example checkPasswordMatch("123456", "123456") => true
 * @example checkPasswordMatch("123456", "654321") => false
 */
export const checkPasswordMatch = (password, confirmPassword) => {
    return password === confirmPassword;
}

/**
 * Valida los datos personales del formulario de registro (primer paso).
 * @param {Object} formData - Objeto con los datos personales: nombres, apellidos, email, ci, fecha_nacimiento.
 * @returns {Object} newErrors - Objeto con los errores encontrados, vacío si no hay errores.
 * @example validateStep1({ nombres: "Juan", apellidos: "Perez", email: "test@gmail.com", ci: "11111111", fecha_nacimiento: "1990-01-01" })
 */
export const validateStep1 = (formData) => {
    const newErrors = {}

    if (!formData.nombres.trim()) {
      newErrors.nombres = "El nombre es requerido"
    }
    if(!formData.apellidos.trim()) {
      newErrors.apellidos = "El apellido es requerido"
    }

    if (!formData.email) {
      newErrors.email = "El correo electrónico es requerido"
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Correo electrónico inválido"
    }

    if(!formData.ci){
      newErrors.ci = "La cédula de identidad es requerida"
    }else if(!isValidUyId(formData.ci)){
      newErrors.ci = "Cédula de identidad inválida"
    }
    // Validamos que sea mayor de edad
    if(!isAdult(formData.fecha_nacimiento)){
      newErrors.fecha_nacimiento = "Debes ser mayor de edad"
    }

    return newErrors;
}

/**
 * Valida los datos del formulario de contraseñas (segundo paso).
 * @param {Object} formData - Objeto con las contraseñas: contraseña, confirmarContraseña.
 * @returns {Object} newErrors - Objeto con los errores encontrados, vacío si no hay errores.
 * @example validateStep2({ contraseña: "123456", confirmarContraseña: "123456" })
 */
export const validateStep2 = (formData) => {
    const newErrors = {}

    if (!formData.contraseña) {
      newErrors.contraseña = "La contraseña es requerida"
    } else if (!checkPassowrdLength(formData.contraseña)) {
      newErrors.contraseña = "La contraseña debe tener al menos 6 caracteres"
    }

    if (!formData.confirmarContraseña) {
      newErrors.confirmarContraseña = "Confirma tu contraseña"
    } else if (!checkPasswordMatch(formData.contraseña, formData.confirmarContraseña)) {
      newErrors.confirmarContraseña = "Las contraseñas no coinciden"
    }

    return newErrors;
}

/**
 * Valida que los datos de autenticación sean correctos.
 * @param {Object} data - Diccionario con los datos de autenticación del usuario.
 * @returns {boolean} true si los datos son correctos, false si no lo son.
 * @example isValidAuthData({ user: "usuario", access_token: "token" }) => true
 */
export const isValidAuthData = (data) => {
   return data && typeof data === 'object' && data.user && data.access_token;
}

/**
 * Valida los datos del formulario de login.
 * Permite ingresar un correo electrónico o una cédula de identidad.
 * Si el valor no cumple con ninguno de los dos formatos, muestra un mensaje específico.
 * @param {Object} formData - Diccionario con los datos del formulario.
 * @param {Function} setErrors - Función para setear los errores del formulario.
 * @returns {boolean} true si los datos son correctos, false si no lo son.
 */
export const validateLoginForm = (formData, setErrors) => {
  const newErrors = {}

  const value = formData.email

  if (!value) {
    newErrors.email = "El correo electrónico o la cédula de identidad es requerido"
  } else if (value.includes("@")) {
    // Es un correo electrónico
    if (!isValidEmail(value)) {
      newErrors.email = "Correo electrónico inválido"
    }
  } else if(/^\d+$/.test(value)){
    // Solo son números, se asume cédula
    if (!isValidUyId(value)) {
      newErrors.email = "Cédula de identidad inválida"
    }
  } else{
    // No es ni correo ni cédula
    newErrors.email = "Debes ingresar un correo electrónico válido o una cédula de identidad válida"
  }

  // Validamos que la contraseña cumpla con los requisitos mínimos.
  if (!formData.contraseña) {
    newErrors.password = "La contraseña es requerida"
  } else if (!checkPassowrdLength(formData.contraseña)) {
    newErrors.password = "La contraseña debe tener al menos 6 caracteres"
  }

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}


/**
 * Valida los datos del formulario de Login para cuentas internas de la empresa.
 * Los mensajes de error son genéricos para no revelar información sensible.
 * @param {Object} formData - Diccionario con los datos del formulario.
 * @param {Function} setErrors - Función para setear los errores del formulario.
 * @returns {boolean} true si los datos son correctos, false si no lo son.
 */
export const validateInternalLoginForm = (formData, setErrors) => {
  const newErrors = {}

  // Validación de email (genérica)
  if (!formData.email) {
    newErrors.email = "Credenciales inválidas"
  } else if (!isValidEmail(formData.email) || (!formData.email.includes("@enruta") &&  !formData.email.includes("@enRuta") )) {
    newErrors.email = "Credenciales inválidas"
  }

  // Validación de contraseña (genérica)
  if (!formData.contraseña) {
    newErrors.contraseña = "Credenciales inválidas"
  } else if (!checkPassowrdLength(formData.contraseña)) {
    newErrors.contraseña = "Credenciales inválidas"
  }

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}




/**
 * Valida que la persona sea mayor de edad (18 años o más).
 * @param {string} birthDate - Fecha de nacimiento en formato YYYY-MM-DD.
 * @returns {boolean} true si la persona es mayor de edad, false si no lo es.
 * @example isAdult("1990-01-01") => true
 */
export const isAdult = (birthDate) => {
  if (!birthDate) return false;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age >= 18;
}

/**
 * Valida que la fecha de partida sea anterior a la fecha de regreso.
 * @param {string} departureDate - Fecha de partida.
 * @param {string} returnDate - Fecha de regreso.
 * @returns {boolean} true si la fecha de partida es antes de la de regreso, false si no lo es.
 */
export const isDepartureBeforeReturn = (departureDate, returnDate) => {
  if(!departureDate || !returnDate) return false;
  const departure_ = new Date(departureDate);
  const returnDate_ = new Date(returnDate);
  return departure_ < returnDate_;
}

/**
 * Valida que la fecha de partida no sea anterior a la fecha actual.
 * @param {string} departureDate - Fecha de partida.
 * @returns {boolean} true si la fecha de partida es hoy o en el futuro, false si es en el pasado.
 */
export const isDepartureNotInPast = (departureDate) => {
  if(!departureDate) return false;
  const today = new Date();
  const departure_ = new Date(departureDate);
  return departure_ >= today;
}



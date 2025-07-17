// este fichero contiene funciones para manejar la búsqueda y los filtros 



export const normalizeText = (query) => {
    // Retornar vacío si es null o undefined
    if (query == null) return "";
    // Convertir todo a string
    const str = String(query);
    // Descomponer diacríticos y eliminar acentos
    const decomposed = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    // Pasar a minúsculas
    const lower = decomposed.toLowerCase();
    // Permitir letras, números, espacios, '/', ':' y eliminar resto
    return lower.replace(/[^a-z0-9\s\/:]/g, "").trim();
}

// obtenemos los valores anidados de un objeto
// por ejemplo: si el objeto es { departamento: { id: 111, nombreDepartamento:Colonia } }
const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current,key) => {
        return current && current[key] !== undefined ? current[key]: null;
    },obj)
}
export const searchAndFilter = (
    data= [],
    searchQuery = "",
    searchFields = [],
    options = {} // -> quitamos dentro de las options caseSensitive, exactMatch, searchByWords
) => {
    const { caseSensitive = false, exactMatch = false, searchByWords = false } = options; // ultimo cambio
    // si no hay datos en la consulta, retornamos todos los datos
    if(!searchQuery.trim()) return data; 
    // si no es un array valido, retornamos un array vacio
    if(!Array.isArray(data)) return [];

    const searchNormalized = caseSensitive? searchQuery.trim() : normalizeText(searchQuery);

    return data.filter((item)=> {
        const searchValues = searchFields.map((field)=>{
            let values;

            if(typeof field === "function"){ // Si es una funcion, la ejecutamos con el item
                values = field(item);
            }else if(typeof field === "string"){
                values = getNestedValue(item, field); // si el campo es un string ejemplo departamento.nombre
            }
            return caseSensitive ? String(values) : normalizeText(values);
        })
        const combinedText = searchValues.join(" ");
        if(options.exactMatch){
            return combinedText === searchNormalized;
        }else if(options.searchByWords){
            // busqueda por palabras separadas
            const searchWords = searchNormalized.split(/\s+/).filter((word)=> word.length > 0);
            return searchWords.every((word)=> combinedText.includes(word));
        }else{
            // busqueda por coincidencia parcial
            return combinedText.includes(searchNormalized);
        }
    })

}

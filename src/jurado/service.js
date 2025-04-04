import { JuradoRepository } from "./repositories.js";

export class JuradoService {

    static async getJurado (id_tesis){
        try{
            console.log('obteniendo jurado... ');
            const jurado = await JuradoRepository.getJurado(id_tesis);
            console.log('jurado obtenido', jurado);
            return {status: 'success', data:jurado};
        }catch(error){
            console.error('error al obtener el jurado de esta tesis', error.message);
            throw new Error ('No se pudo obtener el jurado');
        }
    }


    static async create( data ){
        try {
            console.log('Creando un nuevo jurado con los datos:', data);
            if (!data.id_tesis || !data.id_profesor) {
                throw new Error("Todos los campos son obligatorios");
            }
            if (
                typeof data.id_tesis !== 'number' || 
                typeof data.id_profesor !== 'number'
            ) {
                throw new Error("codigo debe ser numero, campo y nombre cadenas.");
            }
            const resultado = await JuradoRepository.create(data);
            console.log('jurado creado exitosamente:', resultado);
            return { status: 'success', message: 'jurado creado correctamente', data: resultado };
        } catch (error) {
            console.error('Error al crear el jurado:', error.message);
            throw new Error('No se pudo crear el jurado: ' + error.message);
        }
    }

    static async delete (data){
        try {
            console.log('Eliminando un jurado con los datos:', data);
            if (!data.id_tesis || !data.id_profesor) {
                throw new Error("Todos los campos son obligatorios");
            }
            if (
                typeof data.id_tesis !== 'number' || 
                typeof data.id_profesor !== 'number'
            ) {
                throw new Error("codigo debe ser numero, campo y nombre cadenas.");
            }
            console.log("Sentencia SQL a ejecutar:", data.id_tesis, data.id_profesor);
            const resultado = await JuradoRepository.delete(data.id_tesis,data.id_profesor);
            console.log('jurado eliminado exitosamente:', resultado);
            return { status: 'success', message: 'jurado eliminado correctamente', data: resultado };
        } catch (error) {
            console.error('Error al eliminar el jurado:', error.message);
            throw new Error('No se pudo eliminar el jurado: ' + error.message);
        }
    }

}
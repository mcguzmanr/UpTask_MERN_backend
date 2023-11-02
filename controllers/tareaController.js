import mongoose from "mongoose";
import Tarea from "../models/Tarea.js";
import Proyecto from "../models/Proyecto.js";

const agregarTarea = async (req, res) => {
    delete req.body.id
    
    const { proyecto } = req.body;

    const existeProyecto = await Proyecto.findById(proyecto).exec();

    const valid = mongoose.Types.ObjectId.isValid(proyecto)
    if(!valid){
        const error = new Error('El proyecto no existe')
        return res.status(404).json({msg: error.message})
    }

    if(existeProyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('No tienes los permisos para añadir tareas');
        return res.status(403).json({msg: error.message})
    }

    try {
        const tareaAlmacenada = await Tarea.create(req.body);
        // Almacenar el ID en el proyecto
        existeProyecto.tareas.push(tareaAlmacenada._id);
        await existeProyecto.save();
        res.json(tareaAlmacenada);
    } catch (error) {
        console.log(error)
    }
};

const obtenerTarea = async (req, res) => {
    const { id } = req.params;
    
    const valid = mongoose.Types.ObjectId.isValid(id)
    if(!valid){
        const error = new Error('La tarea que ingresaste no es válida')
        return res.status(404).json({msg: error.message})
    }

    const tarea = await Tarea.findById(id).populate("proyecto").exec();

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('No tienes permisos para añadir tareas');
        return res.status(403).json({msg: error.message});
    };

    res.json(tarea);
};

const actualizarTarea = async (req, res) => {
    const { id } = req.params;
    
    const valid = mongoose.Types.ObjectId.isValid(id)
    if(!valid){
        const error = new Error('La tarea que ingresaste no es válida')
        return res.status(404).json({msg: error.message})
    }

    const tarea = await Tarea.findById(id).populate("proyecto").exec();

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('No tienes permisos para añadir tareas');
        return res.status(403).json({msg: error.message});
    };

    tarea.nombre =  req.body.nombre || tarea.nombre;
    tarea.descripcion =  req.body.descripcion || tarea.descripcion;
    tarea.prioridad =  req.body.prioridad || tarea.prioridad;
    tarea.fechaEntrega =  req.body.fechaEntrega || tarea.fechaEntrega;

    try {
       const tareaAlmacenada = await tarea.save();
       res.json(tareaAlmacenada);
    } catch (error) {
        console.log(console.log(error));
    }
};

const eliminarTarea = async (req, res) => {
    const { id } = req.params;
    
    const valid = mongoose.Types.ObjectId.isValid(id)
    if(!valid){
        const error = new Error('La tarea que ingresaste no es válida')
        return res.status(404).json({msg: error.message})
    }

    const tarea = await Tarea.findById(id).populate("proyecto").exec();

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('No tienes permisos para eliminar tareas');
        return res.status(403).json({msg: error.message});
    };

    try {

        const proyecto = await Proyecto.findById(tarea.proyecto)
        proyecto.tareas.pull(tarea._id)

        await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()])

        res.json({msg: "Tarea Eliminada"});
     } catch (error) {
         console.log(error);
    }
};

const cambiarEstado = async (req, res) => {
    const { id } = req.params;
    
    const valid = mongoose.Types.ObjectId.isValid(id)
    if(!valid){
        const error = new Error('La tarea que ingresaste no es válida')
        return res.status(404).json({msg: error.message})
    }

    const tarea = await Tarea.findById(id).populate("proyecto").populate('completado');

    

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString() &&
        !tarea.proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())
        ) {
            const error = new Error('No tienes permisos para añadir tareas');
            return res.status(403).json({msg: error.message});
    };

    tarea.estado = !tarea.estado;
    tarea.completado = req.usuario._id
    await tarea.save()

    const tareaAlmacenada = await Tarea.findById(id).populate("proyecto").populate('completado');

    res.json(tareaAlmacenada)
};


export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado
};
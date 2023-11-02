import mongoose from "mongoose";
import Proyecto from "../models/Proyecto.js";
import Usuario from "../models/Usuario.js";


const obtenerProyectos = async (req, res) => {
    const proyectos = await Proyecto.find({
        $or: [
            {colaboradores: {$in: req.usuario}},
            {creador: {$in: req.usuario}},
       ]
    }).select('-tareas');
    res.json(proyectos);
};

const nuevoProyecto = async (req, res) => {
    const proyecto = new Proyecto(req.body)
    proyecto.creador =  req.usuario._id

    try {
        const proyectoAlmacenado = await proyecto.save()
        res.json(proyectoAlmacenado);
    } catch (error) {
        console.log(error)
    }
};

const obtenerProyecto = async (req, res) => {
    const {id}  = req.params;
    try {
        const proyecto = await Proyecto.findById(id).populate({ path: 'tareas', populate: {path: 'completado', select: 'nombre'}}).populate('colaboradores', 'nombre email'); 
        if(proyecto.creador.toString() !== req.usuario._id.toString() &&
            !proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())){
            return res.status(401).json({msg: 'No tienes permisos'});
        }; 
        res.json(proyecto);
    } catch (error) {
        return res.status(404).json({msg: 'El id de Proyecto que ingresaste no es válido'}); 
    };
};

const editarProyecto = async (req, res) => {
    const {id}  = req.params;
    const valid = mongoose.Types.ObjectId.isValid(id)
    if(!valid){
        const error = new Error('El id que ingresaste no es valido')
        return res.status(404).json({msg: error.message})
    }

    const proyecto = await Proyecto.findById(id).exec();
    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('No tienes permisos')
        return res.status(401).json({msg: error.message});
    };

    proyecto.nombre = req.body.nombre || proyecto.nombre;
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
    proyecto.cliente = req.body.cliente || proyecto.cliente;

    try {
        const proyectoAlmacenado = await proyecto.save();
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
    }
};

const eliminarProyecto = async (req, res) => {
    const {id}  = req.params;
    const valid = mongoose.Types.ObjectId.isValid(id)
    if(!valid){
        const error = new Error('El id que ingresaste no es valido')
        return res.status(404).json({msg: error.message})
    }

    const proyecto = await Proyecto.findById(id).exec();
    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('No tienes permisos')
        return res.status(401).json({msg: error.message});
    };

    try {
       await proyecto.deleteOne(); 
       res.json({msg: "Proyecto Eliminado"});
    } catch (error) {
        console.log(error);
    }
};

const buscarColaborador = async (req, res) => {
    const {email} = req.body
    const usuario = await Usuario.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v')

    if(!usuario) {
        const error = new Error('Usuario no encontrado');
        return res.status(404).json({msg: error.message});
    }

    res.json(usuario);
};

const agregarColaborador = async (req, res) => {
    const id  = req.params.id;
    const valid = mongoose.Types.ObjectId.isValid(id)
    if(!valid){
        const error = new Error('Proyecto no encontrado')
        return res.status(404).json({msg: error.message})
    }
    const proyecto = await Proyecto.findById(id);
    if(proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('No tienes los derechos para agregar colaboradores')
        return res.status(404).json({msg: error.message})
    }

    const {email} = req.body
    const usuario = await Usuario.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v')

    if(!usuario) {
        const error = new Error('Usuario no encontrado');
        return res.status(404).json({msg: error.message});
    }

    // Verificar si el colaborador no es el admin del proyecto
    if(proyecto.creador.toString() === usuario._id.toString()) {
        const error = new Error("El creador del proyecto no puede ser agregado como colaborador");
        return res.status(404).json({ msg: error.message })
    }

    // Revisar que no este ya agragado al proyecto
    if(proyecto.colaboradores.includes(usuario._id)) {
        const error = new Error("El usuario ya pertenece al Proyecto");
        return res.status(404).json({ msg: error.message })
    }

    // Luego de todas las verificaciones se puede agregar al proyecto
    proyecto.colaboradores.push(usuario._id);
    await proyecto.save();
    res.json({ msg: "Colaborador agregado correctamente "});



};

const eliminarColaborador = async (req, res) => {
    const id  = req.params.id;
    const valid = mongoose.Types.ObjectId.isValid(id)
    if(!valid){
        const error = new Error('Proyecto no encontrado')
        return res.status(404).json({msg: error.message})
    }
    const proyecto = await Proyecto.findById(id);
    if(proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('No tienes los derechos para agregar colaboradores')
        return res.status(404).json({msg: error.message})
    }

    // Luego de todas las verificaciones se puede elimnar del proyecto
    proyecto.colaboradores.pull(req.body.id);
    await proyecto.save();
    res.json({ msg: "Colaborador ha sido eliminado correctamente"});


};

export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    buscarColaborador,
    agregarColaborador,
    eliminarColaborador,
};


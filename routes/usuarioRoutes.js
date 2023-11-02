import express from "express";
const router = express.Router();

import { 
    registrar, 
    autenticar, 
    confirmar, 
    olvidePassword, 
    comprobarToken, 
    nuevoPassword, 
    perfil,
} from "../controllers/usuarioController.js";

import checkAuth from "../middleware/checkAuth.js";

// Auth, Register and confirmation of users
router.post('/', registrar); // Create a new user
router.post("/login", autenticar);
router.get("/confirmar/:token", confirmar);
router.post('/olvide-password', olvidePassword);
router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword);

router.get('/perfil', checkAuth, perfil);

export default router;
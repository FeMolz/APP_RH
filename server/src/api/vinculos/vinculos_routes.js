import express from 'express';
export const vinculosRoutes = express.Router();
import * as vinculosController from './vinculos_controller.js';

vinculosRoutes.get('/:cargoId', vinculosController.getCargoVinculos);
vinculosRoutes.post('/:cargoId', vinculosController.updateVinculos);

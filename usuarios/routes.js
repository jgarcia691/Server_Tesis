import express from 'express';
import { getusuariocontroller,postusuariocontroller,putusuariocontroller,deleteusuariocontroller } from './controllers.js';

const router = express.Router();

router.get('/',getusuariocontroller );
router.post('/',postusuariocontroller );
router.put('/',putusuariocontroller);
router.delete('/',deleteusuariocontroller);

export default router;

import express from "express";
import homeController from "../controllers/homeController";
import userContrller from "../controllers/userController";

let router = express.Router();

let initWebRoutes = (app) => {
    router.get("/", homeController.getHomePage);
    router.get('/about', homeController.getAboutPage);
    router.get('/crud', homeController.getCRUD);
    router.post('/post-crud', homeController.postCRUD);
    router.get('/get-crud', homeController.dislayGetCRUD);
    router.get('/edit-crud', homeController.getEditCRUD);
    router.post('/put-crud', homeController.putCRUD);
    router.get('/delete-crud', homeController.deleteCRUD);
    

    router.post('/api/login', userContrller.handleLogin);
    router.get('/api/get-all-users', userContrller.handleGetAllUsers);
    router.post('/api/create-new-user', userContrller.handleCreateNewUser);
    router.put('/api/edit-user', userContrller.handleEditUser);
    router.delete('/api/delete-user', userContrller.handleDeleteUser);

    return app.use("/", router);
}
module.exports = initWebRoutes;
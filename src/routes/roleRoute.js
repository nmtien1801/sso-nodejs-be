import express from "express";
import roleController from "../controller/roleController";
import { checkUserJwt, checkUserPermission } from "../middleware/jwtAction";

const router = express.Router(); // bằng app = express();
/**
 *
 * @param {*} app : express app
 * @returns
 */

const initRoleRoutes = (app) => {
  // middleware
  router.all("*", checkUserJwt, checkUserPermission);

  // roles router
  router.get("/path/read", roleController.read);
  router.post("/path/create", roleController.create);
  router.delete("/path/delete/:pathId", roleController.remove);
  router.get("/path/by-role/:roleId", roleController.getPathByRoleId); // param thì không đọc được '?'
  router.post("/path/authenticateRole", roleController.authenticateRole);

  // group router
  router.get("/role/read", roleController.getAllRole);

  return app.use("/api", router);
};

export default initRoleRoutes;

import db from "../sequelize/models/index";
import _ from "lodash";

const createNewPath = async (path) => {
  try {
    // search: how to get difference between two arrays of objects javascript
    let currentPath = await db.Path.findAll({
      attributes: ["url", "description"],
      raw: true,
    });

    const persist = path.filter(
      ({ url: url1 }) => !currentPath.some(({ url: url2 }) => url1 === url2)
    );

    // console.log(">>>>check currentPath: ", currentPath);
    // console.log(">>>>check dif: ", persist);
    if (persist.length === 0) {
      return {
        EM: "notthing to create path...", //error message
        EC: 1, //error code
        DT: [], // data
      };
    }
    await db.Path.bulkCreate(persist);
    return {
      EM: `create path success: ${persist.length} path`, //error message
      EC: 0, //error code
      DT: [], // data
    };
  } catch (error) {
    console.log(">>>check err createNewPath: ", error);
    return {
      EM: "some thing wrongs with service", //error message
      EC: 2, //error code
      DT: [], // data
    };
  }
};

const getAllPath = async () => {
  try {
    let data = await db.Path.findAll({
      attributes: ["id", "url", "description"],
      order: [["id", "ASC"]],
    });
    return {
      EM: `get all path success`, //error message
      EC: 0, //error code
      DT: data, // data
    };
  } catch (error) {
    console.log(">>>check err getAllPath: ", error);
    return {
      EM: "some thing wrongs with service", //error message
      EC: 2, //error code
      DT: [], // data
    };
  }
};

const deletePath = async (id) => {
  try {
    let path = await db.Path.findOne({
      where: { id: id },
    });
    if (path) {
      await path.destroy();
      return {
        EM: "delete path success",
        EC: 0,
        DT: [], // data
      };
    } else {
      return {
        EM: "path not exists",
        EC: 1,
        DT: [], // data
      };
    }
  } catch (error) {
    console.log(">>>check err deletePath: ", error);
    return {
      EM: "some thing wrongs with service", //error message
      EC: 2, //error code
      DT: [], // data
    };
  }
};

const getPathByRoleId = async (id) => {
  try {
    let path = await db.Role.findOne({
      where: { id: id },
      include: [
        {
          model: db.Path,
          attributes: ["id", "url", "description"],
          through: { attributes: [] }, // không lấy bảng đính kèm ngoài attribute
        },
      ],
    });
    if (path) {
      return {
        EM: "get path by group success",
        EC: 0,
        DT: path, // data
      };
    } else {
      return {
        EM: "not found any path",
        EC: 1,
        DT: [], // data
      };
    }
  } catch (error) {
    console.log(">>>check err getPathByRoleId service: ", error);
    return {
      EM: "some thing wrongs with service", //error message
      EC: 2, //error code
      DT: [], // data
    };
  }
};

const authenticateRole = async (data) => {
  try {
    await db.Role_Path.destroy({
      where: { roleID: +data.roleID},
    });

    await db.Role_Path.bulkCreate(data.role_path);

    return {
      EM: `assign path group success`, //error message
      EC: 0, //error code
      DT: [], // data
    };
  } catch (error) {
    console.log(">>>check err authenticateRole: ", error);
    return {
      EM: "some thing wrongs with service", //error message
      EC: 2, //error code
      DT: [], // data
    };
  }
};

const getAllRole = async () => {
  try {
    let data = await db.Role.findAll({
      order: [["name", "ASC"]],
    });
    return {
      EM: "get data group success", //error message
      EC: 0, //error code
      DT: data, // data
    };
  } catch (error) {
    return {
      EM: "some thing wrongs with service", //error message
      EC: 2, //error code
      DT: [], // data
    };
  }
};
module.exports = {
  createNewPath,
  getAllPath,
  deletePath,
  getPathByRoleId,
  authenticateRole,
  getAllRole,
};

import db from "../sequelize/models/index";
import bcrypt from "bcryptjs";
import { raw } from "body-parser";
import { Op } from "sequelize";
import { createJwt } from "../middleware/jwtAction";
import { reject, resolve } from "bluebird";
import { v4 as uuidv4 } from "uuid";
require("dotenv").config();
// SEARCH: sequelize

const checkEmailExists = (userEmail) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { email: userEmail },
      });
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};

const checkPhoneExists = async (userPhone) => {
  let phone = await db.User.findOne({
    where: { phone: userPhone },
  });
  if (phone) {
    return true;
  }
  return false;
};

// hash password
const salt = bcrypt.genSaltSync(10);
const hashPassWord = (userPassWord) => {
  return bcrypt.hashSync(userPassWord, salt);
};

const registerNewUser = async (rawUserData) => {
  try {
    let formData = rawUserData;

    // check email exists
    let isEmailExists = await checkEmailExists(formData.email);
    if (isEmailExists === true) {
      return {
        EM: "the email is already exists",
        EC: 1,
        DT: "email",
      };
    }

    // hash user password
    let CheckHashPass = hashPassWord(formData.password);
    //create new user
    await db.User.create({
      email: formData.email,
      phone: formData.phone,
      userName: formData.userName,
      passWord: CheckHashPass,
      address: formData.address,
      sex: formData.sex,
      roleID: 2, // guess: 2 , admin: 1
    });

    // không bị lỗi
    return {
      EM: "A user is create successfully",
      EC: 0,
    };
  } catch (error) {
    console.log("check Err create new user Register: ", error);
    return {
      EM: "something wrong in service ...",
      EC: -2,
    };
  }
};

const checkPassword = (userPassWord, hashPassWord) => {
  return bcrypt.compareSync(userPassWord, hashPassWord); // true or false
};

// phân quyền: authenticate
const getPathOfRole = async (user) => {
  // scope: phạm vi
  let path = await db.Role.findOne({
    where: { id: user.roleID },
    attributes: ["id", "name", "description"],
    include: [
      {
        model: db.Path,
        attributes: ["id", "url", "description"],
        through: { attributes: [] },
      },
    ],
  });
  return path ? path : {};
};

const handleUserLogin = async (rawData) => {
  try {
    // search: sequelize Op.or
    let user = await db.User.findOne({
      where: {
        email: rawData.username,
      },
    });
    if (user) {
      let isCorrectPassword = checkPassword(rawData.password, user.passWord);
      // không bị lỗi
      if (isCorrectPassword === true) {
        const code = uuidv4();
        let pathOfRole = await getPathOfRole(user);

        return {
          EM: "ok!",
          EC: 0,
          DT: {
            pathOfRole: pathOfRole,
            email: user.email,
            userName: user.userName,
            roleID: user.roleID, // chức vụ
            code: code,
          },
        };
      }
    }
    return {
      EM: "your email | phone or password is incorrect",
      EC: 1,
      DT: "",
    };
  } catch (error) {
    console.log(">>>>check Err Login user: ", error);
    return {
      EM: "something wrong in service ...",
      EC: -2,
      DT: "",
    };
  }
};

const updateUserRefreshToken = async (email, token) => {
  try {
    await db.User.update(
      {
        refreshToken: token,
      },
      {
        where: {
          email: email,
        },
      }
    );
    return {
      EM: "ok",
      EC: 0,
      DT: "",
    };
  } catch (error) {
    console.log(">>>>check Err updateUserRefreshToken: ", error);
    return {
      EM: "something wrong in service ...",
      EC: -2,
      DT: "",
    };
  }
};

const upsertUserSocialMedia = async (typeAccount, rawData) => {
  try {
    let user = await db.User.findOne({
      where: {
        email: rawData.email,
        type: typeAccount,
      },
      raw: true,
    });

    if (!user) {
      // create new user
      user = await db.User.create({
        userName: rawData.userName,
        email: rawData.email,
        type: typeAccount,
        roleID: 2, // guess: 2 , admin: 1
      });
      user = user.get({ plain: true }); // Chuyển đối tượng Sequelize thành JSON -> giống raw: true
    }

    const code = uuidv4();

    let pathOfRole = await getPathOfRole(user);

    return {
      EM: "ok",
      EC: 0,
      DT: {
        userName: user.userName,
        email: user.email,
        googleId: rawData.googleId,
        type: typeAccount,
        code: code,
        pathOfRole: pathOfRole,
      },
    };
  } catch (error) {
    console.log(">>>>check Err upsertUserSocialMedia: ", error);
    return {
      EM: "something wrong in service ...",
      EC: -2,
      DT: "",
    };
  }
};

const getUserByRefreshToken = async (refreshToken) => {
  try {
    let user = await db.User.findOne({
      where: {
        refreshToken: refreshToken,
      },
    });
    if (user) {
      return {
        email: user.email,
        userName: user.userName,
        pathOfRole: user.pathOfRole,
        roleID: user.roleID, // chức vụ
      };
    }
    return null;
  } catch (error) {
    console.log(">>>>check Err getUserByRefreshToken: ", error);
    return null;
  }
};

const updateCode = async (email, code) => {
  try {
    await db.User.update(
      { code: code },
      {
        where: {
          email: email,
        },
      }
    );
    return {
      EM: "ok",
      EC: 0,
      DT: "",
    };
  } catch (error) {
    console.log(">>>>check Err update code send email: ", error);
    return {
      EM: "something wrong in service ...",
      EC: -2,
      DT: "",
    };
  }
};

const checkEmailLocal = async (email) => {
  try {
    let user = await db.User.findOne({
      where: {
        email: email,
        type: "local",
      },
    });
    if (user) {
      return {
        EM: "ok",
        EC: 0,
        DT: user,
      };
    }
    return {
      EM: `Email ${email} is not exist in system`,
      EC: 1,
      DT: "",
    };
  } catch (error) {
    console.log(">>>>check Err check email: ", error);
    return {
      EM: "something wrong in service ...",
      EC: -2,
      DT: "",
    };
  }
};

const updatePassword = async (email, password, code) => {
  try {
    let user = await db.User.findOne({
      where: {
        email: email,
        code: code,
      },
    });
    if (user) {
      // update password
      await db.User.update(
        { passWord: hashPassWord(password) },
        {
          where: {
            email: email,
          },
        }
      );
      return {
        EM: "ok",
        EC: 0,
        DT: user,
      };
    }
    return {
      EM: `Code ${code} is incorrect`,
      EC: 1,
      DT: "",
    };
  } catch (error) {
    console.log(">>>>check Err check code: ", error);
    return {
      EM: "something wrong in service ...",
      EC: -2,
      DT: "",
    };
  }
};
export default {
  registerNewUser,
  handleUserLogin,
  hashPassWord,
  checkEmailExists,
  checkPhoneExists,
  updateUserRefreshToken,
  upsertUserSocialMedia,
  getUserByRefreshToken,
  updateCode,
  checkEmailLocal,
  updatePassword,
};

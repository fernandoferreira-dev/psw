/*
getUsers //displayAllUsers

*** param id ? ***

get/:userId getProfile
put/:userId updateProfile
patch/:userId patchProfile
delete/:userId deleteAccount
setFavorite setFavorite
*/

"use strict";

const mysql = require("mysql2/promise");
const options = require("./options.json");
const database = mysql.createPool(options);




module.exports = { getAllUsers, getProfile, updateProfile, patchProfile, deleteProfile, setFavorite };

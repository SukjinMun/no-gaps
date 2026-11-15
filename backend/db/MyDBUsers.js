import { ObjectId } from "mongodb";
import { getDatabase } from "./connection.js";

function MyDBUsers() {
  const me = {};
  const users = () => getDatabase().collection("users");

  me.findUserByUsername = (username) => users().findOne({ username });

  me.findUserById = (id) =>
    users().findOne(
      { _id: new ObjectId(id) },
      { projection: { passwordHash: 0 } },
    );

  return me;
}

export const myDBUsers = MyDBUsers();

import { ObjectId } from "mongodb";
import { getDB } from "./connection.js";

function MyDBAddresses() {
  const me = {};
  const addresses = () => getDB().collection("addresses");

  me.getAddresses = (userId, query = {}) =>
    addresses()
      .find({ ...query, userId })
      .sort({ startMonth: -1, _id: -1 })
      .toArray();

  me.getAddress = (userId, id) => addresses().findOne({ _id: new ObjectId(id), userId });

  me.createAddress = async (userId, address) => {
    const now = new Date();
    const created = { ...address, userId, createdAt: now, updatedAt: now };
    await addresses().insertOne(created);
    return created;
  };

  me.updateAddress = (userId, id, address) =>
    addresses().findOneAndUpdate(
      { _id: new ObjectId(id), userId },
      { $set: { ...address, updatedAt: new Date() } },
      { returnDocument: "after" },
    );

  me.deleteAddress = (userId, id) => addresses().deleteOne({ _id: new ObjectId(id), userId });

  return me;
}

export const myDBAddresses = MyDBAddresses();

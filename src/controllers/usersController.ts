import { Response } from "express";
import { IRequest } from "../types/types";
import User from "../models/users";
import Booking from "../models/bookings";
import { auth as authentication } from "../utils/spreadsheetsUtil";
require("dotenv").config();

export const editProfile = async (req: IRequest, res: Response) => {
  const { name, contact, buildingId, floorId, departmentId, room, isStaff } =
    req.body;
  const id = req.user?._id;

  if (name && contact && buildingId && floorId && departmentId && room) {
    try {
      const user = await User.findByIdAndUpdate(id, {
        $set: {
          name: name,
          contact: contact,
          building: buildingId,
          floor: floorId,
          department: departmentId,
          room: room,
          detailsEntered: true,
          // isStaff: isStaff,
        },
      });
      const updatedUser = await User.findById(user?._id);
      res.status(200).json({
        success: true,
        message: "User details updated",
        data: updatedUser,
      });
    } catch (err) {
      res.status(400).json(err);
    }
  } else {
    res
      .status(400)
      .json({ success: false, message: "Incorrect request params" });
  }
};

export const getProfile = async (req: IRequest, res: Response) => {
  res.status(200).json(req.user);
};

export const getMenu = async (req: IRequest, res: Response) => {
  try {
    const credentials = await authentication();
    const auth = credentials.auth;
    const googleSheetsInstance = credentials.googleSheetsInstance;
    const spreadsheetId = process.env.SheetID;
    const day = new Date().getDay() + 1;
    const data = await googleSheetsInstance.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `Daily Menu!A${day}:B${day}`,
    });
    res.status(200).json({
      data: {
        day: data.data.values[0][0],
        menu: data.data.values[0][1].split(","),
      },
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

export const getOrders = async (req: IRequest, res: Response) => {
  const user = req.user;

  try {
    const orders = await Booking.find({
      user: user?._id,
      $or: [{ paid: true }, { paid: { $exists: false } }],
    }).sort({ createdAt: -1 });
    res.status(200).json({ data: orders });
  } catch (err) {
    res.status(400).json(err);
  }
};

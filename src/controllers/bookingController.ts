import { Request, Response } from "express";
import { GoogleSpreadsheet } from "google-spreadsheet";
import dotenv from "dotenv";
import fs from "fs";
import Booking from "../models/bookings";
dotenv.config();

const file = fs.readFileSync("./info.json");

export const book = async (req: Request, res: Response) => {
  const {
    name,
    contact,
    building,
    department,
    floor,
    room,
    date,
    paymentMode,
  } = req.body;
  if (
    name &&
    contact &&
    building &&
    department &&
    floor &&
    room &&
    date &&
    paymentMode
  ) {
    const doc = new GoogleSpreadsheet(process.env.sheetID);
    const file = fs.readFileSync("./info.json");

    try {
      await Booking.create({
        name: name,
        contact: contact,
        building: building,
        department: department,
        floor: floor,
        room: room,
        date: date,
        paymentMode: paymentMode,
      });
      await doc.useServiceAccountAuth({
        client_email: process.env.clientEmail!,
        private_key: JSON.parse(file.toString()).private_key,
      });
      await doc.loadInfo();
      const sheet = doc.sheetsByTitle[process.env.sheetTitle!];
      const row = await sheet.addRow({
        name: name,
        contact: contact,
        building: building,
        department: department,
        floor: floor,
        room: room,
        date: date,
        paymentMode: paymentMode,
      });
      res.status(200).json({ message: "Success" });
    } catch (err) {
      console.log(err);
      res.status(400).json(err);
    }
  } else {
    res.status(400).json({ message: "Invalid data" });
  }
};

// const express = require("express");
// const axios = require("axios");
// const cors = require("cors");
// this is the syntax for the commonjs and if we are using the ESM system module then we can use the basic syntax like import something from somethingelse
import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
// this is the proper way to import using the esm module.
dotenv.config();
const app = express();
const PORT = process.env.PORT;
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
// the above pubic would use the folder public and make it accessible through the web.
// as the name suggests this place is for getting the coords of a place using a free website as below...
async function getCoords(place) {
  const response = await axios.get("https://nominatim.openstreetmap.org/search",
    { params: {format: 'json',q: place }, headers: { "User-Agent": "someapp..." }, });
  if (!response.data.length) throw new Error("please enter a place that exists :( ");
  return [parseFloat(response.data[0].lon), parseFloat(response.data[0].lat)]; }
// what is the use of axios in the getCoords function and in the next POST method? idk
app.post("/api/route", async (req, res) => {
  try { const { origin, destination } = req.body;
        const originCoords = await getCoords(origin);
        const destinationCoords = await getCoords(destination);
        const response = await axios.post( "https://api.openrouteservice.org/v2/directions/driving-car",
            { coordinates: [originCoords, destinationCoords], },
            { headers: { Authorization: process.env.API_KEY, "Content-Type": "application/json", }, }
        );
        res.json(
          { coordinates: response.data.routes[0].geometry.coordinates, summary: response.data.routes[0].summary, origin: originCoords, destination: destinationCoords, }
        );
      }
  catch (error){
    console.log(error);
    res.status(500).json({ error: "Failed to fetch route" });
  } });
app.listen(PORT, () => {
  console.log(`Server running at http:localhost:${PORT})`)
});

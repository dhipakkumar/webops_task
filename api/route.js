import axios from "axios";

async function getCoords(place) {
  const response = await axios.get("https://nominatim.openstreetmap.org/search", {
    params: { format: "json", q: place },
    headers: { "User-Agent": "someapp..." },
  });
  if (!response.data.length) throw new Error("Place not found");
  return [parseFloat(response.data[0].lon), parseFloat(response.data[0].lat)];
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { origin, destination } = req.body;

    const originCoords = await getCoords(origin);
    const destinationCoords = await getCoords(destination);

    const response = await axios.post(
      "https://api.openrouteservice.org/v2/directions/driving-car",
      { coordinates: [originCoords, destinationCoords] },
      {
        headers: {
          Authorization: process.env.API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({
      coordinates: response.data.routes[0].geometry.coordinates,
      summary: response.data.routes[0].summary,
      origin: originCoords,
      destination: destinationCoords,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch route" });
  }
}


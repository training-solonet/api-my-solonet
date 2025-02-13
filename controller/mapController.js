import koordinatBts from "../models/koordinatBts.js";

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;

  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getKoordinatBts = async (req, res) => {
  try {
    const koordinat = await koordinatBts.findAll({
      attributes: ["lat", "lang"],
    });

    const formatedKoordinat = koordinat.map((koordinat) => ({
      lat: koordinat.lat,
      lang: koordinat.lang,
    }));

    res.status(200).json(formatedKoordinat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const coverage2km = async (req, res) => {
  const { lati, long } = req.body;

  try {
    const koordinat = await koordinatBts.findAll({
      attributes: ["lat", "lang"],
    });

    const formatedKoordinat = koordinat.map((koordinat) => ({
      lat: parseFloat(koordinat.lat),
      lang: parseFloat(koordinat.lang),
    }));

    const coverage = formatedKoordinat
      .map((koordinat) => {
        const distance = haversineDistance(
          lati,
          long,
          koordinat.lat,
          koordinat.lang
        );

        return {
          lat: koordinat.lat,
          long: koordinat.lang,
          distance: `${distance.toFixed(2)} km`
        };
      })
      .filter((koordinat) => parseFloat(koordinat.distance) <= 2)
      .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

    res.status(200).json(coverage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

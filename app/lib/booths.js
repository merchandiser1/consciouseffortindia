// Booth categories. Price aur stock yahin se edit karo.
export const TAX_RATE = 0.18; // GST 18%

export const BOOTHS = [
  {
    id: "woodpecker",
    name: "Woodpecker",
    price: 75000,
    stock: 20,
    tag: "Starter",
    grad: "linear-gradient(135deg,#7a4a2e,#d3a46a)",
    features: {
      Location: "Standard",
      "Corner open": "No",
      "Collaborator tag reel": "No",
      Fascia: "No",
      "Octonorm built-up stall": "No",
      "Racks / Tables": "1 table only OR 1 rack only",
      Chairs: "1",
      Plugpoint: "No",
      Spotlights: "No",
    },
  },
  {
    id: "hummingbird",
    name: "Hummingbird",
    price: 145000,
    stock: 15,
    tag: "Popular",
    grad: "linear-gradient(135deg,#2e3a7a,#8a6ab8)",
    features: {
      Location: "Standard",
      "Corner open": "No",
      "Collaborator tag reel": "No",
      Fascia: "Yes",
      "Octonorm built-up stall": "Yes",
      "Racks / Tables": "2 racks with 1 table OR 2 tables",
      Chairs: "2",
      Plugpoint: "Yes",
      Spotlights: "1",
    },
  },
  {
    id: "hummingbird-luxe",
    name: "Hummingbird (Luxe)",
    price: 190000,
    stock: 8,
    tag: "Prime",
    grad: "linear-gradient(135deg,#1f5a4a,#7fc4a8)",
    features: {
      Location: "Prime",
      "Corner open": "No",
      "Collaborator tag reel": "Yes",
      Fascia: "Yes",
      "Octonorm built-up stall": "Yes",
      "Racks / Tables": "3 racks with billing table OR 3 tables only",
      Chairs: "2",
      Plugpoint: "Yes",
      Spotlights: "1",
    },
  },
  {
    id: "eagle",
    name: "Eagle",
    price: 230000,
    stock: 6,
    tag: "Prime",
    grad: "linear-gradient(135deg,#5a2a2a,#d08a6a)",
    features: {
      Location: "Prime",
      "Corner open": "No",
      "Collaborator tag reel": "Yes",
      Fascia: "Yes",
      "Octonorm built-up stall": "Yes",
      "Racks / Tables": "~8 sqm, fits 5 racks and 2 tables",
      Chairs: "2",
      Plugpoint: "Yes",
      Spotlights: "1",
    },
  },
  {
    id: "eagle-prime-luxe",
    name: "Eagle (Prime Luxe)",
    price: 300000,
    stock: 1,
    tag: "Ultra Prime",
    grad: "linear-gradient(135deg,#2a1a14,#c9a24a)",
    features: {
      Location: "Ultra Prime, first stall at entrance",
      "Corner open": "Yes",
      "Collaborator tag reel": "Yes",
      Fascia: "Yes",
      "Octonorm built-up stall": "Yes",
      "Racks / Tables": "~10 sqm custom space for couture & fine jewellery",
      Chairs: "2",
      Plugpoint: "Yes",
      Spotlights: "2",
    },
  },
];

export const getBooth = (name) =>
  BOOTHS.find((b) => b.name === name || b.id === name);

export const priceBreakup = (booth) => {
  const base = booth.price;
  const tax = Math.round(base * TAX_RATE);
  return { base, tax, total: base + tax };
};
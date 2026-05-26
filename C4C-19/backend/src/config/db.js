const mongoose = require("mongoose");
const Hospital = require("../models/Hospital");

const seedHospitals = async () => {
  try {
    const count = await Hospital.countDocuments();
    if (count === 0) {
      console.log("Seeding default health centers matching mockups...");
      const mockHospitals = [
        {
          name: "Bantwal PHC",
          type: "government",
          address: "Bantwal Town, Government Hospital Rd",
          latitude: 12.8988,
          longitude: 75.0222,
          contact: "+91 82552 30201",
          cost: "Free",
          available24x7: false
        },
        {
          name: "Vittal PHC",
          type: "government",
          address: "Vittal Main Road, Near Bus Stand",
          latitude: 12.8942,
          longitude: 75.0125,
          contact: "+91 82552 40302",
          cost: "Free",
          available24x7: false
        },
        {
          name: "Kaveri Hosp",
          type: "private",
          address: "KSR Road, Opp City Plaza, Bantwal",
          latitude: 12.9015,
          longitude: 75.0310,
          contact: "+91 82552 22550",
          cost: "Paid (Standard)",
          available24x7: true
        },
        {
          name: "Srinivas Hospital",
          type: "private",
          address: "Srinivas Campus, Merlapadavu",
          latitude: 12.8950,
          longitude: 75.0420,
          contact: "+91 82552 99110",
          cost: "Paid (Standard)",
          available24x7: true
        },
        {
          name: "HealthLab Testing",
          type: "testing",
          address: "Laboratory Cross, Main Bazar Road",
          latitude: 12.8920,
          longitude: 75.0305,
          contact: "+91 82552 77889",
          cost: "Paid (Low Cost)",
          available24x7: false
        },
        {
          name: "BP Center Diagnostics",
          type: "testing",
          address: "Heart Care St, Next to Pharmacy",
          latitude: 12.8905,
          longitude: 75.0210,
          contact: "+91 82552 88440",
          cost: "Paid (Low Cost)",
          available24x7: false
        }
      ];
      await Hospital.insertMany(mockHospitals);
      console.log("Successfully seeded 6 premium health centers!");
    } else {
      console.log(`Found ${count} health centers in the database. Seeding skipped.`);
    }
  } catch (error) {
    console.log("Error seeding hospitals:", error);
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");
    await seedHospitals();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;
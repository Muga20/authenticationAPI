const Roles = require("../models/roles");

const rolesData = [
    { role: "Admin", role_number: 1 },
    { role: "User", role_number: 2 },
];

const seedRoles = async () => {
    try {
        await Roles.bulkCreate(rolesData);
        console.log("Roles seeded successfully");
    } catch (error) {
        console.error("Error seeding roles:", error);
    }
};

seedRoles();

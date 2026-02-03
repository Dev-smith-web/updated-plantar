import { config } from "dotenv";
config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { hash } from "bcryptjs";
import {
  users,
  plants,
  plantParts,
  quizQuestions,
  quizResults,
} from "../lib/db/schema";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client);

async function seed() {
  console.log("Seeding database...\n");

  // ── Users ──────────────────────────────────────────────────────────────────

  const passwordHash = await hash("password123", 10);

  const [teacher] = await db
    .insert(users)
    .values({
      name: "Ms. Garcia",
      email: "teacher@plantar.app",
      password: passwordHash,
      role: "teacher",
    })
    .returning();

  const [student] = await db
    .insert(users)
    .values({
      name: "Alex Student",
      email: "student@plantar.app",
      password: passwordHash,
      role: "student",
    })
    .returning();

  console.log(`✓ Created users: ${teacher.name}, ${student.name}`);

  // ── Plants ─────────────────────────────────────────────────────────────────

  const [sunflower] = await db
    .insert(plants)
    .values({
      name: "Sunflower",
      scientificName: "Helianthus annuus",
      description:
        "A tall, bright flowering plant that tracks the sun's movement across the sky. Native to North America, sunflowers can grow up to 12 feet tall.",
      funFacts: [
        "A single sunflower head can contain up to 2,000 seeds",
        "Young sunflowers track the sun from east to west daily",
        "Sunflowers can absorb radioactive materials from soil",
      ],
      imageUrl: null,
      modelUrl: "/models/sunflower.glb",
      color: "#FFD700",
      createdBy: teacher.id,
    })
    .returning();

  const [mustard] = await db
    .insert(plants)
    .values({
      name: "Mustard",
      scientificName: "Brassica juncea",
      description:
        "A fast-growing flowering plant in the cabbage family. Widely cultivated for its seeds used as a spice and its leaves eaten as a vegetable.",
      funFacts: [
        "Mustard seeds are mentioned in ancient texts dating back 5,000 years",
        "A mustard plant can produce up to 15,000 seeds",
        "Mustard gas (a chemical weapon) is actually unrelated to mustard plants",
      ],
      imageUrl: null,
      modelUrl: "/models/mustard.glb",
      color: "#C8B900",
      createdBy: teacher.id,
    })
    .returning();

  console.log(`✓ Created plants: ${sunflower.name}, ${mustard.name}`);

  // ── Plant Parts: Sunflower ─────────────────────────────────────────────────

  await db.insert(plantParts).values([
    {
      plantId: sunflower.id,
      partName: "Roots",
      description:
        "A deep taproot system that anchors the tall plant and absorbs water and nutrients from the soil.",
      detailedInfo:
        "Sunflowers develop a strong taproot that can extend 6 feet deep, along with a network of lateral roots. This root system supports stems that can grow over 12 feet tall.",
      funFact:
        "Sunflower roots can extract heavy metals and radioactive elements from contaminated soil — a process called phytoremediation.",
      function: "Anchoring, water and nutrient absorption, soil remediation",
      color: "#8B6914",
    },
    {
      plantId: sunflower.id,
      partName: "Stem",
      description:
        "A strong, thick, hairy stem that supports the heavy flower head and transports water and nutrients.",
      detailedInfo:
        "The sunflower stem is rough and fibrous, covered with coarse hairs. It contains vascular bundles that transport water up from roots and sugars down from leaves.",
      funFact:
        "The stem of a young sunflower is flexible enough to bend and follow the sun, but stiffens as the plant matures, permanently facing east.",
      function: "Structural support, water and nutrient transport",
      color: "#228B22",
    },
    {
      plantId: sunflower.id,
      partName: "Leaves",
      description:
        "Large, heart-shaped leaves with rough texture that capture sunlight for photosynthesis.",
      detailedInfo:
        "Sunflower leaves are broad, rough-textured with serrated edges, arranged alternately along the stem. They can grow up to 12 inches long and are essential for photosynthesis.",
      funFact:
        "Young sunflower leaves can track the sun during the day through heliotropism, turning from east to west and resetting overnight!",
      function: "Photosynthesis, gas exchange, transpiration",
      color: "#4CAF50",
    },
    {
      plantId: sunflower.id,
      partName: "Flowers",
      description:
        "The flower head is made of thousands of tiny florets — yellow ray florets on the outside and disk florets in the center.",
      detailedInfo:
        "What looks like one flower is actually a composite of up to 2,000 individual florets. The outer ray florets are sterile and attract pollinators, while the inner disk florets produce seeds.",
      funFact:
        "The disk florets in the center are arranged in a Fibonacci spiral pattern — one of nature's most beautiful mathematical sequences!",
      function: "Reproduction, pollinator attraction",
      color: "#FFD700",
    },
    {
      plantId: sunflower.id,
      partName: "Seeds",
      description:
        "Nutritious seeds that develop from the disk florets after pollination, encased in a striped shell.",
      detailedInfo:
        "Sunflower seeds are technically fruits (achenes). Each seed develops from a fertilized disk floret. They're rich in vitamin E, healthy fats, and protein.",
      funFact:
        "Russia produces more sunflower seeds than any other country — over 15 million tons per year!",
      function: "Reproduction, food storage, dispersal",
      color: "#2E2E2E",
    },
    {
      plantId: sunflower.id,
      partName: "Fruits",
      description:
        "The sunflower fruit is the entire seed head, a dense cluster of mature seeds ready for dispersal.",
      detailedInfo:
        "Botanically, each 'seed' is a single-seeded fruit called an achene. The seed head droops when mature, allowing seeds to fall or be eaten by birds for dispersal.",
      funFact:
        "A single sunflower head can weigh up to 1 pound when fully loaded with seeds!",
      function: "Seed protection, dispersal",
      color: "#8B7355",
    },
  ]);

  // ── Plant Parts: Mustard ───────────────────────────────────────────────────

  await db.insert(plantParts).values([
    {
      plantId: mustard.id,
      partName: "Roots",
      description:
        "A shallow, fibrous root system that efficiently absorbs moisture from the topsoil.",
      detailedInfo:
        "Mustard plants have a relatively shallow taproot with many fine lateral roots. This makes them excellent at quickly establishing in soil and absorbing nutrients from the upper soil layers.",
      funFact:
        "Mustard roots release chemicals that can suppress soil-borne diseases, making them a popular cover crop for farmers!",
      function: "Water and nutrient absorption, soil health improvement",
      color: "#8B6914",
    },
    {
      plantId: mustard.id,
      partName: "Stem",
      description:
        "A slender, branching stem that grows rapidly and supports clusters of flowers at the top.",
      detailedInfo:
        "Mustard stems are herbaceous, erect, and branch freely. They can grow 2-6 feet tall in just a few weeks, making mustard one of the fastest-growing crops.",
      funFact:
        "Mustard plants can grow from seed to full maturity in just 30-40 days — faster than almost any other crop!",
      function: "Structural support, nutrient transport",
      color: "#556B2F",
    },
    {
      plantId: mustard.id,
      partName: "Leaves",
      description:
        "Broad, lobed lower leaves and narrower upper leaves, all edible and packed with nutrients.",
      detailedInfo:
        "Mustard leaves (mustard greens) are rich in vitamins A, C, and K. The lower leaves are large and lobed, while upper leaves are smaller and simpler. They have a peppery, pungent flavor.",
      funFact:
        "Mustard greens are one of the most nutritious leafy vegetables, containing more vitamin C per serving than oranges!",
      function: "Photosynthesis, food source for humans and animals",
      color: "#4CAF50",
    },
    {
      plantId: mustard.id,
      partName: "Flowers",
      description:
        "Clusters of small, bright yellow flowers with four petals arranged in a cross shape.",
      detailedInfo:
        "Mustard flowers are characteristic of the Brassicaceae family — four petals in a cross shape (cruciform). They grow in clusters called racemes and are self-pollinating, though bees frequently visit them.",
      funFact:
        "The cross-shaped flower gives the Brassicaceae family its old name 'Cruciferae' — meaning 'cross-bearing'!",
      function: "Reproduction, pollinator attraction",
      color: "#FFD700",
    },
    {
      plantId: mustard.id,
      partName: "Seeds",
      description:
        "Tiny, round seeds that range from yellow to brown-black, used as a spice worldwide.",
      detailedInfo:
        "Mustard seeds develop inside long, narrow pods called siliques. When crushed and mixed with liquid, an enzyme reaction produces the characteristic sharp, pungent mustard flavor (allyl isothiocyanate).",
      funFact:
        "The 'heat' in mustard only develops when seeds are crushed and mixed with water — intact seeds have almost no flavor!",
      function: "Reproduction, spice production, oil storage",
      color: "#B8860B",
    },
    {
      plantId: mustard.id,
      partName: "Fruits",
      description:
        "Long, narrow seed pods (siliques) that split open when dry to release seeds.",
      detailedInfo:
        "Mustard fruits are elongated pods called siliques, typically 1-2 inches long. Each pod contains 10-20 seeds arranged in a row. When mature, the pods dry and split open, scattering seeds.",
      funFact:
        "A single mustard plant can produce 15,000 seeds in its pods — which is why the parable of the mustard seed is about explosive growth!",
      function: "Seed development, protection, dispersal",
      color: "#9E8B6E",
    },
  ]);

  console.log("✓ Created plant parts (6 per plant)");

  // ── Quiz Questions: Sunflower ──────────────────────────────────────────────

  await db.insert(quizQuestions).values([
    {
      plantId: sunflower.id,
      question: "What is the scientific name of the sunflower?",
      options: [
        "Helianthus annuus",
        "Rosa indica",
        "Brassica juncea",
        "Solanum lycopersicum",
      ],
      correctAnswer: "Helianthus annuus",
      difficulty: "easy",
      createdByTeacher: true,
    },
    {
      plantId: sunflower.id,
      question:
        "What mathematical pattern do sunflower seeds follow in the flower head?",
      options: [
        "Fibonacci spiral",
        "Geometric grid",
        "Random distribution",
        "Concentric circles",
      ],
      correctAnswer: "Fibonacci spiral",
      difficulty: "medium",
      createdByTeacher: true,
    },
    {
      plantId: sunflower.id,
      question:
        "What is the behavior called when sunflowers follow the sun across the sky?",
      options: [
        "Heliotropism",
        "Phototropism",
        "Gravitropism",
        "Thigmotropism",
      ],
      correctAnswer: "Heliotropism",
      difficulty: "hard",
      createdByTeacher: true,
    },
    {
      plantId: sunflower.id,
      question: "Which part of the sunflower is responsible for photosynthesis?",
      options: ["Leaves", "Petals", "Stem", "Roots"],
      correctAnswer: "Leaves",
      difficulty: "easy",
      createdByTeacher: true,
    },
    {
      plantId: sunflower.id,
      question:
        "Sunflower roots can help clean contaminated soil. What is this process called?",
      options: [
        "Phytoremediation",
        "Composting",
        "Biodegradation",
        "Fermentation",
      ],
      correctAnswer: "Phytoremediation",
      difficulty: "hard",
      createdByTeacher: true,
    },
  ]);

  // ── Quiz Questions: Mustard ────────────────────────────────────────────────

  await db.insert(quizQuestions).values([
    {
      plantId: mustard.id,
      question: "Which plant family does the mustard plant belong to?",
      options: [
        "Brassicaceae",
        "Fabaceae",
        "Asteraceae",
        "Solanaceae",
      ],
      correctAnswer: "Brassicaceae",
      difficulty: "medium",
      createdByTeacher: true,
    },
    {
      plantId: mustard.id,
      question: "What shape are mustard flowers?",
      options: [
        "Cross-shaped (4 petals)",
        "Star-shaped (5 petals)",
        "Bell-shaped",
        "Tubular",
      ],
      correctAnswer: "Cross-shaped (4 petals)",
      difficulty: "easy",
      createdByTeacher: true,
    },
    {
      plantId: mustard.id,
      question:
        "What chemical compound gives crushed mustard seeds their sharp flavor?",
      options: [
        "Allyl isothiocyanate",
        "Capsaicin",
        "Piperine",
        "Citric acid",
      ],
      correctAnswer: "Allyl isothiocyanate",
      difficulty: "hard",
      createdByTeacher: true,
    },
    {
      plantId: mustard.id,
      question: "What are the long seed pods of mustard plants called?",
      options: ["Siliques", "Capsules", "Berries", "Drupes"],
      correctAnswer: "Siliques",
      difficulty: "medium",
      createdByTeacher: true,
    },
    {
      plantId: mustard.id,
      question: "How long does it take a mustard plant to grow from seed to maturity?",
      options: ["30-40 days", "90-120 days", "6-8 months", "1-2 years"],
      correctAnswer: "30-40 days",
      difficulty: "easy",
      createdByTeacher: true,
    },
  ]);

  console.log("✓ Created 10 quiz questions (5 per plant)");

  // ── Quiz Results ───────────────────────────────────────────────────────────

  await db.insert(quizResults).values([
    {
      userId: student.id,
      studentName: student.name,
      score: 4,
      totalQuestions: 5,
      timeTaken: 120,
    },
    {
      userId: student.id,
      studentName: student.name,
      score: 3,
      totalQuestions: 5,
      timeTaken: 95,
    },
  ]);

  console.log("✓ Created 2 sample quiz results");

  console.log("\n🌱 Seed complete!");
  console.log("  Teacher login: teacher@plantar.app / password123");
  console.log("  Student login: student@plantar.app / password123");

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

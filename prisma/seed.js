const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const vegetables = [
  { name: 'Tomato', category: 'vegetable', sowIndoorStart: 2, sowIndoorEnd: 4, sowOutdoorStart: 5, sowOutdoorEnd: 6, harvestStart: 7, harvestEnd: 10, daysToGerminate: 10, daysToHarvest: 85 },
  { name: 'Cucumber', category: 'vegetable', sowIndoorStart: 3, sowIndoorEnd: 5, sowOutdoorStart: 5, sowOutdoorEnd: 6, harvestStart: 7, harvestEnd: 9, daysToGerminate: 8, daysToHarvest: 65 },
  { name: 'Carrot', category: 'vegetable', sowOutdoorStart: 3, sowOutdoorEnd: 7, harvestStart: 6, harvestEnd: 11, daysToGerminate: 14, daysToHarvest: 75 },
  { name: 'Lettuce', category: 'vegetable', sowIndoorStart: 2, sowIndoorEnd: 9, sowOutdoorStart: 3, sowOutdoorEnd: 9, harvestStart: 4, harvestEnd: 10, daysToGerminate: 7, daysToHarvest: 45 },
  { name: 'Spinach', category: 'vegetable', sowOutdoorStart: 3, sowOutdoorEnd: 9, harvestStart: 4, harvestEnd: 10, daysToGerminate: 10, daysToHarvest: 50 },
  { name: 'Radish', category: 'vegetable', sowOutdoorStart: 3, sowOutdoorEnd: 9, harvestStart: 4, harvestEnd: 10, daysToGerminate: 6, daysToHarvest: 30 },
  { name: 'Beetroot', category: 'vegetable', sowOutdoorStart: 3, sowOutdoorEnd: 7, harvestStart: 6, harvestEnd: 10, daysToGerminate: 10, daysToHarvest: 60 },
  { name: 'Onion', category: 'vegetable', sowIndoorStart: 1, sowIndoorEnd: 3, sowOutdoorStart: 3, sowOutdoorEnd: 4, harvestStart: 7, harvestEnd: 9, daysToGerminate: 12, daysToHarvest: 110 },
  { name: 'Garlic', category: 'vegetable', sowOutdoorStart: 10, sowOutdoorEnd: 11, harvestStart: 6, harvestEnd: 7, daysToHarvest: 240 },
  { name: 'Potato', category: 'vegetable', sowOutdoorStart: 3, sowOutdoorEnd: 5, harvestStart: 6, harvestEnd: 9, daysToHarvest: 100 },
  { name: 'Pea', category: 'vegetable', sowOutdoorStart: 2, sowOutdoorEnd: 6, harvestStart: 6, harvestEnd: 8, daysToGerminate: 10, daysToHarvest: 70 },
  { name: 'Broad Bean', category: 'vegetable', sowOutdoorStart: 2, sowOutdoorEnd: 5, harvestStart: 6, harvestEnd: 8, daysToGerminate: 12, daysToHarvest: 95 },
  { name: 'French Bean', category: 'vegetable', sowIndoorStart: 4, sowIndoorEnd: 6, sowOutdoorStart: 5, sowOutdoorEnd: 7, harvestStart: 7, harvestEnd: 9, daysToHarvest: 60 },
  { name: 'Courgette', category: 'vegetable', sowIndoorStart: 4, sowIndoorEnd: 5, sowOutdoorStart: 5, sowOutdoorEnd: 6, harvestStart: 7, harvestEnd: 9, daysToHarvest: 55 },
  { name: 'Pumpkin', category: 'vegetable', sowIndoorStart: 4, sowIndoorEnd: 5, sowOutdoorStart: 5, sowOutdoorEnd: 6, harvestStart: 9, harvestEnd: 10, daysToHarvest: 110 },
  { name: 'Sweetcorn', category: 'vegetable', sowIndoorStart: 4, sowIndoorEnd: 5, sowOutdoorStart: 5, sowOutdoorEnd: 6, harvestStart: 8, harvestEnd: 9, daysToHarvest: 90 },
  { name: 'Cabbage', category: 'vegetable', sowIndoorStart: 2, sowIndoorEnd: 7, sowOutdoorStart: 3, sowOutdoorEnd: 8, harvestStart: 6, harvestEnd: 12, daysToHarvest: 100 },
  { name: 'Kale', category: 'vegetable', sowOutdoorStart: 4, sowOutdoorEnd: 7, harvestStart: 8, harvestEnd: 3, daysToHarvest: 80 },
  { name: 'Leek', category: 'vegetable', sowIndoorStart: 1, sowIndoorEnd: 4, sowOutdoorStart: 3, sowOutdoorEnd: 5, harvestStart: 9, harvestEnd: 3, daysToHarvest: 120 },
  { name: 'Celery', category: 'vegetable', sowIndoorStart: 2, sowIndoorEnd: 4, sowOutdoorStart: 5, sowOutdoorEnd: 6, harvestStart: 8, harvestEnd: 10, daysToHarvest: 130 },
]

const herbs = [
  { name: 'Basil', category: 'herb', sowIndoorStart: 3, sowIndoorEnd: 5, sowOutdoorStart: 5, sowOutdoorEnd: 6, harvestStart: 6, harvestEnd: 9, daysToGerminate: 8, daysToHarvest: 50 },
  { name: 'Parsley', category: 'herb', sowIndoorStart: 2, sowIndoorEnd: 4, sowOutdoorStart: 3, sowOutdoorEnd: 7, harvestStart: 6, harvestEnd: 11, daysToGerminate: 21, daysToHarvest: 70 },
  { name: 'Coriander', category: 'herb', sowOutdoorStart: 3, sowOutdoorEnd: 9, harvestStart: 5, harvestEnd: 10, daysToGerminate: 14, daysToHarvest: 45 },
  { name: 'Chives', category: 'herb', sowIndoorStart: 2, sowIndoorEnd: 4, sowOutdoorStart: 3, sowOutdoorEnd: 6, harvestStart: 5, harvestEnd: 10, daysToGerminate: 14, daysToHarvest: 60 },
  { name: 'Mint', category: 'herb', sowIndoorStart: 3, sowIndoorEnd: 5, sowOutdoorStart: 4, sowOutdoorEnd: 6, harvestStart: 6, harvestEnd: 10, daysToHarvest: 70 },
  { name: 'Thyme', category: 'herb', sowIndoorStart: 2, sowIndoorEnd: 4, sowOutdoorStart: 4, sowOutdoorEnd: 6, harvestStart: 6, harvestEnd: 9, daysToHarvest: 80 },
  { name: 'Rosemary', category: 'herb', sowIndoorStart: 2, sowIndoorEnd: 4, sowOutdoorStart: 5, sowOutdoorEnd: 6, harvestStart: 7, harvestEnd: 10, daysToHarvest: 120 },
  { name: 'Oregano', category: 'herb', sowIndoorStart: 3, sowIndoorEnd: 5, sowOutdoorStart: 5, sowOutdoorEnd: 6, harvestStart: 7, harvestEnd: 10, daysToHarvest: 75 },
  { name: 'Dill', category: 'herb', sowOutdoorStart: 4, sowOutdoorEnd: 7, harvestStart: 6, harvestEnd: 9, daysToHarvest: 45 },
  { name: 'Sage', category: 'herb', sowIndoorStart: 3, sowIndoorEnd: 5, sowOutdoorStart: 5, sowOutdoorEnd: 6, harvestStart: 7, harvestEnd: 10, daysToHarvest: 90 },
]

async function main() {
  let inserted = 0
  const allPlants = [...vegetables, ...herbs]

  for (const plant of allPlants) {
    await prisma.gardenPlant.upsert({
      where: { id: `${plant.category}-${plant.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {
        ...plant,
      },
      create: {
        id: `${plant.category}-${plant.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...plant,
        description: `Seeded sample data for ${plant.name}.`,
      },
    })
    inserted += 1
  }

  console.log(`Seed complete: ${inserted} plant profiles upserted (${vegetables.length} vegetables, ${herbs.length} herbs)`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

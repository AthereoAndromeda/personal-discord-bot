import { Guild, PrismaClient, Verse } from "@prisma/client";
const prisma = new PrismaClient();

const verses: Verse[] = [
  {
    id: 1,
    title: "Title 1",
    content: "Some Content",
  },
  {
    id: 2,
    title: "Neutral Milk Hotel",
    content: "In The Aeroplane Over The Sea",
  },
  {
    id: 3,
    title: "Green Day",
    content: "Is awesome",
  },
];

const guilds: Guild[] = [
  {
    id: "1",
    prefix: "a",
  },
  {
    id: "2",
    prefix: "b",
  },
  {
    id: "3",
    prefix: "NMH",
  },
];

async function seed(prisma: PrismaClient) {
  for (const verse of verses) {
    const res = await prisma.verse.upsert({
      where: {
        id: verse.id,
      },
      update: {
        id: verse.id,
        title: verse.title,
        content: verse.content,
      },
      create: {
        id: verse.id,
        title: verse.title,
        content: verse.content,
      },
    });

    console.log(res);
  }

  for (const guild of guilds) {
    const res = await prisma.guild.upsert({
      where: {
        id: guild.id,
      },
      update: {
        id: guild.id,
        prefix: guild.prefix,
      },
      create: {
        id: guild.id,
        prefix: guild.prefix,
      },
    });

    console.log(res);
  }
}

(async () => {
  try {
    await prisma.$connect();
    await seed(prisma);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
})();

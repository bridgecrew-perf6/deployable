import { PrismaClient } from "@prisma/client";
import fastify from "fastify";

const app = fastify({ logger: true });
const prisma = new PrismaClient();

app.get("/", (req, res) => {
  res.send("Hello web! Version 0.1! Hi!");
});

app.get("/labels", async (req, res) => {
  const labels = await prisma.label.findMany();
  res.send(labels);
});

app.post<{
  Body: { name: string };
}>("/labels/add", async (req, res) => {
  try {
    await prisma.label.create({
      data: { name: req.body.name },
    });
    res.send({ message: "Added" });
  } catch (error) {
    res.send({ error: "Error when creating label" }).status(500);
  }
});

app.put<{
  Params: {
    labelId: number;
  };
}>("/labels/:labelId/click", async (req, res) => {
  const label = await prisma.label.findUnique({
    where: { id: req.params.labelId },
  });

  if (label) {
    await prisma.label.update({
      where: {
        id: label.id,
      },
      data: { ...label, clickCount: label.clickCount + 1 },
    });
    res.send({ message: "Updated" });
  } else {
    res.send({ error: "Label not found" }).status(400);
  }
});

app.delete<{
  Params: {
    labelId: number;
  };
}>("/labels/:labelId/delete", async (req, res) => {
  const label = await prisma.label.findUnique({
    where: { id: req.params.labelId },
  });

  if (label) {
    await prisma.label.delete({
      where: {
        id: label.id,
      },
    });
    res.send({ message: "Deleted" });
  } else {
    res.send({ error: "Label not found" }).status(400);
  }
});

app.listen(
  process.env.PORT ?? 8080,
  process.env.HOST ?? "localhost",
  function (err, address) {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }

    console.log(`Server is now listening on ${address}!`);
  }
);

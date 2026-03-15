const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const fs = require("node:fs/promises");
const path = require("node:path");

const dataFilePath = path.join(__dirname, "data.txt");

const typeDefs = `#graphql
  type FormData {
    input1: String
    input2: String
  }

  input FormDataInput {
    input1: String
    input2: String
  }

  type Query {
    loadData: FormData
  }

  type Mutation {
    saveData(data: FormDataInput!): Boolean!
  }
`;

async function readStoredData() {
  try {
    const raw = await fs.readFile(dataFilePath, { encoding: "utf8" });
    return JSON.parse(raw);
  } catch {
    return { input1: "", input2: "" };
  }
}

const resolvers = {
  Query: {
    loadData: async () => readStoredData(),
  },
  Mutation: {
    saveData: async (_, { data }) => {
      await fs.writeFile(dataFilePath, JSON.stringify(data), {
        encoding: "utf8",
      });
      return true;
    },
  },
};

async function start() {
  const server = new ApolloServer({ typeDefs, resolvers });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    cors: {
      origin: ["http://localhost:3000", "http://localhost:3001"],
    },
  });

  console.log(`GraphQL server ready at ${url}`);
}

start().catch((error) => {
  console.error("Failed to start GraphQL server", error);
  process.exit(1);
});

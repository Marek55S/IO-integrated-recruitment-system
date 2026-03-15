const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");

const typeDefs = `#graphql
  type QueryResult {
    text: String!
    id: ID!
  }

  type Query {
    firstQuery: QueryResult!
  }
`;

const resolvers = {
  Query: {
    firstQuery: () => ({
      text: "pierwszy query",
      id: "1",
    }),
  },
};

async function start() {
  const server = new ApolloServer({ typeDefs, resolvers });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    cors: {
      origin: ["http://localhost:3000"],
    },
  });

  console.log(`GraphQL server ready at ${url}`);
}

start().catch((error) => {
  console.error("Failed to start GraphQL server", error);
  process.exit(1);
});

const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");

const { NEXT_APP_URL, GRAPHQL_PORT } = require("./config");
const { resolvers } = require("./resolvers");
const { loadTypeDefs } = require("./schema");

async function startGraphQLServer() {
  const typeDefs = await loadTypeDefs();
  const server = new ApolloServer({ typeDefs, resolvers });

  const { url } = await startStandaloneServer(server, {
    listen: { port: GRAPHQL_PORT },
    cors: {
      origin: [NEXT_APP_URL],
    },
  });

  return { url };
}

module.exports = {
  startGraphQLServer,
};

const { startGraphQLServer } = require("./src/startServer");

startGraphQLServer()
  .then(({ url }) => {
    console.log(`GraphQL server ready at ${url}`);
  })
  .catch((error) => {
    console.error("Failed to start GraphQL server", error);
    process.exit(1);
  });

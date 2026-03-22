const { readStoredData, saveStoredData } = require("./dataStore");

const resolvers = {
  Query: {
    loadData: async () => readStoredData(),
  },
  Mutation: {
    saveData: async (_, { data }) => saveStoredData(data),
  },
};

module.exports = {
  resolvers,
};

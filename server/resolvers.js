const jwt = require("jsonwebtoken");
const { paginateResults } = require("./utils");

module.exports = {
  Query: {
    quakes: async (_, { pageSize = 20, after }, { dataSources }) => {
      const allQuakes = await dataSources.quakeAPI.getAllQuakes();
      allQuakes.reverse();
      const quakes = paginateResults({
        after,
        pageSize,
        results: allQuakes,
      });

      return {
        quakes,
        cursor: quakes.length ? quakes[quakes.length - 1].cursor : null,
        hasMore: quakes.length
          ? quakes[quakes.length - 1].cursor !==
            allQuakes[allQuakes.length - 1].cursor
          : false,
      };
    },
    quake: (_, { id }, { dataSources }) =>
      dataSources.quakeAPI.getQuakeById({ quakeId: id }),
    users: (_, __, { dataSources }) => dataSources.userAPI.getUsers(),
  },

  Mutation: {
    login: async (_, { email }, { dataSources }) => {
      const user = await dataSources.userAPI.getUser({ email });
      if (user) {
        const token = jwt.sign(
          { id: user.id, email: user.email },
          "secret_key",
          {
            expiresIn: 60 * 60,
          }
        );
        return token;
      }
      if (!user) {
        console.log("User is not in database");
      }
    },
    saveRecord: async (_, { recordId }, { dataSources }) => {
      const results = await dataSources.userAPI.saveRecord({ recordId });

      return {
        success: results.length ? true : false,
        message: results.length
          ? "Quake data successfully saved"
          : "Quake data NOT saved",
        records: results,
      };
    },
  },
};

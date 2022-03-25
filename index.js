const { ApolloServer, gql } = require('apollo-server');
const dummyjson = require('dummy-json');

const template = `{
    "title": "{{lorem min=2 max=10}}",
    "date": "{{date '2019' '2022'}}",
    "author": "{{firstName}} {{lastName}}",
    "uuid" : "{{guid}}",
    "text": "{{lorem min=50 max=100}}",
    "likes": 0
}`;
const news = [...new Array(10)].map(_ => JSON.parse(dummyjson.parse(template)));

// The GraphQL schema
const typeDefs = gql`
  type News {
      title: String
      date: String
      author: String
      likes: Int
      uuid: String
      text: String
  }
  type Query {
    "A query returning news list"
    news: [News]
    "A query returning a single news"
    singleNews(uuid: String!): News
  }
  type Mutation {
    "A mutation to like the news"
    like(uuid: String!): News
    "A mutation to dislike the news"
    dislike(uuid: String!): News
    "A mutation to delete the news"
    delete(uuid: String!): [News]
  }
`;

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    news: () => news,
    singleNews: (_, { uuid }) => news.find(o => o.uuid === uuid),
  },
  Mutation: {
    like: (_, { uuid }) => {
        const liked = news.find(o => o.uuid === uuid);
        if (!liked) throw new Error('No news with this uuid');
        liked.likes++;
        return liked;
    },
    dislike: (_, { uuid }) => {
        const disliked = news.find(o => o.uuid === uuid);
        if (!disliked) throw new Error('No news with this uuid');
        disliked.likes--;
        return disliked;
    },
    delete: (_, { uuid }) => {
        const indexToDelete = news.findIndex(o => o.uuid === uuid);
        if (indexToDelete === -1) throw new Error('No news with this uuid');
        news.splice(indexToDelete, 1)
        return news;
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
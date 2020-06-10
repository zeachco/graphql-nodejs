const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');

// // Typescript interface
// interface Field {
//   name: string;
//   getType?: string;
//   setType?: string;
//   getArgs?: Record<string, string>;
//   setArgs?: Record<string, string>;
//   operation: Function<any>
// }

function argsToString(args = {}) {
  const keys = Object.keys(args);
  return keys.length ? `(${keys.map(key => `${key}: ${args[key]}`).join(', ')})` : ''
}

function createField(conf) {
  const query = conf.getType
    ? `${conf.name}${argsToString(conf.getArgs)}: ${conf.getType}`
    : ''
  const mutation = conf.setType
    ? `${conf.name}${argsToString(conf.setArgs)}: ${conf.setType}`
    : ''
  return {
    ...conf,
    query,
    mutation,
  }
}

var fakeDatabase = {};

const fields = [
  {
    name: 'quoteOfTheDay',
    getType: 'String',
    operation: () =>  Math.random() < 0.5 ? 'Take it easy' : 'Salvation lies within'
  },
  {
    name: 'rollDices',
    getType: '[Int]',
    getArgs: {
      numDice: 'Int!',
      numSides: 'Int'
    },
    operation({ numDice, numSides = 6 }) {
      return new Array(numDice)
      .fill(undefined)
      .map((_) => 1 + Math.floor(Math.random() * numSides))
    }
  },
  {
    name: 'random',
    getType: 'String',
    operation: () => Math.random()
  },
  {
    name: 'message',
    getType: 'String',
    setType: 'String',
    setArgs: {
      message: 'String'
    },
    operation({message}) {
      if (typeof message !== 'undefined') {
        fakeDatabase.message = message;
      }
      return fakeDatabase.message;
    }
  }
].map(createField)

// The root provides a resolver function for each API endpoint
var root = fields.reduce((acc, field) => {
  acc[field.name] = field.operation;
  return acc;
}, {});

// Construct a schema, using GraphQL schema language
const schemaString = `
type Query {
  ${fields.filter(field => field.query).map(field => field.query).join('\n  ')}
}
type Mutation {
  ${fields.filter(field => field.mutation).map(field => field.mutation).join('\n  ')}
}
`

console.log('GraphQL', schemaString)
const schema = buildSchema(schemaString);

const app = express();
app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);
const PORT = 1337
app.listen(PORT);
console.log(`Running a GraphQL API server at http://localhost:${PORT}/graphql`);

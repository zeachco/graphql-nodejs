const root = document.querySelector('#app');

const testQuery = `
  query {
      message
      quoteOfTheDay
      random
      rollDices(numDice:10, numSides:99)
  }
`;

const testMutation = `
  mutation {
      message(message: 'Salut')
  }
`;

const renderRoot = ({ data }) => {
  root.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
};

const options = {
  method: 'post',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: testQuery,
  }),
};

fetch(`/graphql`, options)
  .then((res) => res.json())
  .then(renderRoot);

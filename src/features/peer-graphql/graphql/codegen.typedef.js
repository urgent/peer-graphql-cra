const GraphQL = require('graphql')

module.exports = {
    plugin: (schema, documents, config) => {
        return `export default \`${GraphQL.printSchema(schema)}\``;
    }
};
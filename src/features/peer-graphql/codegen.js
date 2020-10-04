module.exports = {
    plugin: (schema, documents, config) => {

        const typesMap = schema.getTypeMap();

        const dict = {
            'String': 'string',
            'Int': 'number',
            'Float': 'number',
            'Boolean': 'boolean',
            'id': 'string',
        }

        const reduce = typesMap.Query.astNode.fields.reduce((acc, field) => {
            return `${acc}\n    t.record(t.literal('${field.name.value}'), t.${dict[field.type.name.value]}),`;
        }, '');

        return `import * as t from 'io-ts'\n\nexport const Query = t.union([${reduce}\n])`
            ;
    },
};
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
            if (field.type.hasOwnProperty('type')) {
                // custom graphql type
                return `${acc}\n  t.record(\n    t.literal('${field.name.value}'),\n    t.union([\n      ${typesMap[field.type.type.name.value]
                    .astNode.fields.map((field) =>
                        `t.record(t.literal('${field.name.value}'), t.${dict[field.type.name.value]})`
                    ).join(',\n      ')}\n    ])\n  )`
            }
            //scalar values only
            return `${acc}\n  t.record(t.literal('${field.name.value}'), t.${dict[field.type.name.value]}),`;
        }, '');

        return `import * as t from 'io-ts'\n\nexport const Query = t.union([${reduce}\n])`
            ;
    },
};
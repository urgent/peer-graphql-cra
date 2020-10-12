/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type ResponseQueryVariables = {
    hash?: string | null;
};
export type ResponseQueryResponse = {
    readonly response: ReadonlyArray<{
        readonly hash: string | null;
        readonly time: unknown | null;
    } | null> | null;
};
export type ResponseQuery = {
    readonly response: ResponseQueryResponse;
    readonly variables: ResponseQueryVariables;
};



/*
query ResponseQuery(
  $hash: String
) {
  response(hash: $hash) {
    hash
    time
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "hash"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "hash",
        "variableName": "hash"
      }
    ],
    "concreteType": "Response",
    "kind": "LinkedField",
    "name": "response",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "hash",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "time",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ResponseQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResponseQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "15d653bce579b268c6e27cbc9a34b798",
    "id": null,
    "metadata": {},
    "name": "ResponseQuery",
    "operationKind": "query",
    "text": "query ResponseQuery(\n  $hash: String\n) {\n  response(hash: $hash) {\n    hash\n    time\n  }\n}\n"
  }
};
})();
(node as any).hash = 'c1a0c7658665873ea89b2fb7aebd62df';
export default node;

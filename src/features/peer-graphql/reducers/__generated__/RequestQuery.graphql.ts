/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type RequestQueryVariables = {
    hash?: string | null;
};
export type RequestQueryResponse = {
    readonly response: ReadonlyArray<{
        readonly time: unknown | null;
    } | null> | null;
};
export type RequestQuery = {
    readonly response: RequestQueryResponse;
    readonly variables: RequestQueryVariables;
};



/*
query RequestQuery(
  $hash: String
) {
  response(hash: $hash) {
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
    "name": "RequestQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RequestQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "b5faed23d7d83fded29fe7f05d9a47ce",
    "id": null,
    "metadata": {},
    "name": "RequestQuery",
    "operationKind": "query",
    "text": "query RequestQuery(\n  $hash: String\n) {\n  response(hash: $hash) {\n    time\n  }\n}\n"
  }
};
})();
(node as any).hash = 'a97b74b826af9764bb4218885fedc1d4';
export default node;

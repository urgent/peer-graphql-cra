/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type RequestQueryVariables = {};
export type RequestQueryResponse = {
    readonly response: ReadonlyArray<{
        readonly hash: string | null;
        readonly time: unknown | null;
    } | null> | null;
};
export type RequestQuery = {
    readonly response: RequestQueryResponse;
    readonly variables: RequestQueryVariables;
};



/*
query RequestQuery {
  response {
    hash
    time
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
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
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RequestQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RequestQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "d5b31f29edeb9b4b9b7a8d48f07925f4",
    "id": null,
    "metadata": {},
    "name": "RequestQuery",
    "operationKind": "query",
    "text": "query RequestQuery {\n  response {\n    hash\n    time\n  }\n}\n"
  }
};
})();
(node as any).hash = 'd3583f85ca88348a285f18fa7312fd71';
export default node;

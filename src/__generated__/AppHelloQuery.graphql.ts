/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type AppHelloQueryVariables = {};
export type AppHelloQueryResponse = {
    readonly hello: string | null;
};
export type AppHelloQuery = {
    readonly response: AppHelloQueryResponse;
    readonly variables: AppHelloQueryVariables;
};



/*
query AppHelloQuery {
  hello
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "hello",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "AppHelloQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "AppHelloQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "59bf34e12cdf5629f7db045e3cf0920c",
    "id": null,
    "metadata": {},
    "name": "AppHelloQuery",
    "operationKind": "query",
    "text": "query AppHelloQuery {\n  hello\n}\n"
  }
};
})();
(node as any).hash = '48d6b504263572465edb4e9b19474bf3';
export default node;

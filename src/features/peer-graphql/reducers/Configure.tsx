import * as IOE from 'fp-ts/lib/IOEither'
import { flow } from 'fp-ts/lib/function'
import * as t from 'io-ts'
import { decode } from '../peer'
import { Reducer } from '../reducer'

const Configure = t.type({
  message: t.literal('configure'),
  hash: t.string
})

export type CFG = t.TypeOf<typeof Configure>

declare module '../reducer' {
  export interface Reducer {
    configure: (i: unknown) => IOE.IOEither<Error, void>
  }
  export interface URI2Type {
    configure: CFG
  }
}

export const configure = () => {}

Reducer.prototype.configure = flow(
  decode(Configure),
  IOE.fromEither,
  IOE.map<CFG, void>(configure)
)

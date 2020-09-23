import * as IOE from 'fp-ts/lib/IOEither'
import { flow } from 'fp-ts/lib/function'
import * as t from 'io-ts'
import { decode, Reducer } from '../utilities'

const Configure = t.type({
  message: t.literal('configure'),
  hash: t.string
})

export type CFG = t.TypeOf<typeof Configure>

export const configure = () => {}

declare module '../utilities' {
  export interface Reducer {
    configure: (i: unknown) => IOE.IOEither<Error, void>
  }
}

Reducer.prototype.configure = flow(
  decode(Configure),
  IOE.fromEither,
  IOE.map<CFG, void>(configure)
)

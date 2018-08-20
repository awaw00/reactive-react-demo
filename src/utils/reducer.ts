import produce, { Draft } from 'immer';
import { Action } from 'src/reactive-react';

export function immReducer<S, P = any> (updater: (payload: P) => (draftState: Draft<S>) => S | void) {
  return (state: S, {payload}: Action<P>) => produce(state, updater(payload));
}

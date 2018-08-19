import React from "react";
import nanoid from 'nanoid';
import isEqual from "lodash.isequal";
import { of, Subject, BehaviorSubject, Observable } from "rxjs";
import {
  filter,
  startWith,
  withLatestFrom,
  merge,
  map,
  tap,
  distinctUntilChanged
} from "rxjs/operators";

export interface IAction<T = any> {
  type: string;
  scope?: string;
  payload?: T;
}

export interface IReactiveProps<S, P> {
  scope?: string;
  props$?: Observable<P>;
  action$?: Subject<IAction>;
  state$?: BehaviorSubject<S>;
}

export type Reducer<T = any> = (state: T, action: IAction) => T;
export type ReducerOnAction<T = any> = (type: string) => (reducer: Reducer<T>) => void;
export type ReducerOnActionOfScope<T = any> = (scope?: string) => ReducerOnAction<T>;
export type Reducers<T = any, S = any> = (this: S, params: {on: ReducerOnAction<T>, onScope: ReducerOnActionOfScope<T>}) => void;

export type Effect<T = any> = (action$: Observable<IAction>) => Observable<T>;
export type EffectOnAction<T = any> = (type: string) => (effect: Effect<T>) => void;
export type EffectOnActionOfScope<T = any> = (scope?: string) => EffectOnAction<T>;
export type Effects<T = any, S = any> = (this: S, params: {on: EffectOnAction<T>, onScope: EffectOnActionOfScope<T>}) => void;

export type RenderRes = React.ReactNode | (() => (props?: any) => React.ReactNode);

export interface IReactiveComponentBase<SS, SP = {}, P extends IReactiveProps<SS, SP> = {}, S = {}> extends React.Component<P, S> {
  scope?: string;
  reducers?: () => {};
  effects?: () => {};
  state$: BehaviorSubject<SS>;
  action$: Subject<IAction>;
  dispatch: (action: IAction) => void;
}

interface IReducerRecord<T = any> {
  type: string;
  updator: Reducer<T>;
  scope?: string;
}

export function validateAction(action: IAction) {
  if (!action || typeof action.type !== "string") {
    throw new Error("invalid action: " + JSON.stringify(action));
  }
  return action;
}

const defaultAction$ = new Subject();

export const ActionContext = React.createContext(defaultAction$);

export type PropsWithAction$<P> = P & {action$?: Subject<IAction>};
export function withAction<P extends object>(Comp$: React.ComponentType<PropsWithAction$<P>>) {
  return (props: P) => (
    <ActionContext.Consumer>
      {action$ => <Comp$ action$={action$} {...props} />}
    </ActionContext.Consumer>
  );
}

export const ScopeContext = React.createContext('');

export type PropsWithScope<P> = P & {scope?: string};
export function withScope<P extends object>(Comp$: React.ComponentType<PropsWithScope<P>>) {
  return (props: PropsWithScope<P>) => {
    const {scope, ...restProps} = props as any;
    return (
      <ScopeContext.Consumer>
        {contextScope => {
          let currentScope = scope;
          if (contextScope) {
            currentScope = currentScope
              ? contextScope + "/" + currentScope
              : contextScope;
          }
          return <Comp$ scope={currentScope} {...restProps} />;
        }}
      </ScopeContext.Consumer>
    );
  };
}

export type RenderStream<SS, SP, P, S> = (this: IReactiveComponentBase<SS, SP, P, S>, stateAndProps: {state: SS, props: SP}) => React.ReactNode;
export type CreateInstanceStream<SS, SP, P, S> = (this: IReactiveComponentBase<SS, SP, P, S>) => Observable<any>;
export type ReactiveComponentLifecycle<SS, SP, P, S> = {
  [L in keyof React.ComponentLifecycle<P, S>]: (this: IReactiveComponentBase<SS, SP, P, S>, ...args: any[]) => any;
};
export interface ICreateComponentOptions<SS, SP, P, S> extends ReactiveComponentLifecycle<SS, SP, P, S> {
  withScope?: boolean;
  withAction?: boolean;
  streams?: {[name: string]: CreateInstanceStream<SS, SP, P, S>};
  methods?: {[name: string]: (this: IReactiveComponentBase<SS, SP, P, S>, ...args: any[]) => any};
  initialState: SS;
  reducers?: Reducers<SS, IReactiveComponentBase<SS, SP, P, S>>;
  effects?: Effects<SS, IReactiveComponentBase<SS, SP, P, S>>;
  render$?: RenderStream<SS, SP, P, S>;
  propTypes?: any;
  getDefaultProps?: () => P;
  getInitialState?: () => S;
  render?: () => React.ReactNode;
}

function shallowDiff (a: any, b: any, skipKeys?: string[]) {
  for (const i in a) {
    if (skipKeys && skipKeys.indexOf(i) >= 0) {
      continue;
    }
    if (!(i in b)) {
      return true;
    }
  }
  for (const i in b) {
    if (skipKeys && skipKeys.indexOf(i) >= 0) {
      continue;
    }
    if (a[i] !== b[i]) {
      return true;
    }
  }

  return false;
}

export function createComponent<SS, SP = {}, P extends IReactiveProps<SS, SP> = {scope?: string, props$?: Observable<SP>}, S = {}>(options: ICreateComponentOptions<SS, SP, P, S>) {
  const {
    withScope: isWithScope,
    withAction: isWithAction,
    streams,
    methods,
    initialState,
    reducers,
    effects,
    render$,
    propTypes,
    ...reactCreateClassOptions
  } = options;
  const {
    getDefaultProps,
    getInitialState,
    render: ignoredRender,
    ...instanceMethods
  } = reactCreateClassOptions;

  class ReactiveComponent extends React.Component<P, S> {
    public renderRes: RenderRes | null = null;
    public scope: string = '';
    public childScope: string = '';
    public action$: Subject<IAction>;
    public state$: BehaviorSubject<SS>;
    public update$: Observable<{state: SS, props: P}>;

    private render$: RenderStream<SS, SP, P, S>;

    constructor(props: P) {
      super(props);
      const { scope } = props;
      const childScope = scope || nanoid(6);
      const props$ = props.props$ as Observable<SP>;
      const state$ = props.state$ || new BehaviorSubject(initialState);
      const pureAction$ = props.action$ || new Subject();

      this.render$ = render$ ? render$.bind(this) : null;

      let action$ = pureAction$;

      if (!props.action$) {
        action$ = action$.pipe(map(validateAction)) as Subject<IAction>;
      }

      if (childScope) {
        action$ = action$.pipe(
          filter<IAction>(i => !i.scope || i.scope.indexOf(childScope) === 0)
        ) as Subject<IAction>;
      }

      let reducer: Reducer = () => void 0;
      if (reducers && initialState) {
        const reducerArr: IReducerRecord[] = [];
        const onScope: ReducerOnActionOfScope = actionScope => type => {
          if (actionScope && childScope) {
            actionScope = childScope + "/" + actionScope;
          }
          return updator => {
            reducerArr.push({
              type,
              scope: actionScope,
              updator
            });
          };
        };

        const on = onScope(void 0);

        reducers.bind(this)({ on, onScope });

        if (reducerArr.length > 0) {
          reducer = function (state = initialState, action) {
            for (const reducerRecord of reducerArr) {
              if (
                action.scope &&
                reducerRecord.scope &&
                action.scope.indexOf(reducerRecord.scope) !== 0
              ) {
                continue;
              }
              const caseType = reducerRecord.type;
              let match = false;
              if (Array.isArray(caseType)) {
                match = caseType.includes(action.type);
              } else {
                match = caseType === action.type;
              }

              if (match) {
                return reducerRecord.updator(state, action);
              }
            }

            return state;
          };
        }
      } else if (initialState) {
        reducer = function(state = initialState) {
          return state;
        };
      }

      if (effects) {
        const onScope: EffectOnActionOfScope = actionScope => type => {
          if (actionScope && childScope) {
            actionScope = childScope + "/" + actionScope;
          }
          return getEffectStream => {
            const effect$ = getEffectStream(
              action$.pipe(
                filter<IAction>(action => {
                  if (actionScope && (!action.scope || action.scope.indexOf(actionScope) !== 0)) {
                    return false;
                  }
                  if (Array.isArray(type)) {
                    return type.includes(action.type);
                  }
                  return type === action.type;
                })
              )
            );
            action$ = action$.pipe(merge(effect$)) as Subject<IAction>;
          };
        };
        const on = onScope();

        effects.bind(this)({ on, onScope });
      }

      interface IActionAndState {action: IAction, state: SS}
      let update$: Observable<any> | null = null;
      if (reducer) {
        update$ = action$.pipe(
          startWith<IAction>({ type: "@@INIT" }),
          withLatestFrom<IAction, SS, IActionAndState>(state$, (action, state) => ({ action, state })),
          map<IActionAndState, SS>(({ action, state }) => {
            return reducer(state, action);
          }),
          tap<SS>(state => state$.next(state))
        );
      }

      interface IPropsAndState {props?: SP, state?: SS}
      if (props$) {
        if (update$) {
          update$ = props$.pipe(
            withLatestFrom<SP, SS, IPropsAndState>(update$, (props, state) => ({state, props}))
          );
        } else {
          update$ = props$.pipe(map<SP, IPropsAndState>((props) => ({props})));
        }
      } else {
        if (update$) {
          update$ = update$.pipe(map(state => ({state})));
        } else {
          update$ = of({ state: {}, props: {} });
        }
      }

      update$ = (update$ as Observable<any>).pipe(distinctUntilChanged(isEqual));

      this.scope = scope || '';
      this.childScope = childScope;
      this.update$ = update$;
      this.action$ = pureAction$;
      this.state$ = state$;

      if (typeof getInitialState === 'function') {
        this.state = getInitialState();
      }

      let subscriber: {unsubscribe: () => any} | null = null;
      const subscribeRerender = () => {
        if (update$) {
          subscriber = update$.subscribe(({ state, props }) => {
            this.renderRes = this.render$ ? this.render$({ state, props }) : null;
            this.forceUpdate();
          });
        }
      };

      for (const name in instanceMethods) {
        if (instanceMethods.hasOwnProperty(name)) {
          this[name] = instanceMethods[name].bind(this);
        }
      }

      if (streams) {
        for (const name in streams) {
          if (streams.hasOwnProperty(name)) {
            this[name] = streams[name].bind(this)();
          }
        }
      }

      if (methods) {
        for (const name in methods) {
          if (methods.hasOwnProperty(name)) {
            this[name] = methods[name].bind(this);
          }
        }
      }

      const componentDidMount = this.componentDidMount;
      this.componentDidMount = () => {
        if (componentDidMount) {
          componentDidMount();
        }
        subscribeRerender();
      };

      const componentWillUnmount = this.componentWillUnmount;
      this.componentWillUnmount = () => {
        if (componentWillUnmount) {
          componentWillUnmount();
        }
        if (subscriber) {
          subscriber.unsubscribe();
        }
      };

      const shouldComponentUpdate = this.shouldComponentUpdate as any;
      this.shouldComponentUpdate = (nextProps, nextState) => {
        const diff = shallowDiff(this.props, nextProps, ['action$', 'props$']) || shallowDiff(this.state, nextState);
        if (diff && shouldComponentUpdate) {
          return shouldComponentUpdate(nextProps, nextState);
        }

        return diff;
      };
    }

    public dispatch = (action: IAction) => {
      if (this.scope) {
        action.scope = this.scope;
      }
      this.action$.next(action);
    };

    public render() {
      let finalRes;
      if (typeof this.renderRes === "function") {
        finalRes = this.renderRes();
      } else {
        finalRes = this.renderRes;
      }
      finalRes = finalRes || null;

      if (this.childScope) {
        finalRes = (
          <ScopeContext.Provider value={this.childScope}>
            {finalRes}
          </ScopeContext.Provider>
        );
      }
      if (!isWithAction) {
        finalRes = (
          <ActionContext.Provider value={this.action$}>
            {finalRes}
          </ActionContext.Provider>
        );
      }

      return finalRes;
    }
  }

  let Comp$: React.ComponentType<P> = ReactiveComponent;
  if (isWithScope) {
    Comp$ = withScope<P>(Comp$);
  }
  if (isWithAction) {
    Comp$ = withAction<P>(Comp$);
  }

  if (typeof getDefaultProps === "function") {
    Comp$.defaultProps = getDefaultProps();
  }
  if (propTypes) {
    Comp$.propTypes = propTypes;
  }

  return Comp$;
}

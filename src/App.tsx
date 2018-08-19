import React from "react";
import {
  map,
} from "rxjs/operators";
import produce from "immer";
import {
  IReactiveProps,
  createComponent,
} from "./reactive-react";

interface ITestState {
  name: string;
  nameCustom: string;
}

interface IProps extends IReactiveProps<ITestState, any> {
  test: string;
}
const Test = createComponent<ITestState, any, IProps>({
  withAction: true,
  // withScope: true,
  getDefaultProps () {
    return {
      test: '123'
    };
  },
  initialState: {
    name: "joke",
    nameCustom: ""
  },
  reducers: ({ on, onScope }) => {
    on("CHANGE_NAME")((state, { payload }) =>
      produce(state, d => {
        d.name = payload.name;
      })
    );
    on("CHANGE_NAME_CUSTOM")((state, { payload }) =>
      produce(state, d => {
        d.nameCustom = payload.name;
      })
    );
    onScope("child")("ON_CLICK")((state, { payload }) =>
      produce(state, d => {
        d.name = "";
      })
    );
  },
  streams: {
    propsA$() {
      return this.state$.pipe(map(s => ({ name: s.name, tag: "A" })));
    },
    propsB$() {
      return this.state$.pipe(map(s => ({ name: s.nameCustom, tag: "B" })));
    }
  },
  methods: {
    changeNameToMike () {
      this.dispatch({ type: "CHANGE_NAME", payload: { name: "mike" } })
    },
    changeNameCustom (e: any) {
      this.dispatch({type: 'CHANGE_NAME_CUSTOM', payload: {name: e.target.value}});
    }
  },
  render$({ state, props }) {
    return (
      <div>
        <Child props$={this['propsA$']} scope="child" />
        <Child props$={this['propsB$']} />
        <p>
          <button
            onClick={this['changeNameToMike']}
          >
            Change joke's name to mike
          </button>
        </p>
        <p>
          <input
            value={state.nameCustom}
            onChange={this['changeNameCustom']}
          />
        </p>
      </div>
    );
  }
});

interface IChildState {
  msg: string;
}
interface IChildProps {
  name: string;
}
const Child = createComponent<IChildState, IChildProps>({
  withScope: true,
  withAction: true,
  initialState: {
    msg: "hello"
  },
  methods: {
    click () {
      this.dispatch({ type: "ON_CLICK" });
    }
  },
  render$({ state, props }) {
    return (
      <div onClick={this['click']}>
        {state.msg}, {props.name}
      </div>
    );
  }
});

export default Test;

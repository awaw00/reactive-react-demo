import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Subject } from "rxjs";
import App from './App';
import './index.css';

import { ActionContext } from './reactive-react';
import registerServiceWorker from './registerServiceWorker';

const action$ = new Subject();

action$.subscribe(action => console.log("action", action));

ReactDOM.render(
  <div>
    <ActionContext.Provider value={action$}>
      <div>
        <App test="123"/>
      </div>
    </ActionContext.Provider>
  </div>,
  document.getElementById("root")
);
registerServiceWorker();

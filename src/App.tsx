import React from 'react';
import AMapComponent from './components/AMap';
import {
  createComponent,
} from './reactive-react';

const App = createComponent({
  withScope: true,
  withAction: true,
  render$ () {
    return (
      <div>
        <AMapComponent/>
      </div>
    );
  },
});

export default App;

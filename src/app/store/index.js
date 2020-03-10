import { createStore } from 'redux';
import reducer from './reducer';

// const coposeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOST__ || compose;

export default createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

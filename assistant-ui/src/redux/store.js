import {combineReducers, createStore} from 'redux';

const storeEnhancer = () => {
  if (
    process.env.NODE_ENV === 'development' &&
    // eslint-disable-next-line no-undef
    window.__REDUX_DEVTOOLS_EXTENSION__
  ) {
    // eslint-disable-next-line no-undef
    return window.__REDUX_DEVTOOLS_EXTENSION__();
  }
};

const appReducer = combineReducers({});

// noinspection JSDeprecatedSymbols
export const store = createStore(appReducer, storeEnhancer());

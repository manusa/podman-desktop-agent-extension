import {
  CRUD_ADD_OR_REPLACE_ALL,
  CRUD_DELETE_MATCHING,
  CRUD_SET,
  CRUD_SET_ALL
} from './';

export const crudReducer =
  kind =>
  (state = {}, action) => {
    if (action.kind !== kind) {
      return state;
    }
    switch (action.type) {
      case CRUD_ADD_OR_REPLACE_ALL: {
        const newState = {...state};
        action.payload.forEach(item => {
          newState[item.id] = item;
        });
        return newState;
      }
      case CRUD_DELETE_MATCHING: {
        const newState = {...state};
        Object.keys(newState).forEach(id => {
          if (action.idRegex.test(id)) {
            delete newState[id];
          }
        });
        return newState;
      }
      case CRUD_SET: {
        const newState = {...state};
        newState[action.payload.id] = action.payload;
        return newState;
      }
      case CRUD_SET_ALL: {
        const newState = {...state};
        // replace existent items
        action.payload.forEach(item => {
          newState[item.id] = item;
        });
        // remove items that are not in the new list
        Object.keys(newState).forEach(id => {
          if (!action.payload.find(item => item.id === id)) {
            delete newState[id];
          }
        });
        return newState;
      }
      default: {
        return {...state};
      }
    }
  };

export const CRUD_ADD_OR_REPLACE_ALL = 'CRUD_ADD_OR_REPLACE_ALL';
export const CRUD_DELETE_MATCHING = 'CRUD_DELETE_MATCHING';
export const CRUD_SET = 'CRUD_SET';
export const CRUD_SET_ALL = 'CRUD_SET_ALL';

export const crudAddOrReplaceAll =
  ({kind, payloadTransformer}) =>
  payload => {
    if (payloadTransformer) {
      payload = payloadTransformer(payload);
    }
    return {type: CRUD_ADD_OR_REPLACE_ALL, kind, payload};
  };

export const crudDeleteMatching =
  ({kind, idRegex}) =>
  () => ({
    type: CRUD_DELETE_MATCHING,
    kind,
    idRegex
  });

export const crudSet =
  ({kind, payloadTransformer}) =>
  payload => {
    if (payloadTransformer) {
      payload = payloadTransformer(payload);
    }
    return {type: CRUD_SET, kind, payload};
  };

export const crudSetAll =
  ({kind, payloadTransformer}) =>
  payload => {
    if (payloadTransformer) {
      payload = payloadTransformer(payload);
    }
    return {type: CRUD_SET_ALL, kind, payload};
  };

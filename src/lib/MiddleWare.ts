export const actionTypes = {
  SET_VALIDATIONS: "@@REDUX_STATE_VALIDATION/SET_VALIDATIONS"
} as const;

const META_VALID_KEY = "@@REDUX_STATE_VALIDATION/HAS_INVALID_STATE";

const metaData = {
  [META_VALID_KEY]: true
} as const;

export const validateActionCreater = () => ({
  meta: metaData,
  type: actionTypes.SET_VALIDATIONS
});

export function createMiddleware() {
  return ({ dispatch }) => next => action => {
    const result = next(action);
    if (!action.meta || !action.meta[META_VALID_KEY]) {
      dispatch(validateActionCreater());
    }
    return result;
  };
}

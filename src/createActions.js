import createAction from './createAction';

export default function(actions, opts) {
  if (typeof actions !== 'object')
    throw new Error('actions argument should be an object');

  const createdActions = {};

  Object.keys(actions).forEach(actionName => {
    createdActions[actionName] = createAction(actions[actionName], opts);
  });

  return createdActions;
}

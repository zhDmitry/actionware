import getActionName from './getActionName';
import { Action } from './types';
import { Store } from './types';
import { TrackedAction } from './types';
import { NAME_PREFIX } from './constants';
import { ERROR_TYPE_SUFFIX } from './constants';
import { BUSY_TYPE_SUFFIX } from './constants';
import { getStore } from './storeKeeper';
import { rejectWaiters } from './next';
import { resolveWaiters } from './next';
import { notifyErrorListeners } from './listeners';
import { notifyBusyListeners } from './listeners';
import { notifySuccessListeners } from './listeners';

export default function createAction(
  action: Action,
  { prefix, name: customActionName } = {}
): TrackedAction {
  if (typeof action !== 'function')
    throw new Error('Action must be a function');

  if (action._trackedAction) return action;

  const trackedAction = function(...args) {
    const store: Store = getStore();
    const handleError = handleActionError.bind(null, action, args);

    try {
      const actionResponse = action.apply(null, [...args, store]);
      const isAsync = actionResponse instanceof Promise;

      if (isAsync) {
        handleActionBusy(action, args);

        return actionResponse.then(
          payload => handleActionSuccess(action, payload),
          err => Promise.reject(handleError(err))
        );
      }

      return handleActionSuccess(action, actionResponse);
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const actionName = getActionName(
    // if prefix exist add it else leave prefix empty if custom name provided
    prefix ? prefix : customActionName ? '' : NAME_PREFIX,
    customActionName || action.name,
    action
  );

  console.log(actionName, customActionName, prefix, 'name', action.name);
  trackedAction._successType = actionName;
  trackedAction._busyType = actionName + BUSY_TYPE_SUFFIX;
  trackedAction._errorType = actionName + ERROR_TYPE_SUFFIX;

  action._trackedAction = trackedAction;
  console.log('action', action);

  return action;
}

export function handleActionSuccess(action: Action, payload) {
  const store: Store = getStore();

  store.dispatch({
    trackedAction: action._trackedAction,
    type: action._trackedAction._successType,
    payload
  });
  notifySuccessListeners(action, payload, [store]);
  notifyBusyListeners(action, false, [store, payload]);
  resolveWaiters(action, payload);

  return payload;
}

export function handleActionBusy(action: Action, args) {
  const store: Store = getStore();
  store.dispatch({
    trackedAction: action._trackedAction,
    type: action._trackedAction._busyType,
    payload: true,
    args
  });

  notifyBusyListeners(action, true, [store, ...args]);
}

export function handleActionError(action: Action, args, error: Error) {
  const store: Store = getStore();

  const payload = { error, args, actionwareError: true };

  store.dispatch({
    trackedAction: action._trackedAction,
    type: action._trackedAction._errorType,
    payload
  });

  notifyErrorListeners(action, error, args);
  rejectWaiters(action, error);

  return error;
}

export function errorType(action: Action) {
  return action._trackedAction._errorType;
}

export function successType(action: Action) {
  return action._trackedAction._successType;
}

export function busyType(action: Action) {
  return action._trackedAction._busyType;
}

import React from 'react';
import createActions from './createActions';

function getDisplayName(wrappedComponent) {
  const wrapperName =
    wrappedComponent.displayName || wrappedComponent.name || 'Component';
  return `withActions(${wrapperName})`;
}

export function withActions(actions = {}, prefix) {
  const act = createActions(actions, { prefix });
  const trackedActions = Object.keys(act).reduce((acc, el) => {
    acc[el] = act[el]._trackedAction;
    return acc;
  }, {});

  return (WrappedComponent: any) => {
    const withActions = (props: object) => (
      <WrappedComponent {...props} {...trackedActions} />
    );
    withActions.displayName = getDisplayName(WrappedComponent);
    return withActions;
  };
}

import { Action } from './types';
const actionNames: any = {};

export default function (prefix: string, name: string = 'anonymous', action: Action): string {
  let existingIndex = -1;

  if (!actionNames.hasOwnProperty(name)) {
    actionNames[ name ] = [ action ];
    existingIndex = 0;
  } else {
    existingIndex = actionNames[ name ].findIndex(it => it === action);
  }

  if (existingIndex === -1) {
    existingIndex = actionNames[ name ].length;
    actionNames[ name ].push(action);
  }

  return existingIndex === 0
    ? prefix + name
    : prefix + name + '_' + (existingIndex + 1);
}
import {twMerge} from 'tailwind-merge';

const clsx = classes => {
  let ret = '';
  for (const className of classes) {
    if (className) {
      if (Array.isArray(className)) {
        ret += clsx(className);
      } else if (typeof className === 'string') {
        ret += (className && ' ') + className;
      }
    }
  }
  return ret;
};

export const cn = (...inputs) => {
  return twMerge(clsx(inputs));
};

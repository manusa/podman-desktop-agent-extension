import {forwardRef} from 'react';
import {Fallback, Image, Root} from '@radix-ui/react-avatar';
import {cn} from './';

export const Avatar = forwardRef(({className, ...props}, ref) => {
  return (
    <Root
      ref={ref}
      className={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
        className
      )}
      {...props}
    />
  );
});

export const AvatarImage = forwardRef(({className, ...props}, ref) => (
  <Image
    ref={ref}
    className={cn('aspect-square h-full w-full', className)}
    {...props}
  />
));

export const AvatarFallback = forwardRef(({className, ...props}, ref) => (
  <Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted',
      className
    )}
    {...props}
  />
));

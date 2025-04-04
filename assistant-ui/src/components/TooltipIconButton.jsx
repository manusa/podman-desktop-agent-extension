import {forwardRef} from 'react';
import {
  Button,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
  cn,
  Tooltip
} from './';

export const TooltipIconButton = forwardRef(
  ({children, tooltip, side = 'bottom', className = '', ...rest}, ref) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              {...rest}
              className={cn('size-6 p-1', className)}
              ref={ref}
            >
              {children}
              <span className='sr-only'>{tooltip}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side={side}>{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

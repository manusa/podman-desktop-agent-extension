import {useState} from 'react';
import {CheckIcon, ChevronDownIcon, ChevronUpIcon} from 'lucide-react';
import {Button} from './Button.jsx';

export const ToolFallback = ({toolName, argsText, result}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const toggleCollapsed = () => setIsCollapsed(!isCollapsed);
  return (
    <div className='mb-4 flex w-full flex-col gap-3 rounded-lg border py-3'>
      <div className='flex items-center gap-2 px-4'>
        <CheckIcon className='size-4' />
        <p>
          Used tool: <strong>{toolName}</strong>
        </p>
        <div className='flex-grow' />
        <Button onClick={toggleCollapsed}>
          {isCollapsed ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </Button>
      </div>
      {!isCollapsed && (
        <div className='flex flex-col gap-2 border-t pt-2'>
          <p className='font-semibold'>Args:</p>
          <div className='px-4'>
            <pre className='whitespace-pre-wrap text-sm'>{argsText}</pre>
          </div>
          {result && (
            <div className='border-t border-dashed px-4 pt-2'>
              <p className='font-semibold'>Result:</p>
              <pre className='whitespace-pre-wrap text-sm'>
                {typeof result === 'string'
                  ? result
                  : JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

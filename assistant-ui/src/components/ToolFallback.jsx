import {useState} from 'react';
import {CheckIcon, ChevronDownIcon, ChevronUpIcon} from 'lucide-react';
import {Button} from './';

export const ToolFallback = ({toolName, argsText, result}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const toggleCollapsed = () => setIsCollapsed(!isCollapsed);
  return (
    <div
      className='aui-tool-fallback'
      data-state={isCollapsed ? 'closed' : 'open'}
    >
      <div className='aui-tool-fallback__summary flex items-center gap-2 px-4'>
        <CheckIcon className='size-4' />
        <p>
          Used tool: <strong>{toolName}</strong>
        </p>
        <div className='flex-grow' />
        <Button onClick={toggleCollapsed}>
          {isCollapsed ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </Button>
      </div>
      <div className='aui-tool-fallback__detail'>
        <div className='px-4'>
          <p className='font-semibold'>Args:</p>
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
    </div>
  );
};

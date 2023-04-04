import {
  ChangeEvent,
  ChangeEventHandler,
  MutableRefObject,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

interface InlineEditableProps {
  initialText: string;
  //return false to reject the edit
  onConfirm: (value: string, isMouse: boolean) => Promise<boolean>;
  className?: string;
  editing: boolean;
}

export default function InlineEditable(props: InlineEditableProps) {
  const [text, setText] = useState<string>(props.initialText);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shadowRef = useRef<HTMLInputElement>(null);

  const [originalText, setOriginalText] = useState<string>(props.initialText);

  const handleFinishEdit = (isMouse: boolean) => {
    //run the onConfirm async
    const promise = props.onConfirm(text,isMouse);

    //if the value was edited as expected then 
    //set the original text otherwise revert
    //the edit. 
    promise.then((success) => {
      if(success) {
        setOriginalText(text);
      } else {
        setText(originalText);
      }
    })
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
    if (inputRef.current && props.editing) {
      if (shadowRef.current) {
        const newWidth = shadowRef.current.offsetWidth + 40; // Calculate the new width based on the text length
        inputRef.current.style.width = `${newWidth}px`; // Apply the new width to the input element
      }
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleFinishEdit(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!props.editing) return;

      if (ref.current && !ref.current.contains(event.target as Node)) {
        // User clicked outside of the component, so we can handle it here
        // Pass the syntheticEvent to the onConfirm function
        handleFinishEdit(true);
      }
    };

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Unbind the event listener on cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, props]);
  /* Clicking outside of an editable should close it and save the value */

  return (
    <div ref={ref}>
      {props.editing ? (
        <>
          <input
            ref={inputRef}
            className={props.className}
            type="text"
            value={text}
            onChange={onChange}
            onKeyDown={onKeyDown}
            autoFocus={true}
          />
          {/* Add the shadow element */}
          <div className="editable-shadow" ref={shadowRef}>
            {text}
          </div>
        </>
      ) : (
        <p className={props.className}>{text}</p>
      )}
    </div>
  );
}

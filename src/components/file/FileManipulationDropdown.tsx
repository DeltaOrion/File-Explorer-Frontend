import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactElement, useEffect, useRef, useState } from "react";

interface FileManipulationDropdownProps {
    elements: ManipulationElement[];
    button: (onClicked: () => void) => ReactElement;
    className?: string;
}

//we could furthur abstract this component to make a generic dropdown 
//with items and buttons but we all g
export default function FileManipulationDropdown(props: FileManipulationDropdownProps) {
    const [open, setOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      // function to handle clicks outside of dropdown
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setOpen(false);
        }
      };
      // add event listener to document
      document.addEventListener('mousedown', handleClickOutside);
      // cleanup function to remove event listener
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [dropdownRef]);
  
    const onClicked = () => {
      setOpen(!open);
    };
  
    let dropdownDisplay = "none";
    if (open) {
      dropdownDisplay = "inline-block";
    }

    return (
        <div className="dropdown" ref={dropdownRef}>

            {/* Button which opens the dropdown */}
            {props.button(onClicked)}

            <div className="dropdown-container" style={{ display: dropdownDisplay }}>
                {props.elements.map((element, index, arr) => {
                    return (
                        <FileManipulationElement key={index} manipulationElement={element} setOpen={setOpen} />
                    );
                })}
            </div>
        </div>
    )
}

interface FileManipulationProps {
    manipulationElement: ManipulationElement;
    setOpen(open: boolean): void;
}

function FileManipulationElement(props: FileManipulationProps) {

    const onClicked = () => {
        props.setOpen(false);
        props.manipulationElement.action();
    }

    return (
        <div className="dropdown-element" onClick={onClicked}>
            <FontAwesomeIcon className="dropdown-icon" icon={props.manipulationElement.icon} />
            <p className="dropdown-text">{props.manipulationElement.name}</p>
        </div>
    )
}

export interface ManipulationElement {
    action(): void;
    name: string;
    icon: IconProp;
}
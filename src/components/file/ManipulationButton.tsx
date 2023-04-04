import { ReactElement } from "react";

interface ManipulationButtonProps {
    onClick: () => void;
    backgroundColor: string;
    children: string | ReactElement;
}


export default function ManipulationButton(props: ManipulationButtonProps) {
    return (
        <button className="manipulation-button" onClick={props.onClick} style={{ backgroundColor: props.backgroundColor }} >
            {props.children}
        </ button>
    );
}
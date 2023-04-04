import { Link } from "react-router-dom";

interface PathProps {
    path: string[],
}

export default function PathDisplay(props: PathProps) {

    let builtPath = "";
    let i = 0;

    return (
        <p className='path-text'>
            <Link to="" key={"root"}>/</Link>
            {/* Loop through all part of working directory and make a link with it */
                
                props.path.map((part, index, arr) => {
                    builtPath += part + "/";
                    return (
                        <>
                            <Link key={i} to={builtPath}>{part}</Link>
                            {i < props.path.length - 1 ? '/' : ''}
                        </>
                    );
                    i++;
                })}

        </p>
    )
}
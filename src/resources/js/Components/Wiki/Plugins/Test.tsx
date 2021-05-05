import React from "react";

interface Props {
    hello: string;
}

const Test: React.FC<Props> = ({ hello }: Props) => {
    return (
        <>
            <h1>This is a custom plugin</h1>

            <p>Hello: {hello}</p>
        </>
    );
};

export default Test;

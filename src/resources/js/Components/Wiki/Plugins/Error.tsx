import React from "react";
import { Alert } from "reactstrap";

interface Props {
    message: string;
}

const Error: React.FC<Props> = ({ message }: Props) => {
    return (
        <>
            <Alert color="danger">{message}</Alert>
        </>
    );
};

export default Error;

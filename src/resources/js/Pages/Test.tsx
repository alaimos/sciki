import React from "react";
import { InertiaLink } from "@inertiajs/inertia-react";
import route from "ziggy-js";

interface Props {
    hello: string;
}

const Test: React.FC<Props> = ({ hello }: Props) => {
    return (
        <div>
            <h1>Welcome</h1>

            <h2>{hello}</h2>

            <p>
                <InertiaLink href={route("test1")}>Test</InertiaLink>
            </p>
            <p>
                <InertiaLink href={route("home")}>Test1</InertiaLink>
            </p>
        </div>
    );
};

export default Test;

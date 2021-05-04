import React, { useRef } from "react";
import {
    Form,
    FormGroup,
    InputGroupAddon,
    InputGroupText,
    Input,
    InputGroup,
} from "reactstrap";
import { Inertia } from "@inertiajs/inertia";
import route from "ziggy-js";

interface Props {
    sidebar?: boolean;
}

const Search: React.FC<Props> = ({ sidebar }: Props) => {
    const textRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (textRef.current) {
            Inertia.get(
                route(
                    "wiki.show",
                    textRef.current.value.toLowerCase().replaceAll(/\s+/g, "-")
                ),
                undefined,
                {
                    onSuccess: () => {
                        if (textRef.current) {
                            textRef.current.value = "";
                        }
                    },
                }
            );
        }
    };

    return (
        <>
            {!sidebar && (
                <Form
                    className="navbar-search navbar-search-dark form-inline mr-3 d-none d-md-flex ml-lg-auto"
                    onSubmit={onSubmit}
                >
                    <FormGroup className="mb-0">
                        <InputGroup className="input-group-alternative">
                            <InputGroupAddon addonType="prepend">
                                <InputGroupText>
                                    <i className="fas fa-search" />
                                </InputGroupText>
                            </InputGroupAddon>
                            <Input
                                placeholder="Search"
                                type="text"
                                innerRef={textRef}
                            />
                        </InputGroup>
                    </FormGroup>
                </Form>
            )}
            {sidebar && (
                <Form className="mt-4 mb-3 d-md-none" onSubmit={onSubmit}>
                    <InputGroup className="input-group-rounded input-group-merge">
                        <Input
                            aria-label="Search"
                            className="form-control-rounded form-control-prepended"
                            placeholder="Search"
                            type="search"
                            innerRef={textRef}
                        />
                        <InputGroupAddon addonType="prepend">
                            <InputGroupText>
                                <span className="fa fa-search" />
                            </InputGroupText>
                        </InputGroupAddon>
                    </InputGroup>
                </Form>
            )}
        </>
    );
};

export default Search;

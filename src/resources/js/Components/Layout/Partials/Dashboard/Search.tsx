import React, { useEffect, useRef, useState } from "react";
import {
    Form,
    FormGroup,
    InputGroupAddon,
    InputGroupText,
    InputGroup,
} from "reactstrap";
import { Inertia } from "@inertiajs/inertia";
import route from "ziggy-js";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import axios from "axios";

interface Props {
    sidebar?: boolean;
}

type TypeAheadOption = {
    id: string;
    label: string;
    page?: boolean;
};

const Search: React.FC<Props> = ({ sidebar }: Props) => {
    const typeaheadRef = useRef<AsyncTypeahead<TypeAheadOption>>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchValue, setSearchValue] = useState<TypeAheadOption[]>([]);
    const [searchResults, setSearchResults] = useState<TypeAheadOption[]>([]);

    const handleTypeaheadSearch = async (query: string) => {
        setIsLoading(true);
        try {
            const response = await axios.post(route("wiki.typeahead"), {
                query,
            });
            setSearchResults(response.data as TypeAheadOption[]);
        } catch (_) {
            setSearchResults([]);
        }
        setIsLoading(false);
    };

    const handleTypeaheadSelection = (e?: React.FormEvent<HTMLFormElement>) => {
        if (e) e.preventDefault();
        if (searchValue && searchValue.length > 0 && searchValue[0]) {
            const selectedSearchResult = searchValue[0];
            if (selectedSearchResult.page) {
                setSearchValue([]);
                return Inertia.get(
                    route("wiki.show", selectedSearchResult.id),
                    undefined,
                    {
                        onSuccess: () => {
                            // @ts-ignore
                            typeaheadRef.current?.clear();
                        },
                    }
                );
            } else {
                setSearchValue([]);
                return Inertia.post(
                    route("wiki.search"),
                    {
                        query: selectedSearchResult.id,
                    },
                    {
                        onSuccess: () => {
                            // @ts-ignore
                            typeaheadRef.current?.clear();
                        },
                    }
                );
            }
        }
        return undefined;
    };

    useEffect(() => {
        if (searchValue && searchValue.length > 0 && searchValue[0]) {
            handleTypeaheadSelection();
        }
    }, [searchValue, handleTypeaheadSelection]);

    // const textRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    // const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    //     e.preventDefault();
    //     if (textRef.current) {
    //         Inertia.get(
    //             route(
    //                 "wiki.show",
    //                 textRef.current.value.toLowerCase().replaceAll(/\s+/g, "-")
    //             ),
    //             undefined,
    //             {
    //                 onSuccess: () => {
    //                     if (textRef.current) {
    //                         textRef.current.value = "";
    //                     }
    //                 },
    //             }
    //         );
    //     }
    // };

    return (
        <>
            {!sidebar && (
                <Form
                    className="navbar-search navbar-search-dark form-inline mr-3 d-none d-md-flex ml-lg-auto"
                    onSubmit={handleTypeaheadSelection}
                >
                    <FormGroup className="mb-0">
                        <InputGroup className="input-group-alternative">
                            <InputGroupAddon addonType="prepend">
                                <InputGroupText>
                                    <i className="fas fa-search" />
                                </InputGroupText>
                            </InputGroupAddon>
                            <AsyncTypeahead
                                id="sciki-header-typeahead"
                                filterBy={() => true}
                                isLoading={isLoading}
                                options={searchResults}
                                onSearch={handleTypeaheadSearch}
                                onChange={(selected: TypeAheadOption[]) =>
                                    setSearchValue(selected)
                                }
                                onKeyDown={(e) => {
                                    const re =
                                        e as unknown as React.KeyboardEvent<HTMLInputElement>;
                                    if (re.code === "Enter") {
                                        // @ts-ignore
                                        const query = re.target.value;
                                        Inertia.post(
                                            route("wiki.search"),
                                            {
                                                query,
                                            },
                                            {
                                                onSuccess: () => {
                                                    // @ts-ignore
                                                    typeaheadRef.current?.clear();
                                                },
                                            }
                                        );
                                    }
                                }}
                                selected={searchValue}
                                minLength={3}
                                placeholder="Search"
                                ref={typeaheadRef}
                            />
                        </InputGroup>
                    </FormGroup>
                </Form>
            )}
            {sidebar && (
                <Form
                    className="mt-4 mb-3 d-md-none"
                    // onSubmit={onSubmit}
                >
                    <InputGroup className="input-group-rounded input-group-merge">
                        <AsyncTypeahead
                            id="sciki-header-typeahead"
                            className="form-control-rounded form-control-prepended flex-grow-1"
                            filterBy={() => true}
                            isLoading={isLoading}
                            options={searchResults}
                            onSearch={handleTypeaheadSearch}
                            onChange={(selected: TypeAheadOption[]) =>
                                setSearchValue(selected)
                            }
                            onKeyDown={(e) => {
                                const re =
                                    e as unknown as React.KeyboardEvent<HTMLInputElement>;
                                if (re.code === "Enter") {
                                    // @ts-ignore
                                    const query = re.target.value;
                                    Inertia.post(
                                        route("wiki.search"),
                                        {
                                            query,
                                        },
                                        {
                                            onSuccess: () => {
                                                // @ts-ignore
                                                typeaheadRef.current?.clear();
                                            },
                                        }
                                    );
                                }
                            }}
                            selected={searchValue}
                            minLength={3}
                            placeholder="Search"
                            ref={typeaheadRef}
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

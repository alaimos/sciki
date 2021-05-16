import React, { useRef, useState } from "react";
import {
    Badge,
    Card,
    CardBody,
    CardHeader,
    Col,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Row,
} from "reactstrap";
import classNames from "classnames";
import { AsyncTypeahead } from "react-bootstrap-typeahead";

import "react-bootstrap-typeahead/css/Typeahead.css";
import axios from "axios";
import route from "ziggy-js";

interface Props {
    tags: string[];
    errors?: string;
    onAddTag: (newTag: string) => void;
    onDeleteTag: (deletedTag: string) => void;
    dark?: boolean;
}

type TypeAheadOption =
    | string
    | {
          customOption: boolean;
          label: string;
          id: string;
      };

const TagsManagerCard: React.FC<Props> = ({
    tags,
    errors,
    onAddTag,
    onDeleteTag,
    dark = true,
}: Props) => {
    const typeAheadRef = useRef<AsyncTypeahead<TypeAheadOption>>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [tagInputValue, setTagInputValue] = useState<TypeAheadOption[]>([]);
    const [tagInputOptions, setTagInputOptions] = useState<string[]>([]);

    const getTextTag = (values: TypeAheadOption[]) => {
        if (values.length > 0) {
            if (typeof values[0] === "object") {
                return values[0].label;
            } else if (typeof values[0] === "string") {
                return values[0];
            }
        }
        return undefined;
    };

    const doAddTag = (newTag?: string) => {
        if (newTag) {
            const newTagParts = newTag.split(/:\s*/, 2);
            onAddTag(
                newTagParts.length === 1
                    ? `unknown: ${newTagParts[0]}`
                    : newTagParts.join(": ")
            );
            // @ts-ignore
            typeAheadRef.current?.clear();
        }
    };

    const handleSearch = async (query: string) => {
        setIsLoading(true);
        try {
            const response = await axios.post(route("tag.typeahead"), {
                query,
            });
            setTagInputOptions(response.data as string[]);
        } catch (_) {
            setTagInputOptions([]);
        }
        setIsLoading(false);
    };

    return (
        <Card
            className={classNames({ "bg-gradient-dark": dark, shadow: true })}
        >
            <CardHeader className="bg-transparent">
                <h6 className="text-uppercase text-light ls-1 mb-1">Tags</h6>
            </CardHeader>
            <CardBody>
                <Row>
                    <Col style={{ height: "100px" }} className="overflow-auto">
                        {tags.map((tag) => (
                            <Badge
                                key={tag}
                                className="badge-default mx-1 text-light"
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onDeleteTag(tag);
                                }}
                                title="Click to delete"
                            >
                                {tag}
                            </Badge>
                        ))}
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {!!errors && (
                            <div className="invalid-feedback d-block">
                                <strong>{errors}</strong>
                            </div>
                        )}
                    </Col>
                </Row>
                <Row className="mt-2">
                    <Col>
                        <InputGroup>
                            <AsyncTypeahead<TypeAheadOption>
                                filterBy={() => true}
                                id="tags-manager-add-tag-input"
                                isLoading={isLoading}
                                options={tagInputOptions}
                                onSearch={handleSearch}
                                onChange={(selected: TypeAheadOption[]) =>
                                    setTagInputValue(selected)
                                }
                                onKeyDown={(e) => {
                                    const re =
                                        e as unknown as React.KeyboardEvent<HTMLInputElement>;
                                    if (
                                        re.code === "Enter" ||
                                        re.code === "NumpadEnter"
                                    ) {
                                        // @ts-ignore
                                        doAddTag(re.target.value);
                                        // @ts-ignore
                                        typeAheadRef.current?.clear();
                                    }
                                }}
                                selected={tagInputValue}
                                minLength={3}
                                className="text-dark"
                                placeholder="Add new tag (category: tag)"
                                ref={typeAheadRef}
                                allowNew
                            />
                            <InputGroupAddon addonType="append">
                                <InputGroupText>
                                    <a
                                        className="text-primary"
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            doAddTag(getTextTag(tagInputValue));
                                        }}
                                    >
                                        <i className="fas fa-plus" />
                                    </a>
                                </InputGroupText>
                            </InputGroupAddon>
                        </InputGroup>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default TagsManagerCard;

import React, { useRef } from "react";
import Header from "../../Components/Layout/Headers/DefaultHeader";
import {
    Badge,
    Card,
    CardBody,
    CardHeader,
    Col,
    Container,
    Form,
    FormGroup,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Label,
    Nav,
    NavItem,
    NavLink,
    Row,
} from "reactstrap";
import { Nullable } from "../../Types/common";
import { useForm } from "@inertiajs/inertia-react";
import classNames from "classnames";
import Editor from "../../Components/Wiki/Editor";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import "@uppy/image-editor/dist/style.min.css";
import MediaManager, { Media } from "../../Components/Wiki/MediaManager";

interface Props {
    page: {
        slug: string;
        title: string;
        content: string;
        draft: boolean;
    };
    formatted_tags: string[];
    simulation: Nullable<unknown>;
    media: Record<string, Media>;
}

const Index: React.FC<Props> = ({
    page: { slug, title, content, draft },
    formatted_tags: tags,
    simulation,
    media,
}: Props) => {
    const newTagRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    //put, processing
    const { data, setData, errors } = useForm({
        title,
        content,
        tags,
        media,
        deletedMedia: [] as string[],
    });
    console.log([simulation, data.media]);

    const handleAddTag = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (newTagRef.current && newTagRef.current.value) {
            const newTagParts = newTagRef.current.value.split(/:\s*/, 2);
            const finalTagWithCategory =
                newTagParts.length === 1
                    ? `unknown: ${newTagParts[0]}`
                    : newTagParts.join(": ");
            setData((previousData) => ({
                ...previousData,
                tags: [
                    ...previousData.tags.filter(
                        (t) => t !== finalTagWithCategory
                    ),
                    finalTagWithCategory,
                ],
            }));
            newTagRef.current.value = "";
        }
    };

    const handleRemoveTag = (tag: string) =>
        setData((previousData) => ({
            ...previousData,
            tags: previousData.tags.filter((t) => t !== tag),
        }));

    return (
        <Form>
            <Header
                title={
                    <FormGroup
                        className={classNames("align-items-center", {
                            "has-danger": !!errors.title,
                        })}
                        row
                    >
                        <Label
                            for="page-title"
                            sm="auto"
                            className="text-light"
                        >
                            Title:
                        </Label>
                        <Col sm="auto" className="flex-grow-1">
                            <Input
                                className="form-control-alternative bg-light text-dark"
                                type="text"
                                invalid={!!errors.title}
                                value={data.title}
                                onChange={(e) =>
                                    setData("title", e.target.value)
                                }
                            />
                        </Col>
                    </FormGroup>
                }
            />
            <Container className="mt--7" fluid>
                <Row className="mb-2">
                    <Col lg={12} className="text-right">
                        <Nav
                            className="nav-fill flex-column-reverse flex-sm-row-reverse"
                            pills
                        >
                            {draft && (
                                <NavItem className="ml-2 flex-grow-0">
                                    <NavLink
                                        className="mb-sm-3 mb-md-0 text-green"
                                        onClick={(e) => e.preventDefault()}
                                        href="#"
                                    >
                                        <i className="fas fa-upload mr-2" />
                                        Publish
                                    </NavLink>
                                </NavItem>
                            )}
                            {!draft && (
                                <NavItem className="ml-2 flex-grow-0">
                                    <NavLink
                                        className="mb-sm-3 mb-md-0 text-orange"
                                        onClick={(e) => e.preventDefault()}
                                        href="#"
                                    >
                                        <i className="fas fa-pencil-alt mr-2" />
                                        Revert to Draft
                                    </NavLink>
                                </NavItem>
                            )}
                            <NavItem className="flex-grow-0">
                                <NavLink
                                    className="mb-sm-3 mb-md-0"
                                    onClick={(e) => e.preventDefault()}
                                    href="#"
                                >
                                    <i className="fas fa-save mr-2" />
                                    Save
                                </NavLink>
                            </NavItem>
                        </Nav>
                    </Col>
                </Row>
                <Row>
                    <Col className="mb-5 mb-xl-2" xl="8">
                        <Card className="shadow">
                            <CardHeader className="bg-transparent">
                                <h6 className="text-uppercase text-dark ls-1 mb-1">
                                    Content
                                </h6>
                            </CardHeader>
                            <CardBody>
                                <Editor
                                    value={content}
                                    onChange={(newContent) =>
                                        setData("content", newContent)
                                    }
                                />
                            </CardBody>
                        </Card>
                    </Col>
                    <Col className="mb-5 mb-xl-2" xl="4">
                        <Card className="bg-gradient-dark shadow">
                            <CardHeader className="bg-transparent">
                                <h6 className="text-uppercase text-light ls-1 mb-1">
                                    Tags
                                </h6>
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    <Col
                                        style={{ height: "100px" }}
                                        className="overflow-auto"
                                    >
                                        {data.tags.map((tag) => (
                                            <Badge
                                                key={tag}
                                                className="badge-default mx-1 text-light"
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleRemoveTag(tag);
                                                }}
                                                title="Click to delete"
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                    </Col>
                                </Row>
                                <Row className="mt-2">
                                    <Col>
                                        <InputGroup>
                                            <Input
                                                className="text-dark"
                                                placeholder="Add new tag (category: tag)"
                                                autoComplete="edit-page-new-tag"
                                                innerRef={newTagRef}
                                            />
                                            <InputGroupAddon addonType="append">
                                                <InputGroupText>
                                                    <a
                                                        className="text-primary"
                                                        href="#"
                                                        onClick={handleAddTag}
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
                    </Col>
                </Row>
                <MediaManager
                    currentPageSlug={slug}
                    media={data.media}
                    deletedMedia={data.deletedMedia}
                    onMediaSelect={(m) => console.log(m)}
                    onMediaUpdate={(updatedMedia) => {
                        setData((previousData) => {
                            const tmpData = {
                                ...previousData,
                                media: {
                                    ...previousData.media,
                                },
                            };
                            tmpData.media[updatedMedia.uuid] = updatedMedia;
                            return tmpData;
                        });
                    }}
                    onMediaUpload={(newMedia) =>
                        setData((previousData) => ({
                            ...previousData,
                            media: {
                                ...previousData.media,
                                [newMedia.uuid]: newMedia,
                            },
                        }))
                    }
                    onMediaDelete={(uuid) =>
                        setData((previousData) => ({
                            ...previousData,
                            deletedMedia: [...previousData.deletedMedia, uuid],
                        }))
                    }
                />
            </Container>
        </Form>
    );
};

export default Index;

import React from "react";
import Header from "../../Components/Layout/Headers/DefaultHeader";
import {
    Card,
    CardBody,
    Col,
    Container,
    ListGroup,
    ListGroupItem,
    Pagination,
    PaginationItem,
    PaginationLink,
    Row,
} from "reactstrap";
import type { Collection } from "../../Types/common";
import route from "ziggy-js";
import { InertiaLink } from "@inertiajs/inertia-react";
import classNames from "classnames";

interface Page {
    id: number;
    slug: string;
    title: string;
    content: string;
    tags: string[];
}

interface Tag {
    id: number;
    tag: string;
    name: string;
    type: string;
}

interface Props {
    tag: { data: Tag };
    pages: Collection<Page>;
}

const SearchByTag: React.FC<Props> = ({
    tag: {
        data: { tag },
    },
    pages,
}: Props) => {
    return (
        <>
            <Header title={`Pages for "${tag}"`} />
            <Container className="mt--7" fluid>
                <Card className="shadow mb-2">
                    <CardBody>
                        <Row>
                            <Col>
                                {pages.data.length === 0 && (
                                    <>
                                        <p>
                                            There are no results matching the
                                            tag.
                                        </p>
                                    </>
                                )}
                                {pages.data.length > 0 && (
                                    <>
                                        <ListGroup flush>
                                            {pages.data.map((p) => (
                                                <ListGroupItem
                                                    key={p.slug}
                                                    href={route(
                                                        "wiki.show",
                                                        p.slug
                                                    )}
                                                    tag={InertiaLink}
                                                >
                                                    {p.title}
                                                </ListGroupItem>
                                            ))}
                                        </ListGroup>
                                    </>
                                )}
                            </Col>
                        </Row>
                        {pages.data.length > 0 && (
                            <Row>
                                <Col className="text-sm text-muted" xs="6">
                                    Showing results from {pages.meta.from} to{" "}
                                    {pages.meta.to} of {pages.meta.total}
                                </Col>
                                <Col xs="6">
                                    <Pagination
                                        className="pagination justify-content-end"
                                        listClassName="justify-content-end"
                                    >
                                        {pages.meta.links.map(
                                            ({ active, label, url }, index) => (
                                                <PaginationItem
                                                    key={index}
                                                    className={classNames({
                                                        disabled: !active,
                                                    })}
                                                >
                                                    <PaginationLink
                                                        tag={InertiaLink}
                                                        href={url ?? "#"}
                                                        as="button"
                                                        method="post"
                                                        dangerouslySetInnerHTML={{
                                                            __html: label,
                                                        }}
                                                    />
                                                </PaginationItem>
                                            )
                                        )}
                                    </Pagination>
                                </Col>
                            </Row>
                        )}
                    </CardBody>
                </Card>
            </Container>
        </>
    );
};

export default SearchByTag;

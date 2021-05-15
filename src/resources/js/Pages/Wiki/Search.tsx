import React from "react";
import Header from "../../Components/Layout/Headers/DefaultHeader";
import {
    Card,
    CardBody,
    CardHeader,
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
    query: string;
    pages: Collection<Page>;
    tags: Collection<Tag>;
    can: {
        create: boolean;
    };
}

const Search: React.FC<Props> = ({ query, pages, tags, can }: Props) => {
    return (
        <>
            <Header title={`Search results for "${query}"`} />
            <Container className="mt--7" fluid>
                <Card className="shadow mb-2">
                    <CardHeader className="bg-transparent">
                        <h6 className="text-uppercase text-dark ls-1 mb-1">
                            Pages containing your query
                        </h6>
                    </CardHeader>
                    <CardBody>
                        <Row>
                            <Col>
                                {pages.data.length === 0 && (
                                    <>
                                        <p>
                                            There were no results matching your
                                            query.
                                        </p>
                                        {can.create && (
                                            <p>
                                                If you wish to create the page
                                                &quot;
                                                <a
                                                    href={route(
                                                        "wiki.show",
                                                        query
                                                    )}
                                                    className="text-red"
                                                >
                                                    {query}
                                                </a>
                                                &quot; click{" "}
                                                <a
                                                    href={route(
                                                        "wiki.show",
                                                        query
                                                    )}
                                                >
                                                    here
                                                </a>
                                                .
                                            </p>
                                        )}
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
                                                        data={{ query }}
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
                <Card className="shadow">
                    <CardHeader className="bg-transparent">
                        <h6 className="text-uppercase text-dark ls-1 mb-1">
                            Tags corresponding with your query
                        </h6>
                    </CardHeader>
                    <CardBody>
                        <Row>
                            <Col>
                                {tags.data.length === 0 && (
                                    <p>
                                        There were no results matching your
                                        query.
                                    </p>
                                )}
                                {tags.data.length > 0 && (
                                    <>
                                        <ListGroup flush>
                                            {tags.data.map((t) => (
                                                <ListGroupItem
                                                    key={t.id}
                                                    href={route(
                                                        "wiki.show",
                                                        t.id
                                                    )}
                                                    tag={InertiaLink}
                                                >
                                                    {t.tag}
                                                </ListGroupItem>
                                            ))}
                                        </ListGroup>
                                    </>
                                )}
                            </Col>
                        </Row>
                        {tags.data.length > 0 && (
                            <Row>
                                <Col className="text-sm text-muted" xs="6">
                                    Showing results from {tags.meta.from} to{" "}
                                    {tags.meta.to} of {tags.meta.total}
                                </Col>
                                <Col xs="6">
                                    <Pagination
                                        className="pagination justify-content-end"
                                        listClassName="justify-content-end"
                                    >
                                        {tags.meta.links.map(
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
                                                        data={{ query }}
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

export default Search;

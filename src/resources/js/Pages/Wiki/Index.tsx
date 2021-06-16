import React from "react";
import Header from "../../Components/Layout/Headers/DefaultHeader";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import { CommonPageProps } from "../../Types/page";
import { Media } from "../../Components/Wiki/MediaManager";
import { InertiaLink } from "@inertiajs/inertia-react";
import route from "ziggy-js";

interface Props extends CommonPageProps {
    featuredPage: { slug: string };
    featuredPageImage?: Media;
    featuredPagePreview: string;
    lastCreatedPage: { slug: string };
    lastCreatedPageImage?: Media;
    lastCreatedPagePreview: string;
    lastUpdatedPage: { slug: string };
    lastUpdatedPageImage?: Media;
    lastUpdatedPagePreview: string;
}

const Index: React.FC<Props> = (props: Props) => {
    console.log(props);
    return (
        <>
            <Header title="Welcome to SciKi" />
            <Container className="mt--7" fluid>
                <Row className="mt-2">
                    <Col md="6">
                        <Card className="shadow">
                            <CardHeader>
                                <h6 className="text-uppercase text-dark ls-1 mb-1">
                                    Featured post
                                </h6>
                            </CardHeader>
                            <CardBody>
                                {!!props.featuredPageImage && (
                                    <img
                                        src={
                                            props.featuredPageImage.thumbs.large
                                        }
                                        alt={props.featuredPageImage.legend}
                                        className="rounded float-left mr-1 mb-1 shadow d-none d-md-block"
                                    />
                                )}
                                <div
                                    className="text-justify"
                                    dangerouslySetInnerHTML={{
                                        __html: props.featuredPagePreview,
                                    }}
                                />
                                <div>
                                    <InertiaLink
                                        href={route(
                                            "wiki.show",
                                            props.featuredPage.slug
                                        )}
                                    >
                                        See more...
                                    </InertiaLink>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md="6"></Col>
                </Row>
            </Container>
        </>
    );
};

export default Index;

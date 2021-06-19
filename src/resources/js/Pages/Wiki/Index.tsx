import React from "react";
import Header from "../../Components/Layout/Headers/DefaultHeader";
import { Col, Container, Row } from "reactstrap";
import { CommonPageProps } from "../../Types/page";
import { Media } from "../../Components/Wiki/MediaManager";
import PagePreviewCard from "../../Components/Common/PagePreviewCard";

interface Props extends CommonPageProps {
    featuredPage?: { slug: string };
    featuredPageImage?: Media;
    featuredPagePreview: string;
    lastCreatedPage?: { slug: string };
    lastCreatedPageImage?: Media;
    lastCreatedPagePreview: string;
    lastUpdatedPage?: { slug: string };
    lastUpdatedPageImage?: Media;
    lastUpdatedPagePreview: string;
}

const Index: React.FC<Props> = (props: Props) => {
    return (
        <>
            <Header title="Welcome to SciKi" />
            <Container className="mt--7" fluid>
                <Row className="mt-2">
                    {props.featuredPage && (
                        <Col
                            md={
                                props.lastUpdatedPage
                                    ? 6
                                    : { offset: 3, size: 6 }
                            }
                        >
                            <PagePreviewCard
                                title="Featured post"
                                page={props.featuredPage}
                                previewText={props.featuredPagePreview}
                                previewImage={props.featuredPageImage}
                            />
                        </Col>
                    )}
                    {props.lastUpdatedPage && (
                        <Col
                            md={props.featuredPage ? 6 : { offset: 3, size: 6 }}
                        >
                            <PagePreviewCard
                                title="Latest update"
                                page={props.lastUpdatedPage}
                                previewText={props.lastUpdatedPagePreview}
                                previewImage={props.lastUpdatedPageImage}
                                dark
                            />
                        </Col>
                    )}
                </Row>
                {props.lastCreatedPage && (
                    <Row className="mt-2">
                        <Col md={{ offset: 3, size: 6 }}>
                            <PagePreviewCard
                                title="Latest page"
                                page={props.lastCreatedPage}
                                previewText={props.lastCreatedPagePreview}
                                previewImage={props.lastCreatedPageImage}
                            />
                        </Col>
                    </Row>
                )}
            </Container>
        </>
    );
};

export default Index;

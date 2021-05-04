import React from "react";
import Header from "../../Components/Layout/Headers/DefaultHeader";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import { Helmet } from "react-helmet";
import { InertiaLink, usePage } from "@inertiajs/inertia-react";
import { Page } from "@inertiajs/inertia";
import { CommonPageProps } from "../../Types/page";
// import {InertiaLink} from "@inertiajs/inertia-react";
// import route from "ziggy-js";

interface Props {
    slug: string;
    title: string;
    draft: boolean;
    can: {
        create: boolean;
        update: boolean;
    };
}

const PageNotFound: React.FC<Props> = ({
    title,
    draft: pageIsDraft,
    can: { create: userCanCreate, update: userCanUpdate },
}: Props) => {
    const {
        auth: { check: userIsLoggedIn },
    } = usePage<Page<CommonPageProps>>().props;
    return (
        <>
            <Helmet>
                <title>{title}</title>
            </Helmet>
            <Header title={title} />
            <Container className="mt--7" fluid>
                {!pageIsDraft && userIsLoggedIn && userCanCreate && (
                    <Row className="mb-2">
                        <Col lg={12} className="text-right">
                            <InertiaLink
                                href="/"
                                className="text-white text-underline"
                            >
                                Create
                            </InertiaLink>
                        </Col>
                    </Row>
                )}
                <Card className="shadow">
                    <CardBody>
                        <p>
                            SciKi does not contain an article with this exact
                            name. Please search for &quot;{title}&quot; in SciKi
                            to check for alternative titles or spellings.
                        </p>
                        {pageIsDraft && (
                            <>
                                {userIsLoggedIn && !userCanUpdate && (
                                    <p>
                                        There is a draft for this article but
                                        you are not allowed to modify it.
                                    </p>
                                )}
                                {userIsLoggedIn && userCanUpdate && (
                                    <p>
                                        There is a draft for this article. Click
                                        on the edit link to modify it.
                                    </p>
                                )}
                                {!userIsLoggedIn && (
                                    <p>
                                        You cannot create this article. You may
                                        need to log in as an editor to start
                                        this page.
                                    </p>
                                )}
                            </>
                        )}
                        {!pageIsDraft && (
                            <>
                                {(!userIsLoggedIn || !userCanCreate) && (
                                    <p>
                                        You cannot create this article. You may
                                        need to log in as an editor to start
                                        this page.
                                    </p>
                                )}
                                {userIsLoggedIn && userCanCreate && (
                                    <p>
                                        No draft is available for this article.
                                        Click on the &quot;Create&quot; link to
                                        create it.
                                    </p>
                                )}
                            </>
                        )}
                    </CardBody>
                </Card>
            </Container>
        </>
    );
};

export default PageNotFound;

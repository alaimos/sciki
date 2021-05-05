import React, { useEffect, useState } from "react";
import Header from "../../Components/Layout/Headers/DefaultHeader";
import {
    Card,
    CardBody,
    Col,
    Container,
    Nav,
    NavItem,
    NavLink,
    Row,
} from "reactstrap";
import { Helmet } from "react-helmet";
import { usePage } from "@inertiajs/inertia-react";
import { Inertia, Page as InertiaPage } from "@inertiajs/inertia";
import { CommonPageProps } from "../../Types/page";
import route from "ziggy-js";

interface CustomContent {
    key: string;
    component: string;
    props: Record<string, unknown>;
    content: string;
}

interface Props {
    slug: string;
    page: {
        id: number;
        slug: string;
        title: string;
    };
    content: CustomContent[];
    draft: boolean;
    can: {
        create: boolean;
        update: boolean;
        delete: boolean;
    };
}

const Page: React.FC<Props> = ({
    page: { slug: pageSlug, title },
    content,
    can: { update: userCanUpdate, delete: userCanDelete },
}: Props) => {
    const {
        auth: { check: userIsLoggedIn },
    } = usePage<InertiaPage<CommonPageProps>>().props;
    const [processedContent, setProcessedContent] = useState<React.ReactNode[]>(
        []
    );
    const userCanUpdateOrDelete = userCanUpdate || userCanDelete;
    const handleDelete = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (confirm("Do you really want to delete this page?")) {
            return Inertia.delete(route("page.destroy", pageSlug));
        }
        return;
    };
    const handleEdit = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        return Inertia.get(route("page.edit", pageSlug));
    };

    useEffect(() => {
        if (!content) return;
        content.forEach((component) => {
            const { component: componentName, key, props } = component;
            if (!componentName) return;
            const isPlugin = componentName.startsWith("Plugins/");
            import(
                `./../../Components/Wiki/${isPlugin ? componentName : "Html"}`
            )
                .then(({ default: reactComponent }) => {
                    setProcessedContent((oldContent) => [
                        ...oldContent,
                        React.createElement(
                            reactComponent,
                            {
                                key,
                                ...props,
                            },
                            null
                        ),
                    ]);
                })
                .catch((e) => console.error(e));
        });
    }, [content, setProcessedContent]);

    return (
        <>
            <Helmet>
                <title>{title}</title>
            </Helmet>
            <Header title={title} />
            <Container className="mt--7" fluid>
                {userIsLoggedIn && userCanUpdateOrDelete && (
                    <Row className="mb-2">
                        <Col lg={12} className="text-right">
                            <Nav
                                className="nav-fill flex-column-reverse flex-sm-row-reverse"
                                pills
                            >
                                {userCanDelete && (
                                    <NavItem className="ml-2 flex-grow-0">
                                        <NavLink
                                            className="mb-sm-3 mb-md-0 text-danger"
                                            onClick={handleDelete}
                                            href="#"
                                        >
                                            <i className="fas fa-trash mr-2" />
                                            Delete
                                        </NavLink>
                                    </NavItem>
                                )}
                                {userCanUpdate && (
                                    <NavItem className="flex-grow-0">
                                        <NavLink
                                            className="mb-sm-3 mb-md-0"
                                            onClick={handleEdit}
                                            href="#"
                                        >
                                            <i className="fas fa-pencil-alt mr-2" />
                                            Edit
                                        </NavLink>
                                    </NavItem>
                                )}
                            </Nav>
                        </Col>
                    </Row>
                )}
                <Card className="shadow">
                    <CardBody>{processedContent}</CardBody>
                </Card>
            </Container>
        </>
    );
};

export default Page;

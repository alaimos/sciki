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
    Spinner,
} from "reactstrap";
import { Helmet } from "react-helmet";
import { usePage } from "@inertiajs/inertia-react";
import { Inertia, Page as InertiaPage } from "@inertiajs/inertia";
import { CommonPageProps } from "../../Types/page";
import route from "ziggy-js";
import { pluginRegex } from "../../Common/pluginResolver";
// @ts-ignore
import LoadingOverlay from "react-loading-overlay";

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
    const [isLoading, setIsLoading] = useState(false);
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
        (async () => {
            setIsLoading(true);
            const newContent: React.ReactNode[] = new Array(content.length);
            newContent.fill(undefined);
            for (let i = 0; i < content.length; i++) {
                const { component: componentName, key, props } = content[i];
                if (componentName) {
                    try {
                        let importedModule;
                        if (componentName.startsWith("#")) {
                            const cleanedName = componentName.replace(/^#/, "");
                            importedModule = await import(
                                `./../../Components/Wiki/Plugins/${cleanedName}`
                            );
                        } else if (!componentName.startsWith("@")) {
                            importedModule = await import(
                                `./../../Components/Wiki/Html`
                            );
                        } else {
                            const match = componentName.match(pluginRegex);
                            if (!match) {
                                console.error(`Syntax error: ${componentName}`);
                                continue;
                            }
                            const plugin = match[1];
                            const path = match[2].replace(/^\//, "");
                            importedModule = await import(
                                `./../../Modules/${plugin}/WikiPlugins/${path}`
                            );
                        }
                        const { default: reactComponent } = importedModule;
                        newContent[i] = React.createElement(
                            reactComponent,
                            {
                                key,
                                ...props,
                            },
                            null
                        );
                    } catch (e) {
                        console.error(e);
                    }
                }
                setProcessedContent(newContent.filter((c) => !!c));
            }
            setIsLoading(false);
        })().catch((e) => console.error(e));
    }, [content, setProcessedContent]);

    return (
        <>
            <Helmet>
                <title>{title}</title>
            </Helmet>
            <Header title={title} />
            <Container className="mt--7" fluid>
                <Row className="mb-2">
                    <Col lg={12} className="text-right">
                        <Nav
                            className="nav-fill flex-column-reverse flex-sm-row-reverse"
                            pills
                        >
                            {userIsLoggedIn && userCanUpdateOrDelete && (
                                <>
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
                                        <NavItem className="ml-2 flex-grow-0">
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
                                </>
                            )}
                            <NavItem className="ml-2 flex-grow-0">
                                <NavLink
                                    className="mb-sm-3 mb-md-0"
                                    onClick={(e) => e.preventDefault()}
                                    href="#"
                                >
                                    <i className="fas fa-comments mr-2" />
                                    Comments
                                </NavLink>
                            </NavItem>
                            <NavItem className="ml-2 flex-grow-0">
                                <NavLink
                                    className="mb-sm-3 mb-md-0"
                                    onClick={(e) => e.preventDefault()}
                                    href="#"
                                >
                                    <i className="fas fa-history mr-2" />
                                    History
                                </NavLink>
                            </NavItem>
                        </Nav>
                    </Col>
                </Row>
                <LoadingOverlay
                    active={isLoading}
                    spinner={<Spinner color="light" className="mr-2" />}
                    text="Rendering..."
                >
                    <Card className="shadow">
                        <CardBody>{processedContent}</CardBody>
                    </Card>
                </LoadingOverlay>
            </Container>
        </>
    );
};

export default Page;

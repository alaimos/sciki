import React, { useEffect, useState } from "react";
import { Card, CardBody, NavItem, NavLink, Spinner } from "reactstrap";
import { InertiaLink } from "@inertiajs/inertia-react";
import { CommonPageProps } from "../../Types/page";
import route from "ziggy-js";
import { pluginRegex } from "../../Common/pluginResolver";
// @ts-ignore
import LoadingOverlay from "react-loading-overlay";
import WikiPageHeader from "../../Components/Wiki/WikiPageHeader";

interface CustomContent {
    key: string;
    component: string;
    props: Record<string, unknown>;
    content: string;
}

interface Props extends CommonPageProps {
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
    auth: { check: userIsLoggedIn },
    page: { slug: pageSlug, title },
    content,
    can: { update: userCanUpdate, delete: userCanDelete },
}: Props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [processedContent, setProcessedContent] = useState<React.ReactNode[]>(
        []
    );

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
        <WikiPageHeader
            userIsLoggedIn={userIsLoggedIn}
            pageSlug={pageSlug}
            title={title}
            userCanUpdate={userCanUpdate}
            userCanDelete={userCanDelete}
            customNavButtons={[
                <NavItem className="ml-2 flex-grow-0" key="wiki.comments.index">
                    <NavLink
                        className="mb-sm-3 mb-md-0"
                        tag={InertiaLink}
                        href={route("wiki.comments", pageSlug)}
                    >
                        <i className="fas fa-comments mr-2" />
                        Comments
                    </NavLink>
                </NavItem>,
                <NavItem
                    className="ml-2 flex-grow-0"
                    key="wiki.revisions.index"
                >
                    <NavLink
                        className="mb-sm-3 mb-md-0"
                        tag={InertiaLink}
                        href={route("wiki.revisions.index", pageSlug)}
                    >
                        <i className="fas fa-history mr-2" />
                        History
                    </NavLink>
                </NavItem>,
            ]}
        >
            <LoadingOverlay
                active={isLoading}
                spinner={<Spinner color="light" className="mr-2" />}
                text="Rendering..."
            >
                <Card className="shadow">
                    <CardBody>{processedContent}</CardBody>
                </Card>
            </LoadingOverlay>
        </WikiPageHeader>
    );
};

export default Page;

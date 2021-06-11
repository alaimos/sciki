import React from "react";
import { Card, CardBody, NavItem, NavLink } from "reactstrap";
import { CommonPageProps } from "../../Types/page";
import route from "ziggy-js";
import { InertiaLink } from "@inertiajs/inertia-react";
import ReactDiffViewer from "react-diff-viewer";
import WikiPageHeader from "../../Components/Wiki/WikiPageHeader";

interface Review {
    id: number;
    old_value: string;
    new_value: string;
}

interface Props extends CommonPageProps {
    slug: string;
    title: string;
    revision: Review;
    current_content: string;
    draft: boolean;
    can: {
        create: boolean;
        update: boolean;
        delete: boolean;
    };
}

const Page: React.FC<Props> = ({
    auth: { check: userIsLoggedIn },
    slug: pageSlug,
    title,
    revision,
    current_content,
    can: { update: userCanUpdate, delete: userCanDelete },
}: Props) => {
    return (
        <WikiPageHeader
            userIsLoggedIn={userIsLoggedIn}
            pageSlug={pageSlug}
            title={`Diff of ${title}`}
            userCanUpdate={userCanUpdate}
            userCanDelete={userCanDelete}
            customNavButtons={[
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
            <Card className="shadow">
                <CardBody>
                    <ReactDiffViewer
                        oldValue={revision.old_value}
                        newValue={current_content}
                        splitView={true}
                    />
                </CardBody>
            </Card>
        </WikiPageHeader>
    );
};

export default Page;

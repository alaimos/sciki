import React from "react";
import {
    Card,
    CardBody,
    NavItem,
    NavLink,
    Table,
    UncontrolledTooltip,
} from "reactstrap";
import { CommonPageProps } from "../../Types/page";
import route from "ziggy-js";
import { InertiaLink } from "@inertiajs/inertia-react";
import WikiPageHeader from "../../Components/Wiki/WikiPageHeader";

interface Review {
    id: number;
    key: string;
    description: string;
    responsible: string;
    created_at: string;
}

interface Props extends CommonPageProps {
    slug: string;
    title: string;
    history: Review[];
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
    history,
    can: { update: userCanUpdate, delete: userCanDelete },
}: Props) => {
    return (
        <WikiPageHeader
            userIsLoggedIn={userIsLoggedIn}
            pageSlug={pageSlug}
            title={`Revision history of ${title}`}
            userCanUpdate={userCanUpdate}
            userCanDelete={userCanDelete}
            customNavButtons={[
                <NavItem className="ml-2 flex-grow-0" key="wiki.show">
                    <NavLink
                        className="mb-sm-3 mb-md-0"
                        tag={InertiaLink}
                        href={route("wiki.show", pageSlug)}
                    >
                        <i className="fas fa-eye mr-2" />
                        Current Revision
                    </NavLink>
                </NavItem>,
            ]}
        >
            <Card className="shadow">
                <CardBody>
                    <Table className="align-items-center" responsive>
                        <thead className="thead-light">
                            <tr>
                                <th scope="col">Responsible</th>
                                <th scope="col">Description</th>
                                <th scope="col">Updated at</th>
                                <th scope="col">&nbsp;</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((h) => (
                                <tr key={h.id}>
                                    <th scope="row">{h.responsible}</th>
                                    <td>{h.description}</td>
                                    <td>{h.created_at}</td>
                                    <td>
                                        {h.key === "content" ? (
                                            <>
                                                <InertiaLink
                                                    id={`view-link-${h.id}`}
                                                    href={route(
                                                        "wiki.revisions.show",
                                                        [pageSlug, h.id]
                                                    )}
                                                    className="btn btn-sm btn-link"
                                                >
                                                    <i className="fas fa-eye" />
                                                </InertiaLink>
                                                <UncontrolledTooltip
                                                    placement="auto"
                                                    target={`view-link-${h.id}`}
                                                >
                                                    View
                                                </UncontrolledTooltip>
                                            </>
                                        ) : undefined}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </CardBody>
            </Card>
        </WikiPageHeader>
    );
};

export default Page;

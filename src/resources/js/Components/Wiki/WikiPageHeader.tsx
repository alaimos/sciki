import React, { ReactNode } from "react";
import Header from "../../Components/Layout/Headers/DefaultHeader";
import { Col, Container, Nav, NavItem, NavLink, Row } from "reactstrap";
import { Helmet } from "react-helmet";
import { Inertia } from "@inertiajs/inertia";
import route from "ziggy-js";

interface Props {
    userIsLoggedIn: boolean;
    pageSlug: string;
    title: string;
    customNavButtons?: ReactNode[];
    children?: ReactNode;
    userCanUpdate: boolean;
    userCanDelete: boolean;
}

const WikiPageHeader: React.FC<Props> = ({
    userIsLoggedIn,
    pageSlug,
    title,
    children,
    customNavButtons,
    userCanUpdate,
    userCanDelete,
}: Props) => {
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
                            {customNavButtons}
                        </Nav>
                    </Col>
                </Row>
                {children}
            </Container>
        </>
    );
};

export default WikiPageHeader;

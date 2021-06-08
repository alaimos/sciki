import React from "react";
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
    Table,
} from "reactstrap";
import { Helmet } from "react-helmet";
import { Inertia } from "@inertiajs/inertia";
import { CommonPageProps } from "../../Types/page";
import route from "ziggy-js";
import { InertiaLink } from "@inertiajs/inertia-react";

interface Review {
    id: number;
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
    console.log(history);
    return (
        <>
            <Helmet>
                <title>Revision history of {title}</title>
            </Helmet>
            <Header title={`Revision history of ${title}`} />
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
                                    tag={InertiaLink}
                                    href={route("wiki.show", pageSlug)}
                                >
                                    <i className="fas fa-eye mr-2" />
                                    Current Revision
                                </NavLink>
                            </NavItem>
                        </Nav>
                    </Col>
                </Row>
                <Card className="shadow">
                    <CardBody>
                        <Table className="align-items-center" responsive>
                            <thead className="thead-light">
                                <tr>
                                    <th scope="col">Responsible</th>
                                    <th scope="col">Description</th>
                                    <th scope="col">Updated at</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((h) => (
                                    <tr key={h.id}>
                                        <th scope="row">{h.responsible}</th>
                                        <td>{h.description}</td>
                                        <td>{h.created_at}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </CardBody>
                </Card>
            </Container>
        </>
    );
};

export default Page;

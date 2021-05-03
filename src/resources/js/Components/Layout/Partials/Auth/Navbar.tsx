import React from "react";
import {
    UncontrolledCollapse,
    Navbar as ReactstrapNavbar,
    NavItem,
    NavLink,
    Nav,
    Container,
    Row,
    Col,
} from "reactstrap";
import NavbarBrand from "../Common/NavbarBrand";
import { InertiaLink } from "@inertiajs/inertia-react";
import route from "ziggy-js";

const Navbar: React.FC = () => {
    return (
        <>
            <ReactstrapNavbar
                className="navbar-top navbar-horizontal navbar-dark"
                expand="md"
            >
                <Container className="px-4">
                    <NavbarBrand />
                    <button
                        className="navbar-toggler"
                        id="navbar-collapse-main"
                    >
                        <span className="navbar-toggler-icon" />
                    </button>
                    <UncontrolledCollapse
                        navbar
                        toggler="#navbar-collapse-main"
                    >
                        <div className="navbar-collapse-header d-md-none">
                            <Row>
                                <Col className="collapse-brand" xs="6">
                                    <InertiaLink href={route("wiki.index")}>
                                        SciKi
                                        {/*<img*/}
                                        {/*    alt="..."*/}
                                        {/*    src={*/}
                                        {/*        require("../../assets/img/brand/argon-react.png")*/}
                                        {/*            .default*/}
                                        {/*    }*/}
                                        {/*/>*/}
                                    </InertiaLink>
                                </Col>
                                <Col className="collapse-close" xs="6">
                                    <button
                                        className="navbar-toggler"
                                        id="navbar-collapse-main"
                                    >
                                        <span />
                                        <span />
                                    </button>
                                </Col>
                            </Row>
                        </div>
                        <Nav className="ml-auto" navbar>
                            <NavItem>
                                <NavLink
                                    className="nav-link-icon"
                                    href={route("register")}
                                    tag={InertiaLink}
                                >
                                    <i className="ni ni-circle-08" />
                                    <span className="nav-link-inner--text">
                                        Register
                                    </span>
                                </NavLink>
                            </NavItem>
                        </Nav>
                    </UncontrolledCollapse>
                </Container>
            </ReactstrapNavbar>
        </>
    );
};

export default Navbar;

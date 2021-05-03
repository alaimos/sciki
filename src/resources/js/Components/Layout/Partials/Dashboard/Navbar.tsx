import React from "react";
import {
    Form,
    FormGroup,
    InputGroupAddon,
    InputGroupText,
    Input,
    InputGroup,
    Navbar as BootstrapNavbar,
    Nav,
    Container,
    NavItem,
    NavLink,
} from "reactstrap";
import { InertiaLink, usePage } from "@inertiajs/inertia-react";
import route from "ziggy-js";
import UserDropdown from "./UserDropdown";
import { Page } from "@inertiajs/inertia";
import { useNavbarContext } from "../../../../Contexts/NavbarProvider";
import { CommonPageProps } from "../../../../Types/page";

const Navbar: React.FC = () => {
    const {
        auth: { check: userIsLoggedIn },
    } = usePage<Page<CommonPageProps>>().props;
    const { title: customNavbarTitle } = useNavbarContext();
    return (
        <>
            <BootstrapNavbar
                className="navbar-top navbar-dark"
                expand="md"
                id="navbar-main"
            >
                <Container fluid>
                    <InertiaLink
                        className="h4 mb-0 text-white text-uppercase d-none d-lg-inline-block"
                        href={route("wiki.index")}
                    >
                        {customNavbarTitle ?? "SciKi"}
                    </InertiaLink>
                    <Form className="navbar-search navbar-search-dark form-inline mr-3 d-none d-md-flex ml-lg-auto">
                        <FormGroup className="mb-0">
                            <InputGroup className="input-group-alternative">
                                <InputGroupAddon addonType="prepend">
                                    <InputGroupText>
                                        <i className="fas fa-search" />
                                    </InputGroupText>
                                </InputGroupAddon>
                                <Input placeholder="Search" type="text" />
                            </InputGroup>
                        </FormGroup>
                    </Form>
                    <Nav className="align-items-center d-none d-md-flex" navbar>
                        {userIsLoggedIn && <UserDropdown showUserName={true} />}
                        {!userIsLoggedIn && (
                            <>
                                <NavItem>
                                    <NavLink
                                        href={route("login")}
                                        tag={InertiaLink}
                                    >
                                        <i className="fas fa-sign-in-alt mr-2" />
                                        Log In
                                    </NavLink>
                                </NavItem>
                            </>
                        )}
                    </Nav>
                </Container>
            </BootstrapNavbar>
        </>
    );
};

export default Navbar;

import React from "react";
import {
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
import Search from "./Search";

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
                    <Search />
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

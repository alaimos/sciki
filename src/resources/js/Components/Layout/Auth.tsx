import React from "react";
import { Col, Container, Row } from "reactstrap";
import Navbar from "./Partials/Auth/Navbar";
import Footer from "./Partials/Auth/Footer";
import NavbarProvider, {
    useNavbarContext,
} from "../../Contexts/NavbarProvider";

const AuthContent: React.FC = ({
    children,
}: {
    children?: React.ReactNode;
}) => {
    React.useEffect(() => {
        document.body.classList.add("bg-default");
        return () => {
            document.body.classList.remove("bg-default");
        };
    }, []);
    const { title: customNavbarTitle } = useNavbarContext();

    return (
        <>
            <div className="main-content">
                <Navbar />
                <div className="header bg-gradient-info py-7 py-lg-8">
                    {customNavbarTitle && (
                        <Container>
                            <div className="header-body text-center mb-7">
                                <Row className="justify-content-center">
                                    <Col lg="5" md="6">
                                        <h1 className="text-white">
                                            {customNavbarTitle}
                                        </h1>
                                    </Col>
                                </Row>
                            </div>
                        </Container>
                    )}
                    <div className="separator separator-bottom separator-skew zindex-100">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            preserveAspectRatio="none"
                            version="1.1"
                            viewBox="0 0 2560 100"
                            x="0"
                            y="0"
                        >
                            <polygon
                                className="fill-default"
                                points="2560 0 2560 100 0 100"
                            />
                        </svg>
                    </div>
                </div>
                <Container className="mt--8 pb-5">
                    <Row className="justify-content-center">{children}</Row>
                </Container>
            </div>
            <Footer />
        </>
    );
};

const Auth: React.FC = ({ children }: { children?: React.ReactNode }) => (
    <NavbarProvider>
        <AuthContent>{children}</AuthContent>
    </NavbarProvider>
);

export default Auth;

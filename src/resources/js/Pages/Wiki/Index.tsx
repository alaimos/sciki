import React from "react";
import Header from "../../Components/Layout/Headers/DefaultHeader";
import { Card, CardBody, Container } from "reactstrap";
// import {InertiaLink} from "@inertiajs/inertia-react";
// import {Helmet} from "react-helmet";
// import route from "ziggy-js";

const Index: React.FC = () => {
    return (
        <>
            <Header title="Welcome" />
            <Container className="mt--7" fluid>
                <Card className="shadow">
                    <CardBody>Welcome!</CardBody>
                </Card>
            </Container>
        </>
    );
};

export default Index;

import React from "react";
import { Container, Row, Col } from "reactstrap";

interface Props {
    bgUrl?: string;
    title?: React.ReactNode;
}

const HeaderWithImage: React.FC<Props> = ({ bgUrl, title }: Props) => {
    return (
        <>
            <div
                className="header pb-8 pt-5 pt-lg-8 d-flex align-items-center"
                style={{
                    minHeight: "600px",
                    backgroundImage: `url(${bgUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center top",
                }}
            >
                <span className="mask bg-gradient-default opacity-8" />
                <Container
                    className="d-flex align-items-center flex-grow-1"
                    fluid
                >
                    <Row className="flex-grow-1">
                        <Col lg="7" md="10">
                            <h1 className="display-2 text-white">
                                {title ?? " "}
                            </h1>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    );
};

export default HeaderWithImage;

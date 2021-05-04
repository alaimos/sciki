import React, { useEffect } from "react";
import {
    Button,
    Card,
    CardBody,
    FormGroup,
    Form,
    Input,
    InputGroupAddon,
    InputGroupText,
    InputGroup,
    Row,
    Col,
    FormFeedback,
    UncontrolledAlert,
} from "reactstrap";
import Auth from "../../../Components/Layout/Auth";
import { useNavbarContext } from "../../../Contexts/NavbarProvider";
import { InertiaLink, useForm, usePage } from "@inertiajs/inertia-react";
import route from "ziggy-js";
import classNames from "classnames";
import { Page } from "@inertiajs/inertia";
import { CommonPageProps } from "../../../Types/page";

const Email: React.FC = () => {
    const { setTitle: setPageTitle } = useNavbarContext();
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });
    const {
        flash: { status: statusFlashMessage },
    } = usePage<Page<CommonPageProps>>().props;

    useEffect(() => {
        setPageTitle("Reset Password");
    });

    const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await post(route("password.email"), {
            onSuccess: () => {
                setData("email", "");
            },
        });
    };

    return (
        <>
            <Col lg="5" md="7">
                <Card className="bg-secondary shadow border-0">
                    <CardBody className="px-lg-5 py-lg-5">
                        {statusFlashMessage && (
                            <UncontrolledAlert color="success">
                                <strong>{statusFlashMessage}</strong>
                            </UncontrolledAlert>
                        )}
                        <Form role="form" onSubmit={submitHandler}>
                            <FormGroup
                                className={classNames("mb-3", {
                                    "has-danger": !!errors.email,
                                })}
                            >
                                <InputGroup className="input-group-alternative">
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText>
                                            <i className="ni ni-email-83" />
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <Input
                                        placeholder="Email"
                                        type="email"
                                        autoComplete="reset-email"
                                        value={data.email}
                                        invalid={!!errors.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                    />
                                </InputGroup>
                                <FormFeedback
                                    tag="span"
                                    className="invalid-feedback"
                                    style={{ display: "block" }}
                                >
                                    <strong>{errors.email}</strong>
                                </FormFeedback>
                            </FormGroup>
                            <div className="text-center">
                                <Button
                                    className="my-4"
                                    color="primary"
                                    type="submit"
                                    disabled={processing}
                                >
                                    Send Password Reset Link
                                </Button>
                            </div>
                        </Form>
                    </CardBody>
                </Card>
                <Row className="mt-3">
                    <Col xs="6">
                        <InertiaLink
                            className="text-light"
                            href={route("login")}
                        >
                            <small>Back to Log In form</small>
                        </InertiaLink>
                    </Col>
                    <Col className="text-right" xs="6" />
                </Row>
            </Col>
        </>
    );
};

// @ts-ignore
Email.layout = (page: React.ReactNode) => <Auth>{page}</Auth>;

export default Email;

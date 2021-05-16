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
    Col,
    FormFeedback,
} from "reactstrap";
import Auth from "../../Components/Layout/Auth";
import { useNavbarContext } from "../../Contexts/NavbarProvider";
import { useForm } from "@inertiajs/inertia-react";
import route from "ziggy-js";
import classNames from "classnames";

const Register: React.FC = () => {
    const { setTitle: setPageTitle } = useNavbarContext();
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    useEffect(() => {
        setPageTitle("Register");
    });

    const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await post(route("register"));
    };

    return (
        <>
            <Col lg="6" md="8">
                <Card className="bg-secondary shadow border-0">
                    <CardBody className="px-lg-5 py-lg-5">
                        <div className="text-center text-muted mb-4">
                            <small>Sign up with credentials</small>
                        </div>
                        <Form role="form" onSubmit={submitHandler}>
                            <FormGroup
                                className={classNames({
                                    "has-danger": !!errors.name,
                                })}
                            >
                                <InputGroup className="input-group-alternative mb-3">
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText>
                                            <i className="ni ni-hat-3" />
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <Input
                                        placeholder="Name"
                                        type="text"
                                        value={data.name}
                                        invalid={!!errors.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                    />
                                </InputGroup>
                                <FormFeedback
                                    tag="span"
                                    className="invalid-feedback"
                                    style={{ display: "block" }}
                                >
                                    <strong>{errors.name}</strong>
                                </FormFeedback>
                            </FormGroup>
                            <FormGroup
                                className={classNames({
                                    "has-danger": !!errors.email,
                                })}
                            >
                                <InputGroup className="input-group-alternative mb-3">
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText>
                                            <i className="ni ni-email-83" />
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <Input
                                        placeholder="Email"
                                        type="email"
                                        autoComplete="new-email"
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
                            <FormGroup
                                className={classNames({
                                    "has-danger": !!errors.password,
                                })}
                            >
                                <InputGroup className="input-group-alternative">
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText>
                                            <i className="ni ni-lock-circle-open" />
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <Input
                                        placeholder="Password"
                                        type="password"
                                        autoComplete="new-password"
                                        value={data.password}
                                        invalid={!!errors.password}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                    />
                                </InputGroup>
                                <FormFeedback
                                    tag="span"
                                    className="invalid-feedback"
                                    style={{ display: "block" }}
                                >
                                    <strong>{errors.password}</strong>
                                </FormFeedback>
                            </FormGroup>
                            <FormGroup
                                className={classNames({
                                    "has-danger":
                                        !!errors.password_confirmation,
                                })}
                            >
                                <InputGroup className="input-group-alternative">
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText>
                                            <i className="ni ni-lock-circle-open" />
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <Input
                                        placeholder="Confirm Password"
                                        type="password"
                                        autoComplete="new-password-confirmation"
                                        value={data.password_confirmation}
                                        invalid={!!errors.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                "password_confirmation",
                                                e.target.value
                                            )
                                        }
                                    />
                                </InputGroup>
                                <FormFeedback
                                    tag="span"
                                    className="invalid-feedback"
                                    style={{ display: "block" }}
                                >
                                    <strong>
                                        {errors.password_confirmation}
                                    </strong>
                                </FormFeedback>
                            </FormGroup>
                            <div className="text-center">
                                <Button
                                    className="mt-4"
                                    color="primary"
                                    type="submit"
                                    disabled={processing}
                                >
                                    Create account
                                </Button>
                            </div>
                        </Form>
                    </CardBody>
                </Card>
            </Col>
        </>
    );
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line react/display-name
Register.layout = (page: React.ReactNode) => <Auth>{page}</Auth>;

export default Register;

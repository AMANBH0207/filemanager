import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { auth, db,storage } from "./fireBase";
import { setDoc, doc} from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { useNavigate } from "react-router-dom";
import {useAuth} from "./Context/AuthContext";

function Signup() {
    const navigate = useNavigate();
    const { signUp } = useAuth(); // Access signUp method from AuthContext
    const [notice, setNotice] = useState("");
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);
    
        const { firstName, lastName, email, password, confirmPassword } = formData;
    
        if (password === confirmPassword) {
            try {
                // Sign up the user
                await signUp(email, password); // Use signUp method from AuthContext
    
                // Add user details to Firestore
                const docRef = doc(db, "users", email);
                await setDoc(docRef, {
                    firstName: firstName,
                    lastName: lastName,
                    email: email
                });
    
                console.log("User signed up successfully:", email);
                const dummyFileContent = new Uint8Array();
                const fileRef = ref(storage, `${email}/.keep`); // Use .keep as a dummy file name
                const snapshot = await uploadBytes(fileRef, dummyFileContent);

                console.log(snapshot);
    
                // Navigate to home or any desired route
                navigate("/");
            } catch (error) {
                // Handle signup error
                console.error("Error signing up:", error.message);
                setNotice("Sorry, something went wrong. Please try again.");
            }
        } else {
            // Passwords don't match
            setNotice("Passwords don't match. Please try again.");
        }
    };
    

    return (
        <Container fluid className="px-3">
            <Row className="min-vh-100">
                <Col md={8} lg={6} xl={5} className="mx-auto my-auto border border-gray rounded p-5">
                    <div className="text-center mb-4 ">
                        <h2>Create new account</h2>
                    </div>
                    <Form onSubmit={handleSubmit} className="mb-3 p-4">
                        <Row className='p-2'>
                            <Col md={6}>
                                <Form.Group controlId="formFirstName" >
                                    <Form.Control type="text" placeholder="First Name" name="firstName" onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={6} >
                                <Form.Group controlId="formLastName">
                                    <Form.Control type="text" placeholder="Last Name" name="lastName" onChange={handleChange} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group controlId="formBasicEmail" className='p-2'>
                            <Form.Control type="email" placeholder="Email" name="email" onChange={handleChange} />
                        </Form.Group>
                        <Form.Group controlId="formBasicPassword" className='p-2'>
                            <Form.Control type="password" placeholder="Password" name="password" onChange={handleChange} />
                        </Form.Group>

                        <Form.Group controlId="confirmPassword" className='p-2'> {/* Fix controlId name */}
                            <Form.Control type="password" placeholder="Confirm Password" name="confirmPassword" onChange={handleChange} /> {/* Fix name */}
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-50 mt-5">
                            Create account
                        </Button>
                    </Form>
                    <div className="text-center mb-3">
                        <p className="text-muted">Already a member? </p>
                        <a href="/Login">Log in</a>
                    </div>
                    {/* <Button variant="outline-primary" className="mb-2 w-100 ">
                        <FontAwesomeIcon icon={faFacebookF} className="me-2 " /> Signup with Facebook
                    </Button>
                    <Button variant="outline-danger" className="w-100">
                        <FontAwesomeIcon icon={faGoogle} className="me-2" /> Signup with Google
                    </Button> */}
                </Col>
            </Row>
        </Container>
    );
}

export default Signup;

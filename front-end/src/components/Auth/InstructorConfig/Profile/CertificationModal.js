import React from 'react'
import styled from "styled-components"
import { Modal, Backdrop, Slide, makeStyles } from "@material-ui/core"
import InputWithLabel from '../../../ReusableElement/InputWithLabel'
import * as FAIcons from "react-icons/fa"
import Button from '../../../ReusableElement/Button'

const useStyles = makeStyles((theme) => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }
}))

const CertificationModal = ({ open, onClose }) => {

    const classes = useStyles();

    return (
        <div>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className={classes.modal}
                open={open}
                onClose={onClose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Slide in={open}>
                    <ModalContent>
                        <ReactIcon>
                            <FAIcons.FaTimesCircle onClick={onClose} style={{ cursor: 'pointer' }} size={20} />
                        </ReactIcon>

                        <InputWithLabel
                            label="Name"
                            type="text"
                            name="certificationName"
                            // value={instructorInfo.instructorName}
                            required
                        // onChange={handleOnChange}
                        />
                        <InputGroup>
                            <InputWithLabel
                                label="Issuing Organozation"
                                type="text"
                                name="issuingOrganozation"
                                // value={instructorInfo.instructorName}
                                required
                            // onChange={handleOnChange}
                            />
                            <CheckboxGroup>
                                <CheckboxLabel>
                                    This credential does not expire
                                </CheckboxLabel>
                                <CheckboxInput
                                    label="This credential does not expire"
                                    type="checkbox"
                                    name="doesExpire"
                                    value={false}
                                    required
                                // onChange={handleOnChange}
                                />
                            </CheckboxGroup>
                        </InputGroup>
                        <InputGroup>
                            <InputWithLabel
                                label="Issue Date"
                                type="date"
                                name="issueDate"
                                // value={instructorInfo.instructorName}
                                required
                            // onChange={handleOnChange}
                            />
                            <InputWithLabel
                                label="Expiration Date"
                                type="date"
                                name="expirationDate"
                                // value={instructorInfo.instructorName}
                                required
                            // onChange={handleOnChange}
                            />
                        </InputGroup>
                        <InputWithLabel
                            label="Credential ID"
                            type="text"
                            name="credentialID"
                            // value={instructorInfo.instructorName}
                            required
                        // onChange={handleOnChange}
                        />
                        <ModalButtonGroup>
                            <Button text="Add Another" />
                            <Button text="Save" />
                        </ModalButtonGroup>
                    </ModalContent>
                </Slide>
            </Modal>
        </div>
    );
}

const ModalContent = styled.div`
    background-color: #fff;
    border: 1px solid #555;
    border-radius: 1rem;
    padding: 3rem;
    box-shadow: none;

    :focus {
        outline: none;
    }
`;

const ReactIcon = styled.div`
    text-align: right;
`;

const InputGroup = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 3rem;
`;

const CheckboxGroup = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center
`;

const CheckboxInput = styled.input.attrs({ type: 'checkbox' })`
    border: solid 1px #ccc;
	border-radius: 5px;
	padding: 0.5rem;
	box-sizing: border-box;
    width: 20px;
    height: 20px;
`;

const CheckboxLabel = styled.label`
    margin-right: 2rem;
`;

const ModalButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;

    button:first-of-type {
        margin-right: 1rem;
    }
`;

export default CertificationModal

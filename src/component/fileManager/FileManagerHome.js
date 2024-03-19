import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Nav,
  Dropdown,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import { Folder2, FileEarmarkImage, Plus, Upload } from "react-bootstrap-icons";
import { storage, db, auth } from "../fireBase";
import {
  ref,
  uploadBytes,
  listAll,
  getDownloadURL,
  deleteObject,
  updateMetadata,
  getMetadata,
} from "firebase/storage";
import { Navbar, NavDropdown } from "react-bootstrap";
import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { Link, redirect, useNavigate } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";

import "bootstrap/dist/css/bootstrap.min.css";

const FileManagerHome = () => {
  const [user] = useAuthState(auth);
  const [uploadModal, setUploadModal] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [allfolders, setAllFolders] = useState([]);
  const [allfiles, setAllFiles] = useState([]);
  const [file, setFile] = useState(null);

  const [renameModal, setRenameModal] = useState(false);
  const [renameItem, setRenameItem] = useState("");
  const [newName, setNewName] = useState("");

  const [selectedFolder, setSelectedFolder] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFolderData = async () => {
      try {
        const listRef = ref(storage, `${user.email}/`);
        const res = await listAll(listRef);

        // Fetch folder names
        const folderNames = res.prefixes.map((folderRef) => folderRef);
        setAllFolders(folderNames);

        // Fetch display name and image URL
        const filesData = await Promise.all(
          res.items.map(async (itemRef) => {
            const metadata = await getMetadata(itemRef);
            return {
              name: itemRef.name,
              displayName: metadata.customMetadata.displayName || itemRef.name,
              url: await getDownloadURL(itemRef),
            };
          })
        );

        setAllFiles(filesData);

        setAllFiles(filesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchFolderData();
  }, [allfolders, allfiles]);

  function val() {
    console.log("all files are:", allfiles);
    console.log("selected folder is:", selectedFolder);
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const fileRef = ref(storage, `${user.email}/${file.name}`);
    // Set custom metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        displayName: file.name,
      },
    };

    // Upload file with custom metadata
    await uploadBytes(fileRef, file, metadata).then((snapshot) => {
      console.log("File uploaded:", snapshot.metadata.fullPath);
    });

    setFile(null);
    setFilePreview(null);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setUploadModal(false);
    setFilePreview(null);
    setNewFolderName("");
  };
  const handleShowModal = () => setShowModal(true);
  const handleNewFolderChange = (e) => setNewFolderName(e.target.value);
  const handleCreateFolder = async () => {
    console.log(newFolderName);

    try {
      // Create a dummy file inside the folder to simulate creating the folder
      const dummyFileContent = new Uint8Array(); // Empty array
      const fileRef = ref(storage, `${user.email}/${newFolderName}/.keep`); // Use .keep as a dummy file name
      const snapshot = await uploadBytes(fileRef, dummyFileContent);

      console.log(snapshot);

      handleCloseModal();
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };
  const handleShowUploadModal = () => {
    setUploadModal(true); // Set upload modal to true to show the upload file modal
  };

  function openFolder(name) {
    const a = [{ path: name.fullPath }];
    localStorage.setItem("selectedFolder", JSON.stringify(a));
    navigate(`/home/folders`);
  }

  const handleDeleteFolder = async (folderName) => {
    const folderRef = ref(storage, `${user.email}/${folderName.name}`);
    await deleteFolderRecursive(folderRef);

    setAllFolders(
      allfolders.filter((folder) => folder.name !== folderName.name)
    );
  };

  const deleteFile = async (fileRef) => {
    await deleteObject(fileRef);
  };

  const handleDeleteFile = async (fileName) => {
    if (!fileName.name) {
      console.error("File name is null");
      return;
    }

    const fileRef = ref(storage, `${user.email}/${fileName.name}`);
    try {
      await deleteFile(fileRef);
      // Update UI to remove the deleted file
      setAllFiles(allfiles.filter((file) => file.name !== fileName.name));
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const deleteFolderRecursive = async (folderRef) => {
    try {
      const listResult = await listAll(folderRef);

      // Delete all items in the folder
      await Promise.all(
        listResult.items.map(async (itemRef) => {
          if (itemRef.isDirectory) {
            await deleteFolderRecursive(itemRef);
          } else {
            await deleteFile(itemRef);
          }
        })
      );

      // Recursively delete subfolders
      await Promise.all(listResult.prefixes.map(deleteFolderRecursive));

      // Finally, delete the folder itself
      await deleteObject(folderRef);
    } catch (error) {
      if (error.code === "storage/object-not-found") {
        console.log("Object does not exist:", folderRef.fullPath);
      } else {
        console.error("Error deleting folder:", error);
      }
    }
  };

  //Rename files

  const handleRename = (itemName) => {
    setRenameItem(itemName);
    setNewName(itemName);
    setRenameModal(true);
  };

  const handleRenameClose = () => {
    setRenameModal(false);
    setNewName("");
  };

  const handleRenameSave = async () => {
    if (renameItem && newName) {
      try {
        // Determine the path of the item (file or folder)
        const itemRef = ref(storage, `${user.email}/${renameItem}`);

        // Update the metadata to change the name
        await updateMetadata(itemRef, {
          customMetadata: { displayName: newName },
        });

        // Close the modal after successful rename
        setRenameModal(false);
      } catch (error) {
        console.error("Error renaming item:", error);
      }
    }
  };
  function Val() {
    console.log("allfiles", allfiles);
  }

  const handleLogout = () => {
    if (signOut(auth)) {
      redirect("/login");
    }
  };
  return (
    <>
      <Navbar bg="dark" variant="dark">
        <Nav.Link href="#home">Middle Item</Nav.Link>

        <Nav className="mr-auto">
          {/* Item aligned to the left */}
          <Nav.Link href="#home">Left Item</Nav.Link>
        </Nav>
        <Nav className="mx-auto">
          {/* Item in the middle */}
          <Navbar.Brand href="#home">File Manager</Navbar.Brand>
        </Nav>
        <Nav className="me-5">
          {/* Dropdown aligned to the right */}
          <NavDropdown title="Options" id="basic-nav-dropdown">
            <NavDropdown.Item onClick={handleShowUploadModal}>
              Upload
            </NavDropdown.Item>
            <NavDropdown.Item
              href="#action/create-folder"
              onClick={handleShowModal}
            >
              Create Folder
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item>
              <Link to="/login">Logout</Link>
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Navbar>

      <Container fluid>
        <Row>
          <Col xs={10}>
            <Row xs={1} md={2} lg={4} className="g-4 m-3">
              {allfolders.map((folderName, index) => (
                <Nav.Item key={index} className="position-relative">
                  <Nav.Link href="#">
                    <Dropdown className="position-absolute">
                      <Dropdown.Toggle variant="white" id="dropdown-basic">
                        <BsThreeDotsVertical />
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        <Dropdown.Item
                          onClick={() => handleRename(folderName.name)}
                        >
                          Rename
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => handleDeleteFolder(folderName)}
                        >
                          Delete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>

                    <Folder2
                      size={100}
                      onClick={() => openFolder(folderName)}
                    />

                    <p>{folderName.name}</p>
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Row>
            <Row xs={1} md={2} lg={4} className="g-4 m-3">
              {allfiles.map((filesName, index) => (
                <Nav.Item key={index}>
                  <Nav.Link href="#">
                    <Dropdown className="position-absolute">
                      <Dropdown.Toggle variant="white" id="dropdown-basic">
                        <BsThreeDotsVertical />
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        <Dropdown.Item
                          onClick={() => handleRename(filesName.displayName)}
                        >
                          Rename
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => handleDeleteFile(filesName)}
                        >
                          Delete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                    <img src={filesName.url} width="100" height="100" />
                    <p>{filesName.displayName}</p>
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Row>
          </Col>
        </Row>

        {/* New Folder Modal */}
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Create New Folder</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3" controlId="newFolderName">
                <Form.Label>Folder Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter folder name"
                  value={newFolderName}
                  onChange={handleNewFolderChange}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
            <Button variant="primary" onClick={handleCreateFolder}>
              Create Folder
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Upload File Modal */}
        <Modal show={uploadModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Upload File</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {filePreview && (
              <img
                src={filePreview}
                alt="File Preview"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            )}
            <Form>
              <Form.Group controlId="formBasicFile">
                <Form.Label>Choose File</Form.Label>
                <Form.Control type="file" onChange={handleFileChange} />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
            <Button variant="primary" onClick={handleUpload}>
              Upload
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={renameModal} onHide={handleRenameClose}>
          <Modal.Header closeButton>
            <Modal.Title>Rename Item</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="newItemName">
                <Form.Label>New Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter new name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleRenameClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleRenameSave}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default FileManagerHome;

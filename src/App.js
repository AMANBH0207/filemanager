import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import Signup from "./component/Signup";
import Login from "./component/Login";
import { auth } from "./component/fireBase";
import FileManagerHome from "./component/fileManager/FileManagerHome";
import Folders from "./component/fileManager/Folders";

function App() {
  const [user] = useAuthState(auth);
  console.log(user);

  const isAuthenticated = !!user;

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {isAuthenticated && (
          <>
            <Route path="/filemanager" element={<FileManagerHome />} />
            <Route path="/home" element={<Folders />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;

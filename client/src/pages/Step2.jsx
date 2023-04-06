import { useAuth0 } from "@auth0/auth0-react";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/User";

export default function Profile() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    if (!isLoading) {
      setUser({ ...user, Number: authUser?.nickname.slice(1) });
    }
  }, [isLoading]);

  console.log(user);
  const handleSumbit = () => {
    localStorage.setItem("currUser", JSON.stringify(user));
    navigate("/dashboard");
  };
  if (isLoading) {
    return <div>Loading ...</div>;
  }
  return isAuthenticated ? (
    <div>
      <label>
        Name:&nbsp;
        <input
          type="text"
          name="fname"
          placeholder="Name"
          onChange={(e) => {
            setUser({ ...user, Name: e.target.value });
          }}
        />
      </label>
      <p>Number: {user?.Number} (Verified)</p>
      <button onClick={handleSumbit}>Continue</button>
    </div>
  ) : (
    <div>
      <p>Not Authenticated</p>
    </div>
  );
}

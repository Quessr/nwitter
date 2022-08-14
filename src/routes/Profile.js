import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { authService, dbService } from "fbase";
import { updateProfile } from "firebase/auth";

const Profile = ({ userObj, refreshUser }) => {
  let navigate = useNavigate();
  const [newDisplayName, setNewDisplayName] = useState(userObj.displayName);

  const onLogOutClick = () => {
    authService.signOut();
    navigate("/");
  };

  useEffect(() => {
    const getMyNweets = async () => {
      const nweets = query(
        collection(dbService, "nweets"),
        where("creatorId", "==", userObj.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(nweets);
      querySnapshot.forEach((doc) => {
        console.log("MyNweets: ", doc.id, "=>", doc.data());
      });
    };
    getMyNweets();
  }, [userObj.uid]);

  const onChange = (event) => {
    const {
      target: { value },
    } = event;
    setNewDisplayName(value);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (
      userObj.displayName !== newDisplayName &&
      newDisplayName.trim() !== ""
    ) {
      updateProfile(authService.currentUser, {
        displayName: newDisplayName,
      }).then(() => refreshUser());
    }
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <input
          onChange={onChange}
          type="text"
          placeholder="Display name"
          value={newDisplayName}
        />
        <input type="submit" value="Update Profile" />
      </form>
      <button onClick={onLogOutClick}>Log Out</button>
    </>
  );
};

export default Profile;

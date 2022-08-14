import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { uploadString, ref, getDownloadURL } from "firebase/storage";
import { dbService, storageImagesRef } from "fbase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import Nweet from "components/Nweet";

const Home = ({ userObj }) => {
  const [nweet, setNweet] = useState("");
  const [nweets, setNweets] = useState([]);
  const [attachment, setAttachment] = useState("");

  useEffect(() => {
    const q = query(
      collection(dbService, "nweets"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newNweets = [];
      querySnapshot.forEach((doc) => {
        newNweets.push({ id: doc.id, ...doc.data() });
      });
      setNweets(newNweets);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    const fileName = `${userObj.uid}/${uuidv4()}`;
    const fileRef = ref(storageImagesRef, fileName);
    let attachmentUrl = "";
    try {
      if (attachment !== "") {
        const attachmentRef = await uploadString(
          fileRef,
          attachment,
          "data_url"
        );
        console.log(attachmentRef);
        attachmentUrl = await getDownloadURL(fileRef);
      }
      const nweetsCollection = collection(dbService, "nweets");
      await addDoc(nweetsCollection, {
        text: nweet,
        createdAt: Date.now(),
        creatorId: userObj.uid,
        attachmentUrl,
      });
      setNweet("");
      setAttachment("");
    } catch (error) {
      console.log(error);
    }
  };

  const onChange = (event) => {
    const {
      target: { value },
    } = event;
    setNweet(value);
  };

  const onFileChange = (event) => {
    const {
      target: { files },
    } = event;
    const theFile = files[0];
    const reader = new FileReader();
    reader.onloadend = (finishedEvent) => {
      const {
        currentTarget: { result },
      } = finishedEvent;
      setAttachment(result);
    };
    reader.readAsDataURL(theFile);
  };

  const onClearAttachment = () => setAttachment(null);

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          value={nweet}
          onChange={onChange}
          type="text"
          placeholder="What's on your mind"
          maxLength={120}
        />
        <input type="file" accept="image/*" onChange={onFileChange} />
        <input type="submit" value="Nweet" />
        {attachment && (
          <div>
            <img src={attachment} width="50px" height="50px" alt="preview" />
            <button onClick={onClearAttachment}>Clear</button>
          </div>
        )}
      </form>
      <div>
        {nweets.map((nweet) => (
          <Nweet
            key={nweet.id}
            nweetObj={nweet}
            isOwner={nweet.creatorId === userObj.uid}
          />
        ))}
      </div>
    </div>
  );
};
export default Home;

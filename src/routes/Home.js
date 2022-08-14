import React, { useEffect, useState } from "react";
import { dbService, storageImagesRef } from "fbase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import Nweet from "components/Nweet";
import NweetFactory from "components/NweetFactory";

const Home = ({ userObj }) => {
  const [nweets, setNweets] = useState([]); 

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

  

  return (
    <div className="container">
      <NweetFactory userObj={userObj}/>
      <div style={{ marginTop: 30 }}>
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

import React from "react";

import CreateContentList from "../../../ReusableComponents/CreateContentList";

const Playlists = () => {
  return (
    <div style={styles.container}>
      <CreateContentList type={"playlist"} />
    </div>
  );
};

const styles = {
  container: {
    width: "80%",
    margin: "0 auto",
  },
};

export default Playlists;

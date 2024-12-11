import "./userInfo.css";
import { assets } from "../../../assets/assets";
import { useUserStore } from "../../../lib/userStore";
import { useState } from "react";
import { auth } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";

const UserInfo = () => {
  const [open, setOpen] = useState(false);

  const { currentUser } = useUserStore();
  const { setChatId } = useChatStore();

  const handleLogout = () => {
    setChatId(null);
    auth.signOut();
  };

  return (
    <div className="userInfo">
      <div className="user">
        <img src={currentUser.avatar || assets.avatar_icon} alt="" />
        <p>{currentUser.username}</p>
      </div>
      <div className="icons">
        <img
          onClick={() => setOpen((prev) => !prev)}
          src={assets.more_icon}
          alt=""
        />
      </div>

      {open && (
        <div className="more">
          <button onClick={handleLogout} className="logout">
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserInfo;

import { useEffect, useRef } from 'react';
import './detail.css';
import { assets } from '../../assets/assets';
import { useUserStore } from '../../lib/userStore';
import { useChatStore } from '../../lib/chatStore';
import { arrayRemove, arrayUnion, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useState } from 'react';

const Detail = ({ onClose }) => {
  const { chatId } = useChatStore();
  const { user, changeBlock, isReceiverBlocked, isCurrentUserBlocked } = useChatStore();
  const { currentUser } = useUserStore();

  const [isChatSettingsOpen, setIsChatSettingsOpen] = useState(false);
  const [isSharedPhotosOpen, setIsSharedPhotosOpen] = useState(false);
  const [sharedPhotos, setSharedPhotos] = useState([]);
  const modalRef = useRef(null);

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });

      changeBlock();
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const chatDocRef = doc(db, 'chats', chatId);
    const unsubscribe = onSnapshot(chatDocRef, (snapshot) => {
      const chatData = snapshot.data();
      if (chatData?.sharedImages) {
        setSharedPhotos(chatData.sharedImages);
      }
    });

    return () => unsubscribe(); // Clean up the listener
  }, [chatId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className='detail'>
      <div className='detailContent' ref={modalRef}>
        <button className='detailClose' onClick={onClose}>
          <img src={assets.cross_icon} alt="Close" />
        </button>
        <div className="user">
          <img src={user?.avatar || assets.avatar_icon} alt="" />
          <h2>{user?.username}</h2>
        </div>

        <div className='info'>
          <div className='option'>
            <div className='title' onClick={() => setIsChatSettingsOpen(!isChatSettingsOpen)}>
              <span>Chat Settings</span>
              <img src={assets.arrow_up_icon} alt="" className={isChatSettingsOpen ? 'rotate' : ''} />
            </div>
            {isChatSettingsOpen && (
              <div className="dropdown">
                <button
                  onClick={handleBlock}
                  disabled={isCurrentUserBlocked}
                >
                  {isCurrentUserBlocked
                    ? "You are Blocked!"
                    : isReceiverBlocked
                      ? "User Blocked"
                      : "Block User"}
                </button>
              </div>
            )}
          </div>

          <div className='option'>
            <div className='title' onClick={() => setIsSharedPhotosOpen(!isSharedPhotosOpen)}>
              <span>Shared Photos</span>
              <img src={assets.arrow_up_icon} alt="" className={isSharedPhotosOpen ? 'rotate' : ''} />
            </div>
            {isSharedPhotosOpen && (
              <div className="photos">
                {sharedPhotos.length > 0 ? (
                  sharedPhotos.map((photo, index) => (
                    <div className="photoItem" key={index}>
                      <div className='photoDetail'>
                        <img src={photo.imgUrl} alt={`Shared photo ${index}`} />
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No photos shared yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detail;

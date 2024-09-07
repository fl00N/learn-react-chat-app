import { useState, useEffect, useRef } from 'react';
import './chat.css';
import { assets } from '../../assets/assets';
import EmojiPicker from 'emoji-picker-react';
import Detail from '../detail/Detail';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import upload from '../../lib/upload';

const Chat = () => {
  const { chatId, user, isReceiverBlocked, isCurrentUserBlocked, setChatId } = useChatStore();
  const { currentUser } = useUserStore();

  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState();
  const [text, setText] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  const endRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1100);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      });
    }
  };

  const toggleDetail = () => {
    setShowDetail((prev) => !prev);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // При нажатии только Enter отправляем сообщение
      e.preventDefault();
      handleSend();
    }
  };  

  const handleDeselect = () => {
    setChatId(null);
  };

  useEffect(() => {
    if (endRef.current) {
      const scrollElement = endRef.current.parentElement;
      if (scrollElement) {
        requestAnimationFrame(() => {
          scrollElement.scrollTo({
            top: scrollElement.scrollHeight,
            behavior: 'smooth'
          });
        });
      }
    }
  }, [chat, chat?.messages]);
  

  useEffect(() => {
    if (!chatId) return;
  
    const unSub = onSnapshot(
      doc(db, 'chats', chatId),
      (res) => {
        setChat(res.data());
      }
    );
  
    return () => {
      unSub();
    };
  }, [chatId]);
  

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSend = async () => {
    if (text === '' && !img.file) return;

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      await updateDoc(doc(db, 'chats', chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
        ...(imgUrl && {
          sharedImages: arrayUnion({
            imgUrl,
            senderId: currentUser.id,
            createdAt: new Date(),
          }),
        }),
      });

      const userIDs = [currentUser.id, user.id];
      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, 'user-chats', id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);

          userChatsData.chats[chatIndex].lastMessage = text || 'Image';
          userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (err) {
      console.log(err);
    }

    setImg({
      file: null,
      url: '',
    });
    setText('');
  };

  return (
    <div className='chatAndDetail'>
      <div className='chat'>
        <div className='top'>
          <div className='user'>
            <img 
              className='deselectArrow'
              src={assets.arrow_icon} 
              alt="Deselect"
              onClick={handleDeselect}
            />

            <img src={user?.avatar || assets.avatar_icon} alt="" />
            <div className='texts'>
              <span>{user?.username}</span>
            </div>
          </div>

          <div className='icons'>
            <img onClick={toggleDetail} src={assets.more_icon} alt="" />
          </div>
        </div>

        <div className='center'>
          
          {chat?.messages?.map((message) => (
            <div
              className={message.senderId === currentUser?.id ? 'message own' : 'message'}
              key={`${message.senderId}-${message.createdAt}`}
            >
              <div className="texts">
                {message.img && <img src={message.img} alt="" />}
                <p>{message.text}</p>
              </div>
            </div>
          ))}

          {img.url && (
            <div className="message own">
              <div className="texts">
                <img src={img.url} alt="" />
              </div>
            </div>
          )}

        <div ref={endRef}></div>
        </div>


        <div className='bottom'>
          <div className='icons'>
            <label htmlFor="file">
              <img src={assets.img_icon} alt="" />
            </label>
            <input type="file" id="file" style={{ display: "none" }} onChange={handleImg} />
          </div>
          <textarea
            placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? "You cannot send a message" : "Type a message..."}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isCurrentUserBlocked || isReceiverBlocked}
            rows={1} // Задаем минимальное количество строк
            style={{ resize: 'none' }} // Отключаем возможность ручного изменения размера
          />
          <div className='emoji'>
            <img src={assets.emoji_icon} alt="" onClick={() => setOpen(prev => !prev)} />
            <div className="picker">
              <EmojiPicker emojiStyle='apple' open={open} onEmojiClick={handleEmoji} />
            </div>
          </div>
          <button
            className='sendBtn'
            onClick={handleSend}
            disabled={isCurrentUserBlocked || isReceiverBlocked}
          ><img src={assets.send_icon} alt="" /></button>
        </div>
      </div>

      {showDetail && (
        <Detail onClose={() => setShowDetail(false)} />
      )}
    </div>
  );
};

export default Chat;

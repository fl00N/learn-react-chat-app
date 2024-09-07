import './chatList.css'
import { assets } from '../../../assets/assets'
import { useEffect, useState } from 'react'
import AddUser from './addUser/AddUser'
import { useUserStore } from '../../../lib/userStore'
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import { useChatStore } from '../../../lib/chatStore'

const ChatList = ({ onChatSelect }) => {

  const [chats, setChats] = useState([])
  const [addMode, setAddMode] = useState(false)
  const [input,setInput]= useState("");

  const { currentUser } = useUserStore()
  const { changeChat } = useChatStore()

  const filteredChats = chats.filter(
    c=> c.user.username.toLowerCase().includes(input.toLowerCase())
  )

  const handleSelect =  async (chat)=>{

    const userChats = chats.map(item=>{
        const { user, ...rest } = item;
        return rest
    })

    const chatIndex = userChats.findIndex(
      item => item.chatId === chat.chatId
    )

    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "user-chats", currentUser.id);

    try{
      await updateDoc(userChatsRef,{
          chats:userChats,
      })
    } catch(err){
        console.log(err)
    }

    changeChat(chat.chatId, chat.user)
    onChatSelect(chat)
}

  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, 'user-chats', currentUser.id),
      async (res) => {
        const items = res.data().chats

        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);

          const user = userDocSnap.data()

          return { ...item, user }
        })

        const chatData = await Promise.all(promises)
        
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt))
      }
    );

    return () => {
      unSub()
    }
  }, [currentUser.id])
  
  return (
    <div className='chatList'>
      <div className='search'>
        <div className='searchBar'>
          <img src={assets.search_icon} alt="" />
          <input type="text" placeholder='Search' onChange={(e)=>setInput(e.target.value)}/>
        </div>
        <img 
          onClick={() => setAddMode(prev => !prev)}
          className='add' 
          src={ addMode ? assets.minus_icon : assets.plus_icon} 
          alt="" 
        />
      </div>

      {filteredChats.map((chat) => (
        <div 
          className="item" 
          key={chat.chatId} 
          onClick={() => handleSelect(chat)}
          style={{
            backgroundColor: chat?.isSeen ? 'transparent' : '#5183fe'
          }}
        >
          <img src={chat.user.avatar || assets.avatar_icon} alt="" />

          <div className="texts">
            <span>{chat.user.username}</span>
            <p>{chat.lastMessage.length > 20 ? chat.lastMessage.slice(0, 30) + '...' : chat.lastMessage}</p>
            </div>
        </div>
      ))}

      
      {addMode && <AddUser />}    
    </div>
  )
}

export default ChatList
import { useState, useEffect } from 'react'
import ChatList from './chatList/ChatList'
import './list.css'
import UserInfo from './userInfo/UserInfo'

const List = () => {
  const [selectedChat, setSelectedChat] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 885)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 885)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Function to be called when a chat is selected
  const handleChatSelect = (chat) => {
    setSelectedChat(chat)
  }

  // Determine if the List component should be hidden
  const shouldHideList = isMobile && selectedChat

  return !shouldHideList ? (
    <div className='list'>
      <UserInfo />
      <ChatList onChatSelect={handleChatSelect} />
    </div>
  ) : null
}

export default List

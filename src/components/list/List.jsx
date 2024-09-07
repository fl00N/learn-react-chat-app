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

  const handleChatSelect = (chat) => {
    setSelectedChat(chat)
  }

  const shouldHideList = isMobile && selectedChat

  return !shouldHideList ? (
    <div className='list'>
      <UserInfo />
      <ChatList onChatSelect={handleChatSelect} />
    </div>
  ) : null
}

export default List

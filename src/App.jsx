import { useEffect, useState } from "react"
import Chat from "./components/chat/Chat"
import List from "./components/list/List"
import Login from './components/login/Login'
import Notification from "./components/notification/Notification"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./lib/firebase"
import { useUserStore } from "./lib/userStore"
import { useChatStore } from "./lib/chatStore"

const App = () => {

  const { currentUser, isLoading, fetchUserInfo } = useUserStore()
  const { chatId } = useChatStore()
  
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid)
    })

    return () => {
      unSub()
    }
  }, [fetchUserInfo])

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  if (isLoading) return <div className="loading">Loading...</div>

  return (
    <div className="container">
      {
        currentUser ? (
          <>
            {windowWidth < 885 ? (
              chatId ? <Chat /> : <List />
            ) : (
              <>
                <List />
                {chatId && <Chat />}
              </>
            )}
          </>
        ) : (
        <Login />
      )}
      <Notification />
    </div>
  )
}

export default App

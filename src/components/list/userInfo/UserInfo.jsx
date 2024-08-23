import './userInfo.css'
import { assets } from '../../../assets/assets'
import { useUserStore } from '../../../lib/userStore'
import { useState } from 'react'
import { auth } from '../../../lib/firebase'

const UserInfo = () => {

  const [open, setOpen] = useState(false)

  const { currentUser } = useUserStore()

  return (
    <div className='userInfo'>
        <div className="user">
            <img src={currentUser.avatar || assets.avatar_icon} alt="" />
            <p>{currentUser.username}</p>
        </div>
        <div className="icons">
            <img onClick={() => setOpen(prev => !prev)} src={assets.more_icon} alt="" />
        </div>

        {open && (
          <div className='more'>
            <button onClick={() => auth.signOut()} className='logout'>Logout</button>
          </div>
        )}
    </div>
  )
}

export default UserInfo
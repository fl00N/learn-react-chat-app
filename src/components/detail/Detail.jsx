import './detail.css'
import { assets } from '../../assets/assets'
import { useUserStore } from '../../lib/userStore'
import { useChatStore } from '../../lib/chatStore'
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'

const Detail = () => {

  const { user, changeBlock, isReceiverBlocked, isCurrentUserBlocked } = useChatStore()
  const { currentUser } = useUserStore()

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id)

    try{
        await updateDoc(userDocRef,{
            blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
        });

        changeBlock()
    } catch(err){
        console.log(err)
    }

}

  return (
    <div className='detail'>
      <div className="user">
        <img src={user?.avatar || assets.avatar_icon} alt="" />
        <h2>{user?.username}</h2>
        <p>Lorem ipsum dolor sit amet.</p>
      </div>

      <div className='info'>
        <div className='option'>
          <div className='title'>
            <span>Chat Settings</span>
            <img src={assets.arrow_up_icon} alt="" />
          </div>
        </div>

        <div className='option'>
          <div className='title'>
            <span>Privacy & help</span>
            <img src={assets.arrow_up_icon} alt="" />
          </div>
        </div>

        <div className='option'>
          <div className='title'>
            <span>Shared photos</span>
            <img src={assets.arrow_up_icon} alt="" />
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img src="https://media.istockphoto.com/id/852149366/photo/drone-in-high-sky.jpg?s=2048x2048&w=is&k=20&c=9eTLSi48giTopw3erX-7-c-x8F0AcrNGTEk8ptcj_u4=" alt="" />
                <span>photo.jpg</span>   
              </div>
              <img className='icon' src={assets.download_icon} alt="" />
            </div>
          </div>
        </div>

        <div className='option'>
          <div className='title'>
            <span>Shared Files</span>
            <img src={assets.arrow_up_icon} alt="" />
          </div>
        </div>
        <button 
          onClick={handleBlock}
          disabled={isCurrentUserBlocked}
        >
          {isCurrentUserBlocked 
            ? " You are Blocked!" 
            : isReceiverBlocked 
            ? "User blocked" 
            : "Block User"}
        </button>
      </div>
    </div>
  )
}

export default Detail
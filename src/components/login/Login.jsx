import { useEffect, useState } from 'react'
import './login.css'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../../lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import upload from '../../lib/upload'

const Login = () => {

  const [loading, setLoading] = useState(false)
  const [avatar, setAvatar] = useState({
    file: null,
    url: ''
  })

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: ''
  })

  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [isLoginPage, setIsLoginPage] = useState(true)

  const handleAvatar = e => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      })
    }
  }

  const handleInputChange = (e, setData) => {
    setData(prevData => ({
      ...prevData,
      [e.target.name]: e.target.value
    }))
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    const { email, password } = loginData

    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      console.log(err)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }

    setLoginData({
      email: '',
      password: ''
    })
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    setLoading(true)

    try {
      const { username, email, password } = registerData
      const res = await createUserWithEmailAndPassword(auth, email, password)

      const imgUrl = await upload(avatar.file)

      await setDoc(doc(db, 'users', res.user.uid), {
        username,
        email,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: []
      })

      await setDoc(doc(db, 'user-chats', res.user.uid), {
        chatss: []
      })

      toast.success("Account created! You can login now!")

      setRegisterData({
        username: '',
        email: '',
        password: ''
      })
      setAvatar({
        file: null,
        url: ''
      })
    } catch (err) {
      console.log(err)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className='login'>
      {windowWidth < 815 ? (
        <>
          {isLoginPage ? (
            <div className="item">
              <h2>Welcome back</h2>
              <form onSubmit={handleLogin}>
                <input
                  type="email"
                  placeholder='Email'
                  name='email'
                  value={loginData.email}
                  onChange={e => handleInputChange(e, setLoginData)}
                />
                <input
                  type="password"
                  placeholder='Password'
                  name='password'
                  value={loginData.password}
                  onChange={e => handleInputChange(e, setLoginData)}
                />

                <button type='submit' disabled={loading}>{loading ? "Loading" : "Log In"}</button>
              </form>
              <p className='togglePage'>Don't have an account? <button onClick={() => setIsLoginPage(false)}>Sign up</button></p>
            </div>
          ) : (
            <div className="item">
              <h2>Create an account</h2>
              <form onSubmit={handleRegister}>
                <label htmlFor="file">
                  <img src={avatar.url || assets.avatar_icon} alt="" />
                  Upload an image
                </label>
                <input
                  type="file"
                  id="file"
                  style={{ display: 'none' }}
                  onChange={handleAvatar}
                />
                <input
                  type="text"
                  placeholder='Username'
                  name='username'
                  value={registerData.username}
                  onChange={e => handleInputChange(e, setRegisterData)}
                />
                <input
                  type="email"
                  placeholder='Email'
                  name='email'
                  value={registerData.email}
                  onChange={e => handleInputChange(e, setRegisterData)}
                />
                <input
                  type="password"
                  placeholder='Password'
                  name='password'
                  value={registerData.password}
                  onChange={e => handleInputChange(e, setRegisterData)}
                />

                <button type='submit' disabled={loading}>{loading ? "Loading" : "Sign Up"}</button>
              </form>
              <p className='togglePage'>Already have an account? <button onClick={() => setIsLoginPage(true)}>Log In here</button></p>
            </div>
          )}
        </>
      ) : (
        <div className="contentWrapper">
          <div className="item">
            <h2>Welcome back</h2>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder='Email'
                name='email'
                value={loginData.email}
                onChange={e => handleInputChange(e, setLoginData)}
              />
              <input
                type="password"
                placeholder='Password'
                name='password'
                value={loginData.password}
                onChange={e => handleInputChange(e, setLoginData)}
              />

              <button type='submit' disabled={loading}>{loading ? "Loading" : "Sign In"}</button>
            </form>
          </div>
          <div className="separator"></div>
          <div className="item">
            <h2>Create an account</h2>
            <form onSubmit={handleRegister}>
              <label htmlFor="file">
                <img src={avatar.url || assets.avatar_icon} alt="" />
                Upload an image
              </label>
              <input
                type="file"
                id="file"
                style={{ display: 'none' }}
                onChange={handleAvatar}
              />
              <input
                type="text"
                placeholder='Username'
                name='username'
                value={registerData.username}
                onChange={e => handleInputChange(e, setRegisterData)}
              />
              <input
                type="email"
                placeholder='Email'
                name='email'
                value={registerData.email}
                onChange={e => handleInputChange(e, setRegisterData)}
              />
              <input
                type="password"
                placeholder='Password'
                name='password'
                value={registerData.password}
                onChange={e => handleInputChange(e, setRegisterData)}
              />

              <button type='submit' disabled={loading}>{loading ? "Loading" : "Sign Up"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login

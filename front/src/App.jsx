import { AuthWrapper } from './AuthWrapper'
import { RootApp } from './RootApp'
import { useAuth } from './useAuth'

function App() {
  const {isAuthenticated,login,logout, authRequest, register, user} = useAuth()
  return <AuthWrapper isAuthenticated={isAuthenticated} register={register} login={login} logout={logout}>
    <RootApp user={user} authRequest={authRequest}/>
  </AuthWrapper>
}

export default App

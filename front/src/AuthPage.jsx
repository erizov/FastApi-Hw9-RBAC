import { Flex } from "antd"
import { useState } from "react"
import { Login } from "./Login"
import { Register } from "./Register"

export const AuthPage = (props) => {
    const {login, register} = props;
    const [isRegister, setIsRegister] = useState(false)
    return <Flex style={{paddingTop:'60px'}} justify='center'>   
        {isRegister ? <Register register={register} onLogin={()=>setIsRegister(false)} /> : <Login onRegister={()=>setIsRegister(true)} login={login}/>} 
    </Flex>
}   
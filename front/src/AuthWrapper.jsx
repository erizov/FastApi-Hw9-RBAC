import { Button, Layout, Flex } from 'antd';
import { AuthPage } from './AuthPage';

export const AuthWrapper = (props) => {
    const {children, isAuthenticated,login,logout, register} = props;

    return <Layout>
         <Layout.Header style={{display:'flex', alignItems:'center', justifyContent:'flex-end'}}>
               {isAuthenticated && <Button onClick={logout}>Logout</Button>}
        </Layout.Header>
        <Layout.Content>
                {isAuthenticated ? children: <AuthPage register={register} login={login}/>}
        </Layout.Content>
    </Layout>
}
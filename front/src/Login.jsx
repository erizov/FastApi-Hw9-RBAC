
import { Button, Checkbox, Flex, Form, Input } from 'antd';
import Link from 'antd/es/typography/Link';

export const Login = (props) => {
    const {onRegister, login} = props;

    const onFinish = (values) => {
        console.log('Success:', values);
        login(values)
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return   <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
    >
        <Form.Item
        label="Username"
        name="username"
        rules={[{ required: true, message: 'Please input your username!' }]}
        >
        <Input />
        </Form.Item>

        <Form.Item
        label="Password"
        name="password"
        rules={[{ required: true, message: 'Please input your password!' }]}
        >
        <Input.Password />
        </Form.Item>

        <div style={{paddingBottom: '16px'}}>
                Don't have an account? <Link style={{display:'inline'}} onClick={onRegister}>Register</Link>
        </div>

        <Form.Item label={null}>
        <Button type="primary" htmlType="submit">
            Login
        </Button>
        </Form.Item>
    </Form>
}
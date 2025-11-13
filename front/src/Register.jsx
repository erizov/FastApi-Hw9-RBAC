
import { Button, Checkbox, Form, Input } from 'antd';
import Link from 'antd/es/typography/Link';

export const Register = (props) => {
    const {onLogin, register} = props;

    const onFinish = (values) => {
        register(values).then(()=>onLogin())
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
        label="Name"
        name="name"
        rules={[{ required: true, message: 'Please input your name  !' }]}
        >
        <Input />
        </Form.Item>
        <Form.Item
        label="Username"
        name="login"
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

        <Form.Item  valuePropName="checked" label={null}>
                Already have an account? <Link style={{display:'inline'}} onClick={onLogin}>Login</Link>
        </Form.Item>

        <Form.Item label={null}>
        <Button type="primary" htmlType="submit">
            Register
        </Button>
        </Form.Item>
    </Form>
}
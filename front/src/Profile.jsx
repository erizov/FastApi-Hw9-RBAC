import { Button, Flex, Form, Input } from "antd";
import { useEffect, useState } from "react";
import { useRequestItem } from "./useRequestItem";

export const Profile = (props) => {
    const { authRequest, user } = props;
    const isAdmin = user.is_admin;
    const [loading, setLoading] = useState(false)

    const {item,  loadData} = useRequestItem(()=>authRequest(`/auth/users/${user.id}`))

    const save = (data) => {
        setLoading(true)
        authRequest(`/auth/users/${user.id}`, {method:'put', data: {is_admin: user.is_admin,...data}})
        .then(loadData)
        .finally(()=>{
            setLoading(false)
        }) 
    }

    useEffect(()=>{},[]);

    const onFinish = (data) => {
        save({...data, password: data.password ? data.password: null})
    }

    if (!item) {
        return 'Loading...'
    }

    return <Flex style={{padding:'24px'}}>
          <Form
            layout="vertical"
            name="form_in_modal"
            clearOnDestroy
            onFinish={onFinish}
          >
            <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input name' }]}
            initialValue={item?.name ?? ''}
            >
            <Input disabled={!isAdmin}/>
            </Form.Item>
            <Form.Item
            label="Username"
            name="login"
            initialValue={item?.login ?? ''}
            >
            <Input disabled={!isAdmin}/>
            </Form.Item>
            <Form.Item
            label="Password"
            name="password"
            >
            <Input disabled={!isAdmin}/>
            </Form.Item>
            <Form.Item label={null}>
            <Button disabled={!isAdmin} type="primary" htmlType="submit" loading={loading}>
                Save
            </Button>
            </Form.Item>
                        <Form.Item label={null}>
            <Button disabled={!isAdmin} danger>
                Delete
            </Button>
            </Form.Item>
          </Form>
    </Flex>
}
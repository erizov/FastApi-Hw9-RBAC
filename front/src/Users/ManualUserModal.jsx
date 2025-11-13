import { Button, Form, Input, Modal, Switch } from "antd"
import { useState } from "react";
import { ManualButton } from "../ManualButton";

const formatRecord = (data) => {
  return data;
}

export const ManualUserModal = (props) => {
const {type='create', data, authRequest, loadData} = props;
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const createRequest = (record) => authRequest('auth/users/', {method:'post', data: record})
  const editRequest = (record) => authRequest(`auth/users/${data.key}`, {method:'put', data: record})

  const request = (rawRecord) => {
    const record = formatRecord(rawRecord)
    switch (type) {
      case 'Create': return createRequest(record);
      case 'Edit': return editRequest(record);
    }
  } 

  const onSubmit = (rawRecord) => {
    setConfirmLoading(true);
    request(rawRecord).then(()=>{
      loadData()
    }).finally(()=>{
      setOpen(false);
      setConfirmLoading(false);
    })
  };

  return (
    <>
      <ManualButton type={type} onClick={()=>setOpen(true)}/>
      <Modal
        open={open}
        title={`${type} FAQ`}
        okText={type}
        cancelText="Cancel"
        okButtonProps={{ autoFocus: true, htmlType: 'submit' }}
        onCancel={() => setOpen(false)}
        destroyOnHidden
        confirmLoading={confirmLoading}
        modalRender={(dom) => (
          <Form
            layout="vertical"
            form={form}
            name="form_in_modal"
            clearOnDestroy
            onFinish={(values) => onSubmit(values)}
          >
            {dom}
          </Form>
        )}
      >
        <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input name' }]}
            initialValue={data?.name ?? ''}
            >
            <Input />
            </Form.Item>
            <Form.Item
            label="Username"
            name="login"
            initialValue={data?.login ?? ''}
            >
            <Input />
            </Form.Item>
            <Form.Item
            label="Password"
            name="password"
            initialValue={data?.password ?? ''}
            >
            <Input />
            </Form.Item>
            <Form.Item
            label="Is Admin"
            name="is_admin"
            initialValue={data?.is_admin ?? false}
            >
            <Switch />
            </Form.Item>
      </Modal>
    </>
  );
};

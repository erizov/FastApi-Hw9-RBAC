import { Button, Form, Input, Modal } from "antd"
import { useState } from "react";
import { ManualButton } from "../ManualButton";
import { requestFAQ, saveFAQ } from "../requests";
import { addItems, editItem } from "./helpers";

const formatRecord = (data) => {
  return data;
}

export const ManualFAQModal = (props) => {
const {type='create', data,id, authRequest, loadData, items} = props;
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const saveRequest = saveFAQ(authRequest)
  const createRequest = (data) => {
    const newItems = addItems(items, data)
    return saveRequest(newItems)
  }

  const editRequest = (data) => {
    const newItems = editItem(items, {...data, key:id})
    return saveRequest(newItems)
  }
  const askRequest = (record) => authRequest(`base/ask`, {method:'post', data: record})
  .then(result=>{
    const newItem = {answer: result.answer, question: record.query}
    return createRequest(newItem)
  })

  const request = (rawRecord) => {
    const record = formatRecord(rawRecord)
    switch (type) {
      case 'Create': return createRequest(record);
      case 'Edit': return editRequest(record);
      case 'Ask': return askRequest({query: record.question, k: 5})
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
            label="Question"
            name="question"
            rules={[{ required: true, message: 'Please input question' }]}
            initialValue={data?.question ?? ''}
            >
            <Input />
            </Form.Item>
           {type!=='Ask' &&  <Form.Item
            label="Answer"
             rules={[{ required: true, message: 'Please input answer' }]}
            name="answer"
            initialValue={data?.answer ?? ''}
            >
            <Input />
            </Form.Item>
          }
      </Modal>
    </>
  );
};

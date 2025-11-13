import { Button, Form, Input, Modal, Select } from "antd"
import { useState } from "react";
import { ManualButton } from "../ManualButton";
import { requestResume, requestVacancy } from "../requests";
import { useRequestData } from "../useRequestData";

const formatRecord = (data) => {
  return data;
}

const toOptions = (items)=>items.map(item=>({label: item.name, value: Number(item.key)})) 

export const ManualEvaluateModal = (props) => {
const {type='create', data, authRequest, loadData} = props;
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
       const {loading:vacancyLoading, 
      items: vacancyItems} = useRequestData(()=>requestVacancy(authRequest))   
       const {loading:resumeLoading, 
      items: resumeItems} = useRequestData(()=>requestResume(authRequest))   

  const createRequest = (record) => authRequest('evaluate/', {method:'post', data: record})
  const editRequest = (record) => authRequest(`evaluate/${data.key}`, {method:'put', data: record})
  const generateRequest = (record) => authRequest(`evaluate/analyze`, {method:'post', data: record})
  .then(result=>createRequest({...record, result: result.result}))

  const request = (rawRecord) => {
    const record = formatRecord(rawRecord)
    switch (type) {
      case 'Create': return createRequest(record);
      case 'Edit': return editRequest(record);
      case 'Generate': return generateRequest(record)
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
        title={`${type} resume`}
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
            onFinish={onSubmit}
          >
            {dom}
          </Form>
        )}
      >
        <Form.Item
            label="Vacancy"
            name="vacancy_id"
            rules={[{ required: true, message: 'Please select vacancy' }]}
            initialValue={data?.vacancy_id}
            >
            <Select loading={vacancyLoading} options={toOptions(vacancyItems)}/>
            </Form.Item>
            <Form.Item
            label="Resume"
            name="resume_id"
            rules={[{ required: true, message: 'Please select resume' }]}
            initialValue={data?.resume_id}
            >
            <Select loading={resumeLoading} options={toOptions(resumeItems)}/>
            </Form.Item>
            <Form.Item
            label="Result"
            name="result"
            initialValue={data?.result ?? ''}
            >
            <Input />
            </Form.Item>
      </Modal>
    </>
  );
};

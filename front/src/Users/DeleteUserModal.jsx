import { Button, Modal } from "antd"
import { useState } from "react";

export const DeleteUserModal = (props) => {
const { id, authRequest, loadData} = props;
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const onSubmit = () => {
    setConfirmLoading(true);
    authRequest(`auth/users/${id}`, {method:'delete'})
    .then(()=>{
      loadData()
    }).finally(()=>{
      setOpen(false);
      setConfirmLoading(false);
    })
  };


  return (
    <>
      <Button type="text" danger onClick={()=>setOpen(true)}>
        Delete
      </Button>
      <Modal
        title="Deletion"
        open={open}
        onOk={onSubmit}
        okText='Yes'
        confirmLoading={confirmLoading}
        onCancel={()=>setOpen(false)}
      >
        <p>Are you sure you want to delete this record?</p>
      </Modal>
    </>
  );
};

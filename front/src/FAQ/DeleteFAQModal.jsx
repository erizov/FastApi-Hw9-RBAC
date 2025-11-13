
import { Button, Modal } from "antd"
import { useState } from "react";
import { saveFAQ } from "../requests";
import { deleteItem } from "./helpers";

export const DeleteFAQModal = (props) => {
const { id, authRequest, loadData, items} = props;
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const saveRequest = saveFAQ(authRequest)
  const onSubmit = () => {
    setConfirmLoading(true);
     saveRequest(deleteItem(items, id))
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

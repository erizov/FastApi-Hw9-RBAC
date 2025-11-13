import {  Flex,  Space, Table } from "antd"
import { ManualFAQModal } from "./ManualFAQModal";
import { DeleteFAQModal } from "./DeleteFAQModal";
import { requestFAQ } from "../requests";
import { useRequestData } from "../useRequestData";

export const FAQ = (props) => {
  const {authRequest} = props;
  const {loading, loadData, items} = useRequestData(
    ()=>requestFAQ(authRequest)
  )

const columns = [
  {
    title: 'Question',
    dataIndex: 'question',
    key: 'question',
  },
  {
    title: 'Answer',
    dataIndex: 'answer',
    key: 'answer',
  },
{
    title: 'Action',
    key: 'action',
    render: (_, record) => (
      <Space size="middle">
        <ManualFAQModal id={record.key} items={items} type='Edit' data={record} authRequest={authRequest} loadData={loadData}/>
        <DeleteFAQModal items={items} id={record.key} loadData={loadData} authRequest={authRequest}/>
      </Space>
    ),
  },
];


    return <Flex vertical gap={16}>
            <Flex justify="flex-end" align="center">
                <Flex gap={8} align="center" style={{paddingRight:'16px'}}>
                     <ManualFAQModal items={items} type='Ask' authRequest={authRequest} loadData={loadData}/>
                      <ManualFAQModal items={items} type='Create' authRequest={authRequest} loadData={loadData}/>
                </Flex>
            </Flex>
            <Table loading={loading} pagination={false} columns={columns} dataSource={items}/>
    </Flex>
}
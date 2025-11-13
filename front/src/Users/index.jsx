import {  Flex,  Space, Table } from "antd"
import { ManualUserModal } from "./ManualUserModal";
import { DeleteUserModal } from "./DeleteUserModal";
import { requestUsers } from "../requests";
import { useRequestData } from "../useRequestData";

export const Users = (props) => {
  const {authRequest} = props;
  const {loading, loadData, items} = useRequestData(
    ()=>requestUsers(authRequest)
  )

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Username',
    dataIndex: 'login',
    key: 'login',
  },
{
    title: 'Action',
    key: 'action',
    render: (_, record) => (
      <Space size="middle">
        <ManualUserModal type='Edit' data={record} authRequest={authRequest} loadData={loadData}/>
        <DeleteUserModal id={record.key} loadData={loadData} authRequest={authRequest}/>
      </Space>
    ),
  },
];

    return <Flex vertical gap={16}>
            <Flex justify="flex-end" align="center">
                <Flex gap={8} align="center" style={{paddingRight:'16px'}}>
                    <ManualUserModal type='Create' authRequest={authRequest} loadData={loadData}/>
                </Flex>
            </Flex>
            <Table loading={loading} pagination={false} columns={columns} dataSource={items}/>
    </Flex>
}
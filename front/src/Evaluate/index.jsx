import {  Flex,  Space, Table } from "antd"
import { ManualEvaluateModal } from "./ManualEvaluateModal";
import { DeleteEvaluateModal } from "./DeleteEvaluateModal";
import { useRequest } from "./useRequest";

export const Evaluate = (props) => {
  const {authRequest} = props;
  const {loading, loadData, items} = useRequest(authRequest)

const columns = [
  {
    title: 'Resume',
    dataIndex: 'resumeName',
    key: 'resumeName',
  },
  {
    title: 'Vacancy',
    dataIndex: 'vacancyName',
    key: 'vacancyName',
  },
  {
    title: 'Result',
    dataIndex: 'result',
    key: 'result',
  },
{
    title: 'Action',
    key: 'action',
    render: (_, record) => (
      <Space size="middle">
        <ManualEvaluateModal type='Edit' data={record} authRequest={authRequest} loadData={loadData}/>
        <DeleteEvaluateModal id={record.key} loadData={loadData} authRequest={authRequest}/>
      </Space>
    ),
  },
];


    return <Flex vertical gap={16}>
            <Flex justify="flex-end" align="center">
                <Flex gap={8} align="center" style={{paddingRight:'16px'}}>
                     <ManualEvaluateModal type='Generate' authRequest={authRequest} loadData={loadData}/>
                      <ManualEvaluateModal type='Create' authRequest={authRequest} loadData={loadData}/>
                </Flex>
            </Flex>
            <Table loading={loading} pagination={false} columns={columns} dataSource={items}/>
    </Flex>
}